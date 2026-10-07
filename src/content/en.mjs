// Site copy in English. Words in braces, like {price} or {terms}, are filled in automatically: keep them as they are.
export default {
  lang: 'en',
  dir: 'ltr',
  slugs: {
    home: '', plans: 'plans/', platform: 'platform/', contact: 'contact/',
    legal: 'legal-notice/', terms: 'terms/', privacy: 'privacy/', cookies: 'cookies/'
  },
  pageNames: {
    home: 'Home', plans: 'Plans', platform: 'Platform', contact: 'Contact',
    legal: 'Legal notice', terms: 'Terms of sale', privacy: 'Privacy policy', cookies: 'Cookie policy'
  },

  meta: {
    home: {
      title: 'Postpartum care for your first 40 days after birth | 40 Days',
      description: 'Gentle postpartum fitness, doula support, meals delivered to your door and a community of new moms: 40 Days cares for you through the 40 days after birth.'
    },
    plans: {
      title: 'Postpartum plans: Essential, Cocoon, Renaissance | 40 Days',
      description: 'Compare our 3 postpartum plans: gentle fitness, live doula classes, meal deliveries, supplements and a recovery box. Book your 40 days online.'
    },
    platform: {
      title: 'Postpartum platform: forums, doula classes, videos | 40 Days',
      description: 'Your online space after birth: forums with other new moms, live doula classes, and videos and tips for you and your baby.'
    },
    contact: {
      title: 'Contact us: questions about postpartum care? | 40 Days',
      description: 'Questions about our plans, postpartum meals or doula support? Write to us: we reply in English, French and Hebrew.'
    },
    legal: { title: 'Legal notice | 40 Days', description: 'Legal notice for fortydays.com: publisher, hosting, intellectual property and photo credits.' },
    terms: { title: 'Terms of sale | 40 Days', description: 'Terms of sale for 40 Days plans: booking, prices, payment, deliveries and cancellation rights in France and Israel.' },
    privacy: { title: 'Privacy policy | 40 Days', description: 'How 40 Days protects your personal data, in line with the GDPR and the Israeli Privacy Protection Law.' },
    cookies: { title: 'Cookie policy | 40 Days', description: 'The trackers used on fortydays.com, what they do and how to manage your choices at any time.' },
    notFound: { title: 'Page not found | 40 Days', description: 'This page doesn’t exist or has moved.' }
  },

  ui: {
    skip: 'Skip to content',
    logoLabel: '40 Days, home',
    navLabel: 'Main navigation',
    nav: { programme: 'The program', plans: 'Plans', platform: 'Platform', contact: 'Contact' },
    langLabel: 'Language',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    cta: 'Book my 40 days',
    ctaShort: 'Book',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    toc: 'Contents',
    updated: 'Last updated: {date}',
    photo: 'Photo:',
    example: 'Sample',
    supplementsNotice: 'Food supplements: ask your doctor or midwife for advice, especially if you are breastfeeding.',
    ogAlt: 'Inside a drop of pearly glass, a young mother holds her newborn: 40 Days, postpartum support.',
    footer: {
      tagline: 'Support for the 40 days after birth, in France and Israel.',
      navLabel: 'Useful links',
      programme: '40 Days',
      faq: 'FAQ',
      info: 'Information',
      languages: 'Languages',
      disclaimer: '40 Days offers wellbeing support. It does not replace medical follow-up by your midwife or doctor.',
      credits: 'Photos: <a href="https://unsplash.com/?utm_source=40days&amp;utm_medium=referral" rel="noopener">Unsplash</a>, credited in the <a href="{legal}#s4">legal notice</a>'
    },
    consent: {
      title: 'Your cookie choices',
      text: 'We only use the trackers the site needs to work. With your consent, we may also measure traffic to improve our content. You can change your mind at any time.',
      policy: 'Cookie policy',
      accept: 'Accept all',
      refuse: 'Reject all',
      customize: 'Customize',
      save: 'Save my choices',
      manage: 'Manage cookies',
      saved: 'Your choices have been saved.',
      categories: {
        necessary: { title: 'Necessary', text: 'Remember your cookie and language choices. Always on.' },
        analytics: { title: 'Analytics', text: 'Visit statistics, to improve the site.' },
        marketing: { title: 'Marketing', text: 'Measuring how our campaigns perform.' }
      }
    }
  },

  planInfo: {
    category: 'Postpartum support',
    mostChosen: 'Most popular',
    period: 'for 40 days',
    altPrice: 'or {price} in Israel',
    choose: 'Choose this plan',
    essentiel: {
      name: 'Essential',
      tagline: 'To move gently and never feel alone.',
      features: ['Postpartum fitness program', 'Access to the platform and forums', 'Videos and tips for you and your baby']
    },
    cocon: {
      name: 'Cocoon',
      tagline: 'To feel surrounded and well fed through the first weeks.',
      features: ['Everything in Essential', 'Live classes with doulas and practitioners', '6 weeks of meal deliveries']
    },
    renaissance: {
      name: 'Renaissance',
      tagline: 'The complete cocoon, with supplements and a recovery box.',
      features: ['Everything in Cocoon', '40-day supplement course', 'Shop box: support belt, period underwear, nursing bra, baby kit']
    }
  },

  form: {
    requiredNote: 'Fields marked with an asterisk (*) are required.',
    optional: 'optional',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email address',
    phone: 'Phone',
    phoneHint: 'Include your country code if you live outside France, e.g. +972.',
    dueDate: 'Due date or birth date',
    dueDateHint: 'Expected or actual: it helps us schedule your deliveries.',
    dateType: 'This date is',
    dateExpected: 'expected',
    dateActual: 'actual, baby is here',
    country: 'Delivery country',
    countryHint: 'Prices show in euros for France and in shekels for Israel.',
    countries: { FR: 'France', IL: 'Israel' },
    address1: 'Address',
    address2: 'Apartment, floor, entrance',
    postalCode: 'Postal code',
    city: 'City',
    gift: 'I’m booking this as a <strong>gift</strong> for a new mom: the address above is hers.',
    consent: 'I accept the <a href="{terms}">terms of sale</a> and have read the <a href="{privacy}">privacy policy</a>. I agree that my due or birth date may be used to organize my support.',
    consentShort: 'Terms and privacy',
    newsletter: 'I’d like to receive tips and news from 40 Days by email (unsubscribe in one click).',
    paymentTitle: 'Secure payment',
    paymentText: 'The Stripe payment form will appear here: card, Apple Pay or Google Pay.',
    demoNotice: 'Demo site: no payment is taken for now.',
    name: 'Full name',
    message: 'Your message',
    messageHint: 'A few lines are enough.',
    contactPrivacy: 'Your details are only used to reply to you. <a href="{privacy}">Learn more</a>',
    send: 'Send my message'
  },

  formJs: {
    errors: {
      required: 'This field is required.',
      email: 'Enter a valid email address, e.g. name@example.com.',
      phone: 'Enter a valid phone number with at least 8 digits.',
      date: 'Enter a valid date.',
      dateRange: 'Choose a date between {min} and {max}.',
      postalFR: 'French postal codes have 5 digits.',
      postalIL: 'Israeli postal codes have 7 digits.',
      consent: 'Please accept the terms to complete your booking.',
      plan: 'Choose a plan.',
      password: 'Your password has at least 8 characters.',
      minlength: 'Write at least {n} characters.',
      summary: 'Please check {n} fields:',
      summaryOne: 'Please check this field:'
    },
    sending: 'Sending…',
    draftRestored: 'We kept what you had typed: you can pick up where you left off.',
    genericError: 'Something went wrong. Please try again in a moment or write to contact@fortydays.com.',
    totalLabel: '·',
    register: {
      successTitle: 'Thank you, {firstName}: your 40 days are booked.',
      successText: 'Your booking {reference} for the {plan} plan ({total}) is confirmed. A confirmation email is on its way to {email}.',
      demo: 'Demo site: no payment has been taken.',
      nextTitle: 'What happens next',
      next: ['We’ll write to you in the coming days to get to know you.', 'You’ll receive your access to the platform and forums.', 'Your support begins when you get home.'],
      giftNext: 'You’ll also receive a gift card to give to the new mom.'
    },
    login: { success: 'Signed in.', demo: 'Demo site: sign-in isn’t connected to the platform yet.' },
    reset: { success: 'If an account exists for {email}, you’ll receive a link to choose a new password.' },
    contact: { successTitle: 'Thank you, your message has been sent.', successText: 'We’ll get back to you soon, in English, French or Hebrew.', again: 'Send another message' },
    show: 'Show password',
    hide: 'Hide password'
  },

  home: {
    story: { captions: ['A drop of life', 'The first cells', 'Your baby grows', 'Birth', 'In your arms'] },
    hero: {
      eyebrow: 'Postpartum support · France &amp; Israel',
      title: 'The 40 days after birth, <em>finally about you</em>',
      lead: 'You’ve just brought a new life into the world. These 40 days are for you: to eat, to sleep, to move gently, and to be surrounded.',
      text: '40 Days brings together gentle postpartum fitness, a community of new moms, classes with doulas, and nourishing meals delivered to your door.',
      secondary: 'Discover the program',
      gift: 'Someone you love is expecting?',
      giftLink: 'Give 40 Days',
      scroll: 'Scroll down, the story begins'
    },
    programme: {
      eyebrow: 'The program',
      title: 'A 40-day cocoon, woven around you',
      paragraphs: [
        'In many cultures, the 40 days after birth are a protected time: the new mother rests, is fed and is cared for. 40 Days brings that time back to the center, in France and in Israel.',
        'Through the postpartum weeks, we take over what weighs on you: meals, 3 a.m. questions, getting moving again. You keep what matters most: time with your baby, and time for yourself.',
        'No numbers to hit, no “pre-baby body” to get back: just recovery, energy and gentleness, at your own pace.'
      ],
      points: [
        { value: '40', label: 'days of support, from the moment you’re home' },
        { value: '3', label: 'plans to fit your needs' },
        { value: '2', label: 'countries: France and Israel' }
      ]
    },
    included: {
      eyebrow: 'What’s included',
      title: 'Everything that feels good, in one place',
      intro: 'Depending on your plan, your 40 days include:',
      items: [
        { icon: 'move', title: 'Postpartum fitness', text: '5- to 20-minute video sessions: breathing, posture and gentle mobility, then progressive strengthening once your midwife or doctor gives you the green light.' },
        { icon: 'chat', title: 'Platform and forums', text: 'An online space to talk with other new moms at any hour, with tips and videos for you and your baby.' },
        { icon: 'play', title: 'Doula support', text: 'Breastfeeding, sleep, babywearing, emotions: live and on-demand classes with doulas and other perinatal professionals.' },
        { icon: 'bowl', title: 'Postpartum meals, delivered', text: 'Every week, nourishing and comforting dishes, ready in minutes. Warm food, even with only one hand free.' },
        { icon: 'capsule', title: 'Food supplements', text: 'A 40-day course of vitamins designed for the postpartum period, plus a recovery formula, as nutritional support.', note: 'Ask your doctor or midwife for advice, especially if you are breastfeeding.' },
        { icon: 'bag', title: 'The after-birth shop', text: 'Postpartum support belts, period underwear, nursing bras and baby essentials, chosen for comfort.' }
      ]
    },
    testimonials: {
      eyebrow: 'Testimonials',
      title: 'What their 40 days felt like',
      intro: 'Small moments that change everything when you’ve just given birth.',
      items: [
        { quote: 'The first week, I didn’t even have the energy to think about dinner. The meals just arrived, warm and delicious, so I could stay in bed with my daughter.', name: 'Maya', detail: 'mom of Ella · Tel Aviv' },
        { quote: 'At 3 a.m., in the middle of a feed, the forum made me feel less alone. And the doula answered every single one of my breastfeeding questions.', name: 'Chloé', detail: 'mom of Noah · Paris' },
        { quote: 'I started moving again with ten-minute sessions, no pressure. Little by little, I felt at home in my body again.', name: 'Rachel', detail: 'mom of Ari · Jerusalem' }
      ],
      note: 'Sample testimonials, until we hear from our first participants.'
    },
    cta: {
      eyebrow: 'Your turn',
      title: 'Now it’s your turn: 40 days to find yourself again.',
      text: 'Book in a few minutes, during pregnancy or after the birth. Your support begins as soon as you’re home.',
      gift: 'Give the program'
    },
    days: {
      eyebrow: 'Day by day',
      title: 'Your 40 days, step by step',
      intro: 'Support that follows your recovery, with no imposed schedule: each step comes when you’re ready.',
      counterLabel: 'Day',
      phases: [
        { range: 'Days 1 to 10', title: 'Settle in', text: 'Rest, skin-to-skin, meals delivered: we handle everyday life so you can stay cozy with your baby.', photo: 'skin' },
        { range: 'Days 11 to 20', title: 'Recover gently', text: 'Breathing, posture and small guided movements, a few minutes a day, whenever you feel like it.', photo: 'stretch' },
        { range: 'Days 21 to 30', title: 'Regain energy', text: 'Nourishing meals, nights that slowly find a rhythm, and conversations with moms going through the same thing.', photo: 'soup' },
        { range: 'Days 31 to 40', title: 'Find yourself again', text: 'Get out a little, move a little more, and prepare what comes next at your own pace, always supported.', photo: 'together' }
      ]
    },
    meals: {
      eyebrow: 'Postpartum meals',
      title: 'Eat well, without cooking',
      paragraphs: [
        'After giving birth, you need warm, nourishing food that’s easy to eat. Our postpartum meals are designed for this time and delivered every week, ready to heat.',
        'No shopping, no pile of dishes: just a warm bowl you can eat with one hand while your baby falls asleep on you.'
      ],
      bullets: [
        'Warm, comforting dishes, ready in minutes',
        'Delivered every week, in France and Israel',
        'Menus adapted to your preferences and allergies',
        'Included in the Cocoon and Renaissance plans, for 6 weeks'
      ]
    },
    plansTeaser: {
      eyebrow: 'Plans',
      title: 'Three ways to live your 40 days',
      intro: 'Choose the support that suits you. You can book while you’re still pregnant.',
      compare: 'Compare the plans in detail'
    },
    gift: {
      eyebrow: 'A gift',
      title: 'The most beautiful birth gift: time and care',
      paragraphs: [
        'Are you her mother, her sister, her friend or her partner? Give 40 Days to a new mom: meals, support and time for herself.',
        'Just tick the gift option when you book: you’ll receive a card to give her, and we’ll organize everything with her.'
      ],
      cta: 'Give 40 Days'
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Your questions about postpartum and the program',
      intro: 'Can’t find your answer? <a href="{contact}">Write to us</a>.',
      items: [
        { q: 'What are the 40 days after birth?', a: 'It’s the period following birth, often called postpartum or the “fourth trimester”. In many traditions, these 40 days are dedicated to the mother’s rest and to getting to know the baby. 40 Days supports you through this time with practical help: meals, gentle movement, community and advice.' },
        { q: 'When can I start the program?', a: 'You can book during pregnancy or after the birth. Your support starts when you get home: we schedule deliveries and platform access around your due or birth date, which you can adjust.' },
        { q: 'Is postpartum fitness suitable right after birth?', a: 'In the first weeks, the program focuses on breathing, posture and very gentle mobility. Progressive strengthening comes later, once your midwife or doctor gives you the green light, for example at your postnatal check-up. You can pause any session: your body sets the pace.' },
        { q: 'How do the postpartum meals work?', a: 'With the Cocoon and Renaissance plans, you receive a meal delivery every week for 6 weeks. Dishes arrive ready to heat. After you book, we ask about your preferences and allergies to adapt the menus.' },
        { q: 'What does doula support bring?', a: 'A doula supports families with a caring presence and practical advice: breastfeeding, sleep, babywearing, coming home, emotions. She doesn’t replace medical care; she complements it. At 40 Days, doulas and other practitioners lead live classes and answer your questions.' },
        { q: 'Are the supplements compatible with breastfeeding?', a: 'Our supplements are offered as nutritional support during the postpartum period, not as a treatment. Ask your doctor or midwife before taking them, especially if you are breastfeeding.' },
        { q: 'Can I give 40 Days as a gift?', a: 'Yes. Tick the gift option in the booking form and enter the new mom’s address. You’ll receive a gift card to give her, and we then organize everything directly with her.' },
        { q: 'Is the program available in France and Israel, and in which language?', a: 'Yes, 40 Days is available in France and in Israel. The platform, forums and classes are in English, French and Hebrew, and our team replies in all three languages.' }
      ]
    },
    reassure: [
      { icon: 'lock', text: 'Secure payment' },
      { icon: 'calendar', text: 'Book while pregnant' },
      { icon: 'globe', text: 'In English, French and Hebrew' }
    ],
    final: {
      title: 'Take care of the one who takes care of everyone',
      text: 'Book your 40 days in a few minutes: we’ll take care of the rest.'
    }
  },

  plansPage: {
    eyebrow: 'Plans',
    title: 'Our postpartum plans, for 40 days that fit you',
    intro: 'Three ways to be supported after birth: from gentle fitness to the complete cocoon, with meals, supplements and a recovery box.',
    reassurance: [
      'Book as early as pregnancy',
      'Support in English, French and Hebrew',
      'Secure online payment',
      'Gift option for loved ones'
    ],
    cardsTitle: 'Our three plans',
    compare: {
      eyebrow: 'In detail',
      title: 'Compare the plans',
      caption: 'Services included in the Essential, Cocoon and Renaissance plans',
      included: 'Services',
      yes: 'Included',
      no: 'Not included',
      rows: [
        { label: 'Postpartum fitness program on video', values: [true, true, true] },
        { label: 'Access to the platform and forums', values: [true, true, true] },
        { label: 'Videos and tips for mom and baby', values: [true, true, true] },
        { label: 'Live classes with doulas and practitioners', values: [false, true, true] },
        { label: 'Postpartum meal deliveries for 6 weeks', values: [false, true, true] },
        { label: '40-day course of food supplements', values: [false, false, true] },
        { label: 'Shop box: support belt, period underwear, nursing bra, baby kit', values: [false, false, true] }
      ]
    },
    form: {
      eyebrow: 'Sign up',
      title: 'Book your 40 days',
      intro: 'Just a few details. You can adjust everything with us later.',
      stepPlan: 'Your plan',
      stepYou: 'Your details',
      stepDelivery: 'Delivery',
      stepConsent: 'Your consent',
      stepPayment: 'Payment'
    },
    summary: {
      title: 'Your booking',
      plan: 'Plan',
      country: 'Delivery',
      total: 'Total',
      points: [
        { icon: 'lock', text: 'Secure payment by Stripe' },
        { icon: 'calendar', text: 'Starts when you get home' },
        { icon: 'chat', text: 'A question? <a href="{contact}">Write to us</a>' }
      ]
    }
  },

  platformPage: {
    eyebrow: 'The platform',
    title: 'Your online postpartum space, open day and night',
    intro: 'Forums with other new moms, classes with doulas, videos and tips for you and your baby: all in one place, on your phone, even at 3 a.m.',
    seePlans: 'See the plans',
    spaces: {
      eyebrow: 'Inside your space',
      title: 'What you’ll find',
      intro: 'A calm, moderated and kind place, designed to be used with one hand.',
      items: [
        { icon: 'chat', title: 'The forums', text: 'Ask questions and share your nights and small victories with moms going through the same thing, in France and Israel. Conversations are moderated.' },
        { icon: 'play', title: 'Live classes', text: 'Breastfeeding, sleep, babywearing, emotions: doulas and other perinatal practitioners meet you live, then on replay.' },
        { icon: 'heart', title: 'Mom-and-baby videos and tips', text: 'Bathing, massage, breastfeeding positions, everyday tricks: short videos to watch whenever you have five minutes.' },
        { icon: 'move', title: 'Your movement program', text: 'Your postpartum fitness sessions, day by day, with clear markers to progress at your own pace.' }
      ]
    },
    classes: {
      eyebrow: 'Classes and support',
      title: 'Doulas by your side, even from afar',
      paragraphs: [
        'Every week, doulas and other perinatal professionals lead small-group classes. Ask your questions live or watch the session later.',
        'Their role is to listen, to inform you and to help you find your bearings. For any medical question, they refer you to your midwife or doctor.'
      ],
      bullets: ['Live classes and replays', 'In English, French and Hebrew', 'Included in the Cocoon and Renaissance plans']
    },
    login: {
      eyebrow: 'Members',
      title: 'Sign in',
      intro: 'Find your forums, classes and program. Your access details are emailed to you after booking.',
      password: 'Password',
      show: 'Show password',
      hide: 'Hide password',
      forgot: 'Forgot your password?',
      submit: 'Sign in',
      noAccount: 'Not a member yet?',
      noAccountCta: 'Choose my plan',
      resetTitle: 'Forgot your password',
      resetIntro: 'Enter your email address and we’ll send you a link to choose a new one.',
      resetSubmit: 'Send the link',
      demoNotice: 'Demo site: sign-in isn’t connected to the platform yet.'
    }
  },

  contactPage: {
    eyebrow: 'Contact',
    title: 'A question? Let’s talk',
    intro: 'About our plans, the meals, the platform or giving 40 Days as a gift: write to us and a real person will reply.',
    formLabel: 'Contact form',
    aside: {
      title: 'Write to us directly',
      points: [
        { icon: 'globe', text: 'Replies in English, French and Hebrew' },
        { icon: 'calendar', text: 'We reply as soon as we can, on weekdays' },
        { icon: 'phone', text: 'Medical emergency: call 101 in Israel or 15 in France' }
      ],
      faq: 'Read the FAQ'
    }
  },

  notFound: {
    title: 'This page has wandered off',
    text: 'The page you’re looking for doesn’t exist or has moved. Let’s get back to what matters.',
    home: 'Back to home'
  },

  legal: {
    title: 'Legal notice',
    sections: [
      { title: 'Publisher', html: `<p>The website {domain} is published by <strong>{companyName}</strong>, {legalForm} with a share capital of {shareCapital}.</p>
<ul>
<li>Registered office: {address}</li>
<li>SIRET: {siret} · RCS: {rcs}</li>
<li>EU VAT number: {vatNumber}</li>
<li>Activity in Israel, company number (ח.פ.): {israelCompanyNumber}, address: {israelAddress}</li>
<li>Email: <a href="mailto:{email}">{email}</a> · phone: {phone}</li>
<li>Publication director: {publicationDirector}</li>
</ul>` },
      { title: 'Hosting', html: `<p>The website is hosted by {host}, {hostAddress}, phone: {hostPhone}.</p>` },
      { title: 'Intellectual property', html: `<p>The texts, the “40 Days” logotype, the illustrations and the 3D scene on this site belong to {companyName}, unless stated otherwise. Any reproduction or reuse without written permission is prohibited.</p>
<p>The 3D scene uses the Three.js library, distributed under the MIT license. The Cormorant Garamond, DM Sans, Frank Ruhl Libre and Assistant typefaces are distributed under the SIL Open Font License.</p>` },
      { title: 'Photo credits', html: `<p>The photographs come from Unsplash and are used under the Unsplash license. Thank you to their photographers:</p>
{photoCredits}` },
      { title: 'Health information', html: `<p>The content offered by 40 Days is provided for information and wellbeing support. It is not medical advice and does not replace follow-up by your midwife, your doctor or any other health professional.</p>
<p>Food supplements are not medicines. Ask your doctor or midwife for advice, especially if you are breastfeeding. In an emergency, call 101 in Israel, or 15 or 112 in France.</p>` },
      { title: 'Personal data and cookies', html: `<p>How we process your data is explained in our <a href="{privacy}">privacy policy</a>, and how we use trackers in our <a href="{cookies}">cookie policy</a>.</p>` },
      { title: 'Governing law', html: `<p>This legal notice is governed by French law. For any question, write to <a href="mailto:{email}">{email}</a>.</p>` }
    ]
  },

  terms: {
    title: 'Terms of sale',
    intro: 'These terms govern bookings of 40 Days plans. Working draft, to be reviewed by a legal professional before going live.',
    sections: [
      { title: 'Purpose', html: `<p>These terms of sale apply to any booking of a 40 Days postpartum support plan on {domain} by an adult acting as a consumer, in France or in Israel. They are offered by {companyName} ({address}, SIRET {siret}).</p>` },
      { title: 'The plans', html: `<p>40 Days offers three 40-day plans, described on the <a href="{plans}">Plans page</a>:</p>
<ul>
<li><strong>Essential</strong>: postpartum fitness program, access to the platform and forums, videos and tips;</li>
<li><strong>Cocoon</strong>: Essential, plus live classes with doulas and practitioners and 6 weeks of meal deliveries;</li>
<li><strong>Renaissance</strong>: Cocoon, plus a 40-day course of food supplements and a shop box (support belt, period underwear, nursing bra, baby kit).</li>
</ul>
<p>Doulas and practitioners provide non-medical support. The program does not replace follow-up by a health professional.</p>` },
      { title: 'Prices', html: `<p>Prices include all taxes, in euros for deliveries in France and in shekels for deliveries in Israel. The applicable price is the one displayed when you book. Delivery costs are included unless stated otherwise: [À COMPLÉTER].</p>` },
      { title: 'Booking', html: `<p>You book online: choice of plan, contact details, expected or actual birth date, delivery address, acceptance of these terms, then payment. A confirmation email summarizes your order. The contract is concluded when you receive that email.</p>
<p>You can book a plan as a gift: the beneficiary is then the person whose delivery address you provide.</p>` },
      { title: 'Payment', html: `<p>Payment is made online by card or digital wallet, through our secure payment provider Stripe. 40 Days never has access to your card numbers. The amount is charged when you book. Installment options: [À COMPLÉTER].</p>` },
      { title: 'Start and duration of the support', html: `<p>The support lasts 40 days from the moment you come home after the birth. It is organized around the birth date you provide, which you can change by writing to us. Platform access opens as soon as your booking is confirmed.</p>` },
      { title: 'Deliveries', html: `<p>Meals (Cocoon and Renaissance plans) are delivered once a week for 6 weeks to the address provided, in France and in Israel, within the areas we serve: [À COMPLÉTER]. If your address is not covered, we let you know before your support begins and offer an alternative or a refund of the corresponding share.</p>
<p>Meals are perishable: please store them as indicated. The shop box and supplements (Renaissance plan) are shipped before your due date, or as soon as you book if your baby is already born.</p>` },
      { title: 'Food supplements', html: `<p>The supplements we offer are nutritional support, not medicines. They are not a substitute for a varied and balanced diet. Follow the recommended doses and ask your doctor or midwife before taking them, especially if you are breastfeeding or under treatment.</p>` },
      { title: 'Platform and forums', html: `<p>Your access is personal. Forums are moderated: disrespectful or promotional messages, or medical advice presented as such, may be removed. Conversations between participants do not replace professional advice.</p>` },
      { title: 'Right of withdrawal (France)', html: `<p>You have 14 days to withdraw, without giving a reason, from the conclusion of the contract for services and from receipt for products. Write to <a href="mailto:{email}">{email}</a> with your booking number.</p>
<p>If you asked for your support to begin before the end of that period, you remain liable for the share of the service already provided. Under article L221-28 of the French Consumer Code, the right of withdrawal does not apply to meals (perishable goods) already delivered, nor to hygiene products unsealed after delivery, such as period underwear, the support belt or the nursing bra.</p>
<p>Refunds are made within 14 days of your request, using the original payment method.</p>` },
      { title: 'Cancellation (Israel)', html: `<p>If you live in Israel, you may cancel the transaction under the Consumer Protection Law (5741-1981) and its regulations: as a rule within 14 days of the transaction or of receiving the products, in writing to <a href="mailto:{email}">{email}</a>. A cancellation fee may apply within the legal limit (5% of the price or ₪100, whichever is lower). Legal exceptions apply, in particular for perishable goods.</p>` },
      { title: 'Liability', html: `<p>40 Days undertakes to provide the services described with care. It cannot be held liable for misuse of products, failure to follow recommendations or force majeure. Nothing in these terms limits the rights granted to you by applicable law.</p>` },
      { title: 'Complaints and mediation', html: `<p>For any complaint, write to <a href="mailto:{email}">{email}</a>. In France, if your complaint has not been resolved, you can turn to the consumer mediator free of charge: {consumerMediator}. In Israel, you can contact the Consumer Protection and Fair Trade Authority.</p>` },
      { title: 'Governing law', html: `<p>These terms are governed by French law for customers living in France and by Israeli law for customers living in Israel, without prejudice to the protective provisions of the law of your country of residence.</p>` }
    ]
  },

  privacy: {
    title: 'Privacy policy',
    intro: 'Your data belongs to you. Here, simply put, is what we do with it and how to exercise your rights, whether you live in France or in Israel.',
    sections: [
      { title: 'Who is responsible for your data?', html: `<p>The data controller is {companyName}, {address}. For any question about your data: <a href="mailto:{privacyContact}">{privacyContact}</a>.</p>` },
      { title: 'The data we collect', html: `<ul>
<li><strong>Booking</strong>: first name, last name, email, phone, delivery address, country, chosen plan, expected or actual birth date, gift option.</li>
<li><strong>Payment</strong>: processed by Stripe. We only receive confirmation of payment, never your card numbers.</li>
<li><strong>Contact</strong>: name, email, optional phone number and the content of your message.</li>
<li><strong>Platform</strong>: login details, messages posted in the forums, class attendance.</li>
<li><strong>Browsing</strong>: your cookie and language choices, and technical logs needed for security.</li>
</ul>
<p>Your birth date may reveal health-related information. We process it only with the explicit consent you give when booking, and only to organize your support.</p>` },
      { title: 'Why we use it', html: `<ul>
<li>Managing your booking, deliveries and platform access: performance of the contract.</li>
<li>Organizing your support around your birth date: your explicit consent.</li>
<li>Replying to your messages: our legitimate interest in answering you, or pre-contractual steps.</li>
<li>Sending you our tips by email: your consent, which you can withdraw at any time.</li>
<li>Keeping our accounts: legal obligation.</li>
<li>Securing the site and preventing fraud: our legitimate interest.</li>
<li>Measuring traffic, if this option is ever enabled: your consent.</li>
</ul>` },
      { title: 'How long we keep it', html: `<ul>
<li>Booking data: during your support, then 3 years after our last exchange.</li>
<li>Birth date: deleted 12 months after your support ends.</li>
<li>Invoices: 10 years, as required by law.</li>
<li>Contact messages: 3 years after our last exchange.</li>
<li>Platform account and messages: until you delete your account.</li>
<li>Cookie choices: 6 months.</li>
</ul>` },
      { title: 'Who can access it', html: `<p>Only the 40 Days team can access your data, along with our service providers within the limits of their task: hosting ({host}), payment (Stripe), email delivery ([À COMPLÉTER]), meal and box delivery ([À COMPLÉTER]), class platform ([À COMPLÉTER]). Doulas and practitioners only see your first name and your questions during classes. We never sell your data.</p>` },
      { title: 'Transfers between France and Israel', html: `<p>We operate in France and in Israel. Israel benefits from a European Commission adequacy decision recognizing an equivalent level of protection, so your data can be transferred there without additional formalities. If a provider is located elsewhere, we frame the transfer with the European Commission’s standard contractual clauses or an equivalent mechanism.</p>` },
      { title: 'Your rights (GDPR)', html: `<p>At any time, you can access your data, correct it, erase it, restrict its use, object to its processing, request its portability, withdraw your consent and set instructions for what happens to it after your death. Write to <a href="mailto:{privacyContact}">{privacyContact}</a>: we reply within one month.</p>
<p>You can also lodge a complaint with the CNIL, the French data protection authority (<a href="https://www.cnil.fr" rel="noopener">cnil.fr</a>).</p>` },
      { title: 'If you live in Israel', html: `<p>We comply with the Israeli Privacy Protection Law (5741-1981), as amended in particular by Amendment 13, and its data security regulations. You can review the information we hold about you, ask for it to be corrected or deleted, and find out what it is used for. You can also contact the Privacy Protection Authority (הרשות להגנת הפרטיות).</p>` },
      { title: 'Security', html: `<p>Encrypted connection (HTTPS), access limited to the people who need it, providers chosen for their security guarantees: we protect your data the way we’d want ours protected.</p>` },
      { title: 'Updates', html: `<p>We may update this policy. The date of the last update appears at the top of this page.</p>` }
    ]
  },

  cookies: {
    title: 'Cookie policy',
    intro: 'No hidden advertising, no needless tracking: here are the trackers used on fortydays.com and how to manage your choices.',
    sections: [
      { title: 'What is a tracker?', html: `<p>A tracker (a cookie or local storage) is a small file or piece of data saved by your browser when you visit a website. Some are essential for the site to work; others require your consent.</p>` },
      { title: 'The trackers we use', html: `<div class="table-wrap" role="region" tabindex="0" aria-label="Trackers in use"><table>
<thead><tr><th scope="col">Name</th><th scope="col">Purpose</th><th scope="col">Duration</th><th scope="col">Category</th></tr></thead>
<tbody>
<tr><td><code>fd-consent</code></td><td>Remembers your cookie choices</td><td>6 months</td><td>Necessary</td></tr>
<tr><td><code>fd-lang</code></td><td>Remembers your chosen language</td><td>Until deleted</td><td>Necessary</td></tr>
<tr><td><code>fd-draft-…</code></td><td>Keeps what you typed in a form if the page reloads (session storage)</td><td>Until you close the tab</td><td>Necessary</td></tr>
</tbody></table></div>
<p>At present, no analytics or advertising tool is installed. If one were added, it would only be enabled with your consent, under the “Analytics” and “Marketing” categories.</p>` },
      { title: 'Third-party content', html: `<p>To display typefaces and photographs, your browser contacts the servers of Google Fonts and Unsplash, which receive your IP address. These services do not set cookies through our site.</p>` },
      { title: 'Managing your choices', html: `<p>You can change your choices at any time:</p>
<p>{manageCookies}</p>
<p>You can also delete trackers from your browser settings.</p>` },
      { title: 'How long your consent lasts', html: `<p>Your choices are kept for 6 months. After that, we ask you again.</p>` }
    ]
  }
};
