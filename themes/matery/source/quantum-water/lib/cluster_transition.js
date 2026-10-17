// Molecule -> cluster transition, driven by one parameter t in [0,1] (scroll, slider or autoplay).
//
//  t = 0    the approved single-molecule hero (density volumes + glass electron shell), hero framing
//  t ~ 0.3  densities fading; the same molecule condenses into the lightweight representation;
//           neighbours of the first solvation shell scale in
//  t ~ 0.6  camera ~10x further out; the reveal front sweeps outward through the droplet
//  t = 1    whole (H2O)n droplet framed, slow camera orbit (illustrative; nothing is simulated)
//
// Geometry mapping (honest): the single molecule is placed ON one real molecule of the computed cluster
// geometry by a rigid alignment (its O on that O, molecular planes and bisectors matched). Nothing in the
// cluster is moved or rescaled; the hero molecule's two lightweight hydrogens morph from the trajectory's
// proton centroids to the cluster geometry during the cross-fade (~0.1-0.2 A).
import * as THREE from 'three';
import { BOHR_PER_ANGSTROM as S } from './cluster_data.js';

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, w) => a + (b - a) * w;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// All timings in t. Exported so an integrator can retime the choreography without touching code.
export const TIMING = {
  shellOut: [0.08, 0.30],      // glass electron shell + haze fade out
  densOut: [0.16, 0.42],       // proton volumes fade out
  glowOut: [0.12, 0.32],       // oxygen red glow fades out
  heroIn: [0.16, 0.40],        // lightweight hero atoms scale in (hidden inside the density O until then)
  morph: [0.22, 0.52],         // hero H: trajectory centroid -> cluster geometry
  grow: [0.20, 0.70],          // atom display radii grow from molecule scale to cluster scale
  revealAll: [0.24, 0.92],     // reveal front sweeps the whole droplet (strictly by distance from the hero)
  pull: [0.0, 0.50],           // camera eases from the hero framing to "frame what is revealed"
  turn: [0.15, 0.90],          // view direction turns from the hero view to the droplet view
  depth: [0.30, 0.70],         // depth fog fades in (never touches the single molecule)
  orbitIn: [0.70, 1.0],        // auto-orbit fades in at the end
};
// Framing / depth constants (exported for retuning without code changes).
export const FRAME = {
  fill: 0.80,         // landscape/desktop: parameter 0.80 -> end droplet ~70 % of frame height (measured, 1920x1080)
  fillPortrait: 0.69, // portrait/phone: droplet ~60 % of the frame WIDTH (the limiting side)
  margin: 1.6,        // A added to the revealed extent (atom + halo)
  backFade: 0.80,     // fog factor at the back of the object (front crisp, back at ~30 % contrast)
  revealW: 2.0,       // A: width of the scale-in band of the reveal front
  orbitSpeed: 0.07,   // rad/s at t = 1
};
export const SIZES = {         // display radii, Angstrom (art-directed, not van der Waals)
  oxygen: [0.3 / S, 0.425],    // starts at the hero's 0.3 bohr oxygen sphere
  hydrogen: [0.09, 0.12],
  halo: [0.36, 0.70],
};

// Rotation taking a water's frame (bisector, plane normal) to the canonical axes. Rows = frame axes.
function waterFrame(O, H1, H2) {
  const a = V(...H1).sub(V(...O)), b = V(...H2).sub(V(...O));
  const bis = a.clone().add(b).normalize(), n = a.clone().cross(b).normalize(), e = bis.clone().cross(n).normalize();
  return new THREE.Matrix4().makeBasis(e, bis, n);   // columns e, bis, n
}

// The hero's density meshes (built by water_scene.buildFor into `root`): find them, and patch the proton
// ray-marcher with a uFade multiplier (premultiplied output x fade; no other change to the approved shader).
// Safe to call repeatedly (the far haze streams in after the first frame).
export function collectHeroParts(root) {
  const parts = { surfaces: [], protons: [], oxygen: null, glow: null };
  root.traverse(o => {
    const m = o.material; if (!m || !o.isMesh) return;
    const u = m.uniforms || {};
    if (u.uProtonGain) {
      if (!m.userData.fadePatched) {
        u.uFade = { value: 1 };
        m.fragmentShader = m.fragmentShader
          .replace('precision highp sampler3D;', 'precision highp sampler3D; uniform float uFade;')
          .replace('fragColor = vec4(col, a);', 'fragColor = vec4(col, a) * uFade;');
        m.userData.fadePatched = true; m.needsUpdate = true;
      }
      parts.protons.push(o);
    } else if (u.uRimGain && u.uGain) {
      parts.surfaces.push({ mesh: o, u, haze: o.renderOrder === 6 });
    } else if (m.isMeshPhysicalMaterial && !o.isInstancedMesh) {
      parts.oxygen = o;
      const g = o.userData.glow || o.children.find(c => c.material?.uniforms?.uGain);
      if (g) parts.glow = { mesh: g };
    }
  });
  return parts;
}

