<script lang="ts">
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import Gallery from '$lib/components/gallery/gallery.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import { tatouages } from '$content/galleries';
</script>

<svelte:head>
	<title>
		Tatouages - Doukypick, salon de tatouages Le P'tit Cap' à Bègles, en métropole Bordelaise
	</title>
	<meta
		name="description"
		content="Tatouages artistiques à Bègles près de Bordeaux. Portfolio, styles variés, hygiène irréprochable. Prends rendez-vous dans mon salon professionnel."
	/>
</svelte:head>

<header>
	<PageTitle>Tatouages</PageTitle>
	<PageSubtitle>Quelques réalisations récentes</PageSubtitle>
</header>

<main>
	<Gallery gallery={tatouages} aspectRatio="3/4" initialIndex={tatouages.initialIndex || 0} />
</main>
