import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Gallery, ImageData, GalleryData } from '$lib/components/gallery/types';
import { parsePhotoSlug } from '$lib/components/gallery/utils';
import { processImage } from '$lib/components/gallery/utils';
import { galleries } from '$content/galleries';

export const load: PageServerLoad = async ({ params }) => {
	const { gallery: galleryId, slug } = params;

	// Load gallery with error handling
	let gallery: Gallery;
	try {
		gallery = galleries[galleryId as keyof typeof galleries];
	} catch {
		throw error(404, `Gallery "${galleryId}" not found`);
	}

	// Single-pass processing: filter + map + find current
	const { uuidSuffix } = parsePhotoSlug(slug);
	const images: ImageData[] = [];
	let currentIndex = -1;

	// Ultra-optimized single loop
	for (let i = 0, j = 0; i < gallery.images.length; i++) {
		const photo = gallery.images[i];
		if (!photo.visible) continue;

		const processedPhoto = processImage(photo, galleryId, i);
		images[j] = processedPhoto;

		// Check if this is the current photo during processing
		if (processedPhoto.uuid.endsWith(uuidSuffix)) {
			currentIndex = j;
		}
		j++;
	}

	// Error if photo not found
	if (currentIndex === -1) {
		throw error(404, `Photo "${slug}" not found`);
	}

	const currentImage = images[currentIndex];

	// Minimal return object
	return {
		gallery: {
			id: gallery.id,
			title: gallery.title,
			description: gallery.description,
			closeUrl: gallery.closeUrl
		} as GalleryData,
		images,
		currentPhoto: currentImage,
		currentIndex,
		meta: {
			title: `${currentImage.title} - ${gallery.title}`,
			description: currentImage.description,
			ogImage: currentImage.urls.large,
			ogImageAlt: currentImage.alt
		}
	};
};
