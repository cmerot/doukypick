<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { LayoutData } from './$types';
	import HeaderAdmin from '$lib/components/header/header-admin.svelte';
	import { fade } from 'svelte/transition';
	import ThemeSelector from '$lib/components/theme-selector.svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	async function handleLogout() {
		try {
			await fetch('/api/admin/logout', {
				method: 'POST'
			});
			await invalidateAll(); // Refresh all server data to clear authentication state
		} catch (e) {
			console.error('Logout error:', e);
		}
	}
</script>

<div class="relative flex min-h-screen flex-col">
	<div class="container mx-auto max-w-4xl">
		<HeaderAdmin isAuthenticated={data.isAuthenticated} />
		{#key data.pathname}
			<main
				class="px-4 py-8 sm:px-4 md:px-20"
				in:fade={{ duration: 150, delay: 150 }}
				out:fade={{ duration: 150 }}
			>
				{@render children()}
			</main>
		{/key}
	</div>

	<footer class="mt-auto border-t bg-muted py-8">
		<div class="mx-auto px-4 sm:max-w-2xl">
			<ThemeSelector />
		</div>
	</footer>
</div>
