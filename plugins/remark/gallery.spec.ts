import { describe, it, expect, vi } from 'vitest';
import { processGalleryTags } from './gallery';
import type { ASTNode, FileData } from './utils';

// Mock fs module
vi.mock('fs', () => ({
	existsSync: vi.fn(() => true),
	readFileSync: vi.fn(() => '{"images": []}')
}));

import { existsSync, readFileSync } from 'fs';

describe('processGalleryTags', () => {

	it('transforms Gallery tag with src attribute', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery src="src/content/galleries/wedding.json" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		expect(tree.children![0].value).toBe('<Gallery gallery={weddingData} />');
		expect(file.data.scriptRequirements).toBeDefined();
		expect(file.data.scriptRequirements!.imports.size).toBe(2);
		expect(
			file.data.scriptRequirements!.imports.has(
				"import weddingData from '$lib/../content/galleries/wedding.json'"
			)
		).toBe(true);
		expect(
			file.data.scriptRequirements!.imports.has(
				"import Gallery from '$lib/components/gallery/gallery.svelte'"
			)
		).toBe(true);
	});

	it('generates correct variable name from src path', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery src="src/content/galleries/corporate-events.json" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		expect(tree.children![0].value).toBe('<Gallery gallery={corporateEventsData} />');
		expect(
			file.data.scriptRequirements!.imports.has(
				"import corporateEventsData from '$lib/../content/galleries/corporate-events.json'"
			)
		).toBe(true);
	});

	it('handles multiple Gallery tags', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery src="src/content/galleries/wedding.json" />'
				},
				{
					type: 'paragraph'
				},
				{
					type: 'html',
					value: '<Gallery src="src/content/galleries/birthday.json" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		expect(tree.children![0].value).toBe('<Gallery gallery={weddingData} />');
		expect(tree.children![2].value).toBe('<Gallery gallery={birthdayData} />');
		// Should have 3 imports: 2 data imports + 1 Gallery component imports
		expect(file.data.scriptRequirements!.imports.size).toBe(3);
	});

	it('removes Gallery tag without src attribute and logs error', () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		// Tag should be removed
		expect(tree.children).toHaveLength(0);
		expect(file.data.scriptRequirements).toBeUndefined();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Gallery tag missing src attribute, removing tag: <Gallery />'
		);

		consoleErrorSpy.mockRestore();
	});

	it('does not register imports when no Gallery tags found', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<div>Hello</div>'
				},
				{
					type: 'paragraph'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		expect(file.data.scriptRequirements).toBeUndefined();
	});

	it('removes Gallery tag with invalid src format and logs error', () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery src="invalid" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		// Tag should be removed
		expect(tree.children).toHaveLength(0);
		expect(file.data.scriptRequirements).toBeUndefined();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Gallery tag has invalid src attribute (expected format: src/content/galleries/*.json), removing tag: <Gallery src="invalid" />'
		);

		consoleErrorSpy.mockRestore();
	});

	it('removes Gallery tag when file does not exist and logs error', () => {
		vi.mocked(existsSync).mockReturnValueOnce(false);
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery src="src/content/galleries/missing.json" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		// Tag should be removed
		expect(tree.children).toHaveLength(0);
		expect(file.data.scriptRequirements).toBeUndefined();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Gallery tag references non-existent file: src/content/galleries/missing.json, removing tag: <Gallery src="src/content/galleries/missing.json" />'
		);

		consoleErrorSpy.mockRestore();
	});

	it('removes Gallery tag when JSON is invalid and logs error', () => {
		vi.mocked(readFileSync).mockReturnValueOnce('{ invalid json }');
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery src="src/content/galleries/invalid.json" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGalleryTags(tree, file);

		// Tag should be removed
		expect(tree.children).toHaveLength(0);
		expect(file.data.scriptRequirements).toBeUndefined();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				'Gallery tag references invalid JSON file: src/content/galleries/invalid.json'
			)
		);

		consoleErrorSpy.mockRestore();
	});
});
