<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Hammer, Rocket, Info, ExternalLink } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Local state
	let triggeringBuild = $state(false);
	let lastBuildTime = $state<Date | null>(null);

	// Trigger Vercel build
	async function triggerBuild() {
		triggeringBuild = true;
		try {
			const response = await fetch('/admin/build', {
				method: 'POST'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to trigger build');
			}

			lastBuildTime = new Date();
			toast.success('Build déclenché avec succès !', {
				description: 'Le déploiement Vercel est en cours.'
			});
		} catch (error) {
			console.error('Error triggering build:', error);
			toast.error('Erreur lors du déclenchement du build', {
				description: error instanceof Error ? error.message : 'Une erreur est survenue'
			});
		} finally {
			triggeringBuild = false;
		}
	}
</script>

<svelte:head>
	<title>Administration - Build & Déploiement</title>
	<meta name="description" content="Déclenchement manuel des builds Vercel" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold">Build & Déploiement</h1>
			<p class="mt-2 text-muted-foreground">
				Déclenchez manuellement un build et un déploiement sur Vercel
			</p>
		</div>

		<!-- Main Build Card -->
		<Card.Root class="mb-6">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Rocket class="h-5 w-5" />
					Déploiement Manuel
				</Card.Title>
				<Card.Description>
					Utilisez ce bouton pour déclencher un nouveau build et déploiement sur Vercel
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Button
					size="lg"
					onclick={triggerBuild}
					disabled={triggeringBuild}
					class="w-full sm:w-auto"
				>
					<Hammer class="mr-2" />
					{triggeringBuild ? 'Build en cours...' : 'Déclencher un Build'}
				</Button>

				{#if lastBuildTime}
					<p class="text-sm text-muted-foreground">
						Dernier build déclenché : {lastBuildTime.toLocaleString('fr-FR', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Information Card -->
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Info class="h-5 w-5" />
					À propos des builds manuels
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="space-y-2 text-sm">
					<p>
						Les builds manuels sont utiles lorsque vous avez désactivé les déploiements automatiques
						sur Vercel. Cela vous permet de :
					</p>
					<ul class="ml-6 list-disc space-y-1 text-muted-foreground">
						<li>Contrôler exactement quand votre site est déployé</li>
						<li>Éviter les builds inutiles après chaque commit</li>
						<li>Tester les changements localement avant de déployer</li>
						<li>Économiser les minutes de build de votre plan Vercel</li>
					</ul>
				</div>

				<div class="rounded-md border border-border bg-muted/50 p-4">
					<p class="mb-2 text-sm font-medium">Configuration Vercel</p>
					<p class="text-sm text-muted-foreground">
						Pour désactiver les builds automatiques, allez dans les paramètres de votre projet
						Vercel → Git → Ignored Build Step et configurez :
					</p>
					<code class="mt-2 block rounded bg-background p-2 text-xs">
						exit 1
					</code>
				</div>

				<div class="flex items-center gap-2 pt-2">
					<Button variant="outline" size="sm" href="https://vercel.com/dashboard" target="_blank">
						<ExternalLink class="mr-2 h-4 w-4" />
						Ouvrir Vercel Dashboard
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
