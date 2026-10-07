// 40 Days — scène de l'accueil : verre nacré en « raymarching » (WebGL 2, sans bibliothèque), puis vraies
// photographies, révélées et transformées dans une goutte de verre vivante.
//
// Le récit suit les cinq chapitres de l'accueil :
//   1. une étincelle : des traits de lumière rejoignent une perle, qui se divise en 2, 4, 8 puis 16 cellules
//   2. les cellules se rassemblent en embryon, un petit cœur bat en lumière, la bulle irisée l'enveloppe
//   3. bébé grandit, lové ; des aurores colorées traversent le fond
//   4. la naissance : la bulle se déchire en pétales, bébé s'étire, et la photo d'un vrai nouveau-né éclot
//   5. fondus liquides : sa maman l'embrasse, puis le serre dans ses bras
//
// Les trois photos (Unsplash) arrivent par main.js (attribut data-photos du canvas ; source unique :
// src/content/photos.mjs, clés STORY_PHOTOS). Module chargé après le contenu, seulement si WebGL 2 est
// disponible et que la visiteuse n'a pas demandé à réduire les animations.

// ---- Réglages -------------------------------------------------------------------------------------
const FOV = 32;
const DAMPING = 0.075;             // inertie du scroll
const QUALITY = { desktop: 0.72, mobile: 0.55, min: 0.42, max: 0.9 };   // résolution de rendu (adaptative)
const YAW_REACH = -0.85;           // bébé qui s'étire : de trois-quarts face
const PHOTO_ASPECT = 0.8;          // photos au format 4:5 (largeur / hauteur)
const CHILD_CONES = 19, PARTICLES = 48;

const clamp01 = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
const bell = (a, b, v) => Math.sin(Math.PI * clamp01((v - a) / (b - a)));

// ---- Chronologie du récit (progression 0..1 sur les cinq chapitres) ---------------------------------
function timeline(p) {
  return {
    spark: smooth(0.0, 0.06, p),           // des traits de lumière rejoignent la perle
    kick: bell(0.035, 0.09, p),            // éclat de la fécondation
    divide: smooth(0.06, 0.2, p) * 4,      // 1 → 2 → 4 → 8 → 16 cellules
    shape: smooth(0.19, 0.3, p),           // les cellules deviennent un embryon
    dev: smooth(0.28, 0.56, p),            // embryon -> fœtus à terme
    limbs: smooth(0.32, 0.54, p),          // les membres poussent
    grow: smooth(0.0, 0.58, p),            // taille dans la bulle
    aurora: bell(0.36, 0.66, p),           // aurores autour de la bulle
    tremble: bell(0.55, 0.63, p),          // la bulle frémit avant de céder
    burst: smooth(0.6, 0.7, p),            // la bulle se déchire en pétales
    stretch: smooth(0.61, 0.69, p),        // bébé s'étire et tend les bras
    reveal: smooth(0.645, 0.74, p),        // la photo du nouveau-né éclot
    swap: smooth(0.79, 0.85, p) + smooth(0.89, 0.95, p),   // fondus vers les photos suivantes
    heart: 1 - smooth(0.55, 0.65, p),      // cœur lumineux pendant la grossesse
    color: smooth(0.04, 0.4, p),           // intensité des couleurs
    sun: smooth(0.0, 0.95, p),             // lever de soleil
    flash: bell(0.63, 0.71, p)
  };
}

// Recadrage lent de chaque photo (grossissement) : 1. recul, 2. approche, 3. recul qui dévoile la maman.
const photoZoom = p => [lerp(1.26, 1.1, smooth(0.66, 0.86, p)), lerp(1.08, 1.2, smooth(0.8, 0.95, p)), lerp(1.3, 1.08, smooth(0.89, 1, p))];

// Orbite de la caméra : tour lent pendant la grossesse, face à la naissance.
function camAzimuth(p, T) {
  return lerp(lerp(-0.3, 0.42, smooth(0, 0.6, p)), 0.05, T.burst);
}

// ---- Petits outils de géométrie ----------------------------------------------------------------------
const cone = (a, b, r1, r2 = r1) => [a[0], a[1], a[2], r1, b[0], b[1], b[2], r2];
const ball = (c, r) => cone(c, [c[0], c[1] + 0.003, c[2]], r, r);
const lerpPose = (A, B, t) => A.map((c, i) => c.map((v, j) => lerp(v, B[i][j], t)));

// Rotation (roulis z, puis tangage x, puis lacet y) + échelle + translation.
function transformer(pos, rx, ry, rz, s) {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
  return ([x, y, z]) => {
    let x1 = x * cz - y * sz, y1 = x * sz + y * cz, z1 = z;           // z
    let y2 = y1 * cx - z1 * sx, z2 = y1 * sx + z1 * cx, x2 = x1;      // x
    let x3 = x2 * cy + z2 * sy, z3 = -x2 * sy + z2 * cy, y3 = y2;     // y
    return [pos[0] + x3 * s, pos[1] + y3 * s, pos[2] + z3 * s];
  };
}

// Écrit une liste de cônes arrondis dans un tableau de vec4 (a.xyz, r1, b.xyz, r2), en garantissant
// une longueur supérieure à l'écart des rayons (condition de la formule du cône arrondi).
function packCones(cones, apply, scale, out) {
  cones.forEach((c, i) => {
    const a = apply([c[0], c[1], c[2]]), b = apply([c[4], c[5], c[6]]);
    let r1 = c[3] * scale, r2 = c[7] * scale;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (len <= Math.abs(r1 - r2) + 0.004) { r1 = r2 = Math.max(r1, r2); if (len < 0.002) b[1] += 0.003; }
    out.set([a[0], a[1], a[2], Math.max(r1, 0.001), b[0], b[1], b[2], Math.max(r2, 0.001)], i * 8);
  });
}

