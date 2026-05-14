Viewed index.html:151-184

Here's an honest audit of what could still be improved, prioritized by impact:

---

### 🔴 High Impact

| Area | Issue | Fix |
|------|-------|-----|
| **Performance** | `loading="lazy"` on hero image (`pic01.jpg`) — the *first* image should be `eager` + `fetchpriority="high"` | One-line fix |
| **Accessibility** | No `<main>`, `<section>`, `<nav aria-label>` landmarks — screen readers can't navigate | Semantic HTML |
| **Mobile UX** | Nav has 5 items — on small phones they overlap or wrap badly | Hamburger menu or smaller font |
| **Missing `sitemap.xml`** | Google has no map of the site — crawling is slower | Create `sitemap.xml` |
| **Missing `robots.txt`** | No crawl instructions at all for bots | Create `robots.txt` |
14 mai 
---

### 🟡 Medium Impact

| Area | Issue | Fix |
|------|-------|-----|
| **`<h2>` used as first heading** | `<h1>Sitraka</h1>` exists but is visually tiny — the real "About Me" `<h2>` should logically be `<h1>` or the `<h1>` should be more descriptive | Heading hierarchy |
| **No `alt` text strategy** | `alt="Engineering"` tells crawlers nothing — should be `alt="Sitraka Forler working on engineering and data projects"` | Better `alt` copy |
| **Tools section not indexed** | The `#code` article content is hidden by JS until clicked — Google may not crawl it | Progressive enhancement |
| **No `preload`** for hero image | The largest contentful paint (LCP) image loads late | Add `<link rel="preload">` |
| **External CSS/JS has no `integrity`** | CDN files (Font Awesome, Highlight.js) lack `integrity` + `crossorigin` for security | SRI hashes |

---

### 🟢 Quick Wins

| Area | Issue |
|------|-------|
| **Footer copyright year** | Hardcoded — should be dynamic via JS |
| **Contact form** | Has no `action` — submitting does nothing |
| **`og:image`** | Points to `pic01.jpg` which is a portrait, not 1200×630 — LinkedIn/Twitter previews will look bad |
| **No `favicon`** | Missing `<link rel="icon">` — browser shows blank tab icon |
| **Print stylesheet** | None — if someone prints your CV, it'll look broken |

---

### 🏆 My Top 3 Recommendations

1. **`sitemap.xml` + `robots.txt`** — biggest SEO gain, nothing else matters if Google can't find you
2. **Fix LCP** (`fetchpriority="high"` on hero image + `<link rel="preload">`) — Core Web Vitals directly affect ranking
3. **Fix the contact form** — dead form = lost clients

Which would you like me to tackle first?