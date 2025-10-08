import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './+server';
import {
	setupCommonMocks,
	restoreCommonMocks,
	createMockRequest,
	createVercelDeploymentResponse,
	createErrorResponse
} from '../test-helpers';

// Mock dependencies
vi.mock('$lib/server/auth', () => ({
	verifySessionToken: vi.fn()
}));

vi.mock('$env/static/private', () => ({
	VERCEL_API_TOKEN: 'test-vercel-token',
	VERCEL_PROJECT_ID: 'test-project-id',
	VERCEL_REPO_ID: 'test-repo-id'
}));

import { verifySessionToken } from '$lib/server/auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('POST /api/build/deploy', () => {
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
	function setupAuth(urlParamValue: string | null = null) {
		const { cookies, url } = createMockRequest({
			cookieValue: 'valid-token',
			urlParamValue
		});
		vi.mocked(verifySessionToken).mockReturnValue(true);
		return { cookies, url };
	}

	/**
	 * Helper to setup successful deployment response
	 */
	function setupSuccessfulDeployment(
		id = 'dpl_123',
		url = 'test.vercel.app',
		inspectorUrl?: string
	) {
		mockFetch.mockResolvedValue(createVercelDeploymentResponse(id, url, inspectorUrl));
	}

	describe('authentication', () => {
		it('returns 401 when no auth token is provided', async () => {
			const { cookies, url } = createMockRequest();
			cookies.get.mockReturnValue(undefined);

			await expect(POST({ cookies, url } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
		});

		it('returns 401 when auth token is invalid', async () => {
			const { cookies, url } = createMockRequest({ cookieValue: 'invalid-token' });
			vi.mocked(verifySessionToken).mockReturnValue(false);

			await expect(POST({ cookies, url } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
			expect(verifySessionToken).toHaveBeenCalledWith('invalid-token');
		});

		it('proceeds when auth token is valid', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment();

			const response = await POST({ cookies, url } as any);

			expect(response.status).toBe(200);
			expect(verifySessionToken).toHaveBeenCalledWith('valid-token');
		});
	});

	describe('vercel credentials validation', () => {
		it('returns 500 when VERCEL_API_TOKEN is missing', async () => {
			const { cookies, url } = setupAuth(null);

			vi.doMock('$env/static/private', () => ({
				VERCEL_API_TOKEN: '',
				VERCEL_PROJECT_ID: 'test-project-id',
				VERCEL_REPO_ID: 'test-repo-id'
			}));

			vi.resetModules();
			const { POST: unconfiguredPOST } = await import('./+server');

			await expect(unconfiguredPOST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: { message: 'Vercel API credentials not configured' }
			});
		});

		it('returns 500 when VERCEL_PROJECT_ID is missing', async () => {
			const { cookies, url } = setupAuth(null);

			vi.doMock('$env/static/private', () => ({
				VERCEL_API_TOKEN: 'test-token',
				VERCEL_PROJECT_ID: '',
				VERCEL_REPO_ID: 'test-repo-id'
			}));

			vi.resetModules();
			const { POST: unconfiguredPOST } = await import('./+server');

			await expect(unconfiguredPOST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: { message: 'Vercel API credentials not configured' }
			});
		});

		it('returns 500 when VERCEL_REPO_ID is missing', async () => {
			const { cookies, url } = setupAuth(null);

			vi.doMock('$env/static/private', () => ({
				VERCEL_API_TOKEN: 'test-token',
				VERCEL_PROJECT_ID: 'test-project-id',
				VERCEL_REPO_ID: ''
			}));

			vi.resetModules();
			const { POST: unconfiguredPOST } = await import('./+server');

			await expect(unconfiguredPOST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: { message: 'Vercel API credentials not configured' }
			});
		});
	});

	describe('deployment triggering', () => {
		it('triggers deployment with default branch (preview)', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment('dpl_abc123', 'preview-abc123.vercel.app');

			await POST({ cookies, url } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.vercel.com/v13/deployments',
				expect.objectContaining({
					method: 'POST'
				})
			);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody).toEqual({
				name: 'test-project-id',
				gitSource: {
					type: 'github',
					ref: 'preview',
					repoId: 'test-repo-id'
				}
			});
		});

		it('triggers deployment with custom branch', async () => {
			const { cookies, url } = setupAuth('main');
			setupSuccessfulDeployment('dpl_main123', 'main-123.vercel.app');

			await POST({ cookies, url } as any);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.gitSource.ref).toBe('main');
		});

		it('includes correct authorization header', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment();

			await POST({ cookies, url } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.vercel.com/v13/deployments',
				expect.objectContaining({
					headers: {
						Authorization: 'Bearer test-vercel-token',
						'Content-Type': 'application/json'
					}
				})
			);
		});

		it('returns success response with deployment details', async () => {
			const { cookies, url } = setupAuth('staging');
			setupSuccessfulDeployment('dpl_staging789', 'staging-789.vercel.app');

			const response = await POST({ cookies, url } as any);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body).toEqual({
				success: true,
				message: 'Build triggered successfully for branch: staging',
				deployment: {
					id: 'dpl_staging789',
					url: 'staging-789.vercel.app',
					inspectorUrl: 'https://vercel.com/test/inspections/dpl_staging789'
				}
			});
		});

		it('uses correct Vercel API endpoint', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment();

			await POST({ cookies, url } as any);

			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.vercel.com/v13/deployments',
				expect.any(Object)
			);
		});

		it('sets gitSource type to github', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment();

			await POST({ cookies, url } as any);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.gitSource.type).toBe('github');
		});

		it('includes project name in deployment request', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment();

			await POST({ cookies, url } as any);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.name).toBe('test-project-id');
		});

		it('includes repo ID in deployment request', async () => {
			const { cookies, url } = setupAuth(null);
			setupSuccessfulDeployment();

			await POST({ cookies, url } as any);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.gitSource.repoId).toBe('test-repo-id');
		});
	});

	describe('error handling', () => {
		it('returns 500 when Vercel API returns error', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockResolvedValue(createErrorResponse(403, { error: 'Forbidden' }));

			await expect(POST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Vercel API error: 403')
				}
			});
		});

		it('includes error details in 500 response', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockResolvedValue(
				createErrorResponse(422, { error: { message: 'Invalid parameters' } })
			);

			await expect(POST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Invalid parameters')
				}
			});
		});

		it('handles fetch network errors', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockRejectedValue(new Error('Network timeout'));

			await expect(POST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Network timeout')
				}
			});
			expect(console.error).toHaveBeenCalledWith('Error triggering build:', expect.any(Error));
		});

		it('handles non-Error exceptions', async () => {
			const { cookies, url } = setupAuth(null);
			mockFetch.mockRejectedValue('String error');

			await expect(POST({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Unknown error')
				}
			});
		});

		it('logs errors to console', async () => {
			const { cookies, url } = setupAuth(null);
			const error = new Error('API error');
			mockFetch.mockRejectedValue(error);

			await expect(POST({ cookies, url } as any)).rejects.toThrow();

			expect(console.error).toHaveBeenCalledWith('Error triggering build:', error);
		});
	});

	describe('branch parameter handling', () => {
		beforeEach(() => {
			setupSuccessfulDeployment();
		});

		it('handles different branch names', async () => {
			const branches = ['main', 'develop', 'feature/test', 'release-1.0'];

			for (const branch of branches) {
				const { cookies, url } = setupAuth(branch);

				const response = await POST({ cookies, url } as any);
				const body = await response.json();

				expect(body.message).toContain(`branch: ${branch}`);

				const callBody = JSON.parse(mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1].body);
				expect(callBody.gitSource.ref).toBe(branch);
			}
		});

		it('handles empty branch parameter as preview', async () => {
			const { cookies, url } = setupAuth('');

			await POST({ cookies, url } as any);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.gitSource.ref).toBe('preview');
		});

		it('handles null branch parameter as preview', async () => {
			const { cookies, url } = setupAuth(null);

			await POST({ cookies, url } as any);

			const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(callBody.gitSource.ref).toBe('preview');
		});
	});

	describe('response structure', () => {
		it('includes all required fields in success response', async () => {
			const { cookies, url } = setupAuth('test-branch');
			setupSuccessfulDeployment('dpl_xyz789', 'test-xyz789.vercel.app');

			const response = await POST({ cookies, url } as any);
			const body = await response.json();

			expect(body).toHaveProperty('success');
			expect(body).toHaveProperty('message');
			expect(body).toHaveProperty('deployment');
			expect(body.deployment).toHaveProperty('id');
			expect(body.deployment).toHaveProperty('url');
			expect(body.deployment).toHaveProperty('inspectorUrl');
		});

		it('sets success to true in successful response', async () => {
			const { cookies, url } = setupAuth('test-branch');
			setupSuccessfulDeployment();

			const response = await POST({ cookies, url } as any);
			const body = await response.json();

			expect(body.success).toBe(true);
		});

		it('maps Vercel response fields correctly', async () => {
			const { cookies, url } = setupAuth('test-branch');
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({
					id: 'unique-deployment-id',
					url: 'unique-deployment.vercel.app',
					inspectorUrl: 'https://vercel.com/test/inspections/unique-id',
					otherField: 'ignored'
				})
			});

			const response = await POST({ cookies, url } as any);
			const body = await response.json();

			expect(body.deployment).toEqual({
				id: 'unique-deployment-id',
				url: 'unique-deployment.vercel.app',
				inspectorUrl: 'https://vercel.com/test/inspections/unique-id'
			});
		});
	});
});