// ---- Les premières cellules ---------------------------------------------------------------------------
// Chaque division double les cellules (axe x, puis y, puis z, puis diagonale) en conservant le volume :
// l'amas reste compact, comme une petite framboise de perles. Les divisions arrivent par à-coups.
const SPLIT_AXES = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.577, 0.577, -0.577]];
function cellsPose(level) {
  const L = Math.floor(level), f = level - L;
  const e = l => (l < L ? 1 : l === L ? smooth(0.15, 0.85, f) : 0);
  const E = e(0) + e(1) + e(2) + e(3);
  const r = 0.3 * Math.pow(0.5, E / 3);
  return Array.from({ length: CHILD_CONES }, (_, i) => {
    const leaf = i % 16, c = [0, 0.05, 0];
    for (let l = 0; l < 4; l++) {
      const s = (leaf >> (3 - l)) & 1 ? 1 : -1, k = s * r * 0.95 * e(l);
      c[0] += SPLIT_AXES[l][0] * k; c[1] += SPLIT_AXES[l][1] * k; c[2] += SPLIT_AXES[l][2] * k;
    }
    return ball(c, r);
  });
}

// ---- Les poses de l'enfant (repère local : tête en haut, ventre vers +x, côté gauche vers +z) ----------
// 19 volumes : 0 tête · 1-4 colonne · 5 cœur/ventre · 6-11 bras · 12-17 jambes · 18 queue.
function limbSet(arm, leg, r) {
  const L = s => [arm.sh(s), arm.el(s), arm.ha(s)], G = s => [leg.hip(s), leg.kn(s), leg.an(s), leg.toe(s)];
  const [aL, aR] = [L(1), L(-1)], [gL, gR] = [G(1), G(-1)];
  return [
    cone(aL[0], aL[1], r.arm[0], r.arm[1]), cone(aR[0], aR[1], r.arm[0], r.arm[1]),
    cone(aL[1], aL[2], r.arm[1], r.arm[2]), cone(aR[1], aR[2], r.arm[1], r.arm[2]),
    ball(aL[2], r.hand), ball(aR[2], r.hand),
    cone(gL[0], gL[1], r.leg[0], r.leg[1]), cone(gR[0], gR[1], r.leg[0], r.leg[1]),
    cone(gL[1], gL[2], r.leg[1], r.leg[2]), cone(gR[1], gR[2], r.leg[1], r.leg[2]),
    cone(gL[2], gL[3], r.leg[2], r.foot), cone(gR[2], gR[3], r.leg[2], r.foot)
  ];
}

function embryoPose() {
  const R = 0.30, P = deg => [-0.02 + R * Math.cos(deg * Math.PI / 180), R * Math.sin(deg * Math.PI / 180), 0];
  const bud = (pos, r) => [ball(pos(1), r), ball(pos(-1), r)];
  const arm = s => [0.07, 0.10, 0.15 * s], leg = s => [0.08, -0.19, 0.13 * s];
  return [
    ball([0.05, 0.33, 0], 0.25),
    cone(P(95), P(150), 0.17, 0.17),
    cone(P(150), P(205), 0.17, 0.15),
    cone(P(205), P(255), 0.15, 0.11),
    cone(P(255), P(300), 0.11, 0.065),
    ball([0.08, 0.05, 0], 0.13),
    ...bud(arm, 0.055), ...bud(arm, 0.045), ...bud(arm, 0.04),
    ...bud(leg, 0.055), ...bud(leg, 0.045), ...bud(leg, 0.04),
    cone(P(300), P(335), 0.065, 0.025)
  ];
}

function fetusPose() {
  return [
    ball([0.07, 0.40, 0], 0.235),
    cone([-0.03, 0.20, 0], [-0.08, 0.02, 0], 0.17, 0.2),
    cone([-0.08, 0.02, 0], [-0.07, -0.18, 0], 0.2, 0.2),
    cone([-0.07, -0.18, 0], [0.0, -0.3, 0], 0.2, 0.19),
    cone([0.0, -0.3, 0], [0.05, -0.29, 0], 0.19, 0.18),
    cone([0.04, 0.08, 0], [0.06, -0.12, 0], 0.17, 0.17),
    ...limbSet(
      { sh: s => [0.0, 0.16, 0.15 * s], el: s => [0.16, -0.04, 0.2 * s], ha: s => [0.21, 0.19, 0.11 * s] },
      { hip: s => [0.02, -0.22, 0.11 * s], kn: s => [0.3, -0.03, 0.15 * s], an: s => [0.15, -0.36, 0.12 * s], toe: s => [0.25, -0.41, 0.1 * s] },
      { arm: [0.07, 0.06, 0.05], hand: 0.055, leg: [0.1, 0.075, 0.05], foot: 0.04 }),
    cone([0.0, -0.29, 0], [0.01, -0.29, 0], 0.02, 0.02)
  ];
}

// Juste né : il s'étire, bras tendus vers le haut.
function reachPose() {
  return [
    ball([0.04, 0.46, 0], 0.22),
    cone([0.0, 0.24, 0], [-0.02, 0.04, 0], 0.18, 0.2),
    cone([-0.02, 0.04, 0], [-0.02, -0.16, 0], 0.2, 0.2),
    cone([-0.02, -0.16, 0], [0.0, -0.30, 0], 0.2, 0.18),
    cone([0.0, -0.30, 0], [0.02, -0.32, 0], 0.18, 0.17),
    cone([0.03, 0.12, 0], [0.03, -0.08, 0], 0.17, 0.17),
    ...limbSet(
      { sh: s => [0.0, 0.18, 0.17 * s], el: s => [0.12, 0.36, 0.3 * s], ha: s => [0.22, 0.52, 0.24 * s] },
      { hip: s => [0.0, -0.27, 0.11 * s], kn: s => [0.12, -0.5, 0.14 * s], an: s => [0.05, -0.7, 0.12 * s], toe: s => [0.13, -0.74, 0.12 * s] },
      { arm: [0.07, 0.06, 0.05], hand: 0.055, leg: [0.1, 0.075, 0.05], foot: 0.04 }),
    cone([0.0, -0.31, 0], [0.01, -0.31, 0], 0.02, 0.02)
  ];
}

