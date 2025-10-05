<script lang="ts">
	import Header from '$lib/components/header/header.svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import Footer from '$lib/components/footer.svelte';
	import AdminHeader from '$lib/components/header/admin.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="flex min-h-screen flex-col">
	<Header class="mx-auto w-full max-w-4xl [padding-inline:clamp(.5rem,4vw,1rem)] pt-3 md:pt-6">
		<AdminHeader isAuthenticated={data.isAuthenticated} />
	</Header>

	{#key data.pathname}
		<main
			class="mx-auto my-6 w-full max-w-4xl flex-grow [padding-inline:clamp(.5rem,4vw,5rem)] md:my-12"
			in:fade={{ duration: 150, delay: 150 }}
			out:fade={{ duration: 150 }}
		>
			{@render children()}
		</main>
	{/key}

	<div class="bg-muted">
		<Footer class="mx-auto max-w-4xl [padding-inline:clamp(.5rem,4vw,5rem)] py-4" />
	</div>
</div>
