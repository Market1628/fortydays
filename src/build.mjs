// Génère le site statique dans le dossier site/ (Node 18 ou plus récent, aucune dépendance).
//   node src/build.mjs
// Sources : src/config.json (tarifs, coordonnées, mentions), src/content/*.mjs (textes),
// src/lib/*.mjs (gabarits), src/assets/ (CSS, JS, images, Three.js), copiés tels quels.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fr from './content/fr.mjs';
import en from './content/en.mjs';
import he from './content/he.mjs';
import { createSite, PAGE_KEYS } from './lib/site.mjs';
import { layout } from './lib/layout.mjs';
import { homePage, plansPage, platformPage, contactPage, legalPage, notFoundPage } from './lib/pages.mjs';
import { organization, website, webpage, breadcrumb, products, faq, jsonld, sitemap, robots } from './lib/seo.mjs';

const SRC = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.FD_OUT || join(SRC, '..', 'site');
const config = JSON.parse(readFileSync(join(SRC, 'config.json'), 'utf8'));
// Version de démonstration (ex. GitHub Pages) : autre adresse, sous-dossier, pages non indexées.
//   FD_DOMAIN=https://pseudo.github.io FD_BASE_PATH=/fortydays/ FD_NOINDEX=1 FD_OUT=dossier node src/build.mjs
if (process.env.FD_DOMAIN) config.site.domain = process.env.FD_DOMAIN;
if (process.env.FD_BASE_PATH) config.site.basePath = process.env.FD_BASE_PATH;
const DEMO = process.env.FD_NOINDEX === '1';
// Typographie française : espace insécable avant : ; ? ! » et après «, pour éviter les signes en début de ligne.
function frenchSpacing(value) {
  if (typeof value === 'string') return value.replace(/ ([:;?!»])/g, ' $1').replace(/« /g, '« ');
  if (Array.isArray(value)) return value.map(frenchSpacing);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frenchSpacing(v)]));
  return value;
}
// Hébreu : la marque « 40 Days » est isolée (U+2066…U+2069) pour garder son ordre dans une phrase RTL.
function isolateBrand(value) {
  if (typeof value === 'string') return value.replace(/40 Days/g, '⁦40 Days⁩');
  if (Array.isArray(value)) return value.map(isolateBrand);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, isolateBrand(v)]));
  return value;
}
const langs = { fr: frenchSpacing(fr), en, he: { ...isolateBrand(he), meta: he.meta } };
const site = createSite(config, langs);
site.version = Date.now().toString(36);
site.noindex = DEMO;

// Vérifie que chaque langue a bien toutes les clés de la langue par défaut.
function checkKeys(ref, other, path = '') {
  for (const key of Object.keys(ref)) {
    if (!(key in other)) throw new Error(`Texte manquant : ${path}${key}`);
    if (ref[key] && typeof ref[key] === 'object' && !Array.isArray(ref[key])) checkKeys(ref[key], other[key], `${path}${key}.`);
  }
}
for (const lang of ['en', 'he']) {
  try { checkKeys(fr, langs[lang]); } catch (e) { throw new Error(`[${lang}] ${e.message}`); }
}

// Nettoie la sortie, puis copie les ressources.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true });

