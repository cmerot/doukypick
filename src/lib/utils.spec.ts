import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockDev = false;

vi.mock('$app/environment', () => ({
	get dev() {
		return mockDev;
	}
}));

describe('createSrcset', () => {
	beforeEach(async () => {
		vi.resetModules();
	});

	it('uses Vercel image optimization when dev is false', async () => {
		mockDev = false;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400]);
		expect(result).toBe('/_vercel/image?url=%2Fimage.jpg&w=400&q=90 400w');
	});

	it('uses direct URL format', async () => {
		mockDev = true;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400, 800]);
		expect(result).toBe('/image.jpg?w=400&q=90 400w, /image.jpg?w=800&q=90 800w');
	});

	it('uses default widths and quality', async () => {
		mockDev = true;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg');
		expect(result).toBe(
			'/image.jpg?w=150&q=90 150w, /image.jpg?w=400&q=90 400w, /image.jpg?w=600&q=90 600w, /image.jpg?w=900&q=90 900w, /image.jpg?w=1200&q=90 1200w'
		);
	});

	it('uses custom quality', async () => {
		mockDev = true;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [400, 800], 75);
		expect(result).toBe('/image.jpg?w=400&q=75 400w, /image.jpg?w=800&q=75 800w');
	});

	it('sorts widths in ascending order', async () => {
		mockDev = true;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/image.jpg', [900, 300, 600]);
		expect(result).toBe(
			'/image.jpg?w=300&q=90 300w, /image.jpg?w=600&q=90 600w, /image.jpg?w=900&q=90 900w'
		);
	});

	it('handles URLs with special characters', async () => {
		mockDev = true;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('/images/photo (1).jpg', [400]);
		expect(result).toBe('/images/photo (1).jpg?w=400&q=90 400w');
	});

	it('handles external URLs without modifications', async () => {
		mockDev = true;
		const { createSrcset } = await import('./utils');

		const result = createSrcset('https://example.com/image.jpg', [400, 800]);
		expect(result).toBe('https://example.com/image.jpg');
	});
});
