<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Hammer,
		Rocket,
		Info,
		Clock,
		CircleCheck,
		LoaderCircle,
		CircleX,
		GitMerge
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

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

	interface DeploymentStateInfo {
		label: string;
		color: string;
		icon: typeof CircleCheck;
	}

	// Local state
	let triggeringBuild = $state(false);
	let mergingBranches = $state(false);
	let lastBuildTime = $state<Date | null>(null);
	let latestProductionDeployment = $state<Deployment | null>(null);
	let latestPreviewDeployment = $state<Deployment | null>(null);
	let isConfigured = $state<boolean | null>(null);
	let pollingInterval = $state<number | null>(null);

	// Derived state for active deployments
	const activeDeployments = $derived(
		[latestProductionDeployment, latestPreviewDeployment].filter((d): d is Deployment => d !== null)
	);

	const hasActiveDeployment = $derived(
		activeDeployments.some((d) => ['BUILDING', 'QUEUED', 'INITIALIZING'].includes(d.state))
	);

	const allDeploymentsFinished = $derived(
		activeDeployments.length > 0 &&
			activeDeployments.every((d) => ['READY', 'ERROR', 'CANCELED'].includes(d.state))
	);

	const isPolling = $derived(pollingInterval !== null);

	// Fetch deployment status
	async function fetchDeploymentStatus(): Promise<void> {
		try {
			const response = await fetch('/api/build/status');
			const data = await response.json();

			if (response.ok) {
				isConfigured = data.configured;
				if (data.deployments && data.deployments.length > 0) {
					// Separate deployments by type
					const productionDeployments = data.deployments.filter(
						(d: Deployment) => d.target === 'production'
					);
					const previewDeployments = data.deployments.filter(
						(d: Deployment) => d.target === null || d.target === 'preview'
					);

					latestProductionDeployment =
						productionDeployments.length > 0 ? productionDeployments[0] : null;
					latestPreviewDeployment = previewDeployments.length > 0 ? previewDeployments[0] : null;
				}
			}
		} catch (error) {
			console.error('Error fetching deployment status:', error);
		}
	}

	// Start polling for status updates
	function startPolling(): void {
		if (pollingInterval !== null) return;

		// Fetch immediately
		fetchDeploymentStatus();

		// Then poll every 10 seconds
		pollingInterval = setInterval(fetchDeploymentStatus, 10000) as unknown as number;
	}

	// Stop polling
	function stopPolling(): void {
		if (pollingInterval !== null) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}

	// Trigger Vercel build
	async function triggerBuild(): Promise<void> {
		triggeringBuild = true;
		try {
			const response = await fetch('/api/build/deploy', {
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

	// Merge branches
	async function mergeBranches(): Promise<void> {
		mergingBranches = true;
		try {
			const response = await fetch('/api/build/merge', {
				method: 'POST'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to merge branches');
			}

			toast.success('Branches fusionnées avec succès !', {
				description: 'Preview a été fusionné dans main, puis main dans preview.'
			});
		} catch (error) {
			console.error('Error merging branches:', error);
			toast.error('Erreur lors de la fusion des branches', {
				description: error instanceof Error ? error.message : 'Une erreur est survenue'
			});
		} finally {
			mergingBranches = false;
		}
	}

	// Get deployment state info
	function getDeploymentStateInfo(state: DeploymentState): DeploymentStateInfo {
		switch (state) {
			case 'READY':
				return { label: 'Déployé', color: 'bg-green-500', icon: CircleCheck };
			case 'BUILDING':
				return { label: 'En cours', color: 'bg-blue-500', icon: LoaderCircle };
			case 'QUEUED':
			case 'INITIALIZING':
				return { label: 'En attente', color: 'bg-yellow-500', icon: Clock };
			case 'ERROR':
				return { label: 'Erreur', color: 'bg-red-500', icon: CircleX };
			case 'CANCELED':
				return { label: 'Annulé', color: 'bg-gray-500', icon: CircleX };
			default:
				return { label: state, color: 'bg-gray-500', icon: Info };
		}
	}

	// Format date
	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Format last build time
	const formattedLastBuildTime = $derived(
		lastBuildTime
			? lastBuildTime.toLocaleString('fr-FR', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})
			: null
	);

	// Initial fetch on mount
	$effect(() => {
		fetchDeploymentStatus();
	});

	// Cleanup polling on unmount
	$effect(() => {
		return () => {
			stopPolling();
		};
	});

	// Auto-start/stop polling based on deployment state
	$effect(() => {
		if (activeDeployments.length === 0) return;

		if (hasActiveDeployment && !isPolling) {
			// Start polling if any deployment is active and not already polling
			untrack(() => {
				console.log('Starting polling - deployment is active');
				startPolling();
			});
		} else if (allDeploymentsFinished && isPolling) {
			// Stop polling if all deployments are finished
			untrack(() => {
				console.log('Stopping polling - all deployments are finished');
				stopPolling();
			});
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
			<p class="mt-2 text-muted-foreground">Gère le preview, la prod. Hack Internet !</p>
		</div>

		{#if isConfigured === false}
			<div class="mb-6 rounded-md border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
				<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
					⚠️ Suivi des déploiements non configuré
				</p>
				<p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
					Ajoute VERCEL_API_TOKEN et VERCEL_PROJECT_ID dans tes variables d'environnement pour voir
					le statut en temps réel.
				</p>
			</div>
		{/if}

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Preview Deployment Card -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Rocket class="h-5 w-5" />
						Déploiement Preview
					</Card.Title>
					<Card.Description>
						Build de preview sur <a
							href="https://preview.doukypick.fr"
							target="_blank"
							class="text-primary hover:underline"
						>
							preview.doukypick.fr
						</a>
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Button size="lg" onclick={triggerBuild} disabled={triggeringBuild} class="w-full">
						<Hammer class="mr-2" />
						{triggeringBuild ? 'Build en cours...' : 'Déclencher un Build'}
					</Button>

					{#if formattedLastBuildTime}
						<p class="text-sm text-muted-foreground">
							Dernier build : {formattedLastBuildTime}
						</p>
					{/if}

					<!-- Preview Deployment Status -->
					{#if isConfigured && latestPreviewDeployment}
						{@const stateInfo = getDeploymentStateInfo(latestPreviewDeployment.state)}
						{@const StateIcon = stateInfo.icon}
						<div class="rounded-lg border p-3">
							<div class="mb-2 flex items-center gap-2">
								<StateIcon
									class="h-4 w-4 {latestPreviewDeployment.state === 'BUILDING'
										? 'animate-spin'
										: ''}"
								/>
								<span class="text-sm font-medium">{stateInfo.label}</span>
							</div>
							<span class="text-xs text-muted-foreground">
								{formatDate(latestPreviewDeployment.created)}
							</span>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Production Deployment Card -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Rocket class="h-5 w-5" />
						Déploiement Production
					</Card.Title>
					<Card.Description>
						Build de production sur <a
							href="https://doukypick.fr"
							target="_blank"
							class="text-primary hover:underline"
						>
							doukypick.fr
						</a>
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<Button size="lg" onclick={mergeBranches} disabled={mergingBranches} class="w-full">
						<GitMerge class="mr-2" />
						{mergingBranches ? 'Build en cours...' : 'Déclencher un Build'}
					</Button>

					<!-- Production Deployment Status -->
					{#if isConfigured && latestProductionDeployment}
						{@const stateInfo = getDeploymentStateInfo(latestProductionDeployment.state)}
						{@const StateIcon = stateInfo.icon}
						<div class="rounded-lg border p-3">
							<div class="mb-2 flex items-center gap-2">
								<StateIcon
									class="h-4 w-4 {latestProductionDeployment.state === 'BUILDING'
										? 'animate-spin'
										: ''}"
								/>
								<span class="text-sm font-medium">{stateInfo.label}</span>
							</div>
							<span class="text-xs text-muted-foreground">
								{formatDate(latestProductionDeployment.created)}
							</span>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
