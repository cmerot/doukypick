// Gallery types and interfaces

export type ImageAspectRatio = `${number}/${number}`;
export type ImageOrientation = 'portrait' | 'landscape';

export interface GalleryImage {
	src: string;
	title: string;
	description: string;
	alt: string;
	published: boolean;
}

export interface Gallery {
	title: string;
	description: string;
	slug: string;
	closeUrl: string;
	initialIndex?: number;
	images: GalleryImage[];
	aspectRatio: ImageAspectRatio;
	orientation: ImageOrientation;
}

// Partial gallery for when we only need basic info
export interface GalleryData {
	title: string;
	slug: string;
	description: string;
	closeUrl: string;
	aspectRatio: ImageAspectRatio;
	orientation: ImageOrientation;
}

// Type for processed image with all optimization data
export interface ImageData {
	src: string;
	title: string;
	description: string;
	alt: string;
	slug: string;
	uuid: string;
	href: string;
	srcset: string;
	originalIndex: number;
}

// Utility types for function parameters (reducing inline complexity)

export interface ImageSlugParts {
	titleSlug: string;
	uuidSuffix: string;
}
