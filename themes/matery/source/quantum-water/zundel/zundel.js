// Zundel figure on /research/quantum-water/: loader (no three.js here).
//  - the poster (CSS background, per theme, mid-swing frame) is the first paint
//  - the scene module and its 3.3 MB of data load only when the figure comes near the viewport; a 1-px bar at the
//    bottom of the figure shows the download and fades out when the scene is live
//  - module files are fetched with retries first (a failed import() is cached by the browser for that URL), then
//    imported; data requests retry inside data.js; a failed start retries twice with backoff, then a small retry
//    button appears: the poster is never silently final
//  - lost WebGL context (iOS discards background tabs' contexts), bfcache restore, or a stalled render loop: the
//    scene is rebuilt on a fresh canvas from the in-memory data (only GPU uploads)
//  - no WebGL2: poster + retry button;  prefers-reduced-motion: poster + play button, no drift
//  - theme follows <html data-theme> live (as the homepage hero's qw.js), else prefers-color-scheme
//  - ?qwdebug=1: a one-line state readout over the figure (for screenshots from a phone)
const root = document.querySelector('.qwz');
const btn = root && root.querySelector('.qwz-play');
const BASE = new URL('./', import.meta.url).href;
const MODULES = ['zundel-scene.js', ...['data', 'glsl', 'icosphere', 'proton_field', 'proton_volume', 'stage', 'star_surface', 'timeline', 'water_scene', 'zundel_scene'].map(n => `lib/${n}.js`)]
  .map(u => BASE + u).concat(['three.module.min.js', 'addons/controls/OrbitControls.js', 'addons/environments/RoomEnvironment.js',
    'addons/postprocessing/EffectComposer.js', 'addons/postprocessing/RenderPass.js', 'addons/postprocessing/UnrealBloomPass.js',
    'addons/postprocessing/OutputPass.js', 'addons/postprocessing/ShaderPass.js', 'addons/postprocessing/MaskPass.js', 'addons/postprocessing/Pass.js',
    'addons/shaders/CopyShader.js', 'addons/shaders/LuminosityHighPassShader.js', 'addons/shaders/OutputShader.js'].map(u => new URL('../vendor/' + u, BASE).href));
const DATA_BYTES = 3.27e6;
const ICON = {
  play: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>',
  retry: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const S = { stage: 'idle', tries: 0, lost: 0, rebuilds: 0, err: '', gl: '' };   // state, shown by ?qwdebug=1

const themeNow = () => {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};
function capable() {
  if (navigator.connection && navigator.connection.saveData) { S.err = 'save-data'; return false; }
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) { S.err = 'no WebGL2'; return false; }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    S.gl = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();   // free the probe's context slot
    return true;
  } catch (e) { S.err = 'WebGL2: ' + e.message; return false; }
}
const near = el => new Promise(r => {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); r(); } }, { rootMargin: '300px 0px' });
  io.observe(el);
});

