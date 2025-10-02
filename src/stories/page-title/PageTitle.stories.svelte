<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import WidthDecorator from '../WidthDecorator.svelte';

	const { Story } = defineMeta({
		title: 'Components/PageTitle/PageTitle',
		component: PageTitle,
		tags: ['autodocs'],
		// @ts-ignore
		decorators: [() => WidthDecorator]
	});
</script>

<Story name="Default">Tatouages</Story>

<Story name="Long Title">Salon de tatouage Le P'tit Cap'</Story>

<Story name="Short Title">À propos</Story>

<Story name="With Accents">Soins et après-tatouage</Story>
