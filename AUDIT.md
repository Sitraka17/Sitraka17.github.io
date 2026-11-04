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


---

# Audit n°2 — vérification après fusion (4 novembre 2026)

Portée : l'état de `main` après les PR #2, #3, #4 et #5, pas seulement les diffs. Outils : Chromium headless (erreurs JS, 404, défilement horizontal, JSON-LD, liens internes, images), script de couverture des balises, Lighthouse 12.8 (mobile + desktop) sur un serveur local.

## 1. Résultat des PR fusionnées

| PR | Contenu | Verdict |
|---|---|---|
| #2 Audit technique/SEO/marketing | Correctifs JS, images, balises, JSON-LD, 404, maillage | ✅ Aucune régression trouvée |
| #3 Bannières SVG + page Tools | 5 bannières, nav Tools centrée, grille d'outils | ✅ Les 2 bannières signalées « non chargées » par le test sont simplement en `loading="lazy"` dans des sections masquées ; elles se chargent à l'ouverture (vérifié) |
| #4 Photos Voxxed Days | Portrait d'en-tête, photo About, image OG | ✅ |
| #5 EcoFin Learning + mobile Teachings | 4 liens UTM, mise en page mobile | ✅ 0 défilement horizontal, 0 erreur |

Contrôles passés sur les 7 pages HTML : 0 erreur JavaScript, 0 ressource 404, 0 défilement horizontal (1440 px et 390 px), JSON-LD valide, 0 lien interne cassé (fichiers et ancres), 0 image sans `alt`, 0 lien `target="_blank"` sans `rel="noopener"`, balises complètes partout (seules `thanks.html` et `404.html`, en `noindex`, n'ont pas de canonical — voulu).

## 2. Ce que Lighthouse a révélé et ce qui a été corrigé (PR #6)

| Constat | Cause | Correctif |
|---|---|---|
| SEO 92 sur l'accueil : « liens non explorables » | Les 6 cartes Skills utilisaient `href="javascript:void(0)"` | Vraies ancres `#skill-…` + `preventDefault` (le défilement doux est conservé, la navigation du gabarit n'est pas déclenchée) |
| 1,4 à 1,9 s de ressources bloquantes | `main.css` commençait par deux `@import` (Font Awesome 5 local + police *Source Sans Pro* inutilisée) : chaîne de 4 requêtes avant le premier rendu, plus Font Awesome 6 chargé en double depuis un CDN | `@import` supprimés ; **une seule** Font Awesome (la copie locale v5, plus de dépendance CDN) ; les 2 seules classes propres à v6 renommées (`fa-shield-halved`→`fa-shield-alt`, `fa-rotate-left`→`fa-undo`) ; Google Fonts chargée sans bloquer le rendu sur l'accueil et Tools |
| CLS 0,12–0,13 (accueil, Tools) | L'animation d'intro du gabarit fait passer le bloc d'en-tête de `max-height: 0` à `40rem` après le chargement → le menu descend | L'en-tête ne fait plus que s'estomper (fondu conservé) ; hauteur réservée pour le sous-titre animé sur mobile ; police de repli aux métriques d'Inter (`size-adjust`, `ascent-override`) pour éviter le saut au chargement de la police |
| 55 % du texte < 12 px sur mobile | Pied de page à 0,6 rem (8,8 px), menu et sous-titre à 0,8 rem | 0,82 rem / 0,85 rem |
| Contraste insuffisant | Pied de page (2,1:1), module actif et commentaires de code sur Teachings (4,1:1 et 2,9:1) | Couleurs relevées (≥ 4,5:1), liens du pied de page soulignés |
| « Erreurs console » | Uniquement les CDN bloqués par le bac à sable de test | Rien à faire (et plus de CDN Font Awesome de toute façon) |

Essai abandonné : charger la police *Poppins* de Teachings sans bloquer le rendu faisait passer le CLS mobile de 0 à 0,31 (échange de police). Revenu au chargement bloquant, mesuré à CLS 0.

### Scores Lighthouse (mobile / desktop)

