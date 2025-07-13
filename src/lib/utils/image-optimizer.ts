import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

export interface OptimizedImage {
	webp: string;
	fallback: string;
	width: number;
	height: number;
}

export async function optimizeImage(
	sourcePath: string,
	outputDir: string,
	filename: string,
	size: number,
	suffix: string = ''
): Promise<OptimizedImage> {
	// Ensure output directory exists
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	const ext = path.extname(filename).toLowerCase();
	const nameWithoutExt = path.basename(filename, ext);
	const sizeStr = suffix ? `_${suffix}` : `_${size}`;

	// Determine fallback format
	const fallbackFormat = ext === '.png' ? 'png' : 'jpeg';
	const fallbackExt = ext === '.png' ? '.png' : '.jpg';

	const webpPath = path.join(outputDir, `${nameWithoutExt}${sizeStr}.webp`);
	const fallbackPath = path.join(outputDir, `${nameWithoutExt}${sizeStr}${fallbackExt}`);

	// Process image
	const image = sharp(sourcePath);
	const metadata = await image.metadata();

	// Resize and optimize
	const resized = image.resize(size, size, {
		fit: 'inside',
		withoutEnlargement: true
	});

	// Generate WebP
	await resized.clone().webp({ quality: 85 }).toFile(webpPath);

	// Generate fallback
	if (fallbackFormat === 'png') {
		await resized.clone().png({ quality: 85 }).toFile(fallbackPath);
	} else {
		await resized.clone().jpeg({ quality: 85 }).toFile(fallbackPath);
	}

	// Get final dimensions
	const finalMetadata = await sharp(fallbackPath).metadata();

	return {
		webp: path.basename(webpPath),
		fallback: path.basename(fallbackPath),
		width: finalMetadata.width || size,
		height: finalMetadata.height || size
	};
}
