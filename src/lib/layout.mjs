// Gabarit commun : <head> (SEO), en-tête, sélecteur de langue, pied de page, bandeau cookies.
import { esc, icon, logo } from './html.mjs';

const FONTS = {
  latin: 'family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600',
  hebrew: 'family=Frank+Ruhl+Libre:wght@500;600&family=Assistant:wght@400;500;600'
};
const OG_LOCALE = { fr: 'fr_FR', en: 'en_US', he: 'he_IL' };
const LANG_NAMES = { fr: ['FR', 'Français'], en: ['EN', 'English'], he: ['עב', 'עברית'] };

export function layout(site, t, key, { main, graph = [], head = '', bodyClass = '', mobileCta = true, i18n = {}, noindex = false }) {
  const { path, abs, asset, config } = site;
  const meta = t.meta[key];
  const url = noindex ? abs(path(t.lang, 'home')) : abs(path(t.lang, key));
  const ogImage = abs(asset(`img/og-${t.lang}.jpg`));
  const fontUrl = `https://fonts.googleapis.com/css2?${FONTS.latin}${t.lang === 'he' ? '&' + FONTS.hebrew : ''}&display=swap`;
  const alternates = noindex ? '' : site.alternates(key)
    .map(a => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${abs(path(site.defaultLang, key))}">`)
    .join('\n');
  const ogAlternates = Object.keys(site.langs).filter(l => l !== t.lang)
    .map(l => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`).join('\n');
  const i18nData = { lang: t.lang, consent: t.ui.consent, ...i18n };

  const navItems = [
    ['programme', path(t.lang, 'home', '#programme'), false],
    ['plans', path(t.lang, 'plans'), key === 'plans'],
    ['platform', path(t.lang, 'platform'), key === 'platform'],
    ['contact', path(t.lang, 'contact'), key === 'contact']
  ];
  const linkKey = noindex ? 'home' : key;
  const langLinks = Object.keys(site.langs).map(l => {
    const [short, name] = LANG_NAMES[l];
    const current = l === t.lang;
    return `<li><a class="lang-switch__link" href="${path(l, linkKey)}" hreflang="${l}" lang="${l}"${l === 'he' ? ' dir="rtl"' : ''}${current ? ' aria-current="true"' : ''} data-lang-link="${l}"><span aria-hidden="true">${short}</span><span class="sr-only">${name}</span></a></li>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="${url}">
${alternates}
<meta name="robots" content="${site.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`}
<meta name="theme-color" content="${config.site.themeColor}">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(config.site.name)}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(t.ui.ogAlt)}">
<meta property="og:locale" content="${OG_LOCALE[t.lang]}">
${ogAlternates}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="twitter:image" content="${ogImage}">
<meta name="twitter:image:alt" content="${esc(t.ui.ogAlt)}">
<link rel="icon" href="${asset('img/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${asset('img/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${asset('img/apple-touch-icon.png')}">
<link rel="manifest" href="${site.base}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="stylesheet" href="${fontUrl}">
<link rel="stylesheet" href="${asset('css/main.css')}?v=${site.version}">
<script>document.documentElement.classList.add('js');</script>
${head}${graph.length ? '\n' + graph.join('\n') : ''}
</head>
<body class="page-${key} ${bodyClass}">
<a class="skip-link" href="#contenu">${esc(t.ui.skip)}</a>
<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="site-header__logo" href="${path(t.lang, 'home')}"${key === 'home' ? ' aria-current="page"' : ''}>${logo(t.ui.logoLabel)}</a>
    <nav class="site-nav" id="site-nav" aria-label="${esc(t.ui.navLabel)}" data-nav>
      <ul class="site-nav__list">
        ${navItems.map(([k, href, current]) => `<li><a class="site-nav__link" href="${href}"${current ? ' aria-current="page"' : ''}>${esc(t.ui.nav[k])}</a></li>`).join('\n        ')}
      </ul>
      <a class="btn btn--primary site-nav__cta" href="${path(t.lang, 'plans', '#inscription')}">${esc(t.ui.cta)}</a>
    </nav>
    <div class="site-header__actions">
      <nav class="lang-switch" aria-label="${esc(t.ui.langLabel)}"><ul>${langLinks}</ul></nav>
      <a class="btn btn--primary btn--small btn--magnetic site-header__cta" href="${path(t.lang, 'plans', '#inscription')}">${esc(t.ui.ctaShort)}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>
        <span class="menu-toggle__open">${icon('menu')}</span><span class="menu-toggle__close">${icon('close')}</span>
        <span class="sr-only" data-label-open="${esc(t.ui.menu)}" data-label-close="${esc(t.ui.closeMenu)}">${esc(t.ui.menu)}</span>
      </button>
    </div>
  </div>
</header>
<main id="contenu" tabindex="-1">
${main}
</main>
${footer(site, t, linkKey)}
${mobileCta ? `<div class="mobile-cta" data-mobile-cta hidden><a class="btn btn--primary btn--block" href="${path(t.lang, 'plans', '#inscription')}">${esc(t.ui.cta)}</a></div>` : ''}
${consentBanner(site, t)}
<script type="application/json" id="fd-i18n">${JSON.stringify(i18nData).replace(/</g, '\\u003c')}</script>
<script type="module" src="${asset('js/main.js')}?v=${site.version}"></script>
</body>
</html>
`;
}

function footer(site, t, key) {
  const { path, config } = site;
  const f = t.ui.footer;
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <div class="container site-footer__top">
    <div class="site-footer__brand">
      <a href="${path(t.lang, 'home')}" class="site-footer__logo">${logo(t.ui.logoLabel)}</a>
      <p>${esc(f.tagline)}</p>
      <a class="site-footer__mail" href="mailto:${config.site.email}">${icon('mail')}<span dir="ltr">${config.site.email}</span></a>
    </div>
    <nav class="site-footer__nav" aria-label="${esc(f.navLabel)}">
      <div>
        <h2 class="site-footer__title">${esc(f.programme)}</h2>
        <ul>
          <li><a href="${path(t.lang, 'home', '#programme')}">${esc(t.ui.nav.programme)}</a></li>
          <li><a href="${path(t.lang, 'plans')}">${esc(t.ui.nav.plans)}</a></li>
          <li><a href="${path(t.lang, 'platform')}">${esc(t.ui.nav.platform)}</a></li>
          <li><a href="${path(t.lang, 'home', '#faq')}">${esc(f.faq)}</a></li>
          <li><a href="${path(t.lang, 'contact')}">${esc(t.ui.nav.contact)}</a></li>
        </ul>
      </div>
      <div>
        <h2 class="site-footer__title">${esc(f.info)}</h2>
        <ul>
          <li><a href="${path(t.lang, 'legal')}">${esc(t.pageNames.legal)}</a></li>
          <li><a href="${path(t.lang, 'terms')}">${esc(t.pageNames.terms)}</a></li>
          <li><a href="${path(t.lang, 'privacy')}">${esc(t.pageNames.privacy)}</a></li>
          <li><a href="${path(t.lang, 'cookies')}">${esc(t.pageNames.cookies)}</a></li>
          <li><button type="button" class="link-button" data-consent-open>${esc(t.ui.consent.manage)}</button></li>
        </ul>
      </div>
      <div>
        <h2 class="site-footer__title">${esc(f.languages)}</h2>
        <ul>
          <li><a href="${path('fr', key)}" hreflang="fr" lang="fr">Français</a></li>
          <li><a href="${path('en', key)}" hreflang="en" lang="en">English</a></li>
          <li><a href="${path('he', key)}" hreflang="he" lang="he" dir="rtl">עברית</a></li>
        </ul>
      </div>
    </nav>
  </div>
  <div class="container site-footer__bottom">
    <p>© ${year} ${esc(config.site.name)} · ${esc(config.legal.companyName)}</p>
    <p class="site-footer__disclaimer">${esc(f.disclaimer)}</p>
    <p>${f.credits.replace(/{(w+)}/g, (m, k) => site.links(t.lang)[k] ?? m)}</p>
  </div>
</footer>`;
}

