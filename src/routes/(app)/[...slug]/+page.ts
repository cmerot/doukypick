import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// The MDX component isn't serializable (contains functions)
// +page.ts runs universally and can return components
export const load: PageLoad = async ({ params, parent }) => {
	const slug = params.slug || 'tatouages';

	const parentData = await parent();

	try {
		// Dynamically import the .mdx file based on the slug (supports nested paths)
		const modules = import.meta.glob('$content/pages/**/*.mdx', { eager: false });
		const modulePath = `/src/content/pages/${slug}.mdx`;

		const matchingModule = Object.keys(modules).find((path) => path === modulePath);

		if (!matchingModule) {
			throw error(404, `Post not found: ${slug}`);
		}

		const post = (await modules[matchingModule]()) as {
			metadata: any;
			default: any;
		};

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
