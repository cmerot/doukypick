import { describe, it, expect } from 'vitest';
import { getAllImageWidths, logoSizes, contentSizes, gallerySizes } from './image-sizes';

describe('image-sizes', () => {
	describe('size constants', () => {
		it('defines logo sizes correctly', () => {
			expect(logoSizes).toEqual({
				xs: 100,
				sm: 160
			});
		});

		it('defines content sizes correctly', () => {
			expect(contentSizes).toEqual({
				sm: 200,
				md: 300,
				lg: 400,
				full: 900
			});
		});

		it('defines gallery sizes correctly', () => {
			expect(gallerySizes).toEqual({
				xs: 160,
				sm: 400,
				md: 600,
				lg: 900,
				xl: 1200
			});
		});
	});

	describe('getAllImageWidths', () => {
		it('returns all image widths from all size objects', () => {
			const result = getAllImageWidths();
			const expected = [
				100, 160, // logoSizes
				200, 300, 400, 900, // contentSizes
				160, 400, 600, 900, 1200 // gallerySizes
			];

			expect(result).toEqual(expected);
		});

		it('returns an array with all widths in correct order', () => {
			const result = getAllImageWidths();

			expect(result).toHaveLength(11);
			expect(result[0]).toBe(100); // logoSizes.xs
			expect(result[1]).toBe(160); // logoSizes.sm
			expect(result[2]).toBe(200); // contentSizes.sm
			expect(result[10]).toBe(1200); // gallerySizes.xl
		});

		it('includes duplicate widths from different size objects', () => {
			const result = getAllImageWidths();

			// 160 appears in logoSizes.sm and gallerySizes.xs
			const width160Count = result.filter((w) => w === 160).length;
			expect(width160Count).toBe(2);

			// 400 appears in contentSizes.lg and gallerySizes.sm
			const width400Count = result.filter((w) => w === 400).length;
			expect(width400Count).toBe(2);

			// 900 appears in contentSizes.full and gallerySizes.lg
			const width900Count = result.filter((w) => w === 900).length;
			expect(width900Count).toBe(2);
		});

		it('returns only numbers', () => {
			const result = getAllImageWidths();

			result.forEach((width) => {
				expect(typeof width).toBe('number');
			});
		});
	});
});
