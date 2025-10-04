import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Clear the authentication cookie with matching attributes
		cookies.delete('admin_auth', {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict'
		});
		throw redirect(302, '/admin/login');
	}
};
