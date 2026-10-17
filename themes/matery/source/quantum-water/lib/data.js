// Data loading for format qwater-render-v1 (see tools/bake.py and REPORT.md).
// All binary assets are gzip files decoded with the browser's native DecompressionStream.
export const stats = { bytes: 0, files: 0, t0: performance.now(), decodeMs: 0 };

export async function fetchBinary(url, tries = 3) {
  let res;
  for (let i = 0; ; i++) {
    try { res = await fetch(url); break; } catch (e) { if (i + 1 >= tries) throw e; await new Promise(r => setTimeout(r, 200 * (i + 1))); }
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const packed = await res.arrayBuffer();
  stats.bytes += packed.byteLength; stats.files++;
  if (!url.endsWith('.gz')) return new Uint8Array(packed);
  const t = performance.now();
  const stream = new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const out = new Uint8Array(await new Response(stream).arrayBuffer());
  stats.decodeMs += performance.now() - t;
  return out;
}

export async function loadDataset(base) {
  const res = await fetch(`${base}/manifest.json`);
  const text = await res.text(); stats.bytes += text.length; stats.files++;
  const m = JSON.parse(text);
  if (m.format !== 'qwater-render-v1') throw new Error(`unknown format ${m.format}`);
  const lm = m.loop?.mode || 'pingpong';
  setLoop(lm.startsWith('periodic') ? { periodic: true, period: m.loop.period_frames } : { periodic: false, period: 0 });
  return new Dataset(base, m);
}

// Time sampling. LOOP is set from the manifest when a dataset loads:
//   {periodic: false}            -> clamp at the ends (ping-pong playback)
//   {periodic: true, period: P}  -> frame index wraps modulo P (one closed period: frame P == frame 0)
let LOOP = { periodic: false, period: 0 };
export function setLoop(l) { LOOP = l; }
export function getLoop() { return LOOP; }
const wrap = f => (LOOP.periodic ? ((f % LOOP.period) + LOOP.period) % LOOP.period : f);

// Bracket a continuous frame index between stored key frames (linear weights).
export function bracket(keys, f) {
  f = wrap(f);
  const n = keys.length;
  if (LOOP.periodic && f >= keys[n - 1]) {            // between last key and the wrap-around to key 0
    const span = LOOP.period - keys[n - 1];
    return span > 0 ? { a: n - 1, b: 0, w: (f - keys[n - 1]) / span } : { a: 0, b: 0, w: 0 };
  }
  if (f <= keys[0]) return { a: 0, b: 0, w: 0 };
  if (f >= keys[n - 1]) return { a: n - 1, b: n - 1, w: 0 };
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (keys[mid] <= f) lo = mid; else hi = mid; }
  return { a: lo, b: hi, w: (f - keys[lo]) / (keys[hi] - keys[lo]) };
}

// Catmull-Rom in time for densely stored frames (keys = 0..n-1): 4 stored indices + weights.
// Wraps for periodic data, clamps (duplicating end frames) otherwise. Weights sum to 1.
export function bracket4(n, f, cubic = true) {
  f = wrap(f);
  const P = LOOP.periodic ? LOOP.period : n;
  const i = Math.min(Math.floor(f), LOOP.periodic ? P - 1 : n - 1), t = f - i;
  // ping-pong data (turning point to turning point): mirror at the ends, i.e. zero time-derivative
  // at the reversal points, which is what the reversed playback needs to stay C1-smooth
  const mirror = k => (k < 0 ? -k : k > n - 1 ? 2 * (n - 1) - k : k);
  const at = k => (LOOP.periodic ? ((k % P) + P) % P : Math.max(0, Math.min(n - 1, mirror(k))));
  const idx = [at(i - 1), at(i), at(i + 1), at(i + 2)];
  if (!cubic) return { idx, w: [0, 1 - t, t, 0], key: idx.join() };
  const t2 = t * t, t3 = t2 * t;
  const w = [(-t3 + 2 * t2 - t) / 2, (3 * t3 - 5 * t2 + 2) / 2, (-3 * t3 + 4 * t2 + t) / 2, (t3 - t2) / 2];
  return { idx, w, key: idx.join() };
}

