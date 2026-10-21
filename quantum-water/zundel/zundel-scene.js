// Proton sharing in the protonated water tetramer H9O4+ (all nine protons quantum), embedded on
// /research/quantum-water/. Loaded on demand by zundel.js; three.js comes from the hero's vendor folder
// through the page's import map. Scene code: lib/zundel_scene.js (same as claude/render/common, plus the
// proton_field.js uZ fix), data: data/zundel_all9_loop (41 frames, ping-pong, 12 fps).
import * as THREE from 'three';
import { zundelConfig, bootstrapZundel } from './lib/zundel_scene.js';
import { stats } from './lib/data.js';

// Camera fit (replaces the proto's fixed medium close-up, which cropped the outer waters): the whole tetramer
// (glass envelope of all four waters at its largest over the loop, plus a 0.7 Bohr shell around every proton
// centroid) fits inside `fill` of the box on every aspect, with room left for the idle drift. The look-at stays near
// the shared-proton axis (sideways shift at most maxShiftX Bohr, used only when it lets the camera come closer) and
// its height centres the vertical extent. In the near-square phone box the fit is width-limited (the four waters
// form a wide arch), so the camera is turned 20 deg about the vertical (yawSquare): the arch foreshortens and the
// central pair comes out ~14 % larger. Raising the elevation (tiltSquare) was tried and does not help; 16 deg as on
// desktop. Both angles blend linearly between the phone box (aspect 1.1) and 16:9.
export const FIT = { fill: 0.88, tiltWide: 16, tiltSquare: 16, fov: 32, maxShiftX: 0.8, yawWide: 0, yawSquare: -20 };
function fitFor(extentWorld, aspect, { fill, tiltWide, tiltSquare, fov, maxShiftX, yawWide, yawSquare }) {
  const k = Math.min(1, Math.max(0, (aspect - 1.1) / (16 / 9 - 1.1)));
  const tilt = THREE.MathUtils.degToRad(tiltSquare + (tiltWide - tiltSquare) * k);
  const yaw = THREE.MathUtils.degToRad(yawSquare + (yawWide - yawSquare) * k);
  const z = new THREE.Vector3(Math.sin(yaw) * Math.cos(tilt), Math.sin(tilt), Math.cos(yaw) * Math.cos(tilt));
  const x = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), z).normalize(), y = new THREE.Vector3().crossVectors(z, x);
  const tY = Math.tan(THREE.MathUtils.degToRad(fov / 2)) * fill, tX = tY * aspect, P = extentWorld, n = P.length / 3;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) { lo = Math.min(lo, P[3 * i + 1]); hi = Math.max(hi, P[3 * i + 1]); }
  // camera distance needed for the look-at (tx, ty): per point, D >= |x_cam| / tX + depth (and the same for y)
  const need = (ty, tx = 0, axes = 3) => {
    let D = 0;
    for (let i = 0; i < n; i++) {
      const qx = P[3 * i] - tx, qy = P[3 * i + 1] - ty, qz = P[3 * i + 2];
      const xc = qx * x.x + qy * x.y + qz * x.z, yc = qx * y.x + qy * y.y + qz * y.z, sc = qx * z.x + qy * z.y + qz * z.z;
      D = Math.max(D, Math.max(axes & 1 ? Math.abs(xc) / tX : 0, axes & 2 ? Math.abs(yc) / tY : 0) + sc);
    }
    return D;
  };
  const golden = (f, a, b) => {            // 1-D minimum of a unimodal function on [a, b]
    for (let it = 0; it < 32; it++) { const m1 = a + (b - a) * 0.382, m2 = a + (b - a) * 0.618; if (f(m1) < f(m2)) b = m2; else a = m1; }
    return (a + b) / 2;
  };
  // height: centre the vertical extent (vertical constraint only; with both axes the optimum is flat whenever the
  // width limits, and the search then parked the molecule at the bottom). Sideways: a shift of at most maxShiftX
  // Bohr, only if it lets the camera come closer (tiny pull towards 0 keeps the shared proton centred otherwise).
  let ty = golden(t => need(t, 0, 2), lo, hi);
  const tx = golden(t => need(ty, t) + 1e-3 * Math.abs(t), -maxShiftX, maxShiftX);
  ty = golden(t => need(t, tx, 2), lo, hi);
  return { target: new THREE.Vector3(tx, ty, 0), dir: z, dist: need(ty, tx), tilt: THREE.MathUtils.radToDeg(tilt), yaw: THREE.MathUtils.radToDeg(yaw) };
}

