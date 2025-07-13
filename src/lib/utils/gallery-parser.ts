import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { optimizeImage, type OptimizedImage } from './image-optimizer.js';

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

export async function parseGallery(
	galleryPath: string,
	thumbnailWidth: number = 100,
	largeWidth: number = 500
): Promise<GalleryData> {
	const assetsPath = path.join(process.cwd(), 'src/lib/assets', galleryPath);
	const indexPath = path.join(assetsPath, 'index.txt');
	const outputDir = path.join(process.cwd(), 'static', galleryPath);

	if (!existsSync(indexPath)) {
		throw new Error(`Gallery index not found: ${indexPath}`);
	}

	const indexContent = readFileSync(indexPath, 'utf-8');
	const lines = indexContent
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'));

	const images: GalleryImage[] = [];

	for (const line of lines) {
		const colonIndex = line.indexOf(':');
		if (colonIndex === -1) continue;

		const filename = line.substring(0, colonIndex).trim();
		const description = line.substring(colonIndex + 1).trim();

		const sourcePath = path.join(assetsPath, filename);

		if (!existsSync(sourcePath)) {
			console.warn(`Image not found: ${sourcePath}`);
			continue;
		}

		try {
			// Generate thumbnail
			const thumbnail = await optimizeImage(
				sourcePath,
				outputDir,
				filename,
				thumbnailWidth,
				'thumb'
			);

			// Generate large image
			const large = await optimizeImage(sourcePath, outputDir, filename, largeWidth, 'large');

			images.push({
				filename,
				description,
				thumbnail,
				large
			});
		} catch (error) {
			console.error(`Error processing image ${filename}:`, error);
		}
	}

	return {
		path: galleryPath,
		images
	};
}
