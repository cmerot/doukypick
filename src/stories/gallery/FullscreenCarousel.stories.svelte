<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FullscreenCarousel from '$lib/components/gallery/fullscreen-carousel.svelte';
	import { mockProcessedImages } from './mock-data';
	import { fn } from 'storybook/test';

	const { Story } = defineMeta({
		title: 'Components/Gallery/FullscreenCarousel',
		component: FullscreenCarousel,
		tags: ['autodocs'],
		argTypes: {
			currentIndex: {
				control: { type: 'number', min: 0, max: 3 }
			},
			open: {
				control: { type: 'boolean' }
			}
		},
		args: {
			onClose: fn(),
			onSelect: fn()
		}
	});
</script>

<Story
	name="Opened"
	args={{
		images: mockProcessedImages,
		currentIndex: 0,
		open: true
	}}
/>

<Story
	name="Closed"
	args={{
		images: mockProcessedImages,
		currentIndex: 0,
		open: false
	}}
/>

<Story
	name="Opened at Second Image"
	args={{
		images: mockProcessedImages,
		currentIndex: 1,
		open: true
	}}
/>

<Story
	name="Single Image"
	args={{
		images: [mockProcessedImages[0]],
		currentIndex: 0,
		open: true
	}}
/>
