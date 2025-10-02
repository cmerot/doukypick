<script lang="ts">
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselNext,
		CarouselPrevious
	} from '$lib/components/ui/carousel';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context';
	import { cn } from '$lib/utils';
	import type { ImageData } from './types';

	// Props
	let {
		images,
		currentIndex = 0,
		onSelect,
		class: className
	}: {
		images: ImageData[];
		currentIndex: number;
		onSelect?: (index: number) => void;
		class?: string;
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

{#if images.length > 0}
	<Carousel
		class={cn('bg-background', className)}
		setApi={(emblaApi) => (api = emblaApi)}
		opts={{
			containScroll: 'keepSnaps',
			loop: false,
			dragFree: true,
			startIndex: currentIndex
		}}
	>
		<CarouselContent class="-ml-2">
			{#each images as image, index (image.uuid)}
				<CarouselItem class="flex-shrink-0 basis-1/4 pl-1.5">
					<button
						type="button"
						class="aspect-square w-full overflow-hidden border-t-6 border-transparent transition-opacity {index ===
						current
							? 'opacity-100'
							: 'opacity-50'}"
						aria-label="Select image {index + 1}"
						onclick={() => {
							handleClick(index);
						}}
					>
						<img
							srcset={image.srcset}
							sizes="(max-width: 550px) 150px, 400px"
							alt={image.alt}
							class="inline h-full w-full object-cover p-0"
							loading={Math.abs(index - currentIndex) <= 1 ? 'eager' : 'lazy'}
						/>
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
