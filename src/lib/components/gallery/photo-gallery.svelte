<script lang="ts">
	import { processPhoto } from './utils';
	import type { ProcessedPhoto, PhotoGalleryProps } from './types';
	import PhotoCarousel from './photo-carousel.svelte';
	import ThumbnailCarousel from './thumbnail-carousel.svelte';
	import FullscreenCarousel from './fullscreen-carousel.svelte';

	// Props
	let {
		gallery,
		class: className = '',
		aspectRatio = '4/3',
		initialImage = 0
	}: Pick<PhotoGalleryProps, 'gallery' | 'class' | 'aspectRatio' | 'initialImage'> = $props();

	// Derived data
	const photos = $derived.by((): ProcessedPhoto[] => {
		return gallery.images
			.filter((img) => img.visible)
			.sort((a, b) => a.order - b.order)
			.map((image, index) => processPhoto(image, gallery.id, index));
	});

	// Gallery state
	let currentIndex = $state(initialImage);

	// Navigation functions
	function handleSelect(index: number) {
		currentIndex = index;
	}

	let open = $state<boolean>(false);
</script>

<div class="mx-auto flex w-full flex-col {className}">
	<!-- Main Photo Carousel -->
	<PhotoCarousel
		bind:open
		{photos}
		{currentIndex}
		galleryId={gallery.id}
		{aspectRatio}
		onSelect={handleSelect}
	/>

	<!-- Thumbnail Carousel -->
	<ThumbnailCarousel {photos} {currentIndex} onSelect={handleSelect} />

	<FullscreenCarousel {photos} {currentIndex} onSelect={handleSelect} bind:open />
</div>
