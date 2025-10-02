import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const slug = params.slug || 'tatouages';

	const parentData = await parent();

	try {
		// Eagerly import the .svx file based on the slug
		const post = await import(`../../../content/pages/${slug}.mdx`);

		return {
			...parentData,
			slug,
			metadata: post.metadata,
			component: post.default
		};
	} catch (e) {
		throw error(404, `Post not found: ${slug}`);
	}
};
