// 40 Days — scène 3D de l'accueil (Three.js r160).
//
// Une goutte de verre nacré raconte le développement du bébé au fil du scroll :
//   1. conception   : une perle de lumière s'allume dans la goutte
//   2. divisions    : la perle se divise en 2, 4 puis 8 cellules, la goutte s'arrondit
//   3. croissance   : les cellules s'unissent en un embryon lové qui grandit, la goutte devient ventre
//   4. naissance    : le bébé devient lumière, le verre prend la forme d'un médaillon
//   5. dans vos bras : dans la goutte apparaît une maman qui tient son nouveau-né (photographie)
//
// Le verre reprend le matériau du moteur « Premium 3D Glass » (transmission, iridescence,
// dispersion greffée dans le shader), réglé pour un fond clair et une lumière de lever de soleil.
// Le module est chargé à la demande par main.js, après le contenu texte, et seulement si WebGL 2
// est disponible et que la visiteuse n'a pas demandé à réduire les animations.

import * as THREE from 'three';

// ---- Réglages -----------------------------------------------------------------
const FOV = 30;
const DAMPING = 0.055;                  // inertie du scroll (0..1, plus petit = plus lent)
const PIXEL_RATIO_MAX = 1.5;
const MEDALLION = { width: 0.72, flat: 0.5, scale: 1.45 };   // forme finale de la goutte
const PALETTE = {
  cream: '#FBF7F2', rose: '#E8C4B8', peach: '#F3D2BE', gold: '#EDC98F',
  sage: '#A8B5A0', terracotta: '#C98B6B', pearl: '#F0C6B6'
};

const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = THREE.MathUtils.lerp;
const V2 = (x, y) => new THREE.Vector2(x, y);

// ---- Chronologie (progression du récit, 0..1 sur les cinq chapitres) -------------
function timeline(p) {
  const divide = smooth(0.21, 0.27, p) + smooth(0.28, 0.33, p) + smooth(0.34, 0.39, p);   // 0..3
  return {
    toSphere: smooth(0.16, 0.38, p),
    toBelly: smooth(0.42, 0.60, p),
    toMedallion: smooth(0.63, 0.78, p),  // la goutte devient médaillon
    divide,
    fuse: smooth(0.40, 0.47, p),
    grow: smooth(0.45, 0.62, p),
    release: smooth(0.62, 0.72, p),      // le bébé devient lumière
    reveal: smooth(0.68, 0.81, p),       // la maman et son bébé apparaissent
    sun: smooth(0.0, 0.85, p)
  };
}

// ---- Matériaux -------------------------------------------------------------------
function createGlassMaterial({ thickness = 0.6, tint = '#f7ddd3', spread = 0.02 } = {}) {
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#fffaf6',
    metalness: 0,
    roughness: 0.035,
    transmission: 1,
    thickness,
    ior: 1.45,
    attenuationColor: new THREE.Color(tint),
    attenuationDistance: 3.6,
    clearcoat: 0.7,
    clearcoatRoughness: 0.03,
    iridescence: 0.75,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [160, 520],
    specularIntensity: 1,
    specularColor: new THREE.Color('#fff1e2'),
    envMapIntensity: 1.25,
    side: THREE.DoubleSide,
    transparent: true
  });
  // Dispersion : trois réfractions (rouge, vert, bleu) qui s'écartent sur les bords rasants.
  glass.onBeforeCompile = shader => {
    shader.uniforms.uChromaticSpread = { value: spread };
    shader.fragmentShader = 'uniform float uChromaticSpread;\n' + shader.fragmentShader;
    const transmission = THREE.ShaderChunk.transmission_fragment.replace(
      /vec4 transmitted = getIBLVolumeRefraction\([\s\S]*?\);/,
      `float chromaticSpread = uChromaticSpread * mix(0.35, 1.0, smoothstep(0.15, 0.85, 1.0 - abs(dot(n, v))));
      vec4 transmitted = getIBLVolumeRefraction(
        n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
        pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
        material.attenuationColor, material.attenuationDistance );
      vec4 transmittedRed = getIBLVolumeRefraction(
        n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
        pos, modelMatrix, viewMatrix, projectionMatrix, material.ior - chromaticSpread, material.thickness,
        material.attenuationColor, material.attenuationDistance );
      vec4 transmittedBlue = getIBLVolumeRefraction(
        n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
        pos, modelMatrix, viewMatrix, projectionMatrix, material.ior + chromaticSpread, material.thickness,
        material.attenuationColor, material.attenuationDistance );
      transmitted = vec4(transmittedRed.r, transmitted.g, transmittedBlue.b,
        (transmittedRed.a + transmitted.a + transmittedBlue.a) / 3.0);`
    );
    shader.fragmentShader = shader.fragmentShader.replace('#include <transmission_fragment>', transmission);
  };
  glass.customProgramCacheKey = () => 'forty-days-glass-dispersion-' + spread;
  return glass;
}

