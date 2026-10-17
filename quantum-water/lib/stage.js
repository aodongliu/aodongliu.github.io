// Renderer, camera, interaction, lighting, post-processing and metrics shared by all prototypes.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { stats } from './data.js';

export const params = new URLSearchParams(location.search);
export const num = (k, d) => (params.has(k) ? parseFloat(params.get(k)) : d);

export function createStage({ bloom = { strength: 0.45, radius: 0.35, threshold: 0.85 }, keyOffset = [-2, 3, 1], dprCap = 2, msaa: msaaOpt, bloomHalf = false, transparent = false, canvas: canvasOpt = null, pageScroll = false } = {}) {
  const canvas = canvasOpt || document.querySelector('canvas');
  // transparent: the canvas composites (premultiplied) over the page, so the site's own background
  // and theme show through; no backdrop is drawn.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: transparent, premultipliedAlpha: true });
  if (transparent) renderer.setClearColor(0x000000, 0);
  // Full device resolution (capped at 2x): the previous attempt looked soft partly from low-res targets.
  renderer.setPixelRatio(Math.min(num('dpr', window.devicePixelRatio || 1), dprCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = num('exposure', 1.0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35;
  if (!transparent) scene.add(backdrop());

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.8;
  controls.enablePan = false; controls.minDistance = 1.2; controls.maxDistance = 30;
  if (pageScroll) {
    // Embedded in a scrolling page: the wheel scrolls the page unless the user has clicked the
    // scene (until the pointer leaves it) or holds ctrl/cmd (also = trackpad pinch). Touch: vertical
    // swipes scroll the page, horizontal drags orbit, two-finger pinch zooms the scene.
    let armed = false;
    canvas.addEventListener('pointerdown', () => { armed = true; });
    canvas.addEventListener('pointerleave', () => { armed = false; });
    // capture-phase listener runs before OrbitControls' own: swallow the event (page scrolls)
    canvas.addEventListener('wheel', e => { if (!(armed || e.ctrlKey || e.metaKey)) e.stopImmediatePropagation(); }, { capture: true });
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
    canvas.style.touchAction = 'pan-y';
  }

  // Key light follows the camera (always a flattering 3/4 key), plus a cool rim from behind.
  const key = new THREE.DirectionalLight(0xffffff, 2.2), rim = new THREE.DirectionalLight(0x9fc4ff, 0.25);
  scene.add(key, key.target, rim, rim.target);
  const keyDirWorld = new THREE.Vector3();

  const root = new THREE.Group(); scene.add(root);   // children live in source (Bohr) coordinates

  // MSAA only where it is needed: at device pixel ratio >= 2 the pixels themselves anti-alias,
  // and 4x MSAA on a 4K half-float target costs more than the whole molecule.
  const msaa = num('msaa', msaaOpt ?? (renderer.getPixelRatio() >= 2 ? 0 : 4));
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: msaa }));
  composer.addPass(new RenderPass(scene, camera));
  let bloomPass = null;
  if (num('bloom', 1) && bloom) { bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), bloom.strength, bloom.radius, bloom.threshold); composer.addPass(bloomPass); }
  const bloomScale = bloomHalf ? 0.5 : 1;
  composer.addPass(new OutputPass());
  // Transparent canvas: UnrealBloomPass's additive composite overwrites alpha (-> opaque black).
  // When bloom is active, rebuild a valid premultiplied alpha from the colour (glow stays additive
  // over the dark page); with bloom off the scene's own alpha is exact and is kept.
  let alphaPass = null;
  if (transparent) {
    alphaPass = new ShaderPass({
      uniforms: { tDiffuse: { value: null }, uFromColor: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      // OutputPass sRGB-encodes the PREMULTIPLIED colour; for the browser's premultiplied compositing
      // the encoding must apply to the straight colour: out = sRGB(lin / a) * a. Without this, thin
      // light-theme films (tone x opacity) came out brighter than the page instead of tinting it.
      fragmentShader: `uniform sampler2D tDiffuse; uniform float uFromColor; varying vec2 vUv;
        vec3 toLin(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
        vec3 toSrgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
        void main(){ vec4 c = texture2D(tDiffuse, vUv);
          if (uFromColor > 0.5) { float a = clamp(max(max(c.r, c.g), c.b), 0.0, 1.0); gl_FragColor = vec4(min(c.rgb, vec3(a)), a); return; }
          float a = clamp(c.a, 0.0, 1.0);
          vec3 straight = a > 1e-4 ? clamp(toLin(c.rgb) / a, 0.0, 1.0) : vec3(0.0);
          gl_FragColor = vec4(toSrgb(straight) * a, a); }`,
    });
    composer.addPass(alphaPass);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h);
    if (bloomPass && bloomScale !== 1) bloomPass.setSize(w * renderer.getPixelRatio() * bloomScale, h * renderer.getPixelRatio() * bloomScale);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

  const metrics = window.__metrics = { firstFrameMs: null, frames: 0, fps: 0, frameMs: [], bytes: 0, gpuBytes: 0, decodeMs: 0 };
  const callbacks = [], bench = num('bench', 0) > 0, px = new Uint8Array(4);
  let last = performance.now(), firstReady = false, acc = [];
  function loop(now) {
    if (stage.paused) { last = now; requestAnimationFrame(loop); return; }   // off-screen or hidden: no work
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    controls.update();
    key.position.copy(camera.position).add(new THREE.Vector3().set(...keyOffset).applyQuaternion(camera.quaternion));
    key.target.position.copy(controls.target);
    rim.position.copy(controls.target).add(new THREE.Vector3(1, 1.5, -4).applyQuaternion(camera.quaternion));
    rim.target.position.copy(controls.target);
    keyDirWorld.subVectors(key.position, key.target.position).normalize();
    for (const cb of callbacks) cb(dt, now);
    composer.render(dt);
    // ?bench=1: block on a 1-pixel readback so frame time = true CPU+GPU cost of the frame
    // (otherwise rAF timing under an uncapped/headless browser measures only command submission).
    if (bench) { const gl = renderer.getContext(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); }
    else if (stage.ready) governor(dt);
    if (stage.ready) {
      if (!firstReady) { firstReady = true; metrics.firstFrameMs = now; }   // ms since navigation start
      acc.push(now); metrics.frames++;
      while (acc.length && now - acc[0] > 2000) acc.shift();
      if (acc.length > 1) metrics.fps = (acc.length - 1) / ((acc[acc.length - 1] - acc[0]) / 1000);
      metrics.frameMs.push(dt * 1000); if (metrics.frameMs.length > 600) metrics.frameMs.shift();
      if (window.__profileResample) (window.__ft ||= []).push([now, dt * 1000]);
    }
    metrics.bytes = stats.bytes; metrics.decodeMs = stats.decodeMs;
    if (performance.memory) metrics.jsHeapMB = performance.memory.usedJSHeapSize / 1e6;
    requestAnimationFrame(loop);
  }

  // Resolution governor: volume cost scales with how much of the screen the protons cover, i.e.
  // with zoom. If frames are slow, step the pixel ratio down (never below 1); restore it once the
  // camera has backed off from the distance at which we stepped down, or by a periodic probe.
  // Robust to start-up hitches (shader compiles, data streaming, cluster init): nothing is judged
  // in the first 2 s, the MEDIAN frame of a 1 s window is used, and two slow windows in a row are
  // needed. A probe that fails doubles the wait before the next one (8 s, 16 s, ... 2 min).
  const maxDpr = renderer.getPixelRatio(), steps = [];
  let gT = 0, gF = [], warm = 0, bad = 0, sinceDown = 0, probeAt = 8;
  function setDpr(d) { renderer.setPixelRatio(d); resize(); metrics.dpr = d; warm = 1; }
  function governor(dt) {
    metrics.dpr = renderer.getPixelRatio();
    warm += dt; if (warm < 2) return;
    gF.push(dt * 1000); gT += dt;
    if (gT < 1.0) return;
    gF.sort((a, b) => a - b);
    const med = gF[gF.length >> 1], dist = camera.position.distanceTo(controls.target), dpr = renderer.getPixelRatio();
    if (med > 21 && dpr > 1) {
      if (++bad >= 2) { steps.push(dist); setDpr(Math.max(1, dpr - 0.25)); bad = 0; sinceDown = 0; metrics.dprDown = (metrics.dprDown || 0) + 1; }
    } else {
      bad = 0; sinceDown += gT;
      if (steps.length) {
        const backedOff = dist > steps[steps.length - 1] * 1.25;
        if (backedOff || sinceDown > probeAt) {
          if (!backedOff) probeAt = Math.min(probeAt * 2, 120);
          steps.pop(); setDpr(Math.min(maxDpr, dpr + 0.25)); sinceDown = 0;
        }
      }
    }
    gF = []; gT = 0;
  }

  const stage = {
    THREE, renderer, scene, camera, controls, root, composer, bloomPass, keyDirWorld, rimLight: rim, metrics, ready: false,
    onFrame: cb => callbacks.push(cb),
    // runtime look switch (light/dark): tone mapping, exposure, bloom strength
    setTone({ mapping = 'aces', exposure = 1, bloom: b } = {}) {
      renderer.toneMapping = { aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping, agx: THREE.AgXToneMapping, none: THREE.NoToneMapping }[mapping];
      renderer.toneMappingExposure = exposure;
      if (bloomPass && b != null) { bloomPass.strength = b; bloomPass.enabled = b > 0; }
      if (alphaPass) alphaPass.uniforms.uFromColor.value = bloomPass && bloomPass.enabled ? 1 : 0;
    },
    start: () => requestAnimationFrame(loop),
    // Camera presets relative to a molecular frame (Bohr). `focus` is world-space target.
    presets: [],
    setCamera(i) {
      const p = this.presets[i] || this.presets[0];
      if (p.fov) { camera.fov = p.fov; camera.updateProjectionMatrix(); }
      const a = camera.aspect, dist = typeof p.dist === 'function' ? p.dist(a) : p.dist;
      const target = typeof p.target === 'function' ? p.target(a) : p.target;
      controls.target.copy(target);
      camera.position.copy(target).addScaledVector(p.dir.clone().normalize(), dist);
      camera.up.set(0, 1, 0); controls.update();
    },
  };
  return stage;
}

