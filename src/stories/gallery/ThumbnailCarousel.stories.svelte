<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ThumbnailCarousel from '$lib/components/gallery/thumbnail-carousel.svelte';
	import { mockProcessedImages } from './mock-data';
	import { fn } from 'storybook/test';
	import WidthDecorator from '../WidthDecorator.svelte';

	const { Story } = defineMeta({
		title: 'Components/Gallery/ThumbnailCarousel',
		component: ThumbnailCarousel,
		tags: ['autodocs'],
		argTypes: {
			currentIndex: {
				control: { type: 'number', min: 0, max: 3 }
			}
		},
		args: {
			onSelect: fn()
		},
		// @ts-ignore
		decorators: [() => WidthDecorator]
	});
</script>

<Story
	name="Default"
	args={{
		images: mockProcessedImages
	}}
/>

<Story
	name="Second Image Selected"
	args={{
		images: mockProcessedImages,
		currentIndex: 1
	}}
/>

<Story
	name="Single Image"
	args={{
		images: mockProcessedImages.slice(1, 2)
	}}
/>

<Story
	name="Two Images"
	args={{
		images: mockProcessedImages.slice(0, 2)
	}}
/>
