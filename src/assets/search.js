// Recherche interne : index statique /search-index.json, calcul côté navigateur.
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const box = document.getElementById('search-results');
const input = document.getElementById('q-page');
const form = document.getElementById('search-page-form');
let index = null;

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function score(item, tokens) {
  const t = norm(item.t), k = norm(item.k || ''), d = norm(item.d || '');
  let s = 0;
  for (const tok of tokens) {
    let ts = 0;
    if (t === tok) ts = 14; else if (t.startsWith(tok)) ts = 10; else if (t.includes(' ' + tok)) ts = 8; else if (t.includes(tok)) ts = 6;
    else if (k.includes(tok)) ts = 4; else if (d.includes(tok)) ts = 2;
    if (!ts) return 0;
    s += ts;
  }
  if (tokens.length > 1 && t.includes(tokens.join(' '))) s += 8;
  return s;
}

function card(it) {
  const a = el('a', 'card'); a.href = it.u;
  const body = el('span', 'card-body');
  body.append(el('span', 'badge', it.y), el('span', 'card-title', it.t));
  if (it.d) body.append(el('span', 'card-text', it.d));
  a.append(body);
  return a;
}

function run(q) {
  box.replaceChildren();
  const tokens = norm(q).split(' ').filter(Boolean);
  if (!tokens.length) { box.append(el('p', '', 'Saisissez un mot : une race, un outil, une question, un nom…')); return; }
  const hits = index.map((it) => ({ it, s: score(it, tokens) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.it.t.localeCompare(b.it.t, 'fr')).map((x) => x.it);
  const h = el('h2', '', hits.length ? `${hits.length} résultat${hits.length > 1 ? 's' : ''} pour « ${q.trim()} »` : `Aucun résultat pour « ${q.trim()} »`);
  box.append(h);
  const main = hits.slice(0, 24);
  if (main.length) { const g = el('div', 'grid cols-2'); main.forEach((it) => g.append(card(it))); box.append(g); }
  else { box.append(el('p', '', 'Essayez un mot plus court, ou parcourez les rubriques ci-dessous.')); }
  // Pour une race : proposer les outils et pages associés à l'espèce
  const race = hits.find((x) => x.y === 'Race');
  if (race) {
    const rel = index.filter((it) => it.a === race.a && ['Outil', 'Alimentation', 'Noms'].includes(it.y) && !main.includes(it)).slice(0, 8);
    if (rel.length) {
      box.append(el('h2', '', `Pour votre ${race.a === 'chats' ? 'chat' : 'chien'} ${race.t.split(' :')[0]}`));
      const g = el('div', 'grid cols-2'); rel.forEach((it) => g.append(card(it))); box.append(g);
    }
  }
}

if (box && input) {
  const start = new URLSearchParams(location.search).get('q') || '';
  input.value = start;
  fetch('/search-index.json').then((r) => r.json()).then((j) => {
    index = j;
    run(start);
    input.addEventListener('input', () => run(input.value));
  }).catch(() => { box.replaceChildren(el('p', 'tool-error', 'La recherche n’a pas pu être chargée. Utilisez les menus pour naviguer.')); });
  form.addEventListener('submit', (e) => { e.preventDefault(); if (index) { run(input.value); history.replaceState(null, '', '?q=' + encodeURIComponent(input.value)); } });
}