// Dark, slightly lifted radial backdrop drawn as a full-screen triangle (dithered: no banding).
function backdrop() {
  const m = new THREE.ShaderMaterial({
    depthWrite: false, depthTest: false,
    vertexShader: `out vec2 vUv; void main(){ vUv = position.xy*0.5+0.5; gl_Position = vec4(position.xy, 0.9999, 1.0); }`,
    fragmentShader: `in vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 d = vUv - vec2(0.5, 0.56); float r = length(d * vec2(1.6, 1.0));
        vec3 c = mix(vec3(0.018, 0.022, 0.030), vec3(0.003, 0.004, 0.006), smoothstep(0.0, 0.85, r));
        c += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = -100;
  return mesh;
}

// Classical oxygen nucleus marker: glossy red sphere that follows the trajectory.
export function createOxygen(THREE_, radius = 0.5, glow = 0) {
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xb3121c, roughness: 0.3, metalness: 0.0, clearcoat: 0.25, clearcoatRoughness: 0.3, specularIntensity: 0.6 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 128, 96), mat);
  mesh.renderOrder = 0;
  if (glow > 0) {   // faint red halo: camera-facing quad, Gaussian falloff, additive (stylized, not data)
    const gm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uR: { value: radius }, uGain: { value: glow }, uLight: { value: 0 } },
      vertexShader: `uniform float uR; out vec2 vP;
        void main(){ vP = position.xy; vec4 c = modelViewMatrix * vec4(0.0,0.0,0.0,1.0);
          gl_Position = projectionMatrix * (c + vec4(position.xy * uR * 4.0, 0.0, 0.0)); }`,
      fragmentShader: `uniform float uGain, uLight; in vec2 vP;
        void main(){ float r = length(vP) * 4.0; float a = exp(-r * r * 0.9) * uGain;
          // dark: additive glow; light: a soft red tint laid over the page (normal blending)
          gl_FragColor = uLight > 0.5 ? vec4(0.85, 0.22, 0.2, a) : vec4(vec3(1.0, 0.16, 0.12) * a, 1.0); }`,
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), gm);
    q.frustumCulled = false; q.renderOrder = 5;
    mesh.add(q); mesh.userData.glow = q;
  }
  return mesh;
}

export function lerp3(a, b, w) { return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w]; }

// Common default presets given the molecule center c (Bohr) and one proton position h (Bohr, local).
export function defaultPresets(root, c, h) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const hw = V(...h).add(root.position);
  return [
    { name: 'hero', target: V(0, 0.1, 0), dir: V(0.95, 0.55, 0.8), dist: 8.2 },
    { name: 'front', target: V(0, 0.1, 0), dir: V(0.0, 0.12, 1.0), dist: 8.6 },
    { name: 'proton', target: hw, dir: V(-0.55, 0.35, 1.0), dist: 2.3 },
  ];
}
