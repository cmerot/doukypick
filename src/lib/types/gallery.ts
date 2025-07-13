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
export interface OptimizedImage {
	webp: string;
	fallback: string;
	width: number;
	height: number;
}
