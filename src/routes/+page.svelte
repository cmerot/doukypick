<script lang="ts">
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import Gallery from '$lib/components/gallery/gallery.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Tatouages - Doukypick</title>
	<meta
		name="description"
		content="Tatouages artistiques à Bègles près de Bordeaux. Portfolio, styles variés, hygiène irréprochable. Prenez rendez-vous dans mon salon professionnel."
	/>
</svelte:head>

<header>
	<PageTitle>Tatouages</PageTitle>
	<PageSubtitle>Quelques réalisations récentes</PageSubtitle>
</header>

<main>
	<Gallery
		gallery={data.gallery}
		aspectRatio="3/4"
		initialIndex={data.gallery.initialIndex || 0}
	/>
</main>
