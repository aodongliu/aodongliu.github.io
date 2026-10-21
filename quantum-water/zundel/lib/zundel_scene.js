// Zundel scene: proton sharing in the cis-Zundel cation H9O4+ (four waters, one quantum proton shared by two
// oxygens). Same visual language as the single-water hero (water_scene.js, soft-glow look): the shared proton
// is the only density-rendered nucleus (emissive volume, same transfer function and GPU resampling as the
// water's protons, emission normalised to the WATER hero's 50 % density so brightness is comparable); the
// electron density is the same glass 0.15 au isosurface, baked as one star surface per water plus the bridge
// lobe around the shared proton (tools/water_stars.py; seams on the cut planes are drawn transparent, so the
// pieces read as one envelope wherever the isosurface is connected); oxygens are the hero's red spheres, the
// eight classical hydrogens are the cluster scene's small grey-white spheres (no density); haze off.
// All-quantum datasets (ZUNDEL_DATA.all9): the eight O-H protons are density volumes too, same look as the shared one.
//
//   import { zundelConfig, bootstrapZundel } from '../common/zundel_scene.js';
//   const app = await bootstrapZundel(zundelConfig('dark', { drift: false }), { data: '../data/zundel_dz_loop' });
//   app.setTheme('light');   // live look switch
//
// Molecule frame: the shared O-H-O axis is world x (O of pair[0] at -x), world y points from the two outer
// waters toward the shared core (flip: 1 puts the core at the bottom), world z is the normal of the
// four-oxygen plane. zundelCamFor() frames it slightly from above, landscape and portrait (heroCamFor pattern).
import * as THREE from 'three';
import { createStage, createOxygen, params, num } from './stage.js';
import { loadDataset, getLoop } from './data.js';
import { Timeline } from './timeline.js';
import { StarSurface } from './star_surface.js';
import { icosphere } from './icosphere.js';
import { ProtonVolume } from './proton_volume.js';
import { sceneConfig, stageOptionsFor } from './water_scene.js';
// classical-H sphere materials (cluster_view.js CLUSTER_THEMES.*.hcore, inlined: page copy, spheres hidden for all9)
const CLUSTER_THEMES = {
  dark: { hcore: { color: 0xd4dbe4, emissive: 0xe8efff, emissiveIntensity: 0.16, roughness: 0.4 } },
  light: { hcore: { color: 0x6b7a88, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.45, edge: 0.45 } },
};

// 50/90/99 % enclosed-probability densities of the WATER hero's protons (data/v2_pv5z_loop, frame 0): the
// emission reference, so equal density renders equally bright in both scenes.
// Baked Zundel datasets (paths relative to a proto_* page). tz = cc-pVTZ electrons, dt 0.025 (default since round 3);
// dz = cc-pVDZ electrons, dt 0.05 (rounds 1-2).
// all9 = the all-nine-quantum-proton run (cc-pVTZ electrons, dt 0.025; proto_zundel/REPORT.md round 4): every proton
// is a density volume (H1 = shared, H2..H9 = the eight water O-H protons, volumes[*].atom = atom index; the four outer-
// water protons are stored as one real frame each, volumes[*].static).
export const ZUNDEL_DATA = { tz: '../data/zundel_tz_loop', dz: '../data/zundel_dz_loop', all9: '../data/zundel_all9_loop' };
export const WATER_PROTON_ISOS = [5.015625, 0.63671875, 0.04595947265625];
export const CAPTION = 'Proton sharing in a protonated water tetramer (H₉O₄⁺): the shared proton is treated quantum ' +
  'mechanically and its cloud sloshes between two oxygens. Real-time NEO-DFT with all nuclei held fixed; the mean-field ' +
  'oscillation (~3000 cm⁻¹) is faster than the real shared-proton motion (~1000 cm⁻¹).';

