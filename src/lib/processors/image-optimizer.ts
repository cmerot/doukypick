import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import type { OptimizedImage } from '$lib/types/gallery';

interface ImageProcessingOptions {
	sourcePath: string;
	outputDir: string;
	filename: string;
	size: number;
	suffix?: string;
}

export async function optimizeImage(
	sourcePath: string,
	outputDir: string,
	filename: string,
	size: number,
	suffix: string = ''
): Promise<OptimizedImage> {
	const options: ImageProcessingOptions = {
		sourcePath,
		outputDir,
		filename,
		size,
		suffix
	};

	ensureOutputDirectory(options.outputDir);

	const filePaths = generateFilePaths(options);
	const dimensions = await processAndSaveImages(options, filePaths);

	return createOptimizedImageResult(filePaths, dimensions);
}

function ensureOutputDirectory(outputDir: string): void {
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}
}

function generateFilePaths(options: ImageProcessingOptions) {
	const { outputDir, filename, size, suffix } = options;
	const ext = path.extname(filename).toLowerCase();
	const nameWithoutExt = path.basename(filename, ext);
	const sizeStr = suffix ? `_${suffix}` : `_${size}`;

	const fallbackExt = ext === '.png' ? '.png' : '.jpg';

	const webpFilename = `${nameWithoutExt}${sizeStr}.webp`;
	const fallbackFilename = `${nameWithoutExt}${sizeStr}${fallbackExt}`;

	return {
		webp: path.join(outputDir, webpFilename),
		fallback: path.join(outputDir, fallbackFilename),
		webpFilename,
		fallbackFilename,
		isOriginalPng: ext === '.png'
	};
}

async function processAndSaveImages(
	options: ImageProcessingOptions,
	filePaths: ReturnType<typeof generateFilePaths>
): Promise<{ width: number; height: number }> {
	const { sourcePath, size } = options;
	const { webp, fallback, isOriginalPng } = filePaths;

	const image = sharp(sourcePath);
	const resized = image.resize(size, size, {
		fit: 'inside',
		withoutEnlargement: true
	});

	// Génération des images optimisées
	await Promise.all([
		resized.clone().webp({ quality: 85 }).toFile(webp),
		isOriginalPng
			? resized.clone().png({ quality: 85 }).toFile(fallback)
			: resized.clone().jpeg({ quality: 85 }).toFile(fallback)
	]);

	// Récupération des dimensions finales
	const metadata = await sharp(fallback).metadata();

	return {
		width: metadata.width || size,
		height: metadata.height || size
	};
}

function createOptimizedImageResult(
	filePaths: ReturnType<typeof generateFilePaths>,
	dimensions: { width: number; height: number }
): OptimizedImage {
	const { webpFilename, fallbackFilename } = filePaths;

	// Extraction du chemin relatif pour le web
	const outputDirParts = filePaths.webp.split(path.sep);
	const generatedIndex = outputDirParts.findIndex((part) => part === 'generated');
	const relativePath =
		generatedIndex !== -1 ? '/' + outputDirParts.slice(generatedIndex, -1).join('/') : '/generated';

	return {
		path: `${relativePath}/${webpFilename}`,
		fallback_path: `${relativePath}/${fallbackFilename}`,
		width: dimensions.width,
		height: dimensions.height,
		// Propriétés héritées pour la compatibilité
		webp: webpFilename,
		fallback: fallbackFilename
	};
}
