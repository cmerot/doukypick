<script lang="ts">
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { metadata, component: Component, ...otherData } = data;

	const { title, subtitle, description } = metadata;
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
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
