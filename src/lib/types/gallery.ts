export interface OptimizedImage {
	webp: string;
	fallback: string;
	width: number;
	height: number;
	path: string;
	fallback_path: string;
}

export interface GalleryImage {
	filename: string;
	description: string;
	thumbnail: OptimizedImage;
	large: OptimizedImage;
}

export interface GalleryData {
	path: string;
	images: GalleryImage[];
}

export interface GalleryConfig {
	thumbnailWidth: number;
	largeWidth: number;
	images: Array<{
		filename: string;
		description: string;
	}>;
}

export interface JsonIndexItem {
	description: string;
	thumbnail: {
		path: string;
		fallback_path: string;
		width: number;
		height: number;
	};
	large: {
		path: string;
		fallback_path: string;
		width: number;
		height: number;
	};
}
