// Routage du site : pages, adresses par langue, liens alternatifs.
export const PAGE_KEYS = ['home', 'plans', 'platform', 'contact', 'legal', 'terms', 'privacy', 'cookies'];

export function createSite(config, langs) {
  const base = config.site.basePath.replace(/\/?$/, '/');
  const domain = config.site.domain.replace(/\/$/, '');
  const path = (lang, key = 'home', hash = '') => `${base}${lang}/${langs[lang].slugs[key]}${hash}`;
  const abs = p => domain + p;
  const asset = p => `${base}assets/${p}`;
  const alternates = key => Object.keys(langs).map(l => ({ lang: l, href: abs(path(l, key)) }));
  // Liens internes utilisables dans les textes : {contact}, {plans}, {legal}…
  const links = lang => Object.fromEntries(Object.keys(langs[lang].slugs).map(k => [k, path(lang, k)]));
  return { base, domain, path, abs, asset, alternates, links, langs, config, defaultLang: config.site.defaultLang };
}
