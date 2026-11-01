# Audit technique, SEO et marketing — sitraka17.github.io

_Date : 1er novembre 2026_

Légende : ✅ corrigé dans cette branche · ⚠️ action de ta part nécessaire · 💡 recommandation

---

## 1. Technique

| Sévérité | Constat | Statut |
|---|---|---|
| 🔴 Critique | **Page Teachings entièrement cassée** : dans `assets/js/teachings.js`, le texte Python `f"Bonus: ${bonus}"` était dans un template literal JS → `ReferenceError: bonus is not defined` au chargement, aucune leçon ne fonctionnait. | ✅ échappé en `\${bonus}` |
| 🔴 Critique | `main-effects.js` commençait par `hljs.highlightAll()` sans garde. Si le CDN highlight.js est bloqué (adblock, réseau d'entreprise, panne), **tout le fichier plante** : plus d'animation de frappe, plus de glow, plus de particules. | ✅ appel protégé (`if (window.hljs)`) |
| 🟠 Élevé | highlight.js (CSS + JS, ~120 Ko) chargé sur `index.html` et `tools.html` alors qu'aucun bloc `<pre>/<code>` n'existe. | ✅ supprimé |
| 🟠 Élevé | Images lourdes : `Engineering.jpg` 404 Ko (800 px), `code.jpeg` 247 Ko (1920 px, affichée en ~600 px). | ✅ recompressées : 61 Ko et 75 Ko (−79 %) |
| 🟠 Élevé | `<link rel="preload" fetchpriority="high">` sur `pic01.jpg`, une image située dans un article **masqué** au chargement → bande passante gaspillée sur le chemin critique. | ✅ supprimé |
| 🟡 Moyen | Images sans `width`/`height` → décalage de mise en page (CLS). | ✅ ajoutés + `decoding="async"` |
| 🟡 Moyen | `CoffreFort/index.html` : ancienne copie du portfolio, chemins relatifs cassés (7 fichiers en 404), infos obsolètes, lien vide vers sitraka.fr. Contenu dupliqué indexable. | ✅ `noindex` + canonical vers l'accueil |
| 🟡 Moyen | Notes internes publiées par Jekyll (`CoffreFort/orders.md`, `images/Descriptions.md`). | ✅ exclues dans `_config.yml` |
| 🟡 Moyen | Pas de page 404 personnalisée. | ✅ `404.html` ajoutée |
| 🟢 Faible | Deux versions de Font Awesome chargées (v5 local via `@import` dans `main.css` + v6 CDN). | 💡 migrer les classes vers FA6 et supprimer la v5 (~100 Ko + un `@import` bloquant) |
| 🟢 Faible | `main.css` importe aussi Google Fonts *Source Sans Pro* qui n'est plus utilisée (Inter l'a remplacée). | 💡 retirer l'`@import` |

## 2. Accessibilité

| Constat | Statut |
|---|---|
| `user-scalable=no` empêchait le zoom sur mobile (échec WCAG 1.4.4). | ✅ retiré partout |
| Menu de la page Teachings composé de `<div>` cliquables, inaccessibles au clavier. | ✅ `role="button"`, `tabindex="0"`, Entrée/Espace gérés |
| Sous-titre animé lettre par lettre lu en boucle par les lecteurs d'écran. | ✅ `aria-hidden`, remplacé par une tagline statique |
| Textes alternatifs trompeurs (`alt="Sitraka Forler"` sur une bannière abstraite, `alt="Code"`). | ✅ réécrits |
| Pas de `lang` sur `CoffreFort/index.html`. | ✅ ajouté |

## 3. SEO

| Constat | Statut |
|---|---|
| **Image Open Graph** déclarée 1200×630 mais réellement 1024×1024 → aperçus LinkedIn/X recadrés au hasard. | ✅ régénérée en 1200×630 |
| JSON-LD : `founder` utilisé sur `Person` (propriété invalide — elle appartient à `Organization`), `jobTitle` obsolète. | ✅ refonte en `@graph` : `ProfilePage` → `Person` ↔ `Organization` (LuxAIOps, `founder`) ↔ `WebSite` |
| Page Teachings : titre générique, pas d'auteur ni de type éducatif. | ✅ title orienté requêtes (« Free SQL, Python & Finance Data Lessons »), `LearningResource`, `teaches`, `author` |
| Page Tools : pas de fil d'Ariane structuré. | ✅ `BreadcrumbList` + `author` |
| **Maillage interne** : `teachings.html` n'était lié depuis **aucune** page → page orpheline ; l'article Skills (`#code`) absent du menu. | ✅ liens dans le menu, l'intro et le footer |
| Favicon emoji 🚀 (data-URI), pas d'icône iOS. | ✅ `favicon.svg` + `apple-touch-icon.png` « SF » |
| `meta keywords` (ignorée par Google) et `meta language` (non standard). | ✅ supprimées |
| `og:site_name`, `og:image:width/height`, `twitter:site/image` manquants sur Tools et Teachings. | ✅ ajoutés |
| `sitemap.xml` : `lastmod` périmé. | ✅ mis à jour |
| Contenu mélangé FR/EN sur une page déclarée `en` (« Indicateurs clés de performance · Cybersécurité… »), coquilles (`DecSecOps`, `Prototypying`, `Ai Ops`, `LuxAiOps`/`LuxAIOps`). | ✅ harmonisé |
| Toutes les sections de l'accueil sont sur une seule URL (template Dimension à base d'ancres) : une seule page à positionner pour « Data Scientist Luxembourg », « MLOps Luxembourg », « AIOps »… | 💡 créer des pages dédiées (ex. `/aiops-luxembourg.html`, `/mlops-consulting.html`) avec un vrai contenu long |
| Le site est sur `github.io` alors que `sitraka.lu` existe : deux domaines se concurrencent. | 💡 choisir un domaine principal ; idéalement servir ce portfolio sur un sous-domaine de `sitraka.lu` (fichier `CNAME`) |
| Teachings : les 12 leçons sont injectées en JS sur une seule URL → seule la leçon 1 est réellement indexée. | 💡 une page HTML statique par leçon (gros potentiel de trafic longue traîne : « SQL index optimization », « pandas groupby finance »…) |

