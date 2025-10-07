<script lang="ts">
	import { pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';

	import type { ImageData, Gallery } from './types';
	import { processImage } from './utils';
	import ImageCarousel from './image-carousel.svelte';
	import ThumbnailCarousel from './thumbnail-carousel.svelte';
	import FullscreenCarousel from './fullscreen-carousel.svelte';

	// Props
	let {
		gallery,
		aspectRatio = '4/3',
		initialIndex = 0
	}: {
		gallery: Gallery;
		aspectRatio?: string;
		initialIndex?: number;
	} = $props();

	// Derived data
	const images = $derived.by((): ImageData[] => {
		return gallery.images
			.filter((img) => img.published)
			.map((image, index) => processImage(image, gallery.slug, index));
	});

	// Gallery state
	let currentIndex = $state(initialIndex);

	// Navigation functions
	function handleSelect(index: number) {
		currentIndex = index;
	}

	// Navigation functions
	function handleFullscreenSelect(url: string, index: number) {
		currentIndex = index;
		replaceState(url, { isFullscreen: true, galleryId: gallery.slug });
	}

	function handleImageClick(e: MouseEvent, url: string, index: number): void {
		pushState(url, { isFullscreen: true, galleryId: gallery.slug });
	}

	function handleFullscreenClose() {
		history.back();
	}
</script>

<div class="not-prose mx-auto flex w-full flex-col">
	<!-- Main Photo Carousel -->
	<ImageCarousel
		{images}
		{currentIndex}
		{aspectRatio}
		onSelect={handleSelect}
		onClick={handleImageClick}
		class=""
	/>

	<!-- Thumbnail Carousel -->
	<ThumbnailCarousel {images} {currentIndex} onSelect={handleSelect} class="" />
	{images[currentIndex].title}
	<FullscreenCarousel
		{images}
		{currentIndex}
		onClose={handleFullscreenClose}
		onSelect={handleFullscreenSelect}
		open={(page.state.isFullscreen && page.state.galleryId === gallery.slug) || false}
	/>
</div>
