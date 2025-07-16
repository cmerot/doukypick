import type { PageServerLoad } from './$types';
import { fetchGoogleReviews } from '$lib/services/google-places';
import { loadJsonIndex } from '$lib/processors/gallery-parser';

export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const reviewsData = await fetchGoogleReviews(fetch);
		const images = loadJsonIndex('salon');

		return { reviewsData, images };
	} catch (error) {
		console.error('Erreur lors du chargement des données:', error);
		throw error;
	}
};
