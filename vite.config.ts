import tailwindcss from '@tailwindcss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { sveltekit } from '@sveltejs/kit/vite';
import { copyFile, mkdir, readdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import sharp from 'sharp';
import { defineConfig } from 'vite';

// Plugin personnalisé pour créer les thumbnails
// function createThumbnailsPlugin() {
// 	return {
// 		name: 'create-thumbnails',
// 		async buildStart() {
// 			console.log('🖼️  Génération des thumbnails...');

// 			const sourceDir = join(process.cwd(), 'src/lib/assets/images/salon');
// 			const staticDir = join(process.cwd(), 'static/images/salon');
// 			const thumbsDir = join(process.cwd(), 'static/images/salon/thumbs');

// 			try {
// 				// Créer les dossiers de destination
// 				await mkdir(staticDir, { recursive: true });
// 				await mkdir(thumbsDir, { recursive: true });

// 				// Lire les fichiers source
// 				const files = await readdir(sourceDir);
// 				const imageFiles = files.filter((file) => /\.(png|jpg|jpeg|webp)$/i.test(file));

// 				for (const file of imageFiles) {
// 					const sourcePath = join(sourceDir, file);
// 					const fileName = basename(file, extname(file));
// 					const targetPath = join(staticDir, file);
// 					const thumbPath = join(thumbsDir, `${fileName}.webp`);

// 					// Copier l'image originale
// 					await copyFile(sourcePath, targetPath);

// 					// Créer le thumbnail (150x150, format WebP)
// 					await sharp(sourcePath)
// 						.resize(150, 150, {
// 							fit: 'cover',
// 							position: 'center'
// 						})
// 						.webp({ quality: 80 })
// 						.toFile(thumbPath);

// 					console.log(`✅ Traité: ${file} (+ thumbnail)`);
// 				}

// 				console.log(`🎉 ${imageFiles.length} images traitées avec succès!`);
// 			} catch (error) {
// 				console.error('❌ Erreur lors de la génération des thumbnails:', error);
// 				throw error;
// 			}
// 		}
// 	};
// }

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		// createThumbnailsPlugin(),
		ViteImageOptimizer({
			// Optimiser les images dans /static
			includePublic: true,

			// Configuration pour les images principales
			png: {
				quality: 85,
				compressionLevel: 8
			},
			jpeg: {
				quality: 80,
				progressive: true
			},
			webp: {
				quality: 80
			},

			// Log des statistiques
			logStats: true,

			// Filtrer uniquement les images dans salon/
			include: /salon/
		})
	],
	test: {
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