// La « vie » : une nacre rosée et dorée, opaque pour rester visible à travers le verre.
function createPearlMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: PALETTE.pearl,
    roughness: 0.26,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    iridescence: 1,
    iridescenceIOR: 1.55,
    iridescenceThicknessRange: [260, 640],
    sheen: 1,
    sheenColor: new THREE.Color('#ffd9a6'),
    sheenRoughness: 0.45,
    emissive: new THREE.Color('#ec9a78'),
    emissiveIntensity: 0.14,
    envMapIntensity: 1.1
  });
}

// La photographie finale, découpée en ovale dans le plan médian du médaillon.
// Opaque : le verre la voit dans sa passe de transmission et la réfracte sur ses bords.
function createPhotoMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: null },
      uReveal: { value: 0 },
      uGlow: { value: 0 },
      uLight: { value: new THREE.Color('#F7E4D7') },
      uHasMap: { value: 0 }
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform sampler2D map;
      uniform float uReveal, uGlow, uHasMap;
      uniform vec3 uLight;
      varying vec2 vUv;
      void main() {
        vec2 q = (vUv - 0.5) * 2.0;
        float d = length(q);
        if (d > 1.0) discard;
        // Lumière née du bébé : un cœur blanc doré qui s'étend.
        vec3 light = mix(uLight, vec3(1.0, 0.95, 0.86), (1.0 - smoothstep(0.0, 0.9, d)) * uGlow);
        vec3 photo = uHasMap > 0.5 ? texture2D(map, vUv).rgb : uLight;
        // Vignette chaude sur le pourtour, pour fondre la photo dans le verre.
        photo = mix(photo, photo * vec3(1.0, 0.9, 0.84) + vec3(0.04, 0.02, 0.01), smoothstep(0.62, 1.0, d) * 0.55);
        // Révélation douce, du centre vers le bord.
        float k = smoothstep(0.0, 1.0, uReveal * 1.35 - d * 0.35);
        gl_FragColor = vec4(mix(light, photo, k), 1.0);
        #include <colorspace_fragment>
      }`
  });
}

// Studio « lever de soleil » converti en environnement : panneaux dorés, rosés et blancs.
function createEnvironment(renderer) {
  const studio = new THREE.Scene();
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uTop: { value: new THREE.Color('#f8efe6') },
        uMid: { value: new THREE.Color('#d9a993') },
        uLow: { value: new THREE.Color('#3b2d28') }
      },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP; uniform vec3 uTop, uMid, uLow;
        void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(uMid, uTop, smoothstep(0.0, 0.6, h)) : mix(uMid, uLow, smoothstep(0.0, -0.5, h));
        gl_FragColor = vec4(c, 1.0); }`
    })
  );
  studio.add(dome);
  const panels = [
    // largeur, hauteur, x, y, z, couleur, intensité
    [6, 3, -5, 5, 4, '#fff6ea', 3.2],      // soleil levant, doux et large
    [0.5, 7, 4, 1, 3, '#ffffff', 4.5],     // filet vertical : ligne de lumière sur le verre
    [7, 0.5, 0, -2.5, 5, '#ffe2c2', 2.4],  // reflet bas doré
    [2.5, 5, 5, 1, -3, '#f6c3b0', 2.6],    // contre-jour rosé
    [0.18, 5, -3, 0, 3, '#ffffff', 6.0],   // filet fin, accent spectral
    [3, 0.4, -1, 4, -4, '#f3d79e', 3.0]    // halo or
  ];
  for (const [w, h, x, y, z, color, intensity] of panels) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    studio.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio, 0.03, 0.1, 100);
  studio.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  pmrem.dispose();
  return env.texture;
}