class Dataset {
  constructor(base, m) {
    this.base = base; this.m = m;
    this.frameCount = m.frames.count;
    const all = [...Array(this.frameCount).keys()];
    this.keysOf = meta => meta.key_frames || all;
  }
  // Volume: frames of nx*ny*nz uint8, x fastest. Either one file, or `chunks` streamed in order:
  // the promise resolves once the first chunk is decoded; later chunks arrive in the background
  // and `loaded` (number of contiguous frames available from 0) grows; `onProgress` fires each time.
  async volume(name, { onProgress } = {}) {
    const meta = this.m.volumes[name];
    const [nx, ny, nz] = meta.shape_xyz, voxels = nx * ny * nz;
    const data = new Uint8Array(voxels * meta.nframes);
    const v = { meta, data, voxels, keys: this.keysOf(meta), loaded: 0, frame: k => data.subarray(k * voxels, (k + 1) * voxels) };
    const chunks = meta.chunks || [{ file: meta.file, first: 0, count: meta.nframes }];
    const get = async c => {
      const b = await fetchBinary(`${this.base}/${c.file}`);
      if (b.length !== voxels * c.count) throw new Error(`${name}/${c.file}: size mismatch`);
      data.set(b, c.first * voxels); v.loaded = c.first + c.count; onProgress && onProgress(v);
    };
    await get(chunks[0]);
    v.done = (async () => { for (const c of chunks.slice(1)) await get(c); })();
    return v;
  }
  // Star surface: returns RGBA8 texel array [r, octx, octy, 0] per frame per vertex.
  async surface(name) {
    const meta = this.m.surfaces[name];
    const planes = await fetchBinary(`${this.base}/${meta.file}`);
    const nv = 10 * 4 ** meta.ico_level + 2, nf = meta.nframes;
    if (planes.length !== nv * 3 * nf) throw new Error(`${name}: size mismatch`);
    const rgba = new Uint8Array(nf * nv * 4), acc = new Uint8Array(3 * nv);
    for (let f = 0; f < nf; f++) {           // undo temporal delta (mod 256 via Uint8 wrap)
      const src = planes.subarray(f * 3 * nv, (f + 1) * 3 * nv);
      for (let i = 0; i < 3 * nv; i++) acc[i] = f ? acc[i] + src[i] : src[i];
      const o = f * nv * 4;
      for (let v = 0; v < nv; v++) {
        rgba[o + 4 * v] = acc[v]; rgba[o + 4 * v + 1] = acc[nv + v]; rgba[o + 4 * v + 2] = acc[2 * nv + v];
      }
    }
    let centers = null;
    if (meta.center) centers = this.m.frames[meta.center.split('/')[0]][meta.center.split('/')[1]];
    return { meta, rgba, nv, keys: this.keysOf(meta), centers };
  }
  // Marching-cubes meshes, one per stored frame.
  async mc(name) {
    const meta = this.m.mc[name];
    const buf = await fetchBinary(`${this.base}/${meta.file}`);
    const lo = meta.bbox_lo, hi = meta.bbox_hi, out = [];
    let off = 0;
    for (const [nv, nt] of meta.per_frame_verts_tris) {
      const pos = new Uint16Array(buf.buffer.slice(buf.byteOffset + off, buf.byteOffset + off + nv * 6)); off += nv * 6;
      const oct = buf.slice(off, off + nv * 2); off += nv * 2;
      const wide = nv >= 65536, ib = wide ? 4 : 2;
      const idxBytes = buf.buffer.slice(buf.byteOffset + off, buf.byteOffset + off + nt * 3 * ib); off += nt * 3 * ib;
      out.push({ pos, oct, index: wide ? new Uint32Array(idxBytes) : new Uint16Array(idxBytes), nv, nt });
    }
    return { meta, frames: out, keys: this.keysOf(meta), lo, hi };
  }
}
