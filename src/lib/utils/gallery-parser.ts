import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { optimizeImage } from './image-optimizer';
import type { GalleryData, GalleryImage } from '$lib/types/gallery';

interface GalleryConfig {
	thumbnailWidth: number;
	largeWidth: number;
	images: Array<{
		filename: string;
		description: string;
	}>;
}

export function parseIndexFile(indexPath: string): GalleryConfig {
	const content = readFileSync(indexPath, 'utf-8');
	const sections = content.split('---');

	if (sections.length < 2) {
		throw new Error('Index file must have a header section separated by ---');
	}

	// Parse header (JSON config)
	const headerContent = sections[0].trim();
	let config: { thumbnailWidth: number; largeWidth: number };

	try {
		config = JSON.parse(headerContent);
	} catch (error) {
		throw new Error('Invalid JSON in index header');
	}

	// Parse images section
	const imagesContent = sections[1].trim();
	const lines = imagesContent
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'));

	const images = lines
		.map((line) => {
			const colonIndex = line.indexOf(':');
			if (colonIndex === -1) return null;

			const filename = line.substring(0, colonIndex).trim();
			const description = line.substring(colonIndex + 1).trim();
			return { filename, description };
		})
		.filter(Boolean) as Array<{ filename: string; description: string }>;

	return {
		thumbnailWidth: config.thumbnailWidth,
		largeWidth: config.largeWidth,
		images
	};
}

export async function parseGallery(
	galleryPath: string,
	thumbnailWidth?: number,
	largeWidth?: number
): Promise<GalleryData> {
	const assetsPath = path.join(process.cwd(), 'src/lib/assets', galleryPath);
	const indexPath = path.join(assetsPath, 'index.txt');
	const outputDir = path.join(process.cwd(), 'static/generated', galleryPath);

	if (!existsSync(indexPath)) {
		throw new Error(`Gallery index not found: ${indexPath}`);
	}

	// Parse the index file
	const config = parseIndexFile(indexPath);

	// Use provided widths or fall back to config file values
	const finalThumbnailWidth = thumbnailWidth ?? config.thumbnailWidth;
	const finalLargeWidth = largeWidth ?? config.largeWidth;

	const images: GalleryImage[] = [];

	for (const imageConfig of config.images) {
		const { filename, description } = imageConfig;
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
				finalThumbnailWidth,
				'thumb'
			);

			// Generate large image
			const large = await optimizeImage(sourcePath, outputDir, filename, finalLargeWidth, 'large');

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
