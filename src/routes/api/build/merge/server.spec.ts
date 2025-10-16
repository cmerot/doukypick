import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './+server';
import {
	setupCommonMocks,
	restoreCommonMocks,
	createMockRequest,
	createGitHubPRResponse,
	createGitHubMergeResponse,
	createErrorResponse
} from '../test-helpers';

// Mock dependencies
vi.mock('$lib/server/auth', () => ({
	verifySessionToken: vi.fn()
}));

vi.mock('$env/static/private', () => ({
	GITHUB_TOKEN: 'test-github-token'
}));

import { verifySessionToken } from '$lib/server/auth';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('POST /api/build/merge', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		setupCommonMocks(mockFetch);
	});

	afterEach(() => {
		restoreCommonMocks();
	});

	/**
	 * Helper to set up a successful merge workflow with 4 API calls
	 */
	function setupSuccessfulMergeWorkflow(
		pr1Number = 123,
		pr1Sha = 'abc123',
		pr2Number = 456,
		pr2Sha = 'def456'
	) {
		mockFetch
			.mockResolvedValueOnce(createGitHubPRResponse(pr1Number))
			.mockResolvedValueOnce(createGitHubMergeResponse(pr1Sha))
			.mockResolvedValueOnce(createGitHubPRResponse(pr2Number))
			.mockResolvedValueOnce(createGitHubMergeResponse(pr2Sha));
	}

	/**
	 * Helper to set up authenticated request
	 */
	function setupAuth() {
		const { cookies } = createMockRequest({ cookieValue: 'valid-token' });
		vi.mocked(verifySessionToken).mockReturnValue(true);
		return { cookies };
	}

	describe('authentication', () => {
		it('returns 401 when no auth token is provided', async () => {
			const { cookies } = createMockRequest();
			cookies.get.mockReturnValue(undefined);

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
		});

		it('returns 401 when auth token is invalid', async () => {
			const { cookies } = createMockRequest({ cookieValue: 'invalid-token' });
			vi.mocked(verifySessionToken).mockReturnValue(false);

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
			expect(verifySessionToken).toHaveBeenCalledWith('invalid-token');
		});

		it('proceeds when auth token is valid', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow();

			const response = await POST({ cookies } as any);

			expect(response.status).toBe(200);
			expect(verifySessionToken).toHaveBeenCalledWith('valid-token');
		});
	});

	describe('github token validation', () => {
		it('returns 500 when GitHub token is not configured', async () => {
			const { cookies } = setupAuth();

			vi.doMock('$env/static/private', () => ({
				GITHUB_TOKEN: ''
			}));

			vi.resetModules();
			const { POST: unconfiguredPOST } = await import('./+server');

			await expect(unconfiguredPOST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: { message: 'GitHub token not configured' }
			});
		});
	});

	describe('merge workflow', () => {
		beforeEach(() => {
			setupAuth();
		});

		it('creates PR from preview to main', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow();

			await POST({ cookies } as any);

			// Check first PR creation call (preview → main)
			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				'https://api.github.com/repos/cmerot/doukypick/pulls',
				expect.objectContaining({
					method: 'POST',
					headers: expect.objectContaining({
						Authorization: 'Bearer test-github-token'
					}),
					body: expect.stringContaining('"head":"preview"')
				})
			);

			const firstCallBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(firstCallBody).toEqual({
				title: 'content: merge preview into main',
				head: 'preview',
				base: 'main',
				body: 'Automated merge from admin panel'
			});
		});

		it('merges first PR (preview to main)', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow(123);

			await POST({ cookies } as any);

			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				'https://api.github.com/repos/cmerot/doukypick/pulls/123/merge',
				expect.objectContaining({
					method: 'PUT'
				})
			);

			const secondCallBody = JSON.parse(mockFetch.mock.calls[1][1].body);
			expect(secondCallBody).toEqual({
				commit_title: 'content: merge preview into main',
				merge_method: 'merge'
			});
		});

		it('creates PR from main to preview', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow();

			await POST({ cookies } as any);

			expect(mockFetch).toHaveBeenNthCalledWith(
				3,
				'https://api.github.com/repos/cmerot/doukypick/pulls',
				expect.any(Object)
			);

			const thirdCallBody = JSON.parse(mockFetch.mock.calls[2][1].body);
			expect(thirdCallBody).toEqual({
				title: 'content: merge main into preview',
				head: 'main',
				base: 'preview',
				body: 'Automated merge from admin panel'
			});
		});

		it('merges second PR (main to preview)', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow(123, 'abc123', 456);

			await POST({ cookies } as any);

			expect(mockFetch).toHaveBeenNthCalledWith(
				4,
				'https://api.github.com/repos/cmerot/doukypick/pulls/456/merge',
				expect.objectContaining({
					method: 'PUT'
				})
			);

			const fourthCallBody = JSON.parse(mockFetch.mock.calls[3][1].body);
			expect(fourthCallBody).toEqual({
				commit_title: 'content: merge main into preview',
				merge_method: 'merge'
			});
		});

		it('returns success response with merge details', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow(123, 'abc123', 456, 'def456');

			const response = await POST({ cookies } as any);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body).toEqual({
				success: true,
				message: 'Branches merged successfully via Pull Requests',
				merges: {
					previewToMain: {
						pr: 123,
						sha: 'abc123',
						merged: true
					},
					mainToPreview: {
						pr: 456,
						sha: 'def456',
						merged: true
					}
				}
			});
		});

		it('executes all 4 API calls in correct order', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow(1, 'sha1', 2, 'sha2');

			await POST({ cookies } as any);

			expect(mockFetch).toHaveBeenCalledTimes(4);
		});
	});

	describe('error handling', () => {
		beforeEach(() => {
			setupAuth();
		});

		it('returns 500 when first PR creation fails', async () => {
			const { cookies } = setupAuth();
			mockFetch.mockResolvedValueOnce(createErrorResponse(422, { message: 'Validation failed' }));

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Failed to create PR (preview→main)')
				}
			});
		});

		it('returns 500 when first PR merge fails', async () => {
			const { cookies } = setupAuth();
			mockFetch
				.mockResolvedValueOnce(createGitHubPRResponse(123))
				.mockResolvedValueOnce(createErrorResponse(405, { message: 'Not allowed' }));

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Failed to merge PR 123')
				}
			});
		});

		it('returns 500 when second PR creation fails', async () => {
			const { cookies } = setupAuth();
			mockFetch
				.mockResolvedValueOnce(createGitHubPRResponse(123))
				.mockResolvedValueOnce(createGitHubMergeResponse('abc123'))
				.mockResolvedValueOnce(createErrorResponse(422, { message: 'Validation failed' }));

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Failed to create PR (main→preview)')
				}
			});
		});

		it('returns 500 when second PR merge fails', async () => {
			const { cookies } = setupAuth();
			mockFetch
				.mockResolvedValueOnce(createGitHubPRResponse(123))
				.mockResolvedValueOnce(createGitHubMergeResponse('abc123'))
				.mockResolvedValueOnce(createGitHubPRResponse(456))
				.mockResolvedValueOnce(createErrorResponse(405, { message: 'Not allowed' }));

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Failed to merge PR 456')
				}
			});
		});

		it('handles fetch network errors', async () => {
			const { cookies } = setupAuth();
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Network error')
				}
			});
			expect(console.error).toHaveBeenCalled();
		});

		it('handles non-Error exceptions', async () => {
			const { cookies } = setupAuth();
			mockFetch.mockRejectedValue('String error');

			await expect(POST({ cookies } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Unknown error')
				}
			});
		});
	});

	describe('github api headers', () => {
		beforeEach(() => {
			setupAuth();
		});

		it('includes correct headers for PR creation', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow();

			await POST({ cookies } as any);

			// Check headers for PR creation calls
			expect(mockFetch.mock.calls[0][1].headers).toEqual({
				Authorization: 'Bearer test-github-token',
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			});

			expect(mockFetch.mock.calls[2][1].headers).toEqual({
				Authorization: 'Bearer test-github-token',
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			});
		});

		it('includes correct headers for PR merge', async () => {
			const { cookies } = setupAuth();
			setupSuccessfulMergeWorkflow();

			await POST({ cookies } as any);

			// Check headers for merge calls
			expect(mockFetch.mock.calls[1][1].headers).toEqual({
				Authorization: 'Bearer test-github-token',
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			});

			expect(mockFetch.mock.calls[3][1].headers).toEqual({
				Authorization: 'Bearer test-github-token',
				'Content-Type': 'application/json',
				Accept: 'application/vnd.github+json'
			});
		});
	});
});
