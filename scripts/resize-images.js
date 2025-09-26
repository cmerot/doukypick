import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';

const SIZES = [
	{ name: 'thumb', width: 150 },
	{ name: 'small', width: 400 },
	{ name: 'medium', width: 600 },
	{ name: 'large', width: 900 },
	{ name: 'xlarge', width: 1200 }
];

const FORMATS = [
	{ ext: 'avif', quality: 80 },
	{ ext: 'webp', quality: 85 },
	{ ext: 'jpg', quality: 80 }
];

const SRC_DATA_DIR = 'src/content/galleries';
const SRC_IMG_DIR = 'static/galleries';
const OUTPUT_DIR = 'static/optimized';

function generateUUID(imagePath) {
	// Simple deterministic hash function that matches the browser version
	let hash = 5381;
	for (let i = 0; i < imagePath.length; i++) {
		hash = (hash << 5) + hash + imagePath.charCodeAt(i);
	}
	// Convert to positive number and then to hex
	const positiveHash = Math.abs(hash);
	return positiveHash.toString(16).padStart(16, '0').substring(0, 16);
}

async function ensureDir(dir) {
	try {
		await fs.mkdir(dir, { recursive: true });
	} catch (err) {
		if (err.code !== 'EEXIST') throw err;
	}
}

async function checkFileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function processImage(imagePath, uuid) {
	console.log(`Processing image: ${imagePath} (UUID: ${uuid})`);

	let generatedCount = 0;
	let skippedCount = 0;

	for (const size of SIZES) {
		for (const format of FORMATS) {
			const filename = `${uuid}-${size.name}.${format.ext}`;
			const outputPath = path.join(OUTPUT_DIR, filename);

			// Check if file already exists
			if (await checkFileExists(outputPath)) {
				console.log(`  Skipped (exists): optimized/${filename}`);
				skippedCount++;
				continue;
			}

			try {
				let processor = sharp(imagePath).resize(size.width, null, {
					withoutEnlargement: true,
					fit: 'inside'
				});

				if (format.ext === 'avif') {
					processor = processor.avif({ quality: format.quality });
				} else if (format.ext === 'webp') {
					processor = processor.webp({ quality: format.quality });
				} else if (format.ext === 'jpg') {
					processor = processor.jpeg({ quality: format.quality });
				}

				await processor.toFile(outputPath);

				console.log(`  Generated: optimized/${filename}`);
				generatedCount++;
			} catch (error) {
				console.error(`  Error generating ${filename}:`, error.message);
			}
		}
	}

	if (generatedCount > 0) {
		console.log(`  📊 Generated ${generatedCount} files, skipped ${skippedCount} existing files`);
	} else if (skippedCount > 0) {
		console.log(`  ⚡ All ${skippedCount} files already exist - skipped processing`);
	}
}

async function processGallery(galleryPath) {
	console.log(`\nProcessing gallery: ${galleryPath}`);

	const galleryContent = await fs.readFile(galleryPath, 'utf8');
	const gallery = JSON.parse(galleryContent);

	const galleryDir = path.dirname(galleryPath);
	const relativeGalleryDir = path.relative(SRC_DATA_DIR, galleryDir);

	// Process each image
	for (const image of gallery.images) {
		if (!image.url) continue;

		const imagePath = path.join(SRC_IMG_DIR, relativeGalleryDir, image.url);
		const relativeImagePath = path.join(relativeGalleryDir, image.url);

		// Generate UUID for this image
		const uuid = generateUUID(relativeImagePath);

		try {
			// Check if source image exists
			await fs.access(imagePath);

			// Process the image (generate optimized versions)
			await processImage(imagePath, uuid);
		} catch (error) {
			console.error(`  Warning: Could not process ${imagePath}:`, error.message);
		}
	}

	console.log(`  Processed ${gallery.images.length} images from gallery`);
}

async function main() {
	console.log('🖼️  Starting image optimization...\n');

	try {
		// Ensure output directory exists
		await ensureDir(OUTPUT_DIR);

		// Find all gallery.json files
		const galleryFiles = await glob(`${SRC_DATA_DIR}/**/gallery.json`);

		if (galleryFiles.length === 0) {
			console.log('No gallery.json files found.');
			return;
		}

		console.log(`Found ${galleryFiles.length} gallery file(s):`);
		galleryFiles.forEach((file) => console.log(`  - ${file}`));

		// Process each gallery
		for (const galleryFile of galleryFiles) {
			await processGallery(galleryFile);
		}

		console.log('\n✅ Image optimization completed successfully!');
		console.log(`📁 Optimized images saved to: ${OUTPUT_DIR}`);
		console.log(`💡 UUIDs are generated deterministically from image paths - no storage needed!`);
	} catch (error) {
		console.error('❌ Error during image optimization:', error);
		process.exit(1);
	}
}

main();
