#!/usr/bin/env node
/**
 * publish-to-devto.js — Cross-post de artículos del blog Technical Logbook a dev.to
 *
 * Diseño:
 *  - Fuente de verdad: los .md ya publicados en el repo del blog
 *    (src/content/docs/my-articles/*.md), con su frontmatter final.
 *  - Sin dependencias (Node >= 18, usa fetch nativo). CommonJS.
 *  - SEGURO POR DEFECTO:
 *      * dry-run: no toca dev.to a menos que pases --apply
 *      * crea SIEMPRE como borrador (published: false) a menos que pases --publish
 *      * si el artículo ya existe en dev.to NO lo modifica a menos que pases --update
 *      * nunca des-publica un artículo ya publicado
 *  - Idempotente: identifica artículos existentes por canonical_url (no necesita
 *    archivo de estado).
 *  - Verifica que la URL canónica responda 200 antes de cross-postear
 *    (el original debe estar indexable ANTES que la copia).
 *  - Resuelve las imágenes optimizadas por Astro (/_astro/<nombre>.<hash>.webp)
 *    leyendo el HTML publicado, para que dev.to pueda hotlinkearlas.
 *
 * Uso (desde la raíz del repo del blog):
 *   # Opción A (local): archivo .env en la raíz del repo (ya está en .gitignore):
 *   #   DEVTO_API_KEY=xxxxxxxx     # dev.to > Settings > Extensions > API keys
 *   # Opción B: variable de entorno (CI usa el secret de GitHub)
 *   node scripts/publish-to-devto.cjs src/content/docs/my-articles/post-6-md-view-the-story.md
 *   node scripts/publish-to-devto.cjs --all                       # dry-run de todos
 *   node scripts/publish-to-devto.cjs --all --apply               # crea borradores
 *   node scripts/publish-to-devto.cjs <file> --apply --publish    # publica directo
 *   node scripts/publish-to-devto.cjs <file> --apply --update     # actualiza existente
 *
 * Flags:
 *   --all                 procesa todos los .md de my-articles/
 *   --apply               ejecuta de verdad (default: dry-run)
 *   --publish             crea como publicado (default: borrador)
 *   --update              actualiza artículos que ya existen en dev.to
 *   --offline             no consulta el sitio (omite chequeo canónico e imágenes)
 *   --skip-canonical-check  no exige 200 en la URL canónica
 *   --wait-canonical <s>  reintenta hasta <s> segundos (útil en CI tras el deploy)
 *   --limit <n>           crea como máximo <n> artículos nuevos por corrida (recomendado: 1)
 *   --delay <s>           pausa entre artículos (default 15)
 *   --site <url>          default https://technical-blog-6xs.pages.dev
 *   --content-dir <dir>   default src/content/docs/my-articles
 *   --base-path <path>    default /my-articles
 *   --tags a,b,c          pisa los tags calculados (máx 4)
 *   --json                imprime el payload completo (útil para debug)
 *
 * Variables de entorno:
 *   DEVTO_API_KEY   (obligatoria con --apply; se lee de .env si existe, el entorno tiene prioridad)
 *   DEVTO_API_URL   (opcional; default https://dev.to — útil para tests con mock)
 *
 * Referencias: Forem API v1 — https://developers.forem.com/api/v1
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ───────────────────────── .env (sin dependencias) ─────────────────────────

/** Carga KEY=VALUE desde un .env. Las variables ya definidas en el entorno tienen prioridad. */
function loadDotEnv(file = path.resolve(process.cwd(), '.env')) {
  if (!fs.existsSync(file)) return false;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = raw.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || raw.trimStart().startsWith('#')) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    else v = v.replace(/\s+#.*$/, ''); // comentario inline en valores sin comillas
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
  return true;
}

// ───────────────────────── Configuración ─────────────────────────

const DEFAULTS = {
  site: 'https://technical-blog-6xs.pages.dev',
  contentDir: 'src/content/docs/my-articles',
  basePath: '/my-articles',
  delaySec: 15,
};

