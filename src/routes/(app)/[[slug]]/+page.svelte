<script lang="ts">
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { metadata, component: Component, ...otherData } = data;

	const { title, description, page_title, page_subtitle } = metadata;
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<header>
	<PageTitle>{page_title || title}</PageTitle>
	{#if page_subtitle}
		<PageSubtitle>{page_subtitle}</PageSubtitle>
	{/if}
</header>

<main class="prose max-w-full">
	<Component data={otherData} />
</main>