const POSES = { embryo: embryoPose(), fetus: fetusPose(), reach: reachPose() };

// ---- Shaders ----------------------------------------------------------------------------------------------
const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCamPos;
uniform mat3 uCamRot;
uniform float uTanHalf;
uniform vec2 uShift;
uniform vec4 uChild[${CHILD_CONES * 2}];
uniform vec4 uChildBound;
uniform float uChildK;
uniform float uCell;
uniform float uScene;
uniform vec4 uBubble;
uniform float uBubbleA;
uniform float uBurst;
uniform float uFlow;
uniform vec4 uHeart;
uniform vec4 uPart[${PARTICLES}];
uniform vec2 uSun;
uniform float uSunK;
uniform float uColorK;
uniform float uFlash;
uniform float uGlow;
uniform sampler2D uPhoto0;
uniform sampler2D uPhoto1;
uniform sampler2D uPhoto2;
uniform float uReveal;
uniform float uSwap;
uniform vec3 uZoom;
uniform vec2 uPhotoC;
uniform float uPhotoR;

#define PI 3.14159265

vec3 lin(vec3 c) { return c * c * (c * 0.305306 + 0.682171) + c * 0.012522; }
// Irisation « maison » : rose → lavande → aqua → or, sans le vert criard d'un arc-en-ciel complet.
vec3 film(float t) { return lin(vec3(0.8, 0.72, 0.75) + vec3(0.2, 0.2, 0.25) * cos(6.2831853 * (t + vec3(0.125, 0.4, 0.65)))); }

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }

float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2) {
  vec3 ba = b - a; float l2 = dot(ba, ba); float rr = r1 - r2; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
  vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2;
  vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv); float y2 = y * y * l2; float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

float mapChild(vec3 p) {
  float d = 1e5;
  for (int i = 0; i < ${CHILD_CONES}; i++) {
    vec4 A = uChild[2 * i], B = uChild[2 * i + 1];
    d = smin(d, sdRoundCone(p, A.xyz, B.xyz, A.w, B.w), uChildK);
  }
  return d;
}

float map(vec3 p) {
  float d = length(p - uChildBound.xyz) - uChildBound.w;
  return d < 0.2 ? mapChild(p) : d;
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0018;
  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));
}

vec2 iSphere(vec3 ro, vec3 rd, vec4 s) {
  vec3 oc = ro - s.xyz; float b = dot(oc, rd); float c = dot(oc, oc) - s.w * s.w; float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h); return vec2(-b - h, -b + h);
}

// Studio de lumière (reflets) : ciel crème, sol chaud, softbox dorée, fill lavande, filets blancs.
vec3 env(vec3 d) {
  float up = d.y * 0.5 + 0.5;
  vec3 c = mix(lin(vec3(0.45, 0.33, 0.31)), lin(vec3(1.0, 0.95, 0.9)), smoothstep(0.1, 0.9, up));
  c += lin(vec3(1.0, 0.86, 0.66)) * pow(max(dot(d, normalize(vec3(-0.5, 0.6, 0.6))), 0.0), 18.0) * 2.2;
  c += lin(vec3(0.78, 0.72, 1.0)) * pow(max(dot(d, normalize(vec3(0.85, 0.2, 0.3))), 0.0), 10.0) * 1.1;
  c += lin(vec3(1.0, 0.72, 0.58)) * pow(max(dot(d, normalize(vec3(0.2, 0.3, -1.0))), 0.0), 5.0) * 0.9;
  c += smoothstep(0.986, 1.0, dot(d, normalize(vec3(-0.85, 0.45, 0.25)))) * 3.0;
  c += smoothstep(0.992, 1.0, dot(d, normalize(vec3(0.7, 0.55, 0.45)))) * 2.0;
  return c;
}

// Fond : crème, soleil levant derrière la scène, rayons, aurores colorées, anneaux et bokeh.
vec3 background(vec2 uv) {
  float asp = uRes.x / uRes.y;
  vec2 q = (uv - uSun) * vec2(asp, 1.0);
  float r = length(q);
  vec3 cream = lin(vec3(0.984, 0.969, 0.949));
  vec3 rose = lin(vec3(0.94, 0.68, 0.66)), peach = lin(vec3(0.99, 0.74, 0.60)), gold = lin(vec3(0.99, 0.80, 0.48));
  vec3 lav = lin(vec3(0.76, 0.64, 0.95)), aqua = lin(vec3(0.55, 0.86, 0.84)), coral = lin(vec3(0.98, 0.58, 0.52));
  vec3 col = cream;
  float glow = exp(-r * r * mix(4.5, 2.4, uSunK));
  vec3 warm = mix(mix(rose, lav, 0.35), mix(peach, gold, 0.55), uSunK);
  col = mix(col, warm, glow * 0.95);
  float a = atan(q.y, q.x);
  float rays = pow(0.5 + 0.5 * sin(a * 11.0 + sin(a * 3.0 + uTime * 0.05) * 2.0 + uTime * 0.04), 8.0);
  col = mix(col, mix(gold, cream, 0.35), rays * exp(-r * 1.3) * 0.38 * (0.35 + 0.65 * uSunK));
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float y = q.y - 0.17 * (fi - 1.0) - 0.08 * sin(q.x * 3.0 + uTime * 0.12 + fi * 2.1);
    float band = exp(-y * y * 38.0) * exp(-r * r * 1.3);
    vec3 bc = fi < 0.5 ? lav : (fi < 1.5 ? aqua : coral);
    col = mix(col, bc, band * 0.72 * uColorK);
  }
  float rings = 0.0;
  for (int i = 0; i < 3; i++) { float rr = 0.32 + float(i) * 0.18; rings += exp(-pow((r - rr) * 110.0, 2.0)); }
  col = mix(col, rose * 0.88, rings * 0.16);
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    vec2 c = vec2(sin(fi * 2.4 + uTime * 0.03), cos(fi * 1.7 - uTime * 0.025)) * (0.35 + 0.08 * fi);
    float bo = smoothstep(0.06 + 0.012 * fi, 0.0, length(q - c));
    col = mix(col, film(fi * 0.21 + 0.1), bo * 0.22 * uColorK);
  }
  return col;
}

