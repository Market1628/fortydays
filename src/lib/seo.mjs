// Données structurées (JSON-LD), sitemap et robots.
import { PAGE_KEYS } from './site.mjs';

const stripTags = html => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export function organization(site) {
  const { config, domain, asset } = site;
  return {
    '@type': 'Organization',
    '@id': `${domain}/#organization`,
    name: config.site.name,
    legalName: config.legal.companyName,
    url: `${domain}/`,
    logo: { '@type': 'ImageObject', url: domain + asset('img/logo-512.png'), width: 512, height: 512 },
    email: config.site.email,
    areaServed: [{ '@type': 'Country', name: 'France' }, { '@type': 'Country', name: 'Israel' }],
    knowsLanguage: ['fr', 'en', 'he']
  };
}

export function website(site, t) {
  return {
    '@type': 'WebSite',
    '@id': `${site.domain}/#website`,
    url: `${site.domain}/`,
    name: site.config.site.name,
    description: t.meta.home.description,
    inLanguage: Object.keys(site.langs),
    publisher: { '@id': `${site.domain}/#organization` }
  };
}

export function webpage(site, t, key) {
  const url = site.abs(site.path(t.lang, key));
  return {
    '@type': key === 'contact' ? 'ContactPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: t.meta[key].title,
    description: t.meta[key].description,
    inLanguage: t.lang,
    isPartOf: { '@id': `${site.domain}/#website` },
    about: { '@id': `${site.domain}/#organization` },
    ...(key !== 'home' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {})
  };
}

export function breadcrumb(site, t, key) {
  const url = site.abs(site.path(t.lang, key));
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.ui.home, item: site.abs(site.path(t.lang, 'home')) },
      { '@type': 'ListItem', position: 2, name: t.pageNames[key], item: url }
    ]
  };
}

export function products(site, t) {
  const plansUrl = site.abs(site.path(t.lang, 'plans'));
  const country = { EUR: 'FR', ILS: 'IL' };
  return site.config.pricing.plans.map(plan => {
    const info = t.planInfo[plan.id];
    return {
      '@type': 'Product',
      '@id': `${plansUrl}#${plan.id}`,
      name: `${site.config.site.name} — ${info.name}`,
      description: `${info.tagline} ${info.features.join(' · ')}`,
      brand: { '@type': 'Brand', name: site.config.site.name },
      image: site.domain + site.asset('img/story-5.webp'),
      category: t.planInfo.category,
      offers: Object.entries(plan.price).map(([currency, amount]) => ({
        '@type': 'Offer',
        price: amount.toFixed(2),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        url: `${plansUrl}?plan=${plan.id}#inscription`,
        eligibleRegion: { '@type': 'Country', name: country[currency] },
        seller: { '@id': `${site.domain}/#organization` }
      }))
    };
  });
}

export function faq(t) {
  return {
    '@type': 'FAQPage',
    mainEntity: t.home.faq.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(item.a) }
    }))
  };
}

export const jsonld = graph =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

export function sitemap(site, lastmod) {
  const urls = [];
  for (const key of PAGE_KEYS) {
    for (const lang of Object.keys(site.langs)) {
      const links = site.alternates(key)
        .map(a => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${site.abs(site.path(site.defaultLang, key))}"/>`)
        .join('\n');
      const priority = key === 'home' ? '1.0' : key === 'plans' ? '0.9' : ['platform', 'contact'].includes(key) ? '0.7' : '0.3';
      urls.push(`  <url>\n    <loc>${site.abs(site.path(lang, key))}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n${links}\n  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

export const robots = site => `User-agent: *
Allow: /

Sitemap: ${site.domain}${site.base}sitemap.xml
`;
