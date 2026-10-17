// GPU resampling of a proton volume: when the set of four time samples (Catmull-Rom) changes, the
// 8-bit source frames are tricubic-B-spline filtered once into an upsampled RGBA16F 3D render target
// (one time sample per channel); the marcher blends them with a vec4 of time weights. Ray marchers then need ONE trilinear fetch per step instead of 8
// (and avoid inlining many tricubic copies, which killed occupancy in the first version).
import * as THREE from 'three';
import { tricubic } from './glsl.js';
import { bracket4 } from './data.js';

export class ProtonField {
  constructor(renderer, vol, { upsample = 2, cubic = true, shadow = null, direct = false } = {}) {
    this.cubic = cubic; this.direct = direct;
    if (direct) { upsample = 1; shadow = null; }
    this.renderer = renderer; this.vol = vol;
    const m = vol.meta, [nx, ny, nz] = m.shape_xyz, h = m.spacing_bohr;
    this.lo = new THREE.Vector3(...m.origin_bohr).addScalar(-h / 2);
    this.hi = this.lo.clone().add(new THREE.Vector3(nx * h, ny * h, nz * h));
    const e = m.encoding; this.enc = new THREE.Vector3(e.peak, e.scale, Math.log1p(e.scale));
    // 8-bit source pair
    this.rg = new Uint8Array(vol.voxels * 4);           // four time samples per voxel
    this.src = new THREE.Data3DTexture(this.rg, nx, ny, nz);
    Object.assign(this.src, { format: THREE.RGBAFormat, type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, unpackAlignment: 1 });
    // upsampled target
    const gl = renderer.getContext();
    const half = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    this.size = new THREE.Vector3(nx * upsample, ny * upsample, nz * upsample);
    this.rt = new THREE.WebGL3DRenderTarget(this.size.x, this.size.y, this.size.z, {
      format: THREE.RGBAFormat, type: half ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, generateMipmaps: false });
    // three r169 replaces the target's texture with a fresh Data3DTexture, dropping the options: set them here.
    Object.assign(this.rt.texture, { format: THREE.RGBAFormat, type: half ? THREE.HalfFloatType : THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false,
      wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, wrapR: THREE.ClampToEdgeWrapping });
    this.texture = direct ? this.src : this.rt.texture;
    this.gpuBytes = this.rg.byteLength + this.size.x * this.size.y * this.size.z * (half ? 8 : 4);
    this.mat = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, depthTest: false, depthWrite: false,
      uniforms: { uSrc: { value: this.src }, uSrcSize: { value: new THREE.Vector3(nx, ny, nz) }, uDst: { value: this.size }, uZ: { value: 0 } },
      vertexShader: `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */`precision highp float; precision highp sampler3D;
        uniform sampler3D uSrc; uniform vec3 uSrcSize, uDst; uniform float uZ; out vec4 o;
        ${tricubic}
        void main() { o = sampleTricubic(uSrc, vec3(gl_FragCoord.xy, uZ + 0.5) / uDst, uSrcSize); }`,
    });
    // Optional precomputed self-shadowing (cloud look): per time sample, the column of
    // k = (rho/rho50)^gamma toward a light direction FIXED in the molecule frame, 3 taps.
    // Computed in the same per-bracket pass, so the marcher needs one extra fetch, not 3 + pow.
    this.shadow = shadow;
    if (shadow) {
      this.rt2 = new THREE.WebGL3DRenderTarget(this.size.x, this.size.y, this.size.z, { depthBuffer: false });
      Object.assign(this.rt2.texture, { format: THREE.RGBAFormat, type: half ? THREE.HalfFloatType : THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false,
        wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping, wrapR: THREE.ClampToEdgeWrapping });
      this.shadowTexture = this.rt2.texture;
      this.gpuBytes += this.size.x * this.size.y * this.size.z * (half ? 8 : 4);
      this.mat2 = new THREE.ShaderMaterial({
        glslVersion: THREE.GLSL3, depthTest: false, depthWrite: false,
        uniforms: { uSrc: { value: this.src }, uSrcSize: { value: new THREE.Vector3(nx, ny, nz) }, uDst: { value: this.size }, uZ: { value: 0 },
          uL: { value: new THREE.Vector3(0, 1, 0) }, uEnc: { value: this.enc }, uRho50: { value: shadow.rho50 }, uGamma: { value: shadow.gamma } },
        vertexShader: `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader: /* glsl */`precision highp float; precision highp sampler3D;
          uniform sampler3D uSrc; uniform vec3 uSrcSize, uDst, uL, uEnc; uniform float uZ, uRho50, uGamma; out vec4 o;
          ${tricubic}
          vec4 kv(vec3 uvw) {
            vec4 r = uEnc.x * (exp(sampleTricubic(uSrc, uvw, uSrcSize) * uEnc.z) - 1.0) / uEnc.y;
            return pow(max(r, 0.0) / uRho50 + 1e-6, vec4(uGamma)) * smoothstep(0.02, 0.1, r);
          }
          void main() {
            vec3 uvw = vec3(gl_FragCoord.xy, uZ + 0.5) / uDst;
            o = (kv(uvw + uL * 0.05) + kv(uvw + uL * 0.17) + kv(uvw + uL * 0.29)) * 0.12;
          }`,
      });
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.quad = new THREE.Mesh(g, this.mat); this.quad.frustumCulled = false;
    this.cam = new THREE.Camera();
    this.loadedKey = ''; this.wv = new THREE.Vector4(0, 1, 0, 0); this.resamples = 0;
  }
  // Called every display frame: weights change continuously; the GPU resample only runs when the
  // set of four stored frames changes.
  // Render every z-slice of a 3D target with one fragment pass each. Slice 0 goes through three.js
  // (binds program, VAO, uniforms, viewport); the remaining slices are issued as raw GL calls
  // (re-attach layer, set uZ, draw), which cut a resample from ~17 ms of per-draw overhead to ~1 ms.
  fill(rt, mat) {
    const r = this.renderer, gl = r.getContext();
    mat.uniforms.uZ.value = 0;
    r.setRenderTarget(rt, 0); r.render(this.quad, this.cam);
    const tex = r.properties.get(rt.texture).__webglTexture;
    const prog = r.properties.get(mat).currentProgram;
    const loc = prog && gl.getUniformLocation(prog.program, 'uZ');
    if (!tex || !loc) {             // fall back to the slow path
      for (let z = 1; z < this.size.z; z++) { mat.uniforms.uZ.value = z; r.setRenderTarget(rt, z); r.render(this.quad, this.cam); }
      return;
    }
    for (let z = 1; z < this.size.z; z++) {
      gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, z);
      gl.uniform1f(loc, z);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, tex, 0, 0);
    r.resetState();                 // three's cached GL state is stale after raw calls
  }

  // light direction in the volume's local frame (unit); forces a recompute of the shadow field
  setLight(dirLocal) {
    const span = this.hi.clone().sub(this.lo);
    this.mat2.uniforms.uL.value.set(dirLocal.x / span.x, dirLocal.y / span.y, dirLocal.z / span.z);
    this.loadedKey = '';
  }
  update(frame) {
    let { idx, w, key } = bracket4(this.vol.nframes ?? this.vol.meta.nframes, frame, this.cubic);
    const L = this.vol.loaded ?? Infinity;     // streaming: never touch frames that have not arrived
    if (idx.some(k => k >= L)) { idx = idx.map(k => Math.min(k, L - 1)); key = idx.join(); }
    this.wv.set(...w);
    if (key === this.loadedKey) return;
    const F = idx.map(k => this.vol.frame(k)), rg = this.rg, [A, B, C, D] = F;
    for (let i = 0, n = A.length; i < n; i++) { const j = 4 * i; rg[j] = A[i]; rg[j + 1] = B[i]; rg[j + 2] = C[i]; rg[j + 3] = D[i]; }
    this.src.needsUpdate = true; this.loadedKey = key; this.idx = idx;
    if (this.direct) return;   // sample the 8-bit frames directly (hardware trilinear), no GPU pass
    const r = this.renderer, prev = r.getRenderTarget(), auto = r.autoClear;
    r.autoClear = false;
    const T0 = performance.now(), gl = r.getContext();
    if (window.__profileResample) gl.finish();
    const T1 = performance.now();
    this.fill(this.rt, this.mat);
    if (this.shadow) { this.quad.material = this.mat2; this.fill(this.rt2, this.mat2); this.quad.material = this.mat; }
    if (window.__profileResample) { gl.finish(); (window.__resample ||= []).push([T1 - T0, performance.now() - T1, performance.now()]); }
    r.setRenderTarget(prev); r.autoClear = auto; this.resamples++;
  }
}

