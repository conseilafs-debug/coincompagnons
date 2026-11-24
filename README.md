# Le Coin des Compagnons — portail français chiens & chats

Site statique (Node, zéro dépendance) : ~191 pages, 30 outils, 20 races de chiens, 20 races de chats, 58 guides, noms, calendriers.
Monétisation : Google AdSense uniquement (aucune affiliation produit).

## Commandes
```
npm run build   # génère dist/
npm test        # tests du moteur de calcul
node scripts/check.mjs   # liens, titres, méta, JSON-LD, sitemap
```

## Déploiement Cloudflare Pages
1. Pousser ce dépôt sur GitHub.
2. Cloudflare → Workers & Pages → Create → Pages → Connect to Git.
3. Build command : `node build.mjs` — Output directory : `dist` — variable `NODE_VERSION=22`.
4. L'URL `*.pages.dev` est servie. Définir `SITE_URL` (variable d'environnement) sur cette URL pour que canonical, sitemap et Open Graph soient corrects.

## Variables d'environnement
| Variable | Rôle |
|---|---|
| `SITE_URL` | URL publique (sans slash final) |
| `ADSENSE_PUBLISHER_ID` | `ca-pub-XXXXXXXXXXXXXXXX` — active le chargement AdSense (après consentement) |
| `ADSENSE_SLOT_*` | identifiants d'emplacements (voir `src/site.mjs`) |
| `LEGAL_EDITEUR`, `LEGAL_STATUT`, `LEGAL_ADRESSE`, `LEGAL_EMAIL`, `LEGAL_DIRECTEUR` | mentions légales (obligatoires avant publication) |

## Domaine, AdSense, Search Console
- **Domaine** : ajouter un domaine personnalisé dans Pages, puis mettre à jour `SITE_URL`.
- **AdSense** : ajouter le site, renseigner `ADSENSE_PUBLISHER_ID` et les slots, publier `ads.txt` dans `public/`. Une bannière de consentement (CMP certifiée Google) est nécessaire avant d'afficher des annonces dans l'EEE.
- **Search Console** : ajouter la propriété, vérifier (DNS ou balise), soumettre `/sitemap.xml`.

## Ajouter du contenu
Races : `src/data/dogs.mjs` / `cats.mjs`. Articles : `src/data/articles-*.mjs`. Outils : `src/data/tools.mjs` + `src/assets/calc.js`.
