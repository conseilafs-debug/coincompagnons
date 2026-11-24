// calc.js — moteur de calcul (fonctions pures, sans dépendance).
// Utilisé dans le navigateur (import ES module) et par les tests Node.
// Tous les résultats sont des ESTIMATIONS indicatives : ils ne remplacent pas l'avis d'un vétérinaire.

const MS = 86400000;

/* ---------- Dates ---------- */
export function parseDate(s) {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}
export function toISO(dt) { return dt.toISOString().slice(0, 10); }
export function todayUTC() {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}
export function fmtDate(dt) {
  return dt.toLocaleDateString('fr-FR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
export function fmtDateShort(dt) {
  return dt.toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
}
export function addDays(dt, n) { return new Date(dt.getTime() + n * MS); }
export function diffDays(a, b) { return Math.round((b.getTime() - a.getTime()) / MS); }
function daysInMonth(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
export function addMonths(dt, n) {
  const total = dt.getUTCFullYear() * 12 + dt.getUTCMonth() + n;
  const y = Math.floor(total / 12), m = total - y * 12;
  return new Date(Date.UTC(y, m, Math.min(dt.getUTCDate(), daysInMonth(y, m))));
}

// Âge calendaire entre deux dates (birth <= ref)
export function ageBetween(birth, ref) {
  let months = (ref.getUTCFullYear() - birth.getUTCFullYear()) * 12 + (ref.getUTCMonth() - birth.getUTCMonth());
  let anchor = addMonths(birth, months);
  if (anchor > ref) { months--; anchor = addMonths(birth, months); }
  const days = diffDays(anchor, ref);
  const totalDays = diffDays(birth, ref);
  return { years: Math.floor(months / 12), months: months % 12, days, totalMonths: months, totalDays, decimalYears: totalDays / 365.25 };
}

const pl = (n, one, many) => `${n} ${n > 1 ? many : one}`;
export function fmtAge(a) {
  const parts = [];
  if (a.years) parts.push(pl(a.years, 'an', 'ans'));
  if (a.months) parts.push(pl(a.months, 'mois', 'mois'));
  if (a.days || !parts.length) parts.push(pl(a.days, 'jour', 'jours'));
  return parts.length > 1 ? parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1] : parts[0];
}
export function fmtYears(y) {
  const whole = Math.floor(y + 1e-9);
  const months = Math.round((y - whole) * 12);
  if (months === 12) return pl(whole + 1, 'an', 'ans');
  if (!whole) return pl(months, 'mois', 'mois');
  return months ? `${pl(whole, 'an', 'ans')} et ${pl(months, 'mois', 'mois')}` : pl(whole, 'an', 'ans');
}
const nf = (n, d = 1) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: d });
export const fmtNum = nf;

/* ---------- Âge humain équivalent ---------- */
export const DOG_RATE = { petit: 4, moyen: 5, grand: 6, geant: 7 };
export const DOG_SIZE_LABEL = { petit: 'petit (moins de 10 kg)', moyen: 'moyen (10 à 25 kg)', grand: 'grand (25 à 45 kg)', geant: 'géant (plus de 45 kg)' };

// Méthode par paliers : 1re année = 15, 2e année = +9, puis +4/5/6/7 par an selon la taille.
export function dogHumanAge(ageYears, size) {
  const r = DOG_RATE[size] || 5;
  if (ageYears <= 1) return 15 * ageYears;
  if (ageYears <= 2) return 15 + 9 * (ageYears - 1);
  return 24 + r * (ageYears - 2);
}
export function dogAgeFromHuman(h, size) {
  const r = DOG_RATE[size] || 5;
  if (h <= 15) return h / 15;
  if (h <= 24) return 1 + (h - 15) / 9;
  return 2 + (h - 24) / r;
}
// Formule épigénétique (Wang et al., 2020, établie sur des Labradors) : 16 × ln(âge) + 31
export function dogHumanAgeEpigenetic(ageYears) {
  if (ageYears < 0.5) return null;
  return 16 * Math.log(ageYears) + 31;
}
export function catHumanAge(ageYears) {
  if (ageYears <= 1) return 15 * ageYears;
  if (ageYears <= 2) return 15 + 9 * (ageYears - 1);
  return 24 + 4 * (ageYears - 2);
}
export function catAgeFromHuman(h) {
  if (h <= 15) return h / 15;
  if (h <= 24) return 1 + (h - 15) / 9;
  return 2 + (h - 24) / 4;
}

// Espérances de vie indicatives (années) : [min, max]
export const DOG_LIFE = { petit: [13, 16], moyen: [11, 14], grand: [10, 12], geant: [8, 10] };
export const CAT_LIFE = { interieur: [13, 18], exterieur: [9, 14] };
export const SPECIES = {
  chien: { label: 'Chien', life: null },
  chat: { label: 'Chat', life: null },
  lapin: { label: 'Lapin', life: [8, 10] },
  hamster: { label: 'Hamster', life: [2, 3] },
  cobaye: { label: "Cochon d'Inde", life: [5, 7] },
  furet: { label: 'Furet', life: [6, 9] },
  perruche: { label: 'Perruche ondulée', life: [7, 10] },
  calopsitte: { label: 'Calopsitte', life: [12, 18] },
  canari: { label: 'Canari', life: [8, 12] },
};
const HUMAN_REF = 80;
function propHumanAge(ageYears, life) { return (ageYears / ((life[0] + life[1]) / 2)) * HUMAN_REF; }
function propAgeFromHuman(h, life) { return (h / HUMAN_REF) * ((life[0] + life[1]) / 2); }

