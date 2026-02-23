#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const CleanCSS = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');
const { minify: minifyJS } = require('terser');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DATA = path.join(ROOT, 'data');
const DIST = path.join(ROOT, 'dist');
const IMAGES_OUT = path.join(DIST, 'images');

// ── T008: JSON Validation Module ────────────────────────────────────────

function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in ${path.basename(filePath)}: ${e.message}`);
  }
}

function requireField(obj, field, file) {
  if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
    throw new Error(`${file}: missing required field "${field}"`);
  }
}

function requireURL(url, field, file) {
  try {
    new URL(url);
  } catch {
    throw new Error(`${file}: invalid URL in "${field}": ${url}`);
  }
}

function validateProfile(profile) {
  const file = 'profile.json';
  for (const f of ['name', 'tagline', 'bio', 'email', 'photo', 'heroImage']) {
    requireField(profile, f, file);
  }
  if (!Array.isArray(profile.social) || profile.social.length === 0) {
    throw new Error(`${file}: "social" must be a non-empty array`);
  }
  for (const s of profile.social) {
    requireField(s, 'platform', file);
    requireField(s, 'url', file);
    requireField(s, 'label', file);
    requireURL(s.url, `social[${s.platform}].url`, file);
  }
}

function validateSkills(skills) {
  const file = 'skills.json';
  if (!Array.isArray(skills) || skills.length === 0) {
    throw new Error(`${file}: must be a non-empty array`);
  }
  for (const cat of skills) {
    requireField(cat, 'category', file);
    if (!Array.isArray(cat.items) || cat.items.length === 0) {
      throw new Error(`${file}: category "${cat.category}" must have non-empty items`);
    }
    for (const item of cat.items) {
      requireField(item, 'name', file);
    }
  }
}

function validateProjects(projects) {
  const file = 'projects.json';
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error(`${file}: must be a non-empty array`);
  }
  for (const p of projects) {
    requireField(p, 'title', file);
    requireField(p, 'description', file);
    if (!Array.isArray(p.tags) || p.tags.length === 0) {
      throw new Error(`${file}: project "${p.title}" must have non-empty tags`);
    }
    if (!Array.isArray(p.links) || p.links.length === 0) {
      throw new Error(`${file}: project "${p.title}" must have non-empty links`);
    }
    for (const link of p.links) {
      requireField(link, 'label', file);
      requireField(link, 'url', file);
      requireURL(link.url, `links[${link.label}].url`, file);
    }
  }
}

function validateExperience(experience) {
  const file = 'experience.json';
  if (!Array.isArray(experience) || experience.length === 0) {
    throw new Error(`${file}: must be a non-empty array`);
  }
  for (const e of experience) {
    requireField(e, 'title', file);
    requireField(e, 'organization', file);
    requireField(e, 'startDate', file);
    requireField(e, 'endDate', file);
    requireField(e, 'description', file);
    if (!/^\d{4}-\d{2}$/.test(e.startDate)) {
      throw new Error(`${file}: "${e.title}" startDate must be YYYY-MM format`);
    }
    if (e.endDate !== 'Present' && !/^\d{4}-\d{2}$/.test(e.endDate)) {
      throw new Error(`${file}: "${e.title}" endDate must be YYYY-MM or "Present"`);
    }
  }
}

function validateData() {
  console.log('  Validating JSON data...');
  const profile = readJSON(path.join(DATA, 'profile.json'));
  validateProfile(profile);

  const photoPath = path.join(DATA, profile.photo);
  if (!fs.existsSync(photoPath)) {
    throw new Error(`profile.json: photo file not found: ${profile.photo}`);
  }
  const heroPath = path.join(DATA, profile.heroImage);
  if (!fs.existsSync(heroPath)) {
    throw new Error(`profile.json: heroImage file not found: ${profile.heroImage}`);
  }

  const skills = readJSON(path.join(DATA, 'skills.json'));
  validateSkills(skills);

  const projects = readJSON(path.join(DATA, 'projects.json'));
  validateProjects(projects);

  const experience = readJSON(path.join(DATA, 'experience.json'));
  validateExperience(experience);

  console.log('  ✓ All JSON data valid');
  return { profile, skills, projects, experience };
}

// ── T009: Template Rendering Module ─────────────────────────────────────

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function renderHero(profile) {
  return `<section id="hero" class="hero">
      <div class="hero__content">
        <h1 class="hero__name">${escapeHTML(profile.name)}</h1>
        <p class="hero__tagline">${escapeHTML(profile.tagline)}</p>
        <a href="#projects" class="hero__cta">View My Work</a>
      </div>
    </section>`;
}

function renderAbout(profile) {
  const paragraphs = profile.bio.split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${escapeHTML(p.trim())}</p>`)
    .join('\n          ');

  return `<section id="about" class="about">
      <div class="about__inner">
        <div class="about__photo-wrap">
          <picture>
            <source srcset="images/me-480.avif 480w, images/me-768.avif 768w, images/me-1280.avif 1280w, images/me-1920.avif 1920w" type="image/avif">
            <source srcset="images/me-480.webp 480w, images/me-768.webp 768w, images/me-1280.webp 1280w, images/me-1920.webp 1920w" type="image/webp">
            <img src="images/me-768.jpeg" srcset="images/me-480.jpeg 480w, images/me-768.jpeg 768w, images/me-1280.jpeg 1280w, images/me-1920.jpeg 1920w" sizes="(max-width: 768px) 100vw, 400px" alt="Jared Galloway, software engineer and computational biologist" class="about__photo" loading="lazy" width="400" height="400">
          </picture>
        </div>
        <div class="about__text">
          <h2>About</h2>
          ${paragraphs}
        </div>
      </div>
    </section>`;
}

