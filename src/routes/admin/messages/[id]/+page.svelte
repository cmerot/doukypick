<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		ArrowLeft,
		Mail,
		Phone,
		Calendar,
		Image,
		ExternalLink,
		User,
		FileText,
		MessageSquare,
		CircleCheckBig,
		CircleX,
		Euro,
		Clock,
		Ruler,
		MapPin,
		Tag,
		Trash2
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let hasJavaScript = $state(false);

	// Detect JavaScript availability for progressive enhancement
	$effect(() => {
		hasJavaScript = true;
	});

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getProjectTypeLabel(type: string): string {
		switch (type) {
			case 'flash':
				return 'Flash';
			case 'custom':
				return 'Personnalisé';
			case 'coverup':
				return 'Recouvrement';
			default:
				return type;
		}
	}
</script>

<svelte:head>
	<title>Soumission #{data.submission.id} - Administration</title>
	<meta name="description" content="Détails de la soumission #{data.submission.id}" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8">
			<div class="mb-4 flex items-center justify-between">
				<Button variant="ghost" href="/admin/messages">
					<ArrowLeft class="mr-2 h-4 w-4" />
					Retour à la liste
				</Button>
			</div>
			<div class="flex items-center gap-4">
				<h1 class="text-3xl font-bold">{data.submission.first_name}</h1>
				<Badge variant="secondary">
					<Calendar class="mr-1" />
					{formatDate(data.submission.created_at)}
				</Badge>

				<!-- Delete form with progressive enhancement -->
				<form
					method="POST"
					action="?/delete"
					class="ml-auto"
					onsubmit={(e) => {
						e.preventDefault();
						showDeleteConfirm = true;
					}}
				>
					<Button type="submit" variant="destructive" disabled={isDeleting}>
						<Trash2 />
						<span class="sr-only hidden sm:not-sr-only sm:inline">Supprimer</span>
					</Button>
				</form>
			</div>
		</div>

		<!-- Warning message for no-JS users (hidden when JS is available) -->
		{#if !hasJavaScript}
			<div class="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4">
				<p class="text-sm font-medium text-destructive">
					⚠️ Attention : Le bouton "Supprimer" supprimera définitivement cette soumission sans
					confirmation supplémentaire.
				</p>
			</div>
		{/if}

		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Contact Information -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<User class="h-5 w-5" />
						Informations de contact
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<dl>
							<dt class="text-sm font-medium text-muted-foreground">Prénom</dt>
							<dd class="text-lg font-medium">{data.submission.first_name}</dd>
						</dl>

						{#if data.submission.email}
							<dl>
								<dt class="text-sm font-medium text-muted-foreground">Email</dt>
								<dd class="flex items-center gap-2">
									<Mail class="h-4 w-4 text-muted-foreground" />
									<a href="mailto:{data.submission.email}" class="text-primary hover:underline">
										{data.submission.email}
									</a>
								</dd>
							</dl>
						{/if}

						{#if data.submission.phone}
							<dl>
								<dt class="text-sm font-medium text-muted-foreground">Téléphone</dt>
								<dd class="flex items-center gap-2">
									<Phone class="h-4 w-4 text-muted-foreground" />
									<a href="tel:{data.submission.phone}" class="text-primary hover:underline">
										{data.submission.phone}
									</a>
								</dd>
							</dl>
						{/if}

						{#if data.submission.pseudonym}
							<dl>
								<dt class="text-sm font-medium text-muted-foreground">Pseudonyme</dt>
								<dd class="flex items-center gap-2">
									<span class="text-muted-foreground">@</span>
									<span>{data.submission.pseudonym}</span>
								</dd>
							</dl>
						{/if}

						{#if data.submission.is_adult}
							<dl>
								<dt class="text-sm font-medium text-muted-foreground">Majeur</dt>
								<dd class="flex items-center gap-2">
									{#if data.submission.is_adult === 'yes'}
										<CircleCheckBig class="h-4 w-4 text-success" />
										<Badge variant="default">Oui</Badge>
									{:else}
										<CircleX class="h-4 w-4 text-destructive" />
										<Badge variant="destructive">Non</Badge>
									{/if}
								</dd>
							</dl>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Project Details -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Tag class="h-5 w-5" />
						Détails du projet
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if data.submission.project_type}
						<dl>
							<dt class="text-sm font-medium text-muted-foreground">Type de projet</dt>
							<dd class="mt-1 flex flex-wrap gap-2">
								{#each data.submission.project_type.split(',') as type}
									<Badge variant="secondary">
										{getProjectTypeLabel(type)}
									</Badge>
								{/each}
							</dd>
						</dl>
					{/if}

					{#if data.submission.size}
						<dl>
							<dt class="text-sm font-medium text-muted-foreground">Taille</dt>
							<dd class="flex items-center gap-2">
								<Ruler class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.size}</span>
							</dd>
						</dl>
					{/if}

					{#if data.submission.placement}
						<dl>
							<dt class="text-sm font-medium text-muted-foreground">Emplacement</dt>
							<dd class="flex items-center gap-2">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.placement}</span>
							</dd>
						</dl>
					{/if}

					{#if data.submission.budget}
						<dl>
							<dt class="text-sm font-medium text-muted-foreground">Budget</dt>
							<dd class="flex items-center gap-2">
								<Euro class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.budget}</span>
							</dd>
						</dl>
					{/if}

					{#if data.submission.timeline}
						<dl>
							<dt class="text-sm font-medium text-muted-foreground">Délai</dt>
							<dd class="flex items-center gap-2">
								<Clock class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.timeline}</span>
							</dd>
						</dl>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Project Description -->
		<Card class="mt-6">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<FileText class="h-5 w-5" />
					Description du projet
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="rounded-md bg-muted/50 p-4 whitespace-pre-wrap">
					{data.submission.project_description}
				</div>
			</CardContent>
		</Card>

		<!-- Additional Comments -->
		{#if data.submission.additional_comments}
			<Card class="mt-6">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<MessageSquare class="h-5 w-5" />
						Commentaires supplémentaires
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="rounded-md bg-muted/50 p-4 whitespace-pre-wrap">
						{data.submission.additional_comments}
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Photos -->
		{#if data.submission.photo_urls && data.submission.photo_urls.length > 0}
			<Card class="mt-6">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Image class="h-5 w-5" />
						Photos ({data.submission.photo_urls.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
						{#each data.submission.photo_urls as photoUrl, index}
							<a
								href={photoUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="group relative block"
							>
								<img
									src={photoUrl}
									alt="Photo {index + 1}"
									class="aspect-square w-full rounded-md border object-cover transition-opacity group-hover:opacity-90"
								/>
								<div
									class="absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<ExternalLink class="h-6 w-6 text-white" />
								</div>
							</a>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Delete Confirmation Dialog -->
		{#if showDeleteConfirm}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<Card class="mx-4 w-full max-w-md">
					<CardHeader>
						<CardTitle class="text-destructive">Confirmer la suppression</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<p class="text-sm text-muted-foreground">
							Êtes-vous sûr de vouloir supprimer définitivement cette soumission ?
						</p>
						<p class="text-sm font-medium">
							Soumission #{data.submission.id} - {data.submission.first_name}
						</p>
						<p class="text-xs text-muted-foreground">
							Cette action ne peut pas être annulée. Toutes les données et images associées seront
							supprimées.
						</p>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								isDeleting = true;
								return async ({ result, update }) => {
									isDeleting = false;
									if (result.type === 'failure') {
										const errorMessage =
											(result.data as { error?: string })?.error || 'Erreur lors de la suppression';
										toast.error(errorMessage);
										showDeleteConfirm = false;
									} else if (result.type === 'error') {
										toast.error('Erreur lors de la suppression');
										showDeleteConfirm = false;
									}
									// Call update() to handle redirects
									await update();
								};
							}}
						>
							<div class="flex gap-2 pt-4">
								<Button
									type="button"
									variant="outline"
									onclick={() => (showDeleteConfirm = false)}
									disabled={isDeleting}
									class="flex-1"
								>
									Annuler
								</Button>
								<Button type="submit" variant="destructive" disabled={isDeleting} class="flex-1">
									{#if isDeleting}
										Suppression...
									{:else}
										Supprimer définitivement
									{/if}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		{/if}
	</div>
</div>
