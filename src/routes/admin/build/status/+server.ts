import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifySessionToken } from '$lib/server/auth';
import { VERCEL_API_TOKEN, VERCEL_PROJECT_ID } from '$env/static/private';
import { env } from '$env/dynamic/private';

interface VercelDeployment {
	uid: string;
	name: string;
	url: string;
	created: number;
	state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
	ready: number;
	target: string;
	creator: {
		uid: string;
		username: string;
	};
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	// Check authentication
	const authToken = cookies.get('admin_auth');
	const isAuthenticated = authToken ? verifySessionToken(authToken) : false;

	if (!isAuthenticated) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if Vercel API is configured
	if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
		return json(
			{
				error: 'Vercel API not configured',
				configured: false
			},
			{ status: 200 }
		);
	}

	try {
		// Build API URL
		const VERCEL_TEAM_ID = env.VERCEL_TEAM_ID || '';
		const limit = url.searchParams.get('limit') || '1';
		let apiUrl = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=${limit}`;

		if (VERCEL_TEAM_ID) {
			apiUrl += `&teamId=${VERCEL_TEAM_ID}`;
		}

		console.log('Fetching Vercel deployments from:', apiUrl);

		// Fetch deployments from Vercel API
		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${VERCEL_API_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Vercel API error response:', errorText);
			throw new Error(`Vercel API error: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		const deployments: VercelDeployment[] = data.deployments || [];

		// Return the latest deployment(s)
		return json({
			configured: true,
			deployments: deployments.map((d) => ({
				id: d.uid,
				url: d.url,
				state: d.state,
				created: d.created,
				ready: d.ready,
				target: d.target,
				creator: d.creator?.username
			}))
		});
	} catch (error) {
		console.error('Error fetching deployment status:', error);
		return json(
			{
				error: 'Failed to fetch deployment status',
				details: error instanceof Error ? error.message : 'Unknown error',
				configured: true
			},
			{ status: 500 }
		);
	}
};
