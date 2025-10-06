<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Hammer,
		Rocket,
		Info,
		ExternalLink,
		CheckCircle2,
		Loader2,
		XCircle,
		Clock
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { onMount, onDestroy } from 'svelte';

	type DeploymentState = 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';

	interface Deployment {
		id: string;
		url: string;
		state: DeploymentState;
		created: number;
		ready: number;
		target: string;
		creator: string;
	}

	// Local state
	let triggeringBuild = $state(false);
	let lastBuildTime = $state<Date | null>(null);
	let latestDeployment = $state<Deployment | null>(null);
	let isConfigured = $state<boolean | null>(null);
	let pollingInterval: NodeJS.Timeout | null = null;

	// Fetch deployment status
	async function fetchDeploymentStatus() {
		try {
			const response = await fetch('/admin/build/status');
			const data = await response.json();

			if (response.ok) {
				isConfigured = data.configured;
				if (data.deployments && data.deployments.length > 0) {
					latestDeployment = data.deployments[0];
				}
			}
		} catch (error) {
			console.error('Error fetching deployment status:', error);
		}
	}

	// Start polling for status updates
	function startPolling() {
		// Fetch immediately
		fetchDeploymentStatus();

		// Then poll every 10 seconds
		pollingInterval = setInterval(fetchDeploymentStatus, 10000);
	}

	// Stop polling
	function stopPolling() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}

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

			// Start polling for updates
			startPolling();
		} catch (error) {
			console.error('Error triggering build:', error);
			toast.error('Erreur lors du déclenchement du build', {
				description: error instanceof Error ? error.message : 'Une erreur est survenue'
			});
		} finally {
			triggeringBuild = false;
		}
	}

	// Get deployment state info
	function getDeploymentStateInfo(state: DeploymentState) {
		switch (state) {
			case 'READY':
				return { label: 'Déployé', color: 'bg-green-500', icon: CheckCircle2 };
			case 'BUILDING':
				return { label: 'En cours', color: 'bg-blue-500', icon: Loader2 };
			case 'QUEUED':
			case 'INITIALIZING':
				return { label: 'En attente', color: 'bg-yellow-500', icon: Clock };
			case 'ERROR':
				return { label: 'Erreur', color: 'bg-red-500', icon: XCircle };
			case 'CANCELED':
				return { label: 'Annulé', color: 'bg-gray-500', icon: XCircle };
			default:
				return { label: state, color: 'bg-gray-500', icon: Info };
		}
	}

	// Format date
	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	onMount(() => {
		// Fetch status on mount
		fetchDeploymentStatus();
	});

	onDestroy(() => {
		stopPolling();
	});

	// Auto-start/stop polling based on deployment state
	$effect(() => {
		if (!latestDeployment) return;

		const isActive = ['BUILDING', 'QUEUED', 'INITIALIZING'].includes(latestDeployment.state);
		const isFinished = ['READY', 'ERROR', 'CANCELED'].includes(latestDeployment.state);

		if (isActive && !pollingInterval) {
			// Start polling if deployment is active and not already polling
			console.log('Starting polling - deployment is active');
			startPolling();
		} else if (isFinished && pollingInterval) {
			// Stop polling if deployment is finished
			console.log('Stopping polling - deployment is finished');
			stopPolling();
		}
	});
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

				{#if isConfigured === false}
					<div class="rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
						<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
							⚠️ Suivi des déploiements non configuré
						</p>
						<p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
							Ajoutez VERCEL_API_TOKEN et VERCEL_PROJECT_ID dans vos variables d'environnement pour
							voir le statut en temps réel.
						</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Deployment Status Card (if configured) -->
		{#if isConfigured && latestDeployment}
			{@const stateInfo = getDeploymentStateInfo(latestDeployment.state)}
			<Card.Root class="mb-6 {latestDeployment.state === 'READY' ? 'border-green-500' : ''}">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<svelte:component this={stateInfo.icon} class="h-5 w-5" />
						Statut du Déploiement
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<!-- Big Status Button -->
					<div
						class="flex flex-col items-center justify-center rounded-lg border-2 {latestDeployment.state ===
						'READY'
							? 'border-green-500 bg-green-50 dark:bg-green-950/20'
							: latestDeployment.state === 'BUILDING'
								? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
								: 'border-gray-300 bg-gray-50 dark:bg-gray-950/20'} p-8"
					>
						<svelte:component
							this={stateInfo.icon}
							class="mb-4 h-16 w-16 {latestDeployment.state === 'BUILDING' ? 'animate-spin' : ''} {latestDeployment.state === 'READY' ? 'text-green-600 dark:text-green-400' : latestDeployment.state === 'BUILDING' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}"
						/>
						<h3
							class="mb-2 text-2xl font-bold {latestDeployment.state === 'READY' ? 'text-green-700 dark:text-green-300' : latestDeployment.state === 'BUILDING' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}"
						>
							{stateInfo.label}
						</h3>
						<p class="text-sm text-muted-foreground">
							Créé {formatDate(latestDeployment.created)}
						</p>
					</div>

					<!-- Deployment Details -->
					<div class="grid gap-2 text-sm">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">URL:</span>
							<a
								href="https://{latestDeployment.url}"
								target="_blank"
								class="flex items-center gap-1 text-primary hover:underline"
							>
								{latestDeployment.url}
								<ExternalLink class="h-3 w-3" />
							</a>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Environnement:</span>
							<Badge variant="secondary">{latestDeployment.target}</Badge>
						</div>
						{#if latestDeployment.creator}
							<div class="flex items-center justify-between">
								<span class="text-muted-foreground">Créé par:</span>
								<span>{latestDeployment.creator}</span>
							</div>
						{/if}
					</div>

					{#if latestDeployment.state === 'READY'}
						<Button
							size="lg"
							class="w-full bg-green-600 hover:bg-green-700"
							href="https://{latestDeployment.url}"
							target="_blank"
						>
							<CheckCircle2 class="mr-2" />
							Voir le Site Déployé
							<ExternalLink class="ml-2 h-4 w-4" />
						</Button>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}

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
