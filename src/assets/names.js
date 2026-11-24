// Générateur de noms : filtres sexe / longueur / style / lettre, tirage aléatoire.
const root = document.querySelector('[data-names]');
if (root) {
  const url = root.getAttribute('data-names');
  const form = root.querySelector('form');
  const out = root.querySelector('.name-result');
  const count = root.querySelector('.name-count');
  let names = [];
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const filtered = () => {
    const f = Object.fromEntries(new FormData(form));
    return names.filter(([n, sx, tags]) => {
      if (f.sexe && f.sexe !== 'tous' && sx !== f.sexe && sx !== 'x') return false;
      const len = n.length;
      if (f.longueur === 'court' && len > 5) return false;
      if (f.longueur === 'long' && len < 7) return false;
      if (f.style && f.style !== 'tous' && !tags.includes(f.style)) return false;
      if (f.lettre && f.lettre !== 'toutes' && norm(n[0]) !== f.lettre) return false;
      return true;
    });
  };
  const pick = () => {
    const list = filtered();
    out.replaceChildren();
    count.textContent = list.length ? `${list.length} nom${list.length > 1 ? 's' : ''} correspondent à vos critères.` : '';
    if (!list.length) { const p = document.createElement('p'); p.className = 'tool-error'; p.textContent = 'Aucun nom ne correspond à ces critères : essayez d’en retirer un.'; out.append(p); return; }
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    a.slice(0, 8).forEach(([n]) => { const s = document.createElement('span'); s.className = 'name-chip'; s.textContent = n; out.append(s); });
  };
  fetch(url).then((r) => r.json()).then((j) => { names = j; pick(); }).catch(() => { out.textContent = 'La liste de noms n’a pas pu être chargée.'; });
  form.addEventListener('submit', (e) => { e.preventDefault(); pick(); });
  form.addEventListener('change', () => { if (names.length) pick(); });
}
