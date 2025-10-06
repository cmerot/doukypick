import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import remarkGallery from './plugins/remark/gallery.ts';
import remarkGoogleReviews from './plugins/remark/google-reviews.ts';
import remarkImage from './plugins/remark/image.ts';
import remarkScriptAggregator from './plugins/remark/script-aggregator.ts';
import { getAllImageWidths } from './src/lib/image-sizes.ts';

const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			remarkPlugins: [remarkGallery, remarkGoogleReviews, remarkImage, remarkScriptAggregator],
			extensions: ['.mdx']
		})
	],
	kit: {
		adapter: adapter({
			images: {
				sizes: getAllImageWidths(),
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300,
				domains: ['www.doukypick.fr']
			}
		}),
		prerender: {
			handleHttpError: ({ path, message }) => {
				// Ignore errors for Vercel image optimization URLs during prerendering
				if (path.startsWith('/_vercel/image')) {
					return;
				}
				throw new Error(message);
			}
		},
		alias: {
			'$content/*': './src/content/*'
		}
	},
	extensions: ['.svelte', '.mdx']
};

export default config;
