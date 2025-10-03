import type { PageServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { error, isHttpError, redirect } from '@sveltejs/kit';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const load: PageServerLoad = async ({ params, cookies, url }) => {
	// Check authentication cookie
	const authToken = cookies.get('admin_auth');
	if (authToken !== 'authenticated') {
		// Store the intended redirect URL in a cookie
		cookies.set('admin_redirect', url.pathname, {
			path: '/',
			maxAge: 60 * 10, // 10 minutes
			httpOnly: true,
			secure: true,
			sameSite: 'strict'
		});
		throw redirect(302, '/admin/login');
	}
	console.log(params.id);
	const submissionId = params.id;
	if (!submissionId) {
		throw error(404, 'ID de soumission invalide');
	}

	try {
		const { data: submission, error: fetchError } = await supabase
			.from('contact_submissions')
			.select('*')
			.eq('id', submissionId)
			.single();

		if (fetchError) {
			console.error('Supabase fetch error:', fetchError);
			if (fetchError.code === 'PGRST116') {
				throw error(404, 'Soumission non trouvée');
			}
			throw error(500, fetchError.message);
		}

		console.log('Loaded submission:', submission.id);

		return {
			submission
		};
	} catch (err) {
		console.error('Error loading submission:', err);

		if (isHttpError(err)) throw err;

		throw error(500, 'Erreur lors du chargement de la soumission');
	}
};
