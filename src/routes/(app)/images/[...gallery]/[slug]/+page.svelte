<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import FullscreenCarousel from '$lib/components/gallery/fullscreen-carousel.svelte';
	import { goto, replaceState } from '$app/navigation';
	import { getAspectRatio } from '$lib/components/gallery/utils';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import GridIcon from '@lucide/svelte/icons/grid-2x2';

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
${JSON.stringify(
	{
		'@context': 'https://schema.org',
		'@type': ['VisualArtwork', 'ImageObject'],
		name: data.currentPhoto.title,
		description: data.meta.description,
		url: page.url.href,
		image: data.meta.ogImage,
		contentUrl: data.currentPhoto.src,
		encodingFormat: data.currentPhoto.src.match(/\.(jpg|jpeg|png|webp|avif)$/i)?.[0]
			? `image/${data.currentPhoto.src.match(/\.(jpg|jpeg|png|webp|avif)$/i)![1].replace('jpg', 'jpeg')}`
			: 'image/jpeg',
		creator: {
			'@type': 'Person',
			name: 'Doukypick',
			url: page.url.origin
		},
		copyrightHolder: {
			'@type': 'Person',
			name: 'Doukypick'
		},
		artMedium: 'Tatouage',
		isPartOf: {
			'@type': 'Collection',
			name: data.gallery.title,
			description: data.gallery.description
		}
	},
	null,
	2
)}
	</script>`}
</svelte:head>
<header>
	<PageTitle>{data.currentPhoto.title}</PageTitle>
	<PageSubtitle>{data.currentPhoto.description}</PageSubtitle>
</header>
<main>
	<div
		class="flex h-full w-full items-center justify-center border-6 border-primary bg-primary"
		style="aspect-ratio: {getAspectRatio(data.gallery.aspectRatio, data.gallery.orientation)};"
	>
		<picture class="flex h-full w-full items-center justify-center">
			<img
				srcset={data.currentPhoto.srcset}
				alt={data.currentPhoto.alt}
				class="max-h-full max-w-full object-contain"
			/>
		</picture>
	</div>

	<section class="mt-8">
		<h2 class="text-xl font-semibold">{data.gallery.title}</h2>
		<p class="mt-2 text-muted-foreground">{data.gallery.description}</p>

		<nav class="mt-4 flex gap-4">
			{#if data.currentIndex > 0}
				<Button href={data.images[data.currentIndex - 1].href} variant="outline">
					<ChevronLeftIcon class="size-4" />
					Précédent
				</Button>
			{/if}
			{#if data.currentIndex < data.images.length - 1}
				<Button href={data.images[data.currentIndex + 1].href} variant="outline">
					Suivant
					<ChevronRightIcon class="size-4" />
				</Button>
			{/if}
			<Button href={data.gallery.closeUrl} variant="outline">
				<GridIcon class="size-4" />
				Retour à la galerie
			</Button>
		</nav>
	</section>
</main>
