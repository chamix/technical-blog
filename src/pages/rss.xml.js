import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
	const docs = await getCollection('docs');
	const articles = docs
		.filter((e) => e.id.startsWith('my-articles/') && e.data.publishDate)
		.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

	return rss({
		title: 'Technical Logbook',
		description: 'Arquitectura tecnológica, desarrollo, cloud e IA — por Camilo.',
		site: context.site,
		trailingSlash: true,
		customData: '<language>es-AR</language>',
		items: articles.map((e) => ({
			title: e.data.title,
			description: e.data.description,
			pubDate: e.data.publishDate,
			link: `/${e.id}/`,
			categories: e.data.tags ?? [],
		})),
	});
}