export function dogStage(ageYears, size) {
  const mat = { petit: 0.85, moyen: 1, grand: 1.5, geant: 2 }[size] ?? 1;
  const senior = { petit: 10, moyen: 8, grand: 7, geant: 6 }[size] ?? 8;
  const old = { petit: 14, moyen: 12, grand: 10, geant: 8.5 }[size] ?? 12;
  if (ageYears < mat) return 'Chiot / jeune en croissance';
  if (ageYears < 2) return 'Jeune adulte';
  if (ageYears < senior) return 'Adulte';
  if (ageYears < old) return 'Senior';
  return 'Grand âge';
}
export function catStage(ageYears) {
  if (ageYears < 0.5) return 'Chaton';
  if (ageYears < 2) return 'Junior';
  if (ageYears < 7) return 'Adulte';
  if (ageYears < 11) return 'Mature';
  if (ageYears < 15) return 'Senior';
  return 'Grand senior';
}

/* ---------- Croissance ---------- */
// Part approximative du poids adulte atteinte à un âge donné (en semaines). Ordres de grandeur moyens.
export const DOG_GROWTH = {
  petit: [[8, .24], [12, .40], [16, .54], [26, .80], [39, .93], [52, 1]],
  moyen: [[8, .20], [12, .35], [16, .45], [26, .68], [39, .85], [52, .95], [65, 1]],
  grand: [[8, .14], [12, .25], [16, .36], [26, .58], [39, .78], [52, .90], [78, .98], [104, 1]],
  geant: [[8, .09], [12, .18], [16, .28], [26, .48], [39, .68], [52, .82], [78, .93], [104, .98], [130, 1]],
};
export const CAT_GROWTH = {
  standard: [[8, .25], [12, .38], [16, .52], [26, .72], [39, .87], [52, .95], [65, 1]],
  grand: [[8, .18], [12, .28], [16, .38], [26, .55], [39, .70], [52, .80], [78, .90], [104, .95], [156, .99], [208, 1]],
};
export function fractionAt(table, weeks) {
  if (weeks <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (weeks <= table[i][0]) {
      const [w0, f0] = table[i - 1], [w1, f1] = table[i];
      return f0 + ((f1 - f0) * (weeks - w0)) / (w1 - w0);
    }
  }
  return 1;
}
export function toWeeks(value, unit) { return unit === 'mois' ? value * 4.345 : value; }

/* ---------- Énergie ---------- */
export function rer(kg) { return 70 * Math.pow(kg, 0.75); }
export const DOG_FACTORS = [
  ['chiot-4m', 'Chiot de moins de 4 mois', 3.0],
  ['chiot', 'Chiot de 4 mois à l’âge adulte', 2.0],
  ['sterilise', 'Adulte stérilisé, activité normale', 1.6],
  ['entier', 'Adulte non stérilisé, activité normale', 1.8],
  ['inactif', 'Adulte peu actif ou prédisposé au surpoids / senior sédentaire', 1.4],
  ['actif', 'Adulte très actif (sport, travail régulier)', 2.5],
  ['perte', 'Perte de poids encadrée (sur le poids idéal)', 1.0],
];
export const CAT_FACTORS = [
  ['chaton-4m', 'Chaton de moins de 4 mois', 3.0],
  ['chaton', 'Chaton de 4 à 12 mois', 2.5],
  ['sterilise', 'Adulte stérilisé, activité normale', 1.2],
  ['entier', 'Adulte non stérilisé, activité normale', 1.4],
  ['inactif', 'Adulte sédentaire ou prédisposé au surpoids', 1.0],
  ['perte', 'Perte de poids encadrée (sur le poids idéal)', 0.8],
];
function factorOf(list, key) { const f = list.find((x) => x[0] === key); return f ? f : null; }

function needNumber(v, label, { min = 0, max = Infinity, strict = true } = {}) {
  const n = Number(String(v ?? '').replace(',', '.'));
  if (v === '' || v == null || !Number.isFinite(n)) return { error: `Indiquez ${label}.` };
  if ((strict && n <= min) || (!strict && n < min)) return { error: `${label[0].toUpperCase() + label.slice(1)} doit être supérieur${strict ? '' : ' ou égal'} à ${nf(min)}.` };
  if (n > max) return { error: `${label[0].toUpperCase() + label.slice(1)} semble trop élevé (maximum ${nf(max)}). Vérifiez la valeur saisie.` };
  return { n };
}

/* ---------- Gestation ---------- */
export const GEST = {
  chien: { jours: 63, mini: 58, maxi: 68, label: 'chienne',
    jalons: [[21, 'Implantation des embryons (gestation encore invisible)'], [28, 'Échographie possible pour confirmer la gestation (à partir de ≈ 25-30 jours)'], [45, 'Une radiographie peut permettre de compter les chiots (≈ 45 jours et plus, à décider avec le vétérinaire)'], [52, 'Préparer l’espace de mise bas et rédiger la liste des urgences'], [58, 'Début de la fenêtre de mise bas : surveillance rapprochée']] },
  chat: { jours: 65, mini: 62, maxi: 68, label: 'chatte',
    jalons: [[15, 'Échographie possible dès ≈ 15-21 jours'], [30, 'Le ventre commence à s’arrondir, les mamelles rosissent'], [45, 'Une radiographie peut permettre de compter les chatons (≈ 45 jours et plus, avis vétérinaire)'], [55, 'Préparer le nid (caisse calme, tiède, à l’écart) et la liste des urgences'], [62, 'Début de la fenêtre de mise bas : surveillance rapprochée']] },
};

/* ---------- Résultats ---------- */
const ok = (o) => ({ ok: true, ...o });
const err = (e) => ({ ok: false, error: e });
const DISC = 'Estimation indicative : elle ne remplace pas l’avis d’un vétérinaire.';

function ageResult(species, v) {
  const birth = parseDate(v.naissance);
  if (!birth) return err('Indiquez une date de naissance valide.');
  const ref = parseDate(v.reference) || todayUTC();
  if (birth > ref) return err('La date de naissance doit être antérieure à la date de calcul.');
  const a = ageBetween(birth, ref);
  return { a, birth, ref };
}

