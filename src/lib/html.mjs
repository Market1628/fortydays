// Petits outils de génération HTML : échappement, icônes, images, prix, adresses.
import { PHOTOS } from '../content/photos.mjs';

export const esc = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Concatène des fragments en ignorant les valeurs vides.
export const join = (...parts) => parts.flat(Infinity).filter(p => p !== false && p !== null && p !== undefined).join('');

// ---- Icônes (trait 1.5, 24 px) -------------------------------------------------------
const ICONS = {
  move: '<circle cx="12" cy="4.5" r="2"/><path d="M4 9.5c2.8 1.2 5.3 1.7 8 1.7s5.2-.5 8-1.7M12 11.2v4.3m0 0-3.2 5m3.2-5 3.2 5"/>',
  chat: '<path d="M4 5.5h11a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z"/><path d="M17 9h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5L16 18h-4"/>',
  play: '<rect x="2.5" y="4.5" width="19" height="13" rx="3"/><path d="m10 8.5 4.5 2.5-4.5 2.5v-5Z"/><path d="M8 20.5h8"/>',
  bowl: '<path d="M3 11.5h18a9 9 0 0 1-18 0Z"/><path d="M8.5 7.5c0-1.2 1-1.6 1-2.8M12 7.5c0-1.2 1-1.6 1-2.8M15.5 7.5c0-1.2 1-1.6 1-2.8"/>',
  capsule: '<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="m9.9 9 4.2 6"/>',
  bag: '<path d="M5 8h14l-1 12.5H6L5 8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
  check: '<path d="m5 12.5 4.2 4.2L19 7"/>',
  dash: '<path d="M7 12h10"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="1.5"/><path d="M2.5 9h19M12 9v11.5M12 9c-1.6-3.6-6-4.3-6-1.6C6 9 12 9 12 9Zm0 0c1.6-3.6 6-4.3 6-1.6C18 9 12 9 12 9Z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
  leaf: '<path d="M5 19c0-8.5 5.5-14 15-14 0 9.5-5.5 15-14 15"/><path d="M5 19c3.5-4.5 6.5-7 10-9"/>',
  sun: '<circle cx="12" cy="13" r="4"/><path d="M12 4.5v2M4.5 13h-2m19 0h-2M6.3 7.3 5 6m12.7 1.3L19 6M3 19.5h18"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4m8-4v4"/>',
  quote: '<path d="M9.5 7C6.5 8 5 10.3 5 13.5V17h4.5v-4.5H7.2c0-2.2 1-3.5 2.8-4.3L9.5 7Zm9 0c-3 1-4.5 3.3-4.5 6.5V17h4.5v-4.5h-2.3c0-2.2 1-3.5 2.8-4.3L18.5 7Z"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.5 14.4c2.6-.5 4.6 1 5 4.1"/>',
  phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>'
};
export const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

// ---- Logo typographique ------------------------------------------------------------
export const logo = (label) =>
  `<span class="logo" dir="ltr"><span class="logo__num">40</span><span class="logo__word">Days</span></span>${label ? `<span class="sr-only">${esc(label)}</span>` : ''}`;

// ---- Photos Unsplash -----------------------------------------------------------------
const UNSPLASH = 'https://images.unsplash.com/';
const imgUrl = (src, w, h, fm) =>
  `${UNSPLASH}${src}?fm=${fm}&fit=crop&crop=faces,entropy&w=${w}&h=${h}&q=${fm === 'avif' ? 55 : 68}`;

/**
 * Image responsive : AVIF, puis WebP, puis JPEG. Dimensions explicites (pas de décalage
 * de mise en page), chargement différé par défaut.
 * ratio : [largeur, hauteur] ; widths : largeurs servies ; sizes : attribut sizes.
 */
export function photo(key, lang, { ratio = [4, 5], widths = [480, 800, 1120], sizes = '(min-width: 900px) 40vw, 92vw', eager = false, cls = '', credit = true, ui } = {}) {
  const p = PHOTOS[key];
  if (!p) throw new Error(`Photo inconnue : ${key}`);
  const h = w => Math.round(w * ratio[1] / ratio[0]);
  const set = fm => widths.map(w => `${imgUrl(p.src, w, h(w), fm)} ${w}w`).join(', ');
  const base = widths[Math.min(1, widths.length - 1)];
  const profile = `https://unsplash.com/@${p.user}?utm_source=40days&amp;utm_medium=referral`;
  const page = `https://unsplash.com/photos/${p.page}?utm_source=40days&amp;utm_medium=referral`;
  return `<figure class="photo ${cls}">
  <picture>
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="${imgUrl(p.src, base, h(base), 'jpg')}" alt="${esc(p.alt[lang])}" width="${base}" height="${h(base)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>${credit ? `
  <figcaption class="photo__credit">${ui.photo} <a href="${profile}" rel="noopener">${esc(p.author)}</a> / <a href="${page}" rel="noopener">Unsplash</a></figcaption>` : ''}
</figure>`;
}

// Adresse de la photographie finale pour la scène 3D (texture WebGL : JPEG, cadrage sur les visages).
export function finalePhotoUrl() {
  return `${UNSPLASH}${PHOTOS.finale.src}?fm=jpg&fit=crop&crop=faces&w=846&h=1200&q=78`;
}

// Crédit d'une photo Unsplash (texte et liens).
export function photoCredit(key, ui) {
  const p = PHOTOS[key];
  return `${ui.photo} <a href="https://unsplash.com/@${p.user}?utm_source=40days&amp;utm_medium=referral" rel="noopener">${esc(p.author)}</a> / <a href="https://unsplash.com/photos/${p.page}?utm_source=40days&amp;utm_medium=referral" rel="noopener">Unsplash</a>`;
}

// ---- Prix --------------------------------------------------------------------------------
const LOCALE = { fr: 'fr-FR', en: 'en-US', he: 'he-IL' };
export function price(amount, currency, lang) {
  return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency, maximumFractionDigits: 0 })
    .format(amount).replace(/‏/g, '');
}
export const primaryCurrency = lang => (lang === 'he' ? 'ILS' : 'EUR');
export const secondaryCurrency = lang => (lang === 'he' ? 'EUR' : 'ILS');
