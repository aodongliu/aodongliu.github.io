// Lightweight, art-directed water cluster: instanced glossy red oxygens, small glowing hydrogens with a
// camera-facing halo (an echo of the proton clouds, NOT a computed density), optional geometric
// hydrogen-bond hints. Four draw calls for any n. The group is in Angstrom; scale it into the scene.
//
//   const view = new ClusterView(cluster, { theme: 'dark' });  parent.add(view.group);
//   view.setCount(250); view.setRevealOrigin(heroIndex); view.set({ revealR, heroScale, ... }); view.update(camera)
import * as THREE from 'three';

const REVEAL = /* glsl */`
uniform float uRevealR, uRevealW, uHeroScale;
float reveal(float d) {
  if (d < 0.0) return uHeroScale;                       // the hero molecule (cross-fades separately)
  float s = clamp((uRevealR - d) / uRevealW, 0.0, 1.0);
  return s * s * (3.0 - 2.0 * s);
}`;

export const CLUSTER_THEMES = {
  dark: {
    oxygen: { color: 0xb3121c, roughness: 0.3, clearcoat: 0.25, emissive: 0x3a0306 },
    hcore: { color: 0xd4dbe4, emissive: 0xe8efff, emissiveIntensity: 0.16, roughness: 0.4 },
    halo: { color: [0.70, 0.74, 0.80], gain: 0.13, additive: true },
    hbond: { color: [0.55, 0.66, 0.82], alpha: 0.12 },
    fogColor: 0x061417,
  },
  light: {   // contrast on #fbfefe: saturated red, dark fresnel edge, slate hydrogens with a darker halo
    oxygen: { color: 0xd0101c, roughness: 0.34, clearcoat: 0.3, emissive: 0x000000, edge: 0.55 },
    hcore: { color: 0x6b7a88, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.45, edge: 0.45 },
    halo: { color: [0.22, 0.29, 0.38], gain: 0.40, additive: false },
    hbond: { color: [0.16, 0.23, 0.33], alpha: 0.34 },
    fogColor: 0xfbfefe,
  },
};