function dogAgeResult(v, detailed) {
  const r = ageResult('chien', v);
  if (r.ok === false) return r;
  const { a } = r;
  const size = v.taille || 'moyen';
  const h = dogHumanAge(a.decimalYears, size);
  const e = dogHumanAgeEpigenetic(a.decimalYears);
  const rows = [
    { label: 'Âge réel', value: fmtAge(a), strong: true },
    { label: 'Âge en années', value: `${nf(a.decimalYears, 2)} an${a.decimalYears >= 2 ? 's' : ''}` },
    { label: 'Âge en mois', value: `${a.totalMonths} mois` },
    { label: 'Âge approximatif équivalent humain', value: `≈ ${Math.round(h)} ans`, note: `Méthode par taille (${DOG_SIZE_LABEL[size]})` },
  ];
  if (e != null) rows.push({ label: 'Autre repère : formule épigénétique', value: `≈ ${Math.round(e)} ans`, note: 'Formule établie sur des Labradors, donnée à titre de comparaison' });
  rows.push({ label: 'Stade de vie', value: dogStage(a.decimalYears, size) });
  const out = { rows, notes: [DISC] };
  if (detailed) out.notes.unshift(`Calcul : première année = 15 ans humains, deuxième année = +9 ans, puis +${DOG_RATE[size]} ans humains par année de chien pour un chien ${DOG_SIZE_LABEL[size]}.`);
  return ok(out);
}

function catAgeResult(v) {
  const r = ageResult('chat', v);
  if (r.ok === false) return r;
  const { a } = r;
  const h = catHumanAge(a.decimalYears);
  return ok({
    rows: [
      { label: 'Âge réel', value: fmtAge(a), strong: true },
      { label: 'Âge en années', value: `${nf(a.decimalYears, 2)} an${a.decimalYears >= 2 ? 's' : ''}` },
      { label: 'Âge en mois', value: `${a.totalMonths} mois` },
      { label: 'Équivalent humain approximatif', value: `≈ ${Math.round(h)} ans` },
      { label: 'Stade de vie', value: catStage(a.decimalYears) },
    ],
    notes: ['Calcul : 1 an de chat ≈ 15 ans humains, 2 ans ≈ 24 ans, puis environ 4 ans humains par année de chat. ' + DISC],
  });
}

function ageFromYM(v) {
  const y = Number(String(v.annees ?? '0').replace(',', '.')) || 0;
  const m = Number(String(v.mois ?? '0').replace(',', '.')) || 0;
  if (y < 0 || m < 0) return err('L’âge ne peut pas être négatif.');
  const t = y + m / 12;
  if (t <= 0) return err('Indiquez un âge supérieur à zéro (années et/ou mois).');
  if (t > 35) return err('Cet âge semble trop élevé. Vérifiez la valeur saisie.');
  return { t };
}

function energyResult(animal, v, mode) {
  const w = needNumber(v.poids, 'le poids de l’animal (en kg)', { max: animal === 'chien' ? 120 : 15 });
  if (w.error) return err(w.error);
  const list = animal === 'chien' ? DOG_FACTORS : CAT_FACTORS;
  const f = factorOf(list, v.situation) || factorOf(list, 'sterilise');
  const R = rer(w.n);
  const mer = R * f[2];
  const rows = [];
  if (mode === 'kcal') {
    rows.push({ label: 'Besoin énergétique de base (RER)', value: `${Math.round(R)} kcal/jour`, note: '70 × poids^0,75' });
    rows.push({ label: `Besoin énergétique d’entretien (× ${nf(f[2], 1)})`, value: `${Math.round(mer)} kcal/jour`, strong: true });
    rows.push({ label: 'Fourchette pratique (±10 %)', value: `${Math.round(mer * 0.9)} à ${Math.round(mer * 1.1)} kcal/jour` });
    rows.push({ label: 'Par kilo de poids', value: `${nf(mer / w.n, 0)} kcal/kg/jour` });
    return ok({ rows, notes: ['Ajustez toutes les 2 à 3 semaines selon l’évolution du poids et de la silhouette. ' + DISC],
      tables: [{ caption: 'Coefficients utilisés selon la situation', head: ['Situation', 'Coefficient', 'kcal/jour pour ce poids'], rows: list.map((x) => [x[1], '× ' + nf(x[2], 1), String(Math.round(R * x[2]))]) }] });
  }
  const dens = needNumber(v.densite, 'l’énergie de l’aliment (kcal pour 100 g)', { min: 20, max: 700 });
  if (dens.error) return err(dens.error);
  const g = (mer / dens.n) * 100;
  const meals = Math.max(1, Math.round(Number(v.repas) || 2));
  rows.push({ label: 'Énergie à apporter', value: `≈ ${Math.round(mer)} kcal/jour` });
  rows.push({ label: 'Ration journalière', value: `≈ ${Math.round(g)} g/jour`, strong: true });
  rows.push({ label: `Soit par repas (${meals} repas)`, value: `≈ ${Math.round(g / meals)} g` });
  rows.push({ label: 'Fourchette pratique (±10 %)', value: `${Math.round(g * 0.9)} à ${Math.round(g * 1.1)} g/jour` });
  return ok({ rows, notes: ['Les friandises et restes comptent : retirez-les de la ration (idéalement moins de 10 % des calories). L’emballage de votre aliment prévaut s’il donne une table de rationnement adaptée à votre animal. ' + DISC] });
}

