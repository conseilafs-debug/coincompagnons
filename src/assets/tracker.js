// Suivi du poids : données conservées uniquement dans le navigateur (localStorage), jamais envoyées.
const root = document.querySelector('[data-tracker]');
if (root) {
  const key = 'suivi-poids-' + root.getAttribute('data-tracker');
  const form = root.querySelector('form');
  const tbody = root.querySelector('tbody');
  const svg = root.querySelector('svg');
  const msg = root.querySelector('.tracker-msg');
  let data = [];
  const load = () => { try { data = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { data = []; } };
  const save = () => { try { localStorage.setItem(key, JSON.stringify(data)); msg.textContent = ''; } catch (e) { msg.textContent = 'Impossible d’enregistrer dans ce navigateur (stockage désactivé). Les données seront perdues à la fermeture de la page.'; } };
  const fmt = (d) => new Date(d + 'T00:00:00Z').toLocaleDateString('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
  const nf = (n) => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

  const draw = () => {
    svg.replaceChildren();
    const ns = 'http://www.w3.org/2000/svg';
    if (data.length < 2) { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', 20); t.setAttribute('y', 110); t.setAttribute('fill', '#5a6872'); t.textContent = 'Ajoutez au moins deux pesées pour voir la courbe.'; svg.append(t); return; }
    const W = 640, H = 220, p = { l: 46, r: 14, t: 14, b: 30 };
    const xs = data.map((d) => Date.parse(d.date)), ys = data.map((d) => d.kg);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys) * 0.95, y1 = Math.max(...ys) * 1.05;
    const X = (v) => p.l + ((v - x0) / (x1 - x0 || 1)) * (W - p.l - p.r), Y = (v) => H - p.b - ((v - y0) / (y1 - y0 || 1)) * (H - p.t - p.b);
    const line = document.createElementNS(ns, 'polyline');
    line.setAttribute('points', data.map((d) => `${X(Date.parse(d.date))},${Y(d.kg)}`).join(' '));
    line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#1f5f5b'); line.setAttribute('stroke-width', '3'); svg.append(line);
    data.forEach((d) => { const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', X(Date.parse(d.date))); c.setAttribute('cy', Y(d.kg)); c.setAttribute('r', 4); c.setAttribute('fill', '#c85f33'); svg.append(c); });
    [y0, (y0 + y1) / 2, y1].forEach((v) => { const t = document.createElementNS(ns, 'text'); t.setAttribute('x', 4); t.setAttribute('y', Y(v) + 4); t.setAttribute('font-size', '12'); t.setAttribute('fill', '#5a6872'); t.textContent = nf(v) + ' kg'; svg.append(t); });
  };

  const render = () => {
    data.sort((a, b) => a.date.localeCompare(b.date));
    tbody.replaceChildren();
    data.forEach((d, i) => {
      const tr = document.createElement('tr');
      const prev = data[i - 1];
      const diff = prev ? d.kg - prev.kg : null;
      const cells = [fmt(d.date), nf(d.kg) + ' kg', diff == null ? '—' : (diff > 0 ? '+' : '') + nf(diff) + ' kg'];
      cells.forEach((c, k) => { const td = document.createElement(k === 0 ? 'th' : 'td'); if (k === 0) td.scope = 'row'; td.textContent = c; tr.append(td); });
      const td = document.createElement('td'); td.className = 'no-print';
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn ghost'; b.textContent = 'Supprimer'; b.setAttribute('aria-label', 'Supprimer la pesée du ' + fmt(d.date));
      b.addEventListener('click', () => { data.splice(i, 1); save(); render(); });
      td.append(b); tr.append(td); tbody.append(tr);
    });
    draw();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = form.elements.date.value, kg = Number(String(form.elements.poids.value).replace(',', '.'));
    if (!date) { msg.textContent = 'Indiquez la date de la pesée.'; return; }
    if (!(kg > 0 && kg < 150)) { msg.textContent = 'Indiquez un poids valide en kilos (par exemple 12,4).'; return; }
    data = data.filter((d) => d.date !== date); data.push({ date, kg }); save(); render(); form.elements.poids.value = '';
  });
  root.querySelector('[data-print]').addEventListener('click', () => window.print());
  root.querySelector('[data-clear]').addEventListener('click', () => { if (data.length && confirm('Effacer toutes les pesées enregistrées dans ce navigateur ?')) { data = []; save(); render(); } });
  form.elements.date.value = new Date().toISOString().slice(0, 10);
  load(); render();
}
