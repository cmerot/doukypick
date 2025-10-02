<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '$lib/components/header/header.svelte';

	const { Story } = defineMeta({
		title: 'Components/Header/Header',
		component: Header,
		tags: ['autodocs'],
		argTypes: {
			mobileMenuOpen: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story
	name="Desktop View"
	args={{
		mobileMenuOpen: false
	}}
/>

<Story
	name="Mobile Menu Closed"
	args={{
		mobileMenuOpen: false
	}}
	globals={{
		viewport: { value: 'mobile1', isRotated: false }
	}}
/>

<Story
	name="Mobile Menu Open"
	args={{
		mobileMenuOpen: true
	}}
	globals={{
		viewport: { value: 'mobile1', isRotated: false }
	}}
/>
