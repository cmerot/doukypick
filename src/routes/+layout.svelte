<script lang="ts">
	import { dev } from '$app/environment';
	import TailwindIndicator from '$lib/components/tailwind-indicator.svelte';
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
<ModeWatcher />
<Toaster />
{#if dev}
	<TailwindIndicator />
{/if}
