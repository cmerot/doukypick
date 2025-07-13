<script lang="ts">
	import Overlay from '$lib/components/overlay/overlay.svelte';
	import GalleryThumbnail from '$lib/components/gallery-thumbnail.svelte';
	import { page } from '$app/state';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import Image from '$lib/components/progressive-image.svelte';

	interface Props {
		images: any[];
		urlPersistence?: boolean;
		aspectRatio?: string;
	}

	let { images, urlPersistence = false, aspectRatio = '4/3' }: Props = $props();

	// État du carousel et de l'overlay
	let currentSlide = $state<number | undefined>(undefined);
	let api = $state<CarouselAPI>();
	let open = $derived(currentSlide !== undefined);

	// Gestion de l'URL et de l'état
	class URLSlideManager {
		static syncFromURL() {
			if (!urlPersistence) return undefined;
			const slideParam = page.url.searchParams.get('slide');
			return slideParam ? Number(slideParam) : undefined;
		}

		static updateURL(slideIndex: number | null) {
			if (!urlPersistence) return;

			const url = new URL(window.location.href);

			if (slideIndex === null) {
				url.searchParams.delete('slide');
			} else {
				url.searchParams.set('slide', slideIndex.toString());
			}

			history.pushState(null, '', url.toString());
		}

		static setSlide(slideIndex: number | null) {
			currentSlide = slideIndex ?? undefined;
			this.updateURL(slideIndex);
		}
	}

	// Synchronisation initiale avec l'URL
	$effect(() => {
		currentSlide = URLSlideManager.syncFromURL();
	});

	// Gestion de la fermeture automatique de l'overlay
	$effect(() => {
		if (!open && currentSlide !== undefined) {
			URLSlideManager.setSlide(null);
		}
	});

	// Navigation automatique vers la diapositive spécifiée
	$effect(() => {
		if (api && currentSlide !== undefined && open) {
			setTimeout(() => api!.scrollTo(currentSlide!), 100);
		}
	});

	// Synchronisation des changements de diapositive avec l'URL
	$effect(() => {
		if (!api || !open) return;

		const handleSlideChange = () => {
			const selectedIndex = api!.selectedScrollSnap();
			currentSlide = selectedIndex;
			URLSlideManager.updateURL(selectedIndex);
		};

		api.on('select', handleSlideChange);
		return () => api!.off('select', handleSlideChange);
	});

	// Actions publiques
	function updateUrlParam(key: string, value: string | null) {
		if (key === 'slide') {
			URLSlideManager.setSlide(value ? Number(value) : null);
		}
	}
</script>

<Overlay bind:open>
	<Carousel.Root setApi={(emblaApi) => (api = emblaApi)} opts={{ startIndex: currentSlide ?? 0 }}>
		<Carousel.Previous />
		<Carousel.Next />
		<Carousel.Content class="bg-transparent">
			{#each images as item, index}
				<Carousel.Item class="flex items-center justify-center">
					<Image image={item} />
				</Carousel.Item>
			{/each}
		</Carousel.Content>
	</Carousel.Root>
</Overlay>

<div class="grid grid-cols-1 grid-cols-4 gap-1">
	{#each images as item, index}
		<GalleryThumbnail {item} {index} {updateUrlParam} {aspectRatio} />
	{/each}
</div>