### Balises — couverture complète (passe 2)

Chaque page HTML a été vérifiée par script : `title`, `description` (≤ 155 car.), `lang`, `charset`, `viewport`, `robots`, `author`, `theme-color`, `canonical`, favicon + `apple-touch-icon`, Open Graph complet (`type`, `title`, `description`, `url`, `image` + dimensions + `alt`, `site_name`, `locale`), Twitter Card complète, JSON-LD valide.

| Page | Indexation | Statut |
|---|---|---|
| `index.html` | index | ✅ complet (description raccourcie à 149 car.) |
| `tools.html` | index | ✅ complété (`author`, `theme-color`, `og:locale`, `og:image:alt`, `twitter:creator`) |
| `teachings.html` | index | ✅ complété + lien vers le cours FR |
| `CoffreFort/iae.html` | index | ✅ **page orpheline sans aucune balise** → balises FR complètes, JSON-LD `Article`/`LearningResource` + fil d'Ariane, ajoutée au sitemap et liée depuis Teachings ; 4 images manquantes (404) remplacées par des drapeaux SVG et pictogrammes |
| `CoffreFort/index.html` | noindex | ✅ balises + chemins CSS/JS/images réparés |
| `404.html` | noindex | ✅ balises complètes (pas de canonical, volontairement) |

## 4. Marketing / conversion

| Constat | Statut |
|---|---|
| Accueil sans proposition de valeur : nom + titre animé uniquement. | ✅ tagline : « Based in Luxembourg — I help teams take AI from proof-of-concept to production. » |
| L'intro ne disait pas **ce que tu vends**. | ✅ bloc « How I can help » (4 offres) + boutons « Work with me » / « See my experience » |
| Formulaire de contact sans contexte ni alternative. | ✅ texte d'accroche, délai de réponse, lien `mailto:` direct, `_subject` Formspree |
| CTA LuxAIOps générique (« Contact Us »). | ✅ « Talk to LuxAIOps » |
| Liens sociaux sans `rel="me"` (vérification d'identité Mastodon/IndieWeb, signal d'entité). | ✅ ajouté |

### ⚠️ À faire de ton côté

1. ✅ **Formulaire migré vers FormSubmit** (`formsubmit.co`), page de remerciement `thanks.html`. ⚠️ **Au tout premier envoi, FormSubmit t'envoie un e-mail d'activation sur sitraka.forler@gmail.com : clique sur le lien, sinon aucun message ne sera transmis.** Ancien constat : Il poste vers `https://formspree.io/sitraka.forler@gmail.com`, l'ancien format par adresse e-mail que Formspree n'accepte plus pour les nouveaux formulaires. Crée un formulaire sur formspree.io et remplace l'`action` par `https://formspree.io/f/<ID>`. Teste en envoyant un message. (En attendant, le lien `mailto:` ajouté sert de solution de secours.)
2. ✅ **Bannière** : `pic01.jpg` (dégradé flou du template) remplacée par un visuel net 1920×640 « réseau de données ». 💡 Une vraie photo pro reste recommandée. Ancien constat : `pic01.jpg` était une bannière floue du template : une vraie photo pro augmente fortement la confiance et la conversion. Elle servira aussi d'`image` dans le JSON-LD.
3. **Mesure d'audience.** Aucune analytics : impossible de savoir d'où viennent les visiteurs ni si le formulaire convertit. Une solution sans cookie (Plausible, Umami, GoatCounter) évite la bannière RGPD.
4. **Google Search Console.** La balise de vérification est présente : soumets `sitemap.xml` et surveille les requêtes.
5. **Preuves sociales.** Ajoute 2–3 résultats chiffrés (« −40 % d'incidents P1 », « modèle LLM servi à N utilisateurs »), logos clients/écoles, une recommandation LinkedIn.
6. **Vérifie** que `https://huggingface.co/SitrakaForler` est bien ton profil (ajouté dans `sameAs` d'après le lien du README).

## 5. Résultats mesurés (Chromium headless, local)

- Erreurs JS : `index.html` 1 → 0, `tools.html` 1 → 0, `teachings.html` 1 → 0.
- Poids images de l'accueil : ~650 Ko → ~135 Ko.
- Requêtes tierces supprimées : 2 (highlight.js CSS + JS).
- JSON-LD : valide (parse OK).
