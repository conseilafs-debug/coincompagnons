// Interface des calculateurs : lit le formulaire, appelle le moteur de calcul, affiche le résultat.
import { TOOLS, toISO, todayUTC } from '/assets/calc.js';

const root = document.querySelector('[data-tool]');
if (root) {
  const id = root.getAttribute('data-tool');
  const form = root.querySelector('form');
  const out = root.querySelector('.tool-result');
  const today = toISO(todayUTC());

  const setDefaults = () => {
    form.querySelectorAll('[data-default="today"]').forEach((el) => { if (!el.value) el.value = today; });
  };
  setDefaults();
  // Pré-remplissage par l'URL (liens depuis les fiches races) : ?taille=grand&poids_adulte=30
  const params = new URLSearchParams(location.search);
  params.forEach((val, key) => {
    const el = form.elements[key];
    if (!el || el.type === 'hidden') return;
    if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === val)) return;
    el.value = val;
  });

  const clearErrors = () => {
    form.querySelectorAll('.field').forEach((f) => { f.classList.remove('invalid'); const e = f.querySelector('.err'); if (e) e.remove(); });
  };

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  const render = (res) => {
    out.replaceChildren();
    out.hidden = false;
    if (!res.ok) {
      const b = el('div', 'tool-error', res.error); b.setAttribute('role', 'alert'); out.append(b); return;
    }
    const dl = el('dl', 'result-list');
    res.rows.forEach((r) => {
      const row = el('div', 'result-row' + (r.strong ? ' strong' : ''));
      row.append(el('dt', '', r.label), el('dd', '', r.value));
      if (r.note) row.append(el('span', 'note', r.note));
      dl.append(row);
    });
    out.append(dl);
    (res.tables || []).forEach((t) => {
      const wrap = el('div', 'table-wrap'); const table = el('table'); table.append(el('caption', '', t.caption));
      const thead = el('thead'); const trh = el('tr'); t.head.forEach((h) => { const th = el('th', '', h); th.scope = 'col'; trh.append(th); }); thead.append(trh);
      const tbody = el('tbody'); t.rows.forEach((r) => { const tr = el('tr'); r.forEach((c, i) => { const cell = el(i === 0 ? 'th' : 'td', '', c); if (i === 0) cell.scope = 'row'; tr.append(cell); }); tbody.append(tr); });
      table.append(thead, tbody); wrap.append(table); out.append(wrap);
    });
    if (res.notes?.length) { const n = el('div', 'result-notes'); res.notes.filter(Boolean).forEach((t) => n.append(el('p', '', t))); out.append(n); }
    out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const values = () => {
    const v = {};
    [...form.elements].forEach((e) => { if (e.name) v[e.name] = e.value; });
    return v;
  };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    clearErrors();
    const v = values();
    // Champs obligatoires vides : message à côté du champ
    let bad = false;
    form.querySelectorAll('[required]').forEach((inp) => {
      if (!String(inp.value).trim()) {
        bad = true;
        const f = inp.closest('.field'); f.classList.add('invalid');
        const e = el('span', 'err', 'Ce champ est obligatoire.'); e.id = inp.id + '-err'; f.append(e);
        inp.setAttribute('aria-describedby', e.id);
      }
    });
    if (bad) { render({ ok: false, error: 'Veuillez renseigner les champs signalés en rouge.' }); return; }
    let res;
    try { res = TOOLS[id](v); } catch (e) { res = { ok: false, error: 'Le calcul n’a pas pu être effectué. Vérifiez les valeurs saisies.' }; }
    render(res);
  });
  form.addEventListener('reset', () => { setTimeout(() => { clearErrors(); setDefaults(); out.hidden = true; out.replaceChildren(); }, 0); });
}
