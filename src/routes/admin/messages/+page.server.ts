import type { PageServerLoad } from '../$types';
import { createClient } from '@supabase/supabase-js';
import { error, isHttpError } from '@sveltejs/kit';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const load: PageServerLoad = async ({ url, cookies }) => {
	console.log('Loading contact submissions...');

	// Get query parameters for pagination and filtering
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 10;
	const offset = (page - 1) * limit;
	const search = url.searchParams.get('search') || '';

	try {
		// Build query with search if provided
		let query = supabase
			.from('contact_submissions')
			.select('*', { count: 'exact' })
			.order('created_at', { ascending: false });

		// Add search filter if search term exists
		if (search) {
			query = query.or(
				`first_name.ilike.%${search}%,email.ilike.%${search}%,project_description.ilike.%${search}%,phone.ilike.%${search}%,pseudonym.ilike.%${search}%`
			);
		}

		// Execute query with pagination
		const {
			data: submissions,
			error: fetchError,
			count
		} = await query.range(offset, offset + limit - 1);

		if (fetchError) {
			console.error('Supabase fetch error:', fetchError);
			throw error(500, fetchError.message);
		}

		// Calculate pagination info
		const totalPages = Math.ceil((count || 0) / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		console.log(`Loaded ${submissions?.length || 0} submissions (page ${page}/${totalPages})`);

		return {
			submissions: submissions || [],
			pagination: {
				currentPage: page,
				totalPages,
				totalCount: count || 0,
				hasNextPage,
				hasPrevPage,
				limit
			},
			search
		};
	} catch (err) {
		console.error('Error loading submissions:', err);

		if (isHttpError(err)) throw err;

		throw error(500, 'Erreur lors du chargement des soumissions de contact');
	}
};
