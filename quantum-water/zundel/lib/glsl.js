// Shared GLSL chunks (WebGL2 / GLSL ES 3.0).
export const log8 = /* glsl */`
// inverse of q = log1p(S*rho/P)/log1p(S), q in [0,1] -> rho in bohr^-3
float decodeLog8(float q, vec3 enc) { return enc.x * (exp(q * enc.z) - 1.0) / enc.y; } // enc=(P,S,log1p(S))
`;

// Tricubic B-spline filtering from 8 trilinear fetches (Sigg & Hadwiger, GPU Gems 2 ch. 20).
// Removes the trilinear "diamond" artefacts on fields only a few voxels wide.
export const tricubic = /* glsl */`
vec4 sampleTricubic(sampler3D tex, vec3 uvw, vec3 size) {
  vec3 c = uvw * size - 0.5;
  vec3 i = floor(c), f = c - i, f2 = f * f, f3 = f2 * f, omf = 1.0 - f;
  vec3 w0 = omf * omf * omf / 6.0;
  vec3 w1 = (4.0 - 6.0 * f2 + 3.0 * f3) / 6.0;
  vec3 w2 = (1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3) / 6.0;
  vec3 w3 = f3 / 6.0;
  vec3 g0 = w0 + w1, g1 = w2 + w3;
  vec3 h0 = (i - 1.0 + w1 / g0 + 0.5) / size;
  vec3 h1 = (i + 1.0 + w3 / g1 + 0.5) / size;
  vec4 t000 = texture(tex, vec3(h0.x, h0.y, h0.z)), t100 = texture(tex, vec3(h1.x, h0.y, h0.z));
  vec4 t010 = texture(tex, vec3(h0.x, h1.y, h0.z)), t110 = texture(tex, vec3(h1.x, h1.y, h0.z));
  vec4 t001 = texture(tex, vec3(h0.x, h0.y, h1.z)), t101 = texture(tex, vec3(h1.x, h0.y, h1.z));
  vec4 t011 = texture(tex, vec3(h0.x, h1.y, h1.z)), t111 = texture(tex, vec3(h1.x, h1.y, h1.z));
  vec4 a = mix(mix(t100, t000, g0.x), mix(t110, t010, g0.x), g1.y);
  vec4 b = mix(mix(t101, t001, g0.x), mix(t111, t011, g0.x), g1.y);
  return mix(a, b, g1.z);
}
`;

export const octDecode = /* glsl */`
vec3 octDecode(vec2 e) {
  e = e * 2.0 - 1.0;
  vec3 n = vec3(e, 1.0 - abs(e.x) - abs(e.y));
  if (n.z < 0.0) n.xy = (1.0 - abs(n.yx)) * vec2(n.x >= 0.0 ? 1.0 : -1.0, n.y >= 0.0 ? 1.0 : -1.0);
  return normalize(n);
}
`;

// Ray / axis-aligned box and ray / sphere intersection.
export const intersect = /* glsl */`
vec3 safeNormalize(vec3 v) { return v / max(length(v), 1e-8); }
vec2 hitBox(vec3 ro, vec3 rd, vec3 lo, vec3 hi) {
  vec3 inv = 1.0 / rd, t0 = (lo - ro) * inv, t1 = (hi - ro) * inv;
  vec3 tmin = min(t0, t1), tmax = max(t0, t1);
  return vec2(max(max(tmin.x, tmin.y), max(tmin.z, 0.0)), min(min(tmax.x, tmax.y), tmax.z));
}
float hitSphere(vec3 ro, vec3 rd, vec3 c, float r) {   // first positive hit, or 1e9
  vec3 oc = ro - c; float b = dot(oc, rd), h = b * b - dot(oc, oc) + r * r;
  if (h < 0.0) return 1e9;
  float t = -b - sqrt(h);
  return t > 0.0 ? t : 1e9;
}
`;

