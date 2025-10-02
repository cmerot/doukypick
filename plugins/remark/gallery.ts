/**
 * Remark plugin that transforms Gallery tags and registers script requirements
 */

import { existsSync, readFileSync } from 'fs';
import {
	type ASTNode,
	type FileData,
	registerScriptRequirements,
	isHtmlTag,
	extractAttribute
} from './utils.ts';

/**
 * Processes Gallery tags in the AST and registers script requirements
 */
export function processGalleryTags(tree: ASTNode, file: { data: FileData }): void {
	if (!tree.children) return;

	const imports: string[] = [];
	const newChildren: ASTNode[] = [];

	tree.children.forEach((child) => {
		if (!isHtmlTag(child, 'Gallery')) {
			newChildren.push(child);
			return;
		}

		const src = extractAttribute(child.value!, 'src');
		if (!src) {
			console.error(`Gallery tag missing src attribute, removing tag: ${child.value}`);
			return;
		}

		// Validate src format
		if (!src.startsWith('src/content/galleries/') || !src.endsWith('.json')) {
			console.error(
				`Gallery tag has invalid src attribute (expected format: src/content/galleries/*.json), removing tag: ${child.value}`
			);
			return;
		}

		// Check if file exists
		if (!existsSync(src)) {
			console.error(
				`Gallery tag references non-existent file: ${src}, removing tag: ${child.value}`
			);
			return;
		}

		// Validate JSON structure
		try {
			const content = readFileSync(src, 'utf-8');
			JSON.parse(content);
		} catch (error) {
			console.error(
				`Gallery tag references invalid JSON file: ${src}, error: ${error instanceof Error ? error.message : String(error)}, removing tag: ${child.value}`
			);
			return;
		}

		const importPath = src.replace('src/content/galleries/', '$lib/../content/galleries/');
		const fileName = src.split('/').pop()?.replace('.json', '') || 'gallery';
		// Convert kebab-case to camelCase for valid JavaScript variable names
		const varName = fileName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

		imports.push(`import ${varName}Data from '${importPath}'`);
		imports.push(`import Gallery from '$lib/components/gallery/gallery.svelte'`);

		child.value = `<Gallery gallery={${varName}Data} />`;
		newChildren.push(child);
	});

	tree.children = newChildren;

	if (imports.length > 0) {
		registerScriptRequirements(file, imports);
	}
}

export default function remarkGallery() {
	return (tree: ASTNode, file: { data: FileData }) => {
		processGalleryTags(tree, file);
	};
}
