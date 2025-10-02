import { describe, it, expect, vi } from 'vitest';
import { parsePhotoSlug, generateImageUUID, generateImageSlug, processImage } from './utils';
import type { GalleryImage } from './types';

// Mock the createSrcset utility
vi.mock('$lib/utils', () => ({
	createSrcset: vi.fn((src: string, widths?: number[]) => {
		if (widths) {
			return widths.map((w) => `${src}?w=${w} ${w}w`).join(', ');
		}
		return `${src}?w=150 150w, ${src}?w=400 400w`;
	})
}));

describe('parsePhotoSlug', () => {
	it('parses simple slug with UUID', () => {
		const result = parsePhotoSlug('beautiful-sunset-a1b2c3d4');
		expect(result).toEqual({
			titleSlug: 'beautiful-sunset',
			uuidSuffix: 'a1b2c3d4'
		});
	});

	it('parses slug with multiple hyphens in title', () => {
		const result = parsePhotoSlug('my-amazing-photo-title-12345678');
		expect(result).toEqual({
			titleSlug: 'my-amazing-photo-title',
			uuidSuffix: '12345678'
		});
	});

	it('parses slug with only UUID', () => {
		const result = parsePhotoSlug('a1b2c3d4');
		expect(result).toEqual({
			titleSlug: '',
			uuidSuffix: 'a1b2c3d4'
		});
	});

	it('parses slug with single hyphen', () => {
		const result = parsePhotoSlug('photo-abc123');
		expect(result).toEqual({
			titleSlug: 'photo',
			uuidSuffix: 'abc123'
		});
	});
});

describe('generateImageUUID', () => {
	it('generates consistent UUID for same input', () => {
		const uuid1 = generateImageUUID('/images/photo.jpg');
		const uuid2 = generateImageUUID('/images/photo.jpg');
		expect(uuid1).toBe(uuid2);
	});

	it('generates different UUIDs for different inputs', () => {
		const uuid1 = generateImageUUID('/images/photo1.jpg');
		const uuid2 = generateImageUUID('/images/photo2.jpg');
		expect(uuid1).not.toBe(uuid2);
	});

	it('generates 16-character hexadecimal UUID', () => {
		const uuid = generateImageUUID('/images/test.jpg');
		expect(uuid).toMatch(/^[0-9a-f]{16}$/);
		expect(uuid.length).toBe(16);
	});

	it('handles empty string', () => {
		const uuid = generateImageUUID('');
		expect(uuid).toMatch(/^[0-9a-f]{16}$/);
		expect(uuid.length).toBe(16);
	});

	it('handles special characters', () => {
		const uuid = generateImageUUID('/images/photo (1) [test].jpg');
		expect(uuid).toMatch(/^[0-9a-f]{16}$/);
		expect(uuid.length).toBe(16);
	});

	it('handles unicode characters', () => {
		const uuid = generateImageUUID('/images/café-ñoño.jpg');
		expect(uuid).toMatch(/^[0-9a-f]{16}$/);
		expect(uuid.length).toBe(16);
	});

	it('generates deterministic UUIDs for hashing', () => {
		// Test that the same string always produces the same hash
		const testCases = ['/images/photo1.jpg', '/images/photo2.jpg', '/images/subfolder/photo3.jpg'];

		testCases.forEach((testCase) => {
			const uuid1 = generateImageUUID(testCase);
			const uuid2 = generateImageUUID(testCase);
			expect(uuid1).toBe(uuid2);
		});
	});
});

describe('generateImageSlug', () => {
	it('combines title slug and UUID suffix', () => {
		const slug = generateImageSlug('Beautiful Sunset', '1234567890abcdef');
		expect(slug).toBe('beautiful-sunset-90abcdef');
	});

	it('handles titles with special characters', () => {
		const slug = generateImageSlug('Café & Restaurant!', '1234567890abcdef');
		expect(slug).toBe('cafe-restaurant-90abcdef');
	});

	it('handles titles with diacritics', () => {
		const slug = generateImageSlug('Niño en el café', '1234567890abcdef');
		expect(slug).toBe('nino-en-el-cafe-90abcdef');
	});

	it('normalizes multiple spaces and hyphens', () => {
		const slug = generateImageSlug('Multiple   Spaces  --  Here', '1234567890abcdef');
		expect(slug).toBe('multiple-spaces-here-90abcdef');
	});

	it('removes leading and trailing spaces', () => {
		const slug = generateImageSlug('  Trimmed Title  ', '1234567890abcdef');
		expect(slug).toBe('trimmed-title-90abcdef');
	});

	it('uses only UUID when title is empty', () => {
		const slug = generateImageSlug('', '1234567890abcdef');
		expect(slug).toBe('1234567890abcdef');
	});

	it('uses only UUID when title has only special characters', () => {
		const slug = generateImageSlug('!@#$%^&*()', '1234567890abcdef');
		expect(slug).toBe('1234567890abcdef');
	});

	it('uses last 8 characters of UUID', () => {
		const slug = generateImageSlug('Test', '1234567890abcdef');
		expect(slug.endsWith('-90abcdef')).toBe(true);
	});

	it('handles numeric titles', () => {
		const slug = generateImageSlug('2024 Photo', '1234567890abcdef');
		expect(slug).toBe('2024-photo-90abcdef');
	});

	it('handles mixed case titles', () => {
		const slug = generateImageSlug('MiXeD CaSe TiTlE', '1234567890abcdef');
		expect(slug).toBe('mixed-case-title-90abcdef');
	});
});