function waterResult(animal, v) {
  const lim = animal === 'chien' ? 120 : animal === 'lapin' ? 8 : 15;
  const w = needNumber(v.poids, 'le poids de l’animal (en kg)', { max: lim });
  if (w.error) return err(w.error);
  const base = { chien: [50, 60, 70], chat: [40, 50, 60], lapin: [50, 75, 100] }[animal];
  const foodShare = { sec: 0.08, mixte: 0.35, humide: 0.7, vert: 0.4 }[v.alimentation || 'sec'] ?? 0.08;
  const climate = v.climat === 'chaud' ? 1.25 : 1;
  const act = { calme: 0.9, normal: 1, actif: 1.2 }[v.activite || 'normal'] ?? 1;
  const f = climate * act;
  const tot = base.map((b) => b * w.n * f);
  const drink = tot.map((t) => t * (1 - foodShare));
  const rows = [
    { label: 'Besoin total en eau (boisson + aliment)', value: `${Math.round(tot[0])} à ${Math.round(tot[2])} ml/jour` },
    { label: 'Eau à boire (estimation)', value: `≈ ${Math.round(drink[1])} ml/jour`, strong: true, note: `Fourchette : ${Math.round(drink[0])} à ${Math.round(drink[2])} ml` },
    { label: 'Équivalent en verres de 25 cl', value: `≈ ${nf(drink[1] / 250, 1)} verres` },
  ];
  return ok({ rows, notes: ['L’eau doit rester disponible en permanence ; ces valeurs sont des repères. Une soif nettement augmentée ou diminuée pendant plusieurs jours justifie un avis vétérinaire. ' + DISC] });
}

function gestationCore(animal, v) {
  const g = GEST[animal];
  const m = parseDate(v.accouplement);
  if (!m) return err('Indiquez une date d’accouplement valide.');
  const ref = parseDate(v.reference) || todayUTC();
  return { g, m, ref };
}
function gestationResult(animal, v) {
  const c = gestationCore(animal, v);
  if (c.ok === false) return c;
  const { g, m, ref } = c;
  if (m > ref) return err('La date d’accouplement doit être antérieure à la date de calcul.');
  const days = diffDays(m, ref);
  if (days > g.maxi + 14) return err(`Plus de ${g.maxi + 14} jours se sont écoulés : vérifiez la date ou contactez votre vétérinaire.`);
  const due = addDays(m, g.jours);
  const left = g.jours - days;
  const pct = Math.min(100, Math.round((days / g.jours) * 100));
  const next = g.jalons.filter((j) => j[0] >= days).slice(0, 2);
  const rows = [
    { label: 'Jours écoulés depuis l’accouplement', value: `${days} jour${days > 1 ? 's' : ''}`, strong: true },
    { label: 'Semaine de gestation', value: days < 0 ? '—' : `semaine ${Math.floor(days / 7) + 1}` },
    { label: 'Avancement', value: `≈ ${pct} % de la durée moyenne (${g.jours} jours)` },
    { label: left >= 0 ? 'Jours restants (durée moyenne)' : 'Dépassement de la durée moyenne', value: `${Math.abs(left)} jour${Math.abs(left) > 1 ? 's' : ''}` },
    { label: 'Date moyenne de mise bas', value: fmtDate(due) },
  ];
  next.forEach((j) => rows.push({ label: `Repère à ≈ ${j[0]} jours`, value: j[1] }));
  const notes = [`Durée moyenne : ${g.jours} jours (de ${g.mini} à ${g.maxi} jours possibles). La date exacte de l’ovulation étant rarement connue, ces repères sont approximatifs. ${DISC}`];
  if (days > g.maxi) notes.unshift(`La fenêtre habituelle est dépassée (${g.maxi} jours) : contactez rapidement votre vétérinaire.`);
  return ok({ rows, notes });
}
function dueDateResult(animal, v) {
  const g = GEST[animal];
  const m = parseDate(v.accouplement);
  if (!m) return err('Indiquez une date d’accouplement valide.');
  const due = addDays(m, g.jours), from = addDays(m, g.mini), to = addDays(m, g.maxi);
  const rows = [
    { label: 'Date moyenne de mise bas', value: fmtDate(due), strong: true },
    { label: 'Fenêtre possible', value: `du ${fmtDateShort(from)} au ${fmtDateShort(to)}` },
  ];
  const prep = animal === 'chien'
    ? [[-14, 'Installer la caisse de mise bas dans un coin calme et la faire adopter'], [-10, 'Rassembler le matériel (serviettes, balance, carnet) et noter le numéro du vétérinaire de garde'], [-7, 'Selon l’avis du vétérinaire, suivre la température : une baisse nette annonce souvent une mise bas dans les 24 h'], [-3, 'Éviter les sorties longues, rester joignable']]
    : [[-14, 'Préparer un nid calme, tiède, à l’écart du passage'], [-10, 'Rassembler le matériel (serviettes, balance de cuisine, carnet) et noter le numéro du vétérinaire de garde'], [-5, 'Habituer la chatte à son nid, limiter les dérangements'], [-2, 'Rester disponible, surveiller appétit et comportement']];
  const tbl = { caption: 'Calendrier de préparation', head: ['Date', 'Repère'], rows: prep.map(([d, t]) => [fmtDateShort(addDays(due, d)), t]) };
  return ok({ rows, tables: [tbl], notes: [`Appelez votre vétérinaire sans attendre en cas de contractions fortes sans naissance, d’écoulement vert ou sanglant abondant avant la première naissance, d’abattement marqué ou si la date dépasse ${g.maxi} jours. ${DISC}`] });
}

