<script lang="ts">
	import Gallery from '$lib/components/gallery/gallery.svelte';
	import type { Gallery as GalleryType } from '$lib/components/gallery/types';
	import { getAspectRatio } from '$lib/components/gallery/utils';

	interface Props {
		gallery: GalleryType;
	}

	const { gallery }: Props = $props();

	const aspectRatio = getAspectRatio(gallery.aspectRatio, gallery.orientation);
</script>

<Gallery {gallery} {aspectRatio} initialIndex={gallery.initialIndex} />
