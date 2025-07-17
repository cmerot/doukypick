<script lang="ts">
	import logoImg from '$lib/assets/images/marion.jpg?w=200&format=webp';
	import type { PageData } from './$types';
	import GoogleReviews from '$lib/components/google-reviews.svelte';
	let { data }: { data: PageData } = $props();
	import Gallery from '$lib/components/gallery.svelte';

	let { reviews, rating, totalReviews } = $derived(data.reviewsData);
</script>

<section class="container">
	<div class="prose max-w-none">
		<p>
			<img src={logoImg} alt="Marion" class="float-left mt-0 mr-4 mb-2" width="200" height="267" />
			Dessinatrice depuis plus de 20 ans, j'ai longtemps travaillé dans l'univers de l'architecture et
			l'aménagement d'espace. Je me suis tournée vers l'art du tatouage il y a bientôt 7 ans, et en ai
			fait ma principale activité depuis 5 ans.
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
			N'hésitez pas à me contacter et/ou venir me rencontrer, pour parler de vos projets, ou adopter
			un de mes nombreux dessins disponibles.
		</p>

		<p><strong>Marion dite Douky</strong></p>
	</div>
</section>

<section>
	<h2 class="py-16 text-center text-3xl font-bold">Le P'tit Cap'</h2>
	<Gallery images={data.images} aspectRatio={'4/3'} />

	<!-- <Gallery data={galleryData} /> -->

	<div class="mt-8 mb-8 grid grid-cols-3 gap-1">
		<div class="col-span-2 h-full">
			<!-- <img src="{base}/images/salon/1.jpg" alt="Large photo" class="h-full w-full object-cover" /> -->
		</div>

		<div class="grid h-full grid-rows-2 gap-1">
			<div class="h-full">
				<!-- <img src="{base}/images/salon/3.jpg" alt="Top photo" class="h-full w-full object-cover" /> -->
			</div>
			<div class="h-full">
				<!-- <img
						src="{base}/images/salon/4.jpg"
						alt="Bottom photo"
						class="h-full w-full object-cover"
					/> -->
			</div>
		</div>
	</div>

	<div class="prose max-w-none">
		<p>
			Mon salon privé situé à Bègles, entièrement conçu pour la création et réalisation de vos
			tatouages, dans un univers calme, arboré et sans vis à vis.
		</p>

		<p>
			Je vous y accueille sur rendez-vous uniquement, du mardi au samedi de 10h30 à 18h, pour
			discuter et réaliser vos projets tatouages.
		</p>

		<p>
			N'hésitez pas à me contacter sur les réseaux sociaux ou par e-mail pour une étude
			personnalisée.
		</p>

		<p>À bientôt !</p>
	</div>
</section>

{#if reviews.length}
	<section>
		<h2 class="py-16 text-center text-3xl font-bold">Les avis Google</h2>

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