// L'enfant : nacre rosée (perles plus lumineuses au stade des cellules), lumière intérieure, cœur qui bat.
vec3 shadeChild(vec3 p, vec3 n, vec3 rd) {
  vec3 v = -rd;
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 3.0);
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float wrap = clamp((dot(n, L) + 0.6) / 1.6, 0.0, 1.0);
  float s1 = mapChild(p - n * 0.04), s2 = mapChild(p - n * 0.12);
  float thin = clamp(0.55 + (s1 + s2) * 3.2, 0.0, 1.0);
  vec3 pearl = mix(lin(vec3(0.98, 0.72, 0.66)), lin(vec3(1.0, 0.84, 0.8)), uCell);
  vec3 col = pearl * (0.32 + 0.68 * wrap);
  col += lin(vec3(1.0, 0.6, 0.45)) * thin * (0.45 + 0.75 * uGlow);
  col += lin(vec3(0.78, 0.66, 1.0)) * clamp(dot(n, normalize(vec3(0.8, 0.1, 0.4))), 0.0, 1.0) * 0.18;
  float hd = length(p - uHeart.xyz);
  col += lin(vec3(1.0, 0.38, 0.34)) * exp(-hd * hd * 14.0) * uHeart.w * 1.6;
  vec3 R = reflect(rd, n);
  col += env(R) * fres * 0.55;
  col += film(fres * 1.3 + dot(n, vec3(0.3, 0.5, 0.2)) + uTime * 0.03) * fres * (0.55 + 0.5 * uCell);
  col += pow(clamp(dot(R, L), 0.0, 1.0), 40.0) * 0.8;
  return col;
}

// La bulle : film de savon irisé qui s'écoule. À la naissance, elle se déchire depuis le haut en
// pétales, avec un liseré de lumière irisée sur le bord de la déchirure.
vec4 bubbleLayer(vec3 ro, vec3 rd, float t) {
  vec3 p = ro + rd * t;
  vec3 n = normalize(p - uBubble.xyz);
  float ndv = abs(dot(n, rd));
  float fres = pow(1.0 - ndv, 2.2);
  vec3 q = (p - uBubble.xyz) / uBubble.w;
  float th = 0.5 * sin(dot(q, vec3(2.3, 3.1, 1.7)) * 1.6 + uTime * 0.45 * uFlow)
           + 0.35 * sin(q.y * 7.0 - uTime * 0.7 * uFlow + sin(q.x * 4.0 + uTime * 0.3))
           + 0.6 * (q.y * 0.5 + 0.5);
  vec3 col = film(th + fres * 0.9) * (0.25 + 1.1 * fres) + env(reflect(rd, n)) * fres * 0.45;
  float a = clamp(0.07 + fres * 0.9, 0.0, 0.85);
  if (uBurst > 0.0) {
    float petals = 0.5 + 0.5 * sin(atan(q.z, q.x) * 5.0 + q.y * 2.5);
    float open = 0.5 - 0.5 * q.y + petals * 0.22 + 0.04 * sin(q.x * 17.0 + q.z * 13.0);
    float edge = open - (uBurst * 1.5 - 0.12);
    float rim = exp(-edge * edge * 900.0) * smoothstep(0.0, 0.08, uBurst);
    a *= smoothstep(0.0, 0.04, edge);
    col = mix(col, film(th * 2.0 + uTime * 0.2) * 1.7, rim);
    a = max(a, rim * 0.95);
  }
  return vec4(col, a * uBubbleA);
}
vec4 bubble(vec3 ro, vec3 rd, float tHit) {
  if (uBubbleA < 0.002) return vec4(0.0);
  vec2 ti = iSphere(ro, rd, uBubble);
  if (ti.x < 0.0) return vec4(0.0);
  vec4 f = bubbleLayer(ro, rd, ti.x);
  if (uBurst <= 0.0 || ti.y > tHit) return f;
  // une fois la bulle ouverte, on aperçoit la paroi du fond à travers la déchirure
  vec4 b = bubbleLayer(ro, rd, ti.y);
  float A = f.a + b.a * (1.0 - f.a);
  return vec4((f.rgb * f.a + b.rgb * b.a * (1.0 - f.a)) / max(A, 1e-4), A);
}

