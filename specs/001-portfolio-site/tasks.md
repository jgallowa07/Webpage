# Tasks: Portfolio Site

**Input**: Design documents from `/specs/001-portfolio-site/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in specification. Tests are included only in the Polish phase as validation gates (HTML validation, Lighthouse, accessibility audit) per Constitution requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build tooling, and base project structure

- [ ] T001 Create .gitignore with node_modules/, dist/, .DS_Store, *.log exclusions
- [ ] T002 Initialize package.json with name, version, description, and npm scripts (build, validate); add devDependencies: sharp, html-minifier-terser, clean-css, terser
- [ ] T003 Create src/ directory structure with empty placeholder files: src/template.html, src/styles.css, src/main.js, src/constants.js
- [ ] T004 [P] Create data/profile.json with placeholder content per data-model.md schema (name, tagline, bio, email, photo, heroImage, social links)
- [ ] T005 [P] Create data/skills.json with placeholder content per data-model.md schema (3 categories with sample items)
- [ ] T006 [P] Create data/projects.json with placeholder content per data-model.md schema (1 sample project card)
- [ ] T007 [P] Create data/experience.json with placeholder content per data-model.md schema (1 sample experience entry)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build script and HTML template skeleton that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T008 Implement build.js — JSON validation module: read and validate all data/*.json files against data-model.md rules; exit non-zero with file/field/rule diagnostic on failure (Principle III)
- [ ] T009 Implement build.js — template rendering module: read src/template.html, replace {{placeholder}} markers with generated HTML fragments from validated JSON data, write dist/index.html
- [ ] T010 Implement build.js — image optimization module: use sharp to convert data/*.jpeg to WebP and AVIF at widths 480/768/1280/1920, output to dist/images/, keep JPEG fallback
- [ ] T011 Implement build.js — minification module: minify CSS via clean-css (src/styles.css → dist/styles.css), minify JS via terser (src/main.js + src/constants.js → dist/main.js), minify HTML via html-minifier-terser (dist/index.html final pass)
- [ ] T012 Implement build.js — static file copy module: copy CNAME, robots.txt, sitemap.xml, 404.html to dist/; generate CNAME with "jaredgalloway.org"
- [ ] T013 Implement build.js — orchestrator: wire all modules into sequential pipeline (clean dist/ → validate → render → optimize images → minify CSS/JS → copy static → minify HTML); expose as npm run build
- [ ] T014 Create src/template.html — full HTML5 skeleton with: doctype, lang="en", meta viewport, meta charset, CSP meta tag per research.md Decision 9, {{placeholder}} markers for all 6 sections (hero, about, skills, projects, experience, contact), semantic landmarks (nav, main, footer), GA gtag.js script tag with async, link to styles.css, script src for main.js with defer
- [ ] T015 [P] Create src/constants.js with GA_MEASUREMENT_ID (placeholder "G-XXXXXXXXXX"), BREAKPOINTS object ({mobile: 768, desktop: 1280}), ANIMATION_CONFIG object ({threshold: 0.1, rootMargin: "0px"})
- [ ] T016 [P] Create static files: robots.txt (Allow all, Sitemap: https://jaredgalloway.org/sitemap.xml), sitemap.xml (single URL entry for https://jaredgalloway.org/), 404.html (minimal page with nav link back to /)

**Checkpoint**: `npm run build` produces a valid dist/ directory with rendered index.html, optimized images, minified assets, and all static files. Template renders with placeholder JSON data.

---

## Phase 3: User Story 1 — Recruiter Evaluates Candidate (Priority: P1) MVP

**Goal**: A recruiter visiting jaredgalloway.org sees Jared's name, tagline, bio, photo, skills, experience timeline, and contact info — all on a single scrollable page with working navigation.

**Independent Test**: Visit the built page, read Hero → About → Skills → Experience → Contact end-to-end, confirm all content is present from JSON data, all nav links scroll to correct sections.

### Implementation for User Story 1

- [ ] T017 [US1] Implement Hero section in src/template.html — h1 with {{name}}, p with {{tagline}}, CTA button linking to #projects, full-bleed background image using {{heroImage}} with theme-adaptive gradient overlay via CSS, {{placeholder}} markers for build script to populate
- [ ] T018 [US1] Implement Hero section styles in src/styles.css — full-viewport-height hero, background-image with linear-gradient overlay using var(--color-hero-overlay), centered text, CTA button styles, responsive text sizing with clamp()
- [ ] T019 [US1] Implement About section in src/template.html — section#about with img ({{photo}} with descriptive alt text), {{bio}} rendered as paragraphs
- [ ] T020 [US1] Implement About section styles in src/styles.css — two-column layout (photo left, bio right) on tablet+, single column on mobile, photo max-width constrained, border-radius on photo
- [ ] T021 [US1] Implement Skills section in src/template.html — section#skills with {{skills_html}} placeholder, build.js renders category groups with h3 headings and grid of skill items with visible text labels per FR-010/FR-010a/FR-011
- [ ] T022 [US1] Implement Skills section styles in src/styles.css — category group headings, CSS grid for skill items (auto-fill, minmax), skill item card styles with name text, responsive columns
- [ ] T023 [US1] Implement Experience section in src/template.html — section#experience with {{experience_html}} placeholder, build.js renders reverse-chronological timeline entries with role title, org name, date range, description per FR-015/FR-016
- [ ] T024 [US1] Implement Experience section styles in src/styles.css — vertical timeline layout with line/dot decorations, entry cards, date range styling, responsive adjustments
- [ ] T025 [US1] Implement Contact section in src/template.html — section#contact with obfuscated email (CSS direction:rtl + unicode-bidi:bidi-override per research.md Decision 8), noscript fallback, GitHub and LinkedIn icon links with accessible labels (aria-label), all links target="_blank" rel="noopener noreferrer" per FR-017/FR-018/FR-019
- [ ] T026 [US1] Implement Contact section styles in src/styles.css — centered layout, social icon sizing (≥ 44px touch targets), email link styles, RTL obfuscation CSS rules
- [ ] T027 [US1] Implement Navigation bar in src/template.html — nav element with anchor links to #hero, #about, #skills, #projects, #experience, #contact; sticky positioning; site name/logo; theme toggle button placeholder per FR-002
- [ ] T028 [US1] Implement Navigation styles in src/styles.css — sticky top, background with backdrop-filter blur, horizontal link layout on desktop, active state indicator, z-index layering
- [ ] T029 [US1] Implement smooth scroll behavior in src/styles.css — html { scroll-behavior: smooth; scroll-padding-top } to account for sticky nav height per FR-003
- [ ] T030 [US1] Implement CSS custom properties in src/styles.css — :root block with full dark theme palette (--color-bg, --color-text-primary, --color-text-secondary, --color-accent, --color-surface, --color-border, --color-hero-overlay), spacing scale (--space-xs through --space-xl), typography (--font-body, --font-mono) per plan.md CSS tokens
- [ ] T031 [US1] Implement CSS reset and base styles in src/styles.css — box-sizing: border-box, margin reset, body background/color using custom properties, base typography, max-width container, section padding
- [ ] T032 [US1] Implement SEO metadata in src/template.html — title tag, meta description (120-158 chars), canonical link, Open Graph tags (og:title, og:description, og:image, og:url), JSON-LD Person schema with name/jobTitle/url/sameAs per FR-029
- [ ] T033 [US1] Update build.js render module — implement HTML fragment generation for all US1 sections: hero (name, tagline, CTA, hero image srcset), about (photo with srcset, bio paragraphs), skills (category groups with item grids), experience (timeline entries), contact (obfuscated email, social links), SEO metadata injection

**Checkpoint**: Full page renders with all US1 content from JSON. Recruiter can scroll through Hero → About → Skills → Experience → Contact. Nav links work. All content is present and accurate.

---

## Phase 4: User Story 2 — Peer Developer Explores Projects (Priority: P2)

**Goal**: A developer visiting the site can browse project cards with titles, descriptions, technology tags, and links to repos/demos.

**Independent Test**: Navigate to Projects section, read at least one project card, verify tags display, click a link and confirm it opens in a new tab.

### Implementation for User Story 2

- [ ] T034 [US2] Implement Projects section in src/template.html — section#projects with {{projects_html}} placeholder, build.js renders project cards with title, description, technology tags, and external links (target="_blank" rel="noopener noreferrer") per FR-012/FR-013/FR-014
- [ ] T035 [US2] Implement Projects section styles in src/styles.css — responsive card grid (1 col mobile, 2 col tablet, 3 col desktop), card styles with surface background, tag pill/chip styles, link button styles, hover states
- [ ] T036 [US2] Update build.js render module — implement HTML fragment generation for projects section: card grid with title h3, description p, tags list, links list with external link icon

**Checkpoint**: Projects section displays cards from data/projects.json. Cards show title, description, tags, links. Links open in new tabs. Grid is responsive.

---

## Phase 5: User Story 3 — Mobile Visitor Gets Full Experience (Priority: P3)

**Goal**: A smartphone visitor gets a fast, readable, fully navigable experience with hamburger menu, theme toggle, and performant loading.

**Independent Test**: Load site at 375px viewport width, verify hamburger menu opens/closes, theme toggle switches and persists, all sections readable, touch targets ≥ 44px.

### Implementation for User Story 3

- [ ] T037 [US3] Implement hamburger menu in src/template.html — add hamburger button (three-line icon) with aria-expanded="false" and aria-controls, hidden overlay menu markup with all nav links, close button per FR-003a
- [ ] T038 [US3] Implement hamburger menu styles in src/styles.css — hide hamburger button above 768px, show on mobile, overlay/slide-down menu styles, menu link sizing (≥ 44px touch targets), transition animations, body scroll lock when menu open
- [ ] T039 [US3] Implement hamburger menu logic in src/main.js — toggle aria-expanded on click, show/hide overlay menu, close on link click or close button, close on Escape key, trap focus within open menu for accessibility
- [ ] T040 [US3] Implement theme toggle in src/main.js — check sessionStorage for saved theme, check prefers-color-scheme as fallback, set data-theme attribute on html element, toggle button switches between dark/light and saves to sessionStorage per FR-020/FR-021/FR-022
- [ ] T041 [US3] Implement theme toggle styles in src/styles.css — [data-theme="light"] custom property overrides per plan.md light theme palette, toggle button icon (sun/moon), transition on color properties for smooth switch (< 100ms per SC-006)
- [ ] T042 [US3] Implement responsive layout refinements in src/styles.css — verify all sections at 320px/768px/1280px breakpoints, ensure no horizontal overflow, verify touch targets ≥ 44px on all interactive elements per SC-005, add min-width media queries for tablet (768px) and desktop (1280px)

**Checkpoint**: Site fully functional on 375px viewport. Hamburger menu opens/closes. Theme toggles and persists for session. All content readable at 320/768/1280px. Touch targets meet 44px minimum.

---

## Phase 6: User Story 4 — Screen Reader User Navigates Accessibly (Priority: P4)

**Goal**: A screen reader user can navigate by landmarks and headings, find all content, and interact with all controls via keyboard.

**Independent Test**: Navigate page using only keyboard (Tab, Enter, Escape). Verify focus indicators visible, landmarks announced, images have proper alt text, hamburger menu traps focus correctly.

### Implementation for User Story 4

- [ ] T043 [US4] Implement scroll animations in src/main.js — IntersectionObserver triggers fade-in/slide-up on sections below fold, add .animate-in CSS class on intersection, respect prefers-reduced-motion (disable all animations) per FR-023/FR-024
- [ ] T044 [US4] Implement scroll animation styles in src/styles.css — .animate-in base state (opacity: 0, translateY), .animate-in.visible state (opacity: 1, translateY: 0), transition timing, @media (prefers-reduced-motion: reduce) disables all animations
- [ ] T045 [US4] Implement email obfuscation JS in src/main.js — assemble correct mailto: link from reversed/encoded parts at click-time, attach to contact email element per research.md Decision 8
- [ ] T046 [US4] Implement visible focus indicators in src/styles.css — :focus-visible outline styles on all interactive elements (links, buttons, toggle), high-contrast outline color, skip-to-content link that appears on focus per FR-026
- [ ] T047 [US4] Add skip-to-content link in src/template.html — first element in body, visually hidden until focused, links to #main, visible focus style per accessibility best practices
- [ ] T048 [US4] Audit and fix ARIA attributes in src/template.html — verify nav has aria-label, hamburger has aria-expanded + aria-controls, theme toggle has aria-label describing current state, social links have aria-label, decorative images have alt="" per FR-025
- [ ] T049 [US4] Implement forced-colors mode support in src/styles.css — @media (forced-colors: active) block that ensures readability, does not override system palette per edge case spec
- [ ] T050 [US4] Add heading hierarchy validation — verify h1 (hero name) → h2 (section titles) → h3 (skill categories, project titles) is logical and sequential with no skipped levels

**Checkpoint**: Full keyboard navigation works. Focus indicators visible. Screen reader announces landmarks (nav, main, footer). All images have appropriate alt text. Animations respect prefers-reduced-motion.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Mandatory quality gates, deployment pipeline, and final refinements

- [ ] T051 [P] Create .github/workflows/deploy.yml — GitHub Actions workflow: trigger on push to main, install Node 18, npm ci, npm run build, deploy dist/ via actions/upload-pages-artifact + actions/deploy-pages per research.md Decision 6
- [ ] T052 [P] Configure GitHub Pages settings — enable Pages with GitHub Actions source (manual step, document in README)
- [ ] T053 Populate data/profile.json with real content — Jared's actual bio, verify email, social links match spec
- [ ] T054 [P] Populate data/skills.json with real content — actual skills organized into categories (Languages, Frameworks, Tools/Infrastructure)
- [ ] T055 [P] Populate data/projects.json with real content — actual projects with descriptions, tags, GitHub links
- [ ] T056 [P] Populate data/experience.json with real content — actual employment history in reverse-chronological order
- [ ] T057 Run build and verify dist/ output — npm run build succeeds, index.html contains all rendered content, images optimized, CSS/JS minified, static files present
- [ ] T058 [P] W3C HTML validation — validate dist/index.html, zero errors per SC-008
- [ ] T059 [P] Accessibility audit (axe-core or Lighthouse) — zero critical/serious WCAG 2.1 AA violations per SC-004 (Principle IV)
- [ ] T060 [P] Lighthouse performance audit — verify ≥ 95 in Performance, Accessibility, Best Practices, SEO on both mobile and desktop per SC-002 (Principle V)
- [ ] T061 Security review — verify no secrets in source, CSP meta tag present and correct, no inline scripts/styles, email obfuscated in source (Principle VI)
- [ ] T062 SEO checklist — verify title, meta description, canonical, OG tags, JSON-LD Person schema, sitemap.xml, robots.txt all present and correct (Principle VII)
- [ ] T063 Cross-browser responsive check — verify at 320px, 768px, 1280px viewports, no horizontal scrolling, all content readable per SC-005
- [ ] T064 Code cleanup — DRY review of CSS (custom properties used consistently), naming review (no magic strings in JS), build.js function sizes ≤ 30 lines (Principles I, II, IX)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 — MVP, implement first
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can parallel with US1 but recommended after US1 since nav/layout established
- **User Story 3 (Phase 5)**: Depends on Phases 3+4 — mobile/responsive refinements need base desktop layout
- **User Story 4 (Phase 6)**: Depends on Phases 3+4 — accessibility audit needs content in place
- **Polish (Phase 7)**: Depends on all user stories — final validation and real content

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — establishes page structure, nav, and all sections except Projects
- **US2 (P2)**: Can start after Phase 2 — Projects section is independent, but recommended after US1 for shared layout consistency
- **US3 (P3)**: Depends on US1+US2 — hamburger menu and theme toggle build on the nav/layout from US1
- **US4 (P4)**: Depends on US1+US2 — accessibility audit and ARIA fixes require content sections to exist

### Within Each User Story

- Template markup before styles (structure before presentation)
- Styles before JS behavior (visual before interactive)
- Build script updates after template changes (rendering matches structure)

### Parallel Opportunities

- **Phase 1**: T004, T005, T006, T007 can all run in parallel (independent JSON files)
- **Phase 2**: T015, T016 can parallel with each other (independent files)
- **Phase 3**: Template tasks (T017, T019, T021, T023, T025, T027) touch different sections of the same file — execute sequentially; style tasks can follow each template task
- **Phase 4**: T034 and T035 are sequential (template then styles)
- **Phase 5**: T037-T039 (hamburger) and T040-T041 (theme) touch different functions — can parallel after nav exists
- **Phase 7**: T051, T052, T053-T056, T058-T060 all marked [P] where independent

---

## Parallel Example: Phase 1 Setup

```
# Launch all JSON data files in parallel:
T004: Create data/profile.json
T005: Create data/skills.json
T006: Create data/projects.json
T007: Create data/experience.json
```

## Parallel Example: Phase 7 Validation

```
# Launch all validation checks in parallel:
T058: W3C HTML validation
T059: Accessibility audit
T060: Lighthouse performance audit
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T007)
2. Complete Phase 2: Foundational (T008–T016)
3. Complete Phase 3: User Story 1 (T017–T033)
4. **STOP and VALIDATE**: Build and preview — recruiter can evaluate candidate
5. Deploy via GitHub Actions if ready

### Incremental Delivery

1. Setup + Foundational → Build pipeline works with placeholder data
2. Add User Story 1 → Full page with Hero, About, Skills, Experience, Contact (MVP!)
3. Add User Story 2 → Projects section adds technical proof-of-work
4. Add User Story 3 → Mobile responsive, hamburger, theme toggle
5. Add User Story 4 → Full accessibility, scroll animations, ARIA
6. Polish → Real content, validation, deployment pipeline, quality gates

### Single Developer Strategy (Recommended)

Work sequentially through phases P1→P2→P3→P4→Polish. Within each phase, complete tasks in order. Commit after each logical group (e.g., one section complete). This ensures each checkpoint is reachable and testable.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total page weight target: ≤ 500 KB uncompressed / ≤ 150 KB compressed
- All placeholder content will be replaced with real content in Phase 7