// GLSL helpers for sampling a ProtonField (uniform names prefixed by `p`).
export const fieldGLSL = p => /* glsl */`
uniform sampler3D ${p}Tex; uniform vec3 ${p}Lo, ${p}Hi, ${p}Size; uniform vec4 ${p}W;
float ${p}Code(vec3 q) { return max(dot(texture(${p}Tex, (q - ${p}Lo) / (${p}Hi - ${p}Lo)), ${p}W), 0.0); }
vec3 ${p}Normal(vec3 q) {           // outward = -grad(code); one upsampled texel central differences
  vec3 d = (${p}Hi - ${p}Lo) / ${p}Size;
  return safeNormalize(-vec3(${p}Code(q + vec3(d.x,0,0)) - ${p}Code(q - vec3(d.x,0,0)),
                             ${p}Code(q + vec3(0,d.y,0)) - ${p}Code(q - vec3(0,d.y,0)),
                             ${p}Code(q + vec3(0,0,d.z)) - ${p}Code(q - vec3(0,0,d.z))));
}
`;
export const fieldUniforms = (p, f) => ({
  [`${p}Tex`]: { value: f.texture }, [`${p}Lo`]: { value: f.lo }, [`${p}Hi`]: { value: f.hi },
  [`${p}Size`]: { value: f.size }, [`${p}W`]: { value: f.wv },
});
