import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { verifySessionToken, generateSessionToken } from '$lib/server/auth';
import { ADMIN_SECRET } from '$env/static/private';

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

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const password = data.get('password');

		// Validate password
		if (!password || typeof password !== 'string') {
			return fail(400, { error: 'Mauvaise requête' });
		}

		// Check if password matches the secret
		if (password !== ADMIN_SECRET) {
			return fail(401, { error: 'Mauvais mot de passe' });
		}

		// Generate a cryptographically secure session token
		const sessionToken = generateSessionToken();

		// Set secure HTTP-only cookie
		cookies.set('admin_auth', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		// Redirect to stored path or admin home
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
};
