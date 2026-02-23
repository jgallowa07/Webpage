# Research: Portfolio Site Build Toolchain & Architecture

**Feature**: 001-portfolio-site | **Date**: 2026-02-20

## Decision 1: Build Script Approach

**Decision**: A single Node.js build script (`build.js`) using only built-in Node APIs plus three focused dependencies: `sharp` (image optimization), `html-minifier-terser` (HTML minification), and `clean-css` (CSS minification). JS minification via `terser`.

**Rationale**: The spec mandates a "minimal Node.js script" — no SSG framework. Node's built-in `fs` module handles file reads, string interpolation handles JSON→HTML templating, and the three deps cover the optimization requirements (WebP/AVIF images, minified CSS/JS, minified HTML). This keeps `node_modules` small and avoids framework lock-in per Constitution Principle VIII.

**Alternatives considered**:
- **11ty (Eleventy)**: Full SSG with templating, dev server, asset pipeline. Rejected — violates the "no full SSG framework" clarification and Principle VIII (static-first, minimal deps).
- **Vite**: Modern bundler with HMR. Rejected — overkill for a single-page site with no framework; adds 50+ transitive deps.
- **esbuild only**: Fast bundler but no image optimization or HTML templating. Would still need sharp + custom templating — same work, extra dep.
- **Zero build (client-side JSON fetch)**: Rejected — hurts SEO (content not in initial HTML), violates Lighthouse performance target (extra network round-trip), and conflicts with Principle V (LCP ≤ 2.5s).

## Decision 2: Templating Strategy

**Decision**: A single `src/template.html` file with `{{placeholder}}` markers. The build script reads JSON data files, replaces placeholders with generated HTML fragments, and writes the final `dist/index.html`.

**Rationale**: Mustache-style placeholders are trivial to implement with `String.replace()` — no template engine dependency needed. The template is real HTML that can be opened in a browser for structural review even before building. Keeps the architecture understandable to any developer.

**Alternatives considered**:
- **EJS/Handlebars/Nunjucks**: Full template engines. Rejected — a dependency for what amounts to string replacement; violates Principle VIII's "≤ 30 lines of vanilla code" threshold.
- **Tagged template literals**: JS template strings used directly. Rejected — mixes HTML structure with JS logic; harder to maintain and preview.

## Decision 3: Image Optimization Pipeline

**Decision**: Use `sharp` to convert `data/*.jpeg` to WebP and AVIF at multiple widths (480, 768, 1280, 1920) for responsive `srcset`. Originals kept as JPEG fallback. Output to `dist/images/`.

**Rationale**: `sharp` is the gold-standard Node image library — fast (libvips), well-maintained, handles WebP/AVIF natively. Multiple widths enable responsive serving per Constitution Principle V (images in WebP/AVIF with srcset). The hero image at 3.7 MB JPEG will compress dramatically (expected ~200-400 KB for largest WebP).

**Alternatives considered**:
- **imagemin**: Deprecated ecosystem; plugins unmaintained. Rejected.
- **squoosh-cli**: Google's optimizer. Rejected — slower than sharp, less Node API integration.
- **Manual pre-optimization**: Convert once and commit. Rejected — loses reproducibility; originals in `data/` serve as source of truth.

## Decision 4: CSS Architecture

**Decision**: Single `src/styles.css` file using CSS custom properties for theming. Mobile-first with `min-width` breakpoints. No preprocessor (no Sass/Less). Minified by `clean-css` at build time.

**Rationale**: Modern CSS custom properties handle theming natively (`:root` for dark, `[data-theme="light"]` for light overrides). A single file is manageable for a one-page site. No preprocessor avoids a dep and keeps the authoring format identical to the output format. Constitution Principle IX (DRY) satisfied via custom properties.

**Alternatives considered**:
- **Sass/SCSS**: Nesting, mixins. Rejected — CSS nesting is now native in all modern browsers; custom properties replace variables; adds a build dep for minimal gain on a single-page site.
- **Tailwind CSS**: Utility-first. Rejected — heavy framework, violates Principle VIII; generates large CSS unless purged; adds complexity.
- **CSS Modules**: Scoped classes. Rejected — requires a bundler; overkill for one page.