function consentBanner(site, t) {
  const c = t.ui.consent;
  const toggle = (id, cat, disabled) => `<div class="consent__option">
          <input type="checkbox" id="consent-${id}" name="${id}"${disabled ? ' checked disabled' : ''} data-consent-category="${id}">
          <label for="consent-${id}"><strong>${esc(cat.title)}</strong><span>${esc(cat.text)}</span></label>
        </div>`;
  return `<section class="consent" role="dialog" aria-modal="false" aria-labelledby="consent-title" aria-describedby="consent-text" data-consent hidden>
  <div class="consent__inner">
    <h2 class="consent__title" id="consent-title">${esc(c.title)}</h2>
    <p class="consent__text" id="consent-text">${esc(c.text)} <a href="${site.path(t.lang, 'cookies')}">${esc(c.policy)}</a></p>
    <div class="consent__panel" id="consent-panel" hidden data-consent-panel>
      <fieldset>
        <legend class="sr-only">${esc(c.customize)}</legend>
        ${toggle('necessary', c.categories.necessary, true)}
        ${toggle('analytics', c.categories.analytics, false)}
        ${toggle('marketing', c.categories.marketing, false)}
      </fieldset>
    </div>
    <div class="consent__actions">
      <button type="button" class="btn btn--ghost btn--small" data-consent-action="refuse">${esc(c.refuse)}</button>
      <button type="button" class="btn btn--ghost btn--small" data-consent-action="customize" aria-expanded="false" aria-controls="consent-panel">${esc(c.customize)}</button>
      <button type="button" class="btn btn--ghost btn--small" data-consent-action="save" hidden>${esc(c.save)}</button>
      <button type="button" class="btn btn--ghost btn--small" data-consent-action="accept">${esc(c.accept)}</button>
    </div>
  </div>
</section>`;
}

// Fil d'Ariane visible (le balisage JSON-LD est ajouté séparément).
export function breadcrumbNav(site, t, key) {
  return `<nav class="breadcrumb" aria-label="${esc(t.ui.breadcrumb)}">
  <ol>
    <li><a href="${site.path(t.lang, 'home')}">${esc(t.ui.home)}</a></li>
    <li><span aria-current="page">${esc(t.pageNames[key])}</span></li>
  </ol>
</nav>`;
}
