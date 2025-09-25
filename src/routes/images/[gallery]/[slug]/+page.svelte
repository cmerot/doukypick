<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import FullscreenCarousel from '$lib/components/gallery/fullscreen-carousel.svelte';
	import { goto, replaceState } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	// Navigation functions
	function handleFullscreenSelect(url: string, index: number) {
		replaceState(url, {});
	}

	function handleFullscreenClose() {
		goto(data.gallery.closeUrl);
	}
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="image" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:image" content={data.meta.ogImage} />
	<meta property="og:image:alt" content={data.meta.ogImageAlt} />
	<meta property="og:url" content={page.url.href} />

	<!-- Additional SEO -->
	<link rel="canonical" href={page.url.href} />

	<!-- Schema.org structured data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "VisualArtwork",
		"name": "${data.currentPhoto.title}",
		"description": "${data.meta.description}",
		"image": "${data.meta.ogImage}",
		"creator": {
			"@type": "Person",
			"name": "Doukypick"
		},
		"artMedium": "Tatouage",
		"isPartOf": {
			"@type": "Collection",
			"name": "${data.gallery.title}",
			"description": "${data.gallery.description}"
		}
	}
	</script>`}
</svelte:head>
<header class="sr-only">
	<PageTitle>{data.currentPhoto.title}</PageTitle>
	<PageSubtitle>{data.currentPhoto.description}</PageSubtitle>
</header>

<FullscreenCarousel
	images={data.images}
	currentIndex={data.currentIndex}
	onClose={handleFullscreenClose}
	onSelect={handleFullscreenSelect}
	open={true}
/>
