<script lang="ts">
	import { createSrc, createSrcset } from '$lib/utils';
	import { cn } from '$lib/utils';

	type ImageWidth = 'sm' | 'md' | 'lg' | 'full';
	type ImageAlignement = 'left' | 'right';

	const {
		src,
		alt,
		sizes,
		class: className,
		width,
		alignment,
		border
	}: {
		src: string;
		alt: string;
		width?: ImageWidth;
		alignment?: ImageAlignement;
		sizes?: string;
		class?: string;
		border?: boolean;
	} = $props();

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
	if (border) {
		classNames.push('border-4 border-primary');
	}
	const sizesNotEmpty = sizes
		? sizes
		: '(max-width: 150px) 150px, (max-width: 400px) 400px, (max-width: 600px) 600px, 900px';
</script>

<img
	src={createSrc(src)}
	srcset={createSrcset(src)}
	{alt}
	sizes={sizesNotEmpty}
	class={cn(classNames, className)}
/>
