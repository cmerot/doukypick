import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { execSync } from 'child_process';

// Get build info
const getGitCommit = () => {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'unknown';
	}
};

const buildCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || getGitCommit();
const buildDate = new Date().toISOString();
const repoUrl = 'https://github.com/cmerot/doukypick';
const commitUrl = `${repoUrl}/commit/${process.env.VERCEL_GIT_COMMIT_SHA || buildCommit}`;

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		'import.meta.env.VITE_BUILD_COMMIT': JSON.stringify(buildCommit),
		'import.meta.env.VITE_BUILD_DATE': JSON.stringify(buildDate),
		'import.meta.env.VITE_COMMIT_URL': JSON.stringify(commitUrl)
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'plugins',
					environment: 'node',
					include: ['plugins/**/*.{test,spec}.{js,ts}'],
					exclude: ['plugins/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