// Per-dataset caption: the mean-field frequency depends on the electron basis (cc-pVDZ: 436 au period, ~3200 cm⁻¹;
// cc-pVTZ: 602 au, ~2300 cm⁻¹; see proto_zundel/REPORT.md round 3).
export const CAPTION_ALL9 = 'Protonated water tetramer (H₉O₄⁺) with all nine protons quantum (real-time NEO-DFT, B3LYP/EPC17, ' +
  'cc-pVTZ electrons, oxygens fixed): the shared proton starts displaced and sloshes between the two central oxygens while the ' +
  'hydrogen-bonded O–H protons of the inner waters stretch in response. This mean-field oscillation (~2200 cm⁻¹) is faster than ' +
  'the real shared-proton band (~1000 cm⁻¹).';
export const CAPTIONS = { dz: CAPTION, tz: CAPTION.replace('(~3000 cm⁻¹)', '(~2300 cm⁻¹)'), all9: CAPTION_ALL9 };

export function zundelConfig(theme = 'dark', over = {}) {
  const base = sceneConfig(theme === 'light' ? 'light' : 'dark');
  return {
    ...base, theme: theme === 'light' ? 'light' : 'dark', haze: 0, hazeGain: 0,
    ...(theme === 'light' ? LIGHT_PROTON : {}),
    hRadius: 0.15,                    // classical H sphere (Bohr): cluster scene's H/O ratio at the hero's O size
    tilt: 16,                         // camera elevation above the four-oxygen plane (deg)
    flip: 0,                          // 1 = shared core at the bottom of the frame
    framing: 'medium',                // 'medium' (default): donor pair fills the frame, cloud at centre; 'full': whole cation
    // medium close-up (world origin = midpoint of the two donor oxygens)
    halfWidth: 4.8,                   // landscape: half-width kept in frame (donor waters incl. glass, Bohr)
    fill: 0.97,
    targetY: -0.9,                    // landscape: look-at below the core, so the cloud sits slightly above centre and
                                      // the outer waters peek in at the lower corners
    rollPortrait: 90,                 // portrait: O-H-O axis vertical (deg, rotation about the view axis)
    halfLengthPortrait: 5.6,          // portrait: half-length along the (vertical) O-O axis kept in frame
    fillPortrait: 0.93,
    targetYPortrait: -1.5,            // portrait: cloud rides above the caption block
    // full framing (framing=full): whole cation
    halfWidthFull: 6.3, halfHeightFull: 4.5, fillFull: 0.86, halfWidthPortraitFull: 5.4, targetYPortraitFull: -1.6,
    ...over,
  };
}

// Light theme only: the hero's light proton look is tuned for a molecule-sized cloud; at the Zundel's
// medium close-up the warm core (gain 4.5) blew out to page white inside a grey ring. Lower emission with the
// same absorption and a softer halo tone reads as a filled grey-blue cloud with a lighter core (dark untouched).
export const LIGHT_PROTON = { gain: 2.0, absorb: 2.4, halo: [0.46, 0.58, 0.78] };   // hero light: gain 4.5, absorb 2.4, halo [0.34,0.48,0.72]

// Camera framing as functions of the aspect a (world frame above). Portrait additionally rolls the
// molecule about the view axis by rollFor(a) (applied by bootstrapZundel on the pivot).
export function zundelCamFor(cfg, fov = 32) {
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const tilt = THREE.MathUtils.degToRad(cfg.tilt), z = cfg.zoom || 1, full = cfg.framing === 'full';
  return {
    rollFor: a => (a < 1 && !full ? THREE.MathUtils.degToRad(cfg.rollPortrait) : 0),
    target: a => new THREE.Vector3(cfg.targetX || 0, a < 1 ? (full ? cfg.targetYPortraitFull : cfg.targetYPortrait) : cfg.targetY, 0),
    dir: new THREE.Vector3(0, Math.sin(tilt), Math.cos(tilt)),
    dist: a => z * (full
      ? (a < 1 ? cfg.halfWidthPortraitFull / (t * a * 0.96) : Math.max(cfg.halfWidthFull / (t * a * cfg.fillFull), cfg.halfHeightFull / (t * 0.9)))
      : (a < 1 ? cfg.halfLengthPortrait / (t * cfg.fillPortrait) : cfg.halfWidth / (t * Math.min(a, 2.2) * cfg.fill))),
  };
}

