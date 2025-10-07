import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Gallery, ImageData, GalleryData } from '$lib/components/gallery/types';
import { parsePhotoSlug } from '$lib/components/gallery/utils';
import { processImage } from '$lib/components/gallery/utils';

export const load: PageServerLoad = async ({ params }) => {
	const { gallery: galleryId, slug } = params;

	// Load specific gallery file with error handling
	let gallery: Gallery;
	try {
		const modules = import.meta.glob('$content/galleries/**/*.json', { eager: false });
		const modulePath = `/src/content/galleries/${galleryId}.json`;

		const matchingModule = Object.keys(modules).find((path) => path === modulePath);

		if (!matchingModule) {
			throw error(404, `Gallery "${galleryId}" not found`);
		}

		const galleryModule = (await modules[matchingModule]()) as { default: Gallery };
		gallery = galleryModule.default;
	} catch {
		throw error(404, `Gallery "${galleryId}" not found`);
	}

	// Single-pass processing: filter + map + find current
	const { uuidSuffix } = parsePhotoSlug(slug);
	const images: ImageData[] = [];
	let currentIndex = -1;

	// Ultra-optimized single loop
	for (let i = 0, j = 0; i < gallery.images.length; i++) {
		const image = gallery.images[i];
		if (!image.published) continue;

		const processedPhoto = processImage(image, galleryId, i);
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
			slug: gallery.slug,
			title: gallery.title,
			description: gallery.description,
			closeUrl: gallery.closeUrl,
			aspectRatio: gallery.aspectRatio,
			orientation: gallery.orientation
		} as GalleryData,
		images,
		currentPhoto: currentImage,
		currentIndex,
		meta: {
			title: `${currentImage.title} - ${gallery.title}`,
			description: currentImage.description,
			ogImage: currentImage.src,
			ogImageAlt: currentImage.alt
		}
	};
};
