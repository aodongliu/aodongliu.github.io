// Fixed-topology ("star") isosurface: one icosphere direction per vertex, per-frame radius +
// normal stored in an RGBA8 texture; the vertex shader blends two stored frames, so playback is
// continuous at any display rate with no CPU work and no topology popping.
import * as THREE from 'three';
import { icosphere } from './icosphere.js';
import { octDecode } from './glsl.js';
import { bracket } from './data.js';

const TEX_W = 2048;
const icoCache = new Map(), texCache = new WeakMap();

export const SurfaceStyles = {
  // Glassy electron envelope: nearly clear face-on, bright fresnel rim, sharp key highlight.
  glass: { color: [0.32, 0.55, 0.85], rim: [0.50, 0.74, 1.0], base: 0.015, rimGain: 0.55, rimPow: 3.0, spec: 0.7, shin: 120, alpha: 0.02, rimAlpha: 0.28, additive: false },
  // Proton shell for nested isosurfaces: additive white/grey glow.
  glow: { color: [0.80, 0.84, 0.90], rim: [1.0, 1.0, 1.0], base: 0.20, rimGain: 0.8, rimPow: 1.6, spec: 0.5, shin: 40, alpha: 1, rimAlpha: 1, additive: true },
};

export class StarSurface {
  constructor(surf, { style = 'glass', side = THREE.FrontSide, gain = 1, tint = null, center = null } = {}) {
    const { meta, rgba, nv, keys, centers } = surf;
    this.keys = keys; this.centers = centers; this.fixedCenter = center || meta.center_bohr;
    if (!icoCache.has(meta.ico_level)) icoCache.set(meta.ico_level, icosphere(meta.ico_level));
    const ico = icoCache.get(meta.ico_level);
    const rowsPerFrame = Math.ceil(nv / TEX_W);
    // one data texture per surface dataset, shared by e.g. the front- and back-face meshes
    if (!texCache.has(surf)) {
      const texData = new Uint8Array(TEX_W * rowsPerFrame * meta.nframes * 4);
      for (let f = 0; f < meta.nframes; f++) texData.set(rgba.subarray(f * nv * 4, (f + 1) * nv * 4), f * rowsPerFrame * TEX_W * 4);
      const tex = new THREE.DataTexture(texData, TEX_W, rowsPerFrame * meta.nframes, THREE.RGBAFormat, THREE.UnsignedByteType);
      tex.needsUpdate = true;
      texCache.set(surf, tex);
      this.gpuBytes = texData.byteLength + ico.dirs.byteLength + ico.index.byteLength + nv * 4;
    } else this.gpuBytes = 0;
    this.tex = texCache.get(surf);

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(ico.dirs, 3));   // unit direction
    const vid = new Float32Array(nv); for (let i = 0; i < nv; i++) vid[i] = i;
    g.setAttribute('vid', new THREE.BufferAttribute(vid, 1));
    g.setIndex(new THREE.BufferAttribute(ico.index, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(...(this.fixedCenter || centers[0])), meta.rmax + 0.2);

    const s = { ...SurfaceStyles[style], ...(tint || {}) };
    this.uniforms = {
      uTex: { value: this.tex }, uRowsPerFrame: { value: rowsPerFrame },
      uFrames: { value: new THREE.Vector3(0, 0, 0) }, uRange: { value: new THREE.Vector2(meta.rmin, meta.rmax) },
      uCenterA: { value: new THREE.Vector3() }, uCenterB: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Color(...s.color) }, uRim: { value: new THREE.Color(...s.rim) },
      uBase: { value: s.base }, uRimGain: { value: s.rimGain }, uRimPow: { value: s.rimPow }, uSpec: { value: s.spec },
      uShin: { value: s.shin }, uAlpha: { value: s.alpha }, uRimAlpha: { value: s.rimAlpha }, uGain: { value: gain }, uDiff: { value: s.diff ?? 0 }, uBackGain: { value: s.backGain ?? 0.45 }, uDiffAlpha: { value: s.diffAlpha ?? 0 },
      uKeyDir: { value: new THREE.Vector3(0, 1, 1).normalize() }, uBack: { value: side === THREE.BackSide ? 1 : 0 },
    };
    const mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, uniforms: this.uniforms, side, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending,   // premultiplied "over", or pure additive for glow shells
      blendSrc: THREE.OneFactor, blendDst: s.additive ? THREE.OneFactor : THREE.OneMinusSrcAlphaFactor,
      vertexShader: /* glsl */`
        uniform sampler2D uTex; uniform float uRowsPerFrame; uniform vec3 uFrames; uniform vec2 uRange;
        uniform vec3 uCenterA, uCenterB;
        in float vid; out vec3 vN; out vec3 vW; out float vCut;
        ${octDecode}
        vec4 fetch(float frame) {
          int i = int(vid); int W = ${TEX_W};
          return texelFetch(uTex, ivec2(i % W, int(frame * uRowsPerFrame) + i / W), 0);
        }
        void main() {
          vec4 a = fetch(uFrames.x), b = fetch(uFrames.y);
          float r = mix(uRange.x, uRange.y, mix(a.r, b.r, uFrames.z));
          vec3 n = normalize(mix(octDecode(a.gb), octDecode(b.gb), uFrames.z));
          vec3 p = mix(uCenterA, uCenterB, uFrames.z) + position * r;
          vCut = mix(a.a, b.a, uFrames.z);   // cut-plane vertices (4-plane surfaces only; 0 otherwise)
          vec4 w = modelMatrix * vec4(p, 1.0);
          vW = w.xyz; vN = normalize(mat3(modelMatrix) * n);
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor, uRim, uKeyDir; uniform float uBackGain, uDiff, uDiffAlpha, uBase, uRimGain, uRimPow, uSpec, uShin, uAlpha, uRimAlpha, uGain, uBack;
        in vec3 vN; in vec3 vW; in float vCut; out vec4 fragColor;
        void main() {
          vec3 V = normalize(cameraPosition - vW), N = normalize(vN);
          float back = (uBack > 0.5 || !gl_FrontFacing) ? 1.0 : 0.0;
          if (back > 0.5) N = -N;
          float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
          float fres = pow(1.0 - ndv, uRimPow);
          vec3 H = normalize(uKeyDir + V);
          // highlight only toward grazing angles: a broad face-on glint would read as density inside
          float spec = pow(max(dot(N, H), 0.0), uShin) * uSpec * (1.0 - back) * smoothstep(0.25, 0.85, 1.0 - ndv);
          float wrap = 0.5 + 0.5 * dot(N, uKeyDir);       // soft wrap-lit body so lobes read as shape
          vec3 c = uColor * (uBase + uDiff * wrap * wrap) + uRim * fres * uRimGain + vec3(spec);
          float a = clamp(uAlpha + uDiffAlpha * wrap * wrap + uRimAlpha * fres + spec * 0.5, 0.0, 1.0);
          float g = uGain * (back > 0.5 ? uBackGain : 1.0) * (1.0 - smoothstep(0.0, 0.5, vCut));
          fragColor = vec4(c * g, a * g);   // premultiplied
        }`,
    });
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false;
  }
  update(frame, keyDirWorld) {
    const { a, b, w } = bracket(this.keys, frame);
    this.uniforms.uFrames.value.set(a, b, w);
    if (this.centers) {
      this.uniforms.uCenterA.value.set(...this.centers[this.keys[a]]);
      this.uniforms.uCenterB.value.set(...this.centers[this.keys[b]]);
    } else {
      this.uniforms.uCenterA.value.set(...this.fixedCenter); this.uniforms.uCenterB.value.set(...this.fixedCenter);
    }
    if (keyDirWorld) this.uniforms.uKeyDir.value.copy(keyDirWorld);
  }
}
