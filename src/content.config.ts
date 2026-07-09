import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: (context) => z.object({
				tags: z.array(z.string()).optional(),
				publishDate: z.coerce.date().optional(),
				series: z.string().optional(),
				seriesPart: z.number().optional(),
			}),
		})
	}),
};