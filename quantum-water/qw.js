// Quantum water hero: loader (no three.js here). Decides if/when to start the 3D scene and keeps
// it in sync with the site's theme toggle.
//  - poster (CSS background, per theme) is the first paint; three.js + data load only after the
//    page is interactive, the browser is idle and the band is on screen
//  - no WebGL2 / save-data: poster only
//  - prefers-reduced-motion: no drift, very slow playback (0.25x); still rotatable
//  - coarse pointer / small screens: mobile profile (DPR cap 2, no MSAA, half-res bloom, coarser ray step)
//  - theme: <html data-theme> (MutationObserver), else prefers-color-scheme; switches live
const root = document.querySelector('.qw');
const canvas = root && root.querySelector('.qw-canvas');

const themeNow = () => {
  const t = document.documentElement.dataset.theme;
  if (t === 'light' || t === 'dark') return t;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function capable() {
  if (navigator.connection && navigator.connection.saveData) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
}
// "after the page is interactive": DOMContentLoaded + an idle slot (not window.load, which waits
// for every image on the homepage and cost ~2.5 s at 20 Mbps in the preview)
const idle = () => new Promise(r => {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(r, { timeout: 600 }) : setTimeout(r, 100));
  document.readyState !== 'loading' ? go() : addEventListener('DOMContentLoaded', go, { once: true });
});
const visible = el => new Promise(r => {
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); r(); } }, { rootMargin: '200px' });
  io.observe(el);
});

if (root && canvas && capable()) {
  const profile = {
    mobile: matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 700,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
  window.__qwTimeline = { start: performance.now() };
  Promise.all([idle(), visible(root)])
    .then(() => { window.__qwTimeline.importStart = performance.now(); return import('./qw-scene.js'); })
    .then(m => m.start({ root, canvas, theme: themeNow(), ...profile }))
    .then(scene => {
      window.__qwTimeline.live = performance.now(); window.__qw = scene;
      const sync = () => scene.setTheme(themeNow());
      new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
    })
    .catch(err => console.warn('[quantum-water] staying on poster:', err));
}
