<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ImageCarousel from '$lib/components/gallery/image-carousel.svelte';
	import { mockProcessedImages } from './mock-data';
	import { fn } from 'storybook/test';
	import WidthDecorator from '../WidthDecorator.svelte';

	const { Story } = defineMeta({
		title: 'Components/Gallery/ImageCarousel',
		component: ImageCarousel,
		tags: ['autodocs'],
		argTypes: {
			aspectRatio: {
				control: { type: 'select' },
				options: ['16/9', '3/2', '4/3', '5/4', '1/1', '4/5', '2/3', '3/4', '9/16']
			},
			currentIndex: {
				control: { type: 'number', min: 0, max: 3 }
			}
		},
		args: {
			onClick: fn(),
			onSelect: fn()
		},
		// @ts-ignore
		decorators: [() => WidthDecorator]
	});
</script>

<Story
	name="Default"
	args={{
		images: mockProcessedImages,
		currentIndex: 0,
		aspectRatio: '4/3'
	}}
/>

<Story
	name="Square Aspect Ratio"
	args={{
		images: mockProcessedImages,
		currentIndex: 0,
		aspectRatio: '1/1'
	}}
/>

<Story
	name="Wide Aspect Ratio"
	args={{
		images: mockProcessedImages,
		currentIndex: 0,
		aspectRatio: '16/9'
	}}
/>

<Story
	name="Starting at Second Image"
	args={{
		images: mockProcessedImages,
		currentIndex: 1,
		aspectRatio: '4/3'
	}}
/>

<Story
	name="Single Image"
	args={{
		images: [mockProcessedImages[0]],
		currentIndex: 0,
		aspectRatio: '4/3'
	}}
/>
