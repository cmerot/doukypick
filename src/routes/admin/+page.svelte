<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Search,
		Mail,
		Phone,
		Calendar,
		Image,
		ChevronLeft,
		ChevronRight,
		ExternalLink
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	// Props from page.server.ts
	let { data }: { data: PageData } = $props();

	// Search state
	let searchTerm = $state(data.search || '');

	// Format date
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Handle search
	function handleSearch() {
		const url = new URL($page.url);
		if (searchTerm.trim()) {
			url.searchParams.set('search', searchTerm.trim());
		} else {
			url.searchParams.delete('search');
		}
		url.searchParams.delete('page'); // Reset to page 1 when searching
		goto(url.toString());
	}

	// Handle pagination
	function goToPage(pageNum: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', pageNum.toString());
		goto(url.toString());
	}

	// Clear search
	function clearSearch() {
		searchTerm = '';
		const url = new URL($page.url);
		url.searchParams.delete('search');
		url.searchParams.delete('page');
		goto(url.toString());
	}

	// Truncate text
	function truncateText(text: string, maxLength: number = 100): string {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	}
</script>

<svelte:head>
	<title>Administration - Messages de Contact</title>
	<meta name="description" content="Gestion des messages de contact reçus" />
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold">Messages de Contact</h1>
			<p class="mt-2 text-muted-foreground">
				Gestion des {data.pagination.totalCount} soumissions reçues
			</p>
		</div>

		<!-- Search Bar -->
		<div class="mb-6 flex gap-2">
			<div class="relative flex-1">
				<Search class="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
				<Input
					bind:value={searchTerm}
					placeholder="Rechercher par prénom, email, téléphone, pseudonyme ou description..."
					class="pl-10"
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
				/>
			</div>
			<Button onclick={handleSearch}>Rechercher</Button>
			{#if data.search}
				<Button variant="outline" onclick={clearSearch}>Effacer</Button>
			{/if}
		</div>

		<!-- Search Results Info -->
		{#if data.search}
			<div class="mb-4">
				<Badge variant="secondary">
					{data.pagination.totalCount} résultat(s) pour "{data.search}"
				</Badge>
			</div>
		{/if}

		<!-- Submissions Grid -->
		{#if data.submissions.length === 0}
			<div class="py-12 text-center">
				<Mail class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 class="mb-2 text-lg font-semibold">Aucun message trouvé</h3>
				<p class="text-muted-foreground">
					{data.search
						? "Essayez avec d'autres termes de recherche."
						: 'Aucun message de contact reçu pour le moment.'}
				</p>
			</div>
		{:else}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.submissions as submission}
					<Card class="transition-shadow hover:shadow-md">
						<CardHeader class="pb-3">
							<div class="flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<CardTitle class="truncate text-lg">{submission.first_name}</CardTitle>
									<CardDescription class="mt-1 flex items-center gap-2">
										<Calendar class="h-3 w-3" />
										{formatDate(submission.created_at)}
									</CardDescription>
								</div>
								<Badge variant="outline" class="ml-2">
									#{submission.id}
								</Badge>
							</div>
						</CardHeader>

						<CardContent class="space-y-3">
							<!-- Contact Info -->
							<div class="space-y-2">
								{#if submission.email}
									<div class="flex items-center gap-2 text-sm">
										<Mail class="h-3 w-3 text-muted-foreground" />
										<a
											href="mailto:{submission.email}"
											class="truncate text-primary hover:underline"
										>
											{submission.email}
										</a>
									</div>
								{/if}

								{#if submission.phone}
									<div class="flex items-center gap-2 text-sm">
										<Phone class="h-3 w-3 text-muted-foreground" />
										<a href="tel:{submission.phone}" class="text-primary hover:underline">
											{submission.phone}
										</a>
									</div>
								{/if}

								{#if submission.pseudonym}
									<div class="flex items-center gap-2 text-sm">
										<span class="h-3 w-3 text-muted-foreground">@</span>
										<span class="text-muted-foreground">
											{submission.pseudonym}
										</span>
									</div>
								{/if}
							</div>

							<!-- Project Details -->
							<div class="space-y-2 text-sm">
								{#if submission.is_adult}
									<div class="flex items-center gap-2">
										<span class="font-medium">Majeur:</span>
										<Badge variant={submission.is_adult === 'yes' ? 'default' : 'destructive'}>
											{submission.is_adult === 'yes' ? 'Oui' : 'Non'}
										</Badge>
									</div>
								{/if}

								{#if submission.project_type}
									<div>
										<span class="font-medium">Type:</span>
										<div class="mt-1 flex flex-wrap gap-1">
											{#each submission.project_type.split(',') as type}
												<Badge variant="secondary" class="text-xs">
													{type === 'flash' ? 'Flash' :
													 type === 'custom' ? 'Personnalisé' :
													 type === 'coverup' ? 'Recouvrement' : type}
												</Badge>
											{/each}
										</div>
									</div>
								{/if}

								{#if submission.size}
									<div><span class="font-medium">Taille:</span> {submission.size}</div>
								{/if}

								{#if submission.placement}
									<div><span class="font-medium">Emplacement:</span> {submission.placement}</div>
								{/if}

								{#if submission.budget}
									<div><span class="font-medium">Budget:</span> {submission.budget}</div>
								{/if}

								{#if submission.timeline}
									<div><span class="font-medium">Délai:</span> {submission.timeline}</div>
								{/if}
							</div>

							<!-- Description -->
							<div class="text-sm text-muted-foreground">
								<p class="leading-relaxed">
									{truncateText(submission.project_description)}
								</p>
							</div>

							{#if submission.additional_comments}
								<div class="rounded bg-muted/50 p-2 text-sm">
									<span class="font-medium">Commentaires supplémentaires:</span>
									<p class="mt-1 text-muted-foreground">
										{truncateText(submission.additional_comments)}
									</p>
								</div>
							{/if}

							<!-- Photos -->
							{#if submission.photo_urls && submission.photo_urls.length > 0}
								<div class="flex items-center gap-2">
									<Image class="h-3 w-3 text-muted-foreground" />
									<span class="text-xs text-muted-foreground">
										{submission.photo_urls.length} photo(s) jointe(s)
									</span>
								</div>

								<!-- Photo Thumbnails -->
								<div class="mt-2 flex gap-2">
									{#each submission.photo_urls.slice(0, 3) as photoUrl}
										<a
											href={photoUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="group relative"
										>
											<img
												src={photoUrl}
												alt="PJ"
												class="h-12 w-12 rounded border object-cover transition-opacity group-hover:opacity-80"
											/>
											<ExternalLink
												class="absolute inset-0 m-auto h-3 w-3 text-white opacity-0 transition-opacity group-hover:opacity-100"
											/>
										</a>
									{/each}
									{#if submission.photo_urls.length > 3}
										<div
											class="flex h-12 w-12 items-center justify-center rounded border bg-muted text-xs text-muted-foreground"
										>
											+{submission.photo_urls.length - 3}
										</div>
									{/if}
								</div>
							{/if}
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if data.pagination.totalPages > 1}
			<div class="mt-8 flex items-center justify-between">
				<div class="text-sm text-muted-foreground">
					Page {data.pagination.currentPage} sur {data.pagination.totalPages}
					({data.pagination.totalCount} total)
				</div>

				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={!data.pagination.hasPrevPage}
						onclick={() => goToPage(data.pagination.currentPage - 1)}
					>
						<ChevronLeft class="mr-1 h-4 w-4" />
						Précédent
					</Button>

					<!-- Page Numbers -->
					{#each Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
						const startPage = Math.max(1, data.pagination.currentPage - 2);
						return startPage + i;
					}).filter((p) => p <= data.pagination.totalPages) as pageNum}
						<Button
							variant={pageNum === data.pagination.currentPage ? 'default' : 'outline'}
							size="sm"
							onclick={() => goToPage(pageNum)}
						>
							{pageNum}
						</Button>
					{/each}

					<Button
						variant="outline"
						size="sm"
						disabled={!data.pagination.hasNextPage}
						onclick={() => goToPage(data.pagination.currentPage + 1)}
					>
						Suivant
						<ChevronRight class="ml-1 h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
