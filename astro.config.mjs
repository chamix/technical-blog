// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// slug → fecha de publicación (frontmatter), para <lastmod> en el sitemap
const articlesDir = new URL('./src/content/docs/my-articles/', import.meta.url);
const lastmodBySlug = new Map(
	readdirSync(articlesDir)
		.filter((f) => /\.mdx?$/i.test(f))
		.flatMap((f) => {
			const m = readFileSync(new URL(f, articlesDir), 'utf8').match(/^publishDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
			return m ? [[f.replace(/\.mdx?$/i, '').toLowerCase(), new Date(m[1])]] : [];
		}),
);

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
                    items: [
                        {
                            autogenerate: {
                                directory: 'my-articles',
                            }
                        }
                    ],
                },
                {
                    label: 'Seeds',
                    items: [{ autogenerate: { directory: 'seeds' } }],
                },
            ],
        }),
    ],
});