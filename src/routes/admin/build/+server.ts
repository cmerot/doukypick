import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VERCEL_API_TOKEN, VERCEL_PROJECT_ID } from '$env/static/private';
import { verifySessionToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, url }) => {
	// Check if user is authenticated
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	if (!isAuthenticated) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if Vercel credentials are configured
	if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
		return json({ error: 'Vercel API credentials not configured' }, { status: 500 });
	}

	// Get branch from query params or default to 'preview'
	const branch = url.searchParams.get('branch') || 'preview';

	try {
		// Trigger a new deployment from the latest commit on the branch
		const deploymentBody = {
			name: VERCEL_PROJECT_ID,
			gitSource: {
				type: 'github',
				ref: branch
			}
		};

		const response = await fetch('https://api.vercel.com/v13/deployments', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${VERCEL_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(deploymentBody)
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`Vercel API error: ${response.status} - ${JSON.stringify(errorData)}`);
		}

		const data = await response.json();

		return json({
			success: true,
			message: `Build triggered successfully for branch: ${branch}`,
			deployment: {
				id: data.id,
				url: data.url,
				inspectorUrl: data.inspectorUrl
			}
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
