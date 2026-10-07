// 40 Days : comportements communs à toutes les pages.
// Menu, mémoire de la langue, apparitions au scroll, boutons magnétiques, parallaxe légère,
// compteur des 40 jours, barre de réservation mobile, bandeau cookies, récit 3D de l'accueil.
import { initConsent } from './consent.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const i18n = readJSON('fd-i18n');

function readJSON(id) {
  try { return JSON.parse(document.getElementById(id)?.textContent || '{}'); } catch { return {}; }
}

// Exécute `fn` au plus une fois par image.
function onFrame(fn) {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fn(); });
  };
}

// ---- En-tête et menu -----------------------------------------------------------------
function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const update = onFrame(() => header.classList.toggle('is-scrolled', window.scrollY > 8));
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!toggle || !nav) return;
  const label = toggle.querySelector('.sr-only');
  const outside = [document.querySelector('main'), document.querySelector('.site-footer')].filter(Boolean);
  const desktop = window.matchMedia('(min-width: 960px)');

  const setOpen = (open, { focus = true } = {}) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? label.dataset.labelClose : label.dataset.labelOpen;
    document.body.classList.toggle('menu-open', open);
    outside.forEach(el => { el.inert = open; });
    if (open && focus) nav.querySelector('a')?.focus();
    if (!open && focus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a') && !desktop.matches) setOpen(false, { focus: false }); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });
  desktop.addEventListener('change', () => { if (desktop.matches) setOpen(false, { focus: false }); });
}

// La langue choisie est mémorisée pour la page d'accueil racine (redirection).
function initLangMemory() {
  document.querySelectorAll('[data-lang-link]').forEach(link => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('fd-lang', link.dataset.langLink); } catch { /* stockage indisponible */ }
    });
  });
}

// ---- Micro-interactions ------------------------------------------------------------------
function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length) return;
  // Léger décalage entre éléments voisins.
  items.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
    el.style.setProperty('--i', String(Math.max(0, siblings.indexOf(el))));
  });
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(el => io.observe(el));
}

