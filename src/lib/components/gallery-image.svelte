<script lang="ts">
	import type { GalleryImage } from '$lib/utils/gallery-parser.js';
	import { base } from '$app/paths';

	interface Props {
		image: GalleryImage;
		galleryPath: string;
		isActive: boolean;
	}

	let { image, galleryPath, isActive }: Props = $props();
</script>

<div class="flex h-full w-full items-center justify-center">
	<div class="relative max-h-full max-w-full">
		<picture>
			<source srcset="{base}/{galleryPath}/{image.large.webp}" type="image/webp" />
			<img
				src="{base}/{galleryPath}/{image.large.fallback}"
				alt={image.description}
				class="max-h-full max-w-full object-contain"
				width={image.large.width}
				height={image.large.height}
				loading={isActive ? 'eager' : 'lazy'}
			/>
		</picture>

		{#if image.description}
			<div class="bg-opacity-75 absolute right-0 bottom-0 left-0 bg-black p-4 text-white">
				<p class="text-center">{image.description}</p>
			</div>
		{/if}
	</div>
</div>
