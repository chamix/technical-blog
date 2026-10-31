// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// slug → fecha para <lastmod> en el sitemap: usa lastUpdated si el artículo
// lo declara (actualización sustancial), sino cae a publishDate (frontmatter).
const articlesDir = new URL('./src/content/docs/my-articles/', import.meta.url);
const lastmodBySlug = new Map(
	readdirSync(articlesDir)
		.filter((f) => /\.mdx?$/i.test(f))
		.flatMap((f) => {
			const raw = readFileSync(new URL(f, articlesDir), 'utf8');
			const updated = raw.match(/^lastUpdated:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
			const published = raw.match(/^publishDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
			const m = updated ?? published;
			return m ? [[f.replace(/\.mdx?$/i, '').toLowerCase(), new Date(m[1])]] : [];
		}),
);

// Agrupa el sidebar de "Technical Articles" por serie (en vez de la lista
// plana que generaba autogenerate). Cada serie es un grupo colapsable con un
// link a su página índice (si existe) seguido de sus partes en orden; los
// artículos sin serie quedan sueltos. El orden entre grupos y artículos
// sueltos respeta el `sidebar.order` existente (decisión del 2026-10-18).
const seriesIndexSlugs = new Map([
	['La Mutación Epistemológica de la Interacción Humano-IA', 'interaccion-humano-ia'],
	['No todas las IA son lo mismo', 'no-todas-las-ia-son-lo-mismo'],
	['md-view app: de 0 a release con agentic AI', 'md-view-app'],
	['agentes-en-profundidad', 'agentes-en-profundidad'],
]);

function parseArticleFrontmatter(file) {
	const raw = readFileSync(new URL(file, articlesDir), 'utf8');
	// Algunos artículos tienen CRLF (ver "Lecciones aprendidas" de la guía SEO);
	// el delimitador de frontmatter tolera el \r opcional.
	const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const block = fm ? fm[1] : '';
	const get = (re) => block.match(re)?.[1];
	const unquote = (s) => (s ?? '').trim().replace(/^['"]|['"]$/g, '');
	const seriesPartRaw = get(/^seriesPart:\s*(\d+)/m);
	const orderRaw = get(/^[ \t]+order:\s*(\d+)/m);
	return {
		slug: file.replace(/\.mdx?$/i, '').toLowerCase(),
		title: unquote(get(/^title:\s*(.+)$/m)),
		series: unquote(get(/^series:\s*(.+)$/m)) || undefined,
		seriesPart: seriesPartRaw ? Number(seriesPartRaw) : undefined,
		order: orderRaw ? Number(orderRaw) : 999,
	};
}

const articleEntries = readdirSync(articlesDir)
	.filter((f) => /\.mdx?$/i.test(f))
	.map(parseArticleFrontmatter);

const seriesGroups = new Map();
const standaloneArticles = [];
for (const a of articleEntries) {
	if (a.series) {
		if (!seriesGroups.has(a.series)) seriesGroups.set(a.series, []);
		seriesGroups.get(a.series).push(a);
	} else {
		standaloneArticles.push(a);
	}
}
for (const parts of seriesGroups.values()) {
	parts.sort((x, y) => (x.seriesPart ?? 0) - (y.seriesPart ?? 0));
}

const sidebarEntries = [
	...standaloneArticles.map((a) => ({ kind: 'article', order: a.order, data: a })),
	...[...seriesGroups.entries()].map(([label, parts]) => ({
		kind: 'series',
		order: Math.min(...parts.map((p) => p.order)),
		label,
		parts,
	})),
].sort((a, b) => a.order - b.order);

const articlesSidebarItems = sidebarEntries.map((e) => {
	if (e.kind === 'article') {
		return { label: e.data.title, link: `/my-articles/${e.data.slug}/` };
	}
	const indexSlug = seriesIndexSlugs.get(e.label);
	const items = [];
	if (indexSlug) {
		items.push({ label: '📖 Índice de la serie', link: `/series/${indexSlug}/` });
	}
	items.push(...e.parts.map((p) => ({ label: `${p.seriesPart}. ${p.title}`, link: `/my-articles/${p.slug}/` })));
	return { label: e.label, collapsed: false, items };
});

// https://astro.build/config
export default defineConfig({
    site: 'https://technical-blog-6xs.pages.dev',
    integrations: [
        sitemap({
			serialize(item) {
				const slug = new URL(item.url).pathname.split('/').filter(Boolean).pop()?.toLowerCase();
				const d = slug && lastmodBySlug.get(slug);
				if (d) item.lastmod = d.toISOString();
				return item;
			},
		}),
        starlight({
            title: 'Tech Architecture Blog',
            components: {
                Head: './src/components/Head.astro',
                PageTitle: './src/components/PageTitle.astro',
                Footer: './src/components/Footer.astro',
            },
            head: [
                {
                    tag: 'meta',
                    attrs: {
                        name: 'google-site-verification',
                        content: 'AbRiqtriATXcdbrAAxzdRuX8Xv2D_Yjvfw5F_5CvC50',
                    },
                },
            ],
            defaultLocale: 'root',
            locales: {
                root: {
                    label: 'Español',
                    lang: 'es',
                },
            },
            customCss: [
                './src/styles/custom.css',
            ],
            social: [
                {
                    icon: 'github',
                    label: 'GitHub',
                    href: 'https://github.com/chamix/'
                }
            ],
            sidebar: [
                {
                    label: 'Technical Articles',
                    items: articlesSidebarItems,
                },
                {
                    label: 'Seeds',
                    items: [{ autogenerate: { directory: 'seeds' } }],
                },
            ],
        }),
    ],
});