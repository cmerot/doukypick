<script lang="ts">
	import Gallery from '$lib/components/gallery.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Galerie</title>
	<meta name="description" content="Photos de tatouages" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-center text-3xl font-bold">Galerie</h1>

	<Gallery data={data.galleryData} />
</div>
