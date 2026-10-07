// =============================================================================================
// 40 Days : SERVICES FACTICES
// =============================================================================================
// Ce fichier est le seul endroit à modifier pour relier le site à un vrai back-end.
// Chaque fonction simule un appel serveur (petite latence) et renvoie une promesse.
// Remplacez le corps des fonctions en gardant leur nom, leurs paramètres et la forme de leur
// réponse : les formulaires (forms.js) n'auront rien à changer.
//
// Règles à respecter lors du branchement :
//  - le montant à payer se calcule TOUJOURS côté serveur à partir de l'identifiant du forfait
//    et du pays (ne faites jamais confiance au prix envoyé par le navigateur) ;
//  - les mots de passe ne doivent transiter que vers votre serveur, en HTTPS, jamais être journalisés ;
//  - la date d'accouchement est une donnée sensible (santé) : stockez-la avec le consentement reçu.
// =============================================================================================

/** true tant que les fonctions ci-dessous sont factices (affiche les mentions « démonstration »). */
export const DEMO_MODE = true;

const wait = (ms = 900) => new Promise(resolve => setTimeout(resolve, ms));
const reference = () => `FD-${Date.now().toString(36).toUpperCase().slice(-6)}`;

/**
 * Enregistre une inscription (cliente, forfait, livraison, consentements).
 *
 * @param {object} order
 * @param {'essentiel'|'cocon'|'renaissance'} order.plan  Identifiant du forfait (src/config.json)
 * @param {'FR'|'IL'} order.country                        Pays de livraison
 * @param {'EUR'|'ILS'} order.currency                     Devise affichée
 * @param {number} order.amount                            Montant affiché (indicatif, à recalculer côté serveur)
 * @param {object} order.customer                          { firstName, lastName, email, phone }
 * @param {object} order.birth                             { date: 'AAAA-MM-JJ', type: 'expected'|'actual' }
 * @param {object} order.address                           { line1, line2, postalCode, city, country }
 * @param {boolean} order.gift                             Réservation offerte à une proche
 * @param {object} order.consents                          { terms: true, healthData: true, newsletter: boolean }
 * @param {'fr'|'en'|'he'} order.lang                      Langue de la cliente
 * @returns {Promise<{ id: string, reference: string }>}
 *
 * Exemple de branchement :
 *   const res = await fetch('/api/registrations', {
 *     method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order)
 *   });
 *   if (!res.ok) throw new Error('registration_failed');
 *   return res.json();   // { id, reference }
 */
export async function submitRegistration(order) {
  await wait();
  console.info('[40 Days · démo] Inscription simulée :', order.plan, order.country);
  return { id: `demo_${Date.now()}`, reference: reference() };
}

/**
 * Lance le paiement Stripe pour une inscription enregistrée.
 * L'emplacement prévu dans la page est l'élément #payment-element (formulaire d'inscription).
 *
 * @param {object} params
 * @param {{ id: string, reference: string }} params.registration  Réponse de submitRegistration
 * @param {object} params.order                                     La commande (voir ci-dessus)
 * @returns {Promise<{ status: 'paid'|'redirect'|'demo', reference: string }>}
 *
 * Exemple avec Stripe Checkout (redirection vers la page de paiement hébergée par Stripe) :
 *   const res = await fetch('/api/checkout-session', {
 *     method: 'POST', headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ registrationId: params.registration.id })
 *   });
 *   const { url } = await res.json();     // créée côté serveur avec stripe.checkout.sessions.create()
 *   window.location.assign(url);          // Stripe renvoie ensuite vers votre page de confirmation
 *   return { status: 'redirect', reference: params.registration.reference };
 *
 * Variante intégrée (Stripe Payment Element dans #payment-element) : chargez https://js.stripe.com/v3,
 * créez un PaymentIntent côté serveur, montez `elements.create('payment')` dans #payment-element,
 * puis appelez stripe.confirmPayment() ici.
 */
export async function startPayment({ registration }) {
  await wait(700);
  return { status: 'demo', reference: registration.reference };
}

/**
 * Connexion à l'espace membre (page Plateforme).
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ ok: boolean, demo?: boolean, redirect?: string, error?: 'invalid_credentials' }>}
 *
 * Exemple : POST /api/login (cookie de session HttpOnly), puis redirection vers l'espace membre :
 *   const res = await fetch('/api/login', { method: 'POST', credentials: 'include',
 *     headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
 *   if (res.status === 401) return { ok: false, error: 'invalid_credentials' };
 *   return { ok: true, redirect: '/espace/' };
 */
export async function signIn(credentials) {
  await wait();
  void credentials;   // jamais journalisé
  return { ok: true, demo: true };
}

/**
 * Demande de réinitialisation du mot de passe.
 * Répondez toujours de la même façon, que le compte existe ou non (pas de fuite d'information).
 * @param {{ email: string }} params
 * @returns {Promise<{ ok: true }>}
 */
export async function requestPasswordReset(params) {
  await wait();
  void params;
  return { ok: true };
}

/**
 * Envoi du formulaire de contact.
 * @param {{ name: string, email: string, phone?: string, message: string, lang: string }} message
 * @returns {Promise<{ ok: true }>}
 *
 * Exemple sans serveur : un service de formulaires (Formspree, Netlify Forms, Basin…) :
 *   await fetch('https://formspree.io/f/VOTRE_ID', { method: 'POST',
 *     headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(message) });
 */
export async function sendContactMessage(message) {
  await wait();
  void message;
  return { ok: true };
}
