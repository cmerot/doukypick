/**
 * Remark plugin that aggregates all script requirements and injects them into the document
 * This should run AFTER all other transformation plugins
 */

import { type ASTNode, type FileData, getFrontmatterInfo, findScriptTagIndex } from './utils.ts';

/**
 * Extracts existing imports and props init from a script tag
 */
export function extractExistingScriptContent(existingScript: string): {
	imports: string[];
	propsInit: string[];
	otherContent: string;
} {
	const scriptMatch = existingScript.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	if (!scriptMatch) return { imports: [], propsInit: [], otherContent: '' };

	const scriptContent = scriptMatch[1];
	const lines = scriptContent.split('\n');

	const imports: string[] = [];
	const propsInit: string[] = [];
	const otherLines: string[] = [];

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (trimmed.startsWith('import ')) {
			imports.push(trimmed);
		} else if (trimmed.includes('$props()')) {
			propsInit.push(trimmed);
		} else if (trimmed.length > 0) {
			otherLines.push(line);
		}
	});

	return {
		imports,
		propsInit,
		otherContent: otherLines.join('\n')
	};
}

/**
 * Creates a new script tag with aggregated imports and requirements
 */
export function createAggregatedScriptTag(
	registeredImports: Set<string>,
	registeredPropsInit: Set<string>,
	existingImports: string[] = [],
	existingPropsInit: string[] = [],
	otherContent: string = ''
): ASTNode {
	// Combine and deduplicate imports
	const allImports = new Set([...existingImports, ...Array.from(registeredImports)]);

	// Combine and deduplicate props initialization
	const allPropsInit = new Set([...existingPropsInit, ...Array.from(registeredPropsInit)]);

	// Build script content
	const imports = Array.from(allImports)
		.map((imp) => `\t${imp};`)
		.join('\n');
	const propsInit = Array.from(allPropsInit)
		.map((prop) => `\t${prop};`)
		.join('\n');

	// Format sections
	const sections = [imports, propsInit, otherContent.trim()].filter((s) => s.length > 0);

	const scriptContent = sections.join('\n\n');
	return {
		type: 'html',
		value: `
<script lang="ts">
${scriptContent}
</script>
`
	};
}

/**
 * Injects or updates script tag with aggregated requirements
 */
function injectAggregatedScriptTag(
	tree: ASTNode,
	registeredImports: Set<string>,
	registeredPropsInit: Set<string>,
	scriptTagIndex: number,
	frontmatterIndex: number
): void {
	if (!tree.children) return;

	let existingImports: string[] = [];
	let existingPropsInit: string[] = [];
	let otherContent = '';

	if (scriptTagIndex !== -1) {
		// Extract existing script content
		const existingScript = tree.children[scriptTagIndex].value;
		if (existingScript) {
			const extracted = extractExistingScriptContent(existingScript);
			existingImports = extracted.imports;
			existingPropsInit = extracted.propsInit;
			otherContent = extracted.otherContent;
		}

		// Replace existing script tag
		tree.children[scriptTagIndex] = createAggregatedScriptTag(
			registeredImports,
			registeredPropsInit,
			existingImports,
			existingPropsInit,
			otherContent
		);
	} else {
		// Create new script tag
		const insertIndex = frontmatterIndex >= 0 ? frontmatterIndex + 1 : 0;
		tree.children.splice(
			insertIndex,
			0,
			createAggregatedScriptTag(registeredImports, registeredPropsInit)
		);
	}
}

export default function remarkScriptAggregator() {
	return (tree: ASTNode, file: { data: FileData }) => {
		const scriptRequirements = file.data.scriptRequirements;

		// If no requirements were registered, nothing to do
		if (
			!scriptRequirements ||
			(scriptRequirements.imports.size === 0 && scriptRequirements.propsInit.size === 0)
		) {
			return;
		}

		const { frontmatterIndex } = getFrontmatterInfo(tree);
		const scriptTagIndex = findScriptTagIndex(tree);

		injectAggregatedScriptTag(
			tree,
			scriptRequirements.imports,
			scriptRequirements.propsInit,
			scriptTagIndex,
			frontmatterIndex
		);
	};
}