function renderSkills(skills) {
  const groups = skills.map(cat => {
    const items = cat.items.map(item =>
      `<li class="skills__item"><span class="skills__name">${escapeHTML(item.name)}</span></li>`
    ).join('\n            ');
    return `<div class="skills__group">
          <h3>${escapeHTML(cat.category)}</h3>
          <ul class="skills__grid">
            ${items}
          </ul>
        </div>`;
  }).join('\n        ');

  return `<section id="skills" class="skills">
      <h2>Skills</h2>
      <div class="skills__categories">
        ${groups}
      </div>
    </section>`;
}

function renderProjects(projects) {
  const cards = projects.map(p => {
    const tags = p.tags.map(t =>
      `<span class="project__tag">${escapeHTML(t)}</span>`
    ).join(' ');
    const links = p.links.map(l =>
      `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener noreferrer" class="project__link">${escapeHTML(l.label)}</a>`
    ).join(' ');
    return `<article class="project__card">
          <h3 class="project__title">${escapeHTML(p.title)}</h3>
          <p class="project__desc">${escapeHTML(p.description)}</p>
          <div class="project__tags">${tags}</div>
          <div class="project__links">${links}</div>
        </article>`;
  }).join('\n        ');

  return `<section id="projects" class="projects">
      <h2>Projects</h2>
      <div class="projects__grid">
        ${cards}
      </div>
    </section>`;
}

function renderExperience(experience) {
  const entries = experience.map(e => {
    const dateRange = e.endDate === 'Present'
      ? `${e.startDate} – Present`
      : `${e.startDate} – ${e.endDate}`;
    return `<div class="timeline__entry">
          <div class="timeline__dot"></div>
          <div class="timeline__content">
            <h3 class="timeline__title">${escapeHTML(e.title)}</h3>
            <p class="timeline__org">${escapeHTML(e.organization)}</p>
            <time class="timeline__date">${escapeHTML(dateRange)}</time>
            <p class="timeline__desc">${escapeHTML(e.description)}</p>
          </div>
        </div>`;
  }).join('\n        ');

  return `<section id="experience" class="experience">
      <h2>Experience</h2>
      <div class="timeline">
        ${entries}
      </div>
    </section>`;
}

function renderContact(profile) {
  const reversed = reverseString(profile.email);
  const socialLinks = profile.social.map(s =>
    `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(s.label)}" class="contact__social-link contact__social-link--${escapeHTML(s.platform)}">${escapeHTML(s.label)}</a>`
  ).join('\n          ');

  return `<section id="contact" class="contact">
      <h2>Contact</h2>
      <div class="contact__inner">
        <p class="contact__email-wrap">
          <a href="#" class="contact__email" data-email aria-label="Send email to Jared"><span class="contact__email-text" dir="rtl">${escapeHTML(reversed)}</span></a>
          <noscript><span class="contact__email-text" dir="rtl">${escapeHTML(reversed)}</span></noscript>
        </p>
        <div class="contact__social">
          ${socialLinks}
        </div>
      </div>
    </section>`;
}

function renderSEO(profile) {
  const title = `${profile.name} — ${profile.tagline}`;
  const description = `Portfolio of ${profile.name}, ${profile.tagline}. View projects, skills, and experience.`;
  const url = 'https://jaredgalloway.org/';

  return {
    title,
    meta: `<meta name="description" content="${escapeHTML(description)}">
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${escapeHTML(title)}">
    <meta property="og:description" content="${escapeHTML(description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${url}images/mirror-lake-1280.webp">`,
    jsonld: `<script type="application/ld+json">
    ${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.name,
      "jobTitle": profile.tagline,
      "url": url,
      "sameAs": profile.social.map(s => s.url)
    })}
    </script>`
  };
}

