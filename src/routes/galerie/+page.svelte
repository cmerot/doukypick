<script lang="ts">
	import type { PageData } from './$types';
	import Gallery from '$lib/components/gallery.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Galerie</title>
</svelte:head>

<Gallery images={data.images} urlPersistence={true} />
