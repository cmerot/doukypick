<script lang="ts">
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import Gallery from '$lib/components/gallery/gallery.svelte';
	import tatouagesGallery from '$content/galleries/tatouages/gallery.json';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
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
		gallery={tatouagesGallery}
		aspectRatio="3/4"
		initialIndex={tatouagesGallery.initialIndex}
	/>
</main>
