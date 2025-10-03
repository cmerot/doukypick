import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveContactSubmission, type ContactSubmissionData } from './contact-database';

// Mock Supabase methods using vi.hoisted
const { mockSelect, mockSingle, mockInsert, mockFrom } = vi.hoisted(() => ({
	mockSelect: vi.fn(),
	mockSingle: vi.fn(),
	mockInsert: vi.fn(),
	mockFrom: vi.fn()
}));

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
	createClient: vi.fn(() => ({
		from: mockFrom
	}))
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({
	SUPABASE_URL: 'https://test.supabase.co',
	SUPABASE_ANON_KEY: 'test-anon-key'
}));

describe('contact-database service', () => {
	const baseSubmissionData: ContactSubmissionData = {
		email: 'jean@example.com',
		is_adult: 'yes',
		first_name: 'Jean',
		pseudonym: null,
		phone: '+33612345678',
		project_type: 'Tatouage personnalisé',
		project_description: 'Je souhaite un tatouage de dragon sur le bras',
		size: null,
		placement: null,
		budget: null,
		timeline: null,
		additional_comments: null,
		send_copy: false,
		photo_urls: [],
		created_at: '2025-10-02T10:30:00Z'
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});

		// Setup mock chain: from -> insert -> select -> single
		mockSingle.mockReturnValue({ data: null, error: null });
		mockSelect.mockReturnValue({ single: mockSingle });
		mockInsert.mockReturnValue({ select: mockSelect });
		mockFrom.mockReturnValue({ insert: mockInsert });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('error handling', () => {
		it('returns generic error message when Supabase fails', async () => {
			const supabaseError = {
				message: 'Database connection failed',
				code: '08P01'
			};

			mockSingle.mockResolvedValue({
				data: null,
				error: supabaseError
			});

			const result = await saveContactSubmission(baseSubmissionData);

			expect(result.data).toBeNull();
			expect(result.error).toBeInstanceOf(Error);
			expect(result.error?.message).toBe('Database save failed');
		});

		it('logs Supabase errors to console', async () => {
			const supabaseError = {
				message: 'Unique constraint violation',
				code: '23505'
			};

			mockSingle.mockResolvedValue({
				data: null,
				error: supabaseError
			});

			await saveContactSubmission(baseSubmissionData);

			expect(console.error).toHaveBeenCalledWith('❌ Supabase error:', supabaseError);
		});
	});

	describe('successful save', () => {
		it('returns saved data with generated id', async () => {
			const savedSubmission = {
				id: 123,
				...baseSubmissionData
			};

			mockSingle.mockResolvedValue({
				data: savedSubmission,
				error: null
			});

			const result = await saveContactSubmission(baseSubmissionData);

			expect(result.data).toEqual(savedSubmission);
			expect(result.error).toBeNull();
		});

		it('logs submission data and success message', async () => {
			const savedSubmission = {
				id: 456,
				...baseSubmissionData
			};

			mockSingle.mockResolvedValue({
				data: savedSubmission,
				error: null
			});

			await saveContactSubmission(baseSubmissionData);

			expect(console.log).toHaveBeenCalledWith('💾 Saving to Supabase...');
			expect(console.log).toHaveBeenCalledWith('📝 Submission data:', baseSubmissionData);
			expect(console.log).toHaveBeenCalledWith(
				'✅ Contact form submission saved:',
				savedSubmission
			);
		});
	});
});
