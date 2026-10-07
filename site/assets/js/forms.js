// 40 Days : formulaires (inscription, connexion, mot de passe oublié, contact).
// Validation côté client accessible : message sous chaque champ (aria-invalid, aria-describedby),
// récapitulatif des erreurs en tête de formulaire, confirmation annoncée aux lecteurs d'écran.
// Les envois passent par services.js (fonctions factices à remplacer).
import * as services from './services.js';

const LOCALES = { fr: 'fr-FR', en: 'en-US', he: 'he-IL' };

export function initForms(i18n) {
  const T = i18n.form || {};
  const lang = i18n.lang || document.documentElement.lang;
  const fill = (text, values) => String(text || '').replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');
  const money = (amount, currency) => new Intl.NumberFormat(LOCALES[lang], { style: 'currency', currency, maximumFractionDigits: 0 })
    .format(amount).replace(/‏/g, '');
  const date = value => new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`));

  // ---- Validation ------------------------------------------------------------------------
  const errorElement = field => document.getElementById(field.type === 'radio' ? `${field.name}-error` : `${field.id}-error`);
  const labelOf = field => {
    if (field.dataset.label) return field.dataset.label;
    if (field.type === 'radio') return field.closest('fieldset')?.querySelector('legend')?.textContent.trim() || field.name;
    const label = document.querySelector(`label[for="${field.id}"]`) || field.closest('label');
    return (label?.textContent || field.name).replace(/\*|\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
  };

  function check(field, form) {
    const E = T.errors || {};
    const value = (field.value || '').trim();
    if (field.type === 'radio') {
      const checked = form.querySelector(`input[name="${field.name}"]:checked`);
      return field.required && !checked ? (E[field.name] || E.required) : '';
    }
    if (field.type === 'checkbox') return field.required && !field.checked ? (E[field.name] || E.required) : '';
    if (field.required && !value) return E.required;
    if (!value) return '';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return E.email;
    if (field.type === 'tel') {
      const digits = value.replace(/\D/g, '');
      if (!/^\+?[\d\s().-]+$/.test(value) || digits.length < 8 || digits.length > 15) return E.phone;
    }
    if (field.type === 'date') {
      const d = new Date(`${value}T12:00:00`);
      if (Number.isNaN(d.getTime())) return E.date;
      if ((field.min && value < field.min) || (field.max && value > field.max)) {
        return fill(E.dateRange, { min: date(field.min), max: date(field.max) });
      }
    }
    if (field.name === 'postalCode') {
      const country = form.querySelector('[name="country"]')?.value;
      const compact = value.replace(/\s/g, '');
      if (country === 'FR' && !/^\d{5}$/.test(compact)) return E.postalFR;
      if (country === 'IL' && !/^\d{7}$/.test(compact)) return E.postalIL;
    }
    if (field.type === 'password' && field.minLength > 0 && value.length < field.minLength) return E.password;
    if (field.minLength > 0 && value.length < field.minLength) return fill(E.minlength, { n: field.minLength });
    return '';
  }

  function show(field, message, form) {
    const targets = field.type === 'radio' ? [...form.querySelectorAll(`input[name="${field.name}"]`)] : [field];
    targets.forEach(t => (message ? t.setAttribute('aria-invalid', 'true') : t.removeAttribute('aria-invalid')));
    const el = errorElement(field);
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  const fieldsOf = form => {
    const seen = new Set();
    return [...form.elements].filter(el => {
      if (!el.name || el.disabled || ['submit', 'button', 'hidden'].includes(el.type)) return false;
      if (el.type === 'radio') { if (seen.has(el.name)) return false; seen.add(el.name); }
      return el.required || el.value || ['email', 'tel', 'date'].includes(el.type) || el.name === 'postalCode';
    });
  };

  function validate(form) {
    const errors = [];
    fieldsOf(form).forEach(field => {
      const message = check(field, form);
      show(field, message, form);
      if (message) errors.push({ field, message });
    });
    const summary = form.querySelector('[data-error-summary]');
    if (summary) {
      if (errors.length) {
        const E = T.errors || {};
        const title = errors.length === 1 ? E.summaryOne : fill(E.summary, { n: errors.length });
        summary.innerHTML = `<p>${title}</p><ul>${errors.map(({ field, message }) =>
          `<li><a href="#${field.id}">${escapeHtml(labelOf(field))}${lang === 'fr' ? ' : ' : ': '}${escapeHtml(message)}</a></li>`).join('')}</ul>`;
        summary.hidden = false;
        summary.focus();
      } else {
        summary.hidden = true;
        summary.innerHTML = '';
      }
    }
    return errors.length === 0;
  }

  function wireLiveValidation(form) {
    form.addEventListener('focusout', e => {
      const field = e.target;
      if (!field.name || field.type === 'radio' || field.type === 'checkbox') return;
      if (field.value || field.dataset.touched) { field.dataset.touched = '1'; show(field, check(field, form), form); }
    });
    form.addEventListener('input', e => {
      const field = e.target;
      if (field.getAttribute('aria-invalid') === 'true') show(field, check(field, form), form);
    });
    form.addEventListener('change', e => {
      const field = e.target;
      if (field.type === 'radio' || field.type === 'checkbox') show(field, check(field, form), form);
      if (field.name === 'country') {
        const postal = form.querySelector('[name="postalCode"]');
        if (postal?.value) show(postal, check(postal, form), form);
      }
    });
    form.querySelector('[data-error-summary]')?.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      document.getElementById(link.getAttribute('href').slice(1))?.focus();
    });
  }

  function busy(form, on) {
    const button = form.querySelector('[data-submit]');
    const label = button?.querySelector('[data-submit-label]');
    if (!button || !label) return;
    if (on) {
      label.dataset.idle = label.textContent;
      label.textContent = T.sending;
      button.setAttribute('aria-disabled', 'true');
      button.classList.add('is-busy');
      button.disabled = true;
    } else {
      label.textContent = label.dataset.idle || label.textContent;
      button.classList.remove('is-busy');
      button.removeAttribute('aria-disabled');
      button.disabled = false;
    }
  }

  // ---- Brouillon : la saisie survit à un rechargement de page --------------------------------------
  // Conservé dans sessionStorage (effacé à la fermeture de l'onglet), jamais les cases de consentement
  // ni les mots de passe : un accord se redonne à chaque fois.
  const draftKey = form => `fd-draft-${form.dataset.form}`;
  const draftable = el => el.name && !['password', 'submit', 'button', 'hidden'].includes(el.type)
    && !['consent', 'newsletter'].includes(el.name);
  function restoreDraft(form) {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(draftKey(form)) || 'null'); } catch { /* stockage indisponible */ }
    if (!saved) return;
    let restored = false;
    [...form.elements].filter(draftable).forEach(el => {
      if (!(el.name in saved)) return;
      if (el.type === 'radio') el.checked = saved[el.name] === el.value;
      else if (el.type === 'checkbox') el.checked = !!saved[el.name];
      else if (saved[el.name]) { el.value = saved[el.name]; restored = true; }
    });
    if (restored) status(form, T.draftRestored);
  }
  function watchDraft(form) {
    let timer = 0;
    const save = () => {
      const data = {};
      [...form.elements].filter(draftable).forEach(el => {
        if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
        else if (el.type === 'checkbox') data[el.name] = el.checked;
        else data[el.name] = el.value;
      });
      try { sessionStorage.setItem(draftKey(form), JSON.stringify(data)); } catch { /* stockage indisponible */ }
    };
    form.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(save, 400); });
    form.addEventListener('change', save);
  }
  const clearDraft = form => { try { sessionStorage.removeItem(draftKey(form)); } catch { /* rien à effacer */ } };

  function status(form, message, isError = false) {
    const el = form.querySelector('[data-status]');
    if (!el) return;
    el.textContent = message;
    el.classList.toggle('is-error', isError);
  }

  const data = form => Object.fromEntries(new FormData(form).entries());

  // ---- Inscription et paiement ----------------------------------------------------------------
  function setupRegister(form) {
    const pricing = JSON.parse(document.getElementById('fd-pricing')?.textContent || '{}');
    const country = form.querySelector('[name="country"]');
    const params = new URLSearchParams(location.search);
    const selectPlan = id => {
      const radio = form.querySelector(`input[name="plan"][value="${id}"]`);
      if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
    };
    if (params.get('plan')) selectPlan(params.get('plan'));
    if (params.get('gift') === '1') form.querySelector('[data-gift]').checked = true;

    const refresh = () => {
      const currency = pricing.currencyByCountry?.[country.value] || 'EUR';
      const planId = form.querySelector('input[name="plan"]:checked')?.value;
      Object.entries(pricing.plans || {}).forEach(([id, plan]) => {
        const el = form.querySelector(`[data-plan-price="${id}"]`);
        if (el) el.textContent = money(plan.price[currency], currency);
      });
      const plan = pricing.plans?.[planId];
      const total = plan ? money(plan.price[currency], currency) : '—';
      document.querySelector('[data-summary-plan]').textContent = plan ? plan.name : '—';
      document.querySelector('[data-summary-country]').textContent = country.options[country.selectedIndex].text;
      document.querySelector('[data-summary-total]').textContent = total;
      form.querySelector('[data-total]').textContent = plan ? total : '';
      return { plan, planId, currency };
    };
    form.addEventListener('change', e => { if (['plan', 'country'].includes(e.target.name)) refresh(); });
    refresh();

    // Les boutons « Choisir ce forfait » de la même page sélectionnent le forfait sans recharger.
    document.querySelectorAll('[data-choose-plan]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        selectPlan(link.dataset.choosePlan);
        history.replaceState(null, '', `?plan=${link.dataset.choosePlan}#inscription`);
        const target = document.getElementById('inscription');
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        form.querySelector('input[name="plan"]:checked')?.focus({ preventScroll: true });
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return;
      const v = data(form);
      const { plan, planId, currency } = refresh();
      const order = {
        plan: planId,
        country: v.country,
        currency,
        amount: plan.price[currency],
        customer: { firstName: v.firstName, lastName: v.lastName, email: v.email, phone: v.phone },
        birth: { date: v.dueDate, type: v.dateType },
        address: { line1: v.address1, line2: v.address2 || '', postalCode: v.postalCode, city: v.city, country: v.country },
        gift: v.gift === '1',
        consents: { terms: true, healthData: true, newsletter: v.newsletter === '1' },
        lang
      };
      busy(form, true);
      status(form, T.sending);
      try {
        const registration = await services.submitRegistration(order);
        const payment = await services.startPayment({ registration, order });
        if (payment.status === 'redirect') return;   // Stripe prend le relais
        const R = T.register;
        const success = form.parentElement.querySelector('[data-success]');
        success.innerHTML = `<div class="form-success__icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.2 4.2L19 7"/></svg></div>
          <h3>${escapeHtml(fill(R.successTitle, { firstName: v.firstName }))}</h3>
          <p>${escapeHtml(fill(R.successText, { reference: payment.reference, plan: plan.name, total: money(order.amount, currency), email: v.email }))}</p>
          <p class="h4">${escapeHtml(R.nextTitle)}</p>
          <ol>${R.next.map(step => `<li>${escapeHtml(step)}</li>`).join('')}${order.gift ? `<li>${escapeHtml(R.giftNext)}</li>` : ''}</ol>
          ${services.DEMO_MODE ? `<p class="payment__demo">${escapeHtml(R.demo)}</p>` : ''}`;
        form.hidden = true;
        success.hidden = false;
        success.focus();
        clearDraft(form);
      } catch (error) {
        console.error(error);
        status(form, T.genericError, true);
      } finally {
        busy(form, false);
      }
    });
  }

  // ---- Connexion, mot de passe oublié ------------------------------------------------------------
  function setupLogin(form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return;
      const v = data(form);
      busy(form, true);
      status(form, T.sending);
      try {
        const result = await services.signIn({ email: v.email, password: v.password });
        if (result.redirect) { location.assign(result.redirect); return; }
        status(form, result.demo ? T.login.demo : T.login.success, false);
      } catch (error) {
        console.error(error);
        status(form, T.genericError, true);
      } finally {
        busy(form, false);
      }
    });
  }

  function setupReset(form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return;
      const v = data(form);
      busy(form, true);
      try {
        await services.requestPasswordReset({ email: v.email });
        status(form, fill(T.reset.success, { email: v.email }));
      } catch (error) {
        console.error(error);
        status(form, T.genericError, true);
      } finally {
        busy(form, false);
      }
    });
  }

  // ---- Contact --------------------------------------------------------------------------------------
  function setupContact(form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validate(form)) return;
      const v = data(form);
      busy(form, true);
      status(form, T.sending);
      try {
        await services.sendContactMessage({ name: v.name, email: v.email, phone: v.phone || '', message: v.message, lang });
        const C = T.contact;
        const success = form.parentElement.querySelector('[data-success]');
        success.innerHTML = `<div class="form-success__icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.2 4.2L19 7"/></svg></div>
          <h2>${escapeHtml(C.successTitle)}</h2>
          <p>${escapeHtml(C.successText)}</p>
          <button type="button" class="btn btn--outline" data-again>${escapeHtml(C.again)}</button>`;
        form.reset();
        status(form, '');
        form.hidden = true;
        success.hidden = false;
        success.focus();
        clearDraft(form);
        success.querySelector('[data-again]').addEventListener('click', () => {
          success.hidden = true;
          form.hidden = false;
          form.querySelector('input')?.focus();
        }, { once: true });
      } catch (error) {
        console.error(error);
        status(form, T.genericError, true);
      } finally {
        busy(form, false);
      }
    });
  }

  // ---- Petits contrôles -------------------------------------------------------------------------------
  document.querySelectorAll('[data-password-toggle]').forEach(button => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    const label = button.querySelector('.sr-only');
    button.addEventListener('click', () => {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.setAttribute('aria-pressed', String(!visible));
      label.textContent = visible ? button.dataset.labelShow : button.dataset.labelHide;
    });
  });
  document.querySelectorAll('[data-reset-toggle]').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      if (open) {
        const loginEmail = document.querySelector('[data-form="login"] [name="email"]')?.value;
        const resetEmail = panel.querySelector('[name="email"]');
        if (loginEmail && !resetEmail.value) resetEmail.value = loginEmail;
        resetEmail.focus();
      }
    });
  });

  const setups = { register: setupRegister, login: setupLogin, reset: setupReset, contact: setupContact };
  document.querySelectorAll('[data-form]').forEach(form => {
    wireLiveValidation(form);
    if (['register', 'contact'].includes(form.dataset.form)) { restoreDraft(form); watchDraft(form); }
    setups[form.dataset.form]?.(form);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