| Page | Avant | Après |
|---|---|---|
| Accueil | Perf 79 / 86 · A11y 93 / 100 · BP 93 / 96 · SEO 92 / 92 · CLS 0,13 | **Perf 88 / 98 · A11y 100 / 100 · BP 100 / 100 · SEO 100 / 100 · CLS 0,00** |
| Tools | Perf 78 / 92 · A11y 100 · BP 93 / 96 · SEO 100 · CLS 0,12 | **Perf 81 / 96 · A11y 100 · BP 100 · SEO 100 · CLS 0,00** |
| Teachings | Perf 91 / 99 · A11y 96 · BP 100 · SEO 100 | **Perf 92 / 99 · A11y 100 · BP 100 · SEO 100** |

Mesures faites sur un serveur local sans compression : les audits « compression de texte » et « durée de cache » ne s'appliquent pas à GitHub Pages, qui compresse et met en cache. Le LCP mobile (3,3–3,8 s sous limitation 4G simulée) reste dominé par le gabarit (jQuery + CSS de 100 Ko dont ~70 % inutilisé) et l'animation d'intro ; gain suivant possible en purgeant `main.css`.

Divers : `images/pic02.jpg` et `pic03.jpg` (restes du gabarit, jamais référencés) supprimés ; `CoffreFort/index.html` pointait encore vers l'ancien domaine `sitraka.fr`.

## 3. PR #1 (« identité Systems Architect… », ouverte le 1er novembre, hors de cette session)

**Non fusionnable en l'état** : GitHub la signale en conflit avec `main` (elle part du commit d'avant la PR #2) et elle remplace tout le site par un gabarit « papier/LaTeX » clair, à l'opposé de la direction prise depuis (gabarit sombre conservé, photos, bannières). Fusionner écraserait les PR #2 à #5.

Elle contient en revanche du **contenu absent du site actuel** qui mérite d'être repris dans la mise en page actuelle :
- publications : chapitre d'ouvrage 2023 (Dufrénot, Mahaman, Sugimoto, Forler — Cambridge Scholars Publishing), 3 articles AGEFI Luxembourg (nov. 2025, mars 2026, juil. 2026) ;
- conférence : lunch talk Voxxed Days Luxembourg 2025 (la photo est déjà en ligne, le texte non) ;
- enseignement : Université Catholique de Lille à partir de décembre 2026 ;
- JSON-LD : `Person @id` pointant vers `https://sitraka.lu/#person` pour relier les deux sites.

Et des **points d'exactitude à trancher**, repris de sa description :
1. REVEALS : « Designing and deploying LLMs from POC to Production » — d'après ses notes, le LLM serait resté au stade POC ;
2. Research Assistant 2019 : l'ordre des auteurs affiché (Sugimoto ; Dufrénot ; Forler) ne correspond pas à la publication (Dufrénot, Mahaman, Sugimoto, Forler) ;
3. `alumniOf` contient Centrale Méditerranée alors que la timeline la cite comme lieu d'enseignement, pas de formation ;
4. « Visiting Professor » vs « Lecturer (industry practitioner) ».

✅ **Fait (PR #7)** : PR #1 fermée avec un commentaire explicatif ; contenu porté dans la mise en page actuelle — bloc « Publications » et « Talks » en fin d'article Experience (chapitre Cambridge Scholars + Google Scholar, 3 articles AGEFI, Medium, lunch talk Voxxed Days 2025 + enregistrement), lien « watch the talk » sous la photo, Université Catholique de Lille (déc. 2026), intitulé « Lecturer (industry practitioner) », ordre des auteurs 2019 corrigé, REVEALS reformulé « from proof of concept to pilot » (à rétablir si le modèle est bien allé en production), JSON-LD : `alumniOf` = AMSE seule, `affiliation` pour les établissements où il enseigne, `sameAs` + Google Scholar, Medium et `https://sitraka.lu/#person`.

## 4. Reste à faire (inchangé)

- Activer FormSubmit (premier envoi → e-mail d'activation).
- Mesure d'audience sans cookie ; soumettre le sitemap dans Search Console.
- `Knowledge/*.md` est publié tel quel par GitHub Pages (`/Knowledge/Data.md`) : à garder, exclure dans `_config.yml` ou transformer en page.
- Vérifier le texte EcoFin Learning (site inaccessible depuis l'environnement de test).
