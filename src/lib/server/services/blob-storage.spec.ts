import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadPhotos } from './blob-storage';

// Mock Vercel Blob using vi.hoisted
const { mockPut } = vi.hoisted(() => ({
	mockPut: vi.fn()
}));

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
	put: mockPut
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({
	BLOB_READ_WRITE_TOKEN: 'test-blob-token'
}));

describe('blob-storage service', () => {
	// Helper function to create mock File objects
	function createMockFile(name: string, type: string, content: string): File {
		const blob = new Blob([content], { type });
		return new File([blob], name, { type });
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('empty array handling', () => {
		it('returns empty urls array without calling upload', async () => {
			const result = await uploadPhotos([]);

			expect(mockPut).not.toHaveBeenCalled();
			expect(result).toEqual({ urls: [] });
		});
	});

	describe('filename generation', () => {
		it('generates filenames with contact prefix, timestamp, and random suffix', async () => {
			vi.spyOn(Date, 'now').mockReturnValue(1633024800000);
			vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

			const mockFile = createMockFile('test.jpg', 'image/jpeg', 'content');
			mockPut.mockResolvedValue({ url: 'https://example.com/test.jpg' });

			await uploadPhotos([mockFile]);

			const filename = mockPut.mock.calls[0][0];
			expect(filename).toMatch(/^contact-\d+-[a-z0-9]+\.jpg$/);
			expect(filename).toBe('contact-1633024800000-4fzzzx.jpg');
		});

		it('extracts extension from filename correctly', async () => {
			const mockFile = createMockFile('photo.png', 'image/png', 'content');
			mockPut.mockResolvedValue({ url: 'https://example.com/photo.png' });

			await uploadPhotos([mockFile]);

			const filename = mockPut.mock.calls[0][0];
			expect(filename).toMatch(/\.png$/);
		});

		it('handles filenames with multiple dots by using last part as extension', async () => {
			const mockFile = createMockFile('my.photo.image.webp', 'image/webp', 'content');
			mockPut.mockResolvedValue({ url: 'https://example.com/photo.webp' });

			await uploadPhotos([mockFile]);

			const filename = mockPut.mock.calls[0][0];
			expect(filename).toMatch(/\.webp$/);
		});

		it('uses jpg as default when filename has no extension', async () => {
			const mockFile = createMockFile('', 'image/jpeg', 'content');
			mockPut.mockResolvedValue({ url: 'https://example.com/photo.jpg' });

			await uploadPhotos([mockFile]);

			const filename = mockPut.mock.calls[0][0];
			expect(filename).toMatch(/\.jpg$/);
		});

		it('generates unique filenames for files uploaded at different times', async () => {
			vi.spyOn(Date, 'now').mockReturnValueOnce(1000000000).mockReturnValueOnce(1000000001);
			vi.spyOn(Math, 'random').mockReturnValueOnce(0.111111).mockReturnValueOnce(0.222222);

			const mockFile1 = createMockFile('photo.jpg', 'image/jpeg', 'content');
			const mockFile2 = createMockFile('photo.jpg', 'image/jpeg', 'content');

			mockPut
				.mockResolvedValueOnce({ url: 'https://example.com/photo1.jpg' })
				.mockResolvedValueOnce({ url: 'https://example.com/photo2.jpg' });

			await uploadPhotos([mockFile1, mockFile2]);

			const filename1 = mockPut.mock.calls[0][0];
			const filename2 = mockPut.mock.calls[1][0];
			expect(filename1).not.toBe(filename2);
		});
	});

	describe('sequential upload behavior', () => {
		it('uploads multiple files and aggregates URLs', async () => {
			const files = [
				createMockFile('photo1.jpg', 'image/jpeg', 'content1'),
				createMockFile('photo2.png', 'image/png', 'content2'),
				createMockFile('photo3.webp', 'image/webp', 'content3')
			];

			mockPut
				.mockResolvedValueOnce({ url: 'https://example.com/url1' })
				.mockResolvedValueOnce({ url: 'https://example.com/url2' })
				.mockResolvedValueOnce({ url: 'https://example.com/url3' });

			const result = await uploadPhotos(files);

			expect(result.urls).toEqual([
				'https://example.com/url1',
				'https://example.com/url2',
				'https://example.com/url3'
			]);
		});

		it('stops processing and returns error on first failure', async () => {
			const files = [
				createMockFile('photo1.jpg', 'image/jpeg', 'content1'),
				createMockFile('photo2.jpg', 'image/jpeg', 'content2')
			];

			mockPut.mockRejectedValueOnce(new Error('Upload failed'));

			const result = await uploadPhotos(files);

			expect(mockPut).toHaveBeenCalledTimes(1);
			expect(result.urls).toEqual([]);
			expect(result.error).toBe('Upload failed');
		});
	});

	describe('error handling', () => {
		it('returns error message from Error objects', async () => {
			const mockFile = createMockFile('test.jpg', 'image/jpeg', 'content');
			mockPut.mockRejectedValue(new Error('Network timeout'));

			const result = await uploadPhotos([mockFile]);

			expect(result).toEqual({
				urls: [],
				error: 'Network timeout'
			});
		});

		it('returns generic error message for non-Error exceptions', async () => {
			const mockFile = createMockFile('test.jpg', 'image/jpeg', 'content');
			mockPut.mockRejectedValue('Something went wrong');

			const result = await uploadPhotos([mockFile]);

			expect(result).toEqual({
				urls: [],
				error: 'Unknown upload error'
			});
		});

		it('logs errors to console', async () => {
			const mockFile = createMockFile('test.jpg', 'image/jpeg', 'content');
			const error = new Error('Upload failed');
			mockPut.mockRejectedValue(error);

			await uploadPhotos([mockFile]);

			expect(console.error).toHaveBeenCalledWith('❌ Error uploading photos:', error);
		});
	});
});
