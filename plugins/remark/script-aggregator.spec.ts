import { describe, it, expect } from 'vitest';
import { extractExistingScriptContent, createAggregatedScriptTag } from './script-aggregator.ts';

describe('extractExistingScriptContent', () => {
	it('returns empty arrays for empty string', () => {
		const result = extractExistingScriptContent('');
		expect(result).toEqual({
			imports: [],
			propsInit: [],
			otherContent: ''
		});
	});

	it('returns empty arrays for non-script content', () => {
		const result = extractExistingScriptContent('<div>Hello</div>');
		expect(result).toEqual({
			imports: [],
			propsInit: [],
			otherContent: ''
		});
	});

	it('extracts imports from script tag', () => {
		const script = `<script lang="ts">
	import { foo } from 'bar'
	import type { Baz } from 'qux'
</script>`;
		const result = extractExistingScriptContent(script);
		expect(result.imports).toEqual(["import { foo } from 'bar'", "import type { Baz } from 'qux'"]);
		expect(result.propsInit).toEqual([]);
		expect(result.otherContent).toBe('');
	});

	it('extracts props initialization from script tag', () => {
		const script = `<script lang="ts">
	let { title } = $props()
	const { description = 'default' } = $props()
</script>`;
		const result = extractExistingScriptContent(script);
		expect(result.imports).toEqual([]);
		expect(result.propsInit).toEqual([
			'let { title } = $props()',
			"const { description = 'default' } = $props()"
		]);
		expect(result.otherContent).toBe('');
	});

	it('extracts other content from script tag', () => {
		const script = `<script lang="ts">
	const count = 0
	function increment() {
		count++
	}
</script>`;
		const result = extractExistingScriptContent(script);
		expect(result.imports).toEqual([]);
		expect(result.propsInit).toEqual([]);
		expect(result.otherContent).toContain('const count = 0');
		expect(result.otherContent).toContain('function increment()');
	});

	it('extracts all types of content together', () => {
		const script = `<script lang="ts">
	import { writable } from 'svelte/store'
	import type { User } from './types'

	let { user } = $props()
	const { settings = {} } = $props()

	const store = writable(0)
	function doSomething() {
		return true
	}
</script>`;
		const result = extractExistingScriptContent(script);
		expect(result.imports).toEqual([
			"import { writable } from 'svelte/store'",
			"import type { User } from './types'"
		]);
		expect(result.propsInit).toEqual([
			'let { user } = $props()',
			'const { settings = {} } = $props()'
		]);
		expect(result.otherContent).toContain('const store = writable(0)');
		expect(result.otherContent).toContain('function doSomething()');
	});

	it('handles script tag without lang attribute', () => {
		const script = `<script>
	import { foo } from 'bar'
</script>`;
		const result = extractExistingScriptContent(script);
		expect(result.imports).toEqual(["import { foo } from 'bar'"]);
	});

	it('ignores empty lines', () => {
		const script = `<script lang="ts">
	import { foo } from 'bar'

	const x = 1
</script>`;
		const result = extractExistingScriptContent(script);
		expect(result.imports).toEqual(["import { foo } from 'bar'"]);
		expect(result.otherContent).toBe('\tconst x = 1');
	});
});

describe('createAggregatedScriptTag', () => {
	it('creates script tag with only registered imports', () => {
		const imports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set<string>();
		const result = createAggregatedScriptTag(imports, propsInit);

		expect(result.type).toBe('html');
		expect(result.value).toContain('<script lang="ts">');
		expect(result.value).toContain("\timport { foo } from 'bar';");
		expect(result.value).toContain('</script>');
	});

	it('creates script tag with only registered props', () => {
		const imports = new Set<string>();
		const propsInit = new Set(['let { title } = $props()']);
		const result = createAggregatedScriptTag(imports, propsInit);

		expect(result.type).toBe('html');
		expect(result.value).toContain('let { title } = $props();');
	});

	it('creates script tag with both imports and props', () => {
		const imports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set(['let { title } = $props()']);
		const result = createAggregatedScriptTag(imports, propsInit);

		expect(result.value).toContain("import { foo } from 'bar';");
		expect(result.value).toContain('let { title } = $props();');
		// Imports should come before props
		const importIndex = result.value!.indexOf('import');
		const propsIndex = result.value!.indexOf('$props');
		expect(importIndex).toBeLessThan(propsIndex);
	});

	it('merges registered and existing imports', () => {
		const registeredImports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set<string>();
		const existingImports = ["import { baz } from 'qux'"];

		const result = createAggregatedScriptTag(registeredImports, propsInit, existingImports);

		expect(result.value).toContain("import { foo } from 'bar';");
		expect(result.value).toContain("import { baz } from 'qux';");
	});

	it('deduplicates identical imports', () => {
		const registeredImports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set<string>();
		const existingImports = ["import { foo } from 'bar'"];

		const result = createAggregatedScriptTag(registeredImports, propsInit, existingImports);

		// Should only appear once
		const matches = result.value?.match(/import { foo } from 'bar'/g);
		expect(matches).toHaveLength(1);
	});

	it('deduplicates identical props', () => {
		const imports = new Set<string>();
		const registeredProps = new Set(['let { title } = $props()']);
		const existingProps = ['let { title } = $props()'];

		const result = createAggregatedScriptTag(imports, registeredProps, [], existingProps);

		// Should only appear once
		const matches = result.value?.match(/let { title } = \$props\(\)/g);
		expect(matches).toHaveLength(1);
	});

	it('preserves other content', () => {
		const imports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set<string>();
		const otherContent = 'const x = 1\nfunction test() {}';

		const result = createAggregatedScriptTag(imports, propsInit, [], [], otherContent);

		expect(result.value).toContain('const x = 1');
		expect(result.value).toContain('function test() {}');
	});

	it('orders sections correctly: imports, props, other content', () => {
		const imports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set(['let { title } = $props()']);
		const otherContent = 'const x = 1';

		const result = createAggregatedScriptTag(imports, propsInit, [], [], otherContent);

		const importIndex = result.value!.indexOf('import');
		const propsIndex = result.value!.indexOf('$props');
		const otherIndex = result.value!.indexOf('const x');

		expect(importIndex).toBeLessThan(propsIndex);
		expect(propsIndex).toBeLessThan(otherIndex);
	});

	it('handles empty sets gracefully', () => {
		const imports = new Set<string>();
		const propsInit = new Set<string>();

		const result = createAggregatedScriptTag(imports, propsInit);

		expect(result.type).toBe('html');
		expect(result.value).toContain('<script lang="ts">');
		expect(result.value).toContain('</script>');
	});

	it('separates sections with blank lines', () => {
		const imports = new Set(["import { foo } from 'bar'"]);
		const propsInit = new Set(['let { title } = $props()']);
		const otherContent = 'const x = 1';

		const result = createAggregatedScriptTag(imports, propsInit, [], [], otherContent);

		// Should have blank lines between sections
		expect(result.value).toContain(';\n\n');
	});
});
