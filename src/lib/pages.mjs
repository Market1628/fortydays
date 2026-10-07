// Gabarits des pages. Les textes viennent de src/content/<langue>.mjs, les tarifs de src/config.json.
import { esc, icon, photo, photoCredit, finalePhotoUrl, price, primaryCurrency, secondaryCurrency } from './html.mjs';
import { breadcrumbNav } from './layout.mjs';
import { PHOTOS } from '../content/photos.mjs';

const pad = n => String(n).padStart(2, '0');
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');

// ---- Composants ------------------------------------------------------------------------
function planCard(site, t, plan, { level = 3 } = {}) {
  const info = t.planInfo[plan.id];
  const c1 = primaryCurrency(t.lang), c2 = secondaryCurrency(t.lang);
  return `<article class="plan${plan.featured ? ' plan--featured' : ''}" aria-labelledby="plan-${plan.id}" data-reveal>
  ${plan.featured ? `<p class="plan__badge">${icon('heart')}${esc(t.planInfo.mostChosen)}</p>` : ''}
  <h${level} class="plan__name" id="plan-${plan.id}">${esc(info.name)}</h${level}>
  <p class="plan__tagline">${info.tagline}</p>
  <p class="plan__price"><span class="plan__amount">${price(plan.price[c1], c1, t.lang)}</span> <span class="plan__period">${esc(t.planInfo.period)}</span></p>
  <p class="plan__alt">${esc(fill(t.planInfo.altPrice, { price: price(plan.price[c2], c2, t.lang) }))}</p>
  <ul class="plan__features">
    ${info.features.map(f => `<li>${icon('check')}<span>${f}</span></li>`).join('\n    ')}
  </ul>
  <a class="btn ${plan.featured ? 'btn--primary btn--magnetic' : 'btn--outline'} btn--block" href="${site.path(t.lang, 'plans')}?plan=${plan.id}#inscription" data-choose-plan="${plan.id}">${esc(t.planInfo.choose)}<span class="sr-only"> : ${esc(info.name)}</span></a>
</article>`;
}

function sectionHead({ eyebrow, title, intro, id, level = 2, center = false }) {
  return `<header class="section__head${center ? ' section__head--center' : ''}" data-reveal>
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h${level} class="h2" id="${id}">${title}</h${level}>
    ${intro ? `<p class="section__intro">${intro}</p>` : ''}
  </header>`;
}

function field(t, { id, name = id, label, type = 'text', autocomplete, required = true, hint, attrs = '', width = 'full', dir, tag = 'input' }) {
  const describedBy = [hint ? `${id}-hint` : null, `${id}-error`].filter(Boolean).join(' ');
  const control = tag === 'textarea'
    ? `<textarea id="${id}" name="${name}" rows="5"${required ? ' required' : ''} aria-describedby="${describedBy}" ${attrs}></textarea>`
    : `<input id="${id}" name="${name}" type="${type}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${required ? ' required' : ''} aria-describedby="${describedBy}"${dir ? ` dir="${dir}"` : ''} ${attrs}>`;
  return `<div class="field field--${width}">
  <label class="field__label" for="${id}">${esc(label)}${required ? ' <span class="field__req" aria-hidden="true">*</span>' : ` <span class="field__opt">(${esc(t.form.optional)})</span>`}</label>
  ${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}
  ${control}
  <p class="field__error" id="${id}-error" hidden></p>
</div>`;
}

const formStatus = () => `<p class="form__status" role="status" aria-live="polite" data-status></p>`;
const errorSummary = t => `<div class="form__summary" role="alert" tabindex="-1" data-error-summary hidden></div>`;