// Rigid transform molecule (Bohr, source frame) -> world frame described above.
export function moleculeFrame(mol, flip = 0, centre = 'core') {
  const A = mol.atoms_bohr.map(p => new THREE.Vector3(...p));
  const [p0, p1] = mol.pair, O = k => A[mol.waters[k][0]];
  const O1 = O(p0), O2 = O(p1), ex = O2.clone().sub(O1).normalize();
  const core = O1.clone().add(O2).multiplyScalar(0.5);
  const outer = mol.waters.map((w, k) => k).filter(k => k !== p0 && k !== p1);
  const om = outer.reduce((s, k) => s.add(O(k)), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, outer.length));
  const up = core.clone().sub(om); up.addScaledVector(ex, -up.dot(ex)).normalize();
  if (flip) up.negate();
  const ez = new THREE.Vector3().crossVectors(ex, up).normalize();
  const R = new THREE.Matrix4().makeBasis(ex, up, ez).transpose();     // rows = new axes
  // centre: middle of the bounding box of all nuclei in the new frame
  const P = A.map(p => p.clone().applyMatrix4(R));
  const lo = P.reduce((m, p) => m.min(p), P[0].clone()), hi = P.reduce((m, p) => m.max(p), P[0].clone());
  const c = lo.clone().add(hi).multiplyScalar(0.5); c.x = core.clone().applyMatrix4(R).x;
  if (centre === 'core') c.copy(core.clone().applyMatrix4(R));          // origin = donor O-O midpoint
  return new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z).multiply(R);
}

// Classical hydrogens: instanced small spheres, cluster-scene materials (dark: pale emissive grey-white;
// light: slate with a dark fresnel edge).
function classicalHydrogens(positions, radius) {
  const mat = new THREE.MeshStandardMaterial({ metalness: 0 });
  const edge = { value: 0 };
  mat.onBeforeCompile = sh => {
    sh.uniforms.uEdgeH = edge;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uEdgeH;')
      .replace('#include <fog_fragment>', 'gl_FragColor.rgb *= 1.0 - uEdgeH * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.0);\n#include <fog_fragment>');
  };
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(radius, 3), mat, positions.length);
  positions.forEach((p, i) => mesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(...p)));
  mesh.renderOrder = 0;
  mesh.setTheme = th => {
    const T = (CLUSTER_THEMES[th] || CLUSTER_THEMES.dark).hcore;
    mat.color.set(T.color); mat.emissive.set(T.emissive); mat.emissiveIntensity = T.emissiveIntensity; mat.roughness = T.roughness;
    edge.value = T.edge ?? 0;
  };
  return mesh;
}

const frontTint = c => ({ ...c.tint, diffAlpha: 0, base: c.frontTone ? c.frontDim : 0, alpha: c.frontDim, diff: c.tint.diff * 0.3 });

