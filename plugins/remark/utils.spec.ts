import { describe, it, expect } from 'vitest';
import {
	type ASTNode,
	type FileData,
	getFrontmatterInfo,
	findScriptTagIndex,
	registerScriptRequirements,
	hasMatchingChild,
	isHtmlTag,
	extractAttribute,
	extractScriptContent,
	createScriptTag,
	injectOrUpdateScriptTag
} from './utils';

describe('getFrontmatterInfo', () => {
	it('returns hasFrontmatter=true when first child is yaml', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'yaml', value: 'title: Test' }]
		};
		const result = getFrontmatterInfo(tree);
		expect(result.hasFrontmatter).toBe(true);
		expect(result.frontmatterIndex).toBe(0);
	});

	it('returns hasFrontmatter=false when first child is not yaml', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'paragraph' }]
		};
		const result = getFrontmatterInfo(tree);
		expect(result.hasFrontmatter).toBe(false);
		expect(result.frontmatterIndex).toBe(-1);
	});

	it('returns hasFrontmatter=false when no children', () => {
		const tree: ASTNode = {
			type: 'root',
			children: []
		};
		const result = getFrontmatterInfo(tree);
		expect(result.hasFrontmatter).toBe(false);
		expect(result.frontmatterIndex).toBe(-1);
	});

	it('returns hasFrontmatter=false when children is undefined', () => {
		const tree: ASTNode = {
			type: 'root'
		};
		const result = getFrontmatterInfo(tree);
		expect(result.hasFrontmatter).toBe(false);
		expect(result.frontmatterIndex).toBe(-1);
	});
});

describe('findScriptTagIndex', () => {
	it('finds script tag at index 0', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{ type: 'html', value: '<script>const x = 1</script>' },
				{ type: 'paragraph' }
			]
		};
		expect(findScriptTagIndex(tree)).toBe(0);
	});

	it('finds script tag at later index', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{ type: 'paragraph' },
				{ type: 'paragraph' },
				{ type: 'html', value: '<script lang="ts">const x = 1</script>' }
			]
		};
		expect(findScriptTagIndex(tree)).toBe(2);
	});

	it('returns -1 when no script tag exists', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'paragraph' }, { type: 'html', value: '<div>Hello</div>' }]
		};
		expect(findScriptTagIndex(tree)).toBe(-1);
	});

	it('returns -1 when children is undefined', () => {
		const tree: ASTNode = {
			type: 'root'
		};
		expect(findScriptTagIndex(tree)).toBe(-1);
	});

	it('returns -1 when children is empty', () => {
		const tree: ASTNode = {
			type: 'root',
			children: []
		};
		expect(findScriptTagIndex(tree)).toBe(-1);
	});
});

describe('registerScriptRequirements', () => {
	it('initializes scriptRequirements if not present', () => {
		const file: { data: FileData } = { data: {} };
		registerScriptRequirements(file, ["import { foo } from 'bar'"]);

		expect(file.data.scriptRequirements).toBeDefined();
		expect(file.data.scriptRequirements!.imports.size).toBe(1);
		expect(file.data.scriptRequirements!.imports.has("import { foo } from 'bar'")).toBe(true);
	});

	it('adds imports to existing scriptRequirements', () => {
		const file: { data: FileData } = {
			data: {
				scriptRequirements: {
					imports: new Set(["import { existing } from 'existing'"]),
					propsInit: new Set()
				}
			}
		};
		registerScriptRequirements(file, ["import { foo } from 'bar'"]);

		expect(file.data.scriptRequirements!.imports.size).toBe(2);
		expect(file.data.scriptRequirements!.imports.has("import { foo } from 'bar'")).toBe(true);
		expect(file.data.scriptRequirements!.imports.has("import { existing } from 'existing'")).toBe(
			true
		);
	});

	it('adds multiple imports', () => {
		const file: { data: FileData } = { data: {} };
		registerScriptRequirements(file, [
			"import { foo } from 'bar'",
			"import { baz } from 'qux'"
		]);

		expect(file.data.scriptRequirements!.imports.size).toBe(2);
	});

	it('adds propsInit when provided', () => {
		const file: { data: FileData } = { data: {} };
		registerScriptRequirements(file, [], ['let { title } = $props()']);

		expect(file.data.scriptRequirements!.propsInit.size).toBe(1);
		expect(file.data.scriptRequirements!.propsInit.has('let { title } = $props()')).toBe(true);
	});

	it('adds both imports and propsInit', () => {
		const file: { data: FileData } = { data: {} };
		registerScriptRequirements(
			file,
			["import { foo } from 'bar'"],
			['let { title } = $props()']
		);

		expect(file.data.scriptRequirements!.imports.size).toBe(1);
		expect(file.data.scriptRequirements!.propsInit.size).toBe(1);
	});

	it('handles empty arrays', () => {
		const file: { data: FileData } = { data: {} };
		registerScriptRequirements(file, [], []);

		expect(file.data.scriptRequirements!.imports.size).toBe(0);
		expect(file.data.scriptRequirements!.propsInit.size).toBe(0);
	});
});