function lifeResult(animal, v) {
  let life, label;
  if (animal === 'chien') { life = DOG_LIFE[v.taille || 'moyen']; label = `chien ${DOG_SIZE_LABEL[v.taille || 'moyen']}`; }
  else if (animal === 'chat') { life = CAT_LIFE[v.mode || 'interieur']; label = v.mode === 'exterieur' ? 'chat avec sorties libres' : 'chat d’intérieur'; }
  else { const s = SPECIES[v.espece || 'chien']; if (!s) return err('Choisissez une espèce.'); label = s.label.toLowerCase();
    life = s.life || (v.espece === 'chien' ? DOG_LIFE[v.taille || 'moyen'] : CAT_LIFE[v.mode || 'interieur']); }
  const rows = [{ label: `Espérance de vie typique (${label})`, value: `${life[0]} à ${life[1]} ans`, strong: true }];
  if (v.naissance) {
    const b = parseDate(v.naissance); if (!b) return err('Indiquez une date de naissance valide.');
    const ref = parseDate(v.reference) || todayUTC();
    if (b > ref) return err('La date de naissance doit être antérieure à la date de calcul.');
    const a = ageBetween(b, ref), mid = (life[0] + life[1]) / 2;
    rows.push({ label: 'Âge actuel', value: fmtAge(a) });
    rows.push({ label: 'Part de la vie typique déjà vécue', value: `≈ ${Math.min(100, Math.round((a.decimalYears / mid) * 100))} % (repère : ${mid} ans)` });
    if (a.decimalYears < life[0]) rows.push({ label: 'Marge restante dans la fourchette typique', value: `${nf(life[0] - a.decimalYears, 1)} à ${nf(life[1] - a.decimalYears, 1)} ans` });
    else rows.push({ label: 'Situation', value: a.decimalYears <= life[1] ? 'Vous êtes dans la fourchette haute typique : suivi vétérinaire régulier conseillé.' : 'Votre animal dépasse déjà la fourchette typique : un bel âge, à accompagner avec un suivi adapté.' });
  }
  return ok({ rows, notes: ['Il s’agit d’une moyenne de population : la génétique, le poids, la prévention et les soins pèsent lourd sur la durée de vie réelle. ' + DISC] });
}

function growthResult(kind, v) {
  const aw = needNumber(v.poids_adulte, 'le poids adulte attendu (en kg)', { max: kind === 'chat' ? 12 : 100 });
  if (aw.error) return err(aw.error);
  const ageN = needNumber(v.age, 'l’âge de l’animal', { max: 200 });
  if (ageN.error) return err(ageN.error);
  const wk = toWeeks(ageN.n, v.unite || 'semaines');
  if (wk < 8) return err('Cet outil est conçu à partir de 8 semaines (2 mois).');
  const table = kind === 'chat' ? CAT_GROWTH[v.categorie || 'standard'] : DOG_GROWTH[v.taille || 'moyen'];
  const f = fractionAt(table, wk);
  const est = aw.n * f;
  const rows = [
    { label: 'Poids attendu à cet âge', value: `≈ ${nf(est, 2)} kg`, strong: true, note: `Fourchette : ${nf(est * 0.85, 2)} à ${nf(est * 1.15, 2)} kg` },
    { label: 'Part du poids adulte déjà atteinte', value: `≈ ${Math.round(f * 100)} %` },
  ];
  const cur = Number(String(v.poids_actuel ?? '').replace(',', '.'));
  if (cur > 0) {
    const pos = cur < est * 0.85 ? 'en dessous de la fourchette attendue' : cur > est * 1.15 ? 'au-dessus de la fourchette attendue' : 'dans la fourchette attendue';
    rows.push({ label: `Votre animal (${nf(cur, 2)} kg)`, value: pos, note: pos.startsWith('dans') ? '' : 'À signaler à votre vétérinaire lors de la prochaine visite.' });
  }
  const marks = [8, 12, 16, 26, 39, 52, 78];
  const tbl = { caption: 'Courbe de croissance indicative', head: ['Âge', 'Part du poids adulte', 'Poids attendu'], rows: marks.map((w) => { const fr = fractionAt(table, w); return [w < 26 ? `${w} semaines` : `${Math.round(w / 4.345)} mois`, `${Math.round(fr * 100)} %`, `${nf(aw.n * fr, 2)} kg`]; }) };
  return ok({ rows, tables: [tbl], notes: ['Chaque individu grandit à son rythme, et la croissance dépend aussi de la race, du sexe et de l’alimentation. Suivez la silhouette autant que la balance. ' + DISC] });
}

function adultWeightResult(kind, v) {
  const cw = needNumber(v.poids_actuel, 'le poids actuel (en kg)', { max: kind === 'chat' ? 8 : 60 });
  if (cw.error) return err(cw.error);
  const ageN = needNumber(v.age, 'l’âge de l’animal', { max: 200 });
  if (ageN.error) return err(ageN.error);
  const wk = toWeeks(ageN.n, v.unite || 'semaines');
  if (wk < 8) return err('Cet outil est conçu à partir de 8 semaines (2 mois).');
  const table = kind === 'chat' ? CAT_GROWTH[v.categorie || 'standard'] : DOG_GROWTH[v.taille || 'moyen'];
  const f = fractionAt(table, wk);
  const est = cw.n / f;
  const lastW = table[table.length - 1][0];
  const rows = [
    { label: 'Poids adulte estimé', value: `≈ ${nf(est, 1)} kg`, strong: true, note: `Fourchette : ${nf(est * 0.85, 1)} à ${nf(est * 1.15, 1)} kg` },
    { label: 'Part du poids adulte supposée atteinte', value: `≈ ${Math.round(f * 100)} %` },
    { label: 'Âge de fin de croissance (repère)', value: fmtYears(lastW / 52.18) },
  ];
  const notes = [];
  if (wk > lastW) notes.push('L’animal a probablement atteint (ou presque) son poids adulte : sa valeur actuelle est la meilleure estimation.');
  if (wk < 16) notes.push('Avant 4 mois, l’estimation est très approximative : refaites le calcul à 4 et 6 mois.');
  notes.push('Si les parents sont connus, leur poids reste le meilleur indicateur. ' + DISC);
  return ok({ rows, notes });
}

