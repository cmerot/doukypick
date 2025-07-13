import { parseGallery, type GalleryData } from '$lib/utils/gallery-parser.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// You can customize these values or get them from params/search params
	const galleryPath = 'salon'; // Change this to your gallery path
	const thumbnailWidth = 100;
	const largeWidth = 500;

	try {
		const galleryData = await parseGallery(galleryPath, thumbnailWidth, largeWidth);

		return {
			galleryData
		};
	} catch (error) {
		console.error('Error loading gallery:', error);
		throw error;
	}
};

export type PageData = {
	galleryData: GalleryData;
};
