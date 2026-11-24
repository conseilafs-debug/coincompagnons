import { SITE, ANIMALS, SOON } from '../site.mjs';
import { esc, abs } from './html.mjs';

const NAV = [
  ['/chiens/', '🐶 Chiens'], ['/chats/', '🐱 Chats'], ['/outils/', 'Outils'], ['/calendriers/', 'Calendriers'], ['/questions-frequentes/', 'Questions'],
];

export function breadcrumbHtml(crumbs) {
  if (!crumbs || crumbs.length < 2) return '';
  return `<nav class="breadcrumb" aria-label="Fil d’Ariane"><ol>${crumbs.map(([n, u], i) => `<li>${i < crumbs.length - 1 ? `<a href="${u}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`}</li>`).join('')}</ol></nav>`;
}
export function breadcrumbLd(crumbs) {
  if (!crumbs || crumbs.length < 2) return null;
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(u) })) };
}

export function layout({ title, desc, path, body, crumbs, noindex = false, jsonld = [], scripts = [], type = 'website', h1Skip = false }) {
  const full = title.includes(SITE.name) || title.length + SITE.name.length + 3 > 66 ? title : `${title} | ${SITE.name}`;
  const ld = [...jsonld, breadcrumbLd(crumbs)].filter(Boolean);
  const ads = SITE.adsense.publisherId;
  const adConfig = ads ? `<script>window.__ADS__=${JSON.stringify({ client: SITE.adsense.publisherId, slots: SITE.adsense.slots })}</script><script src="/assets/ads.js" defer></script>` : '';
  const moduleScripts = scripts.map((s) => `<script type="module" src="${s}"></script>`).join('');
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${abs(path)}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="${SITE.locale}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs('/assets/og-image.png')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1f5f5b">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="${esc(SITE.name)} — accueil"><span class="brand-mark" aria-hidden="true">🐾</span><span class="brand-name">${esc(SITE.name)}</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav id="menu" class="main-nav" aria-label="Navigation principale">
      <ul>${NAV.map(([u, n]) => `<li><a href="${u}"${path.startsWith(u) && u !== '/' ? ' aria-current="true"' : ''}>${n}</a></li>`).join('')}</ul>
      <form class="search-form" action="/recherche/" method="get" role="search">
        <label class="sr" for="q-header">Rechercher sur le site</label>
        <input id="q-header" name="q" type="search" placeholder="Rechercher : race, outil, guide…" autocomplete="off">
        <button type="submit" aria-label="Lancer la recherche">🔍</button>
      </form>
    </nav>
  </div>
</header>
<main id="contenu">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="footer-brand">🐾 ${esc(SITE.name)}</p>
      <p>${esc(SITE.tagline)}.</p>
      <p class="small">Les informations publiées sont générales et ne remplacent jamais l’avis d’un vétérinaire. Les outils de calcul donnent des estimations indicatives.</p>
    </div>
    <div>
      <p class="footer-title">Explorer</p>
      <ul>
        <li><a href="/chiens/">Chiens</a></li><li><a href="/chats/">Chats</a></li>
        <li><a href="/chiens/races/">Races de chiens</a></li><li><a href="/chats/races/">Races de chats</a></li>
        <li><a href="/outils/">Outils gratuits</a></li><li><a href="/calendriers/">Calendriers</a></li>
        ${Object.entries(SOON).map(([k, v]) => `<li><a href="/${k}/">${v.label}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <p class="footer-title">Le site</p>
      <ul>
        <li><a href="/a-propos/">À propos</a></li><li><a href="/contact/">Contact</a></li><li><a href="/plan-du-site/">Plan du site</a></li>
        <li><a href="/mentions-legales/">Mentions légales</a></li><li><a href="/politique-confidentialite/">Confidentialité</a></li>
        <li><a href="/politique-cookies/">Cookies</a></li><li><a href="/conditions-utilisation/">Conditions d’utilisation</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap small footer-bottom">© ${SITE.buildDate.slice(0, 4)} ${esc(SITE.name)} — Site financé par la publicité.</div>
</footer>
<script src="/assets/app.js" defer></script>
${moduleScripts}
${adConfig}
</body>
</html>`;
}

export const hero = ({ h1, lead, kicker }) => `<div class="page-hero"><div class="wrap">${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}<h1>${h1}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}</div></div>`;
