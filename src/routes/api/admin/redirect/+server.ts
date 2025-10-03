import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
	// Check authentication
	const authToken = cookies.get('admin_auth');
	if (authToken !== 'authenticated') {
		throw error(401, 'Non autorisé');
	}

	// Get redirect URL from cookie
	const redirectUrl = cookies.get('admin_redirect');

	if (redirectUrl) {
		// Clear the redirect cookie after reading it
		cookies.delete('admin_redirect', { path: '/' });

		return json({ redirectUrl });
	}

	return json({ redirectUrl: null });
};
