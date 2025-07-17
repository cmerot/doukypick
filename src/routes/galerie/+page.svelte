<script lang="ts">
	import type { PageData } from './$types';
	import Gallery from '$lib/components/gallery.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { data }: { data: PageData } = $props();

	// État dérivé depuis l'URL - source de vérité unique
	let galleryState = $derived.by(() => {
		if (!browser) return { open: false, slideIndex: 0 };

		const slideParam = page.url.searchParams.get('slide');
		if (slideParam === null) {
			return { open: false, slideIndex: 0 };
		}

		const slideIndex = Number(slideParam);
		return {
			open: true,
			slideIndex: slideIndex
		};
	});

	// Gestionnaire pour l'ouverture de l'overlay sur une slide spécifique
	function handleOpenSlide(slideIndex: number) {
		if (!browser) return;

		// Push pour créer une nouvelle entrée dans l'historique
		goto(`?slide=${slideIndex}`, { replaceState: false, noScroll: true, keepFocus: true });
	}

	// Gestionnaire pour la navigation entre les slides
	function handleSlideChange(slideIndex: number) {
		if (!browser) return;

		// Replace pour ne pas polluer l'historique
		goto(`?slide=${slideIndex}`, { replaceState: true, noScroll: true, keepFocus: true });
	}

	// Gestionnaire pour la fermeture de l'overlay
	function handleClose() {
		if (!browser) return;

		// Replace pour revenir à la page sans paramètre slide
		goto('?', { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<svelte:head>
	<title>Galerie</title>
</svelte:head>
<h1 class="mb-8 text-center text-3xl font-bold">Galerie</h1>
<Gallery
	images={data.images}
	open={galleryState.open}
	currentSlide={galleryState.slideIndex}
	onOpenSlide={handleOpenSlide}
	onSlideChange={handleSlideChange}
	onClose={handleClose}
/>
