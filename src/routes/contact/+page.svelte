<script lang="ts">
	import ContactForm from '$lib/components/contact-form/contact-form.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import type { ActionData } from './$types';

	// Svelte 5 syntax pour les props de page
	let { form }: { form?: ActionData | null } = $props();
</script>

<svelte:head>
	<title>Contact - Doukypick tatoueuse</title>
	<meta name="description" content="Contactez-nous pour toute question ou demande d'information" />
</svelte:head>

<header>
	<PageTitle>Formulaire 1er contact</PageTitle>
	<PageSubtitle>
		Mon univers/style illustratif te plaît, et tu souhaites, me soumettre ton projet tattoo,
		réserver un flash (repéré sur les réseaux sociaux) ?
		<br />
		Remplis donc ce petit formulaire pour être recontacté•e au plus vite!
		<br />
		Merci pour l'intérêt que tu portes à mon travail!
		<br />
		À bientôt, Marion (dite Douky).
	</PageSubtitle>
</header>

<main>
	<ContactForm {form} />
</main>