describe('processImage', () => {
	const mockImage: GalleryImage = {
		src: '/images/test.jpg',
		title: 'Test Photo',
		description: 'A test photo description',
		alt: 'Test photo alt text',
		published: true
	};

	it('processes image with all required fields', () => {
		const result = processImage(mockImage, 'test-gallery', 0);

		expect(result).toHaveProperty('slug');
		expect(result).toHaveProperty('uuid');
		expect(result).toHaveProperty('originalIndex');
		expect(result).toHaveProperty('title');
		expect(result).toHaveProperty('description');
		expect(result).toHaveProperty('alt');
		expect(result).toHaveProperty('href');
		expect(result).toHaveProperty('srcset');
		expect(result).toHaveProperty('src');
	});

	it('generates slug from title and UUID', () => {
		const result = processImage(mockImage, 'test-gallery', 0);

		expect(result.slug).toMatch(/^test-photo-[0-9a-f]{8}$/);
	});

	it('preserves original metadata', () => {
		const result = processImage(mockImage, 'test-gallery', 0);

		expect(result.title).toBe('Test Photo');
		expect(result.description).toBe('A test photo description');
		expect(result.alt).toBe('Test photo alt text');
	});

	it('sets correct original index', () => {
		const result1 = processImage(mockImage, 'test-gallery', 0);
		const result2 = processImage(mockImage, 'test-gallery', 5);

		expect(result1.originalIndex).toBe(0);
		expect(result2.originalIndex).toBe(5);
	});

	it('generates consistent UUID for same image source', () => {
		const result1 = processImage(mockImage, 'test-gallery', 0);
		const result2 = processImage(mockImage, 'test-gallery', 0);

		expect(result1.uuid).toBe(result2.uuid);
	});

	it('generates different UUIDs for different image sources', () => {
		const image1 = { ...mockImage, src: '/images/photo1.jpg' };
		const image2 = { ...mockImage, src: '/images/photo2.jpg' };

		const result1 = processImage(image1, 'test-gallery', 0);
		const result2 = processImage(image2, 'test-gallery', 0);

		expect(result1.uuid).not.toBe(result2.uuid);
	});

	it('creates correct href path', () => {
		const result = processImage(mockImage, 'test-gallery', 0);

		expect(result.href).toMatch(/^\/images\/test-gallery\/test-photo-[0-9a-f]{8}$/);
	});

	it('creates srcset for responsive images', () => {
		const result = processImage(mockImage, 'test-gallery', 0);

		expect(result.srcset).toBeDefined();
		expect(result.srcset).toContain(mockImage.src);
	});

	it('creates src with specific width', () => {
		const result = processImage(mockImage, 'test-gallery', 0);

		expect(result.src).toBeDefined();
		expect(result.src).toContain(mockImage.src);
	});

	it('handles images with special characters in title', () => {
		const imageWithSpecialChars = {
			...mockImage,
			title: 'Café & Restaurant!'
		};

		const result = processImage(imageWithSpecialChars, 'test-gallery', 0);

		expect(result.slug).toMatch(/^cafe-restaurant-[0-9a-f]{8}$/);
	});

	it('handles images with diacritics in title', () => {
		const imageWithDiacritics = {
			...mockImage,
			title: 'Niño en el café'
		};

		const result = processImage(imageWithDiacritics, 'test-gallery', 0);

		expect(result.slug).toMatch(/^nino-en-el-cafe-[0-9a-f]{8}$/);
	});

	it('handles images with empty title', () => {
		const imageWithEmptyTitle = {
			...mockImage,
			title: ''
		};

		const result = processImage(imageWithEmptyTitle, 'test-gallery', 0);

		expect(result.slug).toMatch(/^[0-9a-f]{16}$/);
		expect(result.title).toBe('');
	});

	it('handles different gallery IDs', () => {
		const result1 = processImage(mockImage, 'gallery-1', 0);
		const result2 = processImage(mockImage, 'gallery-2', 0);

		expect(result1.href).toContain('/images/gallery-1/');
		expect(result2.href).toContain('/images/gallery-2/');
	});

	it('processes multiple images with consistent UUIDs', () => {
		const images: GalleryImage[] = [
			{ ...mockImage, src: '/images/photo1.jpg' },
			{ ...mockImage, src: '/images/photo2.jpg' },
			{ ...mockImage, src: '/images/photo3.jpg' }
		];

		const results = images.map((img, idx) => processImage(img, 'gallery', idx));

		// Check each image gets unique UUID
		const uuids = results.map((r) => r.uuid);
		const uniqueUuids = new Set(uuids);
		expect(uniqueUuids.size).toBe(3);

		// Check indices are preserved
		results.forEach((result, idx) => {
			expect(result.originalIndex).toBe(idx);
		});
	});
});
