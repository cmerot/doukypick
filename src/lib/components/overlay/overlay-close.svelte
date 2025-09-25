<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { WithoutChildren } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { Button, type Props } from '$lib/components/ui/button/index.js';

	let {
		ref = $bindable(null),
		class: className,
		onclose,
		...restProps
	}: WithoutChildren<Props> & {
		onclose?: () => void;
	} = $props();
</script>

<Button
	data-slot="overlay-close"
	variant="outline"
	size="icon"
	class={cn(
		'size-8 rounded-full focus-visible:ring-4 focus-visible:ring-blue-500/50 focus-visible:outline-none',
		className
	)}
	onclick={onclose || (() => {})}
	bind:ref
	{...restProps}
>
	<X class="size-4" />
	<span class="sr-only">Fermer la galerie</span>
</Button>
