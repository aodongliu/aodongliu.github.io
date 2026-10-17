// Bootstrap shared by all prototypes: dataset, molecular frame, oxygen, clock, camera, test hooks.
import * as THREE from 'three';
import { createStage, createOxygen, defaultPresets, params, num, lerp3 } from './stage.js';
import { loadDataset, bracket, getLoop, stats } from './data.js';
import { Timeline } from './timeline.js';

export const DATA = params.get('data') || '../data/codex_stretch';

export async function bootstrap(build, stageOptions, opt = {}) {
  const stage = createStage(stageOptions);
  stage.start();                                   // backdrop renders immediately
  const ds = await loadDataset(params.get('data') || opt.data || DATA);
  const F = ds.m.frames, O = F.oxygen_bohr, H1 = F.proton_centroid_bohr.H1, H2 = F.proton_centroid_bohr.H2;
  const center = [0, 1, 2].map(k => (O[0][k] + H1[0][k] + H2[0][k]) / 3);
  stage.root.position.set(-center[0], -center[1], -center[2]);
  if (opt.orient) {   // art-directed molecule orientation (deg), about the molecular centre
    const pivot = new THREE.Group(); stage.scene.add(pivot); pivot.add(stage.root);
    const [rx, ry, rz] = opt.orient.map(d => THREE.MathUtils.degToRad(d));
    pivot.rotation.set(rx, ry, rz, 'ZXY');
    pivot.updateMatrixWorld(true); stage.pivot = pivot;
  }
  const oxygenRadius = num('oradius', opt.oxygenRadius ?? 0.5);
  const oxygen = createOxygen(THREE, oxygenRadius, num('oglow', opt.oxygenGlow ?? 0)); stage.root.add(oxygen); stage.oxygen = oxygen;
  stage.presets = opt.presets ? opt.presets(stage.root, center, F) : defaultPresets(stage.root, center, H1[0]);
  stage.setCamera(num('cam', 0));

  const L = getLoop();
  const tl = new Timeline(ds.frameCount, { framesPerSecond: num('speed', ds.m.playback_fps ?? 30),
    mode: params.get('mode') || (L.periodic ? 'periodic' : 'pingpong'), period: L.period || ds.frameCount });
  if (params.has('frame')) tl.set(num('frame', 0));
  const allFrames = [...Array(ds.frameCount).keys()];

  const auto = num('autorotate', params.has('frame') || opt.drift || opt.autorotate === false ? 0 : 1) > 0;
  if (opt.speedScale) tl.fps *= opt.speedScale;
  // Idle camera drift: a slow figure-of-eight around the preset view so the 3D form reads before
  // anyone drags. Pauses on interaction; resumes 6 s later from wherever the user left the camera.
  const drift = { on: num('drift', opt.drift && !params.has('frame') ? 1 : 0) > 0, t: 0, base: null };
  const resetDrift = () => { drift.base = stage.camera.position.clone().sub(stage.controls.target); drift.t = 0; };
  resetDrift();
  let driftIdle;
  stage.controls.addEventListener('start', () => { drift.active = false; clearTimeout(driftIdle); });
  stage.controls.addEventListener('end', () => { driftIdle = setTimeout(() => { resetDrift(); drift.active = true; }, 6000); });
  drift.active = drift.on;
  stage.onFrame(dt => {
    if (!drift.on || !drift.active || stage.cameraLocked) return;   // cameraLocked: an external driver owns the camera
    drift.t += dt;
    const yaw = 0.21 * Math.sin(2 * Math.PI * drift.t / 26) * Math.min(1, drift.t / 4);
    const pitch = 0.07 * Math.sin(2 * Math.PI * drift.t / 17) * Math.min(1, drift.t / 4);
    const v = drift.base.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), v).normalize();
    v.applyAxisAngle(right, pitch);
    stage.camera.position.copy(stage.controls.target).add(v);
  });
  stage.controls.autoRotate = auto; stage.controls.autoRotateSpeed = 0.35;
  let idle; stage.controls.addEventListener('start', () => { stage.controls.autoRotate = false; clearTimeout(idle); });
  stage.controls.addEventListener('end', () => { if (auto) idle = setTimeout(() => (stage.controls.autoRotate = true), 6000); });

  const scene = await build({ stage, ds, oxygenRadius });
  const oxy = () => { const { a, b, w } = bracket(allFrames, tl.frame); return lerp3(O[a], O[b], w); };
  const vols = scene.volumes || [];
  stage.onFrame(dt => {
    // streaming: hold the play head inside the frames that have arrived (CR needs i+2)
    const total = ds.frameCount, have = vols.length ? Math.min(...vols.map(v => v.loaded)) : total;
    tl.limit = have >= total ? null : Math.max(0, have - 3);
    tl.tick(dt);
    const o = oxy(); oxygen.position.set(...o);
    scene.update(tl.frame, o, stage.keyDirWorld);
  });
  stage.metrics.gpuBytes = scene.gpuBytes || 0;
  stage.metrics.loadMs = performance.now();   // ms since navigation start, data decoded + scene built
  // Wait one compiled frame before declaring readiness (shader compile is part of startup).
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  stage.ready = true;
  window.__app = {
    stage, tl, ds, scene,
    setFrame: f => tl.set(f), play: () => { tl.fixed = null; tl.playing = true; },
    setCamera: i => stage.setCamera(i), renderInfo: () => stage.renderer.info,
  };
  document.documentElement.dataset.ready = '1';
  return window.__app;
}
