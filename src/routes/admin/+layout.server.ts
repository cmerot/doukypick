import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifySessionToken } from '$lib/server/auth';

export const prerender = false;

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	// Check authentication cookie
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	if (!isAuthenticated) {
		// Clear invalid token
		if (authToken) {
			cookies.delete('admin_auth', { path: '/' });
		}

		// Store the intended redirect URL in a cookie if not the login page
		if (url.pathname !== '/admin/login') {
			cookies.set('admin_redirect', url.pathname + url.search, {
				path: '/',
				maxAge: 60 * 10, // 10 minutes
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict'
			});
			throw redirect(302, '/admin/login');
		}
	}

	return {
		pathname: url.pathname,
		isAuthenticated
	};
};
