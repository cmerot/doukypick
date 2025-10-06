import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VERCEL_DEPLOY_HOOK_URL } from '$env/static/private';
import { verifySessionToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	// Check if user is authenticated
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	if (!isAuthenticated) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if deploy hook URL is configured
	if (!VERCEL_DEPLOY_HOOK_URL) {
		return json({ error: 'Deploy hook not configured' }, { status: 500 });
	}

	try {
		// Trigger the Vercel build
		const response = await fetch(VERCEL_DEPLOY_HOOK_URL, {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`Vercel API responded with status: ${response.status}`);
		}

		const data = await response.json();

		return json({
			success: true,
			message: 'Build triggered successfully',
			job: data.job
		});
	} catch (error) {
		console.error('Error triggering build:', error);
		return json(
			{
				error: 'Failed to trigger build',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
