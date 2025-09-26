import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is already authenticated
	const authToken = cookies.get('admin_auth');
	if (authToken === 'authenticated') {
		throw redirect(302, '/admin');
	}

	return {};
};