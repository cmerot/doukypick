import { describe, it, expect } from 'vitest';
import { processGoogleReviewsTags } from './google-reviews';
import type { ASTNode, FileData } from './utils';

describe('processGoogleReviewsTags', () => {
	it('transforms GoogleReviews tag without title', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<GoogleReviews />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGoogleReviewsTags(tree, file);

		expect(tree.children![0].value).toBe(
			'<GoogleReviews data={data.googleReviews} showOverallRating={true} maxReviews={3} className="max-w-6xl mx-auto" />'
		);
		expect(file.data.scriptRequirements).toBeDefined();
		expect(file.data.scriptRequirements!.imports.size).toBe(1);
		expect(
			file.data.scriptRequirements!.imports.has(
				'import GoogleReviews from "$lib/components/google-reviews.svelte"'
			)
		).toBe(true);
		expect(file.data.scriptRequirements!.propsInit.size).toBe(1);
		expect(file.data.scriptRequirements!.propsInit.has('const {data} = $props()')).toBe(true);
	});

	it('transforms GoogleReviews tag with title attribute', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<GoogleReviews title="Customer Reviews" />'
				}
			]
		};
		const file: { data: FileData } = { data: {} };

		processGoogleReviewsTags(tree, file);

		expect(tree.children![0].value).toContain('title="Customer Reviews"');
		expect(tree.children![0].value).toBe(
			'<GoogleReviews data={data.googleReviews} showOverallRating={true} maxReviews={3} className="max-w-6xl mx-auto" title="Customer Reviews" />'
		);
	});

	it('does not register imports when no GoogleReviews tags found', () => {
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

		processGoogleReviewsTags(tree, file);

		expect(file.data.scriptRequirements).toBeUndefined();
	});
});
