<script lang="ts">
	import ThemeSelector from './theme-selector.svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import BuildInfo from './build-info.svelte';

	// Props
	interface Props {
		class?: string;
		children?: Snippet;
	}

	const { children, class: className }: Props = $props();
</script>

<footer class={cn('py-8', className)}>
	{#if children}
		<div class="mb-4">
			{@render children()}
		</div>
		<hr class="my-8" />
	{/if}
	<div class="flex">
		<ThemeSelector />
		<BuildInfo class="ml-auto" />
	</div>
</footer>
