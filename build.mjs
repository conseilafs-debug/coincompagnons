// Générateur de site statique — aucune dépendance. Usage : node build.mjs  (sortie : ./dist)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, ANIMALS, SOON } from './src/site.mjs';
import { esc, strip, abs, card, grid, table, faqHtml, blocksHtml, ad, stars, VET_NOTE } from './src/lib/html.mjs';
import { layout, hero, breadcrumbHtml } from './src/lib/layout.mjs';
import { TOOLS, TOOL_TABLES } from './src/data/tools.mjs';
import { DOGS } from './src/data/dogs.mjs';
import { CATS } from './src/data/cats.mjs';
import { ARTICLES_CHIENS } from './src/data/articles-chiens.mjs';
import { ARTICLES_CHATS } from './src/data/articles-chats.mjs';
import { FOOD_TABLES } from './src/data/food.mjs';
import { DOG_NAMES, CAT_NAMES, NAME_PAGES } from './src/data/names.mjs';
import { CALENDARS, CAL_TOOLS } from './src/data/calendars.mjs';
import { legalPages } from './src/data/legal.mjs';
import { dogHumanAge, catHumanAge, CAT_TABLE, DOG_RATE, DOG_GROWTH } from './src/assets/calc.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const pages = [];   // { path, html, indexable }
const searchIdx = [];
const toolUrl = (t) => (t.calSlug ? `/calendriers/${t.calSlug}/` : t.animal === 'general' ? `/outils/${t.slug}/` : `/${t.animal}/outils/${t.slug}/`);
const toolById = Object.fromEntries([...TOOLS, ...CAL_TOOLS.map((t) => ({ ...t, calSlug: CALENDARS.find((c) => c.tool === t.id)?.slug, title: CALENDARS.find((c) => c.tool === t.id)?.h1 }))].map((t) => [t.id, t]));
const ARTICLES = [...ARTICLES_CHIENS, ...ARTICLES_CHATS];
const artUrl = (a) => `/${a.animal}/${a.section}/${a.slug}/`;
const breedUrl = (animal, b) => `/${animal}/races/${b.slug}/`;
const BREEDS = { chiens: DOGS, chats: CATS };
const errors = [];

function add(p, o) {
  const html = layout({ ...o, path: p });
  pages.push({ path: p, html, indexable: !o.noindex });
  if (o.search) searchIdx.push({ t: o.search.t || strip(o.title), u: p, y: o.search.y, d: o.search.d || o.desc, a: o.search.a || '', k: o.search.k || '' });
}

const dateISO = SITE.buildDate;
const ldArticle = (p, headline, desc) => ({ '@context': 'https://schema.org', '@type': 'Article', headline, description: desc, inLanguage: 'fr-FR', datePublished: dateISO, dateModified: dateISO, mainEntityOfPage: abs(p), author: { '@type': 'Organization', name: SITE.name }, publisher: { '@type': 'Organization', name: SITE.name, url: abs('/') } });
const ldWebPage = (p, name, desc) => ({ '@context': 'https://schema.org', '@type': 'WebPage', name, description: desc, url: abs(p), inLanguage: 'fr-FR', isPartOf: { '@type': 'WebSite', name: SITE.name, url: abs('/') } });
const ldFaq = (faq) => (faq?.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) } : null);

