import { parseIndexFile } from '$lib/utils/gallery-parser.js';
import { type GalleryData } from '$lib/types/gallery';
import type { PageServerLoad } from './$types';
import { existsSync } from 'fs';
import path from 'path';
import { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID } from '$env/static/private';

export const prerender = true;

interface GoogleReview {
	authorAttribution: {
		displayName: string;
		uri: string;
		photoUri: string;
	};
	rating: number;
	text: {
		text: string;
		languageCode: string;
	};
	originalText: {
		text: string;
		languageCode: string;
	};
	relativePublishTimeDescription: string;
	publishTime: string;
}

interface GooglePlacesResponse {
	reviews?: GoogleReview[];
	rating?: number;
	userRatingCount?: number;
}

export const load: PageServerLoad = async ({ params, fetch }) => {
	const galleryPath = 'salon';

	try {
		// Your existing gallery code...
		const assetsPath = path.join(process.cwd(), 'src/lib/assets', galleryPath);
		const indexPath = path.join(assetsPath, 'index.txt');

		if (!existsSync(indexPath)) {
			throw new Error(`Gallery index not found: ${indexPath}`);
		}

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

		// NEW API Implementation
		let reviews: GoogleReview[] = [];
		let rating = 0;
		let totalReviews = 0;

		try {
			if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACE_ID) {
				const response = await fetch(`https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
						'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
						'Accept-Language': 'fr-FR, fr'
					}
				});

				if (response.ok) {
					const data: GooglePlacesResponse = await response.json();
					reviews = data.reviews || [];
					rating = data.rating || 0;
					totalReviews = data.userRatingCount || 0;

					console.log(`Fetched ${reviews.length} reviews with ${rating} rating`);
				} else {
					const errorText = await response.text();
					console.warn(`Failed to fetch reviews: ${response.status} - ${errorText}`);
				}
			} else {
				console.warn('Google Places API key or Place ID not configured');
			}
		} catch (error) {
			console.error('Failed to fetch Google reviews:', error);
		}
		console.log(galleryData);
		return {
			galleryData,
			reviews,
			rating,
			totalReviews
		};
	} catch (error) {
		console.error('Error loading gallery:', error);
		throw error;
	}
};

export type PageData = {
	galleryData: GalleryData;
	reviews: GoogleReview[];
	rating: number;
	totalReviews: number;
};
