import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifySessionToken } from '$lib/server/auth';
import { VERCEL_API_TOKEN, VERCEL_PROJECT_ID } from '$env/static/private';
import { env } from '$env/dynamic/private';

type DeploymentState = 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';

interface VercelDeployment {
	uid: string;
	name: string;
	url: string;
	created: number;
	state: DeploymentState;
	ready: number;
	target: string;
	creator: {
		uid: string;
		username: string;
	};
}

interface VercelApiResponse {
	deployments: VercelDeployment[];
}

interface DeploymentInfo {
	id: string;
	url: string;
	state: DeploymentState;
	created: number;
	ready: number;
	target: string;
	creator: string;
}

interface SuccessResponse {
	configured: true;
	deployments: DeploymentInfo[];
}

interface NotConfiguredResponse {
	error: string;
	configured: false;
}

const VERCEL_API_BASE_URL = 'https://api.vercel.com/v6/deployments';
const DEFAULT_LIMIT = '10';

function isAuthenticated(authToken: string | undefined): boolean {
	return authToken ? verifySessionToken(authToken) : false;
}

function isVercelConfigured(): boolean {
	return Boolean(VERCEL_API_TOKEN && VERCEL_PROJECT_ID);
}

function buildVercelApiUrl(projectId: string, limit: string, teamId?: string): string {
	let apiUrl = `${VERCEL_API_BASE_URL}?projectId=${projectId}&limit=${limit}`;

	if (teamId) {
		apiUrl += `&teamId=${teamId}`;
	}

	return apiUrl;
}

async function fetchVercelDeployments(apiUrl: string): Promise<VercelDeployment[]> {
	console.log('Fetching Vercel deployments from:', apiUrl);

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

	const data: VercelApiResponse = await response.json();
	return data.deployments || [];
}

function mapDeploymentToInfo(deployment: VercelDeployment): DeploymentInfo {
	return {
		id: deployment.uid,
		url: deployment.url,
		state: deployment.state,
		created: deployment.created,
		ready: deployment.ready,
		target: deployment.target,
		creator: deployment.creator?.username || 'Unknown'
	};
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	// Check authentication
	const authToken = cookies.get('admin_auth');

	if (!isAuthenticated(authToken)) {
		return error(401, { message: 'Unauthorized' });
	}

	// Check if Vercel API is configured
	if (!isVercelConfigured()) {
		const response: NotConfiguredResponse = {
			error: 'Vercel API not configured',
			configured: false
		};
		return json(response, { status: 200 });
	}

	try {
		// Build API URL
		const VERCEL_TEAM_ID = env.VERCEL_TEAM_ID || '';
		const limit = url.searchParams.get('limit') || DEFAULT_LIMIT;
		const apiUrl = buildVercelApiUrl(VERCEL_PROJECT_ID, limit, VERCEL_TEAM_ID);

		// Fetch deployments from Vercel API
		const deployments = await fetchVercelDeployments(apiUrl);

		// Map and return deployments
		const response: SuccessResponse = {
			configured: true,
			deployments: deployments.map(mapDeploymentToInfo)
		};
		return json(response);
	} catch (err) {
		console.error('Error fetching deployment status:', err);
		const details = err instanceof Error ? err.message : 'Unknown error';
		return error(500, `Failed to fetch deployment status: ${details}`);
	}
};