const write = (rel, content) => {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

const importMap = `<script type="importmap">{"imports":{"three":"${site.asset('vendor/three.module.js')}"}}</script>
<link rel="preload" href="${site.asset('img/story-1.webp')}" as="image" type="image/webp" fetchpriority="high">`;

let count = 0;
for (const [lang, t] of Object.entries(langs)) {
  const base = [organization(site), website(site, t)];
  const forms = { form: t.formJs };
  const pages = {
    home: { main: homePage(site, t), graph: [...base, webpage(site, t, 'home'), faq(t)], head: importMap, bodyClass: 'has-story' },
    plans: { main: plansPage(site, t), graph: [...base, webpage(site, t, 'plans'), breadcrumb(site, t, 'plans'), ...products(site, t)], i18n: forms, mobileCta: false },
    platform: { main: platformPage(site, t), graph: [...base, webpage(site, t, 'platform'), breadcrumb(site, t, 'platform')], i18n: forms },
    contact: { main: contactPage(site, t), graph: [...base, webpage(site, t, 'contact'), breadcrumb(site, t, 'contact')], i18n: forms }
  };
  for (const key of ['legal', 'terms', 'privacy', 'cookies']) {
    pages[key] = { main: legalPage(site, t, key), graph: [...base, webpage(site, t, key), breadcrumb(site, t, key)], mobileCta: false };
  }
  for (const key of PAGE_KEYS) {
    const page = pages[key];
    const html = layout(site, t, key, { ...page, graph: [jsonld(page.graph)] });
    write(join(lang, t.slugs[key], 'index.html'), html);
    count++;
  }
}

// Page 404 (français, avec liens vers les autres langues).
write('404.html', layout(site, fr, 'notFound', {
  main: notFoundPage(site, fr) + `\n<p class="center not-found__langs"><a href="${site.path('en')}" lang="en">English: back to home</a> · <a href="${site.path('he')}" lang="he" dir="rtl">לדף הבית בעברית</a></p>`,
  noindex: true, mobileCta: false
}));

// Racine : redirection vers la langue de la visiteuse (ou le français par défaut).
const alternates = Object.keys(langs).map(l => `<link rel="alternate" hreflang="${l}" href="${site.abs(site.path(l))}">`).join('\n');
write('index.html', `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>40 Days · Accompagnement post-partum</title>
<meta name="robots" content="noindex, follow">
${alternates}
<link rel="alternate" hreflang="x-default" href="${site.abs(site.path('fr'))}">
<link rel="icon" href="${site.asset('img/favicon.svg')}" type="image/svg+xml">
<script>
(function () {
  var lang = 'fr';
  try {
    var saved = localStorage.getItem('fd-lang');
    if (saved === 'fr' || saved === 'en' || saved === 'he') lang = saved;
    else {
      var list = navigator.languages || [navigator.language || 'fr'];
      for (var i = 0; i < list.length; i++) {
        var code = String(list[i] || '').slice(0, 2).toLowerCase();
        if (code === 'he' || code === 'iw') { lang = 'he'; break; }
        if (code === 'fr') { lang = 'fr'; break; }
        if (code === 'en') { lang = 'en'; break; }
      }
    }
  } catch (e) {}
  location.replace('${site.base}' + lang + '/');
})();
</script>
<style>body{font-family:system-ui,sans-serif;background:#FBF7F2;color:#4A3B34;display:grid;place-content:center;text-align:center;min-height:100vh;margin:0}a{color:#9A5A3C;margin:0 .6em}</style>
</head>
<body>
<h1 style="font:500 2rem Georgia,serif;margin:0 0 1rem">40 Days</h1>
<p><a href="${site.path('fr')}" lang="fr">Français</a><a href="${site.path('en')}" lang="en">English</a><a href="${site.path('he')}" lang="he" dir="rtl">עברית</a></p>
</body>
</html>
`);

write('sitemap.xml', sitemap(site, config.legal.lastUpdate));
write('robots.txt', DEMO ? 'User-agent: *\nDisallow: /\n' : robots(site));
write('site.webmanifest', JSON.stringify({
  name: '40 Days',
  short_name: '40 Days',
  description: fr.meta.home.description,
  start_url: `${site.base}fr/`,
  display: 'minimal-ui',
  background_color: config.site.themeColor,
  theme_color: config.site.themeColor,
  icons: [
    { src: site.asset('img/icon-192.png'), sizes: '192x192', type: 'image/png' },
    { src: site.asset('img/logo-512.png'), sizes: '512x512', type: 'image/png' }
  ]
}, null, 2));

// Hébergement Apache (.htaccess) et Netlify (_redirects) : langue selon le navigateur, 404, cache.
write('.htaccess', `# 40 Days : configuration Apache
DirectoryIndex index.html
ErrorDocument 404 ${site.base}404.html
Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  # Forcer HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  # Racine : langue du navigateur (hébreu, anglais), français par défaut
  RewriteCond %{HTTP:Accept-Language} ^(he|iw) [NC]
  RewriteRule ^$ ${site.base}he/ [R=302,L]
  RewriteCond %{HTTP:Accept-Language} ^en [NC]
  RewriteRule ^$ ${site.base}en/ [R=302,L]
  RewriteRule ^$ ${site.base}fr/ [R=302,L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json application/xml image/svg+xml application/manifest+json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
`);
write('_redirects', `# Netlify : racine selon la langue du navigateur
/  ${site.base}he/  302  Language=he
/  ${site.base}en/  302  Language=en
/  ${site.base}fr/  302
`);

const missing = ['img/story-1.webp', 'img/og-fr.jpg', 'img/favicon.svg'].filter(f => !existsSync(join(SRC, 'assets', f)));
console.log(`40 Days : ${count} pages générées dans ${process.env.FD_OUT ? OUT : 'site/'} (+ 404, sitemap.xml, robots.txt)${DEMO ? ', version de démonstration non indexée' : ''}.`);
if (missing.length) console.warn(`Images manquantes : ${missing.join(', ')}`);