const DATA = new URL('./data/zundel_all9_loop', import.meta.url).pathname;
export const MID_SWING = 20.5;          // poster frame: shared proton halfway between the two oxygens

// bytes / files loaded so far (data.js counters; the loader's progress bar and ?qwdebug=1 read them)
export const loadStats = () => stats;

// start(): build the scene on `canvas` (a fresh canvas per call: a lost context cannot be revived on the old one).
// onLost(): the WebGL context was lost (iOS discards background tabs' contexts); the loader rebuilds.
// onError(msg): non-fatal problems (shader compile/link logs) for ?qwdebug=1.
export async function start({ root, canvas, theme, reduced, play = true, onLost = () => {}, onError = () => {} }) {
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); onLost(e); });
  const cfg = zundelConfig(theme, {
    drift: !reduced,
    // all nine clouds cost ~19 ms/frame at DPR 2 on an M4 Pro: cap at 1.5 for this inline figure
    stage: { canvas, transparent: true, pageScroll: true, dprCap: 1.5 },
  });
  const app = await bootstrapZundel(cfg, { data: DATA, canvas, play });
  const { stage, tl } = app;
  stage.renderer.debug.onShaderError = (gl, prog, vs, fs) => {
    const log = [gl.getProgramInfoLog(prog), gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs)].filter(Boolean).join(' | ');
    onError('shader: ' + log.slice(0, 300));
  };
  if (stage.renderer.getContext().isContextLost()) throw new Error('WebGL context lost during load');
  stage.controls.enableZoom = false;      // drag to orbit only; the page keeps the wheel and pinch
  tl.t = MID_SWING / tl.fps;              // start on the poster frame, so the cross-fade does not jump

  // frame-fit camera preset: extent points to world once (molecule frame -> world; boxes are landscape, no roll)
  stage.camera.fov = FIT.fov; stage.camera.updateProjectionMatrix();
  stage.root.updateMatrixWorld(true);
  const E = app.scene.extent, W = new Float32Array(E.length), v = new THREE.Vector3();
  for (let i = 0; i < E.length; i += 3) { v.set(E[i], E[i + 1], E[i + 2]).applyMatrix4(stage.root.matrixWorld); W[i] = v.x; W[i + 1] = v.y; W[i + 2] = v.z; }
  let cache = null;
  const fit = a => (cache && cache.a === a ? cache.f : (cache = { a, f: fitFor(W, a, FIT) }).f);
  stage.presets[0] = { name: 'zundel-fit', get dir() { return fit(stage.camera.aspect).dir; }, target: a => fit(a).target, dist: a => fit(a).dist };
  stage.controls.maxDistance = 200;
  app.fit = () => fit(stage.camera.aspect);
  app.refit = o => { Object.assign(FIT, o); cache = null; stage.setCamera(0); return app.fit(); };   // review hook
  // re-frame (new preset, drift re-based) now and whenever the canvas changes size: a fresh canvas can settle its
  // layout size after this point (seen in WebKit), and window 'resize' alone missed that
  app.reframe();
  const ro = new ResizeObserver(() => { if (!stage.disposed && !stage.userMoved) app.reframe(); });
  ro.observe(canvas);

  // off-screen or hidden tab: no GPU work at all
  let onScreen = true;
  const park = () => { stage.paused = !onScreen || document.hidden; };
  const io = new IntersectionObserver(es => { onScreen = es[es.length - 1].isIntersecting; park(); });
  io.observe(root);
  document.addEventListener('visibilitychange', park);

  const gl = stage.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    app, canvas,
    gl: ext ? `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)} / ${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}` : gl.getParameter(gl.RENDERER),
    setTheme: t => app.setTheme(t),
    play: () => app.play(),
    pause: () => app.pause(),
    get playing() { return app.tl.playing; },
    get onScreen() { return onScreen; },
    get frames() { return stage.metrics.frames; },
    get fps() { return stage.metrics.fps; },
    get lost() { return gl.isContextLost(); },
    destroy() { io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', park); stage.dispose(); },
  };
}
