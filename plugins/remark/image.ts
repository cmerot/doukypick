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
export function processImageTags(tree: ASTNode, file: { data: FileData }): void {
	const hasImage = hasMatchingChild(tree, (child) => isHtmlTag(child, 'Image'));

	// Register script requirements if we found Image tags
	if (hasImage) {
		registerScriptRequirements(file, [`import Image from "$lib/svx-wrappers/image.svelte"`]);
	}
}

export default function remarkImage() {
	return (tree: ASTNode, file: { data: FileData }) => {
		processImageTags(tree, file);
	};
}
