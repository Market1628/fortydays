// Textes du site en français (langue par défaut).
// Les mots entre accolades, comme {price} ou {terms}, sont remplacés automatiquement : ne les traduisez pas.
export default {
  lang: 'fr',
  dir: 'ltr',
  slugs: {
    home: '', plans: 'forfaits/', platform: 'plateforme/', contact: 'contact/',
    legal: 'mentions-legales/', terms: 'cgv/', privacy: 'confidentialite/', cookies: 'cookies/'
  },
  pageNames: {
    home: 'Accueil', plans: 'Forfaits', platform: 'Plateforme', contact: 'Contact',
    legal: 'Mentions légales', terms: 'Conditions générales de vente', privacy: 'Politique de confidentialité', cookies: 'Politique cookies'
  },

  meta: {
    home: {
      title: 'Post-partum : vos 40 jours après l’accouchement | 40 Days',
      description: 'Remise en forme post-partum douce, accompagnement doula, repas livrés et communauté de mamans : 40 Days prend soin de vous 40 jours après l’accouchement.'
    },
    plans: {
      title: 'Forfaits post-partum Essentiel, Cocon, Renaissance | 40 Days',
      description: 'Comparez nos 3 forfaits post-partum : remise en forme, cours de doulas, repas livrés, compléments et coffret. Réservez vos 40 jours en ligne.'
    },
    platform: {
      title: 'Plateforme post-partum : forums, doulas et vidéos | 40 Days',
      description: 'Votre espace en ligne après l’accouchement : forums entre jeunes mamans, cours de doulas en direct, vidéos et conseils pour vous et bébé.'
    },
    contact: {
      title: 'Contact : une question sur le post-partum ? | 40 Days',
      description: 'Une question sur les forfaits, les repas post-partum ou l’accompagnement doula ? Écrivez-nous : nous répondons en français, anglais et hébreu.'
    },
    legal: { title: 'Mentions légales | 40 Days', description: 'Mentions légales du site fortydays.com : éditeur, hébergement, propriété intellectuelle et crédits photographiques.' },
    terms: { title: 'Conditions générales de vente | 40 Days', description: 'Conditions générales de vente des forfaits 40 Days : commande, prix, paiement, livraisons et droit de rétractation en France et en Israël.' },
    privacy: { title: 'Politique de confidentialité | 40 Days', description: 'Comment 40 Days protège vos données personnelles, conformément au RGPD et à la loi israélienne sur la protection de la vie privée.' },
    cookies: { title: 'Politique cookies | 40 Days', description: 'Les traceurs utilisés sur fortydays.com, leur rôle et la façon de gérer vos choix à tout moment.' },
    notFound: { title: 'Page introuvable | 40 Days', description: 'Cette page n’existe pas ou a changé d’adresse.' }
  },

  ui: {
    skip: 'Aller au contenu',
    logoLabel: '40 Days, accueil',
    navLabel: 'Navigation principale',
    nav: { programme: 'Le programme', plans: 'Forfaits', platform: 'Plateforme', contact: 'Contact' },
    langLabel: 'Langue',
    menu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    cta: 'Je réserve mes 40 jours',
    ctaShort: 'Réserver',
    home: 'Accueil',
    breadcrumb: 'Fil d’Ariane',
    toc: 'Sommaire',
    updated: 'Dernière mise à jour : {date}',
    photo: 'Photo :',
    example: 'Exemple',
    supplementsNotice: 'Compléments alimentaires : demandez l’avis de votre médecin ou sage-femme, notamment si vous allaitez.',
    ogAlt: 'Dans une goutte de verre nacré, une jeune maman tient son nouveau-né : 40 Days, accompagnement post-partum.',
    footer: {
      tagline: 'Un accompagnement des 40 jours après l’accouchement, en France et en Israël.',
      navLabel: 'Liens utiles',
      programme: '40 Days',
      faq: 'Questions fréquentes',
      info: 'Informations',
      languages: 'Langues',
      disclaimer: '40 Days propose un accompagnement bien-être. Il ne remplace pas le suivi médical de votre sage-femme ou de votre médecin.',
      credits: 'Photos : <a href="https://unsplash.com/?utm_source=40days&amp;utm_medium=referral" rel="noopener">Unsplash</a>, crédits dans les <a href="{legal}#s4">mentions légales</a>'
    },
    consent: {
      title: 'Vos choix en matière de cookies',
      text: 'Nous utilisons uniquement les traceurs nécessaires au fonctionnement du site. Avec votre accord, nous pourrions aussi mesurer l’audience pour améliorer nos contenus. Vous pouvez changer d’avis à tout moment.',
      policy: 'Politique cookies',
      accept: 'Tout accepter',
      refuse: 'Tout refuser',
      customize: 'Personnaliser',
      save: 'Enregistrer mes choix',
      manage: 'Gérer mes cookies',
      saved: 'Vos choix ont été enregistrés.',
      categories: {
        necessary: { title: 'Nécessaires', text: 'Mémorisent vos choix de cookies et de langue. Toujours actifs.' },
        analytics: { title: 'Mesure d’audience', text: 'Statistiques de visite, pour améliorer le site.' },
        marketing: { title: 'Marketing', text: 'Mesure de l’efficacité de nos campagnes.' }
      }
    }
  },

  planInfo: {
    category: 'Accompagnement post-partum',
    mostChosen: 'Le plus choisi',
    period: 'pour 40 jours',
    altPrice: 'ou {price} en Israël',
    choose: 'Choisir ce forfait',
    essentiel: {
      name: 'Essentiel',
      tagline: 'Pour bouger en douceur et ne pas rester seule.',
      features: ['Programme de remise en forme post-partum', 'Accès à la plateforme et aux forums', 'Vidéos et tips pour vous et bébé']
    },
    cocon: {
      name: 'Cocon',
      tagline: 'Pour être entourée et bien nourrie pendant les premières semaines.',
      features: ['Tout le forfait Essentiel', 'Cours en direct avec des doulas et intervenantes', '6 semaines de livraisons de repas']
    },
    renaissance: {
      name: 'Renaissance',
      tagline: 'Le cocon complet, avec compléments et coffret de l’après.',
      features: ['Tout le forfait Cocon', 'Cure de compléments de 40 jours', 'Coffret boutique : gaine, culottes menstruelles, soutien-gorge d’allaitement, kit bébé']
    }
  },

  form: {
    requiredNote: 'Les champs marqués d’un astérisque (*) sont obligatoires.',
    optional: 'facultatif',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Adresse e-mail',
    phone: 'Téléphone',
    phoneHint: 'Avec l’indicatif si vous habitez hors de France, par exemple +972.',
    dueDate: 'Date d’accouchement',
    dueDateHint: 'Prévue ou réelle : elle nous sert à caler vos livraisons.',
    dateType: 'Cette date est',
    dateExpected: 'prévue',
    dateActual: 'réelle, bébé est né',
    country: 'Pays de livraison',
    countryHint: 'Le tarif s’affiche en euros pour la France et en shekels pour Israël.',
    countries: { FR: 'France', IL: 'Israël' },
    address1: 'Adresse',
    address2: 'Complément d’adresse',
    postalCode: 'Code postal',
    city: 'Ville',
    gift: 'Je réserve pour <strong>l’offrir</strong> à une jeune maman : l’adresse indiquée est la sienne.',
    consent: 'J’accepte les <a href="{terms}">conditions générales de vente</a> et j’ai lu la <a href="{privacy}">politique de confidentialité</a>. J’accepte que ma date d’accouchement soit utilisée pour organiser mon accompagnement.',
    consentShort: 'Conditions de vente et confidentialité',
    newsletter: 'J’accepte de recevoir les conseils et nouvelles de 40 Days par e-mail (désinscription en un clic).',
    paymentTitle: 'Paiement sécurisé',
    paymentText: 'Le module de paiement Stripe s’affichera ici : carte bancaire, Apple Pay ou Google Pay.',
    demoNotice: 'Site de démonstration : aucun paiement n’est encaissé pour le moment.',
    name: 'Nom et prénom',
    message: 'Votre demande',
    messageHint: 'Quelques lignes suffisent.',
    contactPrivacy: 'Vos données servent uniquement à vous répondre. <a href="{privacy}">En savoir plus</a>',
    send: 'Envoyer mon message'
  },

  // Messages utilisés par les formulaires (validation et confirmations).
  formJs: {
    errors: {
      required: 'Ce champ est obligatoire.',
      email: 'Saisissez une adresse e-mail valide, par exemple prenom@exemple.fr.',
      phone: 'Saisissez un numéro de téléphone valide, avec au moins 8 chiffres.',
      date: 'Saisissez une date valide.',
      dateRange: 'Choisissez une date entre le {min} et le {max}.',
      postalFR: 'Le code postal français compte 5 chiffres.',
      postalIL: 'Le code postal israélien compte 7 chiffres.',
      consent: 'Merci d’accepter les conditions pour finaliser la réservation.',
      plan: 'Choisissez un forfait.',
      password: 'Le mot de passe compte au moins 8 caractères.',
      minlength: 'Écrivez au moins {n} caractères.',
      summary: 'Merci de vérifier {n} champs :',
      summaryOne: 'Merci de vérifier ce champ :'
    },
    sending: 'Envoi en cours…',
    genericError: 'Une erreur est survenue. Réessayez dans un instant ou écrivez-nous à contact@fortydays.com.',
    totalLabel: '·',
    register: {
      successTitle: 'Merci {firstName}, vos 40 jours sont réservés.',
      successText: 'Votre réservation {reference} pour le forfait {plan} ({total}) est enregistrée. Un e-mail de confirmation part vers {email}.',
      demo: 'Site de démonstration : aucun paiement n’a été encaissé.',
      nextTitle: 'La suite',
      next: ['Nous vous écrivons dans les prochains jours pour faire connaissance.', 'Vous recevez vos accès à la plateforme et aux forums.', 'L’accompagnement démarre à votre retour à la maison.'],
      giftNext: 'Vous recevez aussi une carte cadeau à remettre à la jeune maman.'
    },
    login: { success: 'Connexion réussie.', demo: 'Site de démonstration : la connexion n’est pas encore reliée à la plateforme.' },
    reset: { success: 'Si un compte existe pour {email}, vous allez recevoir un lien pour choisir un nouveau mot de passe.' },
    contact: { successTitle: 'Merci, votre message est bien parti.', successText: 'Nous vous répondons au plus vite, en français, en anglais ou en hébreu.', again: 'Envoyer un autre message' },
    show: 'Afficher le mot de passe',
    hide: 'Masquer le mot de passe'
  },

  home: {
    story: { captions: ['Une goutte de vie', 'Les premières cellules', 'Bébé grandit en vous', 'La naissance', 'Dans vos bras'] },
    hero: {
      eyebrow: 'Accompagnement post-partum · France &amp; Israël',
      title: 'Les 40 jours après l’accouchement, <em>enfin pour vous</em>',
      lead: 'Vous venez de donner la vie. Ces 40 jours sont pour vous : manger, dormir, bouger doucement, et être entourée.',
      text: '40 Days réunit un programme de remise en forme post-partum tout en douceur, une communauté de jeunes mamans, des cours avec des doulas et des repas livrés chez vous.',
      secondary: 'Découvrir le programme',
      gift: 'Une proche attend un bébé ?',
      giftLink: 'Offrir 40 Days',
      scroll: 'Faites défiler, l’histoire commence'
    },
    programme: {
      eyebrow: 'Le programme',
      title: 'Un cocon de 40 jours, tissé autour de vous',
      paragraphs: [
        'Dans de nombreuses cultures, les 40 jours qui suivent la naissance sont un temps protégé : la jeune mère se repose, on la nourrit, on l’entoure. 40 Days remet ce temps à l’honneur, en France comme en Israël.',
        'Pendant le post-partum, nous prenons le relais sur ce qui pèse : les repas, les questions de 3 heures du matin, la reprise du mouvement. Vous gardez l’essentiel : le temps avec votre bébé, et du temps pour vous.',
        'Aucun objectif chiffré, aucun « corps d’avant » à retrouver : de la récupération, de l’énergie et de la douceur, à votre rythme.'
      ],
      points: [
        { value: '40', label: 'jours d’accompagnement, dès le retour à la maison' },
        { value: '3', label: 'forfaits, selon vos besoins' },
        { value: '2', label: 'pays : la France et Israël' }
      ]
    },
    included: {
      eyebrow: 'Ce qui est inclus',
      title: 'Tout ce qui fait du bien, au même endroit',
      intro: 'Selon le forfait choisi, vos 40 jours rassemblent :',
      items: [
        { icon: 'move', title: 'Remise en forme post-partum', text: 'Des séances vidéo de 5 à 20 minutes : respiration, posture, mobilité douce, puis renforcement progressif une fois le feu vert de votre sage-femme ou de votre médecin.' },
        { icon: 'chat', title: 'Plateforme et forums', text: 'Un espace en ligne pour échanger avec d’autres jeunes mamans, à toute heure, et retrouver tips et vidéos pour vous et pour bébé.' },
        { icon: 'play', title: 'Accompagnement doula', text: 'Allaitement, sommeil, portage, émotions : des cours en direct et en replay avec des doulas et d’autres professionnelles de la périnatalité.' },
        { icon: 'bowl', title: 'Repas post-partum livrés', text: 'Chaque semaine, des plats nourrissants et réconfortants, prêts en quelques minutes. Vous mangez chaud, même d’une seule main.' },
        { icon: 'capsule', title: 'Compléments alimentaires', text: 'Une cure de 40 jours de vitamines pensées pour le post-partum et une formule tonus, en soutien nutritionnel.', note: 'Demandez l’avis de votre médecin ou sage-femme, notamment si vous allaitez.' },
        { icon: 'bag', title: 'La boutique de l’après', text: 'Gaines de maintien post-partum, culottes menstruelles, soutiens-gorge d’allaitement et essentiels pour bébé, choisis pour leur confort.' }
      ]
    },
    testimonials: {
      eyebrow: 'Témoignages',
      title: 'Ce qu’elles ont vécu pendant leurs 40 jours',
      intro: 'Des moments simples qui changent tout, quand on vient d’accoucher.',
      items: [
        { quote: 'La première semaine, je n’avais même pas l’énergie de penser au dîner. Les repas arrivaient, chauds et bons : j’ai pu rester au lit avec ma fille.', name: 'Camille', detail: 'maman de Jade · Lyon' },
        { quote: 'À 3 heures du matin, en pleine tétée, le forum m’a fait me sentir moins seule. Et la doula a répondu à toutes mes questions sur l’allaitement.', name: 'Noa', detail: 'maman d’Eden · Tel-Aviv' },
        { quote: 'J’ai repris le mouvement avec des séances de dix minutes, sans pression. Petit à petit, je me suis sentie de nouveau bien dans mon corps.', name: 'Inès', detail: 'maman de Léon · Paris' }
      ],
      note: 'Témoignages d’exemple, en attendant les retours de nos premières participantes.'
    },
    cta: {
      eyebrow: 'À vous',
      title: 'Maintenant, c’est votre tour : 40 jours pour vous retrouver.',
      text: 'Réservez en quelques minutes, pendant la grossesse ou après la naissance. Votre accompagnement commence à votre retour à la maison.',
      gift: 'Offrir le programme'
    },
    days: {
      eyebrow: 'Jour après jour',
      title: 'Vos 40 jours, pas à pas',
      intro: 'Un accompagnement qui suit votre récupération, sans calendrier imposé : chaque étape arrive quand vous êtes prête.',
      counterLabel: 'Jour',
      phases: [
        { range: 'Jours 1 à 10', title: 'Se poser', text: 'Repos, peau à peau, repas livrés : on s’occupe du quotidien pour que vous puissiez rester au chaud avec votre bébé.', photo: 'skin' },
        { range: 'Jours 11 à 20', title: 'Récupérer en douceur', text: 'Respiration, posture et petits mouvements guidés, quelques minutes par jour, quand vous en avez envie.', photo: 'stretch' },
        { range: 'Jours 21 à 30', title: 'Retrouver de l’énergie', text: 'Des repas qui nourrissent, des nuits qui s’organisent, des échanges avec d’autres mamans qui vivent la même chose.', photo: 'soup' },
        { range: 'Jours 31 à 40', title: 'Vous retrouver', text: 'Sortir un peu, bouger un peu plus, préparer la suite à votre rythme, toujours entourée.', photo: 'together' }
      ]
    },
    meals: {
      eyebrow: 'Repas post-partum',
      title: 'Bien manger, sans cuisiner',
      paragraphs: [
        'Après l’accouchement, on a besoin de plats chauds, nourrissants et simples à manger. Nos repas post-partum sont pensés pour cette période et livrés chaque semaine, prêts à réchauffer.',
        'Pas de courses, pas de vaisselle à rallonge : juste un bol chaud, que vous pouvez manger d’une main pendant que bébé s’endort sur vous.'
      ],
      bullets: [
        'Plats chauds et réconfortants, prêts en quelques minutes',
        'Livraison chaque semaine, en France et en Israël',
        'Menus adaptés à vos préférences et à vos allergies',
        'Inclus dans les forfaits Cocon et Renaissance, pendant 6 semaines'
      ]
    },
    plansTeaser: {
      eyebrow: 'Les forfaits',
      title: 'Trois façons de vivre vos 40 jours',
      intro: 'Choisissez l’accompagnement qui vous ressemble. Vous pouvez réserver dès la grossesse.',
      compare: 'Comparer les forfaits en détail'
    },
    gift: {
      eyebrow: 'À offrir',
      title: 'Le plus beau cadeau de naissance : du temps et du soin',
      paragraphs: [
        'Vous êtes sa mère, sa sœur, son amie, son conjoint ? Offrez 40 Days à une jeune maman : des repas, du soutien et du temps pour elle.',
        'Indiquez simplement que c’est un cadeau lors de la réservation : vous recevez une carte à lui remettre, et nous organisons tout avec elle.'
      ],
      cta: 'Offrir 40 Days'
    },
    faq: {
      eyebrow: 'Questions fréquentes',
      title: 'Vos questions sur le post-partum et le programme',
      intro: 'Vous ne trouvez pas votre réponse ? <a href="{contact}">Écrivez-nous</a>.',
      items: [
        { q: 'Que sont les 40 jours après l’accouchement ?', a: 'C’est la période qui suit la naissance, souvent appelée post-partum ou « quatrième trimestre ». Dans de nombreuses traditions, ces 40 jours sont consacrés au repos de la mère et à la rencontre avec le bébé. 40 Days vous accompagne pendant cette période avec un soutien concret : repas, mouvement doux, communauté et conseils.' },
        { q: 'Quand puis-je commencer le programme ?', a: 'Vous pouvez réserver pendant la grossesse ou après la naissance. Votre accompagnement démarre à votre retour à la maison : nous calons les livraisons et l’accès à la plateforme sur votre date d’accouchement, que vous pourrez ajuster.' },
        { q: 'La remise en forme post-partum est-elle adaptée juste après la naissance ?', a: 'Les premières semaines, le programme propose surtout de la respiration, de la posture et une mobilité très douce. Le renforcement progressif vient ensuite, après le feu vert de votre sage-femme ou de votre médecin, par exemple à la consultation postnatale. Chaque séance peut être mise en pause : votre corps donne le rythme.' },
        { q: 'Comment fonctionnent les repas post-partum ?', a: 'Avec les forfaits Cocon et Renaissance, vous recevez une livraison de repas chaque semaine pendant 6 semaines. Les plats arrivent prêts à réchauffer. Après votre réservation, nous vous demandons vos préférences et vos allergies pour adapter les menus.' },
        { q: 'Qu’apporte l’accompagnement doula ?', a: 'Une doula accompagne les familles avec une présence bienveillante et des conseils pratiques : allaitement, sommeil, portage, retour à la maison, émotions. Elle ne remplace pas le suivi médical, elle le complète. Chez 40 Days, des doulas et d’autres intervenantes animent des cours en direct et répondent à vos questions.' },
        { q: 'Les compléments alimentaires sont-ils compatibles avec l’allaitement ?', a: 'Nos compléments sont proposés comme un soutien nutritionnel pendant le post-partum, pas comme un traitement. Demandez l’avis de votre médecin ou sage-femme avant de les prendre, notamment si vous allaitez.' },
        { q: 'Puis-je offrir 40 Days à une proche ?', a: 'Oui. Cochez « Je réserve pour l’offrir » dans le formulaire et indiquez l’adresse de la jeune maman. Vous recevez une carte cadeau à lui remettre, puis nous organisons tout directement avec elle.' },
        { q: 'Le programme est-il disponible en France et en Israël, et en quelle langue ?', a: 'Oui, 40 Days est proposé en France et en Israël. La plateforme, les forums et les cours sont accessibles en français, en anglais et en hébreu, et notre équipe vous répond dans ces trois langues.' }
      ]
    },
    final: {
      title: 'Prenez soin de celle qui prend soin',
      text: 'Réservez vos 40 jours en quelques minutes : nous nous occupons du reste.'
    }
  },

  plansPage: {
    eyebrow: 'Forfaits',
    title: 'Nos forfaits post-partum, pour des 40 jours à votre mesure',
    intro: 'Trois formules pour être accompagnée après l’accouchement : de la remise en forme en douceur jusqu’au cocon complet, avec repas, compléments et coffret.',
    reassurance: [
      'Réservation possible dès la grossesse',
      'Accompagnement en français, en anglais et en hébreu',
      'Paiement en ligne sécurisé',
      'Option cadeau pour l’entourage'
    ],
    cardsTitle: 'Les trois forfaits',
    compare: {
      eyebrow: 'En détail',
      title: 'Comparer les forfaits',
      caption: 'Prestations incluses dans les forfaits Essentiel, Cocon et Renaissance',
      included: 'Prestations',
      yes: 'Inclus',
      no: 'Non inclus',
      rows: [
        { label: 'Programme de remise en forme post-partum en vidéo', values: [true, true, true] },
        { label: 'Accès à la plateforme et aux forums', values: [true, true, true] },
        { label: 'Vidéos et tips pour maman et bébé', values: [true, true, true] },
        { label: 'Cours en direct avec des doulas et intervenantes', values: [false, true, true] },
        { label: 'Livraisons de repas post-partum pendant 6 semaines', values: [false, true, true] },
        { label: 'Cure de compléments alimentaires de 40 jours', values: [false, false, true] },
        { label: 'Coffret boutique : gaine, culottes menstruelles, soutien-gorge d’allaitement, kit bébé', values: [false, false, true] }
      ]
    },
    form: {
      eyebrow: 'Inscription',
      title: 'Réservez vos 40 jours',
      intro: 'Quelques informations suffisent. Vous pourrez tout ajuster ensuite avec nous.',
      stepPlan: 'Votre forfait',
      stepYou: 'Vos coordonnées',
      stepDelivery: 'Livraison',
      stepConsent: 'Vos accords',
      stepPayment: 'Paiement'
    },
    summary: {
      title: 'Votre réservation',
      plan: 'Forfait',
      country: 'Livraison',
      total: 'Total',
      points: [
        { icon: 'lock', text: 'Paiement sécurisé par Stripe' },
        { icon: 'calendar', text: 'Démarrage à votre retour à la maison' },
        { icon: 'chat', text: 'Une question ? <a href="{contact}">Écrivez-nous</a>' }
      ]
    }
  },

  platformPage: {
    eyebrow: 'La plateforme',
    title: 'Votre espace post-partum en ligne, ouvert jour et nuit',
    intro: 'Forums entre jeunes mamans, cours avec des doulas, vidéos et tips pour vous et bébé : tout est réuni au même endroit, sur votre téléphone, même à 3 heures du matin.',
    seePlans: 'Voir les forfaits',
    spaces: {
      eyebrow: 'Dans votre espace',
      title: 'Ce que vous y trouvez',
      intro: 'Un lieu calme, modéré et bienveillant, pensé pour s’utiliser d’une seule main.',
      items: [
        { icon: 'chat', title: 'Les forums', text: 'Posez vos questions, partagez vos nuits et vos petites victoires avec des mamans qui vivent la même chose, en France et en Israël. Les échanges sont modérés.' },
        { icon: 'play', title: 'Les cours en direct', text: 'Allaitement, sommeil, portage, émotions : des doulas et d’autres intervenantes de la périnatalité vous retrouvent en direct, puis en replay.' },
        { icon: 'heart', title: 'Vidéos et tips maman-bébé', text: 'Bain, massage, positions d’allaitement, astuces du quotidien : des vidéos courtes, à regarder quand vous avez cinq minutes.' },
        { icon: 'move', title: 'Votre programme de mouvement', text: 'Vos séances de remise en forme post-partum, jour après jour, avec des repères clairs pour avancer à votre rythme.' }
      ]
    },
    classes: {
      eyebrow: 'Cours et accompagnement',
      title: 'Des doulas à vos côtés, même à distance',
      paragraphs: [
        'Chaque semaine, des doulas et d’autres professionnelles de la périnatalité animent des cours en petit groupe. Vous posez vos questions en direct ou revoyez la séance plus tard.',
        'Leur rôle : vous écouter, vous informer et vous aider à trouver vos repères. Pour toute question médicale, elles vous orientent vers votre sage-femme ou votre médecin.'
      ],
      bullets: ['Cours en direct et replays', 'En français, en anglais et en hébreu', 'Inclus dans les forfaits Cocon et Renaissance']
    },
    login: {
      eyebrow: 'Espace membre',
      title: 'Se connecter',
      intro: 'Retrouvez vos forums, vos cours et votre programme. Vos accès vous sont envoyés par e-mail après votre réservation.',
      password: 'Mot de passe',
      show: 'Afficher le mot de passe',
      hide: 'Masquer le mot de passe',
      forgot: 'Mot de passe oublié ?',
      submit: 'Se connecter',
      noAccount: 'Pas encore inscrite ?',
      noAccountCta: 'Choisir mon forfait',
      resetTitle: 'Mot de passe oublié',
      resetIntro: 'Indiquez votre adresse e-mail : nous vous envoyons un lien pour en choisir un nouveau.',
      resetSubmit: 'Recevoir le lien',
      demoNotice: 'Site de démonstration : la connexion n’est pas encore reliée à la plateforme.'
    }
  },

  contactPage: {
    eyebrow: 'Contact',
    title: 'Une question ? Parlons-en',
    intro: 'Sur les forfaits, les repas, la plateforme ou pour offrir 40 Days : écrivez-nous, une vraie personne vous répond.',
    formLabel: 'Formulaire de contact',
    aside: {
      title: 'Nous écrire directement',
      points: [
        { icon: 'globe', text: 'Réponses en français, en anglais et en hébreu' },
        { icon: 'calendar', text: 'Nous vous répondons au plus vite, en semaine' },
        { icon: 'phone', text: 'Urgence médicale : appelez le 15 en France ou le 101 en Israël' }
      ],
      faq: 'Lire les questions fréquentes'
    }
  },

  notFound: {
    title: 'Cette page s’est égarée',
    text: 'La page que vous cherchez n’existe pas ou a changé d’adresse. Revenons à l’essentiel.',
    home: 'Retour à l’accueil'
  },

  // ---- Pages légales ---------------------------------------------------------------------------
  legal: {
    title: 'Mentions légales',
    sections: [
      { title: 'Éditeur du site', html: `<p>Le site {domain} est édité par <strong>{companyName}</strong>, {legalForm} au capital de {shareCapital}.</p>
<ul>
<li>Siège social : {address}</li>
<li>SIRET : {siret} · RCS : {rcs}</li>
<li>Numéro de TVA intracommunautaire : {vatNumber}</li>
<li>Activité en Israël, numéro d’entreprise (ח.פ.) : {israelCompanyNumber}, adresse : {israelAddress}</li>
<li>E-mail : <a href="mailto:{email}">{email}</a> · téléphone : {phone}</li>
<li>Direction de la publication : {publicationDirector}</li>
</ul>` },
      { title: 'Hébergement', html: `<p>Le site est hébergé par {host}, {hostAddress}, téléphone : {hostPhone}.</p>` },
      { title: 'Propriété intellectuelle', html: `<p>Les textes, le logotype « 40 Days », les illustrations et la scène 3D du site sont la propriété de {companyName}, sauf mention contraire. Toute reproduction ou réutilisation sans autorisation écrite est interdite.</p>
<p>La scène 3D utilise la bibliothèque Three.js, distribuée sous licence MIT. Les polices Cormorant Garamond, DM Sans, Frank Ruhl Libre et Assistant sont distribuées sous licence SIL Open Font License.</p>` },
      { title: 'Crédits photographiques', html: `<p>Les photographies proviennent d’Unsplash et sont utilisées selon la licence Unsplash. Merci à leurs autrices et auteurs :</p>
{photoCredits}` },
      { title: 'Informations de santé', html: `<p>Les contenus de 40 Days sont fournis à titre d’information et d’accompagnement bien-être. Ils ne constituent pas un avis médical et ne remplacent pas le suivi par votre sage-femme, votre médecin ou tout autre professionnel de santé.</p>
<p>Les compléments alimentaires ne sont pas des médicaments. Demandez l’avis de votre médecin ou sage-femme, notamment si vous allaitez. En cas d’urgence, appelez le 15 ou le 112 en France, le 101 en Israël.</p>` },
      { title: 'Données personnelles et cookies', html: `<p>Le traitement de vos données est décrit dans notre <a href="{privacy}">politique de confidentialité</a>, et l’usage des traceurs dans notre <a href="{cookies}">politique cookies</a>.</p>` },
      { title: 'Droit applicable', html: `<p>Les présentes mentions légales sont régies par le droit français. Pour toute question, écrivez-nous à <a href="mailto:{email}">{email}</a>.</p>` }
    ]
  },

  terms: {
    title: 'Conditions générales de vente',
    intro: 'Les présentes conditions encadrent la réservation des forfaits 40 Days. Document de travail, à faire valider par un professionnel du droit avant la mise en ligne.',
    sections: [
      { title: 'Objet', html: `<p>Les présentes conditions générales de vente (CGV) s’appliquent à toute réservation d’un forfait d’accompagnement post-partum 40 Days sur le site {domain}, par une personne majeure agissant en tant que consommatrice, en France ou en Israël. Elles sont proposées par {companyName} ({address}, SIRET {siret}).</p>` },
      { title: 'Les forfaits', html: `<p>40 Days propose trois forfaits d’une durée de 40 jours, décrits sur la <a href="{plans}">page Forfaits</a> :</p>
<ul>
<li><strong>Essentiel</strong> : programme de remise en forme post-partum, accès à la plateforme et aux forums, vidéos et tips ;</li>
<li><strong>Cocon</strong> : Essentiel, cours en direct avec des doulas et intervenantes, 6 semaines de livraisons de repas ;</li>
<li><strong>Renaissance</strong> : Cocon, cure de compléments alimentaires de 40 jours et coffret boutique (gaine, culottes menstruelles, soutien-gorge d’allaitement, kit bébé).</li>
</ul>
<p>Les doulas et intervenantes proposent un accompagnement non médical. Le programme ne remplace pas le suivi par un professionnel de santé.</p>` },
      { title: 'Prix', html: `<p>Les prix sont indiqués toutes taxes comprises, en euros pour les livraisons en France et en shekels pour les livraisons en Israël. Le prix applicable est celui affiché au moment de la réservation. Les frais de livraison sont inclus, sauf mention contraire : [À COMPLÉTER].</p>` },
      { title: 'Réservation', html: `<p>La réservation se fait en ligne : choix du forfait, coordonnées, date d’accouchement prévue ou réelle, adresse de livraison, acceptation des présentes CGV, puis paiement. Un e-mail de confirmation récapitule la commande. Le contrat est conclu à la réception de cet e-mail.</p>
<p>Vous pouvez réserver pour offrir le forfait : la bénéficiaire est alors la personne dont l’adresse de livraison est indiquée.</p>` },
      { title: 'Paiement', html: `<p>Le paiement s’effectue en ligne, par carte bancaire ou portefeuille électronique, via notre prestataire de paiement sécurisé Stripe. 40 Days n’a jamais accès à vos numéros de carte. Le montant est débité à la réservation. Modalités de paiement en plusieurs fois : [À COMPLÉTER].</p>` },
      { title: 'Début et durée de l’accompagnement', html: `<p>L’accompagnement dure 40 jours à compter de votre retour à la maison après l’accouchement. Il est organisé à partir de la date d’accouchement indiquée, que vous pouvez modifier en nous écrivant. L’accès à la plateforme est ouvert dès la confirmation de la réservation.</p>` },
      { title: 'Livraisons', html: `<p>Les repas (forfaits Cocon et Renaissance) sont livrés une fois par semaine pendant 6 semaines, à l’adresse indiquée, en France et en Israël, dans les zones desservies : [À COMPLÉTER]. Si votre adresse n’est pas desservie, nous vous le signalons avant le début de l’accompagnement et vous proposons une solution ou un remboursement de la part correspondante.</p>
<p>Les repas sont des denrées périssables : merci de les conserver selon les indications fournies. Le coffret boutique et les compléments (forfait Renaissance) sont expédiés avant la date d’accouchement prévue ou dès la réservation si la naissance a eu lieu.</p>` },
      { title: 'Compléments alimentaires', html: `<p>Les compléments alimentaires proposés sont un soutien nutritionnel, pas des médicaments. Ils ne doivent pas se substituer à une alimentation variée et équilibrée. Respectez les doses indiquées et demandez l’avis de votre médecin ou sage-femme avant de les prendre, notamment si vous allaitez ou suivez un traitement.</p>` },
      { title: 'Plateforme et forums', html: `<p>Vos accès sont personnels. Les forums sont modérés : les messages irrespectueux, publicitaires ou contenant des conseils médicaux présentés comme tels peuvent être retirés. Les échanges entre participantes ne remplacent pas un avis professionnel.</p>` },
      { title: 'Droit de rétractation (France)', html: `<p>Vous disposez de 14 jours pour vous rétracter, sans avoir à vous justifier, à compter de la conclusion du contrat pour les services et de la réception pour les produits. Écrivez-nous à <a href="mailto:{email}">{email}</a> en indiquant votre numéro de réservation.</p>
<p>Si vous avez demandé que l’accompagnement commence avant la fin de ce délai, vous restez redevable de la part du service déjà fournie. Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux repas (denrées périssables) déjà livrés, ni aux produits d’hygiène descellés après la livraison, comme les culottes menstruelles, la gaine ou le soutien-gorge d’allaitement.</p>
<p>Le remboursement intervient dans les 14 jours suivant votre demande, par le moyen de paiement utilisé.</p>` },
      { title: 'Annulation de la transaction (Israël)', html: `<p>Si vous résidez en Israël, vous pouvez annuler la transaction conformément à la loi sur la protection du consommateur (5741-1981) et à ses règlements : en principe dans les 14 jours suivant la transaction ou la réception des produits, par écrit à <a href="mailto:{email}">{email}</a>. Des frais d’annulation peuvent s’appliquer dans la limite prévue par la loi (5 % du prix ou 100 ₪, le montant le plus bas). Les exceptions légales s’appliquent, notamment pour les denrées périssables.</p>` },
      { title: 'Responsabilité', html: `<p>40 Days s’engage à fournir les services décrits avec soin. Sa responsabilité ne saurait être engagée en cas de mauvaise utilisation des produits, de non-respect des recommandations ou d’événement de force majeure. Rien dans les présentes ne limite les droits que vous accorde la loi applicable.</p>` },
      { title: 'Réclamations et médiation', html: `<p>Pour toute réclamation, écrivez-nous à <a href="mailto:{email}">{email}</a>. En France, si votre réclamation n’a pas abouti, vous pouvez recourir gratuitement au médiateur de la consommation : {consumerMediator}. En Israël, vous pouvez vous adresser à l’Autorité de protection du consommateur et du commerce équitable.</p>` },
      { title: 'Droit applicable', html: `<p>Les présentes CGV sont soumises au droit français pour les clientes résidant en France et au droit israélien pour les clientes résidant en Israël, sans préjudice des dispositions protectrices de la loi de votre pays de résidence.</p>` }
    ]
  },

  privacy: {
    title: 'Politique de confidentialité',
    intro: 'Vos données vous appartiennent. Voici, simplement, ce que nous en faisons et comment exercer vos droits, que vous viviez en France ou en Israël.',
    sections: [
      { title: 'Qui est responsable de vos données ?', html: `<p>Le responsable du traitement est {companyName}, {address}. Pour toute question sur vos données : <a href="mailto:{privacyContact}">{privacyContact}</a>.</p>` },
      { title: 'Les données que nous collectons', html: `<ul>
<li><strong>Réservation</strong> : prénom, nom, e-mail, téléphone, adresse de livraison, pays, forfait choisi, date d’accouchement prévue ou réelle, option cadeau.</li>
<li><strong>Paiement</strong> : traité par Stripe. Nous recevons uniquement la confirmation du paiement, jamais vos numéros de carte.</li>
<li><strong>Contact</strong> : nom, e-mail, téléphone facultatif et contenu de votre message.</li>
<li><strong>Plateforme</strong> : identifiants de connexion, messages publiés dans les forums, participation aux cours.</li>
<li><strong>Navigation</strong> : vos choix de cookies et de langue, et des journaux techniques nécessaires à la sécurité.</li>
</ul>
<p>Votre date d’accouchement peut révéler une information liée à la santé. Nous la traitons uniquement avec votre consentement explicite, donné lors de la réservation, et seulement pour organiser votre accompagnement.</p>` },
      { title: 'Pourquoi nous les utilisons', html: `<ul>
<li>Gérer votre réservation, vos livraisons et votre accès à la plateforme : exécution du contrat.</li>
<li>Organiser l’accompagnement à partir de votre date d’accouchement : votre consentement explicite.</li>
<li>Répondre à vos messages : notre intérêt légitime à vous répondre, ou des mesures précontractuelles.</li>
<li>Vous envoyer nos conseils par e-mail : votre consentement, retirable à tout moment.</li>
<li>Tenir notre comptabilité : obligation légale.</li>
<li>Sécuriser le site et prévenir la fraude : notre intérêt légitime.</li>
<li>Mesurer l’audience, si cette option est un jour activée : votre consentement.</li>
</ul>` },
      { title: 'Combien de temps nous les gardons', html: `<ul>
<li>Données de réservation : pendant l’accompagnement, puis 3 ans après notre dernier échange.</li>
<li>Date d’accouchement : supprimée 12 mois après la fin de l’accompagnement.</li>
<li>Factures : 10 ans, comme l’impose la loi.</li>
<li>Messages de contact : 3 ans après notre dernier échange.</li>
<li>Compte et messages de la plateforme : jusqu’à la suppression de votre compte.</li>
<li>Choix de cookies : 6 mois.</li>
</ul>` },
      { title: 'Qui peut y accéder', html: `<p>Seule l’équipe 40 Days accède à vos données, ainsi que nos prestataires, dans la limite de leur mission : hébergement ({host}), paiement (Stripe), envoi d’e-mails ([À COMPLÉTER]), livraison des repas et du coffret ([À COMPLÉTER]), plateforme de cours ([À COMPLÉTER]). Les doulas et intervenantes voient uniquement votre prénom et vos questions pendant les cours. Nous ne vendons jamais vos données.</p>` },
      { title: 'Transferts entre la France et Israël', html: `<p>Nos activités se déroulent en France et en Israël. Israël fait l’objet d’une décision d’adéquation de la Commission européenne, qui reconnaît un niveau de protection équivalent : vos données peuvent y être transférées sans formalité supplémentaire. Si un prestataire est situé ailleurs, nous encadrons le transfert par des clauses contractuelles types de la Commission européenne ou un mécanisme équivalent.</p>` },
      { title: 'Vos droits (RGPD)', html: `<p>Vous pouvez à tout moment accéder à vos données, les rectifier, les effacer, en limiter l’usage, vous opposer à leur traitement, demander leur portabilité, retirer votre consentement et définir des directives sur leur sort après votre décès. Écrivez-nous à <a href="mailto:{privacyContact}">{privacyContact}</a> : nous répondons sous un mois.</p>
<p>Vous pouvez aussi adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" rel="noopener">cnil.fr</a>).</p>` },
      { title: 'Si vous résidez en Israël', html: `<p>Nous respectons la loi israélienne sur la protection de la vie privée (5741-1981), telle que modifiée notamment par l’amendement 13, et ses règlements sur la sécurité des données. Vous pouvez consulter les informations vous concernant, en demander la correction ou la suppression, et savoir dans quel but elles sont utilisées. Vous pouvez également saisir l’Autorité de protection de la vie privée (הרשות להגנת הפרטיות).</p>` },
      { title: 'Sécurité', html: `<p>Connexion chiffrée (HTTPS), accès limité aux personnes qui en ont besoin, prestataires choisis pour leurs garanties de sécurité : nous protégeons vos données comme nous aimerions que les nôtres le soient.</p>` },
      { title: 'Mises à jour', html: `<p>Nous pouvons faire évoluer cette politique. La date de dernière mise à jour figure en haut de cette page.</p>` }
    ]
  },

  cookies: {
    title: 'Politique cookies',
    intro: 'Pas de publicité cachée, pas de pistage inutile : voici les traceurs utilisés sur fortydays.com et la façon de gérer vos choix.',
    sections: [
      { title: 'Qu’est-ce qu’un traceur ?', html: `<p>Un traceur (cookie ou stockage local) est un petit fichier ou une petite donnée enregistrée par votre navigateur lors de la visite d’un site. Certains sont indispensables au fonctionnement du site, d’autres nécessitent votre accord.</p>` },
      { title: 'Les traceurs que nous utilisons', html: `<div class="table-wrap" role="region" tabindex="0" aria-label="Traceurs utilisés"><table>
<thead><tr><th scope="col">Nom</th><th scope="col">Rôle</th><th scope="col">Durée</th><th scope="col">Catégorie</th></tr></thead>
<tbody>
<tr><td><code>fd-consent</code></td><td>Mémorise vos choix de cookies</td><td>6 mois</td><td>Nécessaire</td></tr>
<tr><td><code>fd-lang</code></td><td>Mémorise la langue choisie</td><td>Jusqu’à suppression</td><td>Nécessaire</td></tr>
</tbody></table></div>
<p>À ce jour, aucun outil de mesure d’audience ni de publicité n’est installé. S’ils l’étaient, ils ne seraient activés qu’après votre accord, dans les catégories « Mesure d’audience » et « Marketing ».</p>` },
      { title: 'Contenus de tiers', html: `<p>Pour afficher les polices de caractères et les photographies, votre navigateur contacte les serveurs de Google Fonts et d’Unsplash, qui reçoivent votre adresse IP. Ces services ne déposent pas de cookies via notre site.</p>` },
      { title: 'Gérer vos choix', html: `<p>Vous pouvez modifier vos choix à tout moment :</p>
<p>{manageCookies}</p>
<p>Vous pouvez aussi supprimer les traceurs depuis les réglages de votre navigateur.</p>` },
      { title: 'Durée de votre consentement', html: `<p>Vos choix sont conservés 6 mois. Passé ce délai, nous vous les redemandons.</p>` }
    ]
  }
};
