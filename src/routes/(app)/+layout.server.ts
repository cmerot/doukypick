import { fetchGoogleReviews } from '$lib/server/services/google-places';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, url }) => {
	const googleReviews = await fetchGoogleReviews(fetch);
	const { pathname } = url;
	return {
		googleReviews,
		pathname
	};
};
