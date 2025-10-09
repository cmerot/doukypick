import { describe, it, expect } from 'vitest';
import { processImageTags } from './image';
import type { ASTNode, FileData } from './utils';

describe('processImageTags', () => {
	it('registers import when Image tag is found', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<Image src="test.jpg" alt="Test" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processImageTags(tree, file);

		expect(file.data.scriptRequirements).toBeDefined();
		expect(
			file.data.scriptRequirements!.imports.has(
				'import Image from "$lib/svx-wrappers/image.svelte"'
			)
		).toBe(true);
	});

	it('does not register import when no Image tag is found', () => {
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

		processImageTags(tree, file);

		expect(file.data.scriptRequirements).toBeUndefined();
	});
});
