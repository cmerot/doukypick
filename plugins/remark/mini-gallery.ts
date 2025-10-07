/**
 * Remark plugin that checks for Image tags and registers script requirements
 */

import {
	type ASTNode,
	type FileData,
	registerScriptRequirements,
	hasMatchingChild,
	isHtmlTag
} from './utils.ts';

/**
 * Processes Image tags in the AST and registers script requirements
 */
export function processMiniGalleryTags(tree: ASTNode, file: { data: FileData }): void {
	const hasImage = hasMatchingChild(tree, (child) => isHtmlTag(child, 'MiniGallery'));

	// Register script requirements if we found Image tags
	if (hasImage) {
		registerScriptRequirements(file, [
			`import MiniGallery from "$lib/components/gallery/mini-gallery.svelte"`
		]);
	}
}

export default function remarkMiniGallery() {
	return (tree: ASTNode, file: { data: FileData }) => {
		processMiniGalleryTags(tree, file);
	};
}