// ---- Fond : crème, halo de lever de soleil derrière l'objet, ondes de lumière ------
function createBackground() {
  const uniforms = {
    uTime: { value: 0 },
    uSun: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uObject: { value: new THREE.Vector2(0.72, 0.5) },
    uCream: { value: new THREE.Color(PALETTE.cream) },
    uRose: { value: new THREE.Color(PALETTE.rose) },
    uPeach: { value: new THREE.Color(PALETTE.peach) },
    uGold: { value: new THREE.Color(PALETTE.gold) },
    uSage: { value: new THREE.Color(PALETTE.sage) }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    depthWrite: false,
    depthTest: false,
    // Plan plein écran, dessiné au fond avant tout le reste.
    vertexShader: 'void main(){ gl_Position = vec4(position.xy, 0.9999, 1.0); }',
    fragmentShader: `
      uniform float uTime, uSun;
      uniform vec2 uResolution, uObject;
      uniform vec3 uCream, uRose, uPeach, uGold, uSage;
      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float aspect = uResolution.x / uResolution.y;
        vec2 p = (uv - uObject) * vec2(aspect, 1.0);
        vec3 col = uCream;
        // Le soleil se lève derrière l'objet au fil du récit.
        vec2 sp = p - vec2(0.0, mix(-0.30, 0.02, uSun));
        float d = length(sp * vec2(0.85, 1.0));
        float glow = exp(-d * d * mix(6.0, 3.4, uSun));
        vec3 warm = mix(uRose, mix(uPeach, uGold, 0.35), smoothstep(0.15, 0.9, uSun));
        col = mix(col, warm, glow * mix(0.55, 0.8, uSun));
        // Anneaux de lumière très fins autour du soleil : le verre les courbe.
        float rings = 0.0;
        for (int i = 0; i < 4; i++) {
          float k = float(i);
          float r = 0.26 + k * 0.16 + 0.01 * sin(uTime * 0.25 + k);
          rings += exp(-pow((d - r) * 140.0, 2.0)) * (0.55 - k * 0.1);
        }
        col = mix(col, uRose * 0.86, rings * 0.22 * (0.6 + 0.4 * uSun));
        // Brume de sauge à l'horizon, très légère.
        float haze = smoothstep(0.32, 0.0, uv.y) * (0.5 + 0.5 * sin(uv.x * 3.0 + uTime * 0.04));
        col = mix(col, mix(uSage, uCream, 0.55), haze * 0.18);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

// ---- Géométries ------------------------------------------------------------------
// Profils de révolution (même nombre de points) : goutte, sphère, ventre, médaillon.
const PROFILE_POINTS = 80;
function profile(kind) {
  const pts = [];
  for (let i = 0; i <= PROFILE_POINTS; i++) {
    const u = (1 - Math.cos(Math.PI * i / PROFILE_POINTS)) / 2;   // resserré aux pôles
    const theta = Math.PI * u;
    let r, y = -Math.cos(theta);
    if (kind === 'drop') {
      const phi = Math.PI * (1 - u);
      r = 1.18 * Math.sin(phi) * Math.pow(Math.sin(phi / 2), 1.1);
      y = -Math.cos(theta) * 1.02;
    } else if (kind === 'sphere') {
      r = Math.sin(theta);
    } else if (kind === 'belly') {
      r = Math.sin(theta) * (1 + 0.13 * Math.cos(theta)) * 1.02;
      y = -Math.cos(theta) * 0.97;
    } else {
      // Médaillon : ovale vertical, légèrement plus plein en bas, comme une goutte posée.
      r = Math.sin(theta) * MEDALLION.width * (1 + 0.05 * Math.cos(theta));
    }
    pts.push(V2(Math.max(r, 0), y));
  }
  return pts;
}

function createEnvelopeGeometry() {
  const segments = 96;
  const base = new THREE.LatheGeometry(profile('drop'), segments);
  const targets = ['sphere', 'belly', 'medallion'].map(kind => new THREE.LatheGeometry(profile(kind), segments));
  base.morphAttributes.position = targets.map(g => g.attributes.position);
  base.morphAttributes.normal = targets.map(g => g.attributes.normal);
  return base;
}

// Fœtus lové : un tube effilé balayé le long d'une colonne en C, tête comprise.
const SPINE = [[0.12, -0.40], [-0.12, -0.39], [-0.29, -0.22], [-0.33, 0.02], [-0.24, 0.22], [-0.06, 0.31], [0.10, 0.25]];
const BODY = { tail: 0.12, body: 0.2, neck: 0.135, head: 0.215 };

function bodyRadius(s, length) {
  const s0 = BODY.tail / length, s1 = 1 - BODY.head / length, sNeck = s1 - 0.12;
  if (s <= s0) { const t = 1 - s / s0; return Math.max(0.0005, BODY.tail * Math.sqrt(Math.max(0, 1 - t * t))); }
  if (s >= s1) { const t = (s - s1) / (1 - s1); return Math.max(0.0005, BODY.head * Math.sqrt(Math.max(0, 1 - t * t))); }
  const keys = [[s0, BODY.tail], [s0 + 0.2, BODY.body], [sNeck - 0.1, BODY.body * 0.93], [sNeck, BODY.neck], [s1, BODY.head]];
  for (let i = 0; i < keys.length - 1; i++) {
    const [sa, ra] = keys[i], [sb, rb] = keys[i + 1];
    if (s <= sb) { const t = clamp01((s - sa) / (sb - sa)); return lerp(ra, rb, t * t * (3 - 2 * t)); }
  }
  return BODY.head;
}

function buildFetusGeometry() {
  const curve = new THREE.CatmullRomCurve3(SPINE.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
  const length = curve.getLength();
  const tubular = 110, radial = 32;
  const frames = curve.computeFrenetFrames(tubular, false);
  const positions = [], normals = [], indices = [];
  const P = new THREE.Vector3(), N = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const s = i / tubular;
    curve.getPointAt(s, P);
    const r = bodyRadius(s, length);
    // Normale le long de la colonne : tenir compte de la pente du rayon pour un éclairage juste.
    const ds = 1 / tubular;
    const slope = (bodyRadius(Math.min(1, s + ds), length) - bodyRadius(Math.max(0, s - ds), length)) / (2 * ds * length);
    const T = frames.tangents[i], Nf = frames.normals[i], Bf = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = j / radial * Math.PI * 2;
      const c = Math.cos(a), sn = Math.sin(a);
      N.set(c * Nf.x + sn * Bf.x, c * Nf.y + sn * Bf.y, c * Nf.z + sn * Bf.z);
      positions.push(P.x + r * N.x, P.y + r * N.y, P.z + r * N.z * 0.9);
      const n = N.clone().addScaledVector(T, -slope).normalize();
      normals.push(n.x, n.y, n.z);
    }
  }
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = (i + 1) * (radial + 1) + j;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
}

function createGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255, 236, 205, 1)');
  g.addColorStop(0.35, 'rgba(248, 205, 160, 0.55)');
  g.addColorStop(1, 'rgba(240, 190, 160, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---- La scène -----------------------------------------------------------------------
// photo : adresse de la photographie finale (maman et bébé). Elle doit autoriser le CORS
// (c'est le cas du CDN d'Unsplash) pour pouvoir être dessinée dans WebGL.
export function createHomeScene({ canvas, rtl = false, mobile = false, photo = '', onHeld } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(PALETTE.cream);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  scene.environment = createEnvironment(renderer);

  const background = createBackground();
  scene.add(background.mesh);

  scene.add(new THREE.HemisphereLight('#fff4ea', '#e3bfb2', 1.1));
  const sun = new THREE.DirectionalLight('#ffe7cc', 2.2);
  sun.position.set(-3, 4, 4);
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#f7c9b8', 1.4);
  rim.position.set(3, 1, -3);
  scene.add(rim);

  const world = new THREE.Group();             // tout le récit, incliné par le pointeur
  scene.add(world);

  // L'enveloppe : goutte -> sphère -> ventre -> médaillon.
  const envelopeMaterial = createGlassMaterial({ thickness: 0.45 });
  envelopeMaterial.ior = 1.38;
  const envelope = new THREE.Mesh(createEnvelopeGeometry(), envelopeMaterial);
  envelope.morphTargetInfluences = [0, 0, 0];
  world.add(envelope);

  // La photographie, dans le plan médian du médaillon.
  const photoMaterial = createPhotoMaterial();
  const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(2 * MEDALLION.width * 0.93, 2 * 0.95), photoMaterial);
  photoPlane.visible = false;
  world.add(photoPlane);
  const photoReady = new Promise(resolve => {
    if (!photo) return resolve(false);
    new THREE.TextureLoader().setCrossOrigin('anonymous').load(photo, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      photoMaterial.uniforms.map.value = texture;
      photoMaterial.uniforms.uHasMap.value = 1;
      resolve(true);
    }, undefined, () => resolve(false));
  });

  // La vie : cellules nacrées, puis embryon.
  const pearl = createPearlMaterial();
  const life = new THREE.Group();
  world.add(life);
  const cellGeometry = new THREE.SphereGeometry(1, 48, 32);
  const cells = Array.from({ length: 8 }, (_, i) => {
    const m = new THREE.Mesh(cellGeometry, pearl);
    m.userData.bits = [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1];
    life.add(m);
    return m;
  });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGlowTexture(), transparent: true, depthWrite: false, opacity: 0.9 }));
  glow.renderOrder = -1;
  world.add(glow);

  const fetus = new THREE.Mesh(buildFetusGeometry(), pearl);
  fetus.visible = false;
  world.add(fetus);

  // Poussière de lumière, et éclats quand le bébé devient lumière.
  const MOTES = mobile ? 70 : 140, BURST = mobile ? 90 : 180;
  const moteGeometry = new THREE.BufferGeometry();
  const motePositions = new Float32Array((MOTES + BURST) * 3);
  const moteSeeds = [];
  for (let i = 0; i < MOTES + BURST; i++) {
    moteSeeds.push({
      dir: new THREE.Vector3().randomDirection(), burst: i >= MOTES,
      base: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3),
      speed: 0.45 + Math.random() * 0.75, phase: Math.random() * Math.PI * 2
    });
  }
  moteGeometry.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const moteMaterial = new THREE.PointsMaterial({
    size: mobile ? 0.05 : 0.04, map: createGlowTexture(), transparent: true, depthWrite: false,
    color: new THREE.Color('#e7b77e'), opacity: 0.75, sizeAttenuation: true
  });
  const motes = new THREE.Points(moteGeometry, moteMaterial);
  motes.frustumCulled = false;
  scene.add(motes);

  // ---- État ----
  const size = { w: 1, h: 1 };
  let target = 0, progress = 0, intro = 0, introStart = null;
  let pointer = { x: 0, y: 0 }, pointerSmooth = { x: 0, y: 0 };
  let held = false, running = false, raf = 0, lastFrame = 0, lastInput = performance.now();
  const framing = { capture: false };
  const clock = new THREE.Clock();
  const camTarget = new THREE.Vector3(), camPos = new THREE.Vector3();

  function updateStory(p, time) {
    const t = timeline(p);
    const introK = smooth(0, 1, intro);
    const m = t.toMedallion;

    // Enveloppe
    envelope.morphTargetInfluences[0] = t.toSphere * (1 - t.toBelly) * (1 - m);
    envelope.morphTargetInfluences[1] = t.toBelly * (1 - m);
    envelope.morphTargetInfluences[2] = m;
    const envScale = lerp(lerp(lerp(0.78, 0.9, t.toSphere), 1.22, t.toBelly), MEDALLION.scale, m) * lerp(0.86, 1, introK);
    envelope.scale.set(envScale, envScale, envScale * lerp(1, MEDALLION.flat, m));
    envelope.position.y = 0.08 + Math.sin(time * 0.6) * 0.025;
    // Rotation lente tant que la goutte est ronde ; le médaillon finit face à nous.
    const spin = ((time * 0.05 + Math.PI) % (Math.PI * 2)) - Math.PI;
    envelope.rotation.y = spin * (1 - m);
    envelopeMaterial.opacity = introK;
    envelopeMaterial.iridescence = 0.75 + 0.2 * m;

    // Photographie finale
    photoPlane.visible = t.release > 0.02;
    photoPlane.position.set(0, envelope.position.y - 0.02 * envScale, 0);
    photoPlane.scale.setScalar(envScale);
    photoMaterial.uniforms.uReveal.value = t.reveal;
    photoMaterial.uniforms.uGlow.value = Math.sin(Math.PI * t.release) * (1 - t.reveal);

    // Cellules : 1 -> 2 -> 4 -> 8 (volume conservé), puis fusion.
    const r1 = 0.2;
    const cellR = r1 * Math.pow(2, -t.divide / 3) * (1 - t.fuse) * introK;
    const sep = [0.165, 0.135, 0.11];
    cells.forEach(cell => {
      const [bx, by, bz] = cell.userData.bits;
      const k1 = clamp01(t.divide), k2 = clamp01(t.divide - 1), k3 = clamp01(t.divide - 2);
      cell.position.set(bx * sep[0] * k1, by * sep[1] * k2, bz * sep[2] * k3).multiplyScalar(1 - t.fuse);
      cell.scale.setScalar(Math.max(cellR, 0.0001));
      cell.visible = cellR > 0.002;
    });
    life.position.y = envelope.position.y - 0.12 * (1 - t.toSphere);
    life.rotation.set(0.55 * clamp01(t.divide - 1.2), time * 0.12 + 0.7 * clamp01(t.divide - 1.5), 0.25 * clamp01(t.divide - 1));

    // Embryon puis fœtus, qui devient lumière à la naissance.
    const growScale = lerp(0.35, 1.18, t.grow) * t.fuse * (1 - t.release);
    fetus.visible = growScale > 0.01;
    fetus.scale.setScalar(Math.max(growScale, 0.0001));
    fetus.position.set(0, envelope.position.y - 0.02 + Math.sin(time * 0.8) * 0.02, 0);
    fetus.rotation.set(0.15 * Math.sin(time * 0.3), -0.5 + time * 0.08, 0.1);

    // Halo : la perle de la conception, puis l'éclat de la naissance.
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.4);
    const flash = Math.sin(Math.PI * t.release);
    glow.position.set(0, life.position.y, 0.05);
    glow.scale.setScalar((0.9 + 0.12 * pulse) * lerp(1, 1.5, t.divide / 3) * introK * (1 - 0.6 * t.grow) + flash * 1.6 * envScale);
    glow.material.opacity = (0.85 * (1 - 0.5 * t.fuse) * (1 - t.release) + flash * 0.9) * introK;

    // Poussière de lumière : flotte doucement ; éclats depuis le bébé pendant la naissance.
    const burstK = t.release, burstAlpha = Math.sin(Math.PI * burstK);
    for (let i = 0; i < moteSeeds.length; i++) {
      const s = moteSeeds[i];
      let x, y, z;
      if (!s.burst) {
        x = s.base.x + Math.sin(time * 0.2 + s.phase) * 0.15;
        y = ((s.base.y + time * 0.05 * s.speed + 2) % 4) - 2;
        z = s.base.z + Math.cos(time * 0.17 + s.phase) * 0.15;
      } else if (burstAlpha > 0.01) {
        const radius = lerp(0.05, envScale * 1.25, burstK * s.speed);
        x = s.dir.x * radius * 0.8; y = s.dir.y * radius + fetus.position.y + burstK * 0.25; z = s.dir.z * radius * 0.6;
      } else { x = 0; y = -50; z = 0; }
      motePositions[i * 3] = x; motePositions[i * 3 + 1] = y; motePositions[i * 3 + 2] = z;
    }
    moteGeometry.attributes.position.needsUpdate = true;
    moteMaterial.opacity = 0.55 + 0.4 * burstAlpha;

    background.uniforms.uSun.value = t.sun;

    const isHeld = t.reveal > 0.85;
    if (isHeld !== held) { held = isHeld; if (onHeld) onHeld(held); }
    return t;
  }

  // Cadrage : objet à droite en paysage (à gauche en hébreu), en haut de l'écran en portrait.
  function frame(p, t) {
    const aspect = size.w / size.h;
    const portrait = THREE.MathUtils.clamp((1.05 - aspect) / 0.35, 0, 1);
    const radius = lerp(lerp(lerp(0.95, 1.05, t.toSphere), 1.42, t.toBelly), 1.3, t.toMedallion);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    let distance, offsetX = 0, offsetY = 0;
    if (framing.capture) {
      // Image fixe : le médaillon entier, avec une marge.
      distance = Math.max(radius, envelope.scale.y * 1.12) / (0.8 * tanHalf * Math.min(1, aspect));
    } else {
      const landscape = radius / (0.64 * tanHalf);                        // tient dans la hauteur
      const sideWidth = radius / (0.36 * tanHalf * aspect);                // tient dans la moitié de la largeur
      const portraitDist = radius / (0.82 * tanHalf * aspect);             // tient dans la largeur
      distance = lerp(Math.max(landscape, sideWidth), Math.max(portraitDist, radius / (0.36 * tanHalf)), portrait);
      const halfH = distance * tanHalf, halfW = halfH * aspect;
      offsetX = (rtl ? 1 : -1) * 0.48 * halfW * (1 - portrait);          // l'objet glisse vers le côté libre
      offsetY = -0.42 * halfH * portrait;                                   // et vers le haut en portrait
    }
    const orbit = lerp(-0.55, 0.04, smooth(0, 0.62, p)) * (1 - t.toMedallion);
    const azimuth = orbit * (rtl ? -1 : 1) + pointerSmooth.x * 0.12 * (1 - 0.5 * t.toMedallion);
    const elevation = lerp(lerp(0.1, 0.18, t.toBelly), 0.04, t.toMedallion) + pointerSmooth.y * 0.05;
    const focusY = 0.06;
    camPos.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation))
      .multiplyScalar(distance).add(new THREE.Vector3(0, focusY, 0));
    const right = new THREE.Vector3(Math.cos(azimuth), 0, -Math.sin(azimuth));
    camTarget.set(0, focusY, 0).addScaledVector(right, offsetX).add(new THREE.Vector3(0, offsetY, 0));
    // position de l'objet à l'écran, pour centrer le halo du fond
    const ndcX = framing.capture ? 0 : -offsetX / (distance * tanHalf * aspect);
    const ndcY = framing.capture ? 0 : -offsetY / (distance * tanHalf);
    background.uniforms.uObject.value.set(0.5 + ndcX * 0.5, 0.5 + ndcY * 0.5);
  }

  function render() {
    // getDelta() d'abord : getElapsedTime() remettrait le chronomètre à zéro.
    const delta = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;
    const k = 1 - Math.pow(1 - DAMPING, delta * 60);
    progress += (target - progress) * k;
    if (Math.abs(target - progress) < 0.0004) progress = target;
    pointerSmooth.x += (pointer.x - pointerSmooth.x) * k;
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * k;
    if (introStart === null) introStart = time;
    intro = clamp01((time - introStart) / 2.2);
    const t = updateStory(progress, time);
    frame(progress, t);
    camera.position.copy(camPos);
    camera.lookAt(camTarget);
    world.rotation.set(pointerSmooth.y * 0.04, pointerSmooth.x * 0.08, 0);
    background.uniforms.uTime.value = time;
    renderer.render(scene, camera);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    const busy = Math.abs(target - progress) > 0.0005 || now - lastInput < 1500 || intro < 1;
    const fps = busy ? 60 : 30;
    if (lastFrame && now - lastFrame < 1000 / fps - 2) return;
    lastFrame = now;
    render();
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    size.w = Math.max(1, rect.width);
    size.h = Math.max(1, rect.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : PIXEL_RATIO_MAX));
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h;
    camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(background.uniforms.uResolution.value);
  }

  resize();
  // Compile les shaders avant la première image (fœtus et photo compris).
  fetus.visible = photoPlane.visible = true;
  renderer.compile(scene, camera);
  fetus.visible = photoPlane.visible = false;

  const api = {
    setProgress(p) { target = clamp01(p); lastInput = performance.now(); },
    setPointer(x, y) { pointer.x = x; pointer.y = y; lastInput = performance.now(); },
    resize,
    start() { if (running) return; running = true; clock.getDelta(); lastFrame = 0; raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); },
    renderOnce() { render(); },
    ready: photoReady,
    get progress() { return progress; },
    // Contrôle qualité et génération des images de secours : place le récit sans inertie.
    snap(p) { target = progress = clamp01(p); intro = 1; introStart = clock.elapsedTime - 10; render(); },
    // Rend une image fixe du récit (fond compris), objet centré, et la renvoie en Blob.
    async capture(p, width, height, type = 'image/webp', quality = 0.86) {
      await photoReady;
      const wasRunning = running;
      api.stop();
      framing.capture = true;
      renderer.setPixelRatio(1);
      renderer.setSize(width, height, false);
      size.w = width; size.h = height;
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.getDrawingBufferSize(background.uniforms.uResolution.value);
      target = progress = clamp01(p); intro = 1; introStart = clock.elapsedTime - 10;
      pointer = { x: 0, y: 0 }; pointerSmooth = { x: 0, y: 0 };
      render();
      render();
      const blob = await new Promise(resolve => { render(); canvas.toBlob(resolve, type, quality); });
      framing.capture = false;
      resize();
      if (wasRunning) api.start();
      return blob;
    },
    dispose() {
      api.stop();
      renderer.dispose();
    }
  };
  Object.defineProperty(api, 'debug', { value: { renderer, scene, camera, envelope, fetus, photoPlane, cells } });
  return api;
}
