// Vérifications statiques de dist/ : liens, titres, méta, JSON-LD, sitemap, robots.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
const DIST = 'dist';
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(p); } })(DIST);
const htmls = files.filter((f) => f.endsWith('.html'));
const urlOf = (f) => '/' + relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
const exists = (u) => { u = u.split('#')[0].split('?')[0]; if (!u) return true; const p = join(DIST, decodeURIComponent(u)); return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html'))); };
const errors = [], warns = [];
const titles = new Map(), descs = new Map(), h1s = new Map();
for (const f of htmls) {
  const html = readFileSync(f, 'utf8'); const url = urlOf(f);
  const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const d = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const h = [...html.matchAll(/<h1[ >][^]*?<\/h1>/g)];
  const noindex = /name="robots" content="[^"]*noindex/.test(html);
  if (!t) errors.push(`${url}: title manquant`);
  if (h.length !== 1) errors.push(`${url}: ${h.length} h1`);
  if (!/rel="canonical"/.test(html)) errors.push(`${url}: canonical manquant`);
  if (!noindex) {
    if (!d) errors.push(`${url}: description manquante`);
    if (t && t.length > 70) warns.push(`${url}: title ${t.length} car.`);
    if (d && (d.length < 70 || d.length > 175)) warns.push(`${url}: description ${d.length} car.`);
    if (t) (titles.get(t) || titles.set(t, []).get(t)).push(url);
    if (d) (descs.get(d) || descs.set(d, []).get(d)).push(url);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { errors.push(`${url}: JSON-LD invalide`); } }
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/.test(u)) continue;
    if (!u.startsWith('/')) { warns.push(`${url}: lien relatif ${u}`); continue; }
    if (!exists(u)) errors.push(`${url}: lien cassé → ${u}`);
  }
  for (const m of html.matchAll(/ id="([^"]+)"/g)) { /* ids doublons */ }
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((x) => x[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) warns.push(`${url}: id en double ${[...new Set(dup)].join(',')}`);
}
for (const [k, v] of titles) if (v.length > 1) errors.push(`titre dupliqué (${v.length}) : ${k} → ${v.slice(0, 3).join(', ')}`);
for (const [k, v] of descs) if (v.length > 1) errors.push(`description dupliquée (${v.length}) : ${v.slice(0, 3).join(', ')}`);
// sitemap / robots
const sm = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
if (!sm) errors.push('sitemap.xml absent');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const l of locs) { const p = new URL(l).pathname; if (!exists(p)) errors.push(`sitemap: ${p} inexistant`); }
if (new Set(locs).size !== locs.length) errors.push('sitemap: doublons');
const robots = existsSync(join(DIST, 'robots.txt')) ? readFileSync(join(DIST, 'robots.txt'), 'utf8') : '';
if (!/Sitemap:/i.test(robots)) errors.push('robots.txt sans Sitemap');
if (!existsSync(join(DIST, '404.html'))) errors.push('404.html absent');
console.log(`Pages HTML : ${htmls.length} · URLs sitemap : ${locs.length}`);
warns.slice(0, 40).forEach((w) => console.log('⚠', w)); if (warns.length > 40) console.log(`⚠ … +${warns.length - 40} avertissements`);
errors.slice(0, 60).forEach((e) => console.log('✖', e)); if (errors.length > 60) console.log(`✖ … +${errors.length - 60} erreurs`);
console.log(errors.length ? `\n${errors.length} erreur(s)` : '\n✔ Aucune erreur bloquante');
process.exit(errors.length ? 1 : 0);
