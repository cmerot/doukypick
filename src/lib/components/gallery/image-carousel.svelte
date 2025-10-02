<script lang="ts">
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious
	} from '$lib/components/ui/carousel';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import type { ImageData } from './types';

	// Props
	let {
		images,
		currentIndex = 0,
		aspectRatio = '4/3',
		onClick,
		onSelect
	}: {
		images: ImageData[];
		currentIndex?: number;
		aspectRatio?: string;
		onClick?: (e: MouseEvent, url: string, index: number) => void;
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

	function handleClick(e: MouseEvent, index: number) {
		if (!onClick) return;
		e.preventDefault();
		const url = (e.currentTarget as HTMLAnchorElement).href;
		onClick(e, url, index);
	}
	const sizes = '(max-width: 400px) 400px, (max-width: 600px) 600px, 900px';
</script>

<Carousel setApi={(emblaApi) => (api = emblaApi)} opts={{ startIndex: currentIndex }}>
	<CarouselContent>
		{#each images as image, index (image.uuid)}
			<CarouselItem>
				<a
					href={image.href}
					class="flex h-full w-full items-center justify-center border-6 border-black bg-black"
					onclick={(e) => handleClick(e, index)}
					style="aspect-ratio: {aspectRatio};"
				>
					<picture class="flex h-full w-full items-center justify-center">
						<img
							srcset={image.srcset}
							{sizes}
							alt={image.alt}
							loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
							class="max-h-full max-w-full object-contain"
						/>
					</picture>
				</a>
			</CarouselItem>
		{/each}
	</CarouselContent>

	{#if images.length > 1}
		<CarouselPrevious class="hidden md:flex" />
		<CarouselNext class="hidden md:flex" />
	{/if}
</Carousel>