const crumbsFor = (...items) => [['Accueil', '/'], ...items];
const content = (inner, cls = '') => `<div class="wrap content ${cls}">${inner}</div>`;
const panel = (title, items) => items.length ? `<div class="panel"><h2>${esc(title)}</h2><ul>${items.map(([u, n]) => `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ul></div>` : '';
const sectionHead = (title, link) => `<div class="section-head"><h2>${title}</h2>${link ? `<a href="${link[0]}">${link[1]} →</a>` : ''}</div>`;
const toolCards = (ids) => ids.map((id) => toolById[id]).filter(Boolean).map((t) => card({ href: toolUrl(t), title: t.title, text: t.card, badge: t.animal === 'general' ? 'Tous animaux' : ANIMALS[t.animal].label, icon: '🧮' }));

/* ========== OUTILS ========== */
function fieldHtml(tid, f) {
  const id = `${tid}-${f.id}`;
  const hint = f.hint ? `<span class="hint" id="${id}-h">${esc(f.hint)}</span>` : '';
  const desc = f.hint ? ` aria-describedby="${id}-h"` : '';
  const req = f.required ? ' required' : '';
  let input;
  if (f.type === 'select') input = `<select id="${id}" name="${f.id}"${req}${desc}>${f.options.map(([v, l]) => `<option value="${esc(v)}"${String(f.value) === String(v) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  else if (f.type === 'date') input = `<input id="${id}" name="${f.id}" type="date"${f.value === 'today' ? ' data-default="today"' : ''}${req}${desc}>`;
  else input = `<input id="${id}" name="${f.id}" type="number" inputmode="decimal" step="${f.step ?? 'any'}"${f.min != null ? ` min="${f.min}"` : ''}${f.max != null ? ` max="${f.max}"` : ''}${f.value != null ? ` value="${esc(f.value)}"` : ''}${f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : ''}${req}${desc}>`;
  return `<div class="field"><label for="${id}">${esc(f.label)}${f.required ? ' <span aria-hidden="true">*</span>' : ''}</label>${input}${hint}</div>`;
}
function staticTable(key) {
  const T = TOOL_TABLES[key];
  if (key === 'catAges') return table({ caption: T.caption, head: T.head, rows: CAT_TABLE.map((y) => [`${y} an${y > 1 ? 's' : ''}`, `≈ ${Math.round(catHumanAge(y))} ans`]) });
  if (key === 'dogAges') return table({ caption: T.caption, head: T.head, rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((y) => [`${y} an${y > 1 ? 's' : ''}`, ...['petit', 'moyen', 'grand', 'geant'].map((s) => `≈ ${Math.round(dogHumanAge(y, s))} ans`)]) });
  return '';
}
function relatedTools(t) {
  const sameAnimal = TOOLS.filter((x) => x.id !== t.id && x.animal === t.animal).slice(0, 5);
  const general = TOOLS.filter((x) => x.animal === 'general' && x.id !== t.id).slice(0, 2);
  return [...sameAnimal, ...general].slice(0, 6);
}
for (const t of TOOLS) {
  const p = toolUrl(t);
  const an = t.animal === 'general' ? null : ANIMALS[t.animal];
  const crumbs = crumbsFor(...(an ? [[an.label, an.path], ['Outils', `${an.path}outils/`]] : [['Outils', '/outils/']]), [t.title, p]);
  const formHtml = `<section class="tool" data-tool="${t.id}" aria-labelledby="tool-h"><h2 id="tool-h" class="sr">Calculateur</h2>
<form class="tool-form" novalidate>${t.fields.map((f) => fieldHtml(t.id, f)).join('')}<div class="tool-actions"><button class="btn" type="submit">Calculer</button><button class="btn ghost" type="reset">Réinitialiser</button></div></form>
<div class="tool-result" role="status" aria-live="polite" hidden></div>
<noscript><p class="noscript">Ce calculateur fonctionne avec JavaScript. Activez-le dans votre navigateur pour l’utiliser.</p></noscript></section>`;
  const rel = relatedTools(t);
  const arts = ARTICLES.filter((a) => (a.tools || []).includes(t.id)).slice(0, 4);
  const aside = panel('Autres outils', rel.map((x) => [toolUrl(x), x.title])) + (arts.length ? panel('À lire aussi', arts.map((a) => [artUrl(a), a.h1])) : '') + (an ? panel(`Rubrique ${an.label.toLowerCase()}`, [[`${an.path}races/`, `Races de ${an.plural}`], [`${an.path}alimentation/`, 'Alimentation'], [`${an.path}sante/`, 'Santé']]) : '');
  const body = `${hero({ kicker: an ? `Outil gratuit · ${an.label}` : 'Outil gratuit', h1: t.h1, lead: strip(t.intro[0]) })}
${content(`<div class="layout with-aside"><div>
${breadcrumbHtml(crumbs)}
<p class="disclaimer"><strong>Outil indicatif.</strong> ${esc(t.disclaimer)}</p>
${formHtml}
${ad('after-tool')}
<article>${blocksHtml(t.how, { adAfter: 99 })}${t.table ? staticTable(t.table) : ''}</article>
${ad('before-faq')}
${faqHtml(t.faq)}
</div><div class="aside-box">${aside}</div></div>`)}`;
  add(p, { title: t.title, desc: t.desc, body, crumbs, jsonld: [ldWebPage(p, t.title, t.desc), ldFaq(t.faq)], scripts: ['/assets/tools.js'], search: { y: 'Outil', a: t.animal, k: `calculateur outil gratuit ${t.card}` } });
}
// Hubs d'outils
function toolsHub(p, title, h1, lead, list, crumbs, extra = '') {
  const body = `${hero({ h1, lead })}${content(`${breadcrumbHtml(crumbs)}${extra}${grid(toolCards(list.map((t) => t.id)), 'cols-2')}${ad('between-sections')}<p class="small">${esc(VET_NOTE)}</p>`)}`;
  add(p, { title, desc: lead, body, crumbs, jsonld: [ldWebPage(p, title, lead)] });
}
toolsHub('/outils/', 'Outils gratuits pour animaux : calculateurs', 'Outils gratuits pour votre animal', 'Calculateurs d’âge, de poids, de ration, de gestation et de croissance pour chiens, chats et animaux de compagnie. Gratuits, sans inscription, et toujours à titre indicatif.', TOOLS, crumbsFor(['Outils', '/outils/']));
for (const k of ['chiens', 'chats']) {
  const an = ANIMALS[k];
  const list = TOOLS.filter((t) => t.animal === k);
  const gen = k === 'chiens' ? ['/chiens/noms/generateur/', 'Générateur de nom de chien'] : ['/chats/noms/generateur/', 'Générateur de nom de chat'];
  toolsHub(`${an.path}outils/`, `Outils gratuits pour ${an.plural} : calculateurs`, `Outils gratuits pour ${an.plural}`, `${list.length} calculateurs gratuits pour votre ${an.singular} : âge, âge humain, poids, ration, calories, eau, gestation, croissance et durée de vie.`, list, crumbsFor([an.label, an.path], ['Outils', `${an.path}outils/`]), `<p><a class="btn ghost" href="${gen[0]}">${gen[1]}</a></p>`);
}

/* ========== RACES ========== */
const BREED_TOOLS = { chiens: ['chien-age', 'chiot-poids-adulte', 'chiot-croissance', 'chien-ration', 'chien-age-humain', 'chien-calories'], chats: ['chat-age', 'chat-poids-ideal', 'chaton-croissance', 'chat-ration', 'chat-age-humain', 'chat-calories'] };
function breedPage(animal, b) {
  const an = ANIMALS[animal], list = BREEDS[animal];
  const p = breedUrl(animal, b);
  const isDog = animal === 'chiens';
  const crumbs = crumbsFor([an.label, an.path], [`Races de ${an.plural}`, `${an.path}races/`], [b.nom, p]);
  const h1 = `${b.nom} : fiche race, caractère, entretien et santé`;
  const title = `${b.nom} : caractère, entretien et santé`;
  const desc = strip(b.presentation).slice(0, 150).replace(/\s\S*$/, '') + '…';
  const sim = (b.similaires || []).map((s) => list.find((x) => x.slug === s)).filter(Boolean);
  const prefill = isDog ? `?taille=${b.cat}` : '';
  const catPre = !isDog ? `?categorie=${b.cat}` : '';
  const toolLinks = BREED_TOOLS[animal].map((id) => {
    const t = toolById[id];
    const q = id === 'chaton-croissance' ? catPre : (isDog && ['chien-age', 'chien-age-humain', 'chiot-poids-adulte', 'chiot-croissance'].includes(id) ? prefill : '');
    return [toolUrl(t) + q, t.title];
  });
  const extraTool = isDog ? [[`/chiens/noms/generateur/`, 'Générateur de nom de chien']] : [[`/chats/noms/generateur/`, 'Générateur de nom de chat']];
  const sect = (h, txt) => `<section><h2>${h}</h2><p>${txt}</p></section>`;
  const labels = isDog
    ? { exo: 'Besoins d’exercice', edu: 'Éducation', ent: 'Entretien', ali: 'Alimentation' }
    : { exo: 'Jeu et enrichissement', edu: 'Éducation et vie à la maison', ent: 'Entretien du pelage', ali: 'Alimentation' };
  const fiche = `<dl class="facts">
<div class="fact"><dt>Origine</dt><dd>${esc(b.fiche.origine)}</dd></div>
<div class="fact"><dt>Taille</dt><dd>${esc(b.fiche.taille)}</dd></div>
<div class="fact"><dt>Poids</dt><dd>${esc(b.fiche.poids)}</dd></div>
<div class="fact"><dt>Espérance de vie</dt><dd>${esc(b.fiche.vie)}</dd></div>
<div class="fact"><dt>Activité</dt><dd>${stars(b.activite)}</dd></div>
<div class="fact"><dt>Entretien du poil</dt><dd>${stars(b.poil)}</dd></div></dl>`;
  const body = `${hero({ kicker: `Fiche race · ${an.label}`, h1, lead: b.presentation })}
${content(`<div class="layout with-aside"><div>
${breadcrumbHtml(crumbs)}
${fiche}
<article>
${sect('Présentation', b.presentation)}
${ad('in-article')}
${sect('Origine', b.origine)}
${sect('Taille', b.taille)}
${sect('Poids', b.poids)}
${sect('Espérance de vie', b.vie)}
${sect('Caractère', b.caractere)}
${sect('Niveau d’activité', b.niveau)}
${sect(labels.exo, b.exercice)}
${sect(labels.edu, b.education)}
${sect(labels.ent, b.entretien)}
${sect(labels.ali, b.alimentation)}
${sect('Vie en appartement', b.appartement)}
${sect('Avec les enfants', b.enfants)}
${sect('Avec les autres animaux', b.autres)}
<section><h2>Points forts</h2><ul>${b.forts.map((x) => `<li>${x}</li>`).join('')}</ul></section>
<section><h2>Points de vigilance</h2><ul>${b.vigilance.map((x) => `<li>${x}</li>`).join('')}</ul><aside class="callout warn"><strong>Santé</strong><p>${esc(VET_NOTE)} Les prédispositions citées sont des tendances de la race, pas des certitudes pour chaque individu.</p></aside></section>
</article>
${ad('before-faq')}
${faqHtml(b.faq)}
<section><h2>Races similaires</h2>${grid(sim.map((s) => card({ href: breedUrl(animal, s), title: s.nom, text: s.fiche.taille + ' · ' + s.fiche.poids })))}</section>
<section><h2>Outils associés</h2><p>Calculez l’âge, le poids et la ration de votre ${an.singular} ${esc(b.nom)} :</p><ul>${toolLinks.map(([u, n]) => `<li><a href="${u}">${esc(n)}</a></li>`).join('')}<li><a href="${extraTool[0][0]}">${extraTool[0][1]}</a></li><li><a href="${an.path}alimentation/">Alimentation du ${an.singular}</a></li><li><a href="${an.path}races/">Toutes les races de ${an.plural}</a></li></ul></section>
</div><div class="aside-box">${panel('Outils pour ce ' + an.singular, toolLinks.slice(0, 4))}${panel('Noms et alimentation', [[`${an.path}noms/`, `Noms de ${an.plural}`], [`${an.path}alimentation/`, 'Alimentation'], [`${an.path}sante/`, 'Santé'], [`${an.path}comportement/`, 'Comportement']])}${panel('Autres races', sim.map((s) => [breedUrl(animal, s), s.nom]))}</div></div>`)}`;
  const jsonld = [ldArticle(p, h1, desc), ldFaq(b.faq)];
  add(p, { title, desc, body, crumbs, jsonld, type: 'article', search: { y: 'Race', a: animal, t: b.nom, k: `${b.alias || ''} race ${an.singular} ${b.fiche.origine}`, d: `${b.fiche.taille} · ${b.fiche.poids} · ${b.fiche.vie}` } });
}
for (const animal of ['chiens', 'chats']) {
  const an = ANIMALS[animal];
  BREEDS[animal].forEach((b) => breedPage(animal, b));
  const p = `${an.path}races/`;
  const crumbs = crumbsFor([an.label, an.path], [`Races de ${an.plural}`, p]);
  const desc = `${BREEDS[animal].length} fiches détaillées de races de ${an.plural} : caractère, besoins d’exercice, entretien, santé et vie de famille.`;
  const cards = BREEDS[animal].map((b) => `<div data-search="${esc(b.nom + ' ' + (b.alias || '') + ' ' + b.fiche.origine)}">${card({ href: breedUrl(animal, b), title: b.nom, text: `${b.fiche.taille} · ${b.fiche.poids}`, badge: 'Activité ' + ['très faible', 'faible', 'modérée', 'élevée', 'très élevée'][b.activite - 1] })}</div>`);
  const body = `${hero({ h1: `Races de ${an.plural} : toutes les fiches`, lead: desc })}${content(`${breadcrumbHtml(crumbs)}
<div class="filter"><label class="sr" for="rf">Filtrer les races</label><input id="rf" type="search" placeholder="Filtrer : nom, origine…" data-filter="#races-list" data-empty="#races-empty"></div>
<div id="races-list" class="grid">${cards.join('')}</div><p id="races-empty" class="hidden">Aucune race ne correspond. Essayez un autre mot.</p>
${ad('between-sections')}
<p>Chaque fiche présente le caractère, les besoins d’exercice, l’entretien, l’alimentation, la vie en appartement ou en famille, ainsi que les points de vigilance santé propres à la race. Ces fiches sont <strong>d’ordre général</strong> : chaque individu est unique, et un éleveur sérieux ou votre vétérinaire reste la meilleure source pour votre animal.</p>`)}`;
  add(p, { title: `Races de ${an.plural} : fiches détaillées`, desc, body, crumbs, jsonld: [ldWebPage(p, `Races de ${an.plural}`, desc)], scripts: [] });
}

/* ========== ARTICLES (guides, santé, alimentation, comportement…) ========== */
const SECTION_LABEL = { alimentation: 'Alimentation', sante: 'Santé', comportement: 'Comportement', education: 'Guide', entretien: 'Guide', guides: 'Guide' };
const secTitle = (animal, sec) => ANIMALS[animal].sections.find((s) => s[0] === sec)[1];
function foodTable(key) {
  const rows = FOOD_TABLES[key];
  const lab = { oui: 'Oui', moderation: 'Avec modération', eviter: 'À éviter', danger: 'Dangereux' };
  return `<div class="filter no-print"><label class="sr" for="ff-${key}">Chercher un aliment</label><input id="ff-${key}" type="search" placeholder="Chercher un aliment…" data-filter="#ft-${key}" data-empty="#fe-${key}"><label class="sr" for="fv-${key}">Filtrer par réponse</label><select id="fv-${key}" data-filter-verdict="#ft-${key}"><option value="">Toutes les réponses</option>${Object.entries(lab).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
<div class="table-wrap" id="ft-${key}"><table><caption>Aliments courants : réponse et précautions</caption><thead><tr><th scope="col">Aliment</th><th scope="col">Réponse</th><th scope="col">À savoir</th></tr></thead><tbody>${rows.map(([n, v, note]) => `<tr data-search="${esc(n)}" data-verdict="${v}"><th scope="row">${n}</th><td><span class="verdict v-${v}">${lab[v]}</span></td><td>${note}</td></tr>`).join('')}</tbody></table></div><p id="fe-${key}" class="hidden">Aucun aliment ne correspond à votre recherche.</p>
<p class="small">Cette liste n’est pas exhaustive. Pour un aliment non listé ou en cas d’ingestion d’un produit toxique, appelez votre vétérinaire ou un centre antipoison vétérinaire sans attendre.</p>`;
}
for (const a of ARTICLES) {
  const an = ANIMALS[a.animal];
  const p = artUrl(a);
  const secLabel = secTitle(a.animal, a.section);
  const crumbs = crumbsFor([an.label, an.path], [secLabel, `${an.path}${a.section}/`], [a.h1, p]);
  const peers = ARTICLES.filter((x) => x !== a && x.animal === a.animal && x.section === a.section).slice(0, 4);
  const more = ARTICLES.filter((x) => x !== a && x.animal === a.animal && x.section !== a.section && (a.related || []).includes(artUrl(x))).concat(peers).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 5);
  const tools = (a.tools || []).map((id) => toolById[id]).filter(Boolean);
  const isHealth = a.section === 'sante' || a.vet;
  const vet = a.vet ? `<aside class="callout danger"><strong>Quand consulter un vétérinaire</strong>${Array.isArray(a.vet) ? `<ul>${a.vet.map((x) => `<li>${x}</li>`).join('')}</ul>` : `<p>${a.vet}</p>`}</aside>` : '';
  const body = `${hero({ kicker: `${an.label} · ${secLabel}`, h1: a.h1, lead: a.intro })}
${content(`<div class="layout with-aside"><div>
${breadcrumbHtml(crumbs)}
${isHealth ? `<p class="disclaimer">${esc(VET_NOTE)}</p>` : ''}
<article>${blocksHtml(a.blocks)}${a.foodTable ? `<section>${foodTable(a.foodTable)}</section>` : ''}${vet}</article>
${ad('before-faq')}
${faqHtml(a.faq)}
</div><div class="aside-box">${panel('Outils utiles', tools.map((t) => [toolUrl(t), t.title]))}${panel('À lire aussi', more.map((x) => [artUrl(x), x.h1]))}${panel(`Rubrique ${an.label.toLowerCase()}`, [[`${an.path}${a.section}/`, secLabel], [`${an.path}races/`, `Races de ${an.plural}`], [`${an.path}noms/`, `Noms de ${an.plural}`]])}</div></div>`)}`;
  add(p, { title: a.title || a.h1, desc: a.desc, body, crumbs, type: 'article', jsonld: [ldArticle(p, a.h1, a.desc), ldFaq(a.faq)], search: { y: a.question ? 'Question' : SECTION_LABEL[a.section], a: a.animal, t: a.h1, k: `${a.keywords || ''} ${an.singular}`, d: a.desc } });
}

/* ========== NOMS ========== */
const NAMES = { chiens: DOG_NAMES, chats: CAT_NAMES };
const letterOf = (n) => n[0].normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
function nameList(list) {
  const by = {};
  [...list].sort((a, b) => a[0].localeCompare(b[0], 'fr')).forEach(([n]) => { (by[letterOf(n)] ||= []).push(n); });
  return `<p class="no-print">${Object.keys(by).map((l) => `<a href="#l-${l}">${l}</a>`).join(' · ')}</p>` + Object.entries(by).map(([l, ns]) => `<h3 class="names-letter" id="l-${l}">${l}</h3><ul class="names-list">${ns.map((n) => `<li>${n}</li>`).join('')}</ul>`).join('');
}
const filt = (list, f) => list.filter(([n, sx, tg]) => (!f.sex || sx === f.sex || sx === 'x') && (!f.tag || tg.includes(f.tag)) && (!f.maxLen || n.length <= f.maxLen));
for (const animal of ['chiens', 'chats']) {
  const an = ANIMALS[animal], all = NAMES[animal];
  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'assets', `names-${animal}.json`), JSON.stringify(all.map(([n, s, t]) => [n, s, t])));
  const pagesDef = NAME_PAGES.filter((n) => n.animal === animal);
  for (const np of pagesDef) {
    const list = filt(all, np.filter);
    if (list.length < 25) errors.push(`Liste de noms trop courte : ${np.slug} (${list.length})`);
    const p = `${an.path}noms/${np.slug}/`;
    const crumbs = crumbsFor([an.label, an.path], [`Noms de ${an.plural}`, `${an.path}noms/`], [np.h1, p]);
    const others = pagesDef.filter((x) => x !== np).slice(0, 6).map((x) => [`${an.path}noms/${x.slug}/`, x.h1]);
    const body = `${hero({ kicker: `Noms de ${an.plural}`, h1: np.h1, lead: np.intro })}${content(`<div class="layout with-aside"><div>${breadcrumbHtml(crumbs)}
<article><section><h2>${list.length} idées de noms</h2>${nameList(list)}</section>${ad('in-article')}
<section><h2>Comment choisir ?</h2><ul>${np.tips.map((t) => `<li>${t}</li>`).join('')}</ul></section></article>
${ad('before-faq')}${faqHtml(np.faq)}</div><div class="aside-box"><div class="panel"><h2>Un tirage au sort ?</h2><p><a class="btn" href="${an.path}noms/generateur/">Générateur de nom</a></p></div>${panel('Autres listes', others)}${panel('Rubrique', [[`${an.path}races/`, `Races de ${an.plural}`], [`${an.path}noms/par-lettre/`, 'Noms par lettre']])}</div></div>`)}`;
    add(p, { title: np.title, desc: np.desc, body, crumbs, jsonld: [ldArticle(p, np.h1, np.desc), ldFaq(np.faq)], type: 'article', search: { y: 'Noms', a: animal, t: np.h1, k: `nom prénom ${an.singular}`, d: np.desc } });
  }
  // par lettre
  { const p = `${an.path}noms/par-lettre/`, crumbs = crumbsFor([an.label, an.path], [`Noms de ${an.plural}`, `${an.path}noms/`], ['Noms par lettre', p]);
    const desc = `Tous nos noms de ${an.plural} classés de A à Z : trouvez un nom selon sa première lettre.`;
    add(p, { title: `Noms de ${an.plural} par lettre (A à Z)`, desc, crumbs, body: `${hero({ h1: `Noms de ${an.plural} par lettre`, lead: desc })}${content(`${breadcrumbHtml(crumbs)}<article>${nameList(all)}</article>`)}`, jsonld: [ldWebPage(p, `Noms de ${an.plural} par lettre`, desc)], search: { y: 'Noms', a: animal, k: 'nom par lettre alphabet' } }); }
  // générateur
  { const p = `${an.path}noms/generateur/`, crumbs = crumbsFor([an.label, an.path], [`Noms de ${an.plural}`, `${an.path}noms/`], ['Générateur de nom', p]);
    const desc = `Générateur de nom de ${an.singular} : filtrez par sexe, longueur, style et première lettre, puis tirez des idées au hasard.`;
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const gen = `<section class="tool" data-names="/assets/names-${animal}.json"><form class="tool-form">
<div class="field"><label for="g-sexe">Sexe</label><select id="g-sexe" name="sexe"><option value="tous">Peu importe</option><option value="m">Mâle</option><option value="f">Femelle</option></select></div>
<div class="field"><label for="g-long">Longueur</label><select id="g-long" name="longueur"><option value="tous">Peu importe</option><option value="court">Court (5 lettres ou moins)</option><option value="long">Long (7 lettres ou plus)</option></select></div>
<div class="field"><label for="g-style">Style</label><select id="g-style" name="style"><option value="tous">Tous les styles</option><option value="c">Classique</option><option value="o">Original</option><option value="d">Drôle</option><option value="f">Français</option><option value="j">Japonais</option><option value="m">Inspiré du cinéma</option></select></div>
<div class="field"><label for="g-lettre">Première lettre</label><select id="g-lettre" name="lettre"><option value="toutes">Toutes</option>${letters.map((l) => `<option value="${l}">${l.toUpperCase()}</option>`).join('')}</select></div>
<div class="tool-actions"><button class="btn" type="submit">Proposer des noms</button></div></form>
<div class="tool-result"><p class="name-count small" role="status"></p><div class="name-result" aria-live="polite"></div></div><noscript><p class="noscript">Le générateur nécessite JavaScript. Les listes complètes restent disponibles sans lui.</p></noscript></section>`;
    const body = `${hero({ kicker: 'Outil gratuit', h1: `Générateur de nom de ${an.singular}`, lead: desc })}${content(`${breadcrumbHtml(crumbs)}${gen}${ad('after-tool')}<article><section><h2>Comment ça marche ?</h2><p>Choisissez vos critères puis cliquez sur « Proposer des noms » : huit idées sont tirées au hasard parmi les ${all.length} noms de notre base. Relancez autant de fois que vous voulez, ou modifiez un filtre pour affiner.</p></section></article><section><h2>Parcourir les listes</h2>${grid(pagesDef.map((x) => card({ href: `${an.path}noms/${x.slug}/`, title: x.h1 })))}</section>`)}`;
    add(p, { title: `Générateur de nom de ${an.singular}`, desc, body, crumbs, jsonld: [ldWebPage(p, `Générateur de nom de ${an.singular}`, desc)], scripts: ['/assets/names.js'], search: { y: 'Outil', a: animal, t: `Générateur de nom de ${an.singular}`, k: 'nom aléatoire tirage' } }); }
  // hub noms
  { const p = `${an.path}noms/`, crumbs = crumbsFor([an.label, an.path], [`Noms de ${an.plural}`, p]);
    const desc = `Idées de noms pour ${an.plural} : mâles, femelles, courts, originaux, drôles, français, japonais, inspirés du cinéma, et un générateur.`;
    const body = `${hero({ h1: `Noms de ${an.plural} : idées et générateur`, lead: desc })}${content(`${breadcrumbHtml(crumbs)}<p><a class="btn" href="${p}generateur/">Ouvrir le générateur</a> <a class="btn ghost" href="${p}par-lettre/">Noms par lettre</a></p>${grid(pagesDef.map((x) => card({ href: `${p}${x.slug}/`, title: x.h1, text: x.desc.split('.')[0] })), 'cols-2')}${ad('between-sections')}
<article><section><h2>Bien nommer son ${an.singular}</h2><p>${animal === 'chiens' ? 'Un nom de une ou deux syllabes, avec une sonorité nette (une consonne marquée, une voyelle ouverte), se retient facilement et se distingue des ordres usuels comme « assis » ou « non ». Évitez les noms proches des commandes ou du prénom d’un membre de la famille.' : 'Les chats réagissent surtout aux sons aigus et aux terminaisons en « i » ou « ou ». Un nom court, répété avec une voix douce avant les repas ou les jeux, finit par être reconnu, même si un chat choisit toujours quand répondre.'}</p></section></article>`)}`;
    add(p, { title: `Noms de ${an.plural} : idées et générateur`, desc, body, crumbs, jsonld: [ldWebPage(p, `Noms de ${an.plural}`, desc)], search: { y: 'Noms', a: animal, t: `Noms de ${an.plural}`, k: 'prénom idée liste' } }); }
}

/* ========== HUBS ANIMAUX ET SECTIONS ========== */
for (const animal of ['chiens', 'chats']) {
  const an = ANIMALS[animal];
  const crumbs = crumbsFor([an.label, an.path]);
  const arts = ARTICLES.filter((a) => a.animal === animal);
  const tools = TOOLS.filter((t) => t.animal === animal);
  const secCards = an.sections.map(([k, n, d]) => card({ href: `${an.path}${k}/`, title: n, text: d, icon: '' }));
  const body = `${hero({ kicker: an.emoji + ' ' + an.label, h1: `${an.label} : races, alimentation, santé et outils`, lead: an.intro })}${content(`${breadcrumbHtml(crumbs)}
${grid(secCards)}
${sectionHead('Races populaires', [`${an.path}races/`, 'Toutes les races'])}
${grid(BREEDS[animal].slice(0, 8).map((b) => card({ href: breedUrl(animal, b), title: b.nom, text: `${b.fiche.taille} · ${b.fiche.poids}` })))}
${ad('between-sections')}
${sectionHead('Outils gratuits', [`${an.path}outils/`, 'Tous les outils'])}
${grid(toolCards(tools.slice(0, 6).map((t) => t.id)))}
${sectionHead('Guides et questions fréquentes')}
${grid(arts.filter((a) => a.question).slice(0, 8).map((a) => card({ href: artUrl(a), title: a.h1, text: a.desc })), 'cols-2')}`)}`;
  add(an.path, { title: `${an.label} : races, alimentation, santé, outils`, desc: an.intro, body, crumbs, jsonld: [ldWebPage(an.path, an.label, an.intro)], search: { y: 'Rubrique', a: animal, t: an.label, k: `${an.singular} animal` } });
  for (const [k, n, d] of an.sections) {
    if (['races', 'outils', 'noms'].includes(k)) continue;
    const list = arts.filter((a) => a.section === k);
    const p = `${an.path}${k}/`;
    const crumbs2 = crumbsFor([an.label, an.path], [n, p]);
    if (!list.length) { errors.push(`Rubrique vide : ${p}`); continue; }
    const desc = `${d} : ${list.length} guide${list.length > 1 ? 's' : ''} clairs et prudents pour votre ${an.singular}, à compléter par l’avis de votre vétérinaire.`;
    const body2 = `${hero({ h1: `${n} : guides et conseils pour ${an.plural}`, lead: desc })}${content(`${breadcrumbHtml(crumbs2)}${grid(list.map((a) => card({ href: artUrl(a), title: a.h1, text: a.desc })), 'cols-2')}${ad('between-sections')}${k === 'alimentation' ? `<p>Pour calculer la ration, utilisez nos outils : <a href="${toolUrl(toolById[animal === 'chiens' ? 'chien-ration' : 'chat-ration'])}">calculateur de ration</a> et <a href="${toolUrl(toolById[animal === 'chiens' ? 'chien-calories' : 'chat-calories'])}">calculateur de calories</a>.</p>` : ''}<p class="small">${esc(VET_NOTE)}</p>`)}`;
    add(p, { title: `${n} : guides pour ${an.plural}`, desc, body: body2, crumbs: crumbs2, jsonld: [ldWebPage(p, n, desc)] });
  }
}

/* ========== CALENDRIERS ========== */
{
  const crumbs0 = crumbsFor(['Calendriers', '/calendriers/']);
  const desc0 = 'Calendriers de vaccination du chiot et du chaton, rappels annuels, suivi du poids, de la croissance et des repas : outils interactifs et tableaux imprimables.';
  add('/calendriers/', { title: 'Calendriers vétérinaires, suivi et rappels', desc: desc0, crumbs: crumbs0, jsonld: [ldWebPage('/calendriers/', 'Calendriers', desc0)],
    body: `${hero({ h1: 'Calendriers et suivis pour votre animal', lead: desc0 })}${content(`${breadcrumbHtml(crumbs0)}${grid(CALENDARS.map((c) => card({ href: `/calendriers/${c.slug}/`, title: c.h1, text: c.card, icon: '📅' })), 'cols-2')}${ad('between-sections')}<p class="small">${esc(VET_NOTE)} Les calendriers de vaccination et de vermifugation ci-dessous sont des repères : votre vétérinaire définit le protocole adapté à votre animal.</p>`)}` });
  for (const c of CALENDARS) {
    const p = `/calendriers/${c.slug}/`, crumbs = crumbsFor(['Calendriers', '/calendriers/'], [c.h1, p]);
    let main = '';
    if (c.tool) main = `<section class="tool" data-tool="${c.tool}"><form class="tool-form" novalidate>${toolById[c.tool].fields.map((f) => fieldHtml(c.tool, f)).join('')}<div class="tool-actions"><button class="btn" type="submit">Calculer le calendrier</button><button class="btn ghost" type="reset">Réinitialiser</button></div></form><div class="tool-result" role="status" aria-live="polite" hidden></div><noscript><p class="noscript">Ce calendrier nécessite JavaScript.</p></noscript></section>`;
    if (c.tracker) main = `<section class="tool" data-tracker="${c.tracker}"><form class="tool-form"><div class="field"><label for="tr-date">Date de la pesée</label><input id="tr-date" name="date" type="date" required></div><div class="field"><label for="tr-poids">Poids (kg)</label><input id="tr-poids" name="poids" type="number" inputmode="decimal" step="0.01" min="0.05" max="150" required placeholder="ex. 12,4"></div><div class="tool-actions"><button class="btn" type="submit">Ajouter la pesée</button><button class="btn ghost" type="button" data-print>Imprimer</button><button class="btn ghost" type="button" data-clear>Tout effacer</button></div></form><p class="tracker-msg small" role="status"></p><svg class="tracker-chart" viewBox="0 0 640 220" role="img" aria-label="Courbe de poids"></svg><div class="table-wrap"><table><caption>Historique des pesées</caption><thead><tr><th scope="col">Date</th><th scope="col">Poids</th><th scope="col">Évolution</th><th scope="col" class="no-print">Action</th></tr></thead><tbody></tbody></table></div><p class="small">Vos pesées restent enregistrées uniquement dans ce navigateur et ne sont jamais envoyées au site. Effacer les données du navigateur les supprime.</p></section>`;
    const body = `${hero({ kicker: 'Calendrier', h1: c.h1, lead: c.intro })}${content(`<div class="layout with-aside"><div>${breadcrumbHtml(crumbs)}<p class="disclaimer">${esc(VET_NOTE)}</p>${main}${ad('after-tool')}<article>${blocksHtml(c.blocks, { adAfter: 99 })}${c.html ? c.html() : ''}</article>${ad('before-faq')}${faqHtml(c.faq)}</div><div class="aside-box">${panel('Autres calendriers', CALENDARS.filter((x) => x !== c).map((x) => [`/calendriers/${x.slug}/`, x.h1]))}${panel('Outils', [[toolUrl(toolById['calculateur-dates-animal']), 'Calculateur de dates'], [toolUrl(toolById['chiot-croissance']), 'Croissance du chiot'], [toolUrl(toolById['chaton-croissance']), 'Croissance du chaton']])}</div></div>`)}`;
    add(p, { title: c.title, desc: c.desc, body, crumbs, type: 'article', jsonld: [ldArticle(p, c.h1, c.desc), ldFaq(c.faq)], scripts: [c.tool ? '/assets/tools.js' : null, c.tracker ? '/assets/tracker.js' : null].filter(Boolean), search: { y: 'Calendrier', a: c.animal || '', t: c.h1, k: 'calendrier suivi rappel', d: c.card } });
  }
}

/* ========== PAGES « BIENTÔT » (Phase 2) ========== */
for (const [k, v] of Object.entries(SOON)) {
  const p = `/${k}/`, crumbs = crumbsFor([v.label, p]);
  const body = `${hero({ kicker: v.emoji + ' ' + v.label, h1: `${v.label} : bientôt sur le site`, lead: v.text })}${content(`${breadcrumbHtml(crumbs)}<p>Nous préférons publier peu de pages, mais utiles. Cette rubrique sera ouverte lorsque ses fiches seront prêtes : ${v.items.map(esc).join(', ')}.</p><p>En attendant, plusieurs outils fonctionnent déjà pour ces animaux :</p><ul><li><a href="${toolUrl(toolById['animal-age'])}">Calculateur d’âge d’un animal</a></li><li><a href="${toolUrl(toolById['duree-de-vie-animal'])}">Durée de vie des animaux</a></li><li><a href="${toolUrl(toolById['calculateur-dates-animal'])}">Calculateur de dates pour vos rappels</a></li></ul><p><a class="btn" href="/">Retour à l’accueil</a></p>`)}`;
  add(p, { title: `${v.label} : rubrique en préparation`, desc: v.text, body, crumbs, noindex: true });
}

/* ========== FAQ GLOBALE, PLAN DU SITE, RECHERCHE, 404, LÉGAL ========== */
{
  const p = '/questions-frequentes/', crumbs = crumbsFor(['Questions fréquentes', p]);
  const desc = 'Les questions les plus posées par les propriétaires de chiens et de chats : sommeil, alimentation, comportement, santé.';
  const qs = (k) => ARTICLES.filter((a) => a.animal === k && a.question);
  add(p, { title: 'Questions fréquentes sur les chiens et les chats', desc, crumbs, jsonld: [ldWebPage(p, 'Questions fréquentes', desc)], body: `${hero({ h1: 'Questions fréquentes sur les chiens et les chats', lead: desc })}${content(`${breadcrumbHtml(crumbs)}${['chiens', 'chats'].map((k) => `${sectionHead(`${ANIMALS[k].emoji} Questions sur le ${ANIMALS[k].singular}`)}<ul class="qlist">${qs(k).map((a) => `<li><a href="${artUrl(a)}">${a.h1}</a></li>`).join('')}</ul>`).join('')}${ad('between-sections')}<p class="small">${esc(VET_NOTE)}</p>`)}` });
}
{
  const p = '/plan-du-site/', crumbs = crumbsFor(['Plan du site', p]);
  const li = (u, n) => `<li><a href="${u}">${n}</a></li>`;
  const sect = (k) => { const an = ANIMALS[k]; return `<h2>${an.emoji} ${an.label}</h2><div class="grid cols-2"><div><h3>Races</h3><ul>${BREEDS[k].map((b) => li(breedUrl(k, b), esc(b.nom))).join('')}</ul></div><div><h3>Guides</h3><ul>${ARTICLES.filter((a) => a.animal === k).map((a) => li(artUrl(a), a.h1)).join('')}</ul></div><div><h3>Outils et noms</h3><ul>${TOOLS.filter((t) => t.animal === k).map((t) => li(toolUrl(t), t.title)).join('')}${NAME_PAGES.filter((n) => n.animal === k).map((n) => li(`${an.path}noms/${n.slug}/`, n.h1)).join('')}</ul></div></div>`; };
  add(p, { title: 'Plan du site', desc: 'Toutes les pages du site : races, guides, outils, calendriers et pages d’information.', crumbs, body: `${hero({ h1: 'Plan du site' })}${content(`${breadcrumbHtml(crumbs)}${sect('chiens')}${sect('chats')}<h2>Outils généraux</h2><ul>${TOOLS.filter((t) => t.animal === 'general').map((t) => li(toolUrl(t), t.title)).join('')}</ul><h2>Calendriers</h2><ul>${CALENDARS.map((c) => li(`/calendriers/${c.slug}/`, c.h1)).join('')}</ul><h2>Informations</h2><ul>${li('/a-propos/', 'À propos')}${li('/contact/', 'Contact')}${li('/mentions-legales/', 'Mentions légales')}${li('/politique-confidentialite/', 'Politique de confidentialité')}${li('/politique-cookies/', 'Politique de cookies')}${li('/conditions-utilisation/', 'Conditions d’utilisation')}</ul>`)}`, jsonld: [ldWebPage(p, 'Plan du site', 'Plan du site')] });
}
add('/recherche/', { title: 'Recherche', desc: 'Recherchez une race, un outil, un guide ou un nom d’animal.', noindex: true, scripts: ['/assets/search.js'], crumbs: crumbsFor(['Recherche', '/recherche/']),
  body: `${hero({ h1: 'Recherche' })}${content(`<form id="search-page-form" class="hero-search" action="/recherche/" method="get" role="search"><label class="sr" for="q-page">Votre recherche</label><input id="q-page" name="q" type="search" placeholder="Maine Coon, âge du chat, noms de chiens…" autocomplete="off"><button type="submit">Chercher</button></form><div id="search-results" aria-live="polite"><noscript><p class="noscript">La recherche nécessite JavaScript. Utilisez les menus ou le <a href="/plan-du-site/">plan du site</a>.</p></noscript></div>`)}` });
{
  const popular = [...DOGS.slice(0, 4).map((b) => [breedUrl('chiens', b), b.nom]), ...CATS.slice(0, 4).map((b) => [breedUrl('chats', b), b.nom])];
  add('/404.html', { title: 'Page introuvable', desc: 'Cette page n’existe pas.', noindex: true,
    body: `${hero({ h1: 'Cette page n’existe pas.', lead: 'Elle a peut-être été déplacée. Essayez la recherche ou l’un de ces raccourcis.' })}${content(`<form class="hero-search" action="/recherche/" method="get" role="search"><label class="sr" for="q-404">Rechercher</label><input id="q-404" name="q" type="search" placeholder="Rechercher sur le site…"><button type="submit">Chercher</button></form>${grid([card({ href: '/chiens/', title: 'Chiens', icon: '🐶' }), card({ href: '/chats/', title: 'Chats', icon: '🐱' }), card({ href: '/outils/', title: 'Outils gratuits', icon: '🧮' }), card({ href: '/', title: 'Retour à l’accueil', icon: '🏠' })])}${sectionHead('Races populaires')}${grid(popular.map(([u, n]) => card({ href: u, title: n })))}`)}` });
  // Le fichier 404 doit se nommer 404.html à la racine
}
for (const lp of legalPages()) add(lp.path, { title: lp.title, desc: lp.desc, crumbs: crumbsFor([lp.h1, lp.path]), body: `${hero({ h1: lp.h1 })}${content(`${breadcrumbHtml(crumbsFor([lp.h1, lp.path]))}<article>${blocksHtml(lp.blocks, { adAfter: 999 })}</article>`, 'narrow')}`, jsonld: [ldWebPage(lp.path, lp.h1, lp.desc)] });

/* ========== ACCUEIL ========== */
{
  const homeQs = ARTICLES.filter((a) => a.question);
  const pick = (k, n) => homeQs.filter((a) => a.animal === k).slice(0, n);
  const latest = ARTICLES.filter((a) => !a.question || a.section === 'sante').slice(0, 6);
  const tiles = [
    ['/chiens/', '🐶', 'Chien'], ['/chats/', '🐱', 'Chat'], ['/petits-animaux/', '🐰', 'Petits animaux'], ['/oiseaux/', '🐦', 'Oiseaux'], ['/aquarium/', '🐠', 'Aquarium'], ['/reptiles/', '🦎', 'Reptiles'],
  ];
  const popTools = ['chien-age', 'chat-age', 'chiot-poids-adulte', 'chien-ration', 'chat-ration', 'chat-age-humain', 'chienne-mise-bas', 'convertisseur-age-animal-humain'];
  const body = `<div class="page-hero hero-home"><div class="wrap"><p class="kicker">Portail des animaux de compagnie</p><h1>${esc(SITE.tagline)}</h1><p class="lead">${esc(SITE.subtitle)}</p>
<form class="hero-search" action="/recherche/" method="get" role="search"><label class="sr" for="q-home">Rechercher</label><input id="q-home" name="q" type="search" placeholder="Rechercher : Maine Coon, âge du chien, ration…" autocomplete="off"><button type="submit">Chercher</button></form></div></div>
${content(`<div class="grid tiles">${tiles.map(([u, i, n]) => card({ href: u, title: n, icon: i })).join('')}</div>
${sectionHead('Outils populaires', ['/outils/', 'Tous les outils'])}${grid(toolCards(popTools), 'cols-2')}
${ad('between-sections')}
${sectionHead('Races populaires')}<div class="grid cols-2"><div class="panel"><h3>🐶 Chiens</h3><ul>${DOGS.slice(0, 8).map((b) => `<li><a href="${breedUrl('chiens', b)}">${esc(b.nom)}</a></li>`).join('')}<li><a href="/chiens/races/"><strong>Toutes les races de chiens →</strong></a></li></ul></div><div class="panel"><h3>🐱 Chats</h3><ul>${CATS.slice(0, 8).map((b) => `<li><a href="${breedUrl('chats', b)}">${esc(b.nom)}</a></li>`).join('')}<li><a href="/chats/races/"><strong>Toutes les races de chats →</strong></a></li></ul></div></div>
${sectionHead('Questions fréquentes', ['/questions-frequentes/', 'Toutes les questions'])}<div class="grid cols-2"><div class="panel"><ul>${pick('chiens', 6).map((a) => `<li><a href="${artUrl(a)}">${a.h1}</a></li>`).join('')}</ul></div><div class="panel"><ul>${pick('chats', 6).map((a) => `<li><a href="${artUrl(a)}">${a.h1}</a></li>`).join('')}</ul></div></div>
${sectionHead('Derniers guides')}${grid(latest.map((a) => card({ href: artUrl(a), title: a.h1, text: a.desc, badge: ANIMALS[a.animal].label })), 'cols-2')}
<section><h2>Une démarche utile et prudente</h2><p>Ici, la qualité passe avant la quantité : chaque fiche race est rédigée pour sa race, chaque outil apporte un vrai calcul expliqué, et les sujets de santé restent prudents. Nous distinguons toujours l’information générale du diagnostic, et nous invitons à consulter un vétérinaire dès que la situation le demande.</p></section>`)}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: abs('/'), inLanguage: 'fr-FR', description: SITE.subtitle, potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/recherche/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }, ldWebPage('/', SITE.name, SITE.subtitle)];
  add('/', { title: `${SITE.name} : guides, races et calculateurs pour animaux`, desc: SITE.subtitle, body, jsonld: ld });
}

/* ========== ÉCRITURE ========== */
const write = (rel, data) => { const f = path.join(DIST, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
for (const pg of pages) write(pg.path.endsWith('.html') ? pg.path.slice(1) : path.join(pg.path, 'index.html'), pg.html);
// Assets
fs.cpSync(path.join(ROOT, 'src/assets'), path.join(DIST, 'assets'), { recursive: true });
if (fs.existsSync(path.join(ROOT, 'public'))) fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
write('search-index.json', JSON.stringify(searchIdx));
const urls = pages.filter((p) => p.indexable).map((p) => p.path);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${dateISO}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

// Rapport
const byType = {};
for (const p of pages) { const k = p.path.split('/')[1] || 'accueil'; byType[k] = (byType[k] || 0) + 1; }
console.log(`✔ ${pages.length} pages générées (${urls.length} indexables) dans ./dist`);
console.log(`  races chiens: ${DOGS.length} · races chats: ${CATS.length} · outils: ${TOOLS.length} · articles: ${ARTICLES.length}`);
if (errors.length) { console.error('Avertissements :\n - ' + errors.join('\n - ')); process.exitCode = 1; }
