import { parseGallery } from '$lib/utils/gallery-parser.js';
import { type GalleryData } from '$lib/types/gallery';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	// You can customize these values or get them from params/search params
	const galleryPath = 'salon'; // Change this to your gallery path
	const thumbnailWidth = 200;
	const largeWidth = 800;

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
