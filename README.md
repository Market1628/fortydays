# 40 Days : site vitrine et d'inscription

Site statique multilingue (français, anglais, hébreu) pour **40 Days**, l'accompagnement des 40 jours
après l'accouchement. L'accueil raconte en 3D, au fil du scroll, le chemin d'une goutte de verre nacré
jusqu'à une maman qui tient son nouveau-né dans ses bras (Three.js, moteur de verre du skill
*Premium 3D Glass*, adapté à un fond clair et à un récit en cinq étapes).

- 24 pages : accueil, forfaits + inscription, plateforme + connexion, contact, 4 pages légales, × 3 langues
- Aucune dépendance à installer : **Node.js 18 ou plus récent** suffit pour générer et prévisualiser
- Le dossier à mettre en ligne est **`site/`**

---

## 1. Lancer en local

```bash
node src/build.mjs        # génère le site dans site/
node src/serve.mjs        # http://127.0.0.1:8080/fr/
```

`index.html` a besoin d'un serveur (modules JavaScript, URL propres) : ouvrir les fichiers en double-cliquant
ne fonctionne pas. Sans Node, `py -m http.server 8080 -d site` dépanne (sans la page 404 personnalisée).

Mode atelier (le CSS et le JS de `src/assets/` sont servis en direct, sans relancer le build) :

```bash
node src/serve.mjs 8080 --dev
```

## 2. Mettre en ligne

Le site est 100 % statique : copiez **le contenu du dossier `site/`** à la racine de l'hébergement
(OVH, o2switch, Infomaniak, Netlify, Cloudflare Pages, Vercel…).

- **Apache** (la plupart des hébergeurs mutualisés) : le fichier `site/.htaccess` force le HTTPS, redirige la
  racine `/` vers `/fr/`, `/en/` ou `/he/` selon la langue du navigateur, sert la page 404, active la
  compression et le cache.
- **Netlify** : le fichier `site/_redirects` fait la même redirection de langue.
- **Ailleurs** : `site/index.html` redirige en JavaScript (langue mémorisée, sinon langue du navigateur,
  sinon français) et propose des liens de secours.
- Le nom de domaine se règle dans `src/config.json` → `site.domain` (balises canonical, hreflang,
  Open Graph, sitemap). Si le site est servi dans un sous-dossier, renseignez `site.basePath`.
- Vérifiez que la compression gzip ou brotli est active : Three.js pèse 1,2 Mo non compressé (≈ 300 Ko
  compressé). Il n'est chargé que sur l'accueil, après le texte.

### Démo sur GitHub Pages

Le dépôt GitHub contient tout le projet (sources et dossier `site/`). Une version de démonstration,
non indexée par les moteurs de recherche, est publiée sur la branche `gh-pages`, à l'adresse
`https://<compte>.github.io/<dépôt>/`. Pour la mettre à jour après une modification :

```bash
node src/deploy-github-pages.mjs
```

GitHub Pages n'est pas prévu pour un site commercial qui encaisse des paiements : gardez-le pour les démos
et hébergez le vrai site ailleurs (Netlify, hébergeur Apache…).

Après la mise en ligne : déclarez `https://fortydays.com/sitemap.xml` dans Google Search Console, vérifiez
les balises hreflang dans le rapport « Ciblage international », et testez les données structurées avec
l'outil « Résultats enrichis » de Google.

## 3. Où modifier quoi

| Quoi | Où | Après modification |
|---|---|---|
| **Tarifs** (€ et ₪), forfait mis en avant | `src/config.json` → `pricing.plans` | `node src/build.mjs` |
| Devise selon le pays de livraison | `src/config.json` → `pricing.currencyByCountry` | build |
| E-mail, téléphone, domaine | `src/config.json` → `site` | build |
| Informations légales (raison sociale, SIRET, hébergeur…) | `src/config.json` → `legal` | build |
| **Textes** français / anglais / hébreu | `src/content/fr.mjs`, `en.mjs`, `he.mjs` | build |
| Pages légales (mentions, CGV, confidentialité, cookies) | même fichiers, sections `legal`, `terms`, `privacy`, `cookies` | build |
| Noms et contenu des forfaits | même fichiers, section `planInfo` | build |
| Titles et meta descriptions (SEO) | même fichiers, section `meta` | build |
| Photos Unsplash, crédits, textes alternatifs | `src/content/photos.mjs` | build |
| Couleurs, typographies, mise en page | `src/assets/css/main.css` (variables en tête de fichier) | build |
| Scène 3D | `src/assets/js/home-scene.js` | build |
| Gabarits HTML | `src/lib/pages.mjs`, `src/lib/layout.mjs` | build |

