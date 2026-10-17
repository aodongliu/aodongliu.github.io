// Quantum water homepage hero.
//   stage 1: the single molecule (approved look; named sets 'light' / 'dark' follow the site theme)
//   stage 2: pull-back into the computed (H2O)n droplet (common/cluster_scene.js, the cluster agent's module)
// One parameter t in [0,1] drives the transition. The hero owns canvas, renderer, proton timeline and t:
//   - t follows scroll progress through the (sticky) hero section, eased;
//   - "Zoom out / Zoom in" scrolls to either end of that range;
//   - one-time gentle autoplay: after ~5 s at the top with no interaction, t 0 -> 1 (7 s), hold (4 s),
//     back to 0 (5 s), then never again; cancelled by any scroll, pointer, wheel or key. Not with reduced motion.
import { bootstrap } from './lib/app.js';
import { LOOKS, sceneConfig, buildFor, stageOptionsFor, appOptionsFor, heroCamFor } from './lib/water_scene.js';

const DATA = new URL('./data/v2_pv5z_loop', import.meta.url).pathname;
const CLUSTER = new URL('./data/water250.bin', import.meta.url).href;
const lookFor = (root, t) => (t === 'dark' ? root.dataset.darkLook || 'dark' : root.dataset.lightLook || 'light');
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const AUTO = { wait: 5, out: 7, hold: 4, back: 5 };     // seconds
const PORTRAIT_END = { fill: 0.80 };                   // phone end state: droplet ~80 % of the stage width
// portrait look-at = the molecule's visual centre, so it sits centred in the stage (qw.css reserves the
// caption block below the stage on phones; nothing is drawn under the captions)
const TALL = { targetX: -0.1, targetY: -0.42 };
const WIDE = { dist: 10.5, targetX: -0.1, targetY: -0.7 };             // landscape camera (bohr), see over.wide

