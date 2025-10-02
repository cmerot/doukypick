/**
 * Remark plugin that transforms GoogleReviews tags and registers script requirements
 */

import {
	type ASTNode,
	type FileData,
	registerScriptRequirements,
	isHtmlTag,
	extractAttribute
} from './utils.ts';

/**
 * Processes GoogleReviews tags in the AST and registers script requirements
 */
export function processGoogleReviewsTags(tree: ASTNode, file: { data: FileData }): void {
	let hasGoogleReviews = false;

	tree.children?.forEach((child) => {
		if (!isHtmlTag(child, 'GoogleReviews')) return;

		hasGoogleReviews = true;

		// Extract title attribute if present
		const title = extractAttribute(child.value!, 'title');
		const titleProp = title ? ` title="${title}"` : '';

		// Transform the tag to include all required props
		child.value = `<GoogleReviews data={data.googleReviews} showOverallRating={true} maxReviews={3} className="max-w-6xl mx-auto"${titleProp} />`;
	});

	// Register script requirements if we found GoogleReviews tags
	if (hasGoogleReviews) {
		registerScriptRequirements(
			file,
			[`import GoogleReviews from "$lib/components/google-reviews.svelte"`],
			[`const {data} = $props()`]
		);
	}
}

export default function remarkGoogleReviews() {
	return (tree: ASTNode, file: { data: FileData }) => {
		processGoogleReviewsTags(tree, file);
	};
}
