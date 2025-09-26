<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
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
		CheckCircle,
		XCircle,
		Euro,
		Clock,
		Ruler,
		MapPin,
		Tag
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
			<Button variant="ghost" onclick={() => goto('/admin')} class="mb-4">
				<ArrowLeft class="mr-2 h-4 w-4" />
				Retour à la liste
			</Button>
			<div class="flex items-center gap-4">
				<Badge variant="outline" class="text-base">#{data.submission.id}</Badge>
				<h1 class="text-3xl font-bold">{data.submission.first_name}</h1>
				<Badge variant="secondary">
					<Calendar class="mr-1 h-3 w-3" />
					{formatDate(data.submission.created_at)}
				</Badge>
			</div>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<!-- Contact Information -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<User class="h-5 w-5" />
						Informations de Contact
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-3">
						<div>
							<label class="text-sm font-medium text-muted-foreground">Prénom</label>
							<p class="text-lg font-medium">{data.submission.first_name}</p>
						</div>

						{#if data.submission.email}
							<div>
								<label class="text-sm font-medium text-muted-foreground">Email</label>
								<div class="flex items-center gap-2">
									<Mail class="h-4 w-4 text-muted-foreground" />
									<a
										href="mailto:{data.submission.email}"
										class="text-primary hover:underline"
									>
										{data.submission.email}
									</a>
								</div>
							</div>
						{/if}

						{#if data.submission.phone}
							<div>
								<label class="text-sm font-medium text-muted-foreground">Téléphone</label>
								<div class="flex items-center gap-2">
									<Phone class="h-4 w-4 text-muted-foreground" />
									<a href="tel:{data.submission.phone}" class="text-primary hover:underline">
										{data.submission.phone}
									</a>
								</div>
							</div>
						{/if}

						{#if data.submission.pseudonym}
							<div>
								<label class="text-sm font-medium text-muted-foreground">Pseudonyme</label>
								<div class="flex items-center gap-2">
									<span class="text-muted-foreground">@</span>
									<span>{data.submission.pseudonym}</span>
								</div>
							</div>
						{/if}

						{#if data.submission.is_adult}
							<div>
								<label class="text-sm font-medium text-muted-foreground">Majeur</label>
								<div class="flex items-center gap-2">
									{#if data.submission.is_adult === 'yes'}
										<CheckCircle class="h-4 w-4 text-green-600" />
										<Badge variant="default">Oui</Badge>
									{:else}
										<XCircle class="h-4 w-4 text-red-600" />
										<Badge variant="destructive">Non</Badge>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Project Details -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Tag class="h-5 w-5" />
						Détails du Projet
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if data.submission.project_type}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Type de projet</label>
							<div class="mt-1 flex flex-wrap gap-2">
								{#each data.submission.project_type.split(',') as type}
									<Badge variant="secondary">
										{getProjectTypeLabel(type)}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					{#if data.submission.size}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Taille</label>
							<div class="flex items-center gap-2">
								<Ruler class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.size}</span>
							</div>
						</div>
					{/if}

					{#if data.submission.placement}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Emplacement</label>
							<div class="flex items-center gap-2">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.placement}</span>
							</div>
						</div>
					{/if}

					{#if data.submission.budget}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Budget</label>
							<div class="flex items-center gap-2">
								<Euro class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.budget}</span>
							</div>
						</div>
					{/if}

					{#if data.submission.timeline}
						<div>
							<label class="text-sm font-medium text-muted-foreground">Délai</label>
							<div class="flex items-center gap-2">
								<Clock class="h-4 w-4 text-muted-foreground" />
								<span>{data.submission.timeline}</span>
							</div>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Project Description -->
		<Card class="mt-6">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<FileText class="h-5 w-5" />
					Description du Projet
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="whitespace-pre-wrap rounded-md bg-muted/50 p-4">
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
						Commentaires Supplémentaires
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="whitespace-pre-wrap rounded-md bg-muted/50 p-4">
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
	</div>
</div>