if (root) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bar = document.createElement('div'); bar.className = 'qwz-bar'; bar.hidden = true; root.appendChild(bar);
  let mod = null, scene = null, busy = false, importFailed = false, autoTries = 0;

  // ---- button: play / pause (reduced motion), retry (failure, no WebGL) -------------------------------------
  const setBtn = kind => {
    if (!btn) return;
    btn.hidden = !kind; if (!kind) return;
    btn.dataset.kind = kind; btn.innerHTML = ICON[kind];
    btn.setAttribute('aria-label', { play: 'Play animation', pause: 'Pause animation', retry: 'Load animation again' }[kind]);
  };
  const syncBtn = () => { if (reduced && scene) setBtn(scene.playing ? 'pause' : 'play'); else if (scene) setBtn(null); };
  btn && btn.addEventListener('click', () => {
    const k = btn.dataset.kind;
    if (k === 'retry') { if (importFailed) { location.reload(); return; } autoTries = 0; go(); return; }
    if (!scene) { go(); return; }
    scene.playing ? scene.pause() : scene.play(); syncBtn();
  });

  // ---- progress bar ----------------------------------------------------------------------------------------
  let barTimer = 0;
  const showBar = on => {
    clearInterval(barTimer); bar.hidden = false;
    if (!on) { bar.style.transform = 'scaleX(1)'; bar.classList.add('is-done'); return; }
    bar.classList.remove('is-done');
    const tick = () => { const b = mod ? mod.loadStats().bytes : 0; bar.style.transform = `scaleX(${Math.max(0.02, Math.min(0.98, b / DATA_BYTES))})`; };
    tick(); barTimer = setInterval(tick, 150);
  };

  // ---- load + start ----------------------------------------------------------------------------------------
  async function importScene() {
    // warm the HTTP cache with retries: a module that fails inside import() stays failed for this page view
    for (let i = 0; ; i++) {
      const bad = (await Promise.all(MODULES.map(u => fetch(u).then(r => r.ok, () => false)))).filter(ok => !ok).length;
      if (!bad) break;
      S.err = `${bad} module file(s) failed`; if (i >= 3) break; await sleep(600 * 2 ** i);
    }
    try { return await import('./zundel-scene.js'); }
    catch (e) { S.err = 'import: ' + e.message; await sleep(1500); return import('./zundel-scene.js?r=' + Date.now()); }
  }
  function freshCanvas() {
    const old = root.querySelector('.qwz-canvas'), c = document.createElement('canvas');
    c.className = 'qwz-canvas'; old ? old.replaceWith(c) : root.querySelector('.qwz-poster').after(c);
    return c;
  }
  async function go() {
    if (busy) return; busy = true;
    let retry = false;
    try {
      if (!capable()) { S.stage = 'no-webgl'; setBtn('retry'); return; }
      setBtn(null); S.tries++;
      S.stage = 'importing'; showBar(true);
      try { mod ||= await importScene(); } catch (e) { importFailed = true; throw e; }
      S.stage = 'loading';
      scene = await mod.start({ root, canvas: freshCanvas(), theme: themeNow(), reduced, play: true, onLost, onError: m => { S.err = m; } });
      window.__qwz = scene; S.gl = scene.gl; S.stage = 'live'; if (!S.err.startsWith('shader')) S.err = '';
      root.classList.add('is-live'); showBar(false); syncBtn();
    } catch (err) {
      S.stage = 'failed'; S.err = String(err && err.message || err); console.warn('[zundel] staying on poster:', err);
      if (scene) { scene.destroy(); scene = null; }
      root.classList.remove('is-live'); clearInterval(barTimer); bar.hidden = true;
      if (!importFailed && autoTries++ < 2) retry = true; else setBtn('retry');
    } finally { busy = false; }
    if (retry) { await sleep(2000 * 3 ** (autoTries - 1)); go(); }     // 2 s, then 6 s
  }

  // ---- recovery: lost context, bfcache restore, stalled loop ---------------------------------------------------
  function rebuild(why) {
    if (busy) return;
    S.rebuilds++; S.err = why;
    if (scene) { scene.destroy(); scene = null; }
    root.classList.remove('is-live');            // poster, not a blank canvas, while rebuilding
    autoTries = 0; go();
  }
  function onLost() {
    S.lost++; S.stage = 'lost'; root.classList.remove('is-live');
    if (!document.hidden) setTimeout(() => { if (scene && scene.lost) rebuild('context lost'); }, 300);
  }
  const check = why => { if (scene && scene.lost) rebuild(why); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check('context lost (hidden)'); });
  addEventListener('pageshow', e => {
    if (!e.persisted) return;
    if (scene) check('context lost (bfcache)');
    else if (!busy && (S.stage === 'waiting' || S.stage === 'idle')) arm();   // observers may not survive the cache
  });
  // watchdog: on screen, visible, not parked, yet no new frames for 2.5 s -> rebuild
  let lastFrames = -1;
  setInterval(() => {
    if (!scene || S.stage !== 'live' || document.hidden || !scene.onScreen || scene.app.stage.paused) { lastFrames = -1; return; }
    const f = scene.frames;
    if (f === lastFrames) rebuild(scene.lost ? 'context lost' : 'render loop stalled');
    lastFrames = f;
  }, 2500);

  // ---- theme -------------------------------------------------------------------------------------------------
  const sync = () => scene && scene.setTheme(themeNow());
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);

  // ---- debug readout -----------------------------------------------------------------------------------------
  if (new URLSearchParams(location.search).get('qwdebug') === '1') {
    const d = document.createElement('div'); d.className = 'qwz-debug'; root.appendChild(d);
    setInterval(() => {
      const kb = mod ? Math.round(mod.loadStats().bytes / 1024) : 0;
      d.textContent = `${S.stage} · try ${S.tries} · ${kb} KB · fps ${scene ? scene.fps.toFixed(0) : '-'} · dpr ${scene ? scene.app.stage.renderer.getPixelRatio() : '-'}` +
        ` · lost ${S.lost} · rebuilt ${S.rebuilds} · ${S.gl || 'gl ?'}${S.err ? ' · ' + S.err : ''}`;
    }, 500);
  }
  window.__qwzState = S;

  // ---- go ----------------------------------------------------------------------------------------------------
  function arm() { S.stage = 'waiting'; near(root).then(() => { if (!scene && !busy) go(); }); }
  if (reduced) { S.stage = 'reduced'; if (capable()) setBtn('play'); else { S.stage = 'no-webgl'; setBtn('retry'); } }
  else arm();
}