// Proton look = emissive density (white core, linear in rho so the cloud stays compact)
// + three thin embedded isosurfaces at the 50/90/99 %-enclosed-probability levels, found exactly
// as sign changes of ln(rho) between ray samples. The shells give the cloud a crisp, legible
// shape and make sub-voxel displacement visible; they are data contours, not decoration.
export const protonTF = /* glsl */`
uniform vec3 uIsoLn;          // ln(iso) for 50 / 90 / 99 % enclosed
uniform vec3 uIsoAlpha;       // shell opacities
uniform float uRho50;         // density of the 50 % shell (emission reference)
uniform float uProtonGain, uProtonAbsorb;
const vec3 SHELL_COL[3] = vec3[3](vec3(1.0, 0.98, 0.95), vec3(0.86, 0.89, 0.94), vec3(0.62, 0.68, 0.78));
void protonEmit(inout vec3 col, inout float T, float rho, float ds) {
  float u = rho / uRho50;
  vec3 c = mix(vec3(0.66, 0.72, 0.82), vec3(1.0, 0.985, 0.96), smoothstep(0.1, 1.5, u));
  col += T * c * (u * uProtonGain) * ds;
  T *= exp(-uProtonAbsorb * u * ds);
}
bool protonCrosses(float a, float b) {
  return any(lessThan((vec3(a) - uIsoLn) * (vec3(b) - uIsoLn), vec3(0.0)));
}
void protonShells(inout vec3 col, inout float T, float a, float b, vec3 n, vec3 V, vec3 L) {
  float ndv = abs(dot(n, V)), fres = pow(1.0 - ndv, 2.0);
  float lit = 0.45 + 0.55 * max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + V)), 0.0), 48.0);
  for (int k = 0; k < 3; k++) {
    int i = b > a ? 2 - k : k;                       // entering: outer shell first
    if ((a - uIsoLn[i]) * (b - uIsoLn[i]) < 0.0) {
      float al = uIsoAlpha[i] * (0.25 + 0.85 * fres);
      vec3 c = SHELL_COL[i] * (lit * (0.30 + 1.2 * fres)) + vec3(spec * 0.6);
      col += T * c * al; T *= 1.0 - al;
    }
  }
}
`;

// Soft-cloud proton look (proto_C2). Two terms, both proportional to k = (rho/rho50)^gamma:
//  - self-emission, weighted toward the core (white), so the centre glows;
//  - single scattering of the key light with self-shadowing: light reaching a point is
//    exp(-shadow * column density toward the light), sampled with 4 taps. This gives the cloud a
//    lit side and a shadowed side (real 3D form) without hard edges. Extinction along the view
//    ray (absorb) lets the front halo veil the core ("fog").
// Optional single faint 90 % contour.
export const protonCloudTF = /* glsl */`
uniform float uRho50, uProtonGain, uProtonAbsorb, uGamma, uLitAmt, uContour, uShadow;
uniform vec3 uIsoLn, uHaloCol, uCoreCol;
void cloudStep(inout vec3 col, inout float T, float rho, float shadowColumn, float ds) {
  // soft floor: fade the halo to zero between 0.02 and 0.1 bohr^-3 so the cloud has no cut-off edge
  float u = rho / uRho50, k = pow(u, uGamma) * smoothstep(0.02, 0.1, rho);
  float core = smoothstep(0.4, 3.0, u);
  float Li = exp(-uShadow * shadowColumn);
  vec3 c = uCoreCol * core * uProtonGain + uHaloCol * (0.10 + Li) * uLitAmt;
  col += T * c * k * ds;
  T *= exp(-uProtonAbsorb * k * ds);
}
// cloudStep with the colour pulled toward a tint by w in [0,1], keeping the luminance (difference-density variant)
void cloudStepTint(inout vec3 col, inout float T, float rho, float shadowColumn, float ds, vec3 tint, float w, float tg) {
  float u = rho / uRho50, k = pow(u, uGamma) * smoothstep(0.02, 0.1, rho);
  float core = smoothstep(0.4, 3.0, u);
  float Li = exp(-uShadow * shadowColumn);
  vec3 c = uCoreCol * core * uProtonGain + uHaloCol * (0.10 + Li) * uLitAmt;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = mix(c, tint * lum * tg, w);       // tg < 1 keeps the tinted core below white so the hue survives ACES/bloom
  col += T * c * k * ds;
  T *= exp(-uProtonAbsorb * k * ds);
}
void cloudContour(inout vec3 col, inout float T, float a, float b, vec3 n, vec3 V, vec3 L) {
  if (uContour <= 0.0 || (a - uIsoLn.y) * (b - uIsoLn.y) >= 0.0) return;
  float fres = pow(1.0 - abs(dot(n, V)), 2.0);
  float al = uContour * (0.15 + 0.85 * fres);
  col += T * uHaloCol * (0.5 + 0.7 * max(dot(n, L), 0.0)) * al; T *= 1.0 - al;
}
`;