export class ClusterTransition {
  // stage: from stage.js; root: molecule frame group (Bohr; may sit in an orientation pivot);
  // ds: hero dataset (manifest frames); cluster: Cluster; view: ClusterView;
  // heroCam: aspect => { target, dir, dist } world-space hero framing (used until the live pose is captured);
  // look: { shellGain, hazeGain, oxygenGlow } un-faded gains of the current hero look (water_scene sceneConfig)
  constructor({ stage, root, ds, cluster, view, heroCam, look }) {
    Object.assign(this, { stage, root, ds, cluster, view, heroCam });
    this.look = look || { shellGain: 1, hazeGain: 0.12, oxygenGlow: 0.55 };
    this.t = 0; this.yaw = 0; this.pitch = 0; this.autoYaw = 0; this.start = null; this._nChildren = -1;
    this.group = new THREE.Group(); this.group.matrixAutoUpdate = false; this.group.add(view.group);
    root.add(this.group);
    const F = ds.m.frames, mean = A => [0, 1, 2].map(k => A.reduce((s, a) => s + a[k], 0) / A.length);
    this.heroO = mean(F.oxygen_bohr); this.heroH1 = mean(F.proton_centroid_bohr.H1); this.heroH2 = mean(F.proton_centroid_bohr.H2);
    this.heroFrame = waterFrame(this.heroO, this.heroH1, this.heroH2);
    this.prevFog = stage.scene.fog;
    stage.scene.fog = new THREE.Fog(view.fogColor, 1e4, 2e4);
    this.setCount(cluster.nMol);
  }
  get parts() {
    let n = 0; this.root.traverse(() => n++);
    if (n !== this._nChildren) { this._nChildren = n; this._parts = collectHeroParts(this.root); }
    return this._parts;
  }

  // Rigid map cluster(A) -> root(bohr) putting molecule i on the hero molecule.
  alignTo(i) {
    const c = this.cluster, Fc = waterFrame(c.atom(i, 0), c.atom(i, 1), c.atom(i, 2));
    const R = this.heroFrame.clone().multiply(Fc.clone().transpose());
    const M = new THREE.Matrix4().makeTranslation(...this.heroO).multiply(R).multiply(new THREE.Matrix4().makeScale(S, S, S))
      .multiply(new THREE.Matrix4().makeTranslation(...c.atom(i, 0).map(v => -v)));
    return M;
  }

