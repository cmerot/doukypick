import type { RequestHandler } from './$types';
import { createClient } from '@supabase/supabase-js';
import { del } from '@vercel/blob';
import { json, error } from '@sveltejs/kit';
import { SUPABASE_URL, SUPABASE_ANON_KEY, BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { verifySessionToken } from '$lib/server/auth';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	// Check authentication
	// Check authentication cookie
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	const submissionId = params.id;
	if (!submissionId) {
		throw error(400, 'ID de soumission requis');
	}

	console.log('🗑️ Deleting submission:', submissionId);

	try {
		// First, get the submission to retrieve photo URLs for deletion
		const { data: submission, error: fetchError } = await supabase
			.from('contact_submissions')
			.select('photo_urls')
			.eq('id', submissionId)
			.single();

		if (fetchError) {
			if (fetchError.code === 'PGRST116') {
				throw error(404, 'Soumission non trouvée');
			}
			console.error('❌ Error fetching submission:', fetchError);
			throw error(500, 'Erreur lors de la récupération de la soumission');
		}

		// Delete associated images from Vercel Blob storage if they exist
		if (submission.photo_urls && submission.photo_urls.length > 0) {
			console.log(
				'🗑️ Deleting',
				submission.photo_urls.length,
				'associated images from Vercel Blob'
			);

			// Delete each image from Vercel Blob
			for (const url of submission.photo_urls) {
				try {
					await del(url, { token: BLOB_READ_WRITE_TOKEN });
					console.log('✅ Deleted blob:', url);
				} catch (blobError) {
					console.error('⚠️ Error deleting blob:', url, blobError);
					// Don't fail the whole operation if individual image deletion fails
				}
			}

			console.log('✅ Finished processing', submission.photo_urls.length, 'blob deletions');
		}

		// Delete the submission record from database
		const { error: deleteError } = await supabase
			.from('contact_submissions')
			.delete()
			.eq('id', submissionId);

		if (deleteError) {
			console.error('❌ Error deleting submission:', deleteError);
			throw error(500, 'Erreur lors de la suppression de la soumission');
		}

		console.log('✅ Successfully deleted submission:', submissionId);

		return json({
			success: true,
			message: 'Soumission supprimée avec succès'
		});
	} catch (err) {
		console.error('❌ Error in DELETE handler:', err);

		// If it's already an error object, re-throw it
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Erreur lors de la suppression de la soumission');
	}
};
