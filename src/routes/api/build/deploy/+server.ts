import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VERCEL_API_TOKEN, VERCEL_PROJECT_ID, VERCEL_REPO_ID } from '$env/static/private';
import { verifySessionToken } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, url }) => {
	// Check if user is authenticated
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	if (!isAuthenticated) {
		return error(401, { message: 'Unauthorized' });
	}

	// Check if Vercel credentials are configured
	if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID || !VERCEL_REPO_ID) {
		return error(500, { message: 'Vercel API credentials not configured' });
	}

	// Get branch from query params or default to 'preview'
	const branch = url.searchParams.get('branch') || 'preview';

	try {
		// Trigger a new deployment from the latest commit on the branch
		const deploymentBody = {
			name: VERCEL_PROJECT_ID,
			gitSource: {
				type: 'github',
				ref: branch,
				repoId: VERCEL_REPO_ID
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
	} catch (err) {
		console.error('Error triggering build:', err);
		const details = err instanceof Error ? err.message : 'Unknown error';
		return error(500, `Failed to trigger build: ${details}`);
	}
};
