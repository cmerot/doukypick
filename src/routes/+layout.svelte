<script lang="ts">
	import { dev } from '$app/environment';
	import { PUBLIC_ENABLE_PLAUSIBLE } from '$env/static/public';
	import TailwindIndicator from '$lib/components/tailwind-indicator.svelte';
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	{#if PUBLIC_ENABLE_PLAUSIBLE === 'true'}
		<script defer data-domain="doukypick.fr" src="https://plausible.io/js/script.js"></script>
	{/if}
</svelte:head>

{@render children()}
<ModeWatcher />
<Toaster />
{#if dev}
	<TailwindIndicator />
{/if}
