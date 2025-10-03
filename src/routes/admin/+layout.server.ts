import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

// Initialize Supabase client

export const prerender = false;

export const load: LayoutServerLoad = async ({ url, cookies }) => {
	// Check authentication cookie
	const authToken = cookies.get('admin_auth');
	if (authToken !== 'authenticated') {
		console.log('no auth');
		// Store the intended redirect URL in a cookie if not the login page
		if (url.pathname !== '/admin/login') {
			cookies.set('admin_redirect', url.pathname + url.search, {
				path: '/',
				maxAge: 60 * 10, // 10 minutes
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			});
			throw redirect(302, '/admin/login');
		}
	}
	return {
		pathname: url.pathname,
		isAuthenticated: authToken == 'authenticated'
	};
};
