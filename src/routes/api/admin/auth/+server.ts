import { json } from '@sveltejs/kit';
import { ADMIN_SECRET } from '$env/static/private';
import { generateSessionToken } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { password } = await request.json();

		// Check if password matches the secret
		if (password === ADMIN_SECRET) {
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
			return json({ success: true });
		} else {
			return json({ error: 'Mauvais mot de passe' }, { status: 401 });
		}
	} catch (error) {
		return json({ error: 'Mauvaise requête' }, { status: 400 });
	}
};
