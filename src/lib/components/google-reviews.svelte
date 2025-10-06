<script lang="ts">
	import type { ReviewsData } from '$lib/types/google-places';
	import { cn } from '$lib/utils';
	import { ArrowRight } from 'lucide-svelte';
	import Button from './ui/button/button.svelte';

	interface Props {
		data: ReviewsData;
		showOverallRating?: boolean;
		maxReviews?: number;
		className?: string;
		title?: string;
	}

	let { data, showOverallRating = true, maxReviews, className = '', title }: Props = $props();

	// Destructure data
	const { reviews, rating, totalReviews } = data;

	// Reactive computation for displayed reviews
	let displayedReviews = $derived(maxReviews ? reviews.slice(0, maxReviews) : reviews);

	// Generate star array for ratings
	function generateStars(rating: number) {
		return Array(5)
			.fill(0)
			.map((_, i) => ({
				filled: i < Math.floor(rating),
				half: i === Math.floor(rating) && rating % 1 >= 0.5
			}));
	}

	// State for expanded reviews
	let expandedReviews = $state(new Set<number>());

	// Truncate long review text
	function truncateText(text: string, maxLength: number = 150) {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength).trim() + '...';
	}

	// Toggle review expansion
	function toggleReview(index: number) {
		if (expandedReviews.has(index)) {
			expandedReviews.delete(index);
		} else {
			expandedReviews.add(index);
		}
		expandedReviews = new Set(expandedReviews);
	}
</script>

{#if reviews && reviews.length > 0}
	<section class={cn('not-prose mb-4 max-w-none', className)}>
		{#if title}
			<h2 class="font-logo mt-10 mb-8 text-center text-4xl font-normal">{title}</h2>
		{/if}

		<div class="mb-8 text-center">
			{#if showOverallRating}
				<div
					class="mx-auto flex max-w-md items-center justify-center gap-4 rounded-lg bg-muted p-6"
				>
					<div class="text-4xl font-bold text-foreground">{rating.toFixed(1)}</div>

					<div class="flex flex-col items-center">
						<div class="mb-1 flex items-center gap-1">
							{#each generateStars(rating) as star}
								<svg
									class="h-5 w-5 {star.filled
										? 'text-yellow-400'
										: star.half
											? 'text-yellow-200'
											: 'text-muted-foreground'}"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							{/each}
						</div>
						<div class="text-sm text-muted-foreground">
							Basé sur {totalReviews.toLocaleString()} avis
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 md:grid-cols-3">
			{#each displayedReviews as review, index}
				<article
					class="rounded-lg border border-border bg-card p-6 shadow-md transition-shadow duration-200 hover:shadow-lg"
				>
					<header class="mb-4 flex items-start gap-4">
						<img
							src={review.authorAttribution.photoUri}
							alt={review.authorAttribution.displayName}
							class="h-12 w-12 rounded-full border-2 border-border object-cover"
							loading="lazy"
						/>

						<div class="min-w-0 flex-1">
							<h3 class="truncate font-semibold text-foreground">
								{review.authorAttribution.displayName}
							</h3>

							<div class="mt-1 mb-2 flex items-center gap-1">
								{#each generateStars(review.rating) as star}
									<svg
										class="h-4 w-4 {star.filled ? 'text-yellow-400' : 'text-muted-foreground'}"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								{/each}
								<span class="ml-1 text-sm text-muted-foreground">{review.rating}/5</span>
							</div>

							<time class="text-sm text-muted-foreground"
								>{review.relativePublishTimeDescription}</time
							>
						</div>
					</header>

					<div class="space-y-3">
						<p class="leading-relaxed text-foreground">
							{expandedReviews.has(index) ? review.text.text : truncateText(review.text.text)}
						</p>

						{#if review.text.text.length > 150}
							<button
								class="text-sm font-medium text-primary transition-colors hover:text-primary/80"
								onclick={() => toggleReview(index)}
							>
								{expandedReviews.has(index) ? 'Moins' : 'Plus'}
							</button>
						{/if}
					</div>
				</article>
			{/each}
		</div>

		<div class="mt-8 text-center">
			<Button
				size="lg"
				target="_blank"
				href="https://www.google.com/maps/place/Doukypick/@44.8031958,-0.5479507,17z/data=!4m8!3m7!1s0xd552762fca7328b:0xfc6badabeae95939!8m2!3d44.803192!4d-0.5453758!9m1!1b1!16s%2Fg%2F11s9_dby1d?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D"
			>
				<svg class="text-yellow-400' h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
					/>
				</svg>

				Voir les autres avis
				<svg class="text-yellow-400' h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
					/>
				</svg>
			</Button>
		</div>
	</section>
{/if}
