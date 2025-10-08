import { vi, beforeEach, afterEach, expect, describe, it } from 'vitest';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Common test setup that should be used in beforeEach
 */
export function setupCommonMocks(mockFetch: ReturnType<typeof vi.fn>) {
	vi.clearAllMocks();
	global.fetch = mockFetch;
	vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.spyOn(console, 'log').mockImplementation(() => {});
}

/**
 * Common test cleanup that should be used in afterEach
 */
export function restoreCommonMocks() {
	vi.restoreAllMocks();
}

/**
 * Factory for creating mock cookies object
 */
export function createMockCookies() {
	return {
		get: vi.fn()
	};
}

/**
 * Factory for creating mock URL object with search params
 */
export function createMockUrl() {
	return {
		searchParams: {
			get: vi.fn()
		}
	};
}

/**
 * Factory for creating a complete mock request context
 */
export function createMockRequest(overrides?: {
	cookieValue?: string;
	urlParamValue?: string | null;
}) {
	const cookies = createMockCookies();
	const url = createMockUrl();

	if (overrides?.cookieValue !== undefined) {
		cookies.get.mockReturnValue(overrides.cookieValue);
	}

	if (overrides?.urlParamValue !== undefined) {
		url.searchParams.get.mockReturnValue(overrides.urlParamValue);
	}

	return { cookies, url };
}

/**
 * Helper to create a successful fetch response
 */
export function createSuccessResponse<T>(data: T) {
	return {
		ok: true,
		json: async () => data
	};
}

/**
 * Helper to create an error fetch response
 */
export function createErrorResponse(status: number, data?: any) {
	return {
		ok: false,
		status,
		json: async () => data || { message: 'Error' },
		text: async () => JSON.stringify(data || { message: 'Error' })
	};
}

/**
 * Reusable test suite for authentication checks
 * This suite tests the standard authentication flow used across API routes
 */
export function runAuthenticationTests(
	endpoint: (context: any) => Promise<Response>,
	verifySessionToken: ReturnType<typeof vi.fn>,
	options: {
		method?: 'GET' | 'POST';
		setupSuccessScenario?: (mockFetch: ReturnType<typeof vi.fn>) => void;
	} = {}
) {
	const mockFetch = vi.fn();

	beforeEach(() => {
		setupCommonMocks(mockFetch);
	});

	afterEach(() => {
		restoreCommonMocks();
	});

	describe('authentication', () => {
		it('returns 401 when no auth token is provided', async () => {
			const { cookies, url } = createMockRequest();
			cookies.get.mockReturnValue(undefined);

			await expect(endpoint({ cookies, url } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
		});

		it('returns 401 when auth token is invalid', async () => {
			const { cookies, url } = createMockRequest({ cookieValue: 'invalid-token' });
			verifySessionToken.mockReturnValue(false);

			await expect(endpoint({ cookies, url } as any)).rejects.toMatchObject({
				status: 401,
				body: { message: 'Unauthorized' }
			});
			expect(verifySessionToken).toHaveBeenCalledWith('invalid-token');
		});

		it('proceeds when auth token is valid', async () => {
			const { cookies, url } = createMockRequest({ cookieValue: 'valid-token' });
			verifySessionToken.mockReturnValue(true);

			if (options.method === 'GET') {
				url.searchParams.get.mockReturnValue(null);
			}

			// Setup a successful scenario
			if (options.setupSuccessScenario) {
				options.setupSuccessScenario(mockFetch);
			} else {
				mockFetch.mockResolvedValue(createSuccessResponse({ success: true }));
			}

			const response = await endpoint({ cookies, url } as any);

			expect(response.status).toBe(200);
			expect(verifySessionToken).toHaveBeenCalledWith('valid-token');
		});
	});
}

/**
 * Helper to create a GitHub API mock response for PR creation
 */
export function createGitHubPRResponse(number: number) {
	return createSuccessResponse({ number });
}

/**
 * Helper to create a GitHub API mock response for PR merge
 */
export function createGitHubMergeResponse(sha: string, merged = true) {
	return createSuccessResponse({ sha, merged });
}

/**
 * Helper to create a Vercel deployment response
 */
export function createVercelDeploymentResponse(id: string, url: string, inspectorUrl?: string) {
	return createSuccessResponse({
		id,
		url,
		inspectorUrl: inspectorUrl ?? `https://vercel.com/test/inspections/${id}`
	});
}

/**
 * Helper to create mock deployment data for Vercel status API
 */
export function createMockDeployment(
	overrides?: Partial<{
		uid: string;
		name: string;
		url: string;
		created: number;
		state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
		ready: number;
		target: string;
		creator: { uid: string; username: string } | null;
	}>
) {
	return {
		uid: 'deploy-1',
		name: 'test-project',
		url: 'test-project.vercel.app',
		created: 1234567890,
		state: 'READY' as const,
		ready: 1234567900,
		target: 'production',
		creator: {
			uid: 'user-1',
			username: 'testuser'
		},
		...overrides
	};
}

/**
 * Test suite for error handling patterns
 */
export function createErrorHandlingTests(
	endpoint: (context: any) => Promise<Response>,
	mockFetch: ReturnType<typeof vi.fn>,
	setupAuth: () => void
) {
	describe('error handling', () => {
		beforeEach(() => {
			setupAuth();
		});

		it('handles fetch network errors', async () => {
			const { cookies, url } = createMockRequest();
			mockFetch.mockRejectedValue(new Error('Network error'));

			await expect(endpoint({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Network error')
				}
			});
			expect(console.error).toHaveBeenCalled();
		});

		it('handles non-Error exceptions', async () => {
			const { cookies, url } = createMockRequest();
			mockFetch.mockRejectedValue('String error');

			await expect(endpoint({ cookies, url } as any)).rejects.toMatchObject({
				status: 500,
				body: {
					message: expect.stringContaining('Unknown error')
				}
			});
		});
	});
}