function bodyWeightResult(animal, v) {
  const w = needNumber(v.poids, 'le poids actuel (en kg)', { max: animal === 'chien' ? 120 : 15 });
  if (w.error) return err(w.error);
  const b = Number(v.bcs);
  if (!(b >= 1 && b <= 9)) return err('Choisissez la note de condition corporelle (de 1 à 9).');
  let ideal, label;
  if (b >= 4 && b <= 5) { ideal = w.n; label = 'Dans la zone idéale'; }
  else if (b > 5) { ideal = w.n / (1 + 0.1 * (b - 5)); label = b === 6 ? 'Léger surpoids' : b === 7 ? 'Surpoids' : 'Obésité'; }
  else { ideal = w.n / (1 - 0.1 * (4.5 - b)); label = 'Trop maigre'; }
  const diff = ideal - w.n;
  const rows = [
    { label: 'Condition corporelle', value: `${b}/9 — ${label}` },
    { label: 'Poids idéal estimé', value: `≈ ${nf(ideal, 2)} kg`, strong: true },
  ];
  if (Math.abs(diff) > 0.05) rows.push({ label: diff < 0 ? 'Poids à perdre' : 'Poids à reprendre', value: `≈ ${nf(Math.abs(diff), 2)} kg` });
  if (diff < -0.05) {
    const rate = animal === 'chat' ? [0.005, 0.01] : [0.01, 0.02];
    rows.push({ label: 'Durée indicative d’un programme encadré', value: `${Math.ceil(-diff / (w.n * rate[1]))} à ${Math.ceil(-diff / (w.n * rate[0]))} semaines`, note: `Rythme prudent : ${animal === 'chat' ? '0,5 à 1 %' : '1 à 2 %'} du poids par semaine` });
  }
  const notes = ['Chaque point de la grille de 9 correspond à environ 10 % de poids au-dessus ou au-dessous de l’idéal : c’est un ordre de grandeur. ' + DISC];
  if (b >= 6 || b <= 3) notes.unshift(animal === 'chat' ? 'Chez le chat, une perte de poids trop rapide est dangereuse pour le foie : tout régime doit être mis en place avec le vétérinaire.' : 'Un changement de poids important doit être suivi avec le vétérinaire : il écarte une cause médicale et adapte la ration.');
  return ok({ rows, notes });
}

function mealFrequency(animal, v) {
  const ageN = ageFromYM(v);
  if (ageN.error) return err(ageN.error);
  const t = ageN.t, mo = t * 12;
  let n, tip, size = v.taille || 'moyen';
  if (animal === 'chien') {
    if (mo < 3) n = '4 repas'; else if (mo < 6) n = '3 repas'; else if (mo < (size === 'petit' ? 12 : 10)) n = '2 à 3 repas'; else n = '2 repas';
    tip = size === 'geant' || size === 'grand' ? 'Chez les grands et géants, répartissez la ration en plusieurs petits repas et évitez l’effort intense juste avant et après le repas.' : 'Les chiens de très petit format (jouets) gagnent à ne pas rester à jeun trop longtemps ; ne sautez pas de repas.';
  } else if (animal === 'chat') {
    if (mo < 3) n = '4 repas'; else if (mo < 6) n = '3 à 4 repas'; else if (mo < 12) n = '3 repas'; else n = '2 à 4 petits repas';
    tip = 'Le chat est un petit mangeur fréquent : plusieurs petits repas ou une distribution fractionnée collent mieux à son rythme naturel.';
  } else {
    n = mo < 6 ? 'granulés 2 fois par jour' : 'granulés 1 à 2 fois par jour';
    tip = 'Pour le lapin, le foin doit être disponible en permanence : c’est la base de l’alimentation. Les granulés sont mesurés, les légumes frais sont distribués chaque jour.';
  }
  const plan = { '4 repas': ['7 h', '12 h', '17 h', '21 h'], '3 repas': ['7 h', '14 h', '20 h'], '3 à 4 repas': ['7 h', '13 h', '18 h', '22 h'], '2 à 3 repas': ['7 h', '13 h', '19 h'], '2 repas': ['7 h 30', '18 h 30'], '2 à 4 petits repas': ['7 h', '12 h', '18 h', '22 h'] }[n] || ['8 h', '18 h'];
  return ok({
    rows: [{ label: 'Nombre de repas conseillé', value: n, strong: true }, { label: 'Exemple d’horaires', value: plan.join(' · ') }, { label: 'Conseil', value: tip }],
    notes: ['Gardez des horaires réguliers et adaptez-les à votre quotidien. Un changement d’appétit durable doit être signalé au vétérinaire. ' + DISC],
  });
}

