<script lang="ts">
	import logoImg from '$lib/assets/images/marion.jpg';
	// import { base } from '$app/paths';
	import type { PageData } from './$types';
	import Gallery from '$lib/components/gallery.svelte';

	let { data }: { data: PageData } = $props();
</script>

<section class="about-section">
	<div class="intro prose">
		<p>
			<img src={logoImg} alt="Marion" width={200} class="float-left mt-0 mr-4 mb-2" />
			Dessinatrice depuis plus de 20 ans, j'ai longtemps travaillé dans l'univers de l'architecture et
			l'aménagement d'espace, je me suis tournée vers l'art du tatouage il y a bientôt 7ans, et en ai
			fait ma principale activité depuis 5ans.
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

		<p class="signature"><strong>Marion dite Douky</strong></p>
	</div>
</section>

<hr class="mt-8 mb-8" />
<section class="salon-section">
	<div class="salon-info">
		<div class="prose">
			<h2>Le P'tit Cap'</h2>
		</div>

		<Gallery data={data.galleryData} />

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

		<div class="prose">
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
	</div>
</section>