// Les boutons principaux suivent discrètement le pointeur.
function initMagnetic() {
  if (!finePointer.matches || reduceMotion.matches) return;
  document.querySelectorAll('.btn--magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.setProperty('--mx', `${(dx * 10).toFixed(2)}px`);
      btn.style.setProperty('--my', `${(dy * 8).toFixed(2)}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

// Parallaxe légère des photos.
function initParallax() {
  const items = [...document.querySelectorAll('[data-parallax]')];
  if (!items.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;
  const visible = new Set();
  const update = onFrame(() => {
    const vh = window.innerHeight;
    visible.forEach(el => {
      const r = el.getBoundingClientRect();
      const t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);   // -1..1
      el.querySelector('img')?.style.setProperty('--parallax', `${(t * -18).toFixed(1)}px`);
    });
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    update();
  });
  items.forEach(el => io.observe(el));
  window.addEventListener('scroll', update, { passive: true });
}

// Compteur des 40 jours : avance avec le scroll dans la section « Vos 40 jours ».
function initDays() {
  const section = document.querySelector('[data-days]');
  if (!section) return;
  const value = section.querySelector('[data-day-value]');
  const bar = section.querySelector('[data-day-bar]');
  const list = section.querySelector('.days__phases');
  const phases = [...section.querySelectorAll('.phase')];
  let last = 0;
  const update = onFrame(() => {
    const r = list.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.75, end = vh * 0.35;
    const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end)));
    const day = Math.max(1, Math.min(40, Math.round(1 + p * 39)));
    if (day === last) return;
    last = day;
    value.textContent = String(day).padStart(2, '0');
    bar.parentElement.style.setProperty('--day-progress', String(day / 40));
    bar.style.setProperty('--day-progress', String(day / 40));
    const current = Math.min(3, Math.floor((day - 1) / 10));
    phases.forEach((ph, i) => ph.classList.toggle('is-current', i === current));
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// Barre « Je réserve » en bas de l'écran sur mobile, après le premier écran.
function initMobileCta() {
  const bar = document.querySelector('[data-mobile-cta]');
  if (!bar) return;
  bar.hidden = false;
  const footer = document.querySelector('.site-footer');
  // Masquée quand un formulaire est à l'écran : elle ne doit jamais couvrir un champ.
  const formsInView = new Set();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? formsInView.add(e.target) : formsInView.delete(e.target)));
      update();
    });
    document.querySelectorAll('form, [data-success]').forEach(f => io.observe(f));
  }
  const update = onFrame(() => {
    const past = window.scrollY > window.innerHeight * 0.75;
    const nearFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
    const blocked = document.body.classList.contains('consent-open') || document.body.classList.contains('menu-open') || formsInView.size > 0;
    bar.classList.toggle('is-visible', past && !nearFooter && !blocked);
  });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('fd:consent', update);
  update();
}

// Hauteur occupée en bas de l'écran par les barres fixes visibles (réservation mobile, cookies).
// Elle alimente scroll-padding-bottom : un élément atteint au clavier n'est jamais caché dessous.
function initObscuredBottom() {
  const bars = [document.querySelector('[data-mobile-cta]'), document.querySelector('[data-consent]')].filter(Boolean);
  if (!bars.length) return;
  const update = onFrame(() => {
    let covered = 0;
    bars.forEach(bar => {
      if (bar.hidden || getComputedStyle(bar).visibility === 'hidden') return;
      const rect = bar.getBoundingClientRect();
      if (!rect.height) return;   // display: none (barre mobile sur ordinateur)
      if (rect.top < window.innerHeight) covered = Math.max(covered, window.innerHeight - rect.top);
    });
    document.documentElement.style.setProperty('--obscured-bottom', `${Math.round(covered)}px`);
  });
  const watcher = new MutationObserver(update);
  bars.forEach(bar => watcher.observe(bar, { attributes: true, attributeFilter: ['hidden', 'class'] }));
  bars.forEach(bar => bar.addEventListener('transitionend', update));
  window.addEventListener('resize', update);
  update();
}

// ---- Récit 3D de l'accueil --------------------------------------------------------------------
function initStory() {
  const story = document.querySelector('[data-story]');
  if (!story) return;
  const chapters = [...story.querySelectorAll('[data-chapter]')];
  const frames = [...story.querySelectorAll('.story__frame')];
  const caption = story.querySelector('[data-story-caption]');
  const captions = JSON.parse(caption?.dataset.captions || '[]');
  const captionNum = caption?.querySelector('[data-caption-num]');
  const captionText = caption?.querySelector('[data-caption-text]');
  let anchors = [];
  let scene = null;
  let stage = 0;

  // Repères de scroll : chaque chapitre couvre un cinquième du récit.
  const measure = () => {
    const vh = window.innerHeight;
    const top = story.getBoundingClientRect().top + window.scrollY;
    anchors = chapters.map((c, i) => (i === 0 ? top : c.getBoundingClientRect().top + window.scrollY - vh * 0.5));
    anchors.push(top + story.offsetHeight - vh);
    for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  };
  const progress = () => {
    const y = window.scrollY, n = chapters.length;
    if (y <= anchors[0]) return 0;
    for (let i = 0; i < n; i++) {
      if (y < anchors[i + 1]) return (i + (y - anchors[i]) / (anchors[i + 1] - anchors[i])) / n;
    }
    return 1;
  };
  const setStage = s => {
    if (s === stage) return;
    stage = s;
    frames.forEach((f, i) => f.classList.toggle('is-active', i === s));
    if (!caption) return;
    const write = () => {
      captionNum.textContent = String(s + 1).padStart(2, '0');
      captionText.textContent = captions[s] || '';
      caption.classList.remove('is-changing');
    };
    if (reduceMotion.matches) return write();
    caption.classList.add('is-changing');
    setTimeout(write, 300);
  };
  const update = onFrame(() => {
    const p = progress();
    setStage(Math.min(chapters.length - 1, Math.floor(p * chapters.length)));
    if (scene) scene.setProgress(p);
  });
  // Le titre final apparaît quand le bébé est dans les bras ; s'il reste 1,6 s à l'écran sans que la
  // scène y soit arrivée (machine lente), il est révélé quand même.
  const heldTitle = story.querySelector('[data-held-title]');
  if (heldTitle && 'IntersectionObserver' in window) {
    let timer = 0;
    new IntersectionObserver(([entry]) => {
      clearTimeout(timer);
      if (entry.isIntersecting) timer = setTimeout(() => heldTitle.classList.add('is-shown'), 1600);
    }, { threshold: 0.6 }).observe(heldTitle);
  }
  measure();
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); });
  window.addEventListener('load', () => { measure(); update(); });

  // La 3D est chargée après le contenu, seulement si elle peut tourner correctement.
  const canRun3D = () => {
    if (reduceMotion.matches) return false;
    if (new URLSearchParams(location.search).has('static')) return false;   // contrôle qualité : images fixes
    if (navigator.connection && navigator.connection.saveData) return false;
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return false;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch { return false; }
  };
  const start3D = async () => {
    const canvas = story.querySelector('[data-story-canvas]');
    try {
      const { createHomeScene } = await import('./home-scene.js');
      scene = createHomeScene({
        canvas,
        rtl: document.documentElement.dir === 'rtl',
        mobile: window.matchMedia('(max-width: 899px), (pointer: coarse)').matches,
        onHeld: held => {
          story.classList.toggle('is-held', held);
          if (held) heldTitle?.classList.add('is-shown');
        }
      });
      window.__fortyScene = scene;      // contrôle qualité (voir README)
      measure();
      const p = progress();
      if (p > 0.02) scene.snap(p); else scene.setProgress(p);
      let inView = true;
      scene.start();
      requestAnimationFrame(() => story.classList.add('story--live'));
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !document.hidden) scene.start(); else scene.stop();
      }, { rootMargin: '120px 0px' }).observe(story);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) scene.stop(); else if (inView) scene.start();
      });
      new ResizeObserver(() => { scene.resize(); measure(); }).observe(canvas);
      if (finePointer.matches) {
        window.addEventListener('pointermove', e => {
          scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        }, { passive: true });
      }
    } catch (error) {
      console.warn('[40 Days] Scène 3D indisponible : images fixes affichées à la place.', error);
      scene = null;
      story.classList.remove('story--live');
    }
  };
  if (canRun3D()) {
    const go = () => ('requestIdleCallback' in window
      ? window.requestIdleCallback(start3D, { timeout: 2500 })
      : setTimeout(start3D, 500));
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  }
}

// ---- Démarrage ---------------------------------------------------------------------------------------
initHeader();
initMenu();
initLangMemory();
initReveal();
initMagnetic();
initParallax();
initDays();
initMobileCta();
initConsent(i18n);
initObscuredBottom();
initStory();
if (document.querySelector('[data-form]')) {
  import('./forms.js').then(m => m.initForms(i18n));
}
