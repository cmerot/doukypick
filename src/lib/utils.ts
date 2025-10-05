import { dev } from '$app/environment';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
type NonEmptyArray<T> = [T, ...T[]];

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function createSrc(src: string, width: number = 600, quality: number = 90): string {
	const url = dev
		? `${src}?w=${width}&q=${quality}`
		: `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
	return `${url} ${width}w`;
}

export function createSrcset(
	src: string,
	widths: NonEmptyArray<number> = [150, 400, 600, 900, 1200],
	quality: number = 90
) {
	// If URL has a protocol, return it as-is without modifications
	if (src.includes('://')) {
		return src;
	}

	return widths
		.slice()
		.sort((a, b) => a - b)
		.map((width) => createSrc(src, width, quality))
		.join(', ');
}
