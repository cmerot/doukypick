<script lang="ts">
	import type { GalleryImage } from '$lib/types/gallery';
	import { base } from '$app/paths';

	interface Props {
		image: GalleryImage;
		galleryPath: string;
		onclick: () => void;
	}

	let { image, galleryPath, onclick }: Props = $props();
</script>

<button
	class="group relative overflow-hidden border-2 border-transparent transition-colors hover:border-blue-500 focus:border-blue-500 focus:outline-none"
	{onclick}
	aria-label="View {image.description}"
>
	<picture>
		<source srcset="{base}/generated/{galleryPath}/{image.thumbnail.webp}" type="image/webp" />
		<img
			src="{base}/generated/{galleryPath}/{image.thumbnail.fallback}"
			alt={image.description}
			class="h-full w-full object-cover"
			width={image.thumbnail.width}
			height={image.thumbnail.height}
			loading="lazy"
		/>
	</picture>

	<div
		class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
	>
		<p class="truncate text-xs text-white">{image.description}</p>
	</div>
</button>
