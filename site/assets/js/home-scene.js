// 40 Days — scène 3D de l'accueil : sculpture de verre en « raymarching » (WebGL 2, sans bibliothèque).
//
// Toutes les formes sont des volumes calculés dans le shader et fondus les uns dans les autres
// (fonctions de distance signée), ce qui permet de les faire pousser et se transformer sans
// aucune coupure. Le récit suit les cinq chapitres de l'accueil :
//   1. l'embryon, dans une bulle de verre irisée ; un petit cœur bat en lumière
//   2. il prend forme : bras et jambes poussent, la queue se résorbe, la tête trouve ses proportions
//   3. bébé grandit, lové ; des aurores colorées tournent autour de la bulle
//   4. la naissance : la bulle éclate en gouttelettes irisées, bébé s'étire et tend les bras
//   5. une maman de verre prismatique se condense dans la lumière, l'accueille et le serre dans ses bras
//
// Le style reprend le verre du moteur « Premium 3D Glass » (irisation, dispersion, studio de lumière).
// Module chargé par main.js après le contenu, seulement si WebGL 2 est disponible et que la
// visiteuse n'a pas demandé à réduire les animations.

// ---- Réglages -------------------------------------------------------------------------------------
const FOV = 32;
const DAMPING = 0.06;              // inertie du scroll
const QUALITY = { desktop: 0.72, mobile: 0.55, min: 0.42, max: 0.9 };   // résolution de rendu (adaptative)
const YAW_REACH = -0.85;            // bébé qui s'étire : de trois-quarts face
const CHILD_CONES = 19, MOM_CONES = 16, PARTICLES = 48;