// Build the scene into an existing stage (stage.root = molecule frame, Bohr). Returns { update, setLook, ... }.
export async function buildZundel(stage, ds, cfg, { onVolumeProgress } = {}) {
  const m = ds.m, mol = m.molecule;
  const keys = Object.keys(m.surfaces).filter(k => k.startsWith(`electron_${cfg.iso}_`));
  if (!keys.length) throw new Error(`no baked water-star surfaces at iso ${cfg.iso}`);
  // proton volumes: H1 = the shared proton (always); datasets from all-quantum runs add H2..Hn (one per O-H proton)
  const vnames = Object.keys(m.volumes).sort((a, b) => +a.slice(1) - +b.slice(1));
  const [surfs, ...vols] = await Promise.all([Promise.all(keys.map(k => ds.surface(k))), ...vnames.map(n => ds.volume(n, { onProgress: onVolumeProgress }))]);
  const vol = vols[0];
  const shells = [];
  for (const s of surfs) {
    const back = new StarSurface(s, { style: 'glass', side: THREE.BackSide, tint: cfg.tint, gain: cfg.shellGain });
    const front = new StarSurface(s, { style: 'glass', side: THREE.FrontSide, tint: frontTint(cfg), gain: cfg.shellGain });
    back.mesh.renderOrder = 1; front.mesh.renderOrder = 4;
    stage.root.add(back.mesh, front.mesh); shells.push(back, front);
  }
  // nuclei: 4 oxygens (hero spheres + glow), 8 classical hydrogens; the quantum proton has no sphere
  const oxygens = [], hpos = [];
  // classical-H spheres for every H except the shared proton; in an all-quantum dataset they exist (same instance
  // layout, for zundel_transition) but are hidden: those protons are drawn as density volumes instead
  const shared = mol.shared_qp_atom ?? mol.qp_atoms[0];
  mol.symbols.forEach((s, i) => {
    if (s === 'O') { const o = createOxygen(THREE, cfg.oxygenRadius, cfg.oxygenGlow); o.position.set(...mol.atoms_bohr[i]); stage.root.add(o); oxygens.push(o); }
    else if (i !== shared) hpos.push(mol.atoms_bohr[i]);
  });
  const hyd = classicalHydrogens(hpos, cfg.hRadius); stage.root.add(hyd);
  hyd.visible = vols.length === 1;
  const C = m.frames.proton_centroid_bohr.H1;
  const proton = new ProtonVolume(stage.renderer, vol, {
    isos: WATER_PROTON_ISOS, tf: 'cloud', step: cfg.step, upsample: cfg.upsample, cullRadius: cfg.cull,
    gain: cfg.gain, absorb: cfg.absorb, oxygenRadius: cfg.oxygenRadius, centers: C,
    cloud: { gamma: cfg.gamma, lit: cfg.lit, contour: cfg.contour, shadow: cfg.shadow, direct: cfg.direct, halo: cfg.halo, core: cfg.core } });
  proton.mesh.renderOrder = 2; stage.root.add(proton.mesh);
  // analytic ray termination at the nearest oxygen (never reached in practice: the cloud stays > 1.6 Bohr away)
  const nearOf = c => { const v = new THREE.Vector3(...c); return oxygens.map(o => o.position).sort((a, b) => a.distanceTo(v) - b.distanceTo(v))[0].toArray(); };
  const nearO = nearOf(C[0]);
  // the other quantum protons (all-quantum datasets): same transfer function, same absolute 50/90/99 % reference
  // densities (WATER_PROTON_ISOS) and look as the shared one, so equal density renders equally bright everywhere
  const satellites = vnames.slice(1).map((n, k) => {
    const Cn = m.frames.proton_centroid_bohr[n];
    const p = new ProtonVolume(stage.renderer, vols[k + 1], {
      // empty-space skip: these clouds are below the 0.02 au display gate beyond 0.64 Bohr of their centroid in every
      // baked frame (all9), so 0.72 (not the shared cloud's 1.0) is lossless and marches ~37 % of the volume
      isos: WATER_PROTON_ISOS, tf: 'cloud', step: cfg.step, upsample: cfg.upsample, cullRadius: cfg.cullSat ?? 0.72,
      gain: cfg.gain, absorb: cfg.absorb, oxygenRadius: cfg.oxygenRadius, centers: Cn,
      cloud: { gamma: cfg.gamma, lit: cfg.lit, contour: cfg.contour, shadow: cfg.shadow, direct: cfg.direct, halo: cfg.halo, core: cfg.core } });
    p.mesh.renderOrder = 2; stage.root.add(p.mesh);
    p.name = n; p.atom = m.volumes[n].atom; p.nearO = nearOf(Cn[0]);
    return p;
  });
  const protons = [proton, ...satellites];
  // (syncSliceUniform no longer needed: this page copy of proton_field.js resets uZ itself)

  function setLook(c) {
    const setTint = (surf, t, gain) => {
      const u = surf.uniforms;
      if (t.color) u.uColor.value.setRGB(...t.color); if (t.rim) u.uRim.value.setRGB(...t.rim);
      for (const [k, n] of [['base', 'uBase'], ['diff', 'uDiff'], ['diffAlpha', 'uDiffAlpha'], ['alpha', 'uAlpha'], ['rimGain', 'uRimGain'],
        ['rimAlpha', 'uRimAlpha'], ['rimPow', 'uRimPow'], ['spec', 'uSpec'], ['shin', 'uShin'], ['backGain', 'uBackGain']]) if (t[k] != null) u[n].value = t[k];
      if (gain != null) u.uGain.value = gain;
    };
    shells.forEach((s, i) => setTint(s, i % 2 ? frontTint(c) : c.tint, c.shellGain));
    for (const p of protons) {
      const u = p.uniforms;
      u.uProtonGain.value = c.gain; u.uProtonAbsorb.value = c.absorb; u.uLitAmt.value = c.lit; u.uShadow.value = c.shadow;
      if (c.halo) u.uHaloCol.value.setRGB(...c.halo); if (c.core) u.uCoreCol.value.setRGB(...c.core);
    }
    for (const o of oxygens) {
      o.material.color.setHex(c.oxygenColor ?? 0xb3121c);
      const glow = o.userData.glow;
      if (glow) {
        glow.material.uniforms.uGain.value = c.oxygenGlow; glow.material.uniforms.uLight.value = c.oxygenLight;
        glow.material.blending = c.oxygenLight ? THREE.NormalBlending : THREE.AdditiveBlending; glow.material.needsUpdate = true;
      }
    }
    hyd.setTheme(c.theme);
    stage.setTone({ ...c.tone, bloom: c.bloom });
  }
  setLook(cfg);
  // Extent points (molecule frame, Bohr) for frame-fitting the camera: every glass vertex at its largest radius over
  // the baked frames (every 2nd vertex), plus a 0.7 Bohr shell around each proton centroid (the clouds poke through
  // the glass at the O-H tips).
  const ext = [];
  for (const sf of surfs) {
    const { meta, rgba, nv, centers, keys } = sf, dirs = icosphere(meta.ico_level).dirs, nf = meta.nframes;
    const c = meta.center_bohr || centers[keys[0]];
    for (let v = 0; v < nv; v += 2) {
      let r8 = 0, cut = 0;
      for (let f = 0; f < nf; f++) { r8 = Math.max(r8, rgba[(f * nv + v) * 4]); cut = Math.max(cut, rgba[(f * nv + v) * 4 + 3]); }
      if (cut > 127) continue;   // seam vertices on the cut planes are drawn transparent
      const r = meta.rmin + (meta.rmax - meta.rmin) * r8 / 255;
      ext.push(c[0] + dirs[3 * v] * r, c[1] + dirs[3 * v + 1] * r, c[2] + dirs[3 * v + 2] * r);
    }
  }
  const shell = icosphere(1).dirs;
  for (const n of vnames) for (const c of m.frames.proton_centroid_bohr[n]) for (let i = 0; i < shell.length; i += 3)
    ext.push(c[0] + shell[i] * 0.7, c[1] + shell[i + 1] * 0.7, c[2] + shell[i + 2] * 0.7);
  return {
    extent: new Float32Array(ext),
    // volumes = the time-resolved ones (streaming limit; [0] = shared proton); static single-frame volumes excluded
    setLook, volumes: vols.filter((v, k) => k === 0 || v.meta.nframes > 1), allVolumes: vols, shells, proton, satellites, protons, oxygens, hydrogens: hyd,
    gpuBytes: [...shells, ...protons].reduce((s, p) => s + (p.gpuBytes || 0), 0),
    update(frame, keyDir) {
      for (const s of shells) s.update(frame, keyDir);
      proton.update(frame, nearO, keyDir);
      for (const p of satellites) p.update(frame, p.nearO, keyDir);
    },
  };
}

