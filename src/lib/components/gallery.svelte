<script lang="ts">
	import { onMount } from 'svelte';
	import type { GalleryData } from '$lib/types/gallery';
	import GalleryThumbnail from './gallery-thumbnail.svelte';
	import GalleryImage from './gallery-image.svelte';

	interface Props {
		data: GalleryData;
	}

	let { data }: Props = $props();
	let isCarouselOpen = $state(false);
	let currentIndex = $state(0);

	function openCarousel(index: number) {
		currentIndex = index;
		isCarouselOpen = true;
	}

	function closeCarousel() {
		isCarouselOpen = false;
	}

	function nextImage() {
		currentIndex = (currentIndex + 1) % data.images.length;
	}

	function prevImage() {
		currentIndex = (currentIndex - 1 + data.images.length) % data.images.length;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isCarouselOpen) return;

		switch (event.key) {
			case 'Escape':
				closeCarousel();
				break;
			case 'ArrowRight':
				nextImage();
				break;
			case 'ArrowLeft':
				prevImage();
				break;
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="gallery">
	<!-- Thumbnail Grid -->
	<div class="grid grid-cols-4">
		{#each data.images as image, index}
			<GalleryThumbnail {image} galleryPath={data.path} onclick={() => openCarousel(index)} />
		{/each}
	</div>

	<!-- Carousel Modal -->
	{#if isCarouselOpen}
		<div
			class="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black"
			role="dialog"
			aria-label="Image carousel"
		>
			<!-- Close button -->
			<button
				class="absolute top-4 right-4 z-10 text-2xl text-white hover:text-gray-300"
				onclick={closeCarousel}
				aria-label="Close carousel"
			>
				×
			</button>

			<!-- Navigation buttons -->
			{#if data.images.length > 1}
				<button
					class="absolute top-1/2 left-4 z-10 -translate-y-1/2 transform text-3xl text-white hover:text-gray-300"
					onclick={(e) => {
						e.stopPropagation();
						prevImage();
					}}
					aria-label="Previous image"
				>
					‹
				</button>

				<button
					class="absolute top-1/2 right-4 z-10 -translate-y-1/2 transform text-3xl text-white hover:text-gray-300"
					onclick={(e) => {
						e.stopPropagation();
						nextImage();
					}}
					aria-label="Next image"
				>
					›
				</button>
			{/if}

			<!-- Image container -->
			<div class="flex h-full w-full items-center justify-center p-8">
				<GalleryImage image={data.images[currentIndex]} galleryPath={data.path} isActive={true} />
			</div>

			<!-- Image counter -->
			{#if data.images.length > 1}
				<div class="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-sm text-white">
					{currentIndex + 1} / {data.images.length}
				</div>
			{/if}
		</div>
	{/if}
</div>
