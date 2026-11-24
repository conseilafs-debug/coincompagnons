// Configuration centrale du site. Modifiez ce fichier (ou les variables d'environnement) pour personnaliser.

export const SITE = {
  name: 'Le Coin des Compagnons',
  tagline: 'Tout pour mieux comprendre et prendre soin de votre animal',
  subtitle: 'Guides, fiches races, calculateurs gratuits et conseils pratiques pour chiens, chats et animaux de compagnie.',
  // URL publique du site. À remplacer par le nom de domaine définitif : SITE_URL=https://mon-domaine.fr npm run build
  url: (process.env.SITE_URL || 'https://coincompagnons.pages.dev').replace(/\/$/, ''),
  buildDate: process.env.BUILD_DATE || new Date().toISOString().slice(0, 10),
  locale: 'fr_FR',
  // AdSense : renseigner l'identifiant éditeur uniquement lorsque le compte est validé ET qu'un système de consentement est en place.
  // Tant que ADSENSE_PUBLISHER_ID est vide, aucun script publicitaire n'est chargé et les emplacements restent masqués.
  adsense: {
    publisherId: process.env.ADSENSE_PUBLISHER_ID || '', // ex. ca-pub-XXXXXXXXXXXXXXXX (à fournir par le propriétaire)
    slots: { // identifiants de blocs d'annonces créés dans AdSense (optionnels : sinon annonces automatiques de l'emplacement)
      'in-article': process.env.ADSENSE_SLOT_IN_ARTICLE || '',
      'after-tool': process.env.ADSENSE_SLOT_AFTER_TOOL || '',
      'before-faq': process.env.ADSENSE_SLOT_BEFORE_FAQ || '',
      'between-sections': process.env.ADSENSE_SLOT_BETWEEN || '',
    },
  },
  // Informations légales à compléter par l'éditeur avant toute mise en production sous nom de domaine.
  legal: {
    editeur: process.env.LEGAL_EDITEUR || 'Athéna Office',
    statut: process.env.LEGAL_STATUT || 'Micro-entreprise (entrepreneur individuel), SIREN 105 858 328. Non assujettie à la TVA.',
    adresse: process.env.LEGAL_ADRESSE || '2 résidence Pierre Jacques, rue des Chardonnerets, 62600 Groffliers, France',
    email: process.env.LEGAL_EMAIL || 'contact@athena-office.fr',
    directeur: process.env.LEGAL_DIRECTEUR || 'Philippe Lesieur',
    hebergeur: 'Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, États-Unis (Cloudflare Pages)',
  },
};

export const ANIMALS = {
  chiens: {
    label: 'Chiens', singular: 'chien', plural: 'chiens', emoji: '🐶', path: '/chiens/',
    intro: 'Races, alimentation, santé, comportement, éducation et outils gratuits pour comprendre et accompagner votre chien, du chiot au senior.',
    sections: [
      ['races', 'Races de chiens', 'Fiches détaillées des principales races'],
      ['alimentation', 'Alimentation', 'Ration, repas, aliments permis et interdits'],
      ['sante', 'Santé', 'Prévention, parasites, vaccination, premiers réflexes'],
      ['comportement', 'Comportement', 'Comprendre ce que votre chien exprime'],
      ['education', 'Éducation et chiot', 'Propreté, socialisation, arrivée du chiot'],
      ['entretien', 'Entretien', 'Toilettage, soins, hygiène'],
      ['guides', 'Guides du quotidien', 'Sommeil, solitude, promenades, vie de tous les jours'],
      ['outils', 'Outils gratuits', 'Âge, poids, ration, gestation, croissance'],
      ['noms', 'Noms de chiens', 'Idées de noms et générateur'],
    ],
  },
  chats: {
    label: 'Chats', singular: 'chat', plural: 'chats', emoji: '🐱', path: '/chats/',
    intro: 'Races, alimentation, santé, comportement, entretien et outils gratuits pour comprendre et accompagner votre chat, du chaton au senior.',
    sections: [
      ['races', 'Races de chats', 'Fiches détaillées des principales races'],
      ['alimentation', 'Alimentation', 'Ration, repas, aliments permis et interdits'],
      ['sante', 'Santé', 'Prévention, parasites, vaccination, premiers réflexes'],
      ['comportement', 'Comportement', 'Comprendre ce que votre chat exprime'],
      ['education', 'Chaton et vie à la maison', 'Arrivée du chaton, litière, griffoir'],
      ['entretien', 'Entretien', 'Brossage, griffes, hygiène'],
      ['guides', 'Guides du quotidien', 'Sommeil, absences, déménagement'],
      ['outils', 'Outils gratuits', 'Âge, poids, ration, gestation, croissance'],
      ['noms', 'Noms de chats', 'Idées de noms et générateur'],
    ],
  },
};

export const SOON = {
  'petits-animaux': { label: 'Petits animaux', emoji: '🐰', items: ['Lapins', 'Hamsters', 'Cochons d’Inde', 'Furets'], text: 'Lapins, hamsters, cochons d’Inde et furets auront bientôt leurs fiches détaillées, leurs guides d’alimentation et leurs calendriers de soins.' },
  oiseaux: { label: 'Oiseaux', emoji: '🐦', items: ['Perruches', 'Perroquets', 'Canaris', 'Calopsittes'], text: 'Perruches, perroquets, canaris et calopsittes : fiches espèces, alimentation et aménagement de la volière arrivent bientôt.' },
  aquarium: { label: 'Aquarium', emoji: '🐠', items: ['Poissons', 'Aquarium', 'Eau', 'Entretien', 'Alimentation'], text: 'Choix des poissons, qualité de l’eau, cycle de l’azote et entretien : le dossier aquarium est en préparation.' },
  reptiles: { label: 'Reptiles', emoji: '🦎', items: ['Tortues', 'Geckos', 'Serpents', 'Lézards'], text: 'Tortues, geckos, serpents et lézards : fiches espèces, terrarium, chaleur et alimentation sont en préparation.' },
};
