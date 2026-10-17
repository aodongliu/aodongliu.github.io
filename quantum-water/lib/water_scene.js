// The single-water hero scene (architecture C, soft-glow look): glass electron isosurface + faint
// far haze, volumetric self-shadowed proton clouds, small red oxygen with halo, oblique framing.
// Used by proto_C2 (review page with URL overrides) and hero/ (production page).
import * as THREE from 'three';
import { StarSurface } from './star_surface.js';
import { ProtonVolume } from './proton_volume.js';

export const LOOKS = {
  // round 3: soft-glow family only (looks 2 and 4 of round 2 dropped by review).
  // gain = core self-emission, lit = scattered key light, shadow = self-shadowing strength,
  // absorb = view extinction (fog), gamma < 1 widens the visible halo toward the 90 % radius.
  1: { name: 'soft glow',
       proton: { gain: 1.5, lit: 2.6, shadow: 5.0, absorb: 1.2, gamma: 0.6, contour: 0 },
       shell: { iso: 0.15, frontDim: 0.04, tint: { color: [0.36, 0.58, 0.9], base: 0.005, diff: 0.06, diffAlpha: 0.015, alpha: 0.015, rimGain: 0.55, rimAlpha: 0.30, rimPow: 2.6, spec: 0.8, shin: 90 } },
       haze: { iso: 0.01, gain: 0.12 }, oxygen: { radius: 0.3, glow: 0.55 }, bloom: 0.4 },
  // ---- named sets for the website (follow <html data-theme>) ----
  // dark = approved look 1 on the site's #061417 background
  dark: { name: 'dark (soft glow)', tone: { mapping: 'aces', exposure: 1.0 },
       proton: { gain: 1.5, lit: 2.6, shadow: 5.0, absorb: 1.2, gamma: 0.6, contour: 0, halo: [0.62, 0.68, 0.78], core: [1.0, 0.98, 0.95] },
       shell: { iso: 0.15, frontDim: 0.04, tint: { backGain: 0.45, color: [0.36, 0.58, 0.9], rim: [0.50, 0.74, 1.0], base: 0.005, diff: 0.06, diffAlpha: 0.015, alpha: 0.015, rimGain: 0.55, rimAlpha: 0.30, rimPow: 2.6, spec: 0.8, shin: 90 } },
       // haze off by default (round 2 decision: it reached past the frame as faint arcs); 0.12 = previous look
       haze: { iso: 0.01, gain: 0.0, tint: { color: [0.3, 0.5, 0.85], rim: [0.5, 0.74, 1.0], rimGain: 0.5, rimAlpha: 0.25 } },
       oxygen: { radius: 0.3, glow: 0.55, light: 0 }, bloom: 0.4 },
  // light = for the #fbfefe page: the glass DARKENS the page (cool grey-blue body, slate rim) instead of
  // adding light; protons keep a warm-white emissive core but get a grey, absorbing halo, so they read
  // as luminous clouds on white; oxygen unchanged; no bloom (it cannot show on white).
  // light = for the #fbfefe page. Over a light page, premultiplied colour must stay BELOW
  // alpha x page to darken it, so surface colours are given as tone x opacity (base = alpha,
  // diff = diffAlpha, rimGain = rimAlpha): the glass is a cool grey-blue film with a slate rim; the
  // protons have a grey, slightly absorbing halo and a warm-white emissive core that reads as
  // luminous against the tinted glass; oxygen unchanged; no bloom (invisible on white).
  light: { name: 'light', tone: { mapping: 'neutral', exposure: 1.0 },
       // round 2 (review: more presence): pale blue-grey glass body with a dark fresnel rim and wrap
       // shading; protons = warm-white core inside a definite darkening cool grey-blue halo ring;
       // far haze off; slightly darker oxygen. Pair with the CSS radial backdrop (qw.css).
       proton: { gain: 4.5, lit: 0.9, shadow: 4.0, absorb: 2.4, gamma: 0.6, contour: 0, halo: [0.34, 0.48, 0.72], core: [1.0, 0.95, 0.84] },
       shell: { iso: 0.15, frontDim: 0.06, frontTone: true, tint: { backGain: 1.0, color: [0.66, 0.75, 0.86], rim: [0.10, 0.20, 0.34], base: 0.45, diff: 0.25, diffAlpha: 0.25, alpha: 0.45, rimGain: 0.8, rimAlpha: 0.8, rimPow: 2.8, spec: 0.55, shin: 60 } },
       haze: { iso: 0.01, gain: 0.0, tint: { color: [0.5, 0.6, 0.72], rim: [0.3, 0.4, 0.55], rimGain: 0.2, rimAlpha: 0.2 } },
       oxygen: { radius: 0.3, glow: 0.2, light: 1, color: 0x9a0d16 }, bloom: 0.0 },
  // light-ink = stronger alternative: denser glass film and darker proton halo (more contrast)
  'light-ink': { name: 'light (ink)', tone: { mapping: 'neutral', exposure: 1.0 },
       proton: { gain: 2.8, lit: 0.6, shadow: 4.0, absorb: 2.0, gamma: 0.6, contour: 0, halo: [0.58, 0.63, 0.70], core: [1.0, 0.94, 0.84] },
       shell: { iso: 0.15, frontDim: 0.04, tint: { color: [0.50, 0.60, 0.72], rim: [0.16, 0.26, 0.40], base: 0.22, diff: 0.30, diffAlpha: 0.30, alpha: 0.22, rimGain: 0.7, rimAlpha: 0.7, rimPow: 2.2, spec: 0.0, shin: 90 } },
       haze: { iso: 0.01, gain: 1.0, tint: { color: [0.55, 0.64, 0.74], rim: [0.35, 0.45, 0.58], rimGain: 0.25, rimAlpha: 0.25 } },
       oxygen: { radius: 0.3, glow: 0.25, light: 1 }, bloom: 0.0 },
  3: { name: 'fog',
       proton: { gain: 1.8, lit: 2.8, shadow: 6.0, absorb: 3.0, gamma: 0.55, contour: 0 },
       shell: { iso: 0.15, frontDim: 0.04, tint: { color: [0.34, 0.56, 0.9], base: 0.005, diff: 0.05, diffAlpha: 0.012, alpha: 0.012, rimGain: 0.55, rimAlpha: 0.30, rimPow: 2.8, spec: 0.8, shin: 90 } },
       haze: { iso: 0.01, gain: 0.12 }, oxygen: { radius: 0.3, glow: 0.55 }, bloom: 0.4 },
};