export async function start({ root, canvas, theme, mobile, reduced }) {
  const device = mobile ? { step: 0.03, stage: { canvas, transparent: true, pageScroll: true, dprCap: 2, msaa: 0, bloomHalf: true } }
                        : { stage: { canvas, transparent: true, pageScroll: true, dprCap: 2 } };
  // dist 6.6, look-at slightly below the molecule (proto pages: 5.8 / 0.45): room for the captions
  // wide: landscape framing for the capped desktop band (qw.css): the whole molecule (glass shell and
  // proton clouds) at ~60 % of the box height, riding a little high, clear of the captions
  // A short phone (stage wider than tall, e.g. 390x550) takes the landscape branch, but its stage ends
  // above the captions: centre the molecule there too instead of riding high like on desktop.
  const stageEl = root.querySelector('.qw-stage');
  const capsBelow = () => parseFloat(getComputedStyle(stageEl).bottom) > 0;
  const wide = { ...WIDE, get targetY() { return capsBelow() ? TALL.targetY : WIDE.targetY; } };
  const over = { drift: !reduced, dist: 6.6, targetY: 0.15, wide, tall: TALL, ...device };
  // The faint outer electron haze is off by default (LOOKS gain 0) and then not even downloaded.
  // Review switch: ?qwhaze=1 restores the previous dark-mode haze (gain 0.12); ?qwhaze=<g> sets gain g in
  // both looks. Set on the named looks themselves: the cluster module re-reads sceneConfig(theme) and
  // drives the hero's shell/haze gains every frame, so a per-call override would be undone.
  const qp = new URLSearchParams(location.search);
  if (qp.has('qwhaze')) {
    const g = parseFloat(qp.get('qwhaze')) || 0;
    if (g === 1) LOOKS.dark.haze.gain = 0.12; else for (const k of ['dark', 'light']) LOOKS[k].haze.gain = g;
  }
  if (!LOOKS.dark.haze.gain && !LOOKS.light.haze.gain) over.haze = 0;
  const cfg = sceneConfig(lookFor(root, theme), over);
  const app = await bootstrap(buildFor(cfg), stageOptionsFor(cfg),
    { ...appOptionsFor(cfg, DATA), speedScale: reduced ? 0.25 : 1, autorotate: false });
  const { stage, scene, tl, ds } = app;
  root.classList.add('is-live');
  let curTheme = theme;

  // off-screen / hidden tab: no GPU work at all
  let onScreen = true;
  new IntersectionObserver(es => { onScreen = es[0].isIntersecting; stage.paused = !onScreen || document.hidden; }).observe(root);
  document.addEventListener('visibilitychange', () => { stage.paused = !onScreen || document.hidden; });

  // ---- stage 2 ---------------------------------------------------------------------------------
  const cap1 = root.querySelector('.qw-cap-1'), cap2 = root.querySelector('.qw-cap-2'), btn = root.querySelector('.qw-toggle');
  const sticky = root.querySelector('.qw-sticky');
  const scrub = () => Math.max(1, root.offsetHeight - sticky.offsetHeight);
  // the sticky box may park below the viewport top (desktop: vertically centred, qw.css): t starts
  // when it sticks, i.e. when the section top reaches `stickTop` px below the viewport top
  const stickTop = () => parseFloat(getComputedStyle(sticky).top) || 0;
  const top = () => root.getBoundingClientRect().top + scrollY - stickTop();
  const scrollT = () => Math.min(1, Math.max(0, (scrollY - top()) / scrub()));
  let scale = null, t = 0, count = null;
  const counter = root.querySelector('.qw-count');
  try {
    const { createClusterScene, PROVENANCE, FRAME } = await import('./lib/cluster_scene.js');
    // capped desktop band: end droplet ~65 % of the box height (module default 0.80 -> ~72 %), so it
    // matches the molecule's ~60 % and clears the end caption. Portrait: a larger droplet (the module
    // centres it in the stage, which on phones ends above the caption block).
    if (FRAME) { FRAME.fill = 0.72; FRAME.fillPortrait = PORTRAIT_END.fill; }
    const H = heroCamFor(cfg);
    scale = createClusterScene({ n: 250, url: CLUSTER,
      heroCam: a => ({ target: H.target(a), dir: H.dir.clone().normalize(), dist: H.dist(a) }) });
    await scale.init(stage, { root: stage.root, ds });
    // End caption carries the HPC message; numbers come from the cluster module's PROVENANCE (the paper).
    // MPI ranks are only documented for the (H2O)250 run, so every device shows the 250-molecule droplet.
    const n = scale.n, ranks = (/on (\d+) MPI ranks/.exec(PROVENANCE.calculation) || [])[1];
    cap2.innerHTML = `(H<sub>2</sub>O)<sub>${n}</sub>: ${2 * n} quantum protons in one NEO calculation` +
      (ranks && n >= 250 ? `, run on ${ranks} MPI ranks.` : '.');
    // live counter during the pull-back: molecules revealed so far (from the module's reveal front)
    const dist = scale.view.dist, countOf = tt => { const f = scale.transition.frontAt(tt); let k = 0; for (let i = 0; i < n; i++) if (dist[i] <= f) k++; return Math.max(1, k); };
    count = tt => { const k = tt <= 0 ? 1 : countOf(tt); return `${k} molecule${k > 1 ? 's' : ''} · ${2 * k} quantum protons`; };
    btn.hidden = false;
    btn.addEventListener('click', () => { cancelAuto(); scrollTo({ top: top() + (t < 0.5 ? scrub() : 0), behavior: reduced ? 'auto' : 'smooth' }); });
    // skip the density ray-march once the transition has faded it out
    const heroUpdate = scene.update.bind(scene);
    scene.update = (...a) => { if (!scale.heroHidden) heroUpdate(...a); };
  } catch (err) { console.warn('[quantum-water] cluster stage unavailable, molecule only:', err); scale = null; }

  // One-time autoplay. Eligible once the hero stage is (almost) fully in view and still at t = 0 (works
  // for both placements: hero first, or hero below the intro, where the visitor scrolls to reach it).
  // Plays after AUTO.wait s without interaction; any interaction resets the idle timer before it starts
  // and cancels it (for good) once it has started; scrolling into the scrub range also ends it.
  let auto = reduced || !scale ? null : { idle: 0, clock: 0, started: false, done: false };
  const poke = () => { if (!auto || auto.done) return; if (auto.started) auto.done = true; else auto.idle = 0; };
  for (const ev of ['wheel', 'pointerdown', 'keydown', 'touchstart', 'scroll']) addEventListener(ev, poke, { passive: true });
  function autoT(dt) {
    if (!auto || auto.done || !onScreen) return null;
    if (scrollY > top() + 4) { if (auto.started) auto.done = true; return null; }
    const inView = sticky.getBoundingClientRect().top < stickTop() + 0.2 * innerHeight;
    if (!auto.started) { auto.idle = inView ? auto.idle + dt : 0; if (auto.idle < AUTO.wait) return null; auto.started = true; }
    auto.clock += dt;
    const c = auto.clock, { out, hold, back } = AUTO;
    if (c < out) return ss(0, 1, c / out);
    if (c < out + hold) return 1;
    if (c < out + hold + back) return 1 - ss(0, 1, (c - out - hold) / back);
    auto.done = true; return null;
  }
  function cancelAuto() { if (auto) auto.done = true; }


  stage.onFrame(dt => {
    if (!scale) return;
    const a = autoT(dt);
    const target = a != null ? a : scrollT();
    t += (target - t) * (a != null ? 1 : 1 - Math.exp(-dt * (reduced ? 30 : 7)));   // smooth wheel steps
    if (Math.abs(target - t) < 1e-4) t = target;
    stage.cameraLocked = t > 0;               // idle drift must not fight the transition camera
    scale.update(t, curTheme, dt, tl.frame);
    cap1.style.opacity = 1 - ss(0.12, 0.3, t); cap2.style.opacity = ss(0.85, 0.98, t);
    if (count && counter) {                   // fades in during the pull-back, hands over to the end caption
      const o = ss(0.22, 0.35, t) * (1 - ss(0.82, 0.92, t));
      counter.style.opacity = o; if (o > 0.01) counter.textContent = count(t);
    }
    cap2.setAttribute('aria-hidden', t < 0.85 ? 'true' : 'false');
    btn.textContent = t < 0.5 ? 'Zoom out' : 'Zoom in';
  });

  return {
    app, scale, get t() { return t; },
    scrollFor: tt => top() + tt * scrub(),   // page scroll position for transition value tt (tests, links)
    setTheme(th) { curTheme = th; scene.setLook(sceneConfig(lookFor(root, th), over)); },
  };
}