// ---- Les photographies, dans une goutte de verre vivante ----
// q : position dans la goutte (rayon 1 = demi-hauteur), zoom : recadrage lent.
vec3 photoAt(int k, vec2 q, float zoom) {
  vec2 uv = vec2(0.5 + q.x * 0.5 / (${PHOTO_ASPECT.toFixed(3)} * zoom), 0.5 - q.y * 0.5 / zoom);
  vec3 c = k == 0 ? texture(uPhoto0, uv).rgb : (k == 1 ? texture(uPhoto1, uv).rgb : texture(uPhoto2, uv).rgb);
  return lin(c);
}
// Près du bord, le verre courbe la lumière : léger effet de loupe et dispersion des couleurs.
vec3 photoGlass(int k, vec2 q, float zoom, float edge) {
  float s = edge * edge * 0.09;
  return vec3(photoAt(k, q * (1.0 - s * 0.6), zoom).r, photoAt(k, q * (1.0 - s), zoom).g, photoAt(k, q * (1.0 - s * 1.45), zoom).b);
}
// Passage d'une photo à la suivante : 1 → 2 en encre lumineuse qui gagne depuis le centre,
// 2 → 3 en tourbillon qui dévoile la dernière image en spirale.
vec3 photoMix(vec2 q, float edge) {
  float s = clamp(uSwap, 0.0, 2.0);
  int k = s < 1.0 ? 0 : 1;
  float t = s - float(k);
  float zA = k == 0 ? uZoom.x : uZoom.y, zB = k == 0 ? uZoom.y : uZoom.z;
  if (t < 0.001) return photoGlass(k, q, zA, edge);
  if (t > 0.999) return photoGlass(k + 1, q, zB, edge);
  float r = length(q), a = atan(q.y, q.x);
  float n = fbm(q * 2.3 + float(k) * 7.0 + uTime * 0.05);
  vec2 dq; float f, th;
  if (k == 0) {
    f = n * 0.7 + r * 0.42; th = t * 1.25 - 0.02;
    dq = (vec2(fbm(q * 3.1 + 3.0), fbm(q * 3.1 + 9.0)) - 0.5) * 0.4;
  } else {
    f = r * 0.8 + 0.12 * sin(a * 3.0 + r * 9.0) + n * 0.22; th = t * 1.4 - 0.08;
    float sw = sin(PI * t) * (1.3 - min(r, 1.3)) * 1.8;
    dq = vec2(cos(a + sw), sin(a + sw)) * r - q;
  }
  vec3 A = photoGlass(k, q + dq * t, zA, edge);
  vec3 B = photoGlass(k + 1, q - dq * (1.0 - t), zB, edge);
  float m = 1.0 - smoothstep(th - 0.045, th + 0.045, f);
  vec3 col = mix(A, B, m);
  float front = exp(-pow((f - th) / 0.03, 2.0)) * sin(PI * t);
  return col + film(f * 3.0 + uTime * 0.2) * front * 1.5;
}
vec3 photoOver(vec3 base, vec2 px) {
  vec2 q = (px - uPhotoC) / uPhotoR;
  float ang = atan(q.y, q.x);
  float wob = 0.03 * sin(3.0 * ang + uTime * 0.6) + 0.02 * sin(5.0 * ang - uTime * 0.45) + 0.012 * sin(9.0 * ang + uTime * 0.8);
  float rough = (fbm(q * 2.6 + uTime * 0.25) - 0.5) * 0.7 * (1.0 - uReveal);
  float d = length(q / vec2(0.84, 1.0)) - (1.0 + wob + rough) * uReveal;
  float aa = 1.6 / uPhotoR;
  float alpha = 1.0 - smoothstep(-aa, aa, d);
  float edge = smoothstep(-0.24, 0.0, d);
  // dehors : ombre rosée et halo irisé autour de la goutte
  float o = max(d, 0.0);
  vec3 col = mix(base, base * lin(vec3(0.92, 0.78, 0.76)), exp(-o * 8.0) * 0.38 * uReveal);
  col += film(ang * 0.16 + uTime * 0.04) * exp(-o * 15.0) * 0.2 * uReveal;
  if (alpha > 0.0) {
    vec3 inside = photoMix(q, edge);
    inside = mix(inside, inside * lin(vec3(1.0, 0.9, 0.88)), edge * 0.45);
    // reflets du verre : une fenêtre de lumière en haut à gauche, un filet en bas à droite
    float dirL = dot(normalize(q + 1e-4), normalize(vec2(-0.62, 0.78)));
    inside += smoothstep(0.82, 1.0, dirL) * smoothstep(-0.16, -0.03, d) * (1.0 - smoothstep(-0.03, 0.0, d)) * 0.35;
    inside += smoothstep(0.9, 1.0, -dirL) * smoothstep(-0.07, -0.01, d) * 0.18;
    // à l'éclosion, la goutte est encore pleine de lumière
    inside += film(d * 6.0 + uTime * 0.3) * edge * (1.0 - uReveal) * 1.4;
    col = mix(col, inside, alpha);
  }
  float rim = exp(-pow(d / 0.016, 2.0)) * uReveal;
  return mix(col, film(ang * 0.32 + uTime * 0.06 + q.y * 0.4) * 1.35, rim * 0.7);
}

// Particules de lumière : étincelles, poussière, aurores, gouttelettes.
vec3 particles(vec3 ro, vec3 rd, float tMax) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < ${PARTICLES}; i++) {
    vec4 P = uPart[i];
    if (P.w <= 0.0005) continue;
    vec3 op = P.xyz - ro;
    float t = dot(op, rd);
    if (t < 0.0 || t > tMax) continue;
    float d2 = max(dot(op, op) - t * t, 0.0);
    float s2 = P.w * P.w;
    float g = exp(-d2 / s2) + 0.22 * exp(-d2 / (s2 * 9.0));
    vec3 c = mix(film(float(i) * 0.137 + uTime * 0.04), vec3(1.0, 0.92, 0.78), 0.3);
    acc += c * g * 0.55;
  }
  return acc;
}

