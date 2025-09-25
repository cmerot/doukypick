// Gallery types and interfaces

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
	coverImage: object;
	closeUrl: string;
	images: GalleryImage[];
}

export interface ProcessedImage {
	id: number;
	original: GalleryImage;
	uuid: string;
	optimizedPaths: OptimizedPaths;
}

// Optimized image paths structure
export interface OptimizedPaths {
	thumbnail: {
		avif: string;
		webp: string;
		jpg: string;
	};
	sizes: {
		thumb: { avif: string; webp: string; jpg: string };
		small: { avif: string; webp: string; jpg: string };
		medium: { avif: string; webp: string; jpg: string };
		large: { avif: string; webp: string; jpg: string };
		xlarge: { avif: string; webp: string; jpg: string };
	};
}

// Component prop types
export interface PhotoGalleryProps {
	gallery: Gallery;
	class?: string;
	aspectRatio?: string;
	initialImage?: number;
	autoOpenFullscreen?: boolean;
	onFullscreenClose?: () => void;
}

// Image size options
export type ImageSize = 'thumb' | 'small' | 'medium' | 'large' | 'xlarge';

// Image format options
export type ImageFormat = 'avif' | 'webp' | 'jpg';

// Helper type for image sources
export interface ImageSources {
	avif: string;
	webp: string;
	jpg: string;
	alt: string;
}

// Type for processed photo with all optimization data
export interface ProcessedPhoto {
	slug: string;
	uuid: string;
	title: string;
	description: string;
	alt: string;
	srcsets: {
		avif: string;
		webp: string;
		jpg: string;
	};
	sizes: string;
	urls: {
		small: string;
		medium: string;
		large: string;
		xlarge: string;
		thumbnail: string;
	};
	originalIndex: number;
}
