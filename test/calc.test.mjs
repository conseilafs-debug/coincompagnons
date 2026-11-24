import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/assets/calc.js';

const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) <= eps, `${a} ≉ ${b}`);
const row = (res, label) => res.rows.find((r) => r.label.startsWith(label));

test('âge humain du chien : paliers par taille', () => {
  near(C.dogHumanAge(1, 'moyen'), 15);
  near(C.dogHumanAge(2, 'moyen'), 24);
  near(C.dogHumanAge(5, 'moyen'), 39);   // 24 + 5×3
  near(C.dogHumanAge(5, 'petit'), 36);   // 24 + 4×3
  near(C.dogHumanAge(5, 'grand'), 42);   // 24 + 6×3
  near(C.dogHumanAge(5, 'geant'), 45);   // 24 + 7×3
  near(C.dogHumanAge(0.5, 'moyen'), 7.5);
});

test('conversion inverse chien / chat', () => {
  for (const s of ['petit', 'moyen', 'grand', 'geant']) for (const a of [0.5, 1.5, 4, 9]) near(C.dogAgeFromHuman(C.dogHumanAge(a, s), s), a);
  for (const a of [0.5, 1.5, 4, 12]) near(C.catAgeFromHuman(C.catHumanAge(a)), a);
});

test('formule épigénétique : 16 ln(âge) + 31', () => {
  near(C.dogHumanAgeEpigenetic(1), 31);
  near(C.dogHumanAgeEpigenetic(10), 16 * Math.log(10) + 31);
  assert.equal(C.dogHumanAgeEpigenetic(0.3), null);
});

test('âge humain du chat : table de référence', () => {
  const expected = { 1: 15, 2: 24, 3: 28, 4: 32, 5: 36, 6: 40, 7: 44, 8: 48, 9: 52, 10: 56, 15: 76, 20: 96 };
  for (const [a, h] of Object.entries(expected)) near(C.catHumanAge(Number(a)), h);
});

test('calcul de dates : âge entre deux dates (cas limites)', () => {
  const a = C.ageBetween(C.parseDate('2020-01-31'), C.parseDate('2020-03-01'));
  assert.deepEqual([a.years, a.months, a.days], [0, 1, 1]); // 31 janv. → 29 févr. (bissextile) + 1 jour
  const b = C.ageBetween(C.parseDate('2019-06-15'), C.parseDate('2024-06-15'));
  assert.deepEqual([b.years, b.months, b.days], [5, 0, 0]);
  const c = C.ageBetween(C.parseDate('2020-02-29'), C.parseDate('2021-02-28'));
  assert.deepEqual([c.years, c.months], [1, 0]); // anniversaire d'un 29 février = 28 février
  assert.equal(C.parseDate('2021-02-30'), null);
  assert.equal(C.fmtAge({ years: 2, months: 3, days: 5 }), '2 ans, 3 mois et 5 jours');
  assert.equal(C.fmtAge({ years: 1, months: 0, days: 0 }), '1 an');
});

test('calculateur d’âge du chien : bout en bout', () => {
  const r = C.TOOLS['chien-age']({ naissance: '2019-06-15', reference: '2024-06-15', taille: 'moyen' });
  assert.ok(r.ok);
  assert.equal(row(r, 'Âge réel').value, '5 ans');
  assert.equal(row(r, 'Âge en mois').value, '60 mois');
  assert.match(row(r, 'Âge approximatif').value, /39/);
});

test('calculateur d’âge : erreurs lisibles', () => {
  assert.equal(C.TOOLS['chat-age']({ naissance: '' }).ok, false);
  const r = C.TOOLS['chat-age']({ naissance: '2030-01-01', reference: '2024-01-01' });
  assert.equal(r.ok, false);
  assert.match(r.error, /antérieure/);
});

test('énergie : RER = 70 × kg^0,75', () => {
  near(C.rer(20), 661.9, 0.5);
  near(C.rer(4), 197.99, 0.1);
  const r = C.TOOLS['chien-calories']({ poids: '20', situation: 'sterilise' });
  assert.match(row(r, 'Besoin énergétique d’entretien').value, /1[  ]?059/);
  const c = C.TOOLS['chat-calories']({ poids: '4', situation: 'sterilise' });
  assert.match(row(c, 'Besoin énergétique d’entretien').value, /238/);
});

