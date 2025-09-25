<script lang="ts">
	import Overlay from '$lib/components/overlay/overlay.svelte';
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious
	} from '$lib/components/ui/carousel';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import { fly } from 'svelte/transition';
	import type { ImageData } from './types';

	// Props
	let {
		images,
		currentIndex = 0,
		open = $bindable(),
		onClose,
		onSelect
	}: {
		images: ImageData[];
		currentIndex?: number;
		aspectRatio?: string;
		open: boolean;
		onClose?: () => void;
		onSelect?: (url: string, index: number) => void;
	} = $props();

	let api = $state<CarouselAPI>();

	$effect(() => {
		if (!api) return;
		api.scrollTo(currentIndex);
	});

	$effect(() => {
		if (!api || !onSelect) return;
		api.on('select', () => {
			const current = api!.selectedScrollSnap();
			onSelect(images[current].href, current);
		});
	});

	const sizes =
		'(max-width: 400px) 400px, (max-width: 600px) 600px, (max-width: 900px) 900px, 1200px';

	// UI state for overlay
	let showOverlay = $state(false);

	function toggleOverlay() {
		showOverlay = !showOverlay;
	}
	function handleClose() {
		onClose?.();
	}
</script>

<Overlay {open} onclose={handleClose}>
	<Carousel setApi={(emblaApi) => (api = emblaApi)} opts={{ startIndex: currentIndex }}>
		<CarouselContent>
			{#each images as image, index (image.uuid)}
				<CarouselItem class="relative flex h-dvh w-screen items-center justify-center">
					{#if showOverlay}
						<div
							class="absolute right-0 bottom-0 left-0 z-30 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 text-white"
							transition:fly={{ y: 100, duration: 300 }}
						>
							<div class="mx-auto max-w-4xl">
								<h1 class="mb-3 text-2xl font-bold md:text-3xl">
									{image.title}
								</h1>

								{#if image.description}
									<p class="mb-4 text-lg text-gray-300 md:text-xl">
										{image.description}
									</p>
								{/if}

								<!-- Close hint -->
								<div class="mt-4 text-center text-xs text-gray-500">
									Cliquer n'importe où pour cacher les infos
								</div>
							</div>
						</div>
					{/if}

					<!-- Show info hint (when overlay is hidden) -->
					{#if !showOverlay}
						<div
							class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/30 px-4 py-2 text-center text-sm text-white backdrop-blur-sm"
							transition:fly={{ y: 50, duration: 300 }}
						>
							Cliquer pour afficher les infos
						</div>
					{/if}

					<button
						aria-label="Afficher/cacher les informations"
						onclick={toggleOverlay}
						tabindex={index === currentIndex ? 0 : -1}
						class="cursor-pointer"
					>
						<picture>
							<source srcset={image.srcsets.avif} {sizes} type="image/avif" />
							<source srcset={image.srcsets.webp} {sizes} type="image/webp" />
							<img
								srcset={image.srcsets.jpg}
								{sizes}
								src={image.urls.small}
								alt={image.alt}
								class="max-h-dvh max-w-screen object-contain"
								loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
							/>
						</picture>
					</button>
				</CarouselItem>
			{/each}
		</CarouselContent>

		{#if images.length > 1}
			<CarouselPrevious class="hidden md:flex" />
			<CarouselNext class="hidden md:flex" />
		{/if}
	</Carousel>
</Overlay>
