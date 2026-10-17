// Proton probability density as an emissive volume with embedded 50/90/99 % isosurfaces:
// a box proxy around one proton, ray-marched through the GPU-resampled field (proton_field.js).
import * as THREE from 'three';
import { log8, intersect, protonTF, protonCloudTF } from './glsl.js';
import { ProtonField, fieldGLSL, fieldUniforms } from './proton_field.js';


export class ProtonVolume {
  constructor(renderer, vol, { centers = null, isos, cullRadius = 0.6, step = 0.02, gain = 3.0, absorb = 1.2,
    shellAlpha = [0.30, 0.22, 0.16], oxygenRadius = 0.5, upsample = 2, tf = 'contours', cloud = {}, cubic = true } = {}) {
    const fixedLight = tf === 'cloud' && cloud.fixedLight !== false && !cloud.direct;
    this.field = new ProtonField(renderer, vol, { upsample, cubic, shadow: fixedLight ? { rho50: isos[0], gamma: cloud.gamma ?? 0.75 } : null, direct: !!cloud.direct });
    this.fixedLight = fixedLight; this.lightSet = false;
    this.vol = vol; this.centers = centers; this._inv = new THREE.Matrix4();
    const f = this.field;
    this.gpuBytes = f.gpuBytes;
    this.uniforms = {
      ...fieldUniforms('uP', f), uEnc: { value: f.enc }, uPShadow: { value: f.shadowTexture || null },
      uStep: { value: step }, uC: { value: f.lo.clone().add(f.hi).multiplyScalar(0.5) }, uCR: { value: cullRadius },
      uO: { value: new THREE.Vector3() }, uORadius: { value: oxygenRadius },
      uKeyDir: { value: new THREE.Vector3(0, 1, 1).normalize() },
      uIsoLn: { value: new THREE.Vector3(...isos.map(Math.log)) }, uIsoAlpha: { value: new THREE.Vector3(...shellAlpha) },
      uRho50: { value: isos[0] }, uProtonGain: { value: gain }, uProtonAbsorb: { value: absorb },
      uGamma: { value: cloud.gamma ?? 0.75 }, uLitAmt: { value: cloud.lit ?? 1.0 }, uContour: { value: cloud.contour ?? 0 }, uShadow: { value: cloud.shadow ?? 1.5 },
      uHaloCol: { value: new THREE.Color(...(cloud.halo ?? [0.62, 0.68, 0.78])) }, uCoreCol: { value: new THREE.Color(...(cloud.core ?? [1.0, 0.98, 0.95])) },
    };
    const cloudMode = tf === 'cloud';
    const precomputed = fixedLight;
    const size = f.hi.clone().sub(f.lo), center = f.lo.clone().add(f.hi).multiplyScalar(0.5);
    const g = new THREE.BoxGeometry(size.x, size.y, size.z); g.translate(center.x, center.y, center.z);
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: this.uniforms, side: THREE.BackSide, transparent: true,
      depthWrite: false, depthTest: false, blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */`
        out vec3 vLocal; out vec3 vCam;
        void main() {
          vLocal = position; vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */`
        precision highp float; precision highp sampler3D;
        uniform vec3 uEnc, uO, uKeyDir, uC; uniform float uStep, uORadius, uCR; uniform sampler3D uPShadow;
        in vec3 vLocal; in vec3 vCam; out vec4 fragColor;
        ${log8}${intersect}${cloudMode ? protonCloudTF : protonTF}${fieldGLSL('uP')}
        ${cloudMode ? `float kAt(vec3 q) { return pow(decodeLog8(uPCode(q), uEnc) / uRho50 + 1e-6, uGamma); }` : ''}
        void main() {
          vec3 ro = vCam, rd = normalize(vLocal - vCam), V = -rd;
          vec2 t = hitBox(ro, rd, uPLo, uPHi);
          // empty-space skip: density is below the display floor beyond uCR of the centroid
          vec3 oc = ro - uC; float bb = dot(oc, rd), hh = bb * bb - dot(oc, oc) + uCR * uCR;
          if (hh < 0.0) discard;
          t = vec2(max(t.x, -bb - sqrt(hh)), min(t.y, -bb + sqrt(hh)));
          t.y = min(t.y, hitSphere(ro, rd, uO, uORadius));
          if (t.y <= t.x) discard;
          float jitter = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
          vec3 col = vec3(0.0); float T = 1.0, lnPrev = log(1e-5);
          for (float s = t.x + uStep * jitter; s < t.y; s += uStep) {
            vec3 p = ro + rd * s;
            float rho = decodeLog8(uPCode(p), uEnc), ln = log(rho + 1e-5);
            ${cloudMode ? `
            if (uContour > 0.0 && rho > 0.2 && (lnPrev - uIsoLn.y) * (ln - uIsoLn.y) < 0.0) cloudContour(col, T, lnPrev, ln, uPNormal(p), V, uKeyDir);
            if (rho > 0.02) {
              ${precomputed ? `float sc = dot(texture(uPShadow, (p - uPLo) / (uPHi - uPLo)), uPW);   // precomputed, light fixed to molecule`
                            : `float sc = 0.0; for (int j = 0; j < 3; j++) sc += kAt(p + uKeyDir * (0.05 + 0.12 * float(j))); sc *= 0.12;`}
              cloudStep(col, T, rho, sc, uStep);
            }
            lnPrev = ln;` : `
            if (protonCrosses(lnPrev, ln)) protonShells(col, T, lnPrev, ln, uPNormal(p), V, uKeyDir);
            lnPrev = ln;
            if (rho > 0.003) protonEmit(col, T, rho, uStep);`}
            if (T < 0.004) break;
          }
          float a = 1.0 - T;
          if (a < 1e-4 && dot(col, col) < 1e-8) discard;
          if (any(isnan(col)) || isnan(a) || any(isinf(col))) discard;   // one NaN pixel would smear through bloom
          fragColor = vec4(col, a);
        }`,
    });
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false;
  }
  update(frame, oxygenLocal, keyDirWorld) {
    if (this.fixedLight && !this.lightSet && keyDirWorld && keyDirWorld.lengthSq() > 0) {
      // freeze the key light (as it is at start-up) in the molecule frame
      this.mesh.updateMatrixWorld(true);
      const d = keyDirWorld.clone().transformDirection(this._inv.copy(this.mesh.matrixWorld).invert());
      this.field.setLight(d); this.lightSet = true; this.lightLocal = d;
    }
    this.field.update(frame);
    if (this.centers) {     // cull-sphere centre follows the density centroid, same time weights
      const w = this.field.wv, c = this.field.idx.map(k => this.centers[k]);
      this.uniforms.uC.value.set(...[0, 1, 2].map(j => w.x * c[0][j] + w.y * c[1][j] + w.z * c[2][j] + w.w * c[3][j]));
    }
    this.uniforms.uO.value.set(...oxygenLocal);
    // the march runs in the volume's local (source) frame: bring the world key direction there
    if (this.lightLocal) this.uniforms.uKeyDir.value.copy(this.lightLocal);
    else if (keyDirWorld) this.uniforms.uKeyDir.value.copy(keyDirWorld).transformDirection(this._inv.copy(this.mesh.matrixWorld).invert());
  }
}