export class ClusterView {
  constructor(cluster, { theme = 'dark', oRadius = 0.32, hRadius = 0.15, haloRadius = 0.55, detail = 3, hbonds = true } = {}) {
    this.c = cluster; this.N = cluster.nMol; this.n = cluster.nMol; this.heroIndex = -1;
    this.group = new THREE.Group(); this.group.name = 'cluster';
    const u = this.uniforms = {
      uRevealR: { value: 1e3 }, uRevealW: { value: 3.0 }, uHeroScale: { value: 1 },
      uORadius: { value: oRadius }, uHRadius: { value: hRadius }, uHaloR: { value: haloRadius },
      uHaloGain: { value: 0.55 }, uHeroGlow: { value: 1.0 }, uHaloCol: { value: new THREE.Color() },
      uFog: { value: new THREE.Vector2(1e4, 2e4) }, uHbAlpha: { value: 0.22 }, uHbCol: { value: new THREE.Color() },
      uFade: { value: 1 }, uEdgeO: { value: 0 }, uEdgeH: { value: 0 },
    };
    const N = this.N;
    this.dist = new Float32Array(N);       // per molecule, distance (A) of its O from the reveal origin
    this.aDistO = new THREE.InstancedBufferAttribute(new Float32Array(N), 1);
    this.aDistH = new THREE.InstancedBufferAttribute(new Float32Array(2 * N), 1);

    // --- oxygens ---------------------------------------------------------------------------------
    const gO = new THREE.IcosahedronGeometry(1, detail); gO.setAttribute('aDist', this.aDistO);
    this.oMat = new THREE.MeshPhysicalMaterial({ metalness: 0, clearcoatRoughness: 0.3, specularIntensity: 0.6 });
    this.oMat.onBeforeCompile = sh => this._scaled(sh, 'uORadius', 'uEdgeO');
    this.oMat.customProgramCacheKey = () => 'cluster-oxygen';
    this.oxygens = new THREE.InstancedMesh(gO, this.oMat, N);
    // --- hydrogen cores --------------------------------------------------------------------------
    const gH = new THREE.IcosahedronGeometry(1, Math.max(1, detail - 1)); gH.setAttribute('aDist', this.aDistH);
    this.hMat = new THREE.MeshStandardMaterial({ metalness: 0 });
    this.hMat.onBeforeCompile = sh => this._scaled(sh, 'uHRadius', 'uEdgeH');
    this.hMat.customProgramCacheKey = () => 'cluster-hcore';
    this.hcores = new THREE.InstancedMesh(gH, this.hMat, 2 * N);
    // --- hydrogen halos: instanced camera-facing quads, Gaussian falloff ---------------------------
    const gQ = new THREE.PlaneGeometry(2, 2); gQ.setAttribute('aDist', this.aDistH);
    this.haloMat = new THREE.ShaderMaterial({
      uniforms: u, transparent: true, depthWrite: false,
      vertexShader: /* glsl */`
        in float aDist; out vec2 vP; out float vA;
        uniform float uHaloR, uHeroGlow; uniform vec2 uFog;
        ${REVEAL}
        void main() {
          float s = reveal(aDist);
          vec4 c = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float k = length((modelMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);   // group scale (A -> scene units)
          vP = position.xy;
          float fog = clamp((-c.z - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0);
          vA = s * (1.0 - fog) * (aDist < 0.0 ? uHeroGlow : 1.0);
          gl_Position = projectionMatrix * (c + vec4(position.xy * uHaloR * k * max(s, 0.001), 0.0, 0.0));
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uHaloCol; uniform float uHaloGain, uFade; in vec2 vP; in float vA;
        void main() {
          float r2 = dot(vP, vP); if (r2 > 1.0) discard;
          float a = (exp(-r2 * 4.5) - 0.011) * uHaloGain * vA * uFade;
          gl_FragColor = vec4(uHaloCol * a, a);   // premultiplied
        }`,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    });
    this.halos = new THREE.InstancedMesh(gQ, this.haloMat, 2 * N);
    for (const m of [this.oxygens, this.hcores, this.halos]) { m.frustumCulled = false; this.group.add(m); }
    this.oxygens.renderOrder = 10; this.hcores.renderOrder = 10; this.halos.renderOrder = 12;

    // instance transforms: translations only (the radius lives in the shader, so it can animate)
    const I = new THREE.Matrix4();
    for (let i = 0; i < N; i++) {
      this.oxygens.setMatrixAt(i, I.makeTranslation(...cluster.atom(i, 0)));
      for (let h = 1; h <= 2; h++) { I.makeTranslation(...cluster.atom(i, h)); this.hcores.setMatrixAt(2 * i + h - 1, I); this.halos.setMatrixAt(2 * i + h - 1, I); }
    }
    this.halos.instanceMatrix = this.hcores.instanceMatrix;   // shared buffer: one upload for both

    // --- hydrogen-bond hints ---------------------------------------------------------------------
    this.hbondMat = new THREE.ShaderMaterial({
      uniforms: u, transparent: true, depthWrite: false,
      vertexShader: /* glsl */`
        in float aT; in float aDist; out float vT; out float vA; uniform vec2 uFog;
        ${REVEAL}
        void main() {
          vT = aT; vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float fog = clamp((-mv.z - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0);
          vA = reveal(aDist) * (1.0 - fog) * (1.0 - fog);   // a hint on the near hemisphere only
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uHbCol; uniform float uHbAlpha, uFade; in float vT; in float vA;
        void main() {
          float dash = step(0.45, fract(vT * 5.0));                     // dashed, fading toward both ends
          float a = uHbAlpha * vA * dash * smoothstep(0.0, 0.2, vT) * smoothstep(1.0, 0.75, vT) * uFade;
          gl_FragColor = vec4(uHbCol * a, a);
        }`,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    this.hbondsOn = hbonds;
    this.hbondLines = new THREE.LineSegments(new THREE.BufferGeometry(), this.hbondMat);
    this.hbondLines.frustumCulled = false; this.hbondLines.renderOrder = 11; this.group.add(this.hbondLines);

    this.setTheme(theme);
    this.setCount(this.N);
  }

  _scaled(sh, radius, edge) {   // inject per-instance reveal scale (+ optional dark fresnel edge) into a built-in material
    Object.assign(sh.uniforms, this.uniforms);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float ${edge};`)
      .replace('#include <fog_fragment>', `gl_FragColor.rgb *= 1.0 - ${edge} * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.0);\n#include <fog_fragment>`);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\nin float aDist; uniform float ${radius};\n${REVEAL}`)
      .replace('#include <begin_vertex>', `vec3 transformed = position * ${radius} * reveal(aDist);`);
  }

  setTheme(name) {
    const T = CLUSTER_THEMES[name] || CLUSTER_THEMES.dark; this.theme = name;
    this.oMat.color.set(T.oxygen.color); this.oMat.roughness = T.oxygen.roughness; this.oMat.clearcoat = T.oxygen.clearcoat; this.oMat.emissive.set(T.oxygen.emissive); this.uniforms.uEdgeO.value = T.oxygen.edge ?? 0; this.uniforms.uEdgeH.value = T.hcore.edge ?? 0;
    this.hMat.color.set(T.hcore.color); this.hMat.emissive.set(T.hcore.emissive); this.hMat.emissiveIntensity = T.hcore.emissiveIntensity; this.hMat.roughness = T.hcore.roughness;
    this.uniforms.uHaloCol.value.setRGB(...T.halo.color); this.uniforms.uHaloGain.value = T.halo.gain;
    this.haloMat.blendDst = T.halo.additive ? THREE.OneFactor : THREE.OneMinusSrcAlphaFactor; this.haloMat.needsUpdate = true;
    this.uniforms.uHbCol.value.setRGB(...T.hbond.color); this.uniforms.uHbAlpha.value = this.hbondsOn ? T.hbond.alpha : 0;
    this.fogColor = new THREE.Color(T.fogColor);
  }

  setCount(n) {
    this.n = n = Math.min(n, this.N);
    this.oxygens.count = n; this.hcores.count = 2 * n; this.halos.count = 2 * n;
    // hydrogen-bond hint segments (H -> acceptor O), rebuilt per size (~1 ms for 250)
    const hb = this.hbondsOn ? this.c.hbonds(n) : [];
    this.hbonds = hb;
    const pos = new Float32Array(hb.length * 6), t = new Float32Array(hb.length * 2), d = new Float32Array(hb.length * 2);
    hb.forEach(([i, h, j], k) => { pos.set(this.c.atom(i, h), 6 * k); pos.set(this.c.atom(j, 0), 6 * k + 3); t[2 * k + 1] = 1; });
    const g = this.hbondLines.geometry;
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aT', new THREE.BufferAttribute(t, 1));
    g.setAttribute('aDist', new THREE.BufferAttribute(d, 1));
    this._writeDist();
  }

  // Molecules appear in order of distance from this molecule (the one the single-molecule scene becomes).
  setRevealOrigin(i) {
    this.heroIndex = i;
    const O = this.c.atom(i, 0);
    for (let k = 0; k < this.N; k++) { const P = this.c.atom(k, 0); this.dist[k] = Math.hypot(P[0] - O[0], P[1] - O[1], P[2] - O[2]); }
    this._writeDist();
  }
  _writeDist() {
    const dO = this.aDistO.array, dH = this.aDistH.array;
    for (let k = 0; k < this.N; k++) { const v = k === this.heroIndex ? -1 : this.dist[k]; dO[k] = v; dH[2 * k] = v; dH[2 * k + 1] = v; }
    this.aDistO.needsUpdate = true; this.aDistH.needsUpdate = true;
    const g = this.hbondLines.geometry, a = g.getAttribute('aDist');
    if (a) { (this.hbonds || []).forEach(([i, , j], k) => { const v = Math.max(this.dist[i], this.dist[j]); a.array[2 * k] = v; a.array[2 * k + 1] = v; }); a.needsUpdate = true; }
    this.maxDist = Math.max(0, ...Array.from(this.dist.subarray(0, this.n)));
  }

  // Override the hero molecule's two hydrogen positions (Angstrom, cluster frame), e.g. to morph them
  // from the single-molecule trajectory's proton centroids onto the cluster geometry.
  setHeroHydrogens(h1, h2) {
    const i = this.heroIndex; if (i < 0) return;
    const a = this.hcores.instanceMatrix.array;
    [h1, h2].forEach((p, h) => { const o = 16 * (2 * i + h); a[o + 12] = p[0]; a[o + 13] = p[1]; a[o + 14] = p[2]; });
    this.hcores.instanceMatrix.needsUpdate = true;
  }
  resetHeroHydrogens() { if (this.heroIndex >= 0) this.setHeroHydrogens(this.c.atom(this.heroIndex, 1), this.c.atom(this.heroIndex, 2)); }

  set(o) {   // revealR, revealW (A), heroScale, oRadius, hRadius, haloRadius (A), heroGlow, fade
    const U = this.uniforms, map = { revealR: 'uRevealR', revealW: 'uRevealW', heroScale: 'uHeroScale', oRadius: 'uORadius',
      hRadius: 'uHRadius', haloRadius: 'uHaloR', heroGlow: 'uHeroGlow', fade: 'uFade' };
    for (const k in o) if (map[k]) U[map[k]].value = o[k];
  }
  // Depth cue: fade halos/bonds (and, via scene.fog, the spheres) from the cluster's front to its back.
  setFog(near, far) { this.uniforms.uFog.value.set(near, far); }

  dispose() {
    for (const m of [this.oxygens, this.hcores, this.halos, this.hbondLines]) { m.geometry.dispose(); m.material.dispose(); }
    this.group.removeFromParent();
  }

  stats() {
    const tri = g => (g.index ? g.index.count : g.attributes.position.count) / 3;
    return { drawCalls: 4, instances: { oxygen: this.oxygens.count, hydrogen: this.hcores.count, halo: this.halos.count },
      hbonds: this.hbonds.length, triangles: tri(this.oxygens.geometry) * this.oxygens.count + tri(this.hcores.geometry) * this.hcores.count + 2 * this.halos.count };
  }
}
