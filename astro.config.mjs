// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'Tech Architecture Blog',
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