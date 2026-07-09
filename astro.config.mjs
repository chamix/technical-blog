// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://technical-blog-6xs.pages.dev',
    integrations: [
        sitemap(),
        starlight({
            title: 'Tech Architecture Blog',
            components: {
                Head: './src/components/Head.astro',
            },
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