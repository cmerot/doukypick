import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { optimizeImage } from './image-optimizer';
import type { GalleryData, GalleryImage, GalleryConfig, JsonIndexItem } from '$lib/types/gallery';

export function parseIndexFile(indexPath: string): GalleryConfig {
	const content = readFileSync(indexPath, 'utf-8');
	const sections = content.split('---');

	if (sections.length < 2) {
		throw new Error("Le fichier index doit avoir une section d'en-tête séparée par ---");
	}

	const config = parseConfigSection(sections[0]);
	const images = parseImagesSection(sections[1]);

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
	const paths = buildPaths(galleryPath);

	if (!existsSync(paths.index)) {
		throw new Error(`Index de galerie introuvable: ${paths.index}`);
	}

	mkdirSync(paths.output, { recursive: true });

	const config = parseIndexFile(paths.index);
	const finalSizes = {
		thumbnail: thumbnailWidth ?? config.thumbnailWidth,
		large: largeWidth ?? config.largeWidth
	};

	const { images, jsonIndex } = await processImages(config.images, paths, finalSizes);

	writeJsonIndex(paths.output, jsonIndex);

	return {
		path: galleryPath,
		images
	};
}

function parseConfigSection(headerContent: string): { thumbnailWidth: number; largeWidth: number } {
	try {
		return JSON.parse(headerContent.trim());
	} catch (error) {
		throw new Error("JSON invalide dans l'en-tête de l'index");
	}
}

function parseImagesSection(
	imagesContent: string
): Array<{ filename: string; description: string }> {
	const lines = imagesContent
		.trim()
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith('#'));

	return lines
		.map((line) => {
			const colonIndex = line.indexOf(':');
			if (colonIndex === -1) return null;

			return {
				filename: line.substring(0, colonIndex).trim(),
				description: line.substring(colonIndex + 1).trim()
			};
		})
		.filter(Boolean) as Array<{ filename: string; description: string }>;
}

function buildPaths(galleryPath: string) {
	const assetsPath = path.join(process.cwd(), 'src/lib/assets', galleryPath);

	return {
		assets: assetsPath,
		index: path.join(assetsPath, 'index.txt'),
		output: path.join(process.cwd(), 'static/generated', galleryPath)
	};
}

async function processImages(
	imageConfigs: Array<{ filename: string; description: string }>,
	paths: ReturnType<typeof buildPaths>,
	sizes: { thumbnail: number; large: number }
): Promise<{ images: GalleryImage[]; jsonIndex: JsonIndexItem[] }> {
	const images: GalleryImage[] = [];
	const jsonIndex: JsonIndexItem[] = [];

	for (const { filename, description } of imageConfigs) {
		const sourcePath = path.join(paths.assets, filename);

		if (!existsSync(sourcePath)) {
			console.warn(`Image introuvable: ${sourcePath}`);
			continue;
		}

		try {
			const [thumbnail, large] = await Promise.all([
				optimizeImage(sourcePath, paths.output, filename, sizes.thumbnail, 'thumb'),
				optimizeImage(sourcePath, paths.output, filename, sizes.large, 'large')
			]);

			images.push({
				filename,
				description,
				thumbnail,
				large
			});

			jsonIndex.push({
				description,
				thumbnail: {
					path: thumbnail.path,
					fallback_path: thumbnail.fallback_path,
					width: thumbnail.width,
					height: thumbnail.height
				},
				large: {
					path: large.path,
					fallback_path: large.fallback_path,
					width: large.width,
					height: large.height
				}
			});
		} catch (error) {
			console.error(`Erreur lors du traitement de l'image ${filename}:`, error);
		}
	}

	return { images, jsonIndex };
}

function writeJsonIndex(outputDir: string, jsonIndex: JsonIndexItem[]): void {
	const jsonIndexPath = path.join(outputDir, 'index.json');
	writeFileSync(jsonIndexPath, JSON.stringify(jsonIndex, null, 2), 'utf-8');
}

export function loadJsonIndex(name: string): JsonIndexItem[] {
	const jsonIndexPath = path.join(process.cwd(), 'static/generated', name, 'index.json');

	if (!existsSync(jsonIndexPath)) {
		throw new Error(`Galerie introuvable: ${name}`);
	}

	const images = readFileSync(jsonIndexPath, 'utf-8');
	return JSON.parse(images);
}
