<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import type { WithoutChildren } from 'bits-ui';
	import { getEmblaContext } from '$lib/components/ui/carousel/context.js';
	import { cn } from '$lib/utils.js';
	import { Button, type Props } from '$lib/components/ui/button/index.js';
	import { preventDefault } from './utils.js';

	let {
		ref = $bindable(null),
		class: className,
		variant = 'outline',
		size = 'icon',
		...restProps
	}: WithoutChildren<Props> = $props();

	const emblaCtx = getEmblaContext('<Carousel.Next/>');
</script>

<Button
	data-slot="carousel-next"
	{variant}
	{size}
	aria-disabled={emblaCtx.api ? !emblaCtx.canScrollNext : restProps.href ? false : true}
	class={cn(
		'absolute size-8 rounded-full',
		emblaCtx.orientation === 'horizontal'
			? 'top-1/2 -right-12 -translate-y-1/2'
			: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
		className
	)}
	onclick={preventDefault(emblaCtx.scrollNext)}
	onkeydown={emblaCtx.handleKeyDown}
	bind:ref
	{...restProps}
>
	<ArrowRightIcon class="size-4" />
	<span class="sr-only">Suivant</span>
</Button>