function renderTemplate(data) {
  console.log('  Rendering template...');
  let template = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
  const { profile, skills, projects, experience } = data;

  const seo = renderSEO(profile);

  template = template
    .replace('{{title}}', escapeHTML(seo.title))
    .replace('{{seo_meta}}', seo.meta)
    .replace('{{seo_jsonld}}', seo.jsonld)
    .replace('{{hero}}', renderHero(profile))
    .replace('{{about}}', renderAbout(profile))
    .replace('{{skills}}', renderSkills(skills))
    .replace('{{projects}}', renderProjects(projects))
    .replace('{{experience}}', renderExperience(experience))
    .replace('{{contact}}', renderContact(profile))
    .replaceAll('{{nav_links}}', ['Hero', 'About', 'Skills', 'Projects', 'Experience', 'Contact']
      .map(s => `<a href="#${s.toLowerCase()}" class="nav__link">${s}</a>`).join('\n          '));

  fs.writeFileSync(path.join(DIST, 'index.html'), template, 'utf8');
  console.log('  ✓ Template rendered');
}

// ── T010: Image Optimization Module ─────────────────────────────────────

const IMAGE_WIDTHS = [480, 768, 1280, 1920];

async function optimizeImage(inputPath, baseName) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  for (const width of IMAGE_WIDTHS) {
    if (width > metadata.width) continue;
    const resized = sharp(inputPath).resize(width);

    await resized.clone().webp({ quality: 80 })
      .toFile(path.join(IMAGES_OUT, `${baseName}-${width}.webp`));
    await resized.clone().avif({ quality: 65 })
      .toFile(path.join(IMAGES_OUT, `${baseName}-${width}.avif`));
    await resized.clone().jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(IMAGES_OUT, `${baseName}-${width}.jpeg`));
  }
}

async function optimizeImages() {
  console.log('  Optimizing images...');
  fs.mkdirSync(IMAGES_OUT, { recursive: true });

  const jpegs = fs.readdirSync(DATA).filter(f => /\.jpe?g$/i.test(f));
  for (const file of jpegs) {
    const baseName = path.parse(file).name;
    await optimizeImage(path.join(DATA, file), baseName);
    console.log(`    ✓ ${file} → WebP/AVIF/JPEG at ${IMAGE_WIDTHS.join('/')}`);
  }
  console.log('  ✓ Images optimized');
}

// ── T011: Minification Module ───────────────────────────────────────────

async function minifyAssets() {
  console.log('  Minifying assets...');

  // CSS
  const cssInput = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
  const cssResult = new CleanCSS({ level: 2 }).minify(cssInput);
  if (cssResult.errors.length > 0) {
    throw new Error(`CSS minification failed: ${cssResult.errors.join(', ')}`);
  }
  fs.writeFileSync(path.join(DIST, 'styles.css'), cssResult.styles, 'utf8');
  console.log('    ✓ CSS minified');

  // JS
  const constantsJS = fs.readFileSync(path.join(SRC, 'constants.js'), 'utf8');
  const mainJS = fs.readFileSync(path.join(SRC, 'main.js'), 'utf8');
  const jsResult = await minifyJS(constantsJS + '\n' + mainJS, {
    compress: true,
    mangle: true
  });
  if (jsResult.error) {
    throw new Error(`JS minification failed: ${jsResult.error}`);
  }
  fs.writeFileSync(path.join(DIST, 'main.js'), jsResult.code, 'utf8');
  console.log('    ✓ JS minified');

  console.log('  ✓ Assets minified');
}

// ── T012: Static File Copy Module ───────────────────────────────────────

function copyStaticFiles() {
  console.log('  Copying static files...');

  fs.writeFileSync(path.join(DIST, 'CNAME'), 'jaredgalloway.org', 'utf8');

  const staticFiles = ['robots.txt', 'sitemap.xml', '404.html'];
  for (const file of staticFiles) {
    const srcPath = path.join(SRC, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(DIST, file));
    }
  }

  console.log('  ✓ Static files copied');
}

// ── T013: Orchestrator Pipeline ─────────────────────────────────────────

async function minifyFinalHTML() {
  console.log('  Minifying HTML...');
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const result = await minifyHTML(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  });
  fs.writeFileSync(path.join(DIST, 'index.html'), result, 'utf8');
  console.log('  ✓ HTML minified');
}

async function build() {
  console.log('\n🔨 Building portfolio site...\n');

  // 1. Clean dist/
  console.log('[1/7] Cleaning dist/...');
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // 2. Validate JSON
  console.log('[2/7] Validating data...');
  const data = validateData();

  // 3. Render template
  console.log('[3/7] Rendering template...');
  renderTemplate(data);

  // 4. Optimize images
  console.log('[4/7] Optimizing images...');
  await optimizeImages();

  // 5. Minify CSS/JS
  console.log('[5/7] Minifying CSS/JS...');
  await minifyAssets();

  // 6. Copy static files
  console.log('[6/7] Copying static files...');
  copyStaticFiles();

  // 7. Minify HTML (final pass)
  console.log('[7/7] Minifying HTML...');
  await minifyFinalHTML();

  console.log('\n✅ Build complete → dist/\n');
}

build().catch(err => {
  console.error(`\n❌ Build failed: ${err.message}\n`);
  process.exit(1);
});
