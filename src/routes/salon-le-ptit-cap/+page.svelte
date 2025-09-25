<script lang="ts">
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import PhotoGallery from '$lib/components/gallery/photo-gallery.svelte';
	import salonGallery from '$content/galleries/salon/gallery.json';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
</script>

<header>
	<PageTitle>Le P'tit Cap'</PageTitle>
	<PageSubtitle>
		Salon privé situé à Bègles, entièrement conçu pour la création et réalisation de vos tatouages,
		dans un univers calme, arboré et sans vis à vis.</PageSubtitle
	>
</header>

<main>
	<PhotoGallery gallery={salonGallery} />
	<section class="prose min-w-full">
		<p>
			Je vous y accueille sur rendez-vous uniquement, du mardi au samedi de 10h30 à 18h, pour
			discuter et réaliser vos projets tatouages.
		</p>

		<p>
			N'hésitez pas à me contacter sur les réseaux sociaux ou par e-mail pour une étude
			personnalisée.
		</p>

		<p>À bientôt !</p>
	</section>
</main>
