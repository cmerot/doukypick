<script lang="ts">
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious
	} from '$lib/components/ui/carousel';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import type { ProcessedPhoto } from './types';

	// Props
	let {
		photos,
		galleryId,
		open = $bindable(false),
		currentIndex = 0,
		aspectRatio = '4/3',
		onSelect
	}: {
		photos: ProcessedPhoto[];
		galleryId: string;
		open: boolean;
		currentIndex?: number;
		aspectRatio?: string;
		onSelect?: (index: number) => void;
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
			onSelect(current);
		});
	});

	function handleClick(e: Event, url: string) {
		e.preventDefault();
		open = true;
	}
</script>

<div class="relative flex items-center gap-4">
	<Carousel
		class="w-full"
		setApi={(emblaApi) => (api = emblaApi)}
		opts={{ startIndex: currentIndex }}
	>
		<CarouselContent>
			{#each photos as photo, index (photo.uuid)}
				<CarouselItem>
					<a
						href="/photo/{galleryId}/{photo.slug}"
						class="relative block w-full border-6 border-black"
						style="aspect-ratio: {aspectRatio}"
						onclick={(e) => {
							handleClick(e, `/photo/${galleryId}/${photo.slug}`);
						}}
					>
						<picture>
							<source
								srcset={photo.srcsets.avif}
								sizes="(max-width: 400px) 400px, (max-width: 600px) 600px, 900px"
								type="image/avif"
							/>
							<source
								srcset={photo.srcsets.webp}
								sizes="(max-width: 400px) 400px, (max-width: 600px) 600px, 900px"
								type="image/webp"
							/>
							<img
								srcset={photo.srcsets.jpg}
								sizes="(max-width: 400px) 400px, (max-width: 600px) 600px, 900px"
								src={photo.urls.small}
								alt={photo.alt}
								class="absolute inset-0 h-full w-full object-cover"
								loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
							/>
						</picture>
					</a>
				</CarouselItem>
			{/each}
		</CarouselContent>

		{#if photos.length > 1}
			<CarouselPrevious class="hidden md:flex" />
			<CarouselNext class="hidden md:flex" />
		{/if}
	</Carousel>
</div>
