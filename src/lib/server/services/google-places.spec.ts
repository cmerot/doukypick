import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GooglePlacesResponse } from '$lib/types/google-places';
import { fetchGoogleReviews } from './google-places';

// Mock environment variables
vi.mock('$env/static/private', () => ({
	GOOGLE_PLACES_API_KEY: 'test-api-key',
	GOOGLE_PLACE_ID: 'test-place-id'
}));

describe('fetchGoogleReviews', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('default value handling', () => {
		it('provides default values for missing fields in response', async () => {
			const mockResponse: GooglePlacesResponse = {};

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			const result = await fetchGoogleReviews(mockFetch);

			expect(result).toEqual({
				reviews: [],
				rating: 0,
				totalReviews: 0
			});
		});

		it('provides default values for partial data', async () => {
			const mockResponse: GooglePlacesResponse = {
				rating: 4.5
				// reviews and userRatingCount missing
			};

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockResponse
			});

			const result = await fetchGoogleReviews(mockFetch);

			expect(result).toEqual({
				reviews: [],
				rating: 4.5,
				totalReviews: 0
			});
		});
	});

	describe('error handling', () => {
		it('returns default values on HTTP error', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: async () => 'Not Found'
			});

			const result = await fetchGoogleReviews(mockFetch);

			expect(result).toEqual({
				reviews: [],
				rating: 0,
				totalReviews: 0
			});
		});

		it('returns default values on network error', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

			const result = await fetchGoogleReviews(mockFetch);

			expect(result).toEqual({
				reviews: [],
				rating: 0,
				totalReviews: 0
			});
		});

		it('logs error message on HTTP failure', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: async () => 'Internal Server Error'
			});

			await fetchGoogleReviews(mockFetch);

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('Échec de récupération des avis')
			);
		});

		it('logs error on exception', async () => {
			const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

			await fetchGoogleReviews(mockFetch);

			expect(console.error).toHaveBeenCalledWith(
				'Erreur lors de la récupération des avis Google:',
				expect.any(Error)
			);
		});
	});
});
