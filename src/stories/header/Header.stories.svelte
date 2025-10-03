<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/header/header.svelte';

	const { Story } = defineMeta({
		title: 'Components/Header/Header',
		component: Header,
		tags: ['autodocs']
	});
</script>

<Story name="Desktop View" />

<Story
	name="Mobile View"
	globals={{
		viewport: { value: 'mobile1', isRotated: false }
	}}
/>