// Flat parameter set for one rendering of the scene; every field can be overridden.
export function sceneConfig(lookId = 1, over = {}) {
  const L = LOOKS[lookId] || LOOKS[1];
  if (!L.proton.halo) L.proton.halo = [0.62, 0.68, 0.78];
  if (!L.proton.core) L.proton.core = [1.0, 0.98, 0.95];
  return {
    iso: L.shell.iso, tint: L.shell.tint, frontDim: L.shell.frontDim, frontTone: !!L.shell.frontTone, haze: L.haze?.iso ?? 0, hazeGain: L.haze?.gain ?? 0.25,
    shell: 1, shellGain: 1, ...L.proton, step: 0.02, upsample: 1, cull: 1.0, direct: false,
    bloom: L.bloom, key: [-3.2, 2.4, -0.8], orient: [-38, 28, -18], dist: 5.8, pdist: 2.4,
    oxygenRadius: L.oxygen.radius, oxygenGlow: L.oxygen.glow, oxygenLight: L.oxygen.light ?? 0, oxygenColor: L.oxygen.color ?? 0xb3121c,
    halo: L.proton.halo, core: L.proton.core, hazeTint: L.haze?.tint, tone: L.tone || { mapping: 'aces', exposure: 1 },
    drift: true, ...over,
  };
}

const hazeTint = c => ({ color: [0.3, 0.5, 0.85], rim: [0.5, 0.74, 1.0], base: 0.0, diff: 0.0, diffAlpha: 0, alpha: 0.0, rimGain: 0.5, rimAlpha: 0.25, rimPow: 3.5, spec: 0.0, ...(c.hazeTint || {}) });
const meanOf = A => [0, 1, 2].map(k => A.reduce((s, a) => s + a[k], 0) / A.length);

