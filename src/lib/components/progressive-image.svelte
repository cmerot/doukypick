<script lang="ts">
	import type { JsonIndexItem } from '$lib/types/gallery';
	import { base } from '$app/paths';

	interface Props {
		image: JsonIndexItem;
		class?: string;
	}

	let { image, class: className = '' }: Props = $props();

	const thumbnailWebpSrc = $derived(image.thumbnail.path);
	const thumbnailFallbackSrc = $derived(image.thumbnail.fallback_path);
	const largeWebpSrc = $derived(image.large.path);
	const largeFallbackSrc = $derived(image.large.fallback_path);

	let isImageLoaded = $state(false);

	function handleImageLoad() {
		isImageLoaded = true;
	}
</script>

<div class="relative overflow-hidden bg-black {className}">
	<!-- Miniature (affichée à la taille finale, reste visible en arrière-plan) -->
	<picture>
		<source srcset="{base}{thumbnailWebpSrc}" type="image/webp" />
		<img
			src="{base}{thumbnailFallbackSrc}"
			alt=""
			width={image.large.width}
			height={image.large.height}
			class="absolute inset-0 max-h-screen max-w-screen rounded-sm object-contain"
			aria-hidden="true"
		/>
	</picture>

	<!-- Image principale (apparaît par-dessus la miniature) -->
	<picture>
		<source srcset="{base}{largeWebpSrc}" type="image/webp" />
		<img
			src="{base}{largeFallbackSrc}"
			alt={image.description}
			width={image.large.width}
			height={image.large.height}
			class="relative max-h-screen max-w-screen rounded-sm object-contain transition-opacity duration-300 {isImageLoaded
				? 'opacity-100'
				: 'opacity-0'}"
			loading="lazy"
			onload={handleImageLoad}
		/>
	</picture>
</div>