// ---- Accueil -------------------------------------------------------------------------------
export function homePage(site, t) {
  const h = t.home;
  const plans = site.path(t.lang, 'plans');
  const P = (key, o = {}) => photo(key, t.lang, { ui: t.ui, ...o });
  const frames = [1, 2, 3, 4, 5].map(i =>
    `<img class="story__frame${i === 1 ? ' is-active' : ''}" src="${site.asset(`img/story-${i}.webp`)}" width="900" height="900" alt="" decoding="async" ${i === 1 ? 'fetchpriority="high"' : 'loading="lazy"'} data-frame="${i - 1}">`
  ).join('\n      ');

  return `<div class="story" data-story>
  <div class="story__stage" aria-hidden="true">
    <div class="story__frames">
      ${frames}
    </div>
    <canvas class="story__canvas" data-story-canvas data-finale-photo="${esc(finalePhotoUrl())}"></canvas>
    <p class="story__caption" data-story-caption data-captions="${esc(JSON.stringify(h.story.captions))}"><span class="story__caption-num" data-caption-num>01</span><span data-caption-text>${esc(h.story.captions[0])}</span></p>
  </div>

  <section class="chapter chapter--hero" id="accueil" data-chapter aria-labelledby="hero-title">
    <div class="chapter__content">
      <p class="eyebrow">${h.hero.eyebrow}</p>
      <h1 class="display" id="hero-title">${h.hero.title}</h1>
      <p class="lead">${h.hero.lead}</p>
      <p>${h.hero.text}</p>
      <div class="actions">
        <a class="btn btn--primary btn--large btn--magnetic" href="${plans}#inscription">${esc(t.ui.cta)}${icon('arrow', 'icon icon--arrow')}</a>
        <a class="btn btn--ghost" href="#programme">${esc(h.hero.secondary)}</a>
      </div>
      <p class="hero__gift">${icon('gift')}<span>${h.hero.gift} <a href="${plans}?gift=1#inscription">${esc(h.hero.giftLink)}</a></span></p>
    </div>
    <a class="scroll-hint" href="#programme"><span class="scroll-hint__line" aria-hidden="true"></span>${esc(h.hero.scroll)}</a>
  </section>

  <section class="chapter" id="programme" data-chapter aria-labelledby="programme-title">
    <div class="chapter__content">
      <p class="eyebrow"><span class="eyebrow__num">02</span>${h.programme.eyebrow}</p>
      <h2 class="h2" id="programme-title">${h.programme.title}</h2>
      ${h.programme.paragraphs.map(p => `<p>${p}</p>`).join('\n      ')}
      <ul class="key-figures">
        ${h.programme.points.map(pt => `<li><strong>${pt.value}</strong><span>${pt.label}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="chapter" id="inclus" data-chapter aria-labelledby="included-title">
    <div class="chapter__content">
      <p class="eyebrow"><span class="eyebrow__num">03</span>${h.included.eyebrow}</p>
      <h2 class="h2" id="included-title">${h.included.title}</h2>
      <p>${h.included.intro}</p>
      <ul class="included">
        ${h.included.items.map(it => `<li class="included__item" data-reveal>
          <span class="included__icon">${icon(it.icon)}</span>
          <div>
            <h3 class="h4">${it.title}</h3>
            <p>${it.text}</p>${it.note ? `\n            <p class="note">${icon('info')}<span>${it.note}</span></p>` : ''}
          </div>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="chapter" id="temoignages" data-chapter aria-labelledby="testimonials-title">
    <div class="chapter__content">
      <p class="eyebrow"><span class="eyebrow__num">04</span>${h.testimonials.eyebrow}</p>
      <h2 class="h2" id="testimonials-title">${h.testimonials.title}</h2>
      <p>${h.testimonials.intro}</p>
      <ul class="testimonials">
        ${h.testimonials.items.map(it => `<li data-reveal>
          <figure class="testimonial">
            <p class="badge">${esc(t.ui.example)}</p>
            <blockquote><p>${it.quote}</p></blockquote>
            <figcaption><strong>${it.name}</strong><span>${it.detail}</span></figcaption>
          </figure>
        </li>`).join('\n        ')}
      </ul>
      <p class="note">${icon('info')}<span>${h.testimonials.note}</span></p>
    </div>
  </section>

  <section class="chapter chapter--cta" id="reserver" data-chapter aria-labelledby="cta-title">
    <div class="chapter__content">
      <p class="eyebrow"><span class="eyebrow__num">05</span>${h.cta.eyebrow}</p>
      <h2 class="display cta-title" id="cta-title" data-held-title>${h.cta.title}</h2>
      <p class="lead">${h.cta.text}</p>
      <div class="actions">
        <a class="btn btn--primary btn--large btn--magnetic" href="${plans}#inscription">${esc(t.ui.cta)}${icon('arrow', 'icon icon--arrow')}</a>
        <a class="btn btn--ghost" href="${plans}?gift=1#inscription">${icon('gift')}${esc(h.cta.gift)}</a>
      </div>
      <p class="story-credit">${photoCredit('finale', t.ui)}</p>
    </div>
  </section>
</div>

<section class="section days" id="vos-40-jours" aria-labelledby="days-title" data-days>
  <div class="container">
    ${sectionHead({ eyebrow: h.days.eyebrow, title: h.days.title, intro: h.days.intro, id: 'days-title' })}
    <div class="days__layout">
      <div class="days__counter" aria-hidden="true">
        <span class="days__label">${esc(h.days.counterLabel)}</span>
        <span class="days__value" data-day-value>01</span>
        <span class="days__total">/ 40</span>
        <span class="days__bar"><span data-day-bar></span></span>
      </div>
      <ol class="days__phases">
        ${h.days.phases.map((ph, i) => `<li class="phase" data-phase="${i}" data-reveal>
          ${P(ph.photo, { ratio: [4, 5], widths: [360, 560, 800], sizes: '(min-width: 1100px) 20vw, (min-width: 700px) 42vw, 86vw', cls: 'phase__photo' })}
          <div class="phase__text">
            <p class="phase__range">${ph.range}</p>
            <h3 class="h4">${ph.title}</h3>
            <p>${ph.text}</p>
          </div>
        </li>`).join('\n        ')}
      </ol>
    </div>
  </div>
</section>

<section class="section split" id="repas" aria-labelledby="meals-title">
  <div class="container split__grid">
    <div class="split__media" data-parallax>${P('bowl', { ratio: [4, 5], widths: [480, 720, 960], sizes: '(min-width: 900px) 42vw, 92vw' })}</div>
    <div class="split__text" data-reveal>
      <p class="eyebrow">${h.meals.eyebrow}</p>
      <h2 class="h2" id="meals-title">${h.meals.title}</h2>
      ${h.meals.paragraphs.map(p => `<p>${p}</p>`).join('\n      ')}
      <ul class="ticks">
        ${h.meals.bullets.map(b => `<li>${icon('check')}<span>${b}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="section plans-teaser" id="forfaits" aria-labelledby="teaser-title">
  <div class="container">
    ${sectionHead({ eyebrow: h.plansTeaser.eyebrow, title: h.plansTeaser.title, intro: h.plansTeaser.intro, id: 'teaser-title', center: true })}
    <div class="plans-grid">
      ${site.config.pricing.plans.map(plan => planCard(site, t, plan)).join('\n      ')}
    </div>
    <p class="note note--center">${icon('info')}<span>${esc(t.ui.supplementsNotice)}</span></p>
    <p class="center"><a class="link-arrow" href="${plans}">${esc(h.plansTeaser.compare)}${icon('arrow', 'icon icon--arrow')}</a></p>
  </div>
</section>

<section class="section split split--reverse gift" aria-labelledby="gift-title">
  <div class="container split__grid">
    <div class="split__media" data-parallax>${P('finger', { ratio: [5, 4], widths: [480, 720, 960], sizes: '(min-width: 900px) 42vw, 92vw' })}</div>
    <div class="split__text" data-reveal>
      <p class="eyebrow">${h.gift.eyebrow}</p>
      <h2 class="h2" id="gift-title">${h.gift.title}</h2>
      ${h.gift.paragraphs.map(p => `<p>${p}</p>`).join('\n      ')}
      <a class="btn btn--outline" href="${plans}?gift=1#inscription">${icon('gift')}${esc(h.gift.cta)}</a>
    </div>
  </div>
</section>

<section class="section faq" id="faq" aria-labelledby="faq-title">
  <div class="container container--narrow">
    ${sectionHead({ eyebrow: h.faq.eyebrow, title: h.faq.title, intro: fill(h.faq.intro, site.links(t.lang)), id: 'faq-title', center: true })}
    <div class="faq__list">
      ${h.faq.items.map((item, i) => `<details class="faq__item" data-reveal>
        <summary><h3 class="faq__q">${item.q}</h3><span class="faq__icon" aria-hidden="true"></span></summary>
        <div class="faq__a"><p>${item.a}</p></div>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section final-cta" aria-labelledby="final-title">
  <div class="container final-cta__inner" data-reveal>
    <h2 class="display" id="final-title">${h.final.title}</h2>
    <p class="lead">${h.final.text}</p>
    <a class="btn btn--primary btn--large btn--magnetic" href="${plans}#inscription">${esc(t.ui.cta)}${icon('arrow', 'icon icon--arrow')}</a>
  </div>
</section>`;
}

// ---- Forfaits + inscription ----------------------------------------------------------------
export function plansPage(site, t) {
  const p = t.plansPage, f = t.form;
  const plans = site.config.pricing.plans;
  const c1 = primaryCurrency(t.lang);
  const cell = v => v
    ? `<td class="is-yes">${icon('check')}<span class="sr-only">${esc(p.compare.yes)}</span></td>`
    : `<td class="is-no">${icon('dash')}<span class="sr-only">${esc(p.compare.no)}</span></td>`;
  const pricing = {
    currencyByCountry: site.config.pricing.currencyByCountry,
    plans: Object.fromEntries(plans.map(pl => [pl.id, { name: t.planInfo[pl.id].name, price: pl.price, featured: pl.featured }]))
  };
  const today = new Date();
  const iso = d => d.toISOString().slice(0, 10);
  const minDate = iso(new Date(today.getTime() - 120 * 864e5));
  const maxDate = iso(new Date(today.getTime() + 300 * 864e5));

  return `<section class="page-hero page-hero--split">
  <div class="container page-hero__grid">
    <div class="page-hero__text">
      ${breadcrumbNav(site, t, 'plans')}
      <p class="eyebrow">${p.eyebrow}</p>
      <h1 class="display">${p.title}</h1>
      <p class="lead">${p.intro}</p>
      <ul class="ticks">
        ${p.reassurance.map(r => `<li>${icon('check')}<span>${r}</span></li>`).join('\n        ')}
      </ul>
    </div>
    <div class="page-hero__media" data-parallax>${photo('cuddle', t.lang, { ui: t.ui, ratio: [4, 5], widths: [480, 720, 960], sizes: '(min-width: 900px) 38vw, 92vw', eager: true })}</div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="plans-title">
  <div class="container">
    <h2 class="sr-only" id="plans-title">${esc(p.cardsTitle)}</h2>
    <div class="plans-grid">
      ${plans.map(plan => planCard(site, t, plan)).join('\n      ')}
    </div>
    <p class="note note--center">${icon('info')}<span>${esc(t.ui.supplementsNotice)}</span></p>
  </div>
</section>

<section class="section compare" aria-labelledby="compare-title">
  <div class="container">
    ${sectionHead({ eyebrow: p.compare.eyebrow, title: p.compare.title, id: 'compare-title', center: true })}
    <div class="table-wrap" role="region" aria-labelledby="compare-title" tabindex="0">
      <table class="compare__table">
        <caption class="sr-only">${esc(p.compare.caption)}</caption>
        <thead>
          <tr>
            <th scope="col">${esc(p.compare.included)}</th>
            ${plans.map(pl => `<th scope="col"${pl.featured ? ' class="is-featured"' : ''}><span class="compare__plan">${esc(t.planInfo[pl.id].name)}</span><span class="compare__price">${price(pl.price[c1], c1, t.lang)}</span></th>`).join('\n            ')}
          </tr>
        </thead>
        <tbody>
          ${p.compare.rows.map(row => `<tr><th scope="row">${row.label}</th>${row.values.map(cell).join('')}</tr>`).join('\n          ')}
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section register" id="inscription" aria-labelledby="register-title">
  <div class="container register__grid">
    <div class="register__main">
      ${sectionHead({ eyebrow: p.form.eyebrow, title: p.form.title, intro: p.form.intro, id: 'register-title' })}
      <form class="form" data-form="register" novalidate>
        ${errorSummary(t)}
        <p class="form__legend-note">${esc(f.requiredNote)}</p>

        <fieldset class="form__group">
          <legend class="form__legend"><span class="form__step">1</span>${esc(p.form.stepPlan)}</legend>
          <div class="plan-options">
            ${plans.map(pl => `<label class="plan-option">
              <input type="radio" id="plan-${pl.id}-option" name="plan" value="${pl.id}" required aria-describedby="plan-error"${pl.featured ? ' checked' : ''}>
              <span class="plan-option__body">
                <span class="plan-option__name">${esc(t.planInfo[pl.id].name)}</span>
                <span class="plan-option__price" data-plan-price="${pl.id}">${price(pl.price[c1], c1, t.lang)}</span>
                ${pl.featured ? `<span class="plan-option__badge">${esc(t.planInfo.mostChosen)}</span>` : ''}
              </span>
            </label>`).join('\n            ')}
          </div>
          <p class="field__error" id="plan-error" hidden></p>
        </fieldset>

        <fieldset class="form__group">
          <legend class="form__legend"><span class="form__step">2</span>${esc(p.form.stepYou)}</legend>
          <div class="form__grid">
            ${field(t, { id: 'firstName', label: f.firstName, autocomplete: 'given-name', width: 'half' })}
            ${field(t, { id: 'lastName', label: f.lastName, autocomplete: 'family-name', width: 'half' })}
            ${field(t, { id: 'email', label: f.email, type: 'email', autocomplete: 'email', width: 'half', dir: 'ltr', attrs: 'inputmode="email"' })}
            ${field(t, { id: 'phone', label: f.phone, type: 'tel', autocomplete: 'tel', width: 'half', dir: 'ltr', hint: f.phoneHint, attrs: 'inputmode="tel"' })}
            ${field(t, { id: 'dueDate', label: f.dueDate, type: 'date', width: 'half', hint: f.dueDateHint, attrs: `min="${minDate}" max="${maxDate}"` })}
            <fieldset class="field field--half field--radios">
              <legend class="field__label">${esc(f.dateType)} <span class="field__req" aria-hidden="true">*</span></legend>
              <div class="radios">
                <label class="radio"><input type="radio" name="dateType" value="expected" checked> <span>${esc(f.dateExpected)}</span></label>
                <label class="radio"><input type="radio" name="dateType" value="actual"> <span>${esc(f.dateActual)}</span></label>
              </div>
            </fieldset>
          </div>
        </fieldset>

        <fieldset class="form__group">
          <legend class="form__legend"><span class="form__step">3</span>${esc(p.form.stepDelivery)}</legend>
          <div class="form__grid">
            <div class="field field--full">
              <label class="field__label" for="country">${esc(f.country)} <span class="field__req" aria-hidden="true">*</span></label>
              <p class="field__hint" id="country-hint">${esc(f.countryHint)}</p>
              <select id="country" name="country" autocomplete="country" required aria-describedby="country-hint country-error">
                <option value="FR"${t.lang !== 'he' ? ' selected' : ''}>${esc(f.countries.FR)}</option>
                <option value="IL"${t.lang === 'he' ? ' selected' : ''}>${esc(f.countries.IL)}</option>
              </select>
              <p class="field__error" id="country-error" hidden></p>
            </div>
            ${field(t, { id: 'address1', label: f.address1, autocomplete: 'address-line1' })}
            ${field(t, { id: 'address2', label: f.address2, autocomplete: 'address-line2', required: false })}
            ${field(t, { id: 'postalCode', label: f.postalCode, autocomplete: 'postal-code', width: 'third', dir: 'ltr', attrs: 'inputmode="numeric"' })}
            ${field(t, { id: 'city', label: f.city, autocomplete: 'address-level2', width: 'two-thirds' })}
          </div>
          <label class="check">
            <input type="checkbox" name="gift" value="1" data-gift>
            <span>${f.gift}</span>
          </label>
        </fieldset>

        <fieldset class="form__group">
          <legend class="form__legend"><span class="form__step">4</span>${esc(p.form.stepConsent)}</legend>
          <div class="field field--full field--check">
            <label class="check">
              <input type="checkbox" id="consent" name="consent" value="1" required aria-describedby="consent-error" data-label="${esc(f.consentShort)}">
              <span>${fill(f.consent, { terms: site.path(t.lang, 'terms'), privacy: site.path(t.lang, 'privacy') })} <span class="field__req" aria-hidden="true">*</span></span>
            </label>
            <p class="field__error" id="consent-error" hidden></p>
          </div>
          <label class="check">
            <input type="checkbox" name="newsletter" value="1">
            <span>${esc(f.newsletter)}</span>
          </label>
        </fieldset>

        <fieldset class="form__group">
          <legend class="form__legend"><span class="form__step">5</span>${esc(p.form.stepPayment)}</legend>
          <div class="payment" id="payment-element" data-payment-element>
            <p class="payment__title">${icon('lock')}<span>${esc(f.paymentTitle)}</span></p>
            <p class="payment__text">${esc(f.paymentText)}</p>
            <p class="payment__demo">${icon('info')}<span>${esc(f.demoNotice)}</span></p>
          </div>
        </fieldset>

        <button type="submit" class="btn btn--primary btn--large btn--block" data-submit>
          <span data-submit-label>${esc(t.ui.cta)}</span><span class="btn__total" data-total></span>
        </button>
        ${formStatus()}
      </form>
      <div class="form-success" data-success hidden tabindex="-1"></div>
    </div>

    <aside class="register__aside" aria-labelledby="summary-title">
      <div class="summary-card" data-order-summary>
        <h3 class="h4" id="summary-title">${esc(p.summary.title)}</h3>
        <dl>
          <div><dt>${esc(p.summary.plan)}</dt><dd data-summary-plan>—</dd></div>
          <div><dt>${esc(p.summary.country)}</dt><dd data-summary-country>—</dd></div>
          <div class="summary-card__total"><dt>${esc(p.summary.total)}</dt><dd data-summary-total>—</dd></div>
        </dl>
        <ul class="summary-card__list">
          ${p.summary.points.map(pt => `<li>${icon(pt.icon)}<span>${fill(pt.text, site.links(t.lang))}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </aside>
  </div>
</section>
<script type="application/json" id="fd-pricing">${JSON.stringify(pricing)}</script>`;
}

// ---- Plateforme + connexion -------------------------------------------------------------------
export function platformPage(site, t) {
  const p = t.platformPage, f = t.form, l = p.login;
  return `<section class="page-hero page-hero--split">
  <div class="container page-hero__grid">
    <div class="page-hero__text">
      ${breadcrumbNav(site, t, 'platform')}
      <p class="eyebrow">${p.eyebrow}</p>
      <h1 class="display">${p.title}</h1>
      <p class="lead">${p.intro}</p>
      <div class="actions">
        <a class="btn btn--primary btn--magnetic" href="#connexion">${icon('lock')}${esc(l.title)}</a>
        <a class="btn btn--ghost" href="${site.path(t.lang, 'plans')}">${esc(p.seePlans)}</a>
      </div>
    </div>
    <div class="page-hero__media" data-parallax>${photo('bed', t.lang, { ui: t.ui, ratio: [4, 5], widths: [480, 720, 960], sizes: '(min-width: 900px) 38vw, 92vw', eager: true })}</div>
  </div>
</section>

<section class="section" aria-labelledby="spaces-title">
  <div class="container">
    ${sectionHead({ eyebrow: p.spaces.eyebrow, title: p.spaces.title, intro: p.spaces.intro, id: 'spaces-title', center: true })}
    <ul class="cards">
      ${p.spaces.items.map(it => `<li class="card" data-reveal>
        <span class="card__icon">${icon(it.icon)}</span>
        <h3 class="h4">${it.title}</h3>
        <p>${it.text}</p>
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="section split" aria-labelledby="classes-title">
  <div class="container split__grid">
    <div class="split__media" data-parallax>${photo('yoga', t.lang, { ui: t.ui, ratio: [5, 4], widths: [480, 720, 960], sizes: '(min-width: 900px) 42vw, 92vw' })}</div>
    <div class="split__text" data-reveal>
      <p class="eyebrow">${p.classes.eyebrow}</p>
      <h2 class="h2" id="classes-title">${p.classes.title}</h2>
      ${p.classes.paragraphs.map(x => `<p>${x}</p>`).join('\n      ')}
      <ul class="ticks">
        ${p.classes.bullets.map(b => `<li>${icon('check')}<span>${b}</span></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>

<section class="section login" id="connexion" aria-labelledby="login-title">
  <div class="container login__grid">
    <div class="login__intro" data-reveal>
      <p class="eyebrow">${l.eyebrow}</p>
      <h2 class="h2" id="login-title">${esc(l.title)}</h2>
      <p>${l.intro}</p>
      <p class="login__join">${esc(l.noAccount)} <a href="${site.path(t.lang, 'plans')}">${esc(l.noAccountCta)}</a></p>
    </div>
    <div class="login-card">
      <form class="form" data-form="login" novalidate>
        ${errorSummary(t)}
        ${field(t, { id: 'login-email', name: 'email', label: f.email, type: 'email', autocomplete: 'username', dir: 'ltr', attrs: 'inputmode="email"' })}
        <div class="field field--full">
          <label class="field__label" for="login-password">${esc(l.password)} <span class="field__req" aria-hidden="true">*</span></label>
          <div class="password">
            <input id="login-password" name="password" type="password" autocomplete="current-password" required minlength="8" aria-describedby="login-password-error" dir="ltr">
            <button type="button" class="password__toggle" aria-pressed="false" aria-controls="login-password" data-password-toggle data-label-show="${esc(l.show)}" data-label-hide="${esc(l.hide)}">${icon('eye')}<span class="sr-only">${esc(l.show)}</span></button>
          </div>
          <p class="field__error" id="login-password-error" hidden></p>
        </div>
        <div class="form__row">
          <button type="button" class="link-button" aria-expanded="false" aria-controls="reset-panel" data-reset-toggle>${esc(l.forgot)}</button>
        </div>
        <button type="submit" class="btn btn--primary btn--block" data-submit><span data-submit-label>${esc(l.submit)}</span></button>
        ${formStatus()}
      </form>
      <div class="reset" id="reset-panel" hidden data-reset-panel>
        <h3 class="h4">${esc(l.resetTitle)}</h3>
        <p>${esc(l.resetIntro)}</p>
        <form class="form" data-form="reset" novalidate>
          ${errorSummary(t)}
          ${field(t, { id: 'reset-email', name: 'email', label: f.email, type: 'email', autocomplete: 'email', dir: 'ltr', attrs: 'inputmode="email"' })}
          <button type="submit" class="btn btn--outline btn--block" data-submit><span data-submit-label>${esc(l.resetSubmit)}</span></button>
          ${formStatus()}
        </form>
      </div>
      <p class="payment__demo">${icon('info')}<span>${esc(l.demoNotice)}</span></p>
    </div>
  </div>
</section>`;
}

// ---- Contact --------------------------------------------------------------------------------------
export function contactPage(site, t) {
  const c = t.contactPage, f = t.form;
  return `<section class="page-hero">
  <div class="container">
    ${breadcrumbNav(site, t, 'contact')}
    <p class="eyebrow">${c.eyebrow}</p>
    <h1 class="display">${c.title}</h1>
    <p class="lead">${c.intro}</p>
  </div>
</section>

<section class="section section--tight contact" aria-label="${esc(c.formLabel)}">
  <div class="container contact__grid">
    <div class="contact__form">
      <form class="form" data-form="contact" novalidate>
        ${errorSummary(t)}
        <p class="form__legend-note">${esc(f.requiredNote)}</p>
        <div class="form__grid">
          ${field(t, { id: 'name', label: f.name, autocomplete: 'name' })}
          ${field(t, { id: 'contact-email', name: 'email', label: f.email, type: 'email', autocomplete: 'email', width: 'half', dir: 'ltr', attrs: 'inputmode="email"' })}
          ${field(t, { id: 'contact-phone', name: 'phone', label: f.phone, type: 'tel', autocomplete: 'tel', width: 'half', dir: 'ltr', required: false, attrs: 'inputmode="tel"' })}
          ${field(t, { id: 'message', label: f.message, tag: 'textarea', hint: f.messageHint, attrs: 'minlength="10"' })}
        </div>
        <p class="form__privacy">${fill(f.contactPrivacy, { privacy: site.path(t.lang, 'privacy') })}</p>
        <button type="submit" class="btn btn--primary btn--large btn--magnetic" data-submit><span data-submit-label>${esc(f.send)}</span>${icon('arrow', 'icon icon--arrow')}</button>
        ${formStatus()}
      </form>
      <div class="form-success" data-success hidden tabindex="-1"></div>
    </div>
    <aside class="contact__aside">
      <div class="contact-card">
        <h2 class="h4">${esc(c.aside.title)}</h2>
        <p><a class="contact-card__mail" href="mailto:${site.config.site.email}">${icon('mail')}<span dir="ltr">${site.config.site.email}</span></a></p>
        <ul class="summary-card__list">
          ${c.aside.points.map(pt => `<li>${icon(pt.icon)}<span>${pt.text}</span></li>`).join('\n          ')}
        </ul>
        <p><a class="link-arrow" href="${site.path(t.lang, 'home', '#faq')}">${esc(c.aside.faq)}${icon('arrow', 'icon icon--arrow')}</a></p>
      </div>
      ${photo('window', t.lang, { ui: t.ui, ratio: [4, 3], widths: [480, 720, 960], sizes: '(min-width: 900px) 34vw, 92vw' })}
    </aside>
  </div>
</section>`;
}

// ---- Pages légales -----------------------------------------------------------------------------------
export function legalPage(site, t, key) {
  const d = t[key];
  const L = site.config.legal;
  const values = {
    ...L, email: site.config.site.email, phone: site.config.site.phone, domain: site.domain,
    terms: site.path(t.lang, 'terms'), privacy: site.path(t.lang, 'privacy'), cookies: site.path(t.lang, 'cookies'),
    legal: site.path(t.lang, 'legal'), plans: site.path(t.lang, 'plans'), contact: site.path(t.lang, 'contact'),
    manageCookies: `<button type="button" class="btn btn--outline btn--small" data-consent-open>${esc(t.ui.consent.manage)}</button>`,
    photoCredits: photoCreditList(t)
  };
  const render = html => fill(html, values).replace(/\[À COMPLÉTER\]/g, '<mark class="todo">[À COMPLÉTER]</mark>');
  return `<article class="section legal">
  <div class="container container--narrow">
    ${breadcrumbNav(site, t, key)}
    <h1 class="h1">${d.title}</h1>
    <p class="legal__updated">${esc(fill(t.ui.updated, { date: new Intl.DateTimeFormat({ fr: 'fr-FR', en: 'en-US', he: 'he-IL' }[t.lang], { dateStyle: 'long' }).format(new Date(L.lastUpdate)) }))}</p>
    ${d.intro ? `<p class="lead">${render(d.intro)}</p>` : ''}
    ${d.toc !== false ? `<nav class="legal__toc" aria-label="${esc(t.ui.toc)}"><ol>${d.sections.map((s, i) => `<li><a href="#s${i + 1}">${s.title}</a></li>`).join('')}</ol></nav>` : ''}
    ${d.sections.map((s, i) => `<section class="legal__section" aria-labelledby="s${i + 1}">
      <h2 class="h3" id="s${i + 1}">${s.title}</h2>
      ${render(s.html)}
    </section>`).join('\n    ')}
  </div>
</article>`;
}

function photoCreditList(t) {
  return `<ul>${Object.values(PHOTOS).map(p => `<li>${esc(p.alt[t.lang].split(/[,.،]/)[0])} — <a href="https://unsplash.com/@${p.user}?utm_source=40days&amp;utm_medium=referral" rel="noopener">${esc(p.author)}</a> / <a href="https://unsplash.com/photos/${p.page}?utm_source=40days&amp;utm_medium=referral" rel="noopener">Unsplash</a></li>`).join('')}</ul>`;
}

// ---- 404 ------------------------------------------------------------------------------------------------
export function notFoundPage(site, t) {
  const n = t.notFound;
  return `<section class="section not-found">
  <div class="container not-found__grid">
    <div>
      <p class="eyebrow">404</p>
      <h1 class="display">${n.title}</h1>
      <p class="lead">${n.text}</p>
      <div class="actions">
        <a class="btn btn--primary" href="${site.path(t.lang, 'home')}">${esc(n.home)}</a>
        <a class="btn btn--ghost" href="${site.path(t.lang, 'contact')}">${esc(t.ui.nav.contact)}</a>
      </div>
    </div>
    ${photo('swaddle', t.lang, { ui: t.ui, ratio: [1, 1], widths: [400, 640], sizes: '(min-width: 900px) 30vw, 80vw' })}
  </div>
</section>`;
}
