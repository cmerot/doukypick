import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockUseVercelOptimization = 'false';

vi.mock('$env/static/public', () => ({
	get PUBLIC_USE_VERCEL_IMAGE_OPTIMIZATION() {
		return mockUseVercelOptimization;
	}
}));

describe('createSrc', () => {
	beforeEach(async () => {
		vi.resetModules();
	});

	it('uses Vercel image optimization when enabled', async () => {
		mockUseVercelOptimization = 'true';
		const { createSrc } = await import('./utils');

		const result = createSrc('/image.jpg', 400, 90);
		expect(result).toBe('/_vercel/image?url=%2Fimage.jpg&w=400&q=90');
	});

	it('uses direct URL format when Vercel optimization is disabled', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrc } = await import('./utils');

		const result = createSrc('/image.jpg', 400, 90);
		expect(result).toBe('/image.jpg?w=400&q=90');
	});

	it('uses default width and quality when not specified', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrc } = await import('./utils');

		const result = createSrc('/image.jpg');
		expect(result).toBe('/image.jpg?w=600&q=90');
	});

	it('uses custom quality', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrc } = await import('./utils');

		const result = createSrc('/image.jpg', 800, 75);
		expect(result).toBe('/image.jpg?w=800&q=75');
	});

	it('encodes URLs properly with Vercel optimization', async () => {
		mockUseVercelOptimization = 'true';
		const { createSrc } = await import('./utils');

		const result = createSrc('/images/photo (1).jpg', 400, 90);
		expect(result).toBe('/_vercel/image?url=%2Fimages%2Fphoto%20(1).jpg&w=400&q=90');
	});
});

describe('createSrcset', () => {
	beforeEach(async () => {
		vi.resetModules();
	});

	it('uses Vercel image optimization when enabled', async () => {
		mockUseVercelOptimization = 'true';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400]);
		expect(result).toBe('/_vercel/image?url=%2Fimage.jpg&w=400&q=90 400w');
	});

	it('uses direct URL format when Vercel optimization is disabled', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400, 800]);
		expect(result).toBe('/image.jpg?w=400&q=90 400w, /image.jpg?w=800&q=90 800w');
	});

	it('uses custom quality', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400, 800], 75);
		expect(result).toBe('/image.jpg?w=400&q=75 400w, /image.jpg?w=800&q=75 800w');
	});

	it('sorts widths in ascending order', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [900, 300, 600]);
		expect(result).toBe(
			'/image.jpg?w=300&q=90 300w, /image.jpg?w=600&q=90 600w, /image.jpg?w=900&q=90 900w'
		);
	});

	it('handles URLs with special characters', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/images/photo (1).jpg', [400]);
		expect(result).toBe('/images/photo (1).jpg?w=400&q=90 400w');
	});

	it('handles external URLs without modifications', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('https://example.com/image.jpg', [400, 800]);
		expect(result).toBe('https://example.com/image.jpg');
	});

	it('removes duplicate widths', async () => {
		mockUseVercelOptimization = 'false';
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400, 400, 800, 800]);
		expect(result).toBe('/image.jpg?w=400&q=90 400w, /image.jpg?w=800&q=90 800w');
	});
});
