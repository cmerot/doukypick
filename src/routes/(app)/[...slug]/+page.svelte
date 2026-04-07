<script lang="ts">
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import type { PageData } from './$types';
	import siteSettings from '$content/settings/settings.json';

	let { data }: { data: PageData } = $props();

	const metadata = $derived(data.metadata);
	const Component = $derived(data.component);
	const otherData = $derived.by(() => {
		const { metadata, component, ...rest } = data;
		return rest;
	});

	const title = $derived(metadata.title);
	const subtitle = $derived(metadata.subtitle);
	const description = $derived(metadata.description);
</script>

<svelte:head>
	<title>{title} - {siteSettings.title}</title>
	{#if description}
		<meta name="description" content="{description} - {siteSettings.description}" />
	{:else}
		<meta name="description" content="{title} - {siteSettings.description}" />
	{/if}
</svelte:head>

<article class="contents">
	<header>
		<PageTitle>{title}</PageTitle>
		{#if subtitle}
			<PageSubtitle>{subtitle}</PageSubtitle>
		{/if}
	</header>

	<main class="prose max-w-full">
		<Component data={otherData} />
	</main>
</article>
