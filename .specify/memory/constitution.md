<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)

Modified principles: N/A — first constitution

Added sections:
  - Core Principles (10 principles)
  - Platform & Deployment Constraints
  - Code Quality Standards
  - Governance

Removed sections: N/A

Templates requiring updates:
  ✅ .specify/memory/constitution.md — this file
  ✅ .specify/templates/plan-template.md — Constitution Check gates now explicitly
     reference principles by name; no structural changes required, gates auto-derive
     from principle list at plan time
  ✅ .specify/templates/spec-template.md — no structural changes required; FR/SC
     fields cover all mandatory areas; accessibility and performance success criteria
     must be added per-spec as required by Principle IV and V
  ✅ .specify/templates/tasks-template.md — "Polish & Cross-Cutting Concerns" phase
     now covers accessibility audit, performance budget check, SEO validation, and
     security scan as standard polish tasks per Principles IV–VI
  ⚠  .specify/templates/agent-file-template.md — Active Technologies and Code Style
     sections should be filled once a tech stack is confirmed via /speckit.plan

Deferred items:
  None — all fields resolved.
-->

# Webpage Constitution

## Core Principles

### I. Clean Code — Single Responsibility

Every function, class, and module MUST do exactly one thing. Files are organized by
concern: a component that renders a section MUST NOT also fetch data, manage routing,
or apply global styles. Functions MUST be small enough that their entire body fits in
a single screen (~20–30 lines); longer functions MUST be decomposed. Each abstraction
MUST have a clear, singular purpose — if you cannot state what a module does in one
sentence without using "and", it violates this principle.

### II. Naming Excellence

All identifiers — variables, functions, CSS classes, HTML IDs, filenames — MUST
reveal intent precisely. Names MUST match actual behavior; a function named
`renderHero` MUST render the hero section and nothing else. Names that distinguish
observed versus computed or theoretical data MUST make that distinction explicit
(e.g., `visitorCount` vs `estimatedReach`). Magic numbers and magic strings are
forbidden; constants or enum-like objects MUST be used instead
(e.g., `BREAKPOINTS.mobile` not `768`). Abbreviations are forbidden unless they are
universally understood domain terms (e.g., `URL`, `CSS`, `SEO`).

### III. Fail-Fast & Defensive Programming

Code MUST fail fast with meaningful error messages rather than silently swallowing
bad state. Required configuration (env vars, CNAME records, manifest fields) MUST be
validated at startup/build time with explicit, actionable error output. Build scripts
MUST exit non-zero and print a clear diagnostic on misconfiguration — never silently
produce a broken deployment. Defensive assertions MUST guard public function entry
points when inputs cannot be statically guaranteed. Silent fallbacks that mask bugs
are forbidden.

### IV. Accessibility First (NON-NEGOTIABLE)

All pages MUST meet WCAG 2.1 Level AA. This is not optional polish — it is a
baseline correctness requirement equivalent to the page loading at all. Specific
mandates:

- All images MUST have descriptive `alt` text (or `alt=""` for decorative images)
- Interactive elements MUST be keyboard-navigable and have visible focus indicators
- Color contrast ratios MUST meet 4.5:1 for normal text, 3:1 for large text
- ARIA attributes MUST only be used when native HTML semantics are insufficient;
  misuse of ARIA (e.g., `role="button"` on a `<button>`) is a violation
- Semantic HTML MUST be used throughout: `<nav>`, `<main>`, `<article>`, `<section>`,
  `<header>`, `<footer>` instead of generic `<div>` containers

### V. Performance Budget

Page performance MUST meet these targets measured on a mid-range mobile device on a
4G connection:

- Largest Contentful Paint (LCP): ≤ 2.5 s
- First Input Delay (FID) / INP: ≤ 200 ms
- Cumulative Layout Shift (CLS): ≤ 0.1
- Total page weight (initial load): ≤ 500 KB uncompressed, ≤ 150 KB compressed

Tactics that are MANDATORY:
- All images MUST be served in WebP or AVIF format with `srcset` for responsive sizes
- Web fonts MUST use `font-display: swap` and subset to used character sets
- CSS and JavaScript MUST be minified in production
- Render-blocking resources MUST be eliminated from the critical path

### VI. Security & Privacy

The site MUST be served exclusively over HTTPS. Specific requirements:

- No secrets, tokens, API keys, or personal credentials MUST ever appear in the
  repository, HTML, or JavaScript source
- A strict Content Security Policy (CSP) header MUST be configured; inline `<script>`
  and `<style>` blocks are forbidden except where a nonce/hash is included in the CSP
- Third-party scripts (analytics, embeds) MUST be audited and documented; each MUST
  have a stated purpose and privacy implication
- The `CNAME` file and DNS records MUST be the only GitHub Pages–specific
  configuration; no server-side logic or secrets are ever needed
- `.gitignore` MUST exclude any IDE files, OS artifacts, and local config

### VII. SEO & Discoverability

Every page MUST include:

- A unique, descriptive `<title>` tag (50–60 characters)
- A unique `<meta name="description">` (120–158 characters)
- Canonical `<link rel="canonical">` URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) for social
  sharing
- Structured data (JSON-LD) appropriate to the page type (e.g., `Person` schema for
  an about/profile page)
- A `sitemap.xml` MUST be present and linked from `robots.txt`

### VIII. Static-First & Minimal Dependencies

This is a static site hosted on GitHub Pages. No server-side runtime is permitted.
Specific constraints:

- All build output MUST be pure HTML, CSS, and optionally vanilla JavaScript
- Heavy JavaScript frameworks (React, Vue, Angular, Svelte, etc.) MUST NOT be
  introduced unless a concrete, documented justification exists and the maintainability
  cost is explicitly accepted in the relevant plan's Complexity Tracking table
- Third-party libraries MUST be justified individually; each dependency added MUST
  solve a problem that cannot be solved in ≤ 30 lines of vanilla code
- A `package.json` / build toolchain is permitted for asset pipelines (CSS bundling,
  image optimization, minification) but MUST NOT introduce a runtime JS framework as
  a side effect

### IX. DRY & Abstraction Discipline

Duplication is forbidden. Specific rules:

- HTML structure repeated more than once MUST be extracted into a reusable component,
  include, or template partial
- CSS values used in more than two places MUST be defined as custom properties
  (`--color-accent: #...`) in a single `:root` block
- JavaScript utility logic used in more than one file MUST be extracted into a shared
  module
- Abstraction MUST be introduced to eliminate duplication, NOT to anticipate
  hypothetical future requirements (YAGNI)

### X. Mobile-First Responsive Design

All layouts MUST be designed mobile-first: base styles target the smallest viewport,
and larger viewports are handled via `min-width` media queries. Specific requirements:

- No fixed pixel widths on layout containers; use `%`, `rem`, `ch`, `fr`, or
  `clamp()` units
- Touch targets MUST be ≥ 44 × 44 CSS pixels
- The site MUST be fully functional and visually correct at 320 px, 768 px, and
  1280 px viewport widths
- `meta viewport` MUST be set: `<meta name="viewport" content="width=device-width,
  initial-scale=1">`

## Platform & Deployment Constraints

This site is hosted on GitHub Pages and served via a custom domain managed through
Squarespace DNS (or a transferred registrar).

**GitHub Pages requirements** (MANDATORY):
- The repository MUST contain a `CNAME` file at the root of the published branch
  containing exactly the custom domain (e.g., `example.com`)
- GitHub Pages serves from either the `main` branch root, `main:/docs`, or a `gh-pages`
  branch — the chosen convention MUST be documented in the README and consistent
- A custom `404.html` MUST exist and provide helpful navigation back to the homepage

**Custom domain / DNS requirements**:
- The DNS configuration MUST be documented (record type, value, TTL) in the repository
  README so it can be reproduced if the registrar changes
- HTTPS enforcement MUST be enabled in GitHub Pages settings after DNS propagation
- If the domain is transferred away from Squarespace, the transfer checklist MUST be
  committed to the repo before initiating the transfer

**Deployment workflow**:
- All deployments happen via `git push` to the configured branch — no manual FTP, no
  external CI required unless explicitly chosen
- Build artifacts (if a build step exists) MUST be committed to the deployment branch
  or generated by a GitHub Actions workflow — never manually copied

## Code Quality Standards

These standards apply to all code in the repository and are enforced during every
code review (human or AI-assisted via the `clean-code-reviewer` agent).

**Import / dependency organization**:
- All script `<script src="...">` and `<link rel="stylesheet">` tags MUST appear in
  `<head>` or at the very end of `<body>`, never inline mid-document
- In JavaScript modules, all `import` statements MUST appear at the top of the file;
  dynamic `import()` is permitted only for heavy dependencies with documented
  performance justification

**Type safety over stringly-typed values**:
- JavaScript constants for repeated string literals MUST be defined in a central
  `constants.js` (or equivalent); bare magic strings are forbidden in logic code
- Build/config files MUST use typed configuration objects over raw string maps

**Testing & validation**:
- HTML MUST pass W3C validation with zero errors before merge
- CSS MUST pass a linter (e.g., Stylelint) with zero errors before merge
- JavaScript (if present) MUST pass ESLint with zero errors before merge
- Accessibility MUST be validated with an automated tool (axe, Lighthouse, or
  equivalent) targeting zero critical or serious violations
- Performance budget MUST be validated with Lighthouse CI or equivalent before any
  major content change is merged

**Test quality rules** (adapted from clean-code-reviewer):
- Tests MUST use real fixtures (actual HTML snapshots, real images) — not dummy
  placeholder data
- Mocks are forbidden for testing HTML/CSS output; use real rendered output
- No tests MUST be skipped without a documented reason and a linked issue
- Integration tests (full page render + accessibility + performance) are preferred
  over narrow unit tests on trivial helpers

## Governance

This constitution is the authoritative governing document for the Webpage project.
All feature specifications, implementation plans, and code reviews MUST verify
compliance with these principles before proceeding.

**Amendment procedure**:
1. Propose the amendment in a GitHub issue with rationale
2. Update this file with the new/changed principle and increment the version per
   semantic versioning rules (see below)
3. Update the Sync Impact Report comment at the top of this file
4. Commit with message: `docs: amend constitution to vX.Y.Z (<summary>)`
5. Review all open specs and plans for compatibility with the amendment

**Versioning policy**:
- MAJOR: A principle is removed, its non-negotiable mandate is weakened, or a
  fundamental incompatible change to the deployment target is made
- MINOR: A new principle is added, an existing principle gains a new mandatory
  requirement, or a new section is introduced
- PATCH: Wording clarifications, typo fixes, example updates, non-semantic refinements

**Compliance review**:
- Every pull request MUST include a one-line constitution compliance statement in its
  description (e.g., "Principles I–X checked: no violations")
- AI-assisted reviews MUST use the `clean-code-reviewer` agent defined at
  `.../agents/clean-code-reviewer.md` as the primary review lens
- Complexity justifications for any violation MUST be recorded in the relevant
  `plan.md` Complexity Tracking table before implementation begins

**Version**: 1.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
