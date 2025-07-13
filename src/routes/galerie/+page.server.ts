import type { PageServerLoad } from './$types.js';
import type { GalleryImage } from '$lib/types/gallery.js';
import { readdir, stat } from 'fs/promises';
import { join, basename, extname } from 'path';
import { base } from '$app/paths';

export const load: PageServerLoad = async () => {
	try {
		const imagesDir = join(process.cwd(), 'static/images/salon');
		const files = await readdir(imagesDir);

		const imageExtensions = /\.(png|jpg|jpeg|webp)$/i;
		const imageFiles = files
			.filter((file) => imageExtensions.test(file))
			.filter((file) => file !== 'thumbs'); // Exclure le dossier thumbs

		const images: GalleryImage[] = await Promise.all(
			imageFiles.map(async (file) => {
				const filePath = join(imagesDir, file);
				const stats = await stat(filePath);
				const fileName = basename(file, extname(file));

				return {
					// Image principale optimisée
					src: `/images/salon/${file}`,
					// Thumbnail WebP
					thumbnail: `${base}/images/salon/thumbs/${fileName}.webp`,
					name: fileName,
					path: file,
					size: stats.size
				};
			})
		);

		return {
			images: images.sort((a, b) => a.name.localeCompare(b.name))
		};
	} catch (error) {
		console.error('Erreur lors du chargement des images:', error);
		return {
			images: []
		};
	}
};
