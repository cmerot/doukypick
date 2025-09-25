import { json } from '@sveltejs/kit';
import { ADMIN_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { password } = await request.json();

		// Check if password matches the secret
		if (password === ADMIN_SECRET) {
			// Set secure HTTP-only cookie
			cookies.set('admin_auth', 'authenticated', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
			return json({ success: true });
		} else {
			return json({ error: 'Invalid password' }, { status: 401 });
		}
	} catch (error) {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};
