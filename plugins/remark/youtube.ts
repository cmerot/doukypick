/**
 * Remark plugin that checks for Youtube tags and registers script requirements
 */

import {
	type ASTNode,
	type FileData,
	registerScriptRequirements,
	hasMatchingChild,
	isHtmlTag
} from './utils.ts';

/**
 * Processes Youtube tags in the AST and registers script requirements
 */
export function processYoutubeTags(tree: ASTNode, file: { data: FileData }): void {
	const hasYoutube = hasMatchingChild(tree, (child) => isHtmlTag(child, 'Youtube'));

	// Register script requirements if we found Youtube tags
	if (hasYoutube) {
		registerScriptRequirements(file, [`import Youtube from "$lib/svx-wrappers/youtube.svelte"`]);
	}
}

export default function remarkYoutube() {
	return (tree: ASTNode, file: { data: FileData }) => {
		processYoutubeTags(tree, file);
	};
}
