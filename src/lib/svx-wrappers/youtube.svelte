<script lang="ts">
	import type { ImageAspectRatio, ImageOrientation } from '$lib/components/gallery/types';
	import { getAspectRatio } from '$lib/components/gallery/utils';
	import { cn } from '$lib/utils';

	type YoutubeWidth = 'sm' | 'md' | 'lg' | 'full';
	type YoutubeAlignement = 'left' | 'right';

	type Props = {
		id: string;
		aspectRatio: ImageAspectRatio;
		orientation: ImageOrientation;
		width?: YoutubeWidth;
		alignment?: YoutubeAlignement;
		border?: boolean;
		class?: string;
	};

	const {
		id,
		aspectRatio,
		orientation,
		width,
		alignment,
		border,
		class: className
	}: Props = $props();

	const alignments = { left: 'xs:float-left xs:mr-4', right: 'xs:float-right xs:ml-4' };

	const widths = {
		sm: 'xs:w-1/4',
		md: 'xs:w-1/3',
		lg: 'xs:w-1/2',
		full: ''
	};

	const classNames = ['mb-2 mx-auto'];

	if (alignment) {
		classNames.push(alignments[alignment]);
	}
	if (width) {
		classNames.push(widths[width]);
	}
	const ratio = getAspectRatio(aspectRatio, orientation);
	if (border) {
		classNames.push('border-4 border-primary');
	}
</script>

<iframe
	src="https://www.youtube-nocookie.com/embed/{id}?controls=0&modestbranding=1&rel=0"
	title="YouTube video player"
	allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	referrerpolicy="strict-origin-when-cross-origin"
	allowfullscreen
	class={cn(classNames, className)}
	style="aspect-ratio: {ratio}"
></iframe>
