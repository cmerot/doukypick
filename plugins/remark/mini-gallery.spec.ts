import { describe, it, expect } from 'vitest';
import { processMiniGalleryTags } from './mini-gallery';
import type { ASTNode, FileData } from './utils';

describe('processMiniGalleryTags', () => {
	it('registers import when MiniGallery tag is found', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<MiniGallery images={someImages} />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processMiniGalleryTags(tree, file);

		expect(file.data.scriptRequirements).toBeDefined();
		expect(
			file.data.scriptRequirements!.imports.has(
				'import MiniGallery from "$lib/components/gallery/mini-gallery.svelte"'
			)
		).toBe(true);
	});

	it('does not register import when no MiniGallery tag is found', () => {
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

		processMiniGalleryTags(tree, file);

		expect(file.data.scriptRequirements).toBeUndefined();
	});

	it('registers import when multiple MiniGallery tags are found', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<MiniGallery images={images1} />'
				},
				{
					type: 'paragraph'
				},
				{
					type: 'html',
					value: '<MiniGallery images={images2} />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processMiniGalleryTags(tree, file);

		expect(file.data.scriptRequirements).toBeDefined();
		expect(
			file.data.scriptRequirements!.imports.has(
				'import MiniGallery from "$lib/components/gallery/mini-gallery.svelte"'
			)
		).toBe(true);
	});

	it('does not register import for similar but different tags', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Gallery images={images} />'
				},
				{
					type: 'html',
					value: '<Image src="test.jpg" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processMiniGalleryTags(tree, file);

		expect(file.data.scriptRequirements).toBeUndefined();
	});

	it('registers import when MiniGallery is mixed with other content', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'paragraph'
				},
				{
					type: 'html',
					value: '<div>Some content</div>'
				},
				{
					type: 'html',
					value: '<MiniGallery images={photos} />'
				},
				{
					type: 'html',
					value: '<Image src="test.jpg" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processMiniGalleryTags(tree, file);

		expect(file.data.scriptRequirements).toBeDefined();
		expect(
			file.data.scriptRequirements!.imports.has(
				'import MiniGallery from "$lib/components/gallery/mini-gallery.svelte"'
			)
		).toBe(true);
	});
});
