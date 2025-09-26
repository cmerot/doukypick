<script lang="ts">
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import Gallery from '$lib/components/gallery/gallery.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import { salon } from '$content/galleries';
</script>

<svelte:head>
	<title>Le P'tit Cap', salon de tatouage</title>
	<meta
		name="description"
		content="Présentation du salon de Douky à Bègles, près de Bordeaux. Avec photos !"
	/>
</svelte:head>

<header>
	<PageTitle>Le P'tit Cap'</PageTitle>
	<PageSubtitle>
		Salon privé situé à Bègles, entièrement conçu pour la création et réalisation de vos tatouages,
		dans un univers calme, arboré et sans vis à vis.
	</PageSubtitle>
</header>

<main>
	<Gallery gallery={salon} initialIndex={salon.initialIndex || 0} />
	<section class="prose mt-4 min-w-full">
		<p>
			Je t'y accueille sur rendez-vous uniquement, du mardi au samedi de 10h30 à 18h, pour
			discuter et réaliser tes projets tatouages.
		</p>

		<p>
			N'hésite pas à me contacter sur les réseaux sociaux ou par e-mail pour une étude
			personnalisée.
		</p>

		<p>À bientôt !</p>
	</section>
</main>
