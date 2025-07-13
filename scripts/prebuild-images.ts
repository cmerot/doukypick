import { parseGallery } from '../src/lib/utils/gallery-parser';
import { readdirSync, existsSync } from 'fs';
import path from 'path';

async function generateAllImages(): Promise<void> {
	const assetsPath = path.join(process.cwd(), 'src/lib/assets');

	if (!existsSync(assetsPath)) {
		console.warn('Assets directory not found:', assetsPath);
		return;
	}

	// Get all gallery directories
	const galleries = readdirSync(assetsPath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	if (galleries.length === 0) {
		console.log('No galleries found in assets directory');
		return;
	}

	console.log(`Found ${galleries.length} galleries to process`);

	for (const gallery of galleries) {
		const indexPath = path.join(assetsPath, gallery, 'index.txt');

		if (!existsSync(indexPath)) {
			console.warn(`Skipping ${gallery} - no index.txt found`);
			continue;
		}

		console.log(`Generating images for gallery: ${gallery}`);
		try {
			// parseGallery now reads the config file and extracts widths automatically
			const galleryData = await parseGallery(gallery);
			console.log(`✓ Completed gallery: ${gallery} (${galleryData.images.length} images)`);
		} catch (error) {
			console.error(`✗ Failed to process gallery ${gallery}:`, error);
		}
	}

	console.log('Image generation completed');
}

generateAllImages().catch((error) => {
	console.error('Prebuild images failed:', error);
	process.exit(1);
});
