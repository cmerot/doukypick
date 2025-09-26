<script lang="ts">
	import { dev } from '$app/environment';
	import TailwindIndicator from '$lib/components/tailwind-indicator.svelte';
	import '../app.css';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}

{#if dev}
	<TailwindIndicator />
{/if}
