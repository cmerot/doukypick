<script lang="ts">
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import PageSubtitle from './page-title/page-subtitle.svelte';

	// These props come from the frontmatter
	let { children, title, description, page_title, page_subtitle } = $props();
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

<main>
	<article class="prose max-w-full">
		{@render children()}
	</article>
</main>