// Hero framing, shared by the presets and the cluster transition (t = 0 pose). Functions of aspect a:
// portrait screens back the camera off and centre the molecule; wide bands back off a little; the
// look-at point sits slightly below the molecule centre so it rides high, clear of the captions.
export function heroCamFor(cfg) {
  return {
    // cfg.wide = { dist, targetY, targetX } (optional): explicit landscape framing (the website's capped
    // desktop band); portrait framing is always the rule below
    // cfg.tall = { targetX, targetY } (optional): portrait look-at (the website centres the molecule in
    // the stage area above its caption block)
    target: a => (a < 1 ? new THREE.Vector3(cfg.tall?.targetX ?? 0.1, cfg.tall?.targetY ?? cfg.targetY ?? 0.35, 0)
                        : new THREE.Vector3(cfg.wide?.targetX ?? -0.45, cfg.wide?.targetY ?? cfg.targetY ?? 0.45, 0)),
    dir: new THREE.Vector3(0.08, 0.12, 1),
    dist: a => (a >= 1 && cfg.wide?.dist ? cfg.wide.dist : cfg.dist * (a < 1 ? Math.min(2.4, 1.25 / a) : a > 1.9 ? 1.18 : 1)),
  };
}

// Oblique 3/4 views: molecular plane (xy) tilted ~38 degrees from facing the camera, off-centre.
export function presetsFor(cfg) {
  return (root, center, F) => {
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    root.updateMatrixWorld(true);
    const hw = h => root.localToWorld(V(...h));
    return [
      { name: 'hero', ...heroCamFor(cfg) },
      { name: 'oblique-low', target: V(-0.2, 0.0, 0), dir: V(-0.62, -0.18, 0.76), dist: 5.6 },
      { name: 'proton', target: hw(meanOf(F.proton_centroid_bohr.H2)), dir: V(0.25, 0.2, 1), dist: cfg.pdist },
    ];
  };
}

export function stageOptionsFor(cfg) {
  // bloom pass always exists (strength may be 0 in light mode and switched on live)
  return { bloom: { strength: cfg.bloom, radius: 0.4, threshold: 0.8 }, keyOffset: cfg.key, ...cfg.stage };
}
export function appOptionsFor(cfg, data) {
  return { data, presets: presetsFor(cfg), drift: cfg.drift, orient: cfg.orient, oxygenRadius: cfg.oxygenRadius, oxygenGlow: cfg.oxygenGlow };
}

