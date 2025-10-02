/**
 * Shared utilities for remark plugins
 */

export interface ASTNode {
	type: string;
	value?: string;
	children?: ASTNode[];
}

export interface FileData {
	scriptRequirements?: {
		imports: Set<string>;
		propsInit: Set<string>;
	};
}

/**
 * Extracts frontmatter information from the AST
 */
export function getFrontmatterInfo(tree: ASTNode): {
	hasFrontmatter: boolean;
	frontmatterIndex: number;
} {
	const hasFrontmatter = tree.children?.[0]?.type === 'yaml';
	return {
		hasFrontmatter,
		frontmatterIndex: hasFrontmatter ? 0 : -1
	};
}

/**
 * Finds the index of an existing script tag in the AST
 */
export function findScriptTagIndex(tree: ASTNode): number {
	return (
		tree.children?.findIndex(
			(child) => child.type === 'html' && child.value?.includes('<script')
		) ?? -1
	);
}

/**
 * Registers script requirements for a component
 */
export function registerScriptRequirements(
	file: { data: FileData },
	imports: string[],
	propsInit?: string[]
): void {
	if (!file.data.scriptRequirements) {
		file.data.scriptRequirements = {
			imports: new Set(),
			propsInit: new Set()
		};
	}

	imports.forEach((imp) => file.data.scriptRequirements!.imports.add(imp));
	propsInit?.forEach((prop) => file.data.scriptRequirements!.propsInit.add(prop));
}

/**
 * Checks if any child node matches a predicate
 */
export function hasMatchingChild(tree: ASTNode, predicate: (child: ASTNode) => boolean): boolean {
	return tree.children?.some(predicate) ?? false;
}

/**
 * Checks if a node is an HTML tag containing the specified text
 */
export function isHtmlTag(node: ASTNode, tagName: string): boolean {
	return node.type === 'html' && (node.value?.includes(`<${tagName}`) ?? false);
}

/**
 * Extracts an attribute value from an HTML tag string
 */
export function extractAttribute(htmlString: string, attributeName: string): string | null {
	const match = htmlString.match(new RegExp(`${attributeName}=["']([^"']+)["']`));
	return match ? match[1] : null;
}

/**
 * Extracts script content from a script tag
 */
export function extractScriptContent(scriptTag: string): string | null {
	const match = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/);
	return match ? match[1] : null;
}

/**
 * Creates a script tag with the given content
 */
export function createScriptTag(content: string): ASTNode {
	return {
		type: 'html',
		value: `
<script lang="ts">
${content}
</script>
`
	};
}

/**
 * Injects or updates a script tag in the AST
 */
export function injectOrUpdateScriptTag(
	tree: ASTNode,
	newContent: string,
	frontmatterIndex: number,
	merger?: (existingContent: string, newContent: string) => string
): void {
	if (!tree.children) return;

	const scriptTagIndex = findScriptTagIndex(tree);

	if (scriptTagIndex !== -1) {
		// Update existing script tag
		const existingScript = tree.children[scriptTagIndex].value;
		if (existingScript) {
			const existingContent = extractScriptContent(existingScript) || '';
			const mergedContent = merger
				? merger(existingContent, newContent)
				: `${newContent}\n${existingContent}`;
			tree.children[scriptTagIndex] = createScriptTag(mergedContent);
		}
	} else {
		// Create new script tag
		const insertIndex = frontmatterIndex >= 0 ? frontmatterIndex + 1 : 0;
		tree.children.splice(insertIndex, 0, createScriptTag(newContent));
	}
}
