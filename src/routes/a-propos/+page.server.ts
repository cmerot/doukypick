import type { PageServerLoad } from './$types';
import { fetchGoogleReviews } from '$lib/services/google-places';

export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const reviewsData = await fetchGoogleReviews(fetch);
		return { reviewsData };
	} catch (error) {
		console.error('Erreur lors du chargement des données:', error);
		throw error;
	}
};
