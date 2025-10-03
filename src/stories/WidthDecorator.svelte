<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="m-auto max-w-xl bg-background p-20">
	{@render children()}
</div>
