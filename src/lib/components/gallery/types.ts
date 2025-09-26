// Gallery types and interfaces

// Image format constants for better type safety and reusability
export const IMAGE_FORMATS = ['avif', 'webp', 'jpg'] as const;
export const IMAGE_SIZES = ['optim', 'thumb', 'small', 'medium', 'large', 'xlarge'] as const;

// Derived types from constants
export type ImageFormat = (typeof IMAGE_FORMATS)[number];
export type ImageSize = (typeof IMAGE_SIZES)[number];

export interface GalleryImage {
	url: string;
	title: string;
	alt: string;
	description: string;
	order: number;
	visible: boolean;
}

export interface Gallery {
	id: string;
	title: string;
	description: string;
	closeUrl: string;
	images: GalleryImage[];
	initialIndex?: number;
}

// Partial gallery for when we only need basic info
export interface GalleryData {
	id: string;
	title: string;
	description: string;
	closeUrl: string;
}

// Type for processed image with all optimization data
export interface ImageData {
	slug: string;
	uuid: string;
	title: string;
	description: string;
	href: string;
	url: string;
	alt: string;
	srcset: string;
	originalIndex: number;
}

// Utility types for function parameters (reducing inline complexity)

export interface ImageSlugParts {
	titleSlug: string;
	uuidSuffix: string;
}
