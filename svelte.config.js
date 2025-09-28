import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			layout: dirname(fileURLToPath(import.meta.url)) + '/src/lib/components/mdsvex-layout.svelte'
		})
	],
	kit: {
		adapter: adapter({
			images: {
				sizes: [150, 160, 224, 400, 520, 600, 900, 1200],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300,
				domains: ['www.doukypick.fr']
			}
		}),
		alias: {
			'$content/*': './src/content/*'
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