// bootstrap() build callback. Returns the scene updater plus the streamed proton volumes.
export function buildFor(cfg, { onVolumeProgress } = {}) {
  return async ({ stage, ds, oxygenRadius }) => {
    const key = `electron_${cfg.iso}`;
    if (!ds.m.surfaces[key]) throw new Error(`no baked surface ${key}`);
    // the far haze is not needed for the first frame: it streams in afterwards
    const hazeP = cfg.haze ? ds.surface(`electron_${cfg.haze}`) : null;
    const [shell, v1, v2] = await Promise.all([
      ds.surface(key), ds.volume('H1', { onProgress: onVolumeProgress }), ds.volume('H2', { onProgress: onVolumeProgress }),
    ]);
    const parts = [];
    const add = (s, order) => { s.mesh.renderOrder = order; stage.root.add(s.mesh); parts.push(s); };
    let curCfg = cfg;
    if (hazeP) hazeP.then(haze => {
      const h = new StarSurface(haze, { style: 'glass', side: THREE.FrontSide, tint: hazeTint(curCfg), gain: curCfg.hazeGain });
      add(h, 6); surfaces.haze = h;
    });
    if (cfg.shell) {
      add(new StarSurface(shell, { style: 'glass', side: THREE.BackSide, tint: cfg.tint, gain: cfg.shellGain }), 1);
      // front faces: rim + highlight, plus a slight neutral dimming (alpha, no colour) of what lies
      // behind the glass, so a proton inside a lobe reads as *behind* the surface (depth cue)
      const front = { ...cfg.tint, diffAlpha: 0, base: cfg.frontTone ? cfg.frontDim : 0, alpha: cfg.frontDim, diff: cfg.tint.diff * 0.3 };
      add(new StarSurface(shell, { style: 'glass', side: THREE.FrontSide, tint: front, gain: cfg.shellGain }), 4);
    }
    const C = ds.m.frames.proton_centroid_bohr, I = ds.m.proton_isovalues.H1;
    const opts = { isos: [I['50'], I['90'], I['99']], tf: 'cloud', step: cfg.step, upsample: cfg.upsample, cullRadius: cfg.cull,
      gain: cfg.gain, absorb: cfg.absorb, oxygenRadius,
      cloud: { gamma: cfg.gamma, lit: cfg.lit, contour: cfg.contour, shadow: cfg.shadow, direct: cfg.direct, halo: cfg.halo, core: cfg.core } };
    const protons = [new ProtonVolume(stage.renderer, v1, { ...opts, centers: C.H1 }), new ProtonVolume(stage.renderer, v2, { ...opts, centers: C.H2 })];
    for (const p of protons) { p.mesh.renderOrder = 2; stage.root.add(p.mesh); }
    const surfaces = { back: parts.find(p => p.mesh.renderOrder === 1),
                       front: parts.find(p => p.mesh.renderOrder === 4), haze: parts.find(p => p.mesh.renderOrder === 6) };
    // Live look switch (light/dark) without reload: only uniforms, blending and tone change.
    function setLook(c) {
      curCfg = c;
      const setTint = (surf, t, gain) => {
        if (!surf) return;
        const u = surf.uniforms;
        if (t.color) u.uColor.value.setRGB(...t.color); if (t.rim) u.uRim.value.setRGB(...t.rim);
        for (const [k, n] of [['base', 'uBase'], ['diff', 'uDiff'], ['diffAlpha', 'uDiffAlpha'], ['alpha', 'uAlpha'], ['rimGain', 'uRimGain'],
          ['rimAlpha', 'uRimAlpha'], ['rimPow', 'uRimPow'], ['spec', 'uSpec'], ['shin', 'uShin'], ['backGain', 'uBackGain']]) if (t[k] != null) u[n].value = t[k];
        if (gain != null) u.uGain.value = gain;
      };
      setTint(surfaces.back, c.tint, c.shellGain);
      setTint(surfaces.front, { ...c.tint, diffAlpha: 0, base: c.frontTone ? c.frontDim : 0, alpha: c.frontDim, diff: c.tint.diff * 0.3 }, c.shellGain);
      setTint(surfaces.haze, hazeTint(c), c.hazeGain);
      for (const p of protons) {
        const u = p.uniforms;
        u.uProtonGain.value = c.gain; u.uProtonAbsorb.value = c.absorb; u.uLitAmt.value = c.lit; u.uShadow.value = c.shadow;
        if (c.halo) u.uHaloCol.value.setRGB(...c.halo); if (c.core) u.uCoreCol.value.setRGB(...c.core);
      }
      if (stage.oxygen) stage.oxygen.material.color.setHex(c.oxygenColor ?? 0xb3121c);
      const glow = stage.oxygen?.userData.glow;
      if (glow) {
        glow.material.uniforms.uGain.value = c.oxygenGlow; glow.material.uniforms.uLight.value = c.oxygenLight;
        glow.material.blending = c.oxygenLight ? THREE.NormalBlending : THREE.AdditiveBlending; glow.material.needsUpdate = true;
      }
      stage.setTone({ ...c.tone, bloom: c.bloom });
    }
    setLook(cfg);
    return {
      setLook,
      volumes: [v1, v2],
      gpuBytes: [...parts, ...protons].reduce((s, p) => s + p.gpuBytes, 0),
      update(frame, o, k) { for (const s of parts) s.update(frame, k); for (const p of protons) p.update(frame, o, k); },
    };
  };
}