test('ration en grammes', () => {
  const r = C.TOOLS['chien-ration']({ poids: '20', situation: 'sterilise', densite: '350', repas: '2' });
  assert.match(row(r, 'Ration journalière').value, /303/); // 1059 kcal / 3,5
  const bad = C.TOOLS['chien-ration']({ poids: '-3', situation: 'sterilise', densite: '350' });
  assert.equal(bad.ok, false);
});

test('gestation et mise bas', () => {
  const g = C.TOOLS['chienne-mise-bas']({ accouplement: '2025-01-01' });
  assert.match(row(g, 'Date moyenne').value, /5 mars 2025/); // +63 j
  const c = C.TOOLS['chatte-mise-bas']({ accouplement: '2025-01-01' });
  assert.match(row(c, 'Date moyenne').value, /7 mars 2025/); // +65 j
  const e = C.TOOLS['chienne-gestation']({ accouplement: '2025-01-01', reference: '2025-02-05' });
  assert.match(row(e, 'Jours écoulés').value, /^35/);
  assert.equal(C.TOOLS['chienne-gestation']({ accouplement: '2025-03-01', reference: '2025-02-05' }).ok, false);
});

test('poids adulte du chiot', () => {
  const r = C.TOOLS['chiot-poids-adulte']({ poids_actuel: '8', age: '16', unite: 'semaines', taille: 'moyen' });
  assert.match(row(r, 'Poids adulte estimé').value, /17,8/); // 8 / 0,45
  assert.equal(C.TOOLS['chiot-poids-adulte']({ poids_actuel: '3', age: '5', unite: 'semaines', taille: 'petit' }).ok, false);
});

test('croissance : fractions interpolées et monotones', () => {
  for (const t of [...Object.values(C.DOG_GROWTH), ...Object.values(C.CAT_GROWTH)]) {
    let prev = 0;
    for (let w = 8; w <= 260; w += 4) { const f = C.fractionAt(t, w); assert.ok(f >= prev && f <= 1); prev = f; }
    assert.equal(C.fractionAt(t, 300), 1);
  }
  near(C.fractionAt(C.DOG_GROWTH.moyen, 14), 0.40);
});

test('poids idéal : condition corporelle', () => {
  const r = C.TOOLS['chat-poids-ideal']({ poids: '5', bcs: '7' });
  assert.match(row(r, 'Poids idéal estimé').value, /4,17/);
  const ok = C.TOOLS['chat-poids-ideal']({ poids: '4', bcs: '5' });
  assert.match(row(ok, 'Poids idéal estimé').value, /4/);
  assert.equal(C.TOOLS['chat-poids-ideal']({ poids: '4', bcs: '' }).ok, false);
});

test('eau', () => {
  const r = C.TOOLS['chien-eau']({ poids: '20', alimentation: 'sec', climat: 'normal', activite: 'normal' });
  assert.match(row(r, 'Eau à boire').value, /1[  ]?104/); // 60×20×0,92
});

test('quantité et budget', () => {
  const r = C.TOOLS['chien-quantite-nourriture']({ ration: '300', repas: '2', sac: '12', prix: '48' });
  assert.match(row(r, 'Quantité par repas').value, /150/);
  assert.match(row(r, 'Durée d’un sac').value, /40 jours/);
  assert.match(row(r, 'Budget sur 30 jours').value, /36/);
});

test('dates et échéances', () => {
  const r = C.TOOLS['calculateur-dates-animal']({ depart: '2025-01-31', intervalle: '1', unite: 'mois', nombre: '3', mode: 'ajouter' });
  assert.match(r.rows[0].value, /28 février 2025/);
  const d = C.TOOLS['calculateur-dates-animal']({ depart: '2025-01-01', fin: '2025-03-01', mode: 'ecart' });
  assert.match(row(d, 'En jours').value, /59/);
});

test('convertisseur et espèces', () => {
  const r = C.TOOLS['convertisseur-age-animal-humain']({ espece: 'chat', sens: 'animal', age: '10' });
  assert.match(r.rows[0].value, /56/);
  const l = C.TOOLS['convertisseur-age-animal-humain']({ espece: 'lapin', sens: 'animal', age: '4.5' });
  assert.match(l.rows[0].value, /40/); // 4,5 / 9 × 80
});

test('chaque outil renvoie une erreur propre sur entrée vide (pas d’exception)', () => {
  for (const [id, fn] of Object.entries(C.TOOLS)) {
    const r = fn({});
    assert.equal(typeof r.ok, 'boolean', id);
  }
});