Les tarifs n'existent qu'à un seul endroit : `src/config.json`. Ils alimentent les cartes, le comparatif,
le formulaire d'inscription, le récapitulatif de commande et les données structurées `Product/Offer`.

Dans les textes, les mots entre accolades (`{price}`, `{terms}`, `{contact}`…) sont remplacés
automatiquement. Le build ajoute les espaces insécables de la typographie française et protège le sens
de lecture de « 40 Days » dans les phrases en hébreu.

**Ne modifiez pas `site/` à la main** : le dossier est effacé et régénéré à chaque build.

## 4. Fonctions factices à brancher

Tout est regroupé dans **`src/assets/js/services.js`**. Chaque fonction simule un serveur (petite latence)
et documente un exemple de branchement réel. Gardez les signatures : les formulaires (`forms.js`)
n'ont rien à changer.

| Fonction | Appelée par | À brancher sur |
|---|---|---|
| `submitRegistration(order)` | formulaire d'inscription (Forfaits) | votre API : création de la cliente et de la commande |
| `startPayment({ registration, order })` | juste après l'inscription | **Stripe** : Checkout (redirection) ou Payment Element monté dans `#payment-element` |
| `signIn({ email, password })` | connexion (Plateforme) | votre espace membre |
| `requestPasswordReset({ email })` | « Mot de passe oublié ? » | envoi du lien de réinitialisation |
| `sendContactMessage(message)` | formulaire de contact | votre API, ou un service comme Formspree / Netlify Forms |

Une fois branché, passez `DEMO_MODE` à `false` et retirez les mentions « Site de démonstration » des textes
(`form.demoNotice`, `platformPage.login.demoNotice`, `formJs.register.demo`, `formJs.login.demo`).

Points d'attention : le **montant se calcule côté serveur** à partir du forfait et du pays, jamais à partir
du prix envoyé par le navigateur ; la **date d'accouchement est une donnée de santé** (RGPD, art. 9),
recueillie avec un consentement explicite (case du formulaire) : conservez la preuve de ce consentement.

## 5. Cookies et mesure d'audience

Le bandeau (`src/assets/js/consent.js`) propose « Tout refuser », « Personnaliser » et « Tout accepter »
avec le même poids visuel, conserve le choix 6 mois, et se rouvre depuis « Gérer mes cookies » (pied de page
et politique cookies). Aucun traceur non nécessaire n'est installé. Pour ajouter un outil plus tard,
chargez-le seulement après accord :

```js
window.fortyDaysConsent.onChange(choice => { if (choice.analytics) { /* charger l'outil */ } });
```

Les polices viennent de Google Fonts et les photos du CDN d'Unsplash (pas de cookies, mais l'adresse IP
des visiteuses leur est transmise, c'est indiqué dans la politique cookies). Pour une conformité RGPD
maximale, vous pouvez héberger les polices vous-même (fichiers WOFF2 dans `src/assets/fonts/` et
`@font-face` dans `main.css`, puis retirer les liens `fonts.googleapis.com` de `src/lib/layout.mjs`).

## 6. La scène 3D

`src/assets/js/home-scene.js`. Le scroll de l'accueil est découpé en cinq chapitres, et chaque chapitre
pilote une étape du récit (fonction `timeline`) :

| Chapitre | Récit 3D |
|---|---|
| 01 Accueil | une goutte de verre nacré, une perle de lumière s'y allume |
| 02 Le programme | la perle se divise en 2, 4 puis 8 cellules, la goutte s'arrondit |
| 03 Ce qui est inclus | les cellules forment un embryon lové qui grandit, la goutte devient un ventre rond |
| 04 Témoignages | naissance : le bébé devient lumière, la goutte prend la forme d'un médaillon de verre |
| 05 Réserver | dans le médaillon apparaît une maman qui embrasse son nouveau-né (photographie) ; le texte « Maintenant, c'est votre tour… » apparaît |

- La 3D se charge **après** le contenu (événement `load` puis temps libre du navigateur), seulement si WebGL 2
  est disponible, si « Réduire les animations » n'est pas activé et si le mode économie de données est coupé.
  Sinon, cinq images fixes (`src/assets/img/story-1…5.webp`) suivent les chapitres.
- L'objet se place à droite du texte sur ordinateur (à gauche en hébreu) et en haut de l'écran sur mobile.
- Réglages utiles en tête de fichier : `DAMPING` (inertie), `PALETTE`, `MEDALLION` (forme et taille du médaillon
  final), et la fonction `timeline`.
