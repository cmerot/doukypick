import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

// Initialize Supabase client

export const load: PageServerLoad = async () => {
	throw redirect(302, '/admin/messages');
};
