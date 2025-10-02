<script module>
	// @ts-nocheck

	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Gallery from '$lib/components/gallery/gallery.svelte';
	import { mockGallery } from './mock-data';
	import WidthDecorator from '../WidthDecorator.svelte';
	const { Story } = defineMeta({
		title: 'Components/Gallery/Gallery',
		component: Gallery,
		tags: ['autodocs'],
		argTypes: {
			aspectRatio: {
				control: { type: 'select' },
				options: ['16/9', '3/2', '4/3', '5/4', '1/1', '4/5', '2/3', '3/4', '9/16']
			},
			initialIndex: {
				control: { type: 'number', min: 0, max: 3 }
			}
		}
	});
</script>

<Story
	name="Default"
	args={{
		gallery: mockGallery
	}}
	decorators={[() => WidthDecorator]}
/>

<Story
	name="Mobile"
	args={{
		gallery: mockGallery
	}}
	globals={{
		viewport: { value: 'mobile1', isRotated: false }
	}}
/>

<Story
	name="Square Aspect Ratio"
	args={{
		gallery: mockGallery,
		aspectRatio: '1/1'
	}}
	decorators={[() => WidthDecorator]}
/>

<Story
	name="Wide Aspect Ratio"
	args={{
		gallery: mockGallery,
		aspectRatio: '16/9'
	}}
	decorators={[() => WidthDecorator]}
/>

<Story
	name="Starting at Second Image"
	args={{
		gallery: mockGallery,
		initialIndex: 1
	}}
	decorators={[() => WidthDecorator]}
/>
