import { parseIndexFile } from '$lib/utils/gallery-parser.js';
import { type GalleryData } from '$lib/types/gallery';
import type { PageServerLoad } from './$types';
import { existsSync } from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ params }) => {
	const galleryPath = 'tatouages'; // Change this to your gallery path

	try {
		const assetsPath = path.join(process.cwd(), 'src/lib/assets', galleryPath);
		const indexPath = path.join(assetsPath, 'index.txt');

		if (!existsSync(indexPath)) {
			throw new Error(`Gallery index not found: ${indexPath}`);
		}

		// Parse the index file to get config and image list
		const config = parseIndexFile(indexPath);

		// Build gallery data with pre-generated image paths
		const images = config.images.map((imageConfig) => {
			const { filename, description } = imageConfig;
			const ext = path.extname(filename).toLowerCase();
			const nameWithoutExt = path.basename(filename, ext);
			const fallbackExt = ext === '.png' ? '.png' : '.jpg';

			return {
				filename,
				description,
				thumbnail: {
					webp: `${nameWithoutExt}_thumb.webp`,
					fallback: `${nameWithoutExt}_thumb${fallbackExt}`,
					width: config.thumbnailWidth,
					height: config.thumbnailWidth
				},
				large: {
					webp: `${nameWithoutExt}_large.webp`,
					fallback: `${nameWithoutExt}_large${fallbackExt}`,
					width: config.largeWidth,
					height: config.largeWidth
				}
			};
		});

		const galleryData: GalleryData = {
			path: galleryPath,
			images
		};

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
