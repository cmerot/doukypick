import { GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID } from '$env/static/private';
import type { GooglePlacesResponse, ReviewsData } from '$lib/types/google-reviews';

const GOOGLE_PLACES_API_URL = 'https://places.googleapis.com/v1/places';

export async function fetchGoogleReviews(fetch: typeof globalThis.fetch): Promise<ReviewsData> {
	if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
		console.warn('Clé API Google Places ou ID de lieu non configurés');
		return { reviews: [], rating: 0, totalReviews: 0 };
	}

	try {
		const response = await fetch(`${GOOGLE_PLACES_API_URL}/${GOOGLE_PLACE_ID}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
				'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
				'Accept-Language': 'fr-FR, fr'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.warn(`Échec de récupération des avis: ${response.status} - ${errorText}`);
			return { reviews: [], rating: 0, totalReviews: 0 };
		}

		const data: GooglePlacesResponse = await response.json();

		const result = {
			reviews: data.reviews || [],
			rating: data.rating || 0,
			totalReviews: data.userRatingCount || 0
		};

		console.log(`${result.reviews.length} avis récupérés avec une note de ${result.rating}`);
		return result;
	} catch (error) {
		console.error('Erreur lors de la récupération des avis Google:', error);
		return { reviews: [], rating: 0, totalReviews: 0 };
	}
}
