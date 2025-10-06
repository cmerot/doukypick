import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PUBLIC_USE_VERCEL_IMAGE_OPTIMIZATION } from '$env/static/public';
import { getAllImageWidths } from './image-sizes';

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
export type NonEmptyArray<T> = [T, ...T[]];

const useVercelOptimization = PUBLIC_USE_VERCEL_IMAGE_OPTIMIZATION === 'true';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function createSrc(src: string, width: number = 600, quality: number = 90): string {
	return useVercelOptimization
		? `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
		: `${src}?w=${width}&q=${quality}`;
}

export function createSrcset(
	src: string,
	widths: NonEmptyArray<number> = getAllImageWidths(),
	quality: number = 90
) {
	// If URL has a protocol, return it as-is without modifications
	if (src.includes('://')) {
		return src;
	}

	return [...new Set(widths)]
		.sort((a, b) => a - b)
		.map((width) => `${createSrc(src, width, quality)} ${width}w`)
		.join(', ');
}
