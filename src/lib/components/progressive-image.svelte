<script lang="ts">
	import type { JsonIndexItem } from '$lib/types/gallery';
	import { base } from '$app/paths';

	interface Props {
		image: JsonIndexItem;
		class?: string;
		isFocusable?: boolean;
	}

	let { image, class: className = '', isFocusable = true }: Props = $props();

	const thumbnailWebpSrc = $derived(image.thumbnail.path);
	const thumbnailFallbackSrc = $derived(image.thumbnail.fallback_path);
	const largeWebpSrc = $derived(image.large.path);
	const largeFallbackSrc = $derived(image.large.fallback_path);

	let isImageLoaded = $state(false);
	let isDescriptionShown = $state(false);

	function handleImageLoad() {
		isImageLoaded = true;
	}
</script>

<button
	tabindex={isFocusable ? 0 : -1}
	class="fdocus-visible:ring-inset relative overflow-hidden transition-all duration-200 focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:outline-none {className}"
	onclick={() => (isDescriptionShown = !isDescriptionShown)}
>
	<!-- Miniature (affichée à la taille finale, reste visible en arrière-plan) -->
	<picture>
		<source srcset="{base}{thumbnailWebpSrc}" type="image/webp" />
		<img
			src="{base}{thumbnailFallbackSrc}"
			alt=""
			width={image.large.width}
			height={image.large.height}
			class="absolute max-h-screen max-w-screen object-contain"
			aria-hidden="true"
		/>
	</picture>

	<!-- Image principale (apparaît par-dessus la miniature) -->
	<figure>
		<picture class="outline-8">
			<source srcset="{base}{largeWebpSrc}" type="image/webp" />
			<img
				src="{base}{largeFallbackSrc}"
				alt={image.description}
				width={image.large.width}
				height={image.large.height}
				class="relative max-h-screen max-w-screen object-contain transition-opacity duration-300 {isImageLoaded
					? 'opacity-100'
					: 'opacity-0'}"
				loading="lazy"
				onload={handleImageLoad}
			/>
		</picture>
		<figcaption
			class="absolute top-0 right-0 left-0 m-4 bg-white p-4 transition-opacity duration-300 {isDescriptionShown
				? 'opacity-70'
				: 'opacity-0'}"
		>
			{image.description}
		</figcaption>
	</figure>
</button>
