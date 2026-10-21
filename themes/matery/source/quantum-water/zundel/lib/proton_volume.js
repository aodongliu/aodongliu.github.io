// Proton probability density as an emissive volume with embedded 50/90/99 % isosurfaces:
// a box proxy around one proton, ray-marched through the GPU-resampled field (proton_field.js).
import * as THREE from 'three';
import { log8, intersect, protonTF, protonCloudTF } from './glsl.js';
import { ProtonField, fieldGLSL, fieldUniforms } from './proton_field.js';


export class ProtonVolume {
  constructor(renderer, vol, { centers = null, isos, cullRadius = 0.6, step = 0.02, gain = 3.0, absorb = 1.2,
    shellAlpha = [0.30, 0.22, 0.16], oxygenRadius = 0.5, upsample = 2, tf = 'contours', cloud = {}, solid = {}, cubic = true } = {}) {
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
    if (tf === 'solid') { this._initSolid(solid, cullRadius, step); return; }
    const cloudMode = tf === 'cloud';
    // Optional cloud extras (proto_HE movie round 3; off = shader identical to the hero's):
    //  cloud.shell = { iso (au), alpha, normalSpan }: thin translucent rim-lit glass shell at a LOW absolute
    //    density (the tail), exact crossing between samples, so outline breathing / tail lobes read in the cloud;
    //  cloud.delta = { lo, hi, warm, cool }: tint the cloud by rho(t) - rho(frame 0) with a FIXED ramp
    //    smoothstep(lo, hi, |d|) (au); frame 0 is resampled once through the same tricubic filter as the
    //    current field, so d is exactly 0 at t = 0.
    const shellOn = cloudMode && !!cloud.shell, deltaOn = cloudMode && !!cloud.delta;
    if (shellOn) {
      const e = vol.meta.encoding, sh = cloud.shell;
      Object.assign(this.uniforms, { uShellCode: { value: Math.log1p(e.scale * (sh.iso ?? 1e-3) / e.peak) / Math.log1p(e.scale) },
        uShellA: { value: sh.alpha ?? 0.22 }, uShellND: { value: sh.normalSpan ?? 2.5 } });
    }
    // cloud.blend = { tail: [lo, hi, fadeHi, gain] (au), logFloor: [lo, hi] (au) | null } (round 4, 'blend core into
    //   shell'): an extra faint emissive band in the halo colour that rises from `lo` to `hi` and fades out by `fadeHi`
    //   (log-density smoothsteps, absolute), and/or the cloud's own soft floor moved from the linear 0.02-0.1 au to
    //   a log-space floor, so emission continues down to the shell instead of stopping at 0.02 au.
    //   cloud.shell.rim scales the shell's fresnel brightening (was fixed 1.1).
    // cloud.vapour (round 5, 'one continuous cloud'): emission-ABSORPTION in log density, no shell.
    //   x = clamp((log10 rho - log10 floor) / (log10 peak - log10 floor), 0, 1) (absolute, same for every frame/proton)
    //   sigma = s1 * smoothstep(0, xs, x) + s2 * x^p   (per Bohr: s1 = thin vapour plateau carrying the tail, s2 x^p = core)
    //   colour = mix(tail, core, smoothstep(c0, c1, x)) * (amb + lit * exp(-shadow * column)), capped at `cap`
    //   accumulated as col += T c (1 - e^{-sigma ds}), so the ray radiance can never exceed the colour cap:
    //   the core rolls off instead of clipping to white (bloom carries the glow).
    const vapourOn = cloudMode && !!cloud.vapour && !deltaOn;
    if (vapourOn) {
      const v = cloud.vapour, lf = Math.log10(v.floor ?? 3e-4), lp = Math.log10(v.peak ?? 5.0);
      Object.assign(this.uniforms, {
        uVX: { value: new THREE.Vector4(lf, 1 / (lp - lf), v.xs ?? 0.3, 0) },
        uVS: { value: new THREE.Vector3(v.s1 ?? 1.5, v.sigma ?? 6, v.p ?? 4.0) },
        uVC: { value: new THREE.Vector4(v.c0 ?? 0.35, v.c1 ?? 0.9, v.amb ?? 0.55, v.lit ?? 0.6) },
        uVCap: { value: v.cap ?? 0.8 },
        uVTail: { value: new THREE.Color(...(v.tail ?? [0.55, 0.65, 0.80]).map(c => c * (v.tailGain ?? 0.6))) },
        uVCore: { value: new THREE.Color(...(v.core ?? [1.0, 0.95, 0.86]).map(c => c * (v.coreGain ?? 0.8))) },
        uGateV: { value: v.floor ?? 3e-4 } });
    }
    // cloud.bell (round 6, 'coherent cloud'): ONE smooth monotonic transfer function of log density, no plateaus,
    //   thresholds or separate terms:  u = clamp(ln(rho/floor) / ln(peak/floor), 0, 1)   (absolute)
    //   sigma = k u^p (per Bohr; p > 1 -> zero value AND slope at the floor, so the cloud fades out before the data's
    //   8-bit floor), colour = mix(tail, core, smoothstep(0, 1, u)) * (amb + lit * fixed-light shadow),
    //   emission-absorption, then a soft tone curve on the ray result  col -> cmax (1 - exp(-col / cmax))  (no clamp).
    const bellOn = cloudMode && !!cloud.bell && !deltaOn;
    if (bellOn) {
      const b = cloud.bell, fl = b.floor ?? 4e-4, pk = b.peak ?? 5.0;
      Object.assign(this.uniforms, {
        uBU: { value: new THREE.Vector2(Math.log(fl), 1 / Math.log(pk / fl)) }, uBS: { value: new THREE.Vector2(b.k ?? 3.0, b.p ?? 2.0) },
        uBL: { value: new THREE.Vector3(b.amb ?? 1.0, b.lit ?? 0.0, b.cmax ?? 0.8) }, uBFloor: { value: fl },
        uBTail: { value: new THREE.Color(...(b.tail ?? [0.42, 0.50, 0.64])) }, uBCore: { value: new THREE.Color(...(b.core ?? [1.0, 0.95, 0.86])) },
        // round 7: optional separate EMISSION curve ke u^pe (pe < p: tail-weighted light, core-weighted absorption) and a
        // colour-ramp exponent q (mix weight smoothstep(0,1,u^q); q > 1 keeps the tail colour further in). Still one
        // smooth curve each; ke < 0 = emission tied to absorption (rounds 6 behaviour).
        uBE: { value: new THREE.Vector3(b.ke ?? -1, b.pe ?? 1, b.q ?? 1) },
        // optional Hill shaping (h > 0): f(u) = u^p / (u^p + h^p), renormalised to f(1) = 1. Zero value and slope at the
        // floor (p > 1, smooth fade) but saturating toward the core: moves weight outward without an edge.
        uBH: { value: b.h ?? 0 },
        // optional smooth foot (u1 > 0): shape *= 1 - exp(-(u/u1)^2) -> behaves like u^(p+2) at the floor (clean fade to
        // zero) and like u^p above u1, so p < 1 can flatten the curve without steepening the outer edge.
        uBFoot: { value: b.foot ?? 0 } });
    }
    const blendOn = cloudMode && !!cloud.blend && !deltaOn && !vapourOn && !bellOn;
    if (shellOn) this.uniforms.uShellRim = { value: cloud.shell.rim ?? 1.1 };
    if (blendOn) {
      const b = cloud.blend, tl = b.tail || [1e-3, 1e-2, 0.1, 0], lf = b.logFloor;
      Object.assign(this.uniforms, { uTail: { value: new THREE.Vector4(Math.log(tl[0]), Math.log(tl[1]), Math.log(tl[2]), tl[3]) },
        uLogFloor: { value: new THREE.Vector3(...(lf ? [Math.log(lf[0]), Math.log(lf[1]), 1] : [0, 0, 0])) },
        uGate: { value: Math.min(tl[3] > 0 ? tl[0] : 1, lf ? lf[0] : 0.02, 0.02) } });
    }
    if (deltaOn) {
      const n = vol.nframes ?? vol.meta.nframes;
      const refVol = { meta: vol.meta, voxels: vol.voxels, nframes: n, loaded: n, frame: () => vol.frame(0) };
      this.ref = new ProtonField(renderer, refVol, { upsample, cubic, shadow: null });
      this.gpuBytes += this.ref.gpuBytes; this.refReady = false;
      const dl = cloud.delta;
      Object.assign(this.uniforms, { uRefTex: { value: this.ref.texture }, uDRamp: { value: new THREE.Vector2(dl.lo ?? 0.1, dl.hi ?? 0.8) },
        uWarm: { value: new THREE.Color(...(dl.warm ?? [1.0, 0.72, 0.18])) }, uDGain: { value: dl.gain ?? 0.5 }, uCool: { value: new THREE.Color(...(dl.cool ?? [0.15, 0.95, 0.85])) } });
    }
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
        ${shellOn ? `uniform float uShellCode, uShellA, uShellND, uShellRim;
        void glassShell(inout vec3 col, inout float T, vec3 p, vec3 V, vec3 L) {
          vec3 d = uShellND * (uPHi - uPLo) / uPSize;
          vec3 n = safeNormalize(-vec3(uPCode(p + vec3(d.x,0,0)) - uPCode(p - vec3(d.x,0,0)),
                                       uPCode(p + vec3(0,d.y,0)) - uPCode(p - vec3(0,d.y,0)),
                                       uPCode(p + vec3(0,0,d.z)) - uPCode(p - vec3(0,0,d.z))));
          if (dot(n, V) < 0.0) n = -n;
          float fres = pow(1.0 - abs(dot(n, V)), 2.5);
          float al = uShellA * (0.15 + 0.85 * fres);
          vec3 c = uHaloCol * (0.35 + 0.75 * max(dot(n, L), 0.0)) * (0.5 + uShellRim * fres) + vec3(0.7) * pow(max(dot(n, normalize(L + V)), 0.0), 60.0);
          col += T * c * al; T *= 1.0 - al;
        }` : ''}
        ${bellOn ? `uniform vec2 uBU, uBS; uniform vec3 uBL, uBTail, uBCore, uBE; uniform float uBFloor, uBH, uBFoot;
        float bShape(float u, float p) {
          float ft = uBFoot > 0.0 ? 1.0 - exp(-(u / uBFoot) * (u / uBFoot)) : 1.0;
          if (uBH <= 0.0) return pow(u, p) * ft; float hp = pow(uBH, p), up = pow(u, p); return up / (up + hp) * (1.0 + hp) * ft; }
        void bellStep(inout vec3 col, inout float T, float rho, float sc, float ds) {
          float u = clamp((log(rho) - uBU.x) * uBU.y, 0.0, 1.0);
          float sig = uBS.x * bShape(u, uBS.y);
          float w = pow(u, uBE.z); w = w * w * (3.0 - 2.0 * w);
          vec3 c = mix(uBTail, uBCore, w) * (uBL.x + uBL.y * exp(-uShadow * sc));
          float a = 1.0 - exp(-sig * ds);
          col += T * c * (uBE.x < 0.0 ? a : uBE.x * bShape(u, uBE.y) * ds); T *= 1.0 - a;
        }` : ''}
        ${vapourOn ? `uniform vec4 uVX, uVC; uniform vec3 uVS; uniform float uVCap, uGateV; uniform vec3 uVTail, uVCore;
        void vapourStep(inout vec3 col, inout float T, float rho, float sc, float ds) {
          float x = clamp((log(rho) * 0.4342944819 - uVX.x) * uVX.y, 0.0, 1.0);
          float sig = uVS.x * smoothstep(0.0, uVX.z, x) + uVS.y * pow(x, uVS.z);
          vec3 c = mix(uVTail, uVCore, smoothstep(uVC.x, uVC.y, x)) * (uVC.z + uVC.w * exp(-uShadow * sc));
          c = min(c, vec3(uVCap));
          float a = 1.0 - exp(-sig * ds);
          col += T * c * a; T *= 1.0 - a;
        }` : ''}
        ${blendOn ? `uniform vec4 uTail; uniform vec3 uLogFloor; uniform float uGate;
        void cloudStepBlend(inout vec3 col, inout float T, float rho, float ln, float sc, float ds) {
          float u = rho / uRho50;
          float fl = uLogFloor.z > 0.5 ? smoothstep(uLogFloor.x, uLogFloor.y, ln) : smoothstep(0.02, 0.1, rho);
          float k = pow(u, uGamma) * fl, core = smoothstep(0.4, 3.0, u), Li = exp(-uShadow * sc);
          float tb = uTail.w * smoothstep(uTail.x, uTail.y, ln) * (1.0 - smoothstep(uTail.y, uTail.z, ln));
          vec3 halo = uHaloCol * (0.10 + Li) * uLitAmt;
          col += T * ((uCoreCol * core * uProtonGain + halo) * k + halo * tb) * ds;
          T *= exp(-uProtonAbsorb * (k + 0.25 * tb) * ds);
        }` : ''}
        ${deltaOn ? `uniform sampler3D uRefTex; uniform vec2 uDRamp; uniform vec3 uWarm, uCool; uniform float uDGain;` : ''}
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
          ${shellOn ? `float cPrev = uPCode(ro + rd * (t.x + uStep * jitter));` : ''}
          for (float s = t.x + uStep * jitter; s < t.y; s += uStep) {
            vec3 p = ro + rd * s;
            ${shellOn ? `float cq = uPCode(p), rho = decodeLog8(cq, uEnc), ln = log(rho + 1e-5);
            if ((cPrev - uShellCode) * (cq - uShellCode) < 0.0) glassShell(col, T, p - rd * uStep * (cq - uShellCode) / (cq - cPrev), V, uKeyDir);
            cPrev = cq;` : `float rho = decodeLog8(uPCode(p), uEnc), ln = log(rho + 1e-5);`}
            ${cloudMode ? `
            if (uContour > 0.0 && rho > 0.2 && (lnPrev - uIsoLn.y) * (ln - uIsoLn.y) < 0.0) cloudContour(col, T, lnPrev, ln, uPNormal(p), V, uKeyDir);
            if (rho > ${bellOn ? 'uBFloor' : vapourOn ? 'uGateV' : blendOn ? 'uGate' : '0.02'}) {
              ${precomputed ? `float sc = dot(texture(uPShadow, (p - uPLo) / (uPHi - uPLo)), uPW);   // precomputed, light fixed to molecule`
                            : `float sc = 0.0; for (int j = 0; j < 3; j++) sc += kAt(p + uKeyDir * (0.05 + 0.12 * float(j))); sc *= 0.12;`}
              ${deltaOn ? `float dr = rho - decodeLog8(texture(uRefTex, (p - uPLo) / (uPHi - uPLo)).r, uEnc);
              cloudStepTint(col, T, rho, sc, uStep, dr > 0.0 ? uWarm : uCool, smoothstep(uDRamp.x, uDRamp.y, abs(dr)), uDGain);`
                        : bellOn ? `bellStep(col, T, rho, sc, uStep);`
                        : vapourOn ? `vapourStep(col, T, rho, sc, uStep);`
                        : blendOn ? `cloudStepBlend(col, T, rho, ln, sc, uStep);` : `cloudStep(col, T, rho, sc, uStep);`}
            }
            lnPrev = ln;` : `
            if (protonCrosses(lnPrev, ln)) protonShells(col, T, lnPrev, ln, uPNormal(p), V, uKeyDir);
            lnPrev = ln;
            if (rho > 0.003) protonEmit(col, T, rho, uStep);`}
            if (T < 0.004) break;
          }
          float a = 1.0 - T;
          ${bellOn ? `col = uBL.z * (1.0 - exp(-col / uBL.z));   // soft shoulder, never a clamp` : ''}
          if (a < 1e-4 && dot(col, col) < 1e-8) discard;
          if (any(isnan(col)) || isnan(a) || any(isinf(col))) discard;   // one NaN pixel would smear through bloom
          fragColor = vec4(col, a);
        }`,
    });
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false;
    if (cloudMode && cloud.distPass) {
      // per-pixel depth for compositing with another volume (proto_HE electron march): distance to the first
      // sample at or above the cloud's visible floor (the shell iso if any, else 0.02 au), MIN-blended over
      // protons. Replaces the centroid box proxy, whose rectangles showed as box-shaped veiling patches.
      const e = vol.meta.encoding, floorRho = shellOn ? (cloud.shell.iso ?? 1e-3) : (vapourOn || bellOn) ? (cloud.distIso ?? 1e-3) : 0.02;
      this.uniforms.uDistCode = { value: Math.log1p(e.scale * floorRho / e.peak) / Math.log1p(e.scale) };
      const dmat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: this.uniforms, side: THREE.BackSide,
        depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.MinEquation,
        blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
        vertexShader: mat.vertexShader,
        fragmentShader: /* glsl */`
          precision highp float; precision highp sampler3D;
          uniform highp mat4 modelMatrix;
          uniform vec3 uO, uC; uniform float uStep, uORadius, uCR, uDistCode;
          in vec3 vLocal; in vec3 vCam; out vec4 fragColor;
          ${intersect}${fieldGLSL('uP')}
          void main() {
            vec3 ro = vCam, rd = normalize(vLocal - vCam);
            vec2 t = hitBox(ro, rd, uPLo, uPHi);
            vec3 oc = ro - uC; float bb = dot(oc, rd), hh = bb * bb - dot(oc, oc) + uCR * uCR;
            if (hh < 0.0) discard;
            t = vec2(max(t.x, -bb - sqrt(hh)), min(t.y, -bb + sqrt(hh)));
            t.y = min(t.y, hitSphere(ro, rd, uO, uORadius));
            if (t.y <= t.x) discard;
            float hit = -1.0;
            for (float s = t.x; s < t.y; s += uStep) if (uPCode(ro + rd * s) >= uDistCode) { hit = s; break; }
            if (hit < 0.0) discard;
            fragColor = vec4(distance(cameraPosition, (modelMatrix * vec4(ro + rd * hit, 1.0)).xyz), 0.0, 0.0, 1.0);
          }` });
      this.distMesh = new THREE.Mesh(g, dmat); this.distMesh.frustumCulled = false;
    }
  }
  // tf: 'solid' (proto_HE movie, ChimeraX 'volume style surface' + 'lighting simple' look): ONE opaque
  // isosurface rho = solid.iso (absolute, au), first crossing along the ray in log-code space, refined by
  // bisection; normal = -grad(code) of the resampled field; Lambert + Blinn specular with the key light
  // (fixed in the camera frame); writes TRUE depth (gl_FragDepth). this.distMesh renders the same surface
  // as |camera - hit| (world units, MIN blending) for the electron march's proton-layer compositing.
  _initSolid({ iso = 2e-3, color = [0.79, 0.79, 0.80], ambient = 0.32, diffuse = 0.78, spec = 0.30, shininess = 40, bisect = 7, normalSpan = 1.5 } = {}, cullRadius, step) {
    const f = this.field, e = this.vol.meta.encoding;
    const isoCode = Math.log1p(e.scale * iso / e.peak) / Math.log1p(e.scale);   // compare codes: no exp per step
    this.uniforms = {
      ...fieldUniforms('uP', f), uStep: { value: step }, uC: { value: f.lo.clone().add(f.hi).multiplyScalar(0.5) }, uCR: { value: cullRadius },
      uO: { value: new THREE.Vector3() }, uKeyDir: { value: new THREE.Vector3(0, 1, 1).normalize() },
      uIsoCode: { value: isoCode }, uCol: { value: new THREE.Color(...color) },
      uShade: { value: new THREE.Vector4(ambient, diffuse, spec, shininess) }, uND: { value: normalSpan },
    };
    const size = f.hi.clone().sub(f.lo), center = f.lo.clone().add(f.hi).multiplyScalar(0.5);
    const g = new THREE.BoxGeometry(size.x, size.y, size.z); g.translate(center.x, center.y, center.z);
    const vs = /* glsl */`
      out vec3 vLocal; out vec3 vCam;
      void main() {
        vLocal = position; vCam = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`;
    const fs = dist => /* glsl */`
      precision highp float; precision highp sampler3D;
      uniform highp mat4 modelMatrix, projectionMatrix;   // three binds these by name (vertex built-ins)
      uniform vec3 uKeyDir, uC, uCol; uniform vec4 uShade; uniform float uStep, uCR, uIsoCode, uND;
      in vec3 vLocal; in vec3 vCam; out vec4 fragColor;
      ${intersect}${fieldGLSL('uP')}
      void main() {
        vec3 ro = vCam, rd = normalize(vLocal - vCam), V = -rd;
        vec2 t = hitBox(ro, rd, uPLo, uPHi);
        vec3 oc = ro - uC; float bb = dot(oc, rd), hh = bb * bb - dot(oc, oc) + uCR * uCR;
        if (hh < 0.0) discard;
        t = vec2(max(t.x, -bb - sqrt(hh)), min(t.y, -bb + sqrt(hh)));
        if (t.y <= t.x) discard;
        // fixed (unjittered) march: identical sampling every frame, so only the data changes the surface
        float s0 = t.x, s1 = -1.0;
        for (float s = t.x; s <= t.y + 0.5 * uStep; s += uStep) {
          float ss = min(s, t.y);
          if (uPCode(ro + rd * ss) >= uIsoCode) { s1 = ss; break; }
          s0 = ss;
        }
        if (s1 < 0.0) discard;
        for (int k = 0; k < ${bisect}; k++) { float sm = 0.5 * (s0 + s1); if (uPCode(ro + rd * sm) >= uIsoCode) s1 = sm; else s0 = sm; }
        vec3 p = ro + rd * s1;
        vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
        vec4 clip = projectionMatrix * viewMatrix * vec4(wp, 1.0);
        gl_FragDepth = clamp(0.5 * clip.z / clip.w + 0.5, 0.0, 1.0);
        ${dist ? `fragColor = vec4(distance(cameraPosition, wp), 0.0, 0.0, 1.0);` : `
        // gradient over +-uND texels: wider than 1 texel so the 8-bit level terraces do not ripple the shading
        vec3 d = uND * (uPHi - uPLo) / uPSize;
        vec3 n = safeNormalize(-vec3(uPCode(p + vec3(d.x,0,0)) - uPCode(p - vec3(d.x,0,0)),
                                     uPCode(p + vec3(0,d.y,0)) - uPCode(p - vec3(0,d.y,0)),
                                     uPCode(p + vec3(0,0,d.z)) - uPCode(p - vec3(0,0,d.z))));
        if (dot(n, V) < 0.0) n = -n;
        vec3 L = normalize(uKeyDir), H = normalize(L + V);
        vec3 c = uCol * (uShade.x + uShade.y * max(dot(n, L), 0.0)) + vec3(uShade.z * pow(max(dot(n, H), 0.0), uShade.w));
        fragColor = vec4(c, 1.0);`}
      }`;
    const mat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: this.uniforms, side: THREE.BackSide,
      depthTest: true, depthWrite: true, transparent: false, vertexShader: vs, fragmentShader: fs(false) });
    const dmat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, uniforms: this.uniforms, side: THREE.BackSide,
      depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.MinEquation,
      blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, vertexShader: vs, fragmentShader: fs(true) });
    this.mesh = new THREE.Mesh(g, mat); this.mesh.frustumCulled = false;
    this.distMesh = new THREE.Mesh(g, dmat); this.distMesh.frustumCulled = false;
    this.solid = true; this.isoCode = isoCode;
  }
  update(frame, oxygenLocal, keyDirWorld) {
    if (this.ref && !this.refReady) { this.ref.update(0); this.refReady = true; }
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
