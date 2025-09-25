<script lang="ts">
	import type { PageData } from './$types';
	import GoogleReviews from '$lib/components/google-reviews.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	let { data }: { data: PageData } = $props();
	let { reviews, rating, totalReviews } = $derived(data.reviewsData);
	import PageTitle from '$lib/components/page-title/page-title.svelte';
</script>

<svelte:head>
	<title>À propos - Doukypick, tatoueuse et dessinatrice</title>
	<meta name="description" content="Présentation de Marion 'Douky', et avis Google" />
</svelte:head>

<header>
	<PageTitle>À propos</PageTitle>
	<PageSubtitle>Doukypick, tatoueuse et dessinatrice</PageSubtitle>
</header>
<main>
	<section>
		<div class="m-auto prose max-w-full">
			<p>
				<enhanced:img
					src="$lib/assets/marion.jpg?w=200"
					alt="Marion"
					class="float-left mt-0 mr-4 mb-2 border-4 border-black"
					width="200"
					height="267"
				/>
				Dessinatrice depuis plus de 20 ans, j'ai longtemps travaillé dans l'univers de l'architecture
				et l'aménagement d'espace. Je me suis tournée vers l'art du tatouage il y a bientôt 7 ans, et
				en ai fait ma principale activité depuis 5 ans.
			</p>

			<p>
				Du stylo au dermographe, du papier à votre peau, le tatouage lie 2 de mes principales
				passions, le dessin et l'aventure humaine !
			</p>

			<p>
				Mon goût pour la faune (terrestre comme aquatique), la flore, ainsi que l'architecture,
				s'épanouit au travers de créations originales qu'il me plaît d'adapter sur le corps humain.
			</p>

			<p>
				Mon style, souvent décrit comme "illustratif", me permet de traiter un grand nombre de sujet
				(allant du classique d'une rose, à la modernité d'une architecture fantasmatique).
			</p>

			<p>
				N'hésitez pas à me contacter et/ou venir me rencontrer, pour parler de vos projets, ou
				adopter un de mes nombreux dessins disponibles.
			</p>

			<p><strong>Marion dite Douky</strong></p>
		</div>
	</section>
	{#if reviews.length}
		<hr class="mt-12" />
		<section>
			<h2 class="font-logo mt-10 mb-8 text-center text-4xl font-normal">Les avis Google</h2>

			<div class="container mx-auto px-4">
				<GoogleReviews
					{reviews}
					{rating}
					{totalReviews}
					showOverallRating={true}
					maxReviews={3}
					className="max-w-6xl mx-auto"
				/>
			</div>
		</section>
	{/if}
</main>
