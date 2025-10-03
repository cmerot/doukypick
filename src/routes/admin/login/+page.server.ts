import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifySessionToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is already authenticated
	const authToken = cookies.get('admin_auth');
	if (authToken && verifySessionToken(authToken)) {
		const adminRedirect = cookies.get('admin_redirect');
		if (adminRedirect) {
			cookies.delete('admin_redirect', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict'
			});
			throw redirect(302, adminRedirect);
		}
		throw redirect(302, '/admin');
	}

	return {};
};
