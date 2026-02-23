# Implementation Plan: Portfolio Site

**Branch**: `001-portfolio-site` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-portfolio-site/spec.md`

## Summary

Build a single-page portfolio site for Jared Galloway at jaredgalloway.org. Content (bio, skills, projects, experience) is stored in JSON files under `data/` and rendered into a static HTML page by a minimal Node.js build script. The build pipeline optimizes images to WebP/AVIF, minifies CSS/JS, and outputs a deployable `dist/` directory. GitHub Actions deploys to GitHub Pages on push to `main`. The site supports dark/light theming, a mobile hamburger menu, scroll animations, email obfuscation, and meets WCAG 2.1 AA, Lighthouse ≥ 95, and all Constitution principles.

## Technical Context

**Language/Version**: HTML5, CSS3, Vanilla JavaScript (ES2020+), Node.js ≥ 18 (build only)
**Primary Dependencies**: `sharp` (image optimization), `html-minifier-terser`, `clean-css`, `terser` (minification)
**Storage**: JSON files in `data/` — no database
**Testing**: W3C HTML validator, Lighthouse CI, axe-core (accessibility), Stylelint, ESLint
**Target Platform**: Modern browsers (last 2 versions) via GitHub Pages; static assets only
**Project Type**: Single static web page
**Performance Goals**: Lighthouse ≥ 95 all categories; LCP ≤ 2.5s; CLS ≤ 0.1; total weight ≤ 500 KB uncompressed / ≤ 150 KB compressed
**Constraints**: No server-side runtime; no JS frameworks; GitHub Pages hosting; HTTPS enforced
**Scale/Scope**: 1 page, 6 sections, ~5 JSON data files, ~4 source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Clean Code** — Build script split into focused functions (validate, render, optimize, minify). Each src file has single concern: template.html (structure), styles.css (presentation), main.js (behavior), constants.js (configuration).
- [x] **II. Naming** — All constants in `constants.js` (GA_MEASUREMENT_ID, BREAKPOINTS, ANIMATION_CONFIG). No magic strings in logic. CSS custom properties named by purpose (--color-bg, --color-text-primary).
- [x] **III. Fail-Fast** — Build script validates all JSON data against schema before rendering. Missing/malformed data exits non-zero with file/field/rule diagnostic. Missing images fail build.
- [x] **IV. Accessibility** — Semantic HTML throughout (nav, main, section, footer). ARIA only where native semantics insufficient (hamburger menu aria-expanded). Color contrast ≥ 4.5:1 in both themes. All images have descriptive alt text. Keyboard navigation with visible focus indicators.
- [x] **V. Performance** — Images served as WebP/AVIF with srcset at 4 widths. CSS/JS minified. No render-blocking resources. Font-display: swap. Total budget ≤ 500 KB.
- [x] **VI. Security** — No secrets in repo. GA measurement ID is public constant. CSP via meta tag: no inline scripts/styles. Email obfuscated via CSS reversal + JS assembly.
- [x] **VII. SEO** — title, meta description, canonical, OG tags (title, description, image, url), JSON-LD Person schema, sitemap.xml, robots.txt all planned.
- [x] **VIII. Static-First** — Zero JS frameworks. All interactivity in ~150 lines of vanilla JS. Build deps are dev-only (sharp, minifiers). No runtime dependencies.
- [x] **IX. DRY** — CSS custom properties for all theme colors, spacing, typography. Single template file. JSON data prevents content duplication across sections.
- [x] **X. Mobile-First** — Base styles target 320 px. Breakpoints via min-width at 768 px and 1280 px. Touch targets ≥ 44 px. Hamburger menu on viewports < 768 px.

No violations. Complexity Tracking table is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-portfolio-site/
├── plan.md              # This file
├── research.md          # Build toolchain research & decisions
├── data-model.md        # JSON schema for all content data
├── quickstart.md        # Developer setup guide
└── tasks.md             # Task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── template.html        # HTML template with {{placeholder}} markers
├── styles.css           # All styles: reset, layout, components, themes, animations
├── main.js              # Theme toggle, hamburger menu, scroll animations, email obfuscation
└── constants.js         # GA_MEASUREMENT_ID, BREAKPOINTS, ANIMATION_CONFIG

data/
├── profile.json         # Name, tagline, bio, email, social links
├── skills.json          # Skills grouped by category
├── projects.json        # Project cards with tags and links
├── experience.json      # Employment timeline entries
├── me.jpeg              # Profile photo (source)
└── mirror-lake.jpeg     # Hero background (source)

build.js                 # Node.js build script: validate → render → optimize → minify
package.json             # Dev dependencies and npm scripts

dist/                    # Build output (git-ignored)
├── index.html           # Final minified HTML with all content rendered
├── styles.css           # Minified CSS
├── main.js              # Minified JS
├── images/              # Optimized images (WebP, AVIF, JPEG fallback at multiple widths)
├── CNAME                # Custom domain for GitHub Pages
├── robots.txt           # Search engine directives
├── sitemap.xml          # Sitemap for SEO
└── 404.html             # Custom error page

.github/
└── workflows/
    └── deploy.yml       # Build + deploy to GitHub Pages on push to main

.gitignore               # node_modules/, dist/
```

