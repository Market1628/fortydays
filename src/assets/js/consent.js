// 40 Days : bandeau de consentement aux cookies (RGPD, recommandations CNIL).
// « Tout refuser » est aussi simple que « Tout accepter ». Le choix est conservé 6 mois
// dans le stockage local (clé fd-consent), puis redemandé.
//
// Pour brancher un outil de mesure d'audience plus tard, sans rien charger avant l'accord :
//   window.fortyDaysConsent.onChange(choice => { if (choice.analytics) chargerMonOutil(); });
const KEY = 'fd-consent';
const MAX_AGE = 182 * 24 * 60 * 60 * 1000;   // 6 mois

export function initConsent() {
  const banner = document.querySelector('[data-consent]');
  if (!banner) return;
  const panel = banner.querySelector('[data-consent-panel]');
  const customize = banner.querySelector('[data-consent-action="customize"]');
  const saveButton = banner.querySelector('[data-consent-action="save"]');
  const boxes = [...banner.querySelectorAll('[data-consent-category]')];
  const listeners = [];
  let opener = null;

  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      if (value && Date.now() - value.date < MAX_AGE) return value;
    } catch { /* stockage indisponible ou valeur illisible */ }
    return null;
  };
  const apply = choice => {
    document.documentElement.dataset.consentAnalytics = choice.analytics ? 'granted' : 'denied';
    document.documentElement.dataset.consentMarketing = choice.marketing ? 'granted' : 'denied';
    listeners.forEach(fn => fn(choice));
    window.dispatchEvent(new CustomEvent('fd:consent', { detail: choice }));
  };
  const hide = () => {
    banner.hidden = true;
    document.body.classList.remove('consent-open');
    panel.hidden = true;
    customize.setAttribute('aria-expanded', 'false');
    saveButton.hidden = true;
    if (opener) { opener.focus(); opener = null; }
    window.dispatchEvent(new CustomEvent('fd:consent'));
  };
  const save = choice => {
    const value = { necessary: true, analytics: !!choice.analytics, marketing: !!choice.marketing, date: Date.now(), v: 1 };
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* le choix vaudra pour cette visite */ }
    apply(value);
    hide();
  };
  const show = ({ focus = false } = {}) => {
    const current = read() || { analytics: false, marketing: false };
    boxes.forEach(box => { if (!box.disabled) box.checked = !!current[box.dataset.consentCategory]; });
    banner.hidden = false;
    document.body.classList.add('consent-open');
    if (focus) banner.querySelector('button')?.focus();
  };

  banner.addEventListener('click', e => {
    const action = e.target.closest('[data-consent-action]')?.dataset.consentAction;
    if (action === 'accept') save({ analytics: true, marketing: true });
    if (action === 'refuse') save({ analytics: false, marketing: false });
    if (action === 'customize') {
      const open = panel.hidden;
      panel.hidden = !open;
      customize.setAttribute('aria-expanded', String(open));
      saveButton.hidden = !open;
      if (open) boxes.find(b => !b.disabled)?.focus();
    }
    if (action === 'save') {
      const choice = Object.fromEntries(boxes.map(b => [b.dataset.consentCategory, b.checked]));
      save(choice);
    }
  });
  banner.addEventListener('keydown', e => {
    // Échap ferme le panneau rouvert depuis « Gérer mes cookies » (un choix existe déjà).
    if (e.key === 'Escape' && read()) hide();
  });
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-consent-open]');
    if (!trigger) return;
    opener = trigger;
    show({ focus: true });
  });

  window.fortyDaysConsent = {
    get: read,
    onChange: fn => { listeners.push(fn); const c = read(); if (c) fn(c); },
    open: () => show({ focus: true })
  };

  const current = read();
  if (current) apply(current); else show();
}
