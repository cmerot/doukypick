<script lang="ts">
	interface GoogleReview {
		authorAttribution: {
			displayName: string;
			uri: string;
			photoUri: string;
		};
		rating: number;
		text: {
			text: string;
			languageCode: string;
		};
		originalText: {
			text: string;
			languageCode: string;
		};
		relativePublishTimeDescription: string;
		publishTime: string;
	}

	interface Props {
		reviews: GoogleReview[];
		rating: number;
		totalReviews: number;
		showOverallRating?: boolean;
		maxReviews?: number;
		className?: string;
	}

	let {
		reviews,
		rating,
		totalReviews,
		showOverallRating = true,
		maxReviews,
		className = ''
	}: Props = $props();

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
	<section class="w-full {className} mb-4">
		<div class="mb-8 text-center">
			{#if showOverallRating}
				<div
					class="mx-auto flex max-w-md items-center justify-center gap-4 rounded-lg bg-gray-50 p-6"
				>
					<div class="text-4xl font-bold text-gray-900">{rating.toFixed(1)}</div>

					<div class="flex flex-col items-center">
						<div class="mb-1 flex items-center gap-1">
							{#each generateStars(rating) as star}
								<svg
									class="h-5 w-5 {star.filled
										? 'text-yellow-400'
										: star.half
											? 'text-yellow-200'
											: 'text-gray-300'}"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							{/each}
						</div>
						<div class="text-sm text-gray-600">
							Basé sur {totalReviews.toLocaleString()} avis
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each displayedReviews as review, index}
				<article
					class="rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg"
				>
					<header class="mb-4 flex items-start gap-4">
						<img
							src={review.authorAttribution.photoUri}
							alt={review.authorAttribution.displayName}
							class="h-12 w-12 rounded-full border-2 border-gray-100 object-cover"
							loading="lazy"
						/>

						<div class="min-w-0 flex-1">
							<h3 class="truncate font-semibold text-gray-900">
								{review.authorAttribution.displayName}
							</h3>

							<div class="mt-1 mb-2 flex items-center gap-1">
								{#each generateStars(review.rating) as star}
									<svg
										class="h-4 w-4 {star.filled ? 'text-yellow-400' : 'text-gray-300'}"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								{/each}
								<span class="ml-1 text-sm text-gray-600">{review.rating}/5</span>
							</div>

							<time class="text-sm text-gray-500">{review.relativePublishTimeDescription}</time>
						</div>
					</header>

					<div class="space-y-3">
						<p class="leading-relaxed text-gray-700">
							{expandedReviews.has(index) ? review.text.text : truncateText(review.text.text)}
						</p>

						{#if review.text.text.length > 150}
							<button
								class="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
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
			<a
				href="https://www.google.com/maps/place/Doukypick/@44.8031958,-0.5479507,17z/data=!4m8!3m7!1s0xd552762fca7328b:0xfc6badabeae95939!8m2!3d44.803192!4d-0.5453758!9m1!1b1!16s%2Fg%2F11s9_dby1d?entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D"
				class="inline-flex items-center rounded-md border border-transparent bg-black px-6 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				Voir les autres avis
				<svg class="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
		</div>
	</section>
{/if}
