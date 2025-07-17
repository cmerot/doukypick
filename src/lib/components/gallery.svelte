<script lang="ts">
	import Overlay from '$lib/components/overlay/overlay.svelte';
	import GalleryThumbnail from '$lib/components/gallery-thumbnail.svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import Image from '$lib/components/progressive-image.svelte';
	import { tick } from 'svelte';

	interface Props {
		images: any[];
		open?: boolean;
		currentSlide?: number;
		aspectRatio?: string;
		onOpenSlide?: (slideIndex: number) => void;
		onSlideChange?: (slideIndex: number) => void;
		onClose?: () => void;
	}

	let {
		images,
		open = $bindable(false),
		currentSlide = $bindable(0),
		aspectRatio = '4/3',
		onOpenSlide,
		onSlideChange,
		onClose
	}: Props = $props();

	// État du carousel
	let api = $state<CarouselAPI>();

	// Gestion de l'ouverture de l'overlay
	function openOverlay(index: number) {
		currentSlide = index;
		open = true;
		onOpenSlide?.(index);
	}

	// Gestion de la fermeture de l'overlay
	function closeOverlay() {
		open = false;
		onClose?.();
	}

	// Synchronisation du carousel avec l'état
	$effect(() => {
		if (!api || !open) return;

		const carouselApi = api;

		// Attendre le prochain tick pour que le carousel soit prêt
		tick().then(() => {
			if (currentSlide !== carouselApi.selectedScrollSnap()) {
				carouselApi.scrollTo(currentSlide);
			}
		});
	});

	// Écouter les changements de diapositive du carousel
	$effect(() => {
		if (!api || !open) return;

		const carouselApi = api;

		const handleSlideChange = () => {
			const selectedIndex = carouselApi.selectedScrollSnap();
			if (selectedIndex !== currentSlide) {
				currentSlide = selectedIndex;
				onSlideChange?.(selectedIndex);
			}
		};

		carouselApi.on('select', handleSlideChange);

		return () => {
			carouselApi.off('select', handleSlideChange);
		};
	});
</script>

<Overlay bind:open onclose={closeOverlay}>
	<Carousel.Root setApi={(emblaApi) => (api = emblaApi)} opts={{ startIndex: currentSlide }}>
		<Carousel.Content>
			{#each images as item, index}
				<Carousel.Item class="flex items-center justify-center">
					<Image image={item} isFocusable={index === currentSlide} />
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous
			class="ml-16 hidden focus-visible:ring-4 focus-visible:ring-blue-500/50 focus-visible:outline-none md:flex"
		/>
		<Carousel.Next
			class="mr-16 hidden focus-visible:ring-4 focus-visible:ring-blue-500/50 focus-visible:outline-none md:flex"
		/>
	</Carousel.Root>
</Overlay>

<div class="grid grid-cols-4 gap-1">
	{#each images as item, index}
		<GalleryThumbnail {item} {index} {aspectRatio} onclick={() => openOverlay(index)} />
	{/each}
</div>