// Stand-alone page bootstrap (proto_zundel): stage, dataset, molecule frame, camera presets, clock, drift.
export async function bootstrapZundel(cfg, { data, canvas = null, play = true, frame = null } = {}) {
  const stage = createStage({ ...stageOptionsFor(cfg), canvas });
  stage.start();
  // ?data= takes a dataset alias (ZUNDEL_DATA: tz, dz) or a path (../data/<name>)
  const q = params.get('data');
  const ds = await loadDataset((q && (ZUNDEL_DATA[q] || q)) || data);
  const pivot = new THREE.Group(); stage.scene.add(pivot); pivot.add(stage.root);
  stage.root.matrixAutoUpdate = false;
  stage.root.matrix.copy(moleculeFrame(ds.m.molecule, cfg.flip, cfg.framing === 'full' ? 'bbox' : 'core')); stage.root.updateMatrixWorld(true);
  stage.pivot = pivot;
  const cam = zundelCamFor(cfg, stage.camera.fov);
  stage.controls.maxDistance = 120;
  stage.presets = [{ name: 'zundel', ...cam }];
  let onReframe = () => {};
  const frameIt = () => { pivot.rotation.z = cam.rollFor(stage.camera.aspect); pivot.updateMatrixWorld(true); stage.setCamera(0); onReframe(); };
  frameIt();
  addEventListener('resize', () => { if (!stage.disposed && !stage.userMoved) frameIt(); });
  stage.controls.addEventListener('start', () => { stage.userMoved = true; });

  const L = getLoop();
  const tl = new Timeline(ds.frameCount, { framesPerSecond: num('speed', ds.m.playback_fps ?? 12),
    mode: L.periodic ? 'periodic' : 'pingpong', period: L.period || ds.frameCount });
  if (frame != null) tl.set(frame);
  tl.playing = play;

  // idle drift (as water hero): slow figure-of-eight about the preset view, paused while the user drags
  const drift = { on: !!cfg.drift && frame == null, t: 0, base: null, active: true };
  const resetDrift = () => { drift.base = stage.camera.position.clone().sub(stage.controls.target); drift.t = 0; };
  resetDrift(); onReframe = resetDrift; let idle;
  stage.controls.addEventListener('start', () => { drift.active = false; clearTimeout(idle); });
  stage.controls.addEventListener('end', () => { idle = setTimeout(() => { resetDrift(); drift.active = true; }, 6000); });
  stage.onFrame(dt => {
    if (!drift.on || !drift.active || stage.cameraLocked) return;
    drift.t += dt;
    const yaw = 0.16 * Math.sin(2 * Math.PI * drift.t / 26) * Math.min(1, drift.t / 4);
    const pitch = 0.06 * Math.sin(2 * Math.PI * drift.t / 17) * Math.min(1, drift.t / 4);
    const v = drift.base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    v.applyAxisAngle(new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), v).normalize(), pitch);
    stage.camera.position.copy(stage.controls.target).add(v);
  });

  const scene = await buildZundel(stage, ds, cfg);
  const vols = scene.volumes;
  stage.onFrame(dt => {
    const total = ds.frameCount, have = Math.min(...vols.map(v => v.loaded));
    tl.limit = have >= total ? null : Math.max(0, have - 3);
    tl.tick(dt);
    scene.update(tl.frame, stage.keyDirWorld);
  });
  stage.metrics.gpuBytes = scene.gpuBytes;
  stage.metrics.loadMs = performance.now();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  stage.ready = true;
  const app = window.__app = {
    stage, tl, ds, scene, cfg, reframe: () => frameIt(),   // reframe: page copy (zundel-scene.js calls it on canvas resize)
    setFrame: f => tl.set(f), play: () => { tl.fixed = null; tl.playing = true; }, pause: () => { tl.playing = false; },
    setCamera: i => stage.setCamera(i), renderInfo: () => stage.renderer.info,
    setTheme(th) { const L = th === 'light' ? 'light' : 'dark'; const c = { ...cfg, ...sceneConfig(L), ...(L === 'light' ? LIGHT_PROTON : {}), theme: L, haze: 0, hazeGain: 0 }; app.cfg = c; scene.setLook(c); },
  };
  return app;
}
