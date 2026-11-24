import { DOG_GROWTH, CAT_GROWTH, fractionAt } from '../assets/calc.js';
import { table } from '../lib/html.mjs';

const nai = { id: 'naissance', label: 'Date de naissance', type: 'date', required: true };
const ref = { id: 'reference', label: 'Date de calcul', type: 'date', value: 'today' };

// Pseudo-outils pour les calendriers interactifs (non listés dans la bibliothèque d'outils)
export const CAL_TOOLS = [
  { id: 'calendrier-chiot', fields: [nai, ref] },
  { id: 'calendrier-chaton', fields: [nai, ref] },
];

const weeks = [8, 10, 12, 14, 16, 20, 24, 30, 36, 44, 52];
const growthTable = (kind) => {
  const tables = kind === 'chiot' ? DOG_GROWTH : CAT_GROWTH;
  const keys = Object.keys(tables);
  const labels = { petit: 'Petit chien', moyen: 'Chien moyen', grand: 'Grand chien', geant: 'Chien géant', standard: 'Chat standard', grand_c: 'Grande race' };
  return table({ caption: `Part du poids adulte attendue selon l’âge (${kind === 'chiot' ? 'chiot' : 'chaton'}) — à imprimer`, head: ['Âge', ...keys.map((k) => labels[k === 'grand' && kind === 'chaton' ? 'grand_c' : k]), 'Poids relevé (kg)', 'Date'], rows: weeks.map((w) => [`${w} semaines`, ...keys.map((k) => `${Math.round(fractionAt(tables[k], w) * 100)} %`), '&nbsp;', '&nbsp;']) });
};
const mealsTable = () => table({ caption: 'Suivi hebdomadaire des repas — à imprimer', head: ['Jour', 'Matin (g)', 'Midi (g)', 'Soir (g)', 'Friandises', 'Eau changée ?'], rows: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((d) => [d, '&nbsp;', '&nbsp;', '&nbsp;', '&nbsp;', '☐']) });
const adultTable = () => table({ caption: 'Rappels de suivi d’un chien ou d’un chat adulte (repères)', head: ['Soin', 'Fréquence indicative', 'À préciser avec le vétérinaire'], rows: [['Visite de contrôle', 'Au moins 1 fois par an (2 fois par an pour les seniors)', 'Poids, dents, cœur, articulations, peau'], ['Vaccins de rappel', 'Généralement chaque année ou tous les 3 ans selon la valence', 'Vaccins et rythme selon le mode de vie'], ['Vermifugation', 'Souvent 2 à 4 fois par an', 'Produit, dose et fréquence'], ['Antiparasitaires externes (puces, tiques)', 'Selon le produit, souvent mensuel ou trimestriel, surtout du printemps à l’automne', 'Produit adapté à l’espèce et au poids'], ['Soins dentaires', 'Brossage régulier, détartrage selon avis', 'Fréquence du contrôle dentaire'], ['Bilan sanguin', 'À partir de 7 ans environ, chaque année', 'Contenu du bilan']] });

