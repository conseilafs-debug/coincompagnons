import { SITE } from '../site.mjs';

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const strip = (h) => String(h ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
export const abs = (p) => SITE.url + p;
export const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const stars = (n, max = 5) => `<span class="stars" role="img" aria-label="${n} sur ${max}">${'●'.repeat(n)}<span class="off">${'●'.repeat(max - n)}</span></span>`;

export function ad(name) {
  return `<aside class="ad-slot" data-slot="${name}" aria-label="Publicité" hidden><span class="ad-label">Publicité</span></aside>`;
}

export function card({ href, title, text = '', badge = '', icon = '', cls = '' }) {
  return `<a class="card ${cls}" href="${href}">${icon ? `<span class="card-icon" aria-hidden="true">${icon}</span>` : ''}<span class="card-body">${badge ? `<span class="badge">${esc(badge)}</span>` : ''}<span class="card-title">${esc(title)}</span>${text ? `<span class="card-text">${esc(text)}</span>` : ''}</span></a>`;
}
export const grid = (items, cls = '') => `<div class="grid ${cls}">${items.join('')}</div>`;

export function table({ caption, head, rows, cls = '' }) {
  return `<div class="table-wrap"><table class="${cls}">${caption ? `<caption>${esc(caption)}</caption>` : ''}<thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function faqHtml(faq) {
  if (!faq?.length) return '';
  return `<section class="faq" id="faq"><h2>Questions fréquentes</h2>${faq.map(([q, a]) => `<details><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('')}</section>`;
}

export function blocksHtml(blocks, { adAfter = 1 } = {}) {
  let out = '', n = 0;
  for (const b of blocks || []) {
    out += `<section>${b.h ? `<h2>${b.h}</h2>` : ''}`;
    for (const p of b.p || []) out += `<p>${p}</p>`;
    if (b.ul) out += `<ul>${b.ul.map((x) => `<li>${x}</li>`).join('')}</ul>`;
    if (b.ol) out += `<ol>${b.ol.map((x) => `<li>${x}</li>`).join('')}</ol>`;
    if (b.table) out += table(b.table);
    if (b.callout) out += `<aside class="callout ${b.callout.type || 'info'}"><strong>${b.callout.title || 'À retenir'}</strong><p>${b.callout.text}</p></aside>`;
    out += '</section>';
    n++;
    if (n === adAfter) out += ad('in-article');
  }
  return out;
}

export const VET_NOTE = 'Les informations de cette page sont générales et ne remplacent pas l’avis d’un vétérinaire. En cas de doute ou de symptômes inhabituels, contactez votre vétérinaire.';