void main() {
  vec2 uv = vUv;
  vec2 ndc = uv * 2.0 - 1.0;
  float asp = uRes.x / uRes.y;
  vec3 right = uCamRot[0], up = uCamRot[1], fwd = uCamRot[2];
  vec3 rd = normalize(fwd + (ndc.x - uShift.x) * asp * uTanHalf * right + (ndc.y - uShift.y) * uTanHalf * up);
  vec3 ro = uCamPos;

  vec3 col = background(uv);
  float tHit = 1e5;
  if (uScene > 0.5) {
    vec2 tb = iSphere(ro, rd, uChildBound);
    if (tb.y > 0.0) {
      float t = max(tb.x, 0.0);
      bool hit = false;
      for (int i = 0; i < 110; i++) {
        if (t > tb.y) break;
        float h = map(ro + rd * t);
        if (h < 0.0011 * t + 0.0004) { hit = true; break; }
        t += h * 0.88;
      }
      if (hit) {
        vec3 p = ro + rd * t;
        col = shadeChild(p, normalAt(p), rd);
        tHit = t;
      }
    }
    // Halo du cœur, visible à travers le corps.
    if (uHeart.w > 0.01) {
      vec3 op = uHeart.xyz - ro; float t = dot(op, rd);
      float d2 = max(dot(op, op) - t * t, 0.0);
      col += lin(vec3(1.0, 0.45, 0.4)) * exp(-d2 * 45.0) * 0.3 * uHeart.w;
    }
    vec4 b = bubble(ro, rd, tHit);
    col = col * (1.0 - b.a * 0.4) + b.rgb * b.a;
  }
  if (uReveal > 0.001) { col = photoOver(col, uv * uRes); tHit = 1e5; }
  col += particles(ro, rd, tHit);
  float fd = length((uv - uSun) * vec2(asp, 1.0));
  col += lin(vec3(1.0, 0.8, 0.72)) * uFlash * (exp(-fd * fd * 9.0) * 0.26 + 0.02);
  col = col / (1.0 + max(col - 0.92, 0.0) * 1.6);
  outColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

// ---- La scène --------------------------------------------------------------------------------------------
export function createHomeScene({ canvas, rtl = false, mobile = false, photos = [], onHeld } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('WebGL 2 indisponible');

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uCamPos', 'uCamRot', 'uTanHalf', 'uShift', 'uChild', 'uChildBound', 'uChildK', 'uCell', 'uScene',
    'uBubble', 'uBubbleA', 'uBurst', 'uFlow', 'uHeart', 'uPart', 'uSun', 'uSunK', 'uColorK', 'uFlash', 'uGlow',
    'uPhoto0', 'uPhoto1', 'uPhoto2', 'uReveal', 'uSwap', 'uZoom', 'uPhotoC', 'uPhotoR']
    .forEach(name => { U[name] = gl.getUniformLocation(program, name); });
  [0, 1, 2].forEach(k => gl.uniform1i(U['uPhoto' + k], k));

  // ---- Les photographies (chargées tout de suite, en parallèle de la 3D) ----
  const photoReady = [0, 0, 0];
  const loadPhoto = (url, k) => new Promise(resolve => {
    if (!url) return resolve(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      gl.activeTexture(gl.TEXTURE0 + k);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      photoReady[k] = 1;
      resolve(true);
    };
    img.onerror = () => { console.warn('[40 Days] Photo du récit indisponible :', url); resolve(false); };
    img.src = url;
  });
  const ready = Promise.all([0, 1, 2].map(k => loadPhoto(photos[k], k))).then(() => true);

  const childData = new Float32Array(CHILD_CONES * 8);
  const partData = new Float32Array(PARTICLES * 4);
  const seeds = Array.from({ length: PARTICLES }, (_, i) => {
    const r = n => (Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
    const rnd = n => Math.abs(r(n));
    const th = rnd(1) * Math.PI * 2, ph = Math.acos(rnd(2) * 2 - 1);
    return { dir: [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)], a: rnd(3), b: rnd(4), c: rnd(5) };
  });

  // ---- État ----
  const size = { w: 1, h: 1 };
  let quality = mobile ? QUALITY.mobile : QUALITY.desktop;
  let target = 0, progress = 0, intro = 0, introStart = null;
  let pointer = { x: 0, y: 0 }, ps = { x: 0, y: 0 };
  let held = false, running = false, raf = 0, lastFrame = 0, lastInput = performance.now();
  let capture = false, frameAvg = 16, lastTime = performance.now(), clockStart = performance.now();

  function setUniforms(p, time) {
    const T = timeline(p);
    const introK = smooth(0, 1, intro);

    // --- l'enfant : cellules, embryon, fœtus, puis bébé qui s'étire ---
    const growPose = lerpPose(POSES.embryo, POSES.fetus, T.dev);
    const limbsPose = lerpPose(POSES.embryo, POSES.fetus, T.limbs);     // les membres poussent un peu après le corps
    const devPose = growPose.map((c, i) => (i >= 6 && i <= 17 ? limbsPose[i] : c));
    const formed = lerpPose(cellsPose(T.divide), devPose, T.shape);
    const pose = lerpPose(formed, POSES.reach, T.stretch);
    const scale = lerp(lerp(0.85, 1.12, T.grow), 0.92, T.stretch) * lerp(0.82, 1, introK) * lerp(0.75, 1, T.spark);
    const float = Math.sin(time * 0.6) * 0.025;
    const pos = [0, 0.05 + float + T.stretch * 0.08, 0];
    const camAz = camAzimuth(p, T);
    // les cellules tournent sur elles-mêmes ; l'enfant se montre ensuite de profil, en tournant doucement
    const spin = time * 0.3 + p * 14;
    const lazy = camAz + 0.38 * Math.sin(time * 0.22 + p * 6);
    const yaw = lerp(lerp(spin, lazy, T.shape), camAz + YAW_REACH, T.stretch);
    const pitch = 0.08 * Math.sin(time * 0.2) + (1 - T.shape) * 0.35 * Math.sin(time * 0.17 + p * 5);
    const roll = 0.1 * Math.sin(time * 0.17) * (1 - T.stretch);
    packCones(pose, transformer(pos, pitch, yaw, roll, scale), scale, childData);

    // --- la bulle (la membrane de la première cellule, puis la poche des eaux) ---
    const bubbleR = lerp(0.56, 1.04, T.grow) * (1 + T.burst * 0.12) * (1 + Math.sin(time * 14) * 0.012 * T.tremble) * lerp(0.9, 1, introK);
    const bubbleA = introK * (1 - smooth(0.85, 1, T.burst));

    // --- particules ---
    const ry = (v, a) => [v[0] * Math.cos(a) - v[2] * Math.sin(a), v[1], v[0] * Math.sin(a) + v[2] * Math.cos(a)];
    for (let i = 0; i < PARTICLES; i++) {
      const s = seeds[i];
      let x, y, z, w;
      if (i < 10 && T.spark < 1) {                   // étincelles : elles rejoignent la perle en spirale
        const rad = lerp(1.7 + s.c * 0.6, 0, Math.pow(T.spark, 1.4));
        [x, y, z] = ry([s.dir[0] * rad, s.dir[1] * rad * 0.7, s.dir[2] * rad], time * 0.4 + T.spark * 4 + s.b * 6.28);
        y += pos[1];
        w = (0.022 + 0.02 * s.a) * (1 - smooth(0.8, 1, T.spark)) * introK;
      } else if (i < 16) {                           // poussière de lumière
        const ang = time * (0.05 + s.a * 0.08) + s.b * 6.28;
        const rad = 1.15 + s.c * 0.9;
        x = Math.cos(ang) * rad; z = Math.sin(ang) * rad * 0.7; y = Math.sin(time * 0.2 + s.a * 6.28) * 0.8 + (s.b - 0.5) * 0.6;
        w = (0.016 + s.c * 0.016) * (i < 10 ? smooth(0.07, 0.12, p) : 1);
      } else if (i < 32) {                           // aurores autour de la bulle
        const ang = time * 0.7 + i * 0.39 + p * 9;
        const h = Math.sin(time * 0.5 + i * 0.8) * 0.7;
        const rad = bubbleR * (1.12 + 0.08 * Math.sin(i + time));
        const k = Math.sqrt(1 - Math.min(h * h, 0.9));
        x = Math.cos(ang) * rad * k; z = Math.sin(ang) * rad * k; y = 0.05 + h * rad;
        w = 0.03 * T.aurora;
      } else {                                       // gouttelettes de la bulle, puis lucioles autour des photos
        // chaque gouttelette se détache quand la déchirure passe sur elle, puis s'envole
        const loc = clamp01((T.burst * 1.5 - 0.12 - (0.5 - 0.5 * s.dir[1])) / 0.45);
        const out = bubbleR * (1 + loc * (0.35 + s.a * 1.1));
        [x, y, z] = ry([s.dir[0] * out, s.dir[1] * out, s.dir[2] * out], time * 0.05 * T.reveal);
        y += 0.05 + loc * (0.15 + s.b * 0.25);
        w = Math.max((0.035 + s.c * 0.035) * Math.sin(Math.PI * loc), 0.02 * T.reveal * (0.55 + 0.45 * Math.sin(time * 1.7 + i)));
      }
      partData.set([x, y, z, w], i * 4);
    }

    // --- caméra et cadrage ---
    const aspect = size.w / size.h;
    const portrait = clamp01((1.05 - aspect) / 0.35);
    const radius = lerp(lerp(0.8, 1.08, T.grow), 1.12, T.burst);
    const tanHalf = Math.tan((FOV / 2) * Math.PI / 180);
    let shift = [0, 0], distance;
    if (capture) {
      distance = radius / (0.82 * tanHalf * Math.min(1, aspect));
    } else {
      shift = [(rtl ? -1 : 1) * 0.46 * (1 - portrait), 0.4 * portrait];
      const land = Math.max(radius / (0.66 * tanHalf), radius / (0.5 * tanHalf * aspect));
      const port = Math.max(radius / (0.86 * tanHalf * aspect), radius / (0.42 * tanHalf));
      distance = lerp(land, port, portrait);
    }
    const focus = [0, 0.05, 0];
    const az = camAz * (rtl ? -1 : 1) + ps.x * 0.1;
    const el = 0.08 + ps.y * 0.05;
    const cam = [focus[0] + Math.sin(az) * Math.cos(el) * distance, focus[1] + Math.sin(el) * distance, focus[2] + Math.cos(az) * Math.cos(el) * distance];
    const f = norm([focus[0] - cam[0], focus[1] - cam[1], focus[2] - cam[2]]);
    const r = norm(cross(f, [0, 1, 0]));
    const u = cross(r, f);

    // --- la goutte des photos : centrée sur la scène, à la taille de l'écran ---
    const W = canvas.width, H = canvas.height;
    const photoR = capture ? 0.46 * Math.min(W, H) : lerp(Math.min(0.4 * H, 0.3 * W), Math.min(0.21 * H, 0.43 * W), portrait);
    const reveal = T.reveal * photoReady[0];
    const swap = Math.min(T.swap, photoReady[1] ? (photoReady[2] ? 2 : 1) : 0);

    gl.uniform2f(U.uRes, W, H);
    gl.uniform1f(U.uTime, time);
    gl.uniform3fv(U.uCamPos, cam);
    gl.uniformMatrix3fv(U.uCamRot, false, [...r, ...u, ...f]);
    gl.uniform1f(U.uTanHalf, tanHalf);
    gl.uniform2fv(U.uShift, shift);
    gl.uniform4fv(U.uChild, childData);
    gl.uniform4f(U.uChildBound, pos[0], pos[1], pos[2], 0.85 * scale);
    gl.uniform1f(U.uChildK, lerp(0.035, 0.05, T.shape) * scale);
    gl.uniform1f(U.uCell, 1 - T.shape);
    gl.uniform1f(U.uScene, reveal < 0.999 ? 1 : 0);
    gl.uniform4f(U.uBubble, 0, 0.05, 0, bubbleR);
    gl.uniform1f(U.uBubbleA, bubbleA);
    gl.uniform1f(U.uBurst, T.burst);
    gl.uniform1f(U.uFlow, 1 + T.tremble * 2.5 + T.aurora * 0.8);
    const beat = time * 1.15 % 1;
    const pulse = Math.exp(-Math.pow(beat * 9, 2)) + 0.6 * Math.exp(-Math.pow((beat - 0.2) * 9, 2));
    const chest = childData.subarray(5 * 8, 5 * 8 + 3);
    gl.uniform4f(U.uHeart, chest[0], chest[1], chest[2] + 0.02, (0.35 + 0.65 * pulse) * T.heart * lerp(0.25, 1, T.shape) * introK);
    gl.uniform4fv(U.uPart, partData);
    gl.uniform2f(U.uSun, 0.5 + shift[0] * 0.5, 0.5 + shift[1] * 0.5);
    gl.uniform1f(U.uSunK, T.sun);
    gl.uniform1f(U.uColorK, 0.35 + 0.65 * T.color);
    gl.uniform1f(U.uFlash, Math.max(T.flash, T.kick * 0.7));
    gl.uniform1f(U.uGlow, introK * (0.6 + 0.4 * T.heart) + T.flash * 0.35 + T.kick * 0.6);
    gl.uniform1f(U.uReveal, reveal);
    gl.uniform1f(U.uSwap, swap);
    gl.uniform3fv(U.uZoom, photoZoom(p));
    gl.uniform2f(U.uPhotoC, (0.5 + shift[0] * 0.5) * W + ps.x * 0.012 * W, (0.5 + shift[1] * 0.5) * H - ps.y * 0.012 * H);
    gl.uniform1f(U.uPhotoR, photoR);

    const isHeld = p > 0.93;
    if (isHeld !== held) { held = isHeld; if (onHeld) onHeld(held); }
  }

  function render(now = performance.now()) {
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const time = (now - clockStart) / 1000;
    const k = 1 - Math.pow(1 - DAMPING, delta * 60);
    progress += (target - progress) * k;
    if (Math.abs(target - progress) < 0.0004) progress = target;
    ps.x += (pointer.x - ps.x) * k;
    ps.y += (pointer.y - ps.y) * k;
    if (introStart === null) introStart = time;
    intro = clamp01((time - introStart) / 2.2);
    setUniforms(progress, time);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Résolution adaptative : on baisse si l'image prend trop de temps, on remonte si tout est fluide.
  function adapt(frameMs) {
    frameAvg = frameAvg * 0.92 + frameMs * 0.08;
    let next = quality;
    if (frameAvg > 24 && quality > QUALITY.min) next = quality - 0.06;
    else if (frameAvg < 13 && quality < QUALITY.max) next = quality + 0.03;
    if (Math.abs(next - quality) > 0.001) { quality = next; frameAvg = 18; resize(); }
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const busy = Math.abs(target - progress) > 0.0005 || now - lastInput < 1500 || intro < 1;
    const fps = busy ? 60 : 30;
    if (lastFrame && now - lastFrame < 1000 / fps - 2) return;
    if (lastFrame && busy) adapt(now - lastFrame);
    lastFrame = now;
    render(now);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    size.w = Math.max(1, rect.width);
    size.h = Math.max(1, rect.height);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
    canvas.width = Math.max(1, Math.round(size.w * ratio));
    canvas.height = Math.max(1, Math.round(size.h * ratio));
  }

  resize();

  const api = {
    setProgress(p) { target = clamp01(p); lastInput = performance.now(); },
    setPointer(x, y) { pointer.x = x; pointer.y = y; lastInput = performance.now(); },
    resize,
    start() { if (running) return; running = true; lastTime = performance.now(); lastFrame = 0; raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { render(); },
    ready,
    get progress() { return progress; },
    get quality() { return quality; },
    // Contrôle qualité : place le récit sans inertie.
    snap(p) { target = progress = clamp01(p); intro = 1; introStart = -10; render(); },
    // Image fixe du récit, scène centrée (images de secours, images de partage).
    async capture(p, width, height, type = 'image/webp', q = 0.86) {
      await ready;
      const wasRunning = running;
      api.stop();
      capture = true;
      canvas.width = width; canvas.height = height; size.w = width; size.h = height;
      target = progress = clamp01(p); intro = 1; introStart = -10;
      pointer = { x: 0, y: 0 }; ps = { x: 0, y: 0 };
      const blob = await new Promise(resolve => { render(); canvas.toBlob(resolve, type, q); });
      capture = false;
      resize();
      if (wasRunning) api.start();
      return blob;
    },
    dispose() { api.stop(); gl.getExtension('WEBGL_lose_context')?.loseContext(); }
  };
  return api;
}

function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