## Decision 5: JavaScript Architecture

**Decision**: Vanilla JS in `src/main.js` organized as an IIFE or ES module. Handles: theme toggle (sessionStorage), hamburger menu, scroll animations (IntersectionObserver), smooth scroll polyfill fallback, and email obfuscation assembly. Minified by `terser` at build time.

**Rationale**: All required JS features are achievable with vanilla browser APIs. IntersectionObserver is supported in all modern browsers and is the performant way to trigger scroll animations (no scroll event listeners). sessionStorage handles theme persistence per spec (session-duration). Constitution Principle VIII mandates no JS framework unless justified.

**Alternatives considered**:
- **Alpine.js**: Lightweight reactivity. Rejected — adds a runtime dep for interactions achievable in ~100 lines of vanilla JS.
- **GSAP**: Animation library. Rejected — CSS animations + IntersectionObserver cover the required fade-in/slide-up effects without a library.

## Decision 6: GitHub Pages Deployment

**Decision**: GitHub Actions workflow builds on push to `main`, outputs to `dist/`, deploys via `actions/deploy-pages@v4`. Build artifacts are never committed to the repo.

**Rationale**: GitHub Actions is free for public repos, keeps the `main` branch clean (no `dist/` committed), and the official `deploy-pages` action is the recommended approach. This satisfies the Constitution's deployment workflow requirement ("build artifacts generated by GitHub Actions workflow — never manually copied").

**Alternatives considered**:
- **Commit dist/ to main**: Simple but pollutes history; merge conflicts on built files. Rejected.
- **gh-pages branch**: Classic approach but requires force-pushing a separate branch. More complex than the Actions deploy approach. Rejected.
- **Manual deploy**: Violates Constitution deployment workflow. Rejected.

## Decision 7: Development Server

**Decision**: A lightweight `serve.js` script using Node's built-in `http` module to serve `dist/` locally, or use `npx serve dist`. No dev server with HMR — rebuild manually with `npm run build`.

**Rationale**: A one-page static site doesn't benefit much from HMR. `npx serve` is zero-config and sufficient for previewing. Keeps dev dependencies minimal per Principle VIII.

**Alternatives considered**:
- **live-server**: Auto-reload on file change. Acceptable alternative if developer experience becomes a pain point; can be added as optional devDep later.
- **BrowserSync**: Full proxy with multi-device sync. Rejected — overkill.

## Decision 8: Email Obfuscation Strategy

**Decision**: CSS `direction: rtl` + `unicode-bidi: bidi-override` to display the email reversed in source HTML, with JS assembling the correct `mailto:` link at click-time. A `<noscript>` block displays the email as visible text using the CSS-reversed technique (readable by humans, garbled for naive scrapers).

**Rationale**: This is a well-established anti-scraping technique that works without JS (CSS reversal is human-readable) and enhances with JS (proper mailto link). Satisfies FR-017's dual requirement: obfuscated in source + usable without JS.

**Alternatives considered**:
- **Character entity encoding**: `&#106;&#97;...` — easily decoded by scrapers. Rejected as sole method.
- **JS-only assembly**: Fails the no-JS requirement. Rejected as sole method.
- **CAPTCHA-gated contact form**: Overkill; spec explicitly says mailto is sufficient. Rejected.

## Decision 9: Content Security Policy

**Decision**: CSP delivered via `<meta http-equiv="Content-Security-Policy">` tag in HTML (GitHub Pages doesn't support custom headers). Policy: `default-src 'self'; script-src 'self' https://www.googletagmanager.com; connect-src https://www.google-analytics.com; img-src 'self' data:; style-src 'self'; font-src 'self'`. Inline scripts forbidden; GA loaded via external file reference.

**Rationale**: GitHub Pages doesn't allow custom HTTP headers, so CSP must be in a meta tag. The policy is strict (no inline scripts/styles, no unsafe-eval) while permitting GA4 origins per FR-034. Constitution Principle VI mandates CSP with no inline scripts unless nonced.

**Alternatives considered**:
- **HTTP header CSP via Cloudflare**: Requires Cloudflare proxy. Rejected — adds infrastructure dependency beyond GitHub Pages.
- **No CSP**: Violates Constitution Principle VI. Rejected.
