// Scale scene facade for the homepage hero: one water molecule (quantum proton densities) pulls back into
// the computed (H2O)n droplet. This file is the CONTRACT with the hero integration (claude/render/hero/).
//
//   import { createClusterScene } from '../common/cluster_scene.js';
//   const scale = createClusterScene({ n: 250 });            // options below
//   await scale.init(stage, { root: stage.root, ds });         // after bootstrap(): stage.root holds the hero
//   // every frame, AFTER the hero's own update (register the callback after bootstrap returns):
//   stage.onFrame(dt => scale.update(t, theme, dt, app.tl.frame));
//   scale.dispose();                                           // restores the hero exactly as it was
//
//   t      0 = untouched single-molecule hero (this module draws/changes nothing, camera left alone);
//          (0,1] = pull-back; 1 = whole droplet framed, slow camera orbit. Drive with scroll progress
//          through the hero section (eased), or autoplay; see proto_cluster/main.js for both.
//   theme  'dark' | 'light'. The integrator switches the HERO look (water_scene setLook); this module follows
//          for the cluster materials, the fade baselines and the depth-fog colour (read from the renderer's
//          current tone mapping, so it is correct for ACES/dark and Neutral/light, transparent or not).
//   ownership: while t > 0 this module owns the camera and disables stage.controls (it re-enables them when
//          t returns to 0). The pull-back starts from the live camera pose captured at t = 0, so drags,
//          drift and auto-rotate before scrolling are continuous. Drags at t > 0 orbit the droplet
//          (options.interactive). Skip the hero's density update when scale.heroHidden is true (saves GPU).
//
// Options: { n = 250 (25..250, snapped to the published sizes), url = cluster binary (default
//   proto_cluster/data/water250.bin), hbonds = true, interactive = true, heroCam = aspect => ({target, dir,
//   dist}) fallback framing, hero = forced cluster molecule index }.
import * as THREE from 'three';
import { loadCluster } from './cluster_data.js';
import { ClusterView } from './cluster_view.js';
import { ClusterTransition, TIMING, SIZES, FRAME } from './cluster_transition.js';
import { sceneConfig } from './water_scene.js';
import { pageSceneColor, mappingOf } from './theme.js';

export { TIMING, SIZES, FRAME };

// End-caption strings and provenance (paper: distributed NEO-CD, 7_mpicd/paper/v01/main_final.tex).
export const PROVENANCE = {
  geometry: 'spherical cuts of one frame of an ambient-temperature MB-pol centroid MD trajectory of 256 waters (Paesani 2017); SI set of the distributed NEO-CD paper',
  calculation: 'NEO-HF, cc-pVDZ electrons / 3s2p protonic basis, all protons quantum; (H2O)250 Fock build 96.2 s on 104 MPI ranks (52 EPYC-9654 nodes)',
  display: 'atom positions only (lightweight spheres; hydrogen glow is styling, not a computed density); motion is a camera orbit',
};
export function caption(n) {
  return n >= 250 ? '(H\u2082O)\u2082\u2085\u2080: 500 quantum protons, the largest NEO calculation to date'
                  : `(H\u2082O)${n}: ${2 * n} quantum protons, from the NEO-HF benchmark series`;
}
const DEFAULT_URL = new URL('../proto_cluster/data/water250.bin', import.meta.url);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function createClusterScene(opt = {}) {
  const o = { n: 250, url: DEFAULT_URL, hbonds: true, interactive: true, ...opt };
  let stage, tr, view, cluster, theme = null, fogKey = '', listeners = [], controlsWas = true, t = 0;
  const api = {
    get transition() { return tr; }, get view() { return view; }, get cluster() { return cluster; },
    get heroHidden() { return t >= TIMING.densOut[1] && t >= TIMING.shellOut[1]; },
    get n() { return tr?.n; },

    async init(stage_, { root = stage_.root, ds }) {
      stage = stage_;
      cluster = await loadCluster(o.url);
      view = new ClusterView(cluster, { hbonds: o.hbonds });
      const heroCam = o.heroCam || (a => ({ target: a < 1 ? V(0.1, 0.35, 0) : V(-0.45, 0.45, 0), dir: V(0.08, 0.12, 1).normalize(),
        dist: 5.8 * Math.min(2.4, Math.max(1, 1.25 / a)) }));
      stage.camera.far = Math.max(stage.camera.far, 2000); stage.camera.updateProjectionMatrix();
      stage.controls.maxDistance = Math.max(stage.controls.maxDistance, 1e4);
      tr = new ClusterTransition({ stage, root, ds, cluster, view, heroCam });
      tr.setCount(o.n, o.hero ?? null);
      if (o.interactive) {   // orbit the droplet by dragging while the module owns the camera
        const el = stage.renderer.domElement; let drag = null;
        const on = (ev, fn) => { el.addEventListener(ev, fn); listeners.push([ev, fn]); };
        on('pointerdown', e => { if (t > 0) { drag = [e.clientX, e.clientY]; el.setPointerCapture?.(e.pointerId); } });
        on('pointermove', e => { if (!drag) return;
          tr.yaw -= (e.clientX - drag[0]) * 0.006; tr.pitch = Math.max(-0.7, Math.min(0.7, tr.pitch - (e.clientY - drag[1]) * 0.004));
          drag = [e.clientX, e.clientY]; });
        on('pointerup', () => { drag = null; }); on('pointercancel', () => { drag = null; });
      }
      return api;
    },

    setCount(n) { tr.setCount(n, o.hero ?? null); },

    update(t_, theme_ = 'dark', dt = 1 / 60, frame = null) {
      if (!tr) return;
      t = Math.min(1, Math.max(0, t_));
      if (theme_ !== theme) {
        theme = theme_; view.setTheme(theme === 'light' ? 'light' : 'dark');
        const c = sceneConfig(theme === 'light' ? 'light' : 'dark');
        tr.look = { shellGain: c.shellGain, hazeGain: c.hazeGain, oxygenGlow: c.oxygenGlow };
      }
      const key = `${theme}|${mappingOf(stage.renderer)}|${stage.renderer.toneMappingExposure}`;
      if (key !== fogKey) {
        fogKey = key;
        // dark: fog lands exactly on the page colour. light: the exact match is a scene value of ~7 (above
        // the tone-mapping shoulder), so any fog mix blows out to white; use the page colour un-boosted
        // (displays a touch greyer than #fbfefe) and a gentler gradient instead.
        if (theme === 'light') { view.fogColor = new THREE.Color('#fbfefe'); tr.backFade = 0.5; }
        else { view.fogColor = pageSceneColor(stage, theme); tr.backFade = undefined; }
      }
      if (t > 0 && stage.controls.enabled) { controlsWas = true; stage.controls.enabled = false; }
      if (t <= 0 && !stage.controls.enabled && controlsWas) stage.controls.enabled = true;
      tr.update(t, dt, frame);
    },

    dispose() {
      if (!tr) return;
      const el = stage.renderer.domElement;
      for (const [ev, fn] of listeners) el.removeEventListener(ev, fn);
      listeners = []; tr.dispose(); tr = null; stage.controls.enabled = true;
    },

    stats() { return view.stats(); },
  };
  return api;
}
