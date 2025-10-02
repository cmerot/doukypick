<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="m-auto max-w-xl border-2 border-dashed border-gray-400 p-4">
	{@render children()}
</div>
