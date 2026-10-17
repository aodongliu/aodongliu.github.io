// Water-cluster geometry, format "qwater-cluster-v1" (proto_cluster/tools/bake_cluster.py).
// One quantised file holds the nested spherical cuts h2o{25..250}: the first n molecules ARE h2o{n}.
// Coordinates are Angstrom in the h2o250 frame; `translation(n)` reproduces file h2o{n} exactly.
export const BOHR_PER_ANGSTROM = 1.8897261246;

export async function loadCluster(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  return parseCluster(buf);
}

export function parseCluster(buf) {
  const dv = new DataView(buf);
  const magic = String.fromCharCode(...new Uint8Array(buf, 0, 4));
  if (magic !== 'QWCL') throw new Error('not a qwater-cluster file');
  const version = dv.getUint16(4, true), nMol = dv.getUint16(6, true), nSizes = dv.getUint16(8, true);
  let o = 12;
  const sizes = []; for (let i = 0; i < nSizes; i++, o += 2) sizes.push(dv.getUint16(o, true));
  const trans = []; for (let i = 0; i < nSizes; i++, o += 12) trans.push([0, 4, 8].map(k => dv.getFloat32(o + k, true)));
  const q = dv.getFloat32(o, true); o += 4;
  const xyz = new Float32Array(nMol * 9);           // per molecule: O, H1, H2 (Angstrom)
  for (let i = 0; i < nMol * 9; i++, o += 2) xyz[i] = dv.getInt16(o, true) * q;
  return new Cluster({ version, nMol, sizes, trans, q, xyz, bytes: buf.byteLength });
}

export class Cluster {
  constructor(d) { Object.assign(this, d); }
  atom(i, a) { const k = 9 * i + 3 * a; return [this.xyz[k], this.xyz[k + 1], this.xyz[k + 2]]; }   // a: 0=O,1=H1,2=H2
  // nearest stored size >= n (the page selector snaps to the published sizes)
  snap(n) { return this.sizes.find(s => s >= n) ?? this.sizes[this.sizes.length - 1]; }
  translation(n) { return this.trans[this.sizes.indexOf(this.snap(n))]; }
  center(n) {   // centroid of all atoms of the first n molecules (= origin of file h2o{n})
    const c = [0, 0, 0];
    for (let i = 0; i < n; i++) for (let a = 0; a < 3; a++) for (let k = 0; k < 3; k++) c[k] += this.xyz[9 * i + 3 * a + k];
    return c.map(v => v / (3 * n));
  }
  radius(n, c = this.center(n)) {   // max O distance from the centre
    let r = 0;
    for (let i = 0; i < n; i++) { const O = this.atom(i, 0); r = Math.max(r, Math.hypot(O[0] - c[0], O[1] - c[1], O[2] - c[2])); }
    return r;
  }
  diameter(n) {   // max O-O distance, the definition used in the paper and compute_diameter.py
    let d = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = this.atom(i, 0), b = this.atom(j, 0); d = Math.max(d, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
    return d;
  }
  // Geometric hydrogen bonds among the first n molecules: H...O < rHO, O...O < rOO, angle O-H...O > minAngle.
  // A display hint (standard geometric criterion), not a computed bond order.
  hbonds(n, { rHO = 2.5, rOO = 3.5, minAngle = 140 } = {}) {
    const out = [], cosMin = Math.cos(minAngle * Math.PI / 180);
    for (let i = 0; i < n; i++) {
      const Oi = this.atom(i, 0);
      for (let h = 1; h <= 2; h++) {
        const H = this.atom(i, h);
        for (let j = 0; j < n; j++) {
          if (j === i) continue;
          const Oj = this.atom(j, 0);
          const dOO = Math.hypot(Oj[0] - Oi[0], Oj[1] - Oi[1], Oj[2] - Oi[2]); if (dOO > rOO) continue;
          const v1 = [Oi[0] - H[0], Oi[1] - H[1], Oi[2] - H[2]], v2 = [Oj[0] - H[0], Oj[1] - H[1], Oj[2] - H[2]];
          const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2); if (l2 > rHO) continue;
          const c = (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]) / (l1 * l2);
          if (c < cosMin) out.push([i, h, j]);   // angle(O_i-H...O_j) > minAngle  <=>  cos < cos(minAngle)
        }
      }
    }
    return out;
  }
}