// Tags del blog → tags de dev.to (solo letras/números, sin guiones; null = descartar)
const TAG_MAP = {
  ai: 'ai',
  genai: 'ai',
  agentes: 'ai',
  architecture: 'architecture',
  nodejs: 'node',
  devops: 'devops',
  security: 'security',
  governance: null,
  'platform-engineering': 'platformengineering',
  historia: 'history',
  explainer: null,
  opinion: null,
  'case-study': null,
};
const LANGUAGE_TAG = 'spanish'; // el contenido está en español
const MAX_TAGS = 4;

// Case-sensitive para TODO/XXX: en español "todo" es una palabra común.
const PLACEHOLDER_RE = /2026-XX-XX|\[fecha de publicaci[oó]n\]|\bTODO\b|\bXXX\b|\bTBD\b/;

// ───────────────────────── Utilidades puras (exportadas p/ test) ─────────────────────────

/** Mismo criterio que Starlight/github-slugger para nombres de archivo simples. */
function slugify(name) {
  return name
    .replace(/\.mdx?$/i, '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function unquote(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    const q = v[0];
    v = v.slice(1, -1);
    if (q === '"') v = v.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    else v = v.replace(/''/g, "'");
  }
  return v;
}

/** Parser mínimo de frontmatter: claves top-level, strings, números, arrays inline. */
function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (/^\s/.test(line) || !line.includes(':')) continue; // ignora anidados (sidebar: order:)
    const i = line.indexOf(':');
    const key = line.slice(0, i).trim();
    const raw = line.slice(i + 1).trim();
    if (raw === '') continue;
    if (raw.startsWith('[') && raw.endsWith(']')) {
      data[key] = raw.slice(1, -1).split(',').map(unquote).filter(Boolean);
    } else if (/^-?\d+(\.\d+)?$/.test(raw)) {
      data[key] = Number(raw);
    } else if (/^(true|false)$/.test(raw)) {
      data[key] = raw === 'true';
    } else {
      data[key] = unquote(raw);
    }
  }
  return { data, body: src.slice(m[0].length) };
}

function computeTags(blogTags = [], override) {
  const out = [];
  const push = (t) => { if (t && !out.includes(t)) out.push(t); };
  const source = override && override.length ? override : blogTags.map((t) => TAG_MAP[t] !== undefined ? TAG_MAP[t] : sanitizeTag(t));
  for (const t of source) push(sanitizeTag(t));
  const trimmed = out.slice(0, MAX_TAGS - 1);
  if (!trimmed.includes(LANGUAGE_TAG)) trimmed.push(LANGUAGE_TAG);
  return trimmed.slice(0, MAX_TAGS);
}
function sanitizeTag(t) {
  if (!t) return null;
  const s = String(t).toLowerCase().replace(/[^a-z0-9]/g, '');
  return s || null;
}