/* ---------- Registre des outils ---------- */
export const TOOLS = {
  'chien-age-humain': (v) => {
    const a = ageFromYM(v); if (a.error) return err(a.error);
    const size = v.taille || 'moyen', h = dogHumanAge(a.t, size), e = dogHumanAgeEpigenetic(a.t);
    const rows = [{ label: 'Âge humain approximatif', value: `≈ ${Math.round(h)} ans`, strong: true, note: `Méthode par taille (${DOG_SIZE_LABEL[size]})` }];
    if (e != null) rows.push({ label: 'Formule épigénétique (repère)', value: `≈ ${Math.round(e)} ans` });
    rows.push({ label: 'Stade de vie', value: dogStage(a.t, size) });
    return ok({ rows, notes: [`Calcul : 15 ans la 1re année, +9 la 2e, puis +${DOG_RATE[size]} par an. ` + DISC],
      tables: [{ caption: `Équivalences pour un chien ${DOG_SIZE_LABEL[size]}`, head: ['Âge du chien', 'Équivalent humain'], rows: [1, 2, 3, 5, 7, 10, 12, 15].map((y) => [`${y} an${y > 1 ? 's' : ''}`, `≈ ${Math.round(dogHumanAge(y, size))} ans`]) }] });
  },
  'chien-age': (v) => dogAgeResult(v, true),
  'chiot-poids-adulte': (v) => adultWeightResult('chien', v),
  'chien-ration': (v) => energyResult('chien', v, 'grammes'),
  'chien-quantite-nourriture': (v) => quantityResult(v),
  'chien-calories': (v) => energyResult('chien', v, 'kcal'),
  'chienne-gestation': (v) => gestationResult('chien', v),
  'chienne-mise-bas': (v) => dueDateResult('chien', v),
  'chien-duree-vie': (v) => lifeResult('chien', v),
  'chien-eau': (v) => waterResult('chien', v),
  'chien-frequence-repas': (v) => mealFrequency('chien', v),
  'chiot-croissance': (v) => growthResult('chien', v),

  'chat-age-humain': (v) => {
    const a = ageFromYM(v); if (a.error) return err(a.error);
    return ok({ rows: [{ label: 'Âge humain approximatif', value: `≈ ${Math.round(catHumanAge(a.t))} ans`, strong: true }, { label: 'Stade de vie', value: catStage(a.t) }], notes: [DISC] ,
      tables: [{ caption: 'Équivalences chat / humain', head: ['Âge du chat', 'Équivalent humain'], rows: CAT_TABLE.map((y) => [`${y} an${y > 1 ? 's' : ''}`, `≈ ${Math.round(catHumanAge(y))} ans`]) }] });
  },
  'chat-age': (v) => catAgeResult(v),
  'chat-poids-ideal': (v) => bodyWeightResult('chat', v),
  'chat-ration': (v) => energyResult('chat', v, 'grammes'),
  'chat-calories': (v) => energyResult('chat', v, 'kcal'),
  'chat-eau': (v) => waterResult('chat', v),
  'chatte-gestation': (v) => gestationResult('chat', v),
  'chatte-mise-bas': (v) => dueDateResult('chat', v),
  'chaton-croissance': (v) => growthResult('chat', v),
  'chat-duree-vie': (v) => lifeResult('chat', v),

  'animal-age': (v) => {
    const sp = v.espece || 'chien';
    if (sp === 'chien') return dogAgeResult(v, false);
    if (sp === 'chat') return catAgeResult(v);
    const r = ageResult(sp, v); if (r.ok === false) return r;
    const s = SPECIES[sp], h = propHumanAge(r.a.decimalYears, s.life);
    return ok({ rows: [{ label: 'Âge réel', value: fmtAge(r.a), strong: true }, { label: 'Âge en mois', value: `${r.a.totalMonths} mois` }, { label: 'Équivalent humain approximatif', value: `≈ ${Math.round(h)} ans`, note: `Méthode proportionnelle (durée de vie typique ${s.life[0]}-${s.life[1]} ans)` }],
      notes: ['Pour les espèces autres que le chien et le chat, l’équivalence est une simple proportion avec l’espérance de vie : elle donne un ordre d’idée. ' + DISC] });
  },
  'convertisseur-age-animal-humain': (v) => {
    const sp = v.espece || 'chien', dir = v.sens || 'animal';
    const val = needNumber(v.age, dir === 'animal' ? 'l’âge de l’animal (en années)' : 'l’âge humain (en années)', { max: 120 });
    if (val.error) return err(val.error);
    const size = v.taille || 'moyen';
    if (dir === 'animal') {
      const h = sp === 'chien' ? dogHumanAge(val.n, size) : sp === 'chat' ? catHumanAge(val.n) : propHumanAge(val.n, SPECIES[sp].life);
      return ok({ rows: [{ label: `${SPECIES[sp].label} de ${nf(val.n, 1)} an(s)`, value: `≈ ${Math.round(h)} ans en âge humain`, strong: true }], notes: [DISC] });
    }
    const a = sp === 'chien' ? dogAgeFromHuman(val.n, size) : sp === 'chat' ? catAgeFromHuman(val.n) : propAgeFromHuman(val.n, SPECIES[sp].life);
    return ok({ rows: [{ label: `Humain de ${nf(val.n, 0)} ans`, value: `≈ ${nf(a, 1)} an(s) de ${SPECIES[sp].label.toLowerCase()}`, strong: true, note: fmtYears(a) }], notes: [DISC] });
  },
  'duree-de-vie-animal': (v) => lifeResult('general', v),
  'ration-animal': (v) => {
    const animal = v.espece === 'chat' ? 'chat' : 'chien';
    const r = energyResult(animal, { ...v, densite: v.densite_sec }, 'grammes');
    if (r.ok === false) return r;
    const w = Number(String(v.poids).replace(',', '.'));
    const f = factorOf(animal === 'chien' ? DOG_FACTORS : CAT_FACTORS, v.situation) || factorOf(animal === 'chien' ? DOG_FACTORS : CAT_FACTORS, 'sterilise');
    const kcal = rer(w) * f[2];
    const share = Math.min(100, Math.max(0, Number(v.part_humide) || 0)) / 100;
    const dSec = Number(String(v.densite_sec).replace(',', '.')), dHum = Number(String(v.densite_humide).replace(',', '.'));
    if (!(dSec > 0) || (share > 0 && !(dHum > 0))) return err('Indiquez l’énergie de chaque aliment (kcal pour 100 g).');
    const gSec = (kcal * (1 - share)) / dSec * 100, gHum = share > 0 ? (kcal * share) / dHum * 100 : 0;
    const meals = Math.max(1, Math.round(Number(v.repas) || 2));
    const rows = [{ label: 'Énergie à apporter', value: `≈ ${Math.round(kcal)} kcal/jour` }, { label: 'Croquettes', value: `≈ ${Math.round(gSec)} g/jour`, strong: true, note: `soit ≈ ${Math.round(gSec / meals)} g par repas` }];
    if (share > 0) rows.push({ label: 'Pâtée / aliment humide', value: `≈ ${Math.round(gHum)} g/jour`, strong: true, note: `soit ≈ ${Math.round(gHum / meals)} g par repas` });
    return ok({ rows, notes: ['Retirez des quantités les friandises et les compléments. ' + DISC] });
  },
  'poids-animal': (v) => bodyWeightResult(v.espece === 'chat' ? 'chat' : 'chien', v),
  'eau-animal': (v) => waterResult(['chat', 'lapin'].includes(v.espece) ? v.espece : 'chien', v),
  'frequence-repas-animal': (v) => mealFrequency(['chat', 'lapin'].includes(v.espece) ? v.espece : 'chien', v),
  'calculateur-dates-animal': (v) => {
    const start = parseDate(v.depart); if (!start) return err('Indiquez une date de départ valide.');
    if (v.mode === 'ecart') {
      const end = parseDate(v.fin); if (!end) return err('Indiquez la seconde date.');
      const [a, b] = start <= end ? [start, end] : [end, start];
      const x = ageBetween(a, b);
      return ok({ rows: [{ label: 'Écart', value: fmtAge(x), strong: true }, { label: 'En jours', value: `${x.totalDays} jours` }, { label: 'En semaines', value: `${nf(x.totalDays / 7, 1)} semaines` }], notes: [] });
    }
    const n = Number(v.intervalle), cnt = Math.min(12, Math.max(1, Math.round(Number(v.nombre) || 1)));
    if (!(n > 0)) return err('Indiquez un intervalle supérieur à zéro.');
    const sign = v.mode === 'retrancher' ? -1 : 1;
    const step = (i) => { const k = n * i * sign; switch (v.unite) { case 'jours': return addDays(start, k); case 'semaines': return addDays(start, k * 7); case 'ans': return addMonths(start, k * 12); default: return addMonths(start, k); } };
    const rowsT = Array.from({ length: cnt }, (_, i) => [`Échéance ${i + 1}`, fmtDate(step(i + 1))]);
    return ok({ rows: [{ label: sign > 0 ? 'Prochaine échéance' : 'Date antérieure', value: fmtDate(step(1)), strong: true }], tables: [{ caption: 'Toutes les échéances', head: ['Rang', 'Date'], rows: rowsT }], notes: ['Ces dates sont un simple calcul de calendrier. Les rappels de vaccins et de traitements se fixent avec votre vétérinaire. '] });
  },
};

