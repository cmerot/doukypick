import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Gallery, ProcessedPhoto } from '$lib/components/gallery/types';
import { parsePhotoSlug } from '$lib/components/gallery/utils';
import fs from 'fs/promises';
import path from 'path';
import { processPhoto } from '$lib/components/gallery/utils';

const GALLERIES_DIR = 'src/content/galleries';

export const load: PageServerLoad = async ({ params }) => {
	const { gallery: galleryId, slug } = params;

	// Load gallery with error handling
	let gallery: Gallery;
	try {
		const content = await fs.readFile(path.join(GALLERIES_DIR, galleryId, 'gallery.json'), 'utf-8');
		gallery = JSON.parse(content);
	} catch {
		throw error(404, `Gallery "${galleryId}" not found`);
	}

	// Single-pass processing: filter + map + find current
	const { uuidSuffix } = parsePhotoSlug(slug);
	const photos: ProcessedPhoto[] = [];
	let currentPhotoIndex = -1;

	// Ultra-optimized single loop
	for (let i = 0, j = 0; i < gallery.images.length; i++) {
		const photo = gallery.images[i];
		if (!photo.visible) continue;

		const processedPhoto = processPhoto(photo, galleryId, i);
		photos[j] = processedPhoto;

		// Check if this is the current photo during processing
		if (processedPhoto.uuid.endsWith(uuidSuffix)) {
			currentPhotoIndex = j;
		}
		j++;
	}

	// Error if photo not found
	if (currentPhotoIndex === -1) {
		throw error(404, `Photo "${slug}" not found`);
	}

	const currentPhoto = photos[currentPhotoIndex];

	// Minimal return object
	return {
		gallery: {
			id: gallery.id,
			title: gallery.title,
			description: gallery.description,
			closeUrl: gallery.closeUrl
		},
		photos,
		currentPhoto,
		currentPhotoIndex,
		meta: {
			title: `${currentPhoto.title} - ${gallery.title}`,
			description: currentPhoto.description,
			ogImage: currentPhoto.urls.large,
			ogImageAlt: currentPhoto.alt
		}
	};
};
