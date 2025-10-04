<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
	<h1 class="mb-4 text-6xl font-bold text-primary">
		{page.status}
	</h1>
	<h2 class="mb-8 text-2xl font-semibold text-foreground">
		{page.status === 404 ? 'Page non trouvée' : 'Une erreur est survenue'}
	</h2>
	<p class="mb-8 max-w-md text-muted-foreground">
		{page.error?.message || "Désolé, quelque chose s'est mal passé."}
	</p>
	<a
		href="/admin"
		class="rounded-md bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
	>
		Retour à l'accueil
	</a>
</div>
