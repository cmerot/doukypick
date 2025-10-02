import { describe, it, expect } from 'vitest';
import { formatFileSize } from './utils';

describe('formatFileSize', () => {
	it('returns "0 o" for zero bytes', () => {
		expect(formatFileSize(0)).toBe('0 o');
	});

	it('formats bytes correctly (< 1024)', () => {
		expect(formatFileSize(1)).toBe('1 o');
		expect(formatFileSize(100)).toBe('100 o');
		expect(formatFileSize(512)).toBe('512 o');
		expect(formatFileSize(1023)).toBe('1023 o');
	});

	it('formats kilobytes correctly', () => {
		expect(formatFileSize(1024)).toBe('1 ko');
		expect(formatFileSize(2048)).toBe('2 ko');
		expect(formatFileSize(1536)).toBe('1.5 ko');
		expect(formatFileSize(10240)).toBe('10 ko');
		expect(formatFileSize(102400)).toBe('100 ko');
	});

	it('formats megabytes correctly', () => {
		expect(formatFileSize(1048576)).toBe('1 Mo');
		expect(formatFileSize(2097152)).toBe('2 Mo');
		expect(formatFileSize(5242880)).toBe('5 Mo');
		expect(formatFileSize(1572864)).toBe('1.5 Mo');
		expect(formatFileSize(10485760)).toBe('10 Mo');
	});

	it('formats with 1 decimal place precision', () => {
		expect(formatFileSize(1536)).toBe('1.5 ko');
		expect(formatFileSize(1740)).toBe('1.7 ko');
		expect(formatFileSize(1126)).toBe('1.1 ko');
		expect(formatFileSize(1587200)).toBe('1.5 Mo');
	});

	it('handles edge cases', () => {
		expect(formatFileSize(1023)).toBe('1023 o');
		expect(formatFileSize(1024)).toBe('1 ko');
		expect(formatFileSize(1048575)).toBe('1024 ko');
		expect(formatFileSize(1048576)).toBe('1 Mo');
	});

	it('rounds decimal values correctly', () => {
		expect(formatFileSize(1536)).toBe('1.5 ko');
		expect(formatFileSize(1945)).toBe('1.9 ko');
		expect(formatFileSize(1996)).toBe('1.9 ko');
	});
});