  // Pick the molecule the hero becomes: on the droplet surface, unobstructed, and such that after alignment
  // its outward normal points roughly at the hero camera (so the zoom-out is a pull-back, not a swing).
  chooseHero(n) {
    const c = this.cluster, C = c.center(n), R = c.radius(n, C);
    const cam = this.heroCam(this.stage.camera.aspect), pw = new THREE.Matrix4();
    this.root.updateWorldMatrix(true, false); pw.extractRotation(this.root.matrixWorld);
    let best = { score: -1e9, i: 0 };
    for (let i = 0; i < n; i++) {
      const O = c.atom(i, 0), a = V(O[0] - C[0], O[1] - C[1], O[2] - C[2]), r = a.length(); a.normalize();
      let blocked = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const P = c.atom(j, 0), v = V(P[0] - O[0], P[1] - O[1], P[2] - O[2]), d = v.length();
        if (d < 9 && v.dot(a) > d * Math.cos(35 * Math.PI / 180)) blocked++;
      }
      const u = a.clone().transformDirection(new THREE.Matrix4().extractRotation(this.alignTo(i))).transformDirection(pw);
      const score = 2 * u.dot(cam.dir) + r / R - 0.6 * blocked;
      if (score > best.score) best = { score, i, facing: u.dot(cam.dir), r, blocked };
    }
    return best;
  }

  setCount(n, hero = null) {
    n = this.cluster.snap(n); this.n = n;
    this.view.setCount(n);
    this.hero = hero != null ? { i: hero } : this.chooseHero(n);
    this.view.setRevealOrigin(this.hero.i);
    this.M = this.alignTo(this.hero.i); this.Minv = this.M.clone().invert();
    this.group.matrix.copy(this.M); this.group.matrixWorldNeedsUpdate = true;
    const C = this.cluster.center(n);
    this.centerLocal = V(...C).applyMatrix4(this.M);              // root coords (bohr)
    this.radiusA = this.cluster.radius(n, C);
    this.radiusBohr = (this.radiusA + 1.6) * S;      // + an O radius and a halo
    this.heroLocal = V(...this.heroO);
  }

  // Camera pose for transition t plus user/auto orbit. All world space.
  // Reveal front (A from the hero O), a pure function of t.
  frontAt(t) { return t <= 0 ? -1 : ss(...TIMING.revealAll, t) * (this.view.maxDist + FRAME.revealW + 0.5); }

  // Weighted centroid and extent (A, cluster frame) of what is revealed at front R: the camera frames this,
  // so the visitor always sees one coherent, growing object around the hero molecule.
  revealedBall(R) {
    const c = this.cluster, d = this.view.dist, n = this.n, hi = this.hero.i, W = FRAME.revealW;
    let sw = 1, cx = 0, cy = 0, cz = 0; const O0 = c.atom(hi, 0); cx = O0[0]; cy = O0[1]; cz = O0[2];
    const w = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      if (i === hi) continue;
      const x = Math.min(1, Math.max(0, (R - d[i]) / W)); w[i] = x * x * (3 - 2 * x);
      if (w[i] > 0) { const O = c.atom(i, 0); sw += w[i]; cx += w[i] * O[0]; cy += w[i] * O[1]; cz += w[i] * O[2]; }
    }
    cx /= sw; cy /= sw; cz /= sw;
    let s2 = 0;
    for (let i = 0; i < n; i++) {
      const wi = i === hi ? 1 : w[i]; if (!wi) continue;
      const O = c.atom(i, 0); s2 += wi * ((O[0] - cx) ** 2 + (O[1] - cy) ** 2 + (O[2] - cz) ** 2);
    }
    const rms = Math.sqrt(s2 / sw);
    return { center: [cx, cy, cz], extent: 1.29 * rms + FRAME.margin };   // 1.29 rms = radius of a uniform ball
  }

  cameraAt(t) {
    const cam = this.start || this.heroCam(this.stage.camera.aspect);
    this.root.updateWorldMatrix(true, false);
    const W = this.root.matrixWorld, rot = new THREE.Matrix4().extractRotation(W);
    const toWorld = a => V(...a).applyMatrix4(this.M).applyMatrix4(W);
    const C = this.centerLocal.clone().applyMatrix4(W), H = this.heroLocal.clone().applyMatrix4(W);
    const out = this.cluster.atom(this.hero.i, 0).map((v, k) => v - this.cluster.center(this.n)[k]);
    const u = V(...out).normalize().transformDirection(new THREE.Matrix4().extractRotation(this.M)).transformDirection(rot);
    const dir1 = cam.dir.clone().normalize().add(u).normalize();
    const cam_ = this.stage.camera, vf = THREE.MathUtils.degToRad(cam_.fov);
    const hf = 2 * Math.atan(Math.tan(vf / 2) * cam_.aspect), tanHalf = Math.tan(Math.min(vf, hf) / 2);
    const front = this.frontAt(t), ball = this.revealedBall(Math.max(0, front));
    // the front itself (continuous in t) sets a floor, so the camera anticipates each shell instead of
    // jumping when several first-shell neighbours enter together
    const B = toWorld(ball.center), E = Math.max(ball.extent, Math.min(0.75 * Math.max(0, front), this.radiusA) + FRAME.margin) * S;   // world (bohr)
    const dFit = E / ((cam_.aspect < 1 ? FRAME.fillPortrait : FRAME.fill) * tanHalf);
    const w = ss(...TIMING.pull, t);
    const dist = Math.exp(lerp(Math.log(cam.dist), Math.log(Math.max(dFit, cam.dist)), w));
    const target = cam.target.clone().lerp(B, w);
    const dir = cam.dir.clone().normalize().lerp(dir1, ss(...TIMING.turn, t)).normalize();
    // orbit: yaw about world up, pitch about the camera's right axis, around the current target
    const off = dir.multiplyScalar(dist);
    off.applyAxisAngle(V(0, 1, 0), this.yaw + this.autoYaw);
    const right = V(0, 1, 0).cross(off).normalize();
    off.applyAxisAngle(right, this.pitch);
    return { target, pos: target.clone().add(off), dist, C, H, B, E, front };
  }

  // Record the live camera pose while the hero owns the camera (t = 0), so the pull-back starts exactly
  // where the visitor left it (after drags, drift or auto-rotate).
  captureStart() {
    const c = this.stage.camera, tg = this.stage.controls.target.clone(), off = c.position.clone().sub(tg);
    this.start = { target: tg, dir: off.clone().normalize(), dist: off.length() };
  }

  update(t, dt, frame) {
    const prevT = this.t; this.t = t;
    const T = TIMING, view = this.view, p = this.parts, stage = this.stage, L = this.look;
    if (t <= 0) {
      if (prevT > 0) { this.yaw = this.pitch = this.autoYaw = 0; }   // the hero camera takes over again
      this.captureStart();
    }
    this.autoYaw += dt * FRAME.orbitSpeed * ss(...T.orbitIn, t) * (this.autoOrbit === false ? 0 : 1);
    const pose = this.cameraAt(t);
    if (t > 0) {
      stage.controls.target.copy(pose.target);
      stage.camera.position.copy(pose.pos); stage.camera.lookAt(pose.target);
    }
    // densities out
    const shell = 1 - ss(...T.shellOut, t), dens = 1 - ss(...T.densOut, t), glow = 1 - ss(...T.glowOut, t);
    for (const s of p.surfaces) { s.u.uGain.value = (s.haze ? L.hazeGain : L.shellGain) * shell; s.mesh.visible = shell > 0.002; }
    for (const m of p.protons) { m.material.uniforms.uFade.value = dens; m.visible = dens > 0.002; }
    if (p.glow) p.glow.mesh.material.uniforms.uGain.value = L.oxygenGlow * glow;
    // sizes
    const g = ss(...T.grow, t), rO = lerp(SIZES.oxygen[0], SIZES.oxygen[1], g);
    const heroIn = ss(...T.heroIn, t);
    view.set({ oRadius: rO, hRadius: lerp(...SIZES.hydrogen, g), haloRadius: lerp(...SIZES.halo, g), heroScale: heroIn,
      heroGlow: lerp(1, 1.35, ss(0.8, 1, t)) });
    // density oxygen: stays (and grows with the cluster radius) until the instanced one is fully in
    if (p.oxygen) {
      p.oxygen.visible = heroIn < 0.999;
      p.oxygen.scale.setScalar(Math.max(1, rO * S / 0.3));
    }
    // hero hydrogens: trajectory centroids (root bohr) -> cluster frame (A), morphing onto the geometry
    const m = ss(...T.morph, t);
    if (frame != null) {
      const H = this.ds.m.frames.proton_centroid_bohr, f0 = Math.floor(frame), f1 = Math.min(f0 + 1, H.H1.length - 1), w = frame - f0;
      const at = A => V(...A[f0].map((v, k) => lerp(v, A[f1][k], w))).applyMatrix4(this.Minv);
      const c = this.cluster, i = this.hero.i;
      const h1 = at(H.H1).lerp(V(...c.atom(i, 1)), m), h2 = at(H.H2).lerp(V(...c.atom(i, 2)), m);
      view.setHeroHydrogens(h1.toArray(), h2.toArray());
    }
    view.set({ revealR: pose.front, revealW: FRAME.revealW });
    // depth cue across the revealed object: front crisp, back at FRAME.backFade (linear, like THREE.Fog)
    const dc = pose.pos.distanceTo(pose.B), k = Math.max(1e-3, ss(...T.depth, t));
    const near = dc - pose.E, far = near + 2 * pose.E / ((this.backFade ?? FRAME.backFade) * k);
    stage.scene.fog.near = near; stage.scene.fog.far = far; stage.scene.fog.color.copy(view.fogColor);
    this.pose = pose;
    view.setFog(near, far);
    view.group.visible = t > 0;
  }

  dispose() {
    const p = this.parts;
    for (const s of p.surfaces) { s.u.uGain.value = s.haze ? this.look.hazeGain : this.look.shellGain; s.mesh.visible = true; }
    for (const m of p.protons) { m.material.uniforms.uFade.value = 1; m.visible = true; }
    if (p.glow) p.glow.mesh.material.uniforms.uGain.value = this.look.oxygenGlow;
    if (p.oxygen) { p.oxygen.visible = true; p.oxygen.scale.setScalar(1); }
    this.root.remove(this.group); this.view.dispose();
    this.stage.scene.fog = this.prevFog || null;
  }
}
