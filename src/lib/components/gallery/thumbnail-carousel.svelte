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
		onSelect
	}: {
		images: ImageData[];
		currentIndex: number;
		onSelect?: (index: number) => void;
	} = $props();

	let api = $state<CarouselAPI>();
	let current = $state<number>(currentIndex);

	function handleClick(index: number) {
		current = index;
		if (!onSelect) return;
		onSelect(current);
	}

	$effect(() => {
		if (!api) return;
		api.scrollTo(currentIndex);
		current = currentIndex;
	});
</script>

{#if images.length > 1}
	<Carousel
		class="mt-1 w-full"
		setApi={(emblaApi) => (api = emblaApi)}
		opts={{
			containScroll: 'keepSnaps',
			loop: false,
			dragFree: true,
			startIndex: currentIndex
		}}
	>
		<CarouselContent class="m-0">
			{#each images as image, index (image.uuid)}
				<CarouselItem class="flex-shrink-0 basis-1/4 p-0">
					<button
						type="button"
						class="aspect-square w-full overflow-hidden border-4 transition-colors {index ===
						current
							? 'border-black'
							: 'border-transparent'}"
						aria-label="Select image {index + 1}"
						onclick={() => {
							handleClick(index);
						}}
					>
						<picture>
							<img
								srcset={image.srcset}
								sizes="(max-width: 550px) 150px, 400px"
								alt={image.alt}
								class="h-full w-full object-cover"
								loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
							/>
						</picture>
					</button>
				</CarouselItem>
			{/each}
		</CarouselContent>

		{#if images.length > 4}
			<CarouselPrevious class="hidden md:flex" />
			<CarouselNext class="hidden md:flex" />
		{/if}
	</Carousel>
{/if}
