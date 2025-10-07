<script lang="ts">
	interface Image {
		src: string;
		alt?: string;
	}

	interface Props {
		images: Image[];
		border?: boolean;
	}

	let { images, border = false }: Props = $props();

	// Use $derived for reactive grid class calculation
	const gridColsClass = $derived(
		({
			1: 'grid-cols-1',
			2: 'grid-cols-2',
			3: 'grid-cols-3',
			4: 'grid-cols-4',
			5: 'grid-cols-5',
			6: 'grid-cols-6'
		} as Record<number, string>)[images.length] || 'grid-cols-4'
	);

	// Use $derived for container classes with object syntax (Svelte 5.16+)
	const containerClasses = $derived({
		grid: true,
		'w-full': true,
		'divide-x-6': border,
		'divide-foreground': border,
		'border-6': border,
		'border-foreground': border,
		'gap-x-1.5': !border
	});
</script>

<div class={[gridColsClass, containerClasses]}>
	{#each images as image, i (i)}
		<div class="h-full w-full overflow-hidden">
			<img src={image.src} alt={image.alt || ''} class="h-full w-full object-cover" />
		</div>
	{/each}
</div>