export const CALENDARS = [
  { slug: 'calendrier-vaccination-chiot', tool: 'calendrier-chiot', animal: 'chiens', title: 'Calendrier du chiot : vaccins et vermifuges', h1: 'Calendrier de vaccination et de soins du chiot',
    card: 'Dates repères des vaccins et vermifuges, à partir de la naissance.',
    desc: 'Calculez les dates repères des vaccins, vermifuges et bilans de votre chiot à partir de sa date de naissance. Repères, à valider avec votre vétérinaire.',
    intro: 'Entrez la date de naissance de votre chiot : le calendrier indique les grandes étapes (vermifuges, primo-vaccination, rappels, bilan des 6 mois).',
    blocks: [{ h: 'Les grandes étapes de la première année', p: ['La primo-vaccination commence généralement à 8 semaines, avec une seconde injection 3 à 4 semaines plus tard. Un premier rappel est fait environ un an après, puis les rappels suivent un rythme défini par le vétérinaire selon les vaccins utilisés.', 'En France, l’identification par puce électronique est obligatoire pour les chiens : elle doit être faite avant la cession d’un chiot, et au plus tard à 4 mois. Un chiot ne doit pas être cédé avant 8 semaines.', 'Les vermifuges se font souvent à intervalles rapprochés chez le chiot (toutes les 2 semaines puis chaque mois jusqu’à 6 mois selon les protocoles), puis plusieurs fois par an à l’âge adulte.'] },
      { h: 'Avant la fin de la primo-vaccination', p: ['Tant que le schéma vaccinal n’est pas complet, le chiot reste vulnérable à des maladies graves. Demandez à votre vétérinaire quand sortir votre chiot et avec quelles précautions, notamment pour le contact avec des chiens inconnus et les lieux très fréquentés.'] }],
    faq: [['Et si j’ai manqué une date ?', 'Contactez votre vétérinaire : selon le retard, il pourra reprendre le protocole ou ajouter une injection.'], ['Les dates sont-elles exactes ?', 'Ce sont des repères généraux. Le calendrier réel dépend des produits utilisés et de l’état de santé du chiot.']] },
  { slug: 'calendrier-vaccination-chaton', tool: 'calendrier-chaton', animal: 'chats', title: 'Calendrier du chaton : vaccins et vermifuges', h1: 'Calendrier de vaccination et de soins du chaton',
    card: 'Dates repères des vaccins et vermifuges du chaton.',
    desc: 'Calculez les dates repères des vaccins, vermifuges et bilans de votre chaton à partir de sa date de naissance. Repères à valider avec votre vétérinaire.',
    intro: 'Entrez la date de naissance de votre chaton : le calendrier indique les étapes clés de sa première année.',
    blocks: [{ h: 'Les grandes étapes de la première année', p: ['La primo-vaccination du chaton commence généralement vers 8 semaines (typhus, coryza, calicivirose, et leucose selon le mode de vie), avec une seconde injection 3 à 4 semaines plus tard, puis un rappel à un an.', 'En France, l’identification par puce est obligatoire pour les chats : avant la cession, ou à partir de 7 mois. La stérilisation se discute avec le vétérinaire, souvent entre 5 et 7 mois selon les cas.'] }],
    faq: [['Un chat d’intérieur doit-il être vacciné ?', 'Souvent oui : certains virus se transmettent par l’air ou par les vêtements, et la vaccination peut être exigée en pension. Votre vétérinaire évalue avec vous le protocole adapté.']] },
  { slug: 'calendrier-veterinaire-adulte', animal: 'general', title: 'Calendrier vétérinaire du chien et du chat adultes', h1: 'Calendrier vétérinaire : suivi du chien et du chat adultes',
    card: 'Rappels annuels, vermifuges, antiparasitaires, bilans.',
    desc: 'Repères de suivi vétérinaire du chien et du chat adultes : visite annuelle, rappels de vaccins, vermifugation, antiparasitaires, bilan senior.',
    intro: 'Un tableau de repères pour organiser le suivi d’un animal adulte, et un calculateur de dates pour programmer vos rappels.',
    blocks: [{ h: 'Organiser les rappels', p: ['Notez la date de chaque soin dans le carnet de santé et programmez le suivant dès la visite. Le <a href="/outils/calculateur-de-dates/">calculateur de dates</a> liste les prochaines échéances à partir d’un intervalle (par exemple 3 mois pour un vermifuge, 1 an pour un rappel).'] }],
    html: adultTable,
    faq: [['Quel antiparasitaire choisir ?', 'Seul votre vétérinaire peut recommander un produit adapté à l’espèce, au poids et au mode de vie. Certains produits pour chien sont toxiques pour le chat : ne les échangez jamais.']] },
  { slug: 'suivi-du-poids', tracker: 'animal', animal: 'general', title: 'Suivi du poids de votre animal : courbe en ligne', h1: 'Suivi du poids de votre animal',
    card: 'Enregistrez les pesées et visualisez la courbe (données sur votre appareil).',
    desc: 'Suivez le poids de votre chien ou chat : ajoutez vos pesées, visualisez la courbe d’évolution et imprimez le tableau. Données stockées dans votre navigateur.',
    intro: 'Ajoutez une pesée à chaque fois : le tableau et la courbe se mettent à jour. Vos données restent sur votre appareil.',
    blocks: [{ h: 'Pourquoi suivre le poids ?', p: ['Le poids est l’un des meilleurs indicateurs de santé : une prise ou une perte régulière précède souvent un problème. Pesez toujours dans les mêmes conditions (même balance, à jeun ou à heure fixe). Pour un petit animal, pesez-vous avec puis sans lui.', 'Une variation de plus de 5 à 10 % en quelques semaines, sans changement de ration, justifie de contacter votre vétérinaire.'] }],
    faq: [['Mes données sont-elles envoyées quelque part ?', 'Non. Elles sont enregistrées uniquement dans le stockage de votre navigateur et peuvent être effacées à tout moment.']] },
  { slug: 'suivi-de-croissance', animal: 'general', title: 'Suivi de croissance chiot et chaton : tableau à imprimer', h1: 'Suivi de croissance du chiot et du chaton',
    card: 'Tableaux imprimables : part du poids adulte attendue à chaque âge.',
    desc: 'Tableaux imprimables de suivi de croissance du chiot (par taille) et du chaton : poids relevé et part du poids adulte attendue à chaque âge.',
    intro: 'Imprimez ces tableaux, notez le poids toutes les 2 à 4 semaines et comparez-le à la part du poids adulte attendue.',
    blocks: [{ h: 'Mode d’emploi', p: ['Multipliez le poids adulte attendu par le pourcentage de la ligne correspondant à l’âge. Par exemple, un chien moyen de 20 kg adulte devrait peser environ 9 kg à 16 semaines (45 %). Ce sont des moyennes : l’important est une courbe régulière.'] }],
    html: () => `<h2>Chiot</h2>${growthTable('chiot')}<h2>Chaton</h2>${growthTable('chaton')}`,
    faq: [['Mon chiot est en dessous de la courbe, que faire ?', 'Parlez-en à votre vétérinaire : il vérifiera l’appétit, les vermifuges et l’état général. Ne modifiez pas la ration sans avis.']] },
  { slug: 'suivi-des-repas', animal: 'general', title: 'Suivi des repas de votre animal : tableau à imprimer', h1: 'Suivi des repas : tableau hebdomadaire à imprimer',
    card: 'Tableau imprimable des repas, friandises et eau.',
    desc: 'Tableau imprimable pour suivre les repas, les friandises et l’eau de votre chien ou chat : idéal pour partager la ration dans la famille.',
    intro: 'Un tableau simple à imprimer et à afficher sur le frigo pour que toute la famille donne la bonne quantité, et une seule fois.',
    blocks: [{ h: 'À quoi sert-il ?', p: ['Quand plusieurs personnes nourrissent l’animal, les doubles repas sont fréquents. Noter la quantité en grammes et les friandises évite le surpoids. Calculez d’abord la ration avec notre <a href="/chiens/outils/ration-alimentaire-du-chien/">calculateur de ration du chien</a> ou celui du <a href="/chats/outils/ration-alimentaire-du-chat/">chat</a>.'] }],
    html: mealsTable,
    faq: [['Combien de friandises par jour ?', 'Moins de 10 % des calories journalières, et à retirer de la ration du jour.']] },
];