describe('hasMatchingChild', () => {
	it('returns true when predicate matches a child', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'paragraph' }, { type: 'html', value: '<div>Test</div>' }]
		};
		const result = hasMatchingChild(tree, (child) => child.type === 'html');
		expect(result).toBe(true);
	});

	it('returns false when predicate matches no children', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'paragraph' }, { type: 'text' }]
		};
		const result = hasMatchingChild(tree, (child) => child.type === 'html');
		expect(result).toBe(false);
	});

	it('returns false when children is undefined', () => {
		const tree: ASTNode = {
			type: 'root'
		};
		const result = hasMatchingChild(tree, (child) => child.type === 'html');
		expect(result).toBe(false);
	});

	it('returns false when children is empty', () => {
		const tree: ASTNode = {
			type: 'root',
			children: []
		};
		const result = hasMatchingChild(tree, (child) => child.type === 'html');
		expect(result).toBe(false);
	});

	it('uses custom predicate logic', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{ type: 'html', value: '<Image />' },
				{ type: 'html', value: '<Gallery />' }
			]
		};
		const result = hasMatchingChild(tree, (child) => child.value?.includes('Gallery') ?? false);
		expect(result).toBe(true);
	});
});

describe('isHtmlTag', () => {
	it('returns true for matching HTML tag', () => {
		const node: ASTNode = {
			type: 'html',
			value: '<Image src="test.jpg" />'
		};
		expect(isHtmlTag(node, 'Image')).toBe(true);
	});

	it('returns false for non-matching HTML tag', () => {
		const node: ASTNode = {
			type: 'html',
			value: '<Gallery />'
		};
		expect(isHtmlTag(node, 'Image')).toBe(false);
	});

	it('returns false for non-html type', () => {
		const node: ASTNode = {
			type: 'paragraph',
			value: '<Image />'
		};
		expect(isHtmlTag(node, 'Image')).toBe(false);
	});

	it('returns false when value is undefined', () => {
		const node: ASTNode = {
			type: 'html'
		};
		expect(isHtmlTag(node, 'Image')).toBe(false);
	});

	it('matches self-closing tags', () => {
		const node: ASTNode = {
			type: 'html',
			value: '<Image />'
		};
		expect(isHtmlTag(node, 'Image')).toBe(true);
	});

	it('matches opening tags', () => {
		const node: ASTNode = {
			type: 'html',
			value: '<Image>'
		};
		expect(isHtmlTag(node, 'Image')).toBe(true);
	});
});

describe('extractAttribute', () => {
	it('extracts attribute with double quotes', () => {
		const html = '<Image src="test.jpg" />';
		expect(extractAttribute(html, 'src')).toBe('test.jpg');
	});

	it('extracts attribute with single quotes', () => {
		const html = "<Image src='test.jpg' />";
		expect(extractAttribute(html, 'src')).toBe('test.jpg');
	});

	it('extracts attribute from complex HTML', () => {
		const html = '<Gallery src="galleries/wedding.json" title="Wedding Photos" />';
		expect(extractAttribute(html, 'title')).toBe('Wedding Photos');
	});

	it('returns null when attribute not found', () => {
		const html = '<Image />';
		expect(extractAttribute(html, 'src')).toBeNull();
	});

	it('returns null for empty string', () => {
		expect(extractAttribute('', 'src')).toBeNull();
	});

	it('handles attributes with special characters in value', () => {
		const html = '<Image alt="Hello, World!" />';
		expect(extractAttribute(html, 'alt')).toBe('Hello, World!');
	});
});