const clamp01 = v => Math.min(1, Math.max(0, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
const bell = (a, b, v) => Math.sin(Math.PI * clamp01((v - a) / (b - a)));

// ---- Chronologie du récit (progression 0..1 sur les cinq chapitres) ---------------------------------
function timeline(p) {
  return {
    dev: smooth(0.04, 0.58, p),            // embryon -> fœtus à terme
    limbs: smooth(0.16, 0.52, p),          // les membres poussent
    grow: smooth(0.0, 0.6, p),             // taille dans la bulle
    aurora: bell(0.36, 0.68, p),           // aurores autour de la bulle
    tremble: bell(0.58, 0.67, p),          // la bulle frémit avant de céder
    burst: smooth(0.64, 0.74, p),           // la bulle éclate
    stretch: smooth(0.66, 0.76, p),        // bébé s'étire et tend les bras
    mom: smooth(0.70, 0.84, p),            // la maman se forme
    hold: smooth(0.79, 0.90, p),           // elle le prend dans ses bras
    heart: 1 - smooth(0.58, 0.68, p),      // cœur lumineux pendant la grossesse
    color: smooth(0.08, 0.45, p),          // intensité des couleurs
    sun: smooth(0.0, 0.95, p),             // lever de soleil
    flash: bell(0.67, 0.74, p)
  };
}

// Orbite de la caméra : tour lent pendant la grossesse, face à la naissance, trois-quarts pour la maman.
function camAzimuth(p, T) {
  return lerp(lerp(-0.3, 0.42, smooth(0, 0.6, p)), 0.05, T.burst) * (1 - T.mom) - 1.0 * T.mom;
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

// Blotti contre le cœur de sa maman : tête sur sa poitrine, mains contre elle, jambes repliées.
function heldPose() {
  return [
    ball([0.05, 0.42, 0], 0.225),
    cone([-0.02, 0.22, 0], [-0.05, 0.03, 0], 0.18, 0.2),
    cone([-0.05, 0.03, 0], [-0.04, -0.17, 0], 0.2, 0.2),
    cone([-0.04, -0.17, 0], [0.02, -0.29, 0], 0.19, 0.18),
    cone([0.02, -0.29, 0], [0.05, -0.3, 0], 0.18, 0.17),
    cone([0.03, 0.1, 0], [0.04, -0.1, 0], 0.17, 0.17),
    cone([0.0, 0.17, 0.17], [0.16, 0.06, 0.2], 0.07, 0.06), cone([0.0, 0.17, -0.17], [0.16, 0.06, -0.2], 0.07, 0.06),
    cone([0.16, 0.06, 0.2], [0.24, 0.26, 0.11], 0.06, 0.05), cone([0.16, 0.06, -0.2], [0.24, 0.24, -0.11], 0.06, 0.05),
    ball([0.24, 0.26, 0.11], 0.055), ball([0.24, 0.24, -0.11], 0.055),
    cone([0.02, -0.24, 0.11], [0.26, -0.22, 0.14], 0.1, 0.075), cone([0.02, -0.24, -0.11], [0.26, -0.24, -0.14], 0.1, 0.075),
    cone([0.26, -0.22, 0.14], [0.12, -0.42, 0.12], 0.07, 0.05), cone([0.26, -0.24, -0.14], [0.12, -0.44, -0.12], 0.07, 0.05),
    cone([0.12, -0.42, 0.12], [0.2, -0.47, 0.1], 0.05, 0.04), cone([0.12, -0.44, -0.12], [0.2, -0.49, -0.1], 0.05, 0.04),
    cone([0.0, -0.29, 0], [0.01, -0.29, 0], 0.02, 0.02)
  ];
}

// ---- La maman (repère local : poitrine à l'origine, regard vers +z) ------------------------------------
// 16 volumes : 0 tête · 1 chevelure · 2 chignon · 3 cou · 4-5 épaules · 6 buste ·
// 7-8 bras · 9-10 avant-bras · 11-12 mains · 13 menton · 14 nez · 15 taille.
function momFace(cradle) {
  const head = cradle ? [-0.07, 0.87, 0.12] : [0.0, 0.93, 0.09];
  const f = cradle ? [-0.12, -0.72, 0.68] : [0.0, -0.22, 0.975];      // regard : vers son bébé
  return { head, f };
}
function momPose(cradle) {
  const { head, f } = momFace(cradle);
  const at = (k, dx = 0, dy = 0, dz = 0) => [head[0] + f[0] * k + dx, head[1] + f[1] * k + dy, head[2] + f[2] * k + dz];
  // Bras ouverts pour accueillir, puis refermés autour du bébé : main droite dans son dos, gauche sous lui.
  const shR = [-0.3, 0.5, 0.0], shL = [0.3, 0.5, 0.0];
  const elR = cradle ? [-0.43, 0.22, 0.25] : [-0.4, 0.2, 0.34], elL = cradle ? [0.37, 0.15, 0.2] : [0.4, 0.2, 0.34];
  const wrR = cradle ? [-0.22, 0.38, 0.53] : [-0.22, 0.3, 0.7], wrL = cradle ? [0.05, 0.15, 0.46] : [0.22, 0.3, 0.7];
  const tipR = cradle ? [-0.06, 0.45, 0.55] : [-0.13, 0.34, 0.84], tipL = cradle ? [-0.1, 0.17, 0.46] : [0.13, 0.34, 0.84];
  return [
    cone(at(-0.03, 0, 0.05, 0), at(0.03, 0, -0.05, 0), 0.15, 0.142),            // tête, ovale du visage
    cone(at(-0.04, 0, 0.045, 0), at(-0.09, 0, 0.0, 0), 0.152, 0.148),           // chevelure (sommet et arrière)
    ball(at(-0.2, 0, 0.07, 0), 0.098),                                           // chignon, derrière la tête
    cone([0.0, 0.58, -0.01], [0.0, 0.78, 0.04], 0.062, 0.056),                   // cou
    cone([-0.02, 0.6, -0.02], shR, 0.07, 0.085),                                 // épaule droite, tombante
    cone([0.02, 0.6, -0.02], shL, 0.07, 0.085),                                  // épaule gauche
    cone([0.0, 0.44, 0.02], [0.0, 0.18, 0.04], 0.2, 0.185),                      // buste
    cone(shR, elR, 0.07, 0.058), cone(shL, elL, 0.07, 0.058),
    cone(elR, wrR, 0.058, 0.046), cone(elL, wrL, 0.058, 0.046),
    cone(wrR, tipR, 0.046, 0.034), cone(wrL, tipL, 0.046, 0.034),
    cone(at(0.06, 0, -0.085, 0), at(0.09, 0, -0.1, 0), 0.06, 0.05),              // menton
    ball(at(0.148, 0, -0.025, 0), 0.036),                                        // nez
    cone([0.0, 0.16, 0.0], [0.0, -0.14, 0.0], 0.18, 0.19)                        // taille, qui se fond dans la lumière
  ];
}

const POSES = {
  embryo: embryoPose(), fetus: fetusPose(), reach: reachPose(), held: heldPose(),
  momOpen: momPose(false), momCradle: momPose(true)
};
const MOM_ORIGIN = [0.1, -0.29, -0.36];   // le bébé blotti (−0.1, 0.42, 0.36) se trouve alors en (0, 0.13, 0)

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
uniform vec4 uMom[${MOM_CONES * 2}];
uniform vec4 uChildBound;
uniform vec4 uMomBound;
uniform vec4 uSceneBound;
uniform float uMomForm;
uniform float uMomBaseY;
uniform vec4 uBubble;
uniform float uBubbleA;
uniform float uBurst;
uniform float uFlow;
uniform vec4 uHeart;
uniform float uHeartGold;
uniform vec4 uPart[${PARTICLES}];
uniform vec2 uSun;
uniform float uSunK;
uniform float uColorK;
uniform float uFlash;
uniform float uGlow;
uniform float uChildK;
uniform vec3 uHeadPos;
uniform vec3 uFaceDir;

#define PI 3.14159265

vec3 lin(vec3 c) { return c * c * (c * 0.305306 + 0.682171) + c * 0.012522; }
// Irisation « maison » : rose → lavande → aqua → or, sans le vert criard d'un arc-en-ciel complet.
vec3 film(float t) { return lin(vec3(0.8, 0.72, 0.75) + vec3(0.2, 0.2, 0.25) * cos(6.2831853 * (t + vec3(0.125, 0.4, 0.65)))); }

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

float wisp(vec3 p) { return sin(p.x * 7.0 + uTime * 1.3) * sin(p.y * 6.0 - uTime * 0.9) * sin(p.z * 8.0 + uTime * 1.1); }

float mapMom(vec3 p) {
  float d = 1e5;
  for (int i = 0; i < ${MOM_CONES}; i++) {
    vec4 A = uMom[2 * i], B = uMom[2 * i + 1];
    d = smin(d, sdRoundCone(p, A.xyz, B.xyz, A.w, B.w), i < 3 ? 0.035 : 0.07);
  }
  float f = uMomForm;
  d += (1.0 - f) * 0.5 + wisp(p) * 0.1 * (1.0 - f);
  // La sculpture se fond dans la lumière vers la taille.
  float cut = uMomBaseY + 0.03 - p.y;
  float hk = max(0.05 - abs(d - cut), 0.0) / 0.05;
  d = max(d, cut) + hk * hk * 0.0125;
  return d;
}

vec2 map(vec3 p) {
  float dc = length(p - uChildBound.xyz) - uChildBound.w;
  if (dc < 0.2) dc = mapChild(p);
  float dm = 1e5;
  if (uMomForm > 0.002) {
    dm = length(p - uMomBound.xyz) - uMomBound.w;
    if (dm < 0.2) dm = mapMom(p);
  }
  return dc < dm ? vec2(dc, 1.0) : vec2(dm, 2.0);
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0018;
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
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

// L'enfant : nacre rosée, lumière intérieure dorée, cœur qui bat, reflets irisés.
vec3 shadeChild(vec3 p, vec3 n, vec3 rd) {
  vec3 v = -rd;
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 3.0);
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float wrap = clamp((dot(n, L) + 0.6) / 1.6, 0.0, 1.0);
  float s1 = mapChild(p - n * 0.04), s2 = mapChild(p - n * 0.12);
  float thin = clamp(0.55 + (s1 + s2) * 3.2, 0.0, 1.0);
  vec3 pearl = lin(vec3(0.98, 0.72, 0.66));
  vec3 col = pearl * (0.32 + 0.68 * wrap);
  col += lin(vec3(1.0, 0.6, 0.45)) * thin * (0.45 + 0.75 * uGlow);
  col += lin(vec3(0.78, 0.66, 1.0)) * clamp(dot(n, normalize(vec3(0.8, 0.1, 0.4))), 0.0, 1.0) * 0.18;
  float hd = length(p - uHeart.xyz);
  vec3 heartCol = mix(lin(vec3(1.0, 0.38, 0.34)), lin(vec3(1.0, 0.7, 0.45)), uHeartGold);
  col += heartCol * exp(-hd * hd * mix(14.0, 30.0, uHeartGold)) * uHeart.w * mix(1.6, 0.7, uHeartGold);
  vec3 R = reflect(rd, n);
  col += env(R) * fres * 0.55;
  col += film(fres * 1.3 + dot(n, vec3(0.3, 0.5, 0.2)) + uTime * 0.03) * fres * 0.55;
  col += pow(clamp(dot(R, L), 0.0, 1.0), 40.0) * 0.8;
  return col;
}

// La maman : verre clair prismatique (dispersion), lumière intérieure douce, liseré arc-en-ciel.
vec3 shadeMom(vec3 p, vec3 n, vec3 rd, vec2 uv) {
  vec3 v = -rd;
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  vec3 right = uCamRot[0], up = uCamRot[1];
  vec3 rR = refract(rd, n, 1.0 / 1.38), rG = refract(rd, n, 1.0 / 1.43), rB = refract(rd, n, 1.0 / 1.49);
  vec2 oR = vec2(dot(rR - rd, right), dot(rR - rd, up)) * 0.28;
  vec2 oG = vec2(dot(rG - rd, right), dot(rG - rd, up)) * 0.28;
  vec2 oB = vec2(dot(rB - rd, right), dot(rB - rd, up)) * 0.28;
  vec3 refr = vec3(background(uv + oR).r, background(uv + oG).g, background(uv + oB).b);
  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float wrap = clamp((dot(n, L) + 0.7) / 1.7, 0.0, 1.0);
  vec3 opal = lin(vec3(0.99, 0.91, 0.93));
  vec3 col = mix(refr * lin(vec3(1.0, 0.86, 0.9)), opal, 0.5) * (0.62 + 0.38 * wrap);
  // jeu de couleurs de l'opale
  float play = 0.5 + 0.5 * sin(dot(p, vec3(5.0, 7.0, 3.0)) + uTime * 0.35) + dot(n, vec3(0.25, 0.6, 0.2));
  col += (film(play * 0.7 + ndv * 0.5) - 0.6) * 0.45;
  float s1 = mapMom(p - n * 0.07);
  float thin = clamp(0.6 + s1 * 6.0, 0.0, 1.0);
  col += lin(vec3(1.0, 0.8, 0.7)) * (0.06 + 0.16 * thin);
  // le bébé illumine sa maman de l'intérieur
  float bd = length(p - uChildBound.xyz);
  col += lin(vec3(1.0, 0.64, 0.6)) * exp(-bd * bd * 5.0) * 0.4 * uMomForm;
  // chevelure : verre caramel rosé, distinct du visage
  float hair = 0.0;
  for (int i = 0; i < 2; i++) {
    int k = i == 0 ? 1 : 2;
    vec4 A = uMom[2 * k], B = uMom[2 * k + 1];
    hair = max(hair, 1.0 - smoothstep(-0.01, 0.025, sdRoundCone(p, A.xyz, B.xyz, A.w, B.w)));
  }
  vec3 hp = p - uHeadPos;
  float face = smoothstep(0.15, 0.55, dot(normalize(hp), uFaceDir)) * (1.0 - smoothstep(0.17, 0.24, length(hp)));
  hair *= 1.0 - face;
  vec3 hairCol = lin(vec3(0.66, 0.38, 0.32)) * (0.45 + 0.55 * wrap) + film(dot(n, vec3(0.2, 0.9, 0.3)) * 0.6 + uTime * 0.02) * 0.08;
  col = mix(col, hairCol, hair * 0.9);
  vec3 R = reflect(rd, n);
  col = mix(col, env(R), fres * 0.6 * (1.0 - hair * 0.5));
  col += film(ndv * 1.7 + p.y * 0.45 + uTime * 0.03) * pow(1.0 - ndv, 2.0) * 0.65;
  // liseré doré du contre-jour (le soleil est derrière elle)
  col += lin(vec3(1.0, 0.78, 0.5)) * pow(1.0 - ndv, 3.0) * smoothstep(-0.2, 0.6, n.y + 0.3) * 0.45 * uMomForm;
  col += pow(clamp(dot(R, L), 0.0, 1.0), 60.0) * 0.7;
  col += film(p.y * 1.4 - uTime * 0.25) * (1.0 - uMomForm) * 1.1 * (0.35 + 0.65 * pow(1.0 - ndv, 1.4));
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

// Particules de lumière : poussière, aurores, gouttelettes, puis spirale qui dessine la maman.
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
  vec2 tb = iSphere(ro, rd, uSceneBound);
  if (tb.y > 0.0) {
    float t = max(tb.x, 0.0);
    float mat = 0.0;
    for (int i = 0; i < 110; i++) {
      if (t > tb.y) break;
      vec2 h = map(ro + rd * t);
      if (h.x < 0.0011 * t + 0.0004) { mat = h.y; break; }
      t += h.x * 0.88;
    }
    if (mat > 0.5) {
      vec3 p = ro + rd * t;
      vec3 n = normalAt(p);
      col = mat < 1.5 ? shadeChild(p, n, rd) : shadeMom(p, n, rd, uv);
      tHit = t;
    }
  }
  // Halo du cœur, visible à travers le corps.
  if (uHeart.w > 0.01) {
    vec3 op = uHeart.xyz - ro; float t = dot(op, rd);
    float d2 = max(dot(op, op) - t * t, 0.0);
    vec3 hc = mix(lin(vec3(1.0, 0.45, 0.4)), lin(vec3(1.0, 0.82, 0.5)), uHeartGold);
    col += hc * (exp(-d2 * 45.0) * 0.3 + exp(-d2 * 6.0) * 0.12 * uHeartGold) * uHeart.w;
  }
  col += particles(ro, rd, tHit);
  vec4 b = bubble(ro, rd, tHit);
  col = col * (1.0 - b.a * 0.4) + b.rgb * b.a;
  float fd = length((uv - uSun) * vec2(asp, 1.0));
  col += lin(vec3(1.0, 0.8, 0.72)) * uFlash * (exp(-fd * fd * 9.0) * 0.26 + 0.02);
  col = col / (1.0 + max(col - 0.92, 0.0) * 1.6);
  outColor = vec4(pow(clamp(col, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}`;

// ---- La scène --------------------------------------------------------------------------------------------
export function createHomeScene({ canvas, rtl = false, mobile = false, onHeld } = {}) {
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
  ['uRes', 'uTime', 'uCamPos', 'uCamRot', 'uTanHalf', 'uShift', 'uChild', 'uMom', 'uChildBound', 'uMomBound', 'uSceneBound',
    'uMomForm', 'uMomBaseY', 'uChildK', 'uHeadPos', 'uFaceDir', 'uBubble', 'uBubbleA', 'uBurst', 'uFlow', 'uHeart', 'uHeartGold', 'uPart', 'uSun', 'uSunK', 'uColorK', 'uFlash', 'uGlow']
    .forEach(name => { U[name] = gl.getUniformLocation(program, name); });

  const childData = new Float32Array(CHILD_CONES * 8);
  const momData = new Float32Array(MOM_CONES * 8);
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

    // --- l'enfant ---
    const growPose = lerpPose(POSES.embryo, POSES.fetus, T.dev);
    // les membres poussent un peu après le corps
    const limbsPose = lerpPose(POSES.embryo, POSES.fetus, T.limbs);
    const devPose = growPose.map((c, i) => (i >= 6 && i <= 17 ? limbsPose[i] : c));
    const openPose = lerpPose(devPose, POSES.reach, T.stretch * (1 - T.hold));
    const pose = lerpPose(openPose, POSES.held, T.hold);
    const scale = lerp(lerp(0.85, 1.12, T.grow), 0.92, T.stretch) * lerp(1, 0.6 / 0.92, T.hold) * lerp(0.82, 1, introK);
    const float = Math.sin(time * 0.6) * 0.025 * (1 - T.hold);
    const pos = [0, 0.05 + float + T.stretch * 0.08, 0];
    // l'enfant se montre surtout de profil, en tournant doucement pour révéler son volume
    const camAz = camAzimuth(p, T);
    const yaw = lerp((camAz + 0.38 * Math.sin(time * 0.22 + p * 6)) * (1 - T.stretch) + (camAz + YAW_REACH) * T.stretch, Math.PI / 2, T.hold);
    const pitch = 0.08 * Math.sin(time * 0.2) * (1 - T.hold);
    const roll = lerp(0.1 * Math.sin(time * 0.17) * (1 - T.stretch), 0.12, T.hold);
    const breathe = 1 + Math.sin(time * 1.7) * 0.012 * T.hold;
    packCones(pose, transformer(pos, pitch, yaw, roll, scale * breathe), scale, childData);

    // --- la maman ---
    const momPoseNow = lerpPose(POSES.momOpen, POSES.momCradle, T.hold);
    packCones(momPoseNow, transformer(MOM_ORIGIN, 0, 0, 0, 1), 1, momData);

    // --- la bulle ---
    const bubbleR = lerp(0.74, 1.04, T.grow) * (1 + T.burst * 0.12) * (1 + Math.sin(time * 14) * 0.012 * T.tremble) * lerp(0.9, 1, introK);
    const bubbleA = introK * (1 - smooth(0.85, 1, T.burst));

    // --- particules ---
    const chestA = childData.subarray(5 * 8, 5 * 8 + 3);
    for (let i = 0; i < PARTICLES; i++) {
      const s = seeds[i];
      let x, y, z, w;
      if (i < 16) {                                  // poussière de lumière
        const ang = time * (0.05 + s.a * 0.08) + s.b * 6.28;
        const rad = 1.15 + s.c * 0.9;
        x = Math.cos(ang) * rad; z = Math.sin(ang) * rad * 0.7; y = Math.sin(time * 0.2 + s.a * 6.28) * 0.8 + (s.b - 0.5) * 0.6;
        w = 0.016 + s.c * 0.016;
      } else if (i < 32) {                           // aurores autour de la bulle
        const ang = time * 0.7 + i * 0.39 + p * 9;
        const h = Math.sin(time * 0.5 + i * 0.8) * 0.7;
        const rad = bubbleR * (1.12 + 0.08 * Math.sin(i + time));
        x = Math.cos(ang) * rad * Math.sqrt(1 - Math.min(h * h, 0.9)); z = Math.sin(ang) * rad * Math.sqrt(1 - Math.min(h * h, 0.9)); y = 0.05 + h * rad;
        w = 0.03 * T.aurora + 0.045 * T.mom * (1 - T.mom) * 2;
        // pendant la formation de la maman, elles convergent vers sa silhouette
        if (T.mom > 0) {
          const k = (i - 16) % MOM_CONES, tgt = momData.subarray(k * 8 + ((i & 1) ? 4 : 0), k * 8 + ((i & 1) ? 7 : 3));
          const f = smooth(0, 1, T.mom);
          x = lerp(x, tgt[0], f); y = lerp(y, tgt[1], f); z = lerp(z, tgt[2], f);
        }
      } else {                                       // gouttelettes de la bulle, puis spirale vers la maman
        // chaque gouttelette se détache quand la déchirure passe sur elle, puis s'envole
        const loc = clamp01((T.burst * 1.5 - 0.12 - (0.5 - 0.5 * s.dir[1])) / 0.45);
        const out = bubbleR * (1 + loc * (0.35 + s.a * 1.1));
        x = s.dir[0] * out; y = 0.05 + s.dir[1] * out + loc * (0.15 + s.b * 0.25); z = s.dir[2] * out;
        w = (0.035 + s.c * 0.035) * Math.sin(Math.PI * loc);
        if (T.mom > 0) {
          const k = (i - 32) % MOM_CONES, tgt = momData.subarray(k * 8, k * 8 + 3);
          const f = smooth(0, 1, T.mom), swirl = (1 - f) * 2.4 + time * 0.3;
          const sx = x * Math.cos(swirl) - z * Math.sin(swirl), sz = x * Math.sin(swirl) + z * Math.cos(swirl);
          x = lerp(sx, tgt[0], f); y = lerp(y, tgt[1], f); z = lerp(sz, tgt[2], f);
          w = Math.max(w, 0.035 * Math.sin(Math.PI * T.mom));
        }
      }
      partData.set([x, y, z, w], i * 4);
    }

    // --- caméra et cadrage ---
    const aspect = size.w / size.h;
    const portrait = clamp01((1.05 - aspect) / 0.35);
    const radius = lerp(lerp(lerp(0.8, 1.08, T.grow), 1.12, T.burst), 0.86, T.mom);
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
    const focus = [lerp(0, 0.02, T.mom), lerp(0.05, 0.27, T.mom), lerp(0, -0.12, T.mom)];
    const az = camAzimuth(p, T) * (rtl ? -1 : 1) + ps.x * 0.1;
    const el = lerp(0.08, 0.13, T.mom) + ps.y * 0.05;
    const cam = [focus[0] + Math.sin(az) * Math.cos(el) * distance, focus[1] + Math.sin(el) * distance, focus[2] + Math.cos(az) * Math.cos(el) * distance];
    const f = norm([focus[0] - cam[0], focus[1] - cam[1], focus[2] - cam[2]]);
    const r = norm(cross(f, [0, 1, 0]));
    const u = cross(r, f);

    // --- volumes englobants ---
    const childBound = [pos[0], pos[1], pos[2], 0.85 * scale];
    gl.uniform1f(U.uChildK, 0.05 * scale);
    const momCenter = [MOM_ORIGIN[0], MOM_ORIGIN[1] + 0.35, MOM_ORIGIN[2] + 0.15];
    const momBound = [...momCenter, 1.05];
    const scene = T.mom > 0.002
      ? [...momCenter, Math.max(1.05, Math.hypot(pos[0] - momCenter[0], pos[1] - momCenter[1], pos[2] - momCenter[2]) + childBound[3])]
      : childBound;

    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform3fv(U.uCamPos, cam);
    gl.uniformMatrix3fv(U.uCamRot, false, [...r, ...u, ...f]);
    gl.uniform1f(U.uTanHalf, tanHalf);
    gl.uniform2fv(U.uShift, shift);
    gl.uniform4fv(U.uChild, childData);
    gl.uniform4fv(U.uMom, momData);
    gl.uniform4fv(U.uChildBound, childBound);
    gl.uniform4fv(U.uMomBound, momBound);
    gl.uniform4fv(U.uSceneBound, scene);
    gl.uniform1f(U.uMomForm, T.mom);
    const fo = momFace(false), fc = momFace(true);
    const hd = [0, 1, 2].map(i => lerp(fo.head[i], fc.head[i], T.hold) + MOM_ORIGIN[i]);
    gl.uniform3fv(U.uHeadPos, hd);
    gl.uniform3fv(U.uFaceDir, norm([0, 1, 2].map(i => lerp(fo.f[i], fc.f[i], T.hold))));
    gl.uniform1f(U.uMomBaseY, MOM_ORIGIN[1]);
    gl.uniform4f(U.uBubble, 0, 0.05, 0, bubbleR);
    gl.uniform1f(U.uBubbleA, bubbleA);
    gl.uniform1f(U.uBurst, T.burst);
    gl.uniform1f(U.uFlow, 1 + T.tremble * 2.5 + T.aurora * 0.8);
    const beat = time * 1.15 % 1;
    const pulse = Math.exp(-Math.pow(beat * 9, 2)) + 0.6 * Math.exp(-Math.pow((beat - 0.2) * 9, 2));
    // le petit cœur du bébé devient, à la fin, une lumière partagée entre la maman et son enfant
    const contact = [MOM_ORIGIN[0] - 0.08, MOM_ORIGIN[1] + 0.47, MOM_ORIGIN[2] + 0.24];
    const slow = 0.5 + 0.5 * Math.sin(time * 1.6);
    const heartPos = [0, 1, 2].map(i => lerp(chestA[i] + (i === 2 ? 0.02 : 0), contact[i], T.hold));
    const heartI = Math.max((0.35 + 0.65 * pulse) * T.heart, T.hold * (0.7 + 0.3 * slow)) * introK;
    gl.uniform4f(U.uHeart, heartPos[0], heartPos[1], heartPos[2], heartI);
    gl.uniform1f(U.uHeartGold, T.hold);
    gl.uniform4fv(U.uPart, partData);
    gl.uniform2f(U.uSun, 0.5 + shift[0] * 0.5, 0.5 + shift[1] * 0.5);
    gl.uniform1f(U.uSunK, T.sun);
    gl.uniform1f(U.uColorK, 0.35 + 0.65 * T.color);
    gl.uniform1f(U.uFlash, T.flash);
    gl.uniform1f(U.uGlow, introK * (0.6 + 0.4 * T.heart) + T.flash * 0.35);

    const isHeld = T.hold > 0.82;
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
    ready: Promise.resolve(true),
    get progress() { return progress; },
    get quality() { return quality; },
    // Contrôle qualité : place le récit sans inertie.
    snap(p) { target = progress = clamp01(p); intro = 1; introStart = -10; render(); },
    // Image fixe du récit, scène centrée (images de secours, images de partage).
    async capture(p, width, height, type = 'image/webp', q = 0.86) {
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
