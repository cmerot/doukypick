<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, Mail, Image, ChevronLeft, ChevronRight, Eye } from 'lucide-svelte';
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

		<!-- Submissions Table -->
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
			<div class="rounded-md border bg-card">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left text-sm font-medium">Actions</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Prénom</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Email</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Téléphone</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Type</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Date</th>
								<th class="px-4 py-3 text-left text-sm font-medium">Photos</th>
							</tr>
						</thead>
						<tbody>
							{#each data.submissions as submission}
								<tr class="border-b transition-colors hover:bg-muted/50">
									<td class="px-4 py-3">
										<Button
											variant="outline"
											size="sm"
											onclick={() => goto(`/admin/${submission.id}`)}
										>
											<Eye class="mr-1 h-3 w-3" />
											Voir
										</Button>
									</td>
									<td class="px-4 py-3">
										<div>
											<div class="font-medium">{submission.first_name}</div>
											{#if submission.pseudonym}
												<div class="text-sm text-muted-foreground">@{submission.pseudonym}</div>
											{/if}
										</div>
									</td>
									<td class="px-4 py-3 text-sm">
										{#if submission.email}
											<a href="mailto:{submission.email}" class="text-primary hover:underline">
												{submission.email}
											</a>
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-sm">
										{#if submission.phone}
											<a href="tel:{submission.phone}" class="text-primary hover:underline">
												{submission.phone}
											</a>
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										{#if submission.project_type}
											<div class="flex flex-wrap gap-1">
												{#each submission.project_type.split(',').slice(0, 2) as type}
													<Badge variant="secondary" class="text-xs">
														{type === 'flash'
															? 'Flash'
															: type === 'custom'
																? 'Personnalisé'
																: type === 'coverup'
																	? 'Recouvrement'
																	: type}
													</Badge>
												{/each}
												{#if submission.project_type.split(',').length > 2}
													<span class="text-xs text-muted-foreground"
														>+{submission.project_type.split(',').length - 2}</span
													>
												{/if}
											</div>
										{:else}
											<span class="text-sm text-muted-foreground">-</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-sm text-muted-foreground">
										{formatDate(submission.created_at)}
									</td>
									<td class="px-4 py-3 text-sm">
										{#if submission.photo_urls && submission.photo_urls.length > 0}
											<div class="flex items-center gap-1">
												<Image class="h-3 w-3" />
												<span>{submission.photo_urls.length}</span>
											</div>
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		<!-- Pagination -->
		{#if data.pagination.totalPages > 1}
			<div class="mt-8 flex items-center justify-between">
				<div class="text-sm text-muted-foreground">
					Page {data.pagination.currentPage} sur {data.pagination.totalPages}
					({data.pagination.totalCount} au total)
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
