import type { PageServerLoad, Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { error, isHttpError, redirect, fail } from '@sveltejs/kit';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { verifySessionToken } from '$lib/server/auth';
import { del } from '@vercel/blob';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const load: PageServerLoad = async ({ params }) => {
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

export const actions: Actions = {
	delete: async ({ params }) => {
		const submissionId = params.id;
		if (!submissionId) {
			return fail(400, { error: 'ID de soumission requis' });
		}

		console.log('Deleting submission:', submissionId);

		try {
			// First, get the submission to retrieve photo URLs for deletion
			const { data: submission, error: fetchError } = await supabase
				.from('contact_submissions')
				.select('photo_urls')
				.eq('id', submissionId)
				.single();

			if (fetchError) {
				if (fetchError.code === 'PGRST116') {
					return fail(404, { error: 'Soumission non trouvée' });
				}
				console.error('Error fetching submission:', fetchError);
				return fail(500, { error: 'Erreur lors de la récupération de la soumission' });
			}

			// Delete associated images from Vercel Blob storage if they exist
			if (submission.photo_urls && submission.photo_urls.length > 0) {
				console.log('Deleting', submission.photo_urls.length, 'associated images from Vercel Blob');

				// Delete each image from Vercel Blob
				for (const url of submission.photo_urls) {
					try {
						await del(url, { token: BLOB_READ_WRITE_TOKEN });
						console.log('Deleted blob:', url);
					} catch (blobError) {
						console.error('Error deleting blob:', url, blobError);
						// Don't fail the whole operation if individual image deletion fails
					}
				}

				console.log('Finished processing', submission.photo_urls.length, 'blob deletions');
			}

			// Delete the submission record from database
			const { error: deleteError } = await supabase
				.from('contact_submissions')
				.delete()
				.eq('id', submissionId);

			if (deleteError) {
				console.error('Error deleting submission:', deleteError);
				return fail(500, { error: 'Erreur lors de la suppression de la soumission' });
			}

			console.log('Successfully deleted submission:', submissionId);

			// Redirect to messages list after successful deletion
			throw redirect(303, '/admin/messages');
		} catch (err) {
			console.error('Error in delete action:', err);

			// If it's a redirect, re-throw it
			if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
				throw err;
			}

			// If it's already an HTTP error, re-throw it
			if (isHttpError(err)) {
				throw err;
			}

			return fail(500, { error: 'Erreur lors de la suppression de la soumission' });
		}
	}
};
