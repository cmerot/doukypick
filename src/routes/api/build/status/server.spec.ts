import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './+server';
import {
	setupCommonMocks,
	restoreCommonMocks,
	createMockRequest,
	createMockDeployment,
	createSuccessResponse,
	createErrorResponse
} from '../test-helpers';

// Mock dependencies
vi.mock('$lib/server/auth', () => ({
	verifySessionToken: vi.fn()
}));

vi.mock('$env/static/private', () => ({
	VERCEL_API_TOKEN: 'test-vercel-token',
	VERCEL_PROJECT_ID: 'test-project-id'
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		VERCEL_TEAM_ID: 'test-team-id'
	}
}));

import { verifySessionToken } from '$lib/server/auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('GET /api/build/status', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		setupCommonMocks(mockFetch);
	});

	afterEach(() => {
		restoreCommonMocks();
	});

	/**
	 * Helper to set up authenticated request with URL params
	 */
	function setupAuth(limit: string | null = null) {
		const { cookies, url } = createMockRequest({
			cookieValue: 'valid-token',
			urlParamValue: limit
		});
		vi.mocked(verifySessionToken).mockReturnValue(true);
		return { cookies, url };
	}

	/**
	 * Helper to setup successful deployments response
	 */
	function setupDeploymentsResponse(deployments: any[] = []) {
		mockFetch.mockResolvedValue(createSuccessResponse({ deployments }));
	}

	describe('authentication', () => {
		it('returns 401 when no auth token is provided', async () => {
			const { cookies, url } = createMockRequest();
			cookies.get.mockReturnValue(undefined);

			await expect(GET({ cookies, url } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
		});

		it('returns 401 when auth token is invalid', async () => {
			const { cookies, url } = createMockRequest({ cookieValue: 'invalid-token' });
			vi.mocked(verifySessionToken).mockReturnValue(false);

			await expect(GET({ cookies, url } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
			expect(verifySessionToken).toHaveBeenCalledWith('invalid-token');
		});

		it('proceeds when auth token is valid', async () => {
			const { cookies, url } = setupAuth(null);
			setupDeploymentsResponse();

			const response = await GET({ cookies, url } as any);

			expect(response.status).toBe(200);
			expect(verifySessionToken).toHaveBeenCalledWith('valid-token');
		});
	});

	describe('vercel configuration', () => {
		it('returns configured=false when Vercel is not configured', async () => {
			const { cookies, url } = setupAuth(null);

			vi.doMock('$env/static/private', () => ({
				VERCEL_API_TOKEN: '',
				VERCEL_PROJECT_ID: ''
			}));

			vi.resetModules();
			const { GET: unconfiguredGET } = await import('./+server');

			const response = await unconfiguredGET({ cookies, url } as any);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body).toEqual({
				error: 'Vercel API not configured',
				configured: false
			});
		});
	});

	describe('deployment fetching', () => {
		it('fetches deployments with default limit', async () => {
			const { cookies, url } = setupAuth(null);
			const deployment = createMockDeployment();
			setupDeploymentsResponse([deployment]);

			const response = await GET({ cookies, url } as any);

			expect(response.status).toBe(200);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('limit=10'),
				expect.any(Object)
			);

			const body = await response.json();
			expect(body).toEqual({
				configured: true,
				deployments: [
					{
						id: 'deploy-1',
						url: 'test-project.vercel.app',
						state: 'READY',
						created: 1234567890,
						ready: 1234567900,
						target: 'production',
						creator: 'testuser'
					}
				]
			});
		});

		it('fetches deployments with custom limit', async () => {
			const { cookies, url } = setupAuth('20');
			setupDeploymentsResponse();

			await GET({ cookies, url } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('limit=20'),
				expect.any(Object)
			);
		});

		it('includes team ID in API request when available', async () => {
			const { cookies, url } = setupAuth(null);
			setupDeploymentsResponse();

			await GET({ cookies, url } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('teamId=test-team-id'),
				expect.any(Object)
			);
		});

		it('includes authorization header in request', async () => {
			const { cookies, url } = setupAuth(null);
			setupDeploymentsResponse();

			await GET({ cookies, url } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer test-vercel-token'
					})
				})
			);
		});

		it('handles deployments without creator username', async () => {
			const { cookies, url } = setupAuth(null);
			const deployment = createMockDeployment({ creator: null });
			setupDeploymentsResponse([deployment]);

			const response = await GET({ cookies, url } as any);
			const body = await response.json();

			expect(body.deployments[0].creator).toBe('Unknown');
		});

		it('handles different deployment states', async () => {
			const states = ['BUILDING', 'ERROR', 'INITIALIZING', 'QUEUED', 'READY', 'CANCELED'] as const;

			for (const state of states) {
				const { cookies, url } = setupAuth(null);
				const deployment = createMockDeployment({ state });
				setupDeploymentsResponse([deployment]);

				const response = await GET({ cookies, url } as any);
				const body = await response.json();

				expect(body.deployments[0].state).toBe(state);
			}
		});
	});

	describe('error handling', () => {
		it('returns 500 when Vercel API returns error', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockResolvedValue(createErrorResponse(403, 'Forbidden'));

			await expect(GET({ cookies, url } as any)).rejects.toMatchObject({
				status: 500
			});
			expect(console.error).toHaveBeenCalled();
		});

		it('returns 500 when fetch throws error', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(GET({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Failed to fetch deployment status')
				}
			});
		});

		it('handles non-Error exceptions', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockRejectedValue('String error');

			await expect(GET({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Unknown error')
				}
			});
		});
	});

	describe('response mapping', () => {
		it('maps all deployment fields correctly', async () => {
			const { cookies, url } = setupAuth(null);
			const deployment = createMockDeployment({
				uid: 'dep-abc123',
				name: 'my-project',
				url: 'my-project.vercel.app',
				created: 1704067200000,
				state: 'READY',
				ready: 1704067300000,
				target: 'production',
				creator: {
					uid: 'usr-123',
					username: 'johndoe'
				}
			});
			setupDeploymentsResponse([deployment]);

			const response = await GET({ cookies, url } as any);
			const body = await response.json();

			expect(body.deployments[0]).toEqual({
				id: 'dep-abc123',
				url: 'my-project.vercel.app',
				state: 'READY',
				created: 1704067200000,
				ready: 1704067300000,
				target: 'production',
				creator: 'johndoe'
			});
		});

		it('handles empty deployments array', async () => {
			const { cookies, url } = setupAuth(null);
			setupDeploymentsResponse([]);

			const response = await GET({ cookies, url } as any);
			const body = await response.json();

			expect(body).toEqual({
				configured: true,
				deployments: []
			});
		});

		it('handles missing deployments field in response', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockResolvedValue(createSuccessResponse({}));

			const response = await GET({ cookies, url } as any);
			const body = await response.json();

			expect(body.deployments).toEqual([]);
		});
	});
});