describe('extractScriptContent', () => {
	it('extracts content from basic script tag', () => {
		const script = '<script>const x = 1</script>';
		expect(extractScriptContent(script)).toBe('const x = 1');
	});

	it('extracts content from script tag with lang attribute', () => {
		const script = '<script lang="ts">const x: number = 1</script>';
		expect(extractScriptContent(script)).toBe('const x: number = 1');
	});

	it('extracts multiline content', () => {
		const script = `<script lang="ts">
	import { foo } from 'bar'
	const x = 1
</script>`;
		const content = extractScriptContent(script);
		expect(content).toContain("import { foo } from 'bar'");
		expect(content).toContain('const x = 1');
	});

	it('returns null for non-script content', () => {
		expect(extractScriptContent('<div>Hello</div>')).toBeNull();
	});

	it('returns null for empty string', () => {
		expect(extractScriptContent('')).toBeNull();
	});

	it('handles empty script tag', () => {
		expect(extractScriptContent('<script></script>')).toBe('');
	});
});

describe('createScriptTag', () => {
	it('creates script tag with content', () => {
		const result = createScriptTag('const x = 1');

		expect(result.type).toBe('html');
		expect(result.value).toContain('<script lang="ts">');
		expect(result.value).toContain('const x = 1');
		expect(result.value).toContain('</script>');
	});

	it('creates script tag with multiline content', () => {
		const content = `import { foo } from 'bar'\nconst x = 1`;
		const result = createScriptTag(content);

		expect(result.value).toContain("import { foo } from 'bar'");
		expect(result.value).toContain('const x = 1');
	});

	it('creates script tag with empty content', () => {
		const result = createScriptTag('');

		expect(result.type).toBe('html');
		expect(result.value).toContain('<script lang="ts">');
		expect(result.value).toContain('</script>');
	});
});

describe('injectOrUpdateScriptTag', () => {
	it('creates new script tag when none exists', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'paragraph' }]
		};
		injectOrUpdateScriptTag(tree, 'const x = 1', -1);

		expect(tree.children).toHaveLength(2);
		expect(tree.children![0].type).toBe('html');
		expect(tree.children![0].value).toContain('const x = 1');
	});

	it('creates new script tag after frontmatter', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [{ type: 'yaml', value: 'title: Test' }, { type: 'paragraph' }]
		};
		injectOrUpdateScriptTag(tree, 'const x = 1', 0);

		expect(tree.children).toHaveLength(3);
		expect(tree.children![1].type).toBe('html');
		expect(tree.children![1].value).toContain('const x = 1');
	});

	it('updates existing script tag with default merger', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<script lang="ts">\n\tconst existing = 1\n</script>'
				}
			]
		};
		injectOrUpdateScriptTag(tree, 'const new = 2', -1);

		expect(tree.children).toHaveLength(1);
		expect(tree.children![0].value).toContain('const new = 2');
		expect(tree.children![0].value).toContain('const existing = 1');
	});

	it('updates existing script tag with custom merger', () => {
		const tree: ASTNode = {
			type: 'root',
			children: [
				{
					type: 'html',
					value: '<script lang="ts">\n\tconst existing = 1\n</script>'
				}
			]
		};
		const customMerger = (existing: string, newContent: string) => {
			return `${existing}\n${newContent}`;
		};
		injectOrUpdateScriptTag(tree, 'const new = 2', -1, customMerger);

		expect(tree.children![0].value).toContain('const existing = 1');
		expect(tree.children![0].value).toContain('const new = 2');
	});

	it('does nothing when tree has no children', () => {
		const tree: ASTNode = {
			type: 'root'
		};
		injectOrUpdateScriptTag(tree, 'const x = 1', -1);

		expect(tree.children).toBeUndefined();
	});
});
