// Image sizes for generation of optimized assets
// Used by svelte.config to configure vercel adapter

import type { NonEmptyArray } from './utils.ts';
export const logoSizes = {
	xs: 100,
	sm: 160
};

export const contentSizes = {
	sm: 200, // 1/4
	md: 300, // 1/3
	lg: 400, // 1/2
	full: 900 // full
};

export const gallerySizes = {
	xs: 160,
	sm: 400,
	md: 600,
	lg: 900,
	xl: 1200
};

export function getAllImageWidths() {
	return [
		...Object.values(logoSizes),
		...Object.values(contentSizes),
		...Object.values(gallerySizes)
	] as NonEmptyArray<number>;
}
