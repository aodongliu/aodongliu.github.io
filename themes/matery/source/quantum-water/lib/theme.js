// Site themes for the WebGL hero: a backdrop whose edge lands EXACTLY on the page background colour after
// ACES tone mapping + sRGB output (so the canvas edge is invisible against the page), and the per-theme
// switches for bloom. Dark: #061417, light: #fbfefe (the site's two themes); 'black' = the original
// near-black hero backdrop of stage.js.
import * as THREE from 'three';

export const SITE_BG = { dark: '#061417', light: '#fbfefe', black: '#020305' };

// three.js r169 tone mappers, forward, plus an inverse (Newton on the 3-vector), so a scene colour can
// be chosen that DISPLAYS as a given page colour: used for the backdrop edge and for depth fog.
const IN = new THREE.Matrix3().set(0.59719, 0.35458, 0.04823, 0.07600, 0.90834, 0.01566, 0.02840, 0.13383, 0.83777);
const OUT = new THREE.Matrix3().set(1.60475, -0.53108, -0.07367, -0.10208, 1.10813, -0.00605, -0.00327, -0.07276, 1.07602);
const rrt = v => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.4329510) + 0.238081);
const clamp01 = x => Math.min(1, Math.max(0, x));
export function acesForward(rgb, exposure = 1, raw = false) {
  const v = new THREE.Vector3(...rgb).multiplyScalar(exposure / 0.6).applyMatrix3(IN);
  const o = new THREE.Vector3(rrt(v.x), rrt(v.y), rrt(v.z)).applyMatrix3(OUT).toArray();
  return raw ? o : o.map(clamp01);
}
export function neutralForward(rgb, exposure = 1, raw = false) {
  let c = rgb.map(v => v * exposure);
  const x = Math.min(...c), off = x < 0.08 ? x - 6.25 * x * x : 0.04;
  c = c.map(v => v - off);
  const peak = Math.max(...c), S = 0.76, D = 0.15;
  if (peak < S) return raw ? c : c.map(clamp01);
  const d = 1 - S, np = 1 - d * d / (peak + d - S);
  c = c.map(v => v * np / peak);
  const g = 1 - 1 / (D * (peak - np) + 1);
  c = c.map(v => v + (np - v) * g);
  return raw ? c : c.map(clamp01);
}
const FORWARD = { aces: acesForward, neutral: neutralForward, none: (c, e) => c.map(v => v * e) };
export const mappingOf = renderer => ({ [THREE.ACESFilmicToneMapping]: 'aces', [THREE.NeutralToneMapping]: 'neutral' })[renderer.toneMapping] || 'none';
// Linear scene colour that the renderer will display as `css` (an sRGB colour string).
export function sceneColorFor(css, exposure = 1, mapping = 'aces') {
  const c = new THREE.Color(css), y = [c.r, c.g, c.b], f = x => FORWARD[mapping](x, exposure, true);
  // coordinate-wise bisection (each output channel is monotone in its own input; Newton oscillates on
  // the desaturation term of the neutral mapper)
  const x = y.slice();
  for (let sweep = 0; sweep < 40; sweep++) {
    for (let k = 0; k < 3; k++) {
      let lo = 0, hi = 200;
      for (let i = 0; i < 60; i++) { const mid = 0.5 * (lo + hi); x[k] = mid; if (f(x)[k] < y[k]) lo = mid; else hi = mid; }
      x[k] = 0.5 * (lo + hi);
    }
    const fx = f(x); if (Math.max(...fx.map((v, k) => Math.abs(v - y[k]))) < 1e-6) break;
  }
  return x;
}

// Full-screen backdrop: radial lift toward the centre, edge exactly the page colour, dithered.
export function createBackdrop(theme = 'dark', exposure = 1, mapping = 'aces') {
  const u = { uEdge: { value: new THREE.Vector3() }, uCenter: { value: new THREE.Vector3() }, uDither: { value: 1 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, depthWrite: false, depthTest: false, fog: false,
    vertexShader: `out vec2 vUv; void main(){ vUv = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: `in vec2 vUv; uniform vec3 uEdge, uCenter; uniform float uDither;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 d = vUv - vec2(0.5, 0.56); float r = length(d * vec2(1.6, 1.0));
        vec3 c = mix(uCenter, uEdge, smoothstep(0.0, 0.85, r));
        c *= 1.0 + (hash(gl_FragCoord.xy) - 0.5) * uDither;     // ~0.5 LSB after tone mapping
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = -100; mesh.name = 'theme-backdrop';
  mesh.setTheme = (t, exp = exposure, map = mapping) => {
    const edge = sceneColorFor(SITE_BG[t] || SITE_BG.dark, exp, map);
    u.uEdge.value.set(...edge);
    if (t === 'light') {   // barely-there cool lift: keep the page colour, just a hint of depth
      u.uCenter.value.set(...sceneColorFor('#ffffff', exp, map)); u.uDither.value = 0.0;
    } else {
      const lift = t === 'black' ? '#0b0f14' : '#0c2226';
      u.uCenter.value.set(...sceneColorFor(lift, exp, map));
      u.uDither.value = 1.0 / (255 * 0.04);
    }
  };
  mesh.setTheme(theme);
  return mesh;
}

// Apply a theme to a stage made by stage.js. Transparent stages (stage.js `transparent: true`, the site
// path) show the page itself, so nothing is drawn; opaque stages get the matched backdrop. Call AFTER any
// look switch that changes tone mapping (water_scene setLook -> stage.setTone).
export function applyStageTheme(stage, theme) {
  // stage.js adds its own backdrop only to opaque stages (context attributes are not reliable for this)
  const old = stage.scene.children.find(o => o.renderOrder === -100 && o.name !== 'theme-backdrop');
  let bd = stage.scene.getObjectByName('theme-backdrop');
  const transparent = !old && !bd;
  if (old) old.visible = false;
  if (!transparent) {
    if (!bd) { bd = createBackdrop(theme, stage.renderer.toneMappingExposure, mappingOf(stage.renderer)); stage.scene.add(bd); }
    bd.setTheme(theme, stage.renderer.toneMappingExposure, mappingOf(stage.renderer));
    if (stage.bloomPass && theme === 'light') stage.bloomPass.enabled = false;   // backdrop is above threshold
  }
  return bd;
}
// Scene-space colour of the page background for the stage's current tone mapping (depth fog target).
export const pageSceneColor = (stage, theme) => new THREE.Color().setRGB(...sceneColorFor(SITE_BG[theme] || SITE_BG.dark, stage.renderer.toneMappingExposure, mappingOf(stage.renderer)));
