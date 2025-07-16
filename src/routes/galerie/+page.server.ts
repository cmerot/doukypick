import type { PageServerLoad } from './$types';
import { loadJsonIndex } from '$lib/processors/gallery-parser';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const images = loadJsonIndex('tatouages');

		return {
			images
		};
	} catch (error) {
		console.error('Erreur lors du chargement de la galerie:', error);
		throw error;
	}
};