- La photographie finale se change dans `src/content/photos.mjs` (entrée `finale` : identifiant Unsplash, crédit,
  textes alternatifs). Elle est lue par WebGL depuis le CDN d'Unsplash, qui autorise le CORS ; une photo hébergée
  ailleurs doit aussi l'autoriser. Pensez à régénérer ensuite les images fixes (atelier ci-dessous).

**Régénérer les images** (images fixes du récit, images de partage `og-fr/en/he.jpg`, icônes et logo) depuis la
vraie scène : lancez `node src/serve.mjs 8080 --dev`, ouvrez `http://127.0.0.1:8080/tools/capture.html`,
cliquez sur « Tout générer », puis relancez le build.

Outils de contrôle qualité : ajoutez `?static` à l'adresse de l'accueil pour voir la version sans 3D ;
dans la console, `__fortyScene.snap(0.9)` place le récit à 90 %.

## 7. SEO, performance, accessibilité : ce qui est en place

- Un seul `h1` par page, hiérarchie de titres propre, title et meta description uniques par page et par langue
- `hreflang` fr, en, he et x-default (→ français), `canonical`, Open Graph, Twitter Card, image de partage par langue
- JSON-LD : `Organization`, `WebSite`, `WebPage`, `BreadcrumbList` (pages intérieures), `Product`/`Offer`
  pour les 3 forfaits en € et en ₪ (page Forfaits), `FAQPage` (accueil, 8 questions)
- `sitemap.xml` multilingue (avec les alternatives hreflang) et `robots.txt`
- Photos en AVIF / WebP aux bonnes tailles (`srcset`), dimensions explicites, chargement différé, crédit de
  chaque photographe ; texte alternatif rédigé dans chaque langue
- Contrastes AA vérifiés (les couleurs « -ink » sont les variantes de texte de la palette ; le bouton terracotta
  porte un texte brun foncé à 5,3:1), navigation au clavier, lien d'évitement, focus visible, labels et messages
  d'erreur reliés aux champs, récapitulatif des erreurs, confirmations annoncées aux lecteurs d'écran,
  hébreu en `dir="rtl"` avec mise en page miroir, `prefers-reduced-motion` respecté

## 8. À compléter avant la mise en ligne

1. **Informations légales** marquées `[À COMPLÉTER]` (surlignées dans les pages légales) : forme juridique,
   capital, adresse, SIRET, RCS, TVA, numéro d'entreprise israélien, direction de la publication, hébergeur,
   médiateur de la consommation, téléphone. Toutes se remplissent dans `src/config.json` → `legal`.
2. **Mentions à préciser dans les CGV et la politique de confidentialité** : frais de livraison, paiement en
   plusieurs fois, zones de livraison, prestataires (e-mails, livraison, plateforme de cours).
3. **CGV et politique de confidentialité** : ce sont des documents de travail. Faites-les valider par un
   professionnel du droit (consommation française et israélienne, RGPD, loi israélienne sur la vie privée).
4. **Témoignages** : ceux de l'accueil sont marqués « Exemple ». Remplacez-les par de vrais retours, recueillis
   avec l'accord des participantes, puis retirez le badge et la note (`home.testimonials`).
5. **Engagements de service à confirmer** (rédigés de façon plausible, à valider) : démarrage au retour à la
   maison, réservation possible dès la grossesse, adaptation des menus aux allergies, carte cadeau, langues
   des cours, délai de réponse.
6. **Tarifs** : provisoires, à ajuster dans `src/config.json`.

## 9. Arborescence

```text
src/
  build.mjs            génère site/ (pages, sitemap, robots, redirections)
  serve.mjs            serveur local (option --dev : atelier)
  config.json          tarifs, coordonnées, informations légales
  content/             textes fr / en / he, photos
  lib/                 gabarits HTML, SEO (JSON-LD, sitemap)
  assets/              CSS, JS, images, Three.js (copiés tels quels dans site/assets)
    js/main.js         menu, apparitions, parallaxe, compteur des 40 jours, chargement de la 3D
    js/home-scene.js   scène 3D
    js/forms.js        validation et envoi des formulaires
    js/services.js     fonctions factices à brancher
    js/consent.js      bandeau cookies
  tools/capture.html   atelier d'images (mode --dev)
site/                  le site généré, à mettre en ligne
```

## Crédits et licences

- Three.js r160 : licence MIT (`site/assets/vendor/three-LICENSE.txt`)
- Cormorant Garamond, DM Sans, Frank Ruhl Libre, Assistant : SIL Open Font License (Google Fonts)
- Photographies : Unsplash (licence Unsplash), autrices et auteurs crédités sous chaque photo et dans les
  mentions légales