/* ---------- Calendriers (vaccination, vermifugation) ---------- */
function calendarResult(kind, v) {
  const b = parseDate(v.naissance);
  if (!b) return err('Indiquez une date de naissance valide.');
  const ref = parseDate(v.reference) || todayUTC();
  if (b > ref) return err('La date de naissance doit être antérieure à la date de calcul.');
  const wk = (w) => addDays(b, w * 7);
  const steps = kind === 'chiot'
    ? [[2, 'Premier vermifuge (selon protocole du vétérinaire)'], [4, 'Vermifuge'], [6, 'Vermifuge'], [8, 'Première vaccination (primo-vaccination) et identification par puce avant toute cession'], [12, 'Deuxième injection de primo-vaccination (3 à 4 semaines après la première) ; rage possible dès 12 semaines si voyage'], [16, 'Contrôle et conseils : fin de la période de socialisation sensible, dentition'], [26, 'Bilan à 6 mois : poids, dentition, discussion sur la stérilisation'], [52, 'Premier rappel annuel de vaccination']]
    : [[2, 'Premier vermifuge (selon protocole du vétérinaire)'], [4, 'Vermifuge'], [8, 'Première vaccination (typhus, coryza, calicivirose ; leucose selon le mode de vie) et identification par puce'], [12, 'Deuxième injection de primo-vaccination (3 à 4 semaines après la première)'], [24, 'Bilan à 6 mois : poids, dentition, discussion sur la stérilisation'], [30, 'Identification obligatoire au plus tard à 7 mois pour les chats (si ce n’est pas déjà fait)'], [52, 'Premier rappel annuel de vaccination']];
  const rows = steps.map(([w, t]) => [fmtDateShort(wk(w)), w < 26 ? `${w} semaines` : `${Math.round(w / 4.345)} mois`, t, wk(w) < ref ? 'Passé' : 'À venir']);
  const next = steps.find(([w]) => wk(w) >= ref);
  const a = ageBetween(b, ref);
  return ok({
    rows: [{ label: 'Âge actuel', value: fmtAge(a), strong: true }, { label: 'Prochaine étape', value: next ? `${fmtDate(wk(next[0]))} : ${next[1]}` : 'Suivez ensuite les rappels annuels fixés avec votre vétérinaire.' }],
    tables: [{ caption: `Repères de calendrier pour un ${kind}`, head: ['Date', 'Âge', 'Étape', 'Statut'], rows }],
    notes: ['Ce calendrier est un repère général : les vaccins, les vermifuges et leurs dates dépendent du produit, de l’animal, de la région et de son mode de vie. Votre vétérinaire fixe le protocole. ' + DISC],
  });
}
TOOLS['calendrier-chiot'] = (v) => calendarResult('chiot', v);
TOOLS['calendrier-chaton'] = (v) => calendarResult('chaton', v);

export const CAT_TABLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20];

function quantityResult(v) {
  const g = needNumber(v.ration, 'la ration journalière (en grammes)', { max: 3000 });
  if (g.error) return err(g.error);
  const meals = Math.max(1, Math.round(Number(v.repas) || 2));
  const bag = needNumber(v.sac, 'le poids du sac (en kg)', { max: 50 });
  if (bag.error) return err(bag.error);
  const days = (bag.n * 1000) / g.n;
  const rows = [
    { label: 'Quantité par repas', value: `≈ ${Math.round(g.n / meals)} g`, strong: true, note: `${meals} repas par jour` },
    { label: 'Durée d’un sac', value: `≈ ${Math.floor(days)} jours`, note: `soit environ ${nf(days / 7, 1)} semaines` },
    { label: 'Consommation sur 30 jours', value: `≈ ${nf((g.n * 30) / 1000, 1)} kg` },
  ];
  const price = Number(String(v.prix ?? '').replace(',', '.'));
  if (price > 0) {
    rows.push({ label: 'Coût par jour', value: `≈ ${nf((price / bag.n) * (g.n / 1000), 2)} €` });
    rows.push({ label: 'Budget sur 30 jours', value: `≈ ${nf((price / bag.n) * ((g.n * 30) / 1000), 2)} €` });
    rows.push({ label: 'Budget sur un an', value: `≈ ${nf((price / bag.n) * ((g.n * 365) / 1000), 0)} €` });
  }
  return ok({ rows, notes: ['Calcul simple à partir de la ration que vous indiquez (utilisez le calculateur de ration pour la trouver). ' + DISC] });
}