/** Aplica fn solo a las líneas que NO están dentro de bloques de código ```/~~~. */
function mapOutsideFences(body, fn) {
  let inFence = false;
  let fenceMark = '';
  return body.split('\n').map((line) => {
    const f = line.match(/^\s*(```+|~~~+)/);
    if (f) {
      if (!inFence) { inFence = true; fenceMark = f[1][0]; }
      else if (f[1][0] === fenceMark) { inFence = false; }
      return line;
    }
    return inFence ? line : fn(line);
  }).join('\n');
}

const IMG_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const LINK_RE = /(^|[^!])\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Extrae la primera imagen (hero) del cuerpo, fuera de bloques de código. */
function findFirstImage(body) {
  let found = null;
  mapOutsideFences(body, (line) => {
    if (!found) {
      IMG_RE.lastIndex = 0;
      const m = IMG_RE.exec(line);
      if (m) found = { alt: m[1], src: m[2], raw: m[0] };
    }
    return line;
  });
  return found;
}

function removeFirstImage(body, raw) {
  const idx = body.indexOf(raw);
  if (idx === -1) return body;
  const after = body.slice(idx + raw.length).replace(/^\s*\n/, '');
  return (body.slice(0, idx) + after).replace(/^\s+/, '');
}

/** Dado el HTML publicado, devuelve Map(basename-sin-ext → URL absoluta /_astro/...) */
function buildAstroImageMap(html, site) {
  const map = new Map();
  const re = /(?:src|srcset|href|content)=["']([^"']*\/_astro\/[^"'\s,]+\.(?:webp|png|jpe?g|gif|avif|svg))/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    const file = url.split('/').pop();
    // nombre.HASH.ext  → nombre
    const base = file.replace(/\.[A-Za-z0-9_-]{6,}\.[a-z0-9]+$/i, '').replace(/\.[a-z0-9]+$/i, '');
    if (!map.has(base.toLowerCase())) map.set(base.toLowerCase(), new URL(url, site).href);
  }
  return map;
}

function imageBase(src) {
  return path.basename(src.split('?')[0]).replace(/\.[a-z0-9]+$/i, '').toLowerCase();
}

function resolveImageUrl(src, { imageMap, site, canonicalUrl }) {
  if (/^https?:\/\//i.test(src)) return { url: src, ok: true };
  const hit = imageMap && imageMap.get(imageBase(src));
  if (hit) return { url: hit, ok: true };
  // Imágenes en /public → ruta absoluta del sitio
  if (src.startsWith('/')) return { url: new URL(src, site).href, ok: true };
  return { url: new URL(src, canonicalUrl).href, ok: false }; // probablemente roto
}

function rewriteLinks(line, { site, basePath, canonicalUrl }) {
  return line.replace(LINK_RE, (full, pre, text, href) => {
    if (/^(https?:|mailto:|#|tel:)/i.test(href)) return full;
    let out;
    if (href.startsWith('/')) {
      out = new URL(href, site).href;
    } else if (/\.mdx?(#.*)?$/i.test(href)) {
      const [file, hash = ''] = href.split('#');
      out = `${site}${basePath}/${slugify(path.basename(file))}/${hash ? '#' + hash : ''}`;
    } else {
      out = new URL(href, canonicalUrl).href;
    }
    return `${pre}[${text}](${out})`;
  });
}

/** Construye el payload de dev.to a partir del .md del blog. */
function buildArticle({ file, src, opts, imageMap }) {
  const { data, body: rawBody } = parseFrontmatter(src);
  const slug = data.slug || slugify(path.basename(file));
  const canonicalUrl = `${opts.site}${opts.basePath}/${slug}/`;
  const warnings = [];

  if (!data.title) throw new Error(`${file}: falta "title" en el frontmatter`);
  const placeholderHit = [data.title, data.description, String(data.publishDate || ''), rawBody]
    .join('\n').match(PLACEHOLDER_RE);
  if (placeholderHit) throw new Error(`${file}: contiene placeholder sin resolver ("${placeholderHit[0]}") — no se cross-postea`);
  if (data.draft === true) throw new Error(`${file}: draft: true — no se cross-postea`);

  let body = rawBody.replace(/\r\n/g, '\n');

  // Hero → cover image de dev.to
  let mainImage;
  const hero = findFirstImage(body);
  if (hero) {
    const r = resolveImageUrl(hero.src, { imageMap, site: opts.site, canonicalUrl });
    if (r.ok) {
      mainImage = r.url;
      body = removeFirstImage(body, hero.raw);
    } else {
      warnings.push(`hero no resuelto (${hero.src}); se deja en el cuerpo`);
    }
  }

  // Imágenes restantes + links relativos (fuera de code fences)
  body = mapOutsideFences(body, (line) => {
    line = line.replace(IMG_RE, (full, alt, src2) => {
      const r = resolveImageUrl(src2, { imageMap, site: opts.site, canonicalUrl });
      if (!r.ok) warnings.push(`imagen no resuelta: ${src2}`);
      return `![${alt}](${r.url})`;
    });
    return rewriteLinks(line, { site: opts.site, basePath: opts.basePath, canonicalUrl });
  });

  const header = `> Publicado originalmente en [Technical Logbook](${canonicalUrl}).\n\n`;
  const article = {
    title: data.title,
    body_markdown: header + body.trim() + '\n',
    published: false, // lo decide el caller
    canonical_url: canonicalUrl,
    tags: computeTags(data.tags, opts.tagsOverride),
  };
  if (data.description) article.description = String(data.description).slice(0, 300);
  if (mainImage) article.main_image = mainImage;
  if (data.series) {
    article.series = String(data.series);
  }
  return { slug, canonicalUrl, article, warnings, publishDate: data.publishDate };
}

// ───────────────────────── Red ─────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkCanonical(url, waitSec) {
  const deadline = Date.now() + waitSec * 1000;
  let last;
  for (;;) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'publish-to-devto/1.0' } });
      if (res.ok) return { ok: true, html: await res.text() };
      last = `HTTP ${res.status}`;
    } catch (e) { last = e.message; }
    if (Date.now() >= deadline) return { ok: false, reason: last };
    await sleep(10_000);
  }
}

class DevTo {
  constructor(apiKey, base) {
    this.key = apiKey;
    this.base = (base || 'https://dev.to').replace(/\/$/, '');
  }
  async req(method, p, body, attempt = 1) {
    const res = await fetch(this.base + p, {
      method,
      headers: {
        'api-key': this.key,
        'Accept': 'application/vnd.forem.api-v1+json',
        'Content-Type': 'application/json',
        'User-Agent': 'publish-to-devto/1.0',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429 && attempt <= 5) {
      const wait = Number(res.headers.get('retry-after')) || 10 * attempt;
      console.log(`    ⏳ 429 rate limit — reintento en ${wait}s`);
      await sleep(wait * 1000);
      return this.req(method, p, body, attempt + 1);
    }
    const text = await res.text();
    let json; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    if (!res.ok) {
      const err = new Error(`dev.to ${method} ${p} → ${res.status}: ${typeof json === 'string' ? json : JSON.stringify(json)}`);
      err.status = res.status;
      throw err;
    }
    return json;
  }
  /** Todos MIS artículos (publicados + borradores). */
  async myArticles() {
    const all = [];
    for (let page = 1; page < 20; page++) {
      const chunk = await this.req('GET', `/api/articles/me/all?per_page=100&page=${page}`);
      all.push(...chunk);
      if (chunk.length < 100) break;
    }
    return all;
  }
  create(article) { return this.req('POST', '/api/articles', { article }); }
  update(id, article) { return this.req('PUT', `/api/articles/${id}`, { article }); }
}

const normUrl = (u) => (u || '').replace(/\/+$/, '').toLowerCase();

// ───────────────────────── CLI ─────────────────────────

function parseArgs(argv) {
  const o = { ...DEFAULTS, files: [], flags: new Set(), tagsOverride: null, waitCanonical: 0, limit: Infinity };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--site': o.site = next().replace(/\/$/, ''); break;
      case '--content-dir': o.contentDir = next(); break;
      case '--base-path': o.basePath = '/' + next().replace(/^\/|\/$/g, ''); break;
      case '--delay': o.delaySec = Number(next()); break;
      case '--limit': o.limit = Number(next()); break;
      case '--wait-canonical': o.waitCanonical = Number(next()); break;
      case '--tags': o.tagsOverride = next().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--help': case '-h': o.flags.add('help'); break;
      default:
        if (a.startsWith('--')) o.flags.add(a.slice(2));
        else o.files.push(a);
    }
  }
  return o;
}

async function main() {
  loadDotEnv();
  const opts = parseArgs(process.argv.slice(2));
  const has = (f) => opts.flags.has(f);
  if (has('help') || (!opts.files.length && !has('all'))) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('\n').slice(1).map((l) => l.replace(/^ ?\* ?/, '')).join('\n'));
    process.exit(has('help') ? 0 : 1);
  }

  const apply = has('apply');
  const wantPublish = has('publish');
  const allowUpdate = has('update');
  const offline = has('offline');

  let files = opts.files;
  if (has('all')) {
    files = fs.readdirSync(opts.contentDir).filter((f) => /\.mdx?$/i.test(f)).sort()
      .map((f) => path.join(opts.contentDir, f));
  }

  let api = null;
  let existing = [];
  if (apply && !process.env.DEVTO_API_KEY) { console.error('✗ Falta DEVTO_API_KEY'); process.exit(1); }
  if (process.env.DEVTO_API_KEY) {
    // Lectura (GET) también en dry-run: permite saber qué ya existe sin escribir nada.
    api = new DevTo(process.env.DEVTO_API_KEY, process.env.DEVTO_API_URL);
    existing = await api.myArticles();
    console.log(`dev.to: ${existing.length} artículos existentes en tu cuenta.\n`);
  }
  if (!apply) console.log('— DRY-RUN (agregá --apply para ejecutar) —\n');

  const results = [];
  let created = 0;
  for (let n = 0; n < files.length; n++) {
    const file = files[n];
    if (created >= opts.limit) { console.log(`▸ ${path.basename(file)}\n    ↷ omitido (--limit ${opts.limit} alcanzado)\n`); continue; }
    console.log(`▸ ${path.basename(file)}`);
    try {
      const src = fs.readFileSync(file, 'utf8');
      const probe = buildArticle({ file, src, opts, imageMap: null }); // valida + obtiene canonical
      let imageMap = null;

      if (!offline) {
        const c = await checkCanonical(probe.canonicalUrl, has('skip-canonical-check') ? 0 : opts.waitCanonical);
        if (!c.ok && has('skip-canonical-check')) {
          console.log(`    ⚠ canónica no responde (${c.reason}); sigo por --skip-canonical-check (imágenes sin resolver)`);
        } else if (!c.ok) throw new Error(`la URL canónica no responde 200 (${probe.canonicalUrl} → ${c.reason}). Publicá/deployá el blog primero.`);
        imageMap = c.ok ? buildAstroImageMap(c.html, opts.site) : null;
      }

      const built = buildArticle({ file, src, opts, imageMap });
      const prior = existing.find((a) => normUrl(a.canonical_url) === normUrl(built.canonicalUrl));
      built.article.published = prior ? prior.published : wantPublish; // nunca des-publica

      built.warnings.forEach((w) => console.log(`    ⚠ ${w}`));
      console.log(`    canonical: ${built.canonicalUrl}`);
      console.log(`    tags: ${built.article.tags.join(', ')}${built.article.series ? ` · serie: ${built.article.series}` : ''}`);
      console.log(`    cover: ${built.article.main_image || '(ninguna)'}`);
      if (has('json')) console.log(JSON.stringify(built.article, null, 2));

      let action;
      if (prior && !allowUpdate) {
        action = `existe (id ${prior.id}, ${prior.published ? 'publicado' : 'borrador'}) → omitido (usá --update)`;
      } else if (!apply) {
        action = prior ? `[dry-run] actualizaría id ${prior.id}` : `[dry-run] crearía ${wantPublish ? 'PUBLICADO' : 'borrador'}`;
        if (!prior) created++;
      } else if (prior) {
        const r = await api.update(prior.id, built.article);
        action = `actualizado id ${r.id} → ${r.url}`;
      } else {
        const r = await api.create(built.article);
        action = `creado ${r.published ? 'PUBLICADO' : 'borrador'} id ${r.id} → ${r.url}`;
        existing.push(r);
        created++;
      }
      console.log(`    ✓ ${action}\n`);
      results.push({ file, ok: true, action });
      if (apply && n < files.length - 1 && !(prior && !allowUpdate)) await sleep(opts.delaySec * 1000);
    } catch (e) {
      console.log(`    ✗ ${e.message}\n`);
      results.push({ file, ok: false, error: e.message });
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`Resumen: ${results.length - failed} ok, ${failed} con error.`);
  process.exit(failed ? 1 : 0);
}

module.exports = {
  loadDotEnv, slugify, parseFrontmatter, computeTags, mapOutsideFences, findFirstImage, removeFirstImage,
  buildAstroImageMap, rewriteLinks, buildArticle, DevTo,
};

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