**Structure Decision**: Single-project layout. All source in `src/`, all content data in `data/`, build output in `dist/`. No frontend/backend split needed — this is a purely static site with a build step. The `build.js` script at repo root orchestrates the entire pipeline.

## Architecture Details

### Build Pipeline (`build.js`)

```
1. Clean dist/
2. Validate JSON data files (fail-fast on schema violation)
3. Read src/template.html
4. Generate HTML fragments from JSON data:
   - Hero: name, tagline, CTA
   - About: photo reference, bio paragraphs
   - Skills: category groups with items
   - Projects: cards with tags and links
   - Experience: timeline entries
   - Contact: obfuscated email, social icons
5. Replace {{placeholders}} in template with fragments
6. Inject SEO metadata (title, description, OG tags, JSON-LD)
7. Write dist/index.html
8. Optimize images: data/*.jpeg → dist/images/*.{webp,avif,jpeg} at 480/768/1280/1920 widths
9. Minify CSS: src/styles.css → dist/styles.css
10. Minify JS: src/main.js + src/constants.js → dist/main.js
11. Copy static files: CNAME, robots.txt, sitemap.xml, 404.html → dist/
12. Minify HTML: dist/index.html (final pass)
```

### Theming System

- **Dark mode** (default): `:root` custom properties define dark palette
- **Light mode**: `[data-theme="light"]` selector overrides custom properties
- **System preference**: On load, check `prefers-color-scheme` → set `data-theme` attribute if no sessionStorage override
- **Toggle**: Button in nav sets `data-theme` on `<html>`, stores in `sessionStorage`
- **Hero overlay**: CSS `linear-gradient()` over background-image; gradient color derived from theme custom properties

### CSS Custom Properties (key tokens)

```css
:root {
  /* Dark theme (default) */
  --color-bg: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-accent: #38bdf8;
  --color-surface: #1e293b;
  --color-border: #334155;
  --color-hero-overlay: rgba(15, 23, 42, 0.7);

  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;

  /* Typography */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
}

[data-theme="light"] {
  --color-bg: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-accent: #0284c7;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-hero-overlay: rgba(248, 250, 252, 0.6);
}
```

### Responsive Breakpoints

| Breakpoint | Width | Layout changes |
|------------|-------|----------------|
| Base (mobile) | 320–767 px | Single column, hamburger menu, stacked cards |
| Tablet | 768–1279 px | 2-column grids, expanded nav, side-by-side about |
| Desktop | ≥ 1280 px | 3-column project grid, max-width container |

### Google Analytics Integration

- **Purpose**: Measure visitor traffic and project link engagement
- **Privacy**: IP anonymisation enabled by default in GA4; no PII collected beyond GA4 defaults
- **Implementation**: GA4 `gtag.js` loaded from `googletagmanager.com` in `<head>` with `async` attribute
- **Configuration**: `GA_MEASUREMENT_ID` stored in `src/constants.js` as named export; injected at build time
- **CSP**: `script-src` permits `https://www.googletagmanager.com`; `connect-src` permits `https://www.google-analytics.com`

## Complexity Tracking

> No violations detected. All Constitution principles are satisfied by the planned architecture.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *(none)* | — | — |
