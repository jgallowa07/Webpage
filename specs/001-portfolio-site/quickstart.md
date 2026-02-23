# Quickstart: Portfolio Site

**Feature**: 001-portfolio-site | **Date**: 2026-02-20

## Prerequisites

- Node.js ≥ 18 (LTS)
- npm ≥ 9

## Setup

```bash
git clone <repo-url> && cd Webpage
git checkout 001-portfolio-site
npm install
```

## Development

```bash
# Build the site (JSON → HTML, image optimization, minification)
npm run build

# Preview locally
npx serve dist
# → Open http://localhost:3000
```

## Project Layout

```
src/
├── template.html      # HTML template with {{placeholders}}
├── styles.css         # All styles (mobile-first, custom properties for theming)
├── main.js            # Theme toggle, hamburger menu, scroll animations, email obfuscation
└── constants.js       # GA measurement ID, breakpoints, animation config

data/
├── profile.json       # Name, tagline, bio, email, social links
├── skills.json        # Skills grouped by category
├── projects.json      # Project cards
├── experience.json    # Employment timeline
├── me.jpeg            # Profile photo (source)
└── mirror-lake.jpeg   # Hero background (source)

build.js               # Build script: template rendering, image optimization, minification
dist/                  # Build output (git-ignored)
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Full production build → `dist/` |
| `npm run validate` | Run HTML validation + accessibility check |
| `npx serve dist` | Local preview server |

## Editing Content

1. Edit the relevant JSON file in `data/` (see `data-model.md` for schema)
2. Run `npm run build`
3. Preview with `npx serve dist`
4. Commit and push — GitHub Actions deploys automatically

## Theme

- Default: dark mode (or system preference)
- Toggle: sun/moon icon in nav bar
- Persistence: sessionStorage

## Deployment

Push to `main` → GitHub Actions runs `npm run build` → deploys `dist/` to GitHub Pages → live at jaredgalloway.com.
