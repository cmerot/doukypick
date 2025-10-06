import { fetchGoogleReviews } from '$lib/server/services/google-places';
import { verifySessionToken } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ fetch, url, cookies }) => {
	const googleReviews = await fetchGoogleReviews(fetch);
	const { pathname } = url;

	// Check authentication
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	// Create a transition key that doesn't change when navigating between images in the same gallery
	// This prevents page transitions when browsing through images
	const transitionKey = pathname.replace(/\/images\/[^/]+\/[^/]+$/, '/images/gallery');

	return {
		googleReviews,
		transitionKey,
		isAuthenticated
	};
};
