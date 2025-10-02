import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: [
		// "../src/**/*.mdx",
		'../src/**/*.stories.@(js|ts|svelte)'
	],
	addons: [
		'@storybook/addon-svelte-csf',
		'@chromatic-com/storybook',
		'@storybook/addon-a11y',
		'@storybook/addon-vitest'
	],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	staticDirs: ['../static'],
	async viteFinal(config) {
		const { mergeConfig } = await import('vite');
		return mergeConfig(config, {
			resolve: {
				alias: {
					'$app/navigation': new URL('./mocks.ts', import.meta.url).pathname,
					'$app/environment': new URL('./mocks.ts', import.meta.url).pathname,
					'$app/state': new URL('./mocks.ts', import.meta.url).pathname
				}
			}
		});
	}
};
export default config;
