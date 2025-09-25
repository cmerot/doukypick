<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import * as Carousel from '$lib/components/ui/carousel';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import { page } from '$app/state';
	import PageTitle from '$lib/components/page-title/page-title.svelte';
	import PageSubtitle from '$lib/components/page-title/page-subtitle.svelte';
	import { fly } from 'svelte/transition';
	import OverlayClose from '$lib/components/overlay/overlay-close.svelte';
	import FullscreenCarousel from '$lib/components/gallery/fullscreen-carousel.svelte';

	let { data }: { data: PageData } = $props();

	let api = $state<CarouselAPI>();

	let isUpdatingFromUrl = $state(false);

	// UI state for overlay
	let showOverlay = $state(false);

	// Toggle overlay visibility
	function toggleOverlay() {
		showOverlay = !showOverlay;
	}

	// Handle carousel slide change
	$effect(() => {
		if (!api) return;
		api.on('select', () => {
			// Don't navigate if this change was triggered by URL update
			if (isUpdatingFromUrl) {
				return;
			}

			const current = api!.selectedScrollSnap();
			const newPhotoSlug = data.photos[current].slug;
			goto(`/photo/${data.gallery.id}/${newPhotoSlug}`, { noScroll: true, keepFocus: true });
		});
	});

	// Update carousel when URL changes (e.g., back button)
	$effect(() => {
		if (api && data.currentPhotoIndex !== api.selectedScrollSnap()) {
			isUpdatingFromUrl = true;
			api.scrollTo(data.currentPhotoIndex);
			// Reset flag after animation completes
			setTimeout(() => {
				isUpdatingFromUrl = false;
			}, 300);
		}
	});
	let previousPhoto = $derived(
		data.currentPhotoIndex > 0 ? data.photos[data.currentPhotoIndex - 1] : null
	);
	let nextPhoto = $derived(
		data.currentPhotoIndex < data.photos.length - 1 ? data.photos[data.currentPhotoIndex + 1] : null
	);
	// Preload adjacent images - only the best format the browser supports
	$effect(() => {
		const preloadPhoto = async (photo: any) => {
			if (typeof window === 'undefined') return;

			// Function to test image format support
			const supportsFormat = (format: string): Promise<boolean> => {
				return new Promise((resolve) => {
					const img = new Image();
					img.onload = () => resolve(true);
					img.onerror = () => resolve(false);

					// Use data URLs to test format support
					const testImages = {
						avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
						webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
					};

					img.src = testImages[format as keyof typeof testImages] || '';
				});
			};

			// Test formats in order of preference
			let formatToPreload;
			if (await supportsFormat('avif')) {
				formatToPreload = { srcset: photo.srcsets.avif, type: 'image/avif' };
			} else if (await supportsFormat('webp')) {
				formatToPreload = { srcset: photo.srcsets.webp, type: 'image/webp' };
			} else {
				formatToPreload = { srcset: photo.srcsets.jpg, type: 'image/jpeg' };
			}

			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = formatToPreload.srcset.split(' ')[0];
			link.type = formatToPreload.type;
			link.imageSrcset = formatToPreload.srcset;
			link.imageSizes = photo.sizes;
			document.head.appendChild(link);
		};

		if (previousPhoto) {
			preloadPhoto(previousPhoto);
		}
		if (nextPhoto) {
			preloadPhoto(nextPhoto);
		}
	});

	function close() {
		goto(data.gallery.closeUrl);
	}
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:image" content={data.meta.ogImage} />
	<meta property="og:image:alt" content={data.meta.ogImageAlt} />
	<meta property="og:url" content={page.url.href} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />
	<meta name="twitter:image" content={data.meta.ogImage} />
	<meta name="twitter:image:alt" content={data.meta.ogImageAlt} />

	<!-- Additional SEO -->
	<link rel="canonical" href={page.url.href} />

	<!-- Schema.org structured data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "VisualArtwork",
		"name": "${data.currentPhoto.title}",
		"description": "${data.meta.description}",
		"image": "${data.meta.ogImage}",
		"creator": {
			"@type": "Person",
			"name": "Doukypick"
		},
		"artMedium": "Tatouage",
		"isPartOf": {
			"@type": "Collection",
			"name": "${data.gallery.title}",
			"description": "${data.gallery.description}"
		}
	}
	</script>`}
</svelte:head>
<header>
	<PageTitle>{data.currentPhoto.title}</PageTitle>
	<PageSubtitle>{data.currentPhoto.description}</PageSubtitle>
</header>

{#if false}
	<FullscreenCarousel
		photos={data.photos}
		currentIndex={data.currentPhotoIndex}
		onSelect={() => {}}
		open={true}
	/>
{/if}

<main>
	<Carousel.Root
		setApi={(emblaApi) => (api = emblaApi)}
		opts={{ startIndex: data.currentPhotoIndex }}
		class="fixed inset-0 z-50 flex items-center bg-black"
	>
		<div>
			<Carousel.Content class="ml-0 h-screen w-screen">
				{#each data.photos as photo}
					<Carousel.Item class="relative flex items-center justify-center pl-0">
						{#if showOverlay}
							<div
								class="absolute right-0 bottom-0 left-0 z-30 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 text-white"
								transition:fly={{ y: 100, duration: 300 }}
							>
								<div class="mx-auto max-w-4xl">
									<h1 class="mb-3 text-2xl font-bold md:text-3xl">
										{data.currentPhoto.title}
									</h1>

									{#if data.currentPhoto.description}
										<p class="mb-4 text-lg text-gray-300 md:text-xl">
											{data.currentPhoto.description}
										</p>
									{/if}

									<!-- Gallery Info -->
									<div
										class="flex flex-col gap-2 text-sm text-gray-400 md:flex-row md:justify-between"
									>
										<div>
											<a
												href="/gallery/{data.gallery.id}"
												class="ml-1 text-white underline hover:text-gray-300"
											>
												{data.gallery.title}
											</a>
											<span class="ml-2"
												>• Photo {data.currentPhotoIndex + 1} de {data.photos.length}</span
											>
										</div>
										<div>
											© {new Date().getFullYear()} Doukypick
										</div>
									</div>

									<!-- Close hint -->
									<div class="mt-4 text-center text-xs text-gray-500">
										Cliquer n'importe où pour cacher les infos
									</div>
								</div>
							</div>
						{/if}

						<!-- Show info hint (when overlay is hidden) -->
						{#if !showOverlay}
							<div
								class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-sm"
								transition:fly={{ y: 50, duration: 300 }}
							>
								Cliquer pour afficher les infos
							</div>
						{/if}
						<button
							onclick={toggleOverlay}
							class="flex h-full w-full cursor-pointer items-center justify-center focus:outline-none"
							aria-label="Toggle photo information"
						>
							<picture class="h-full w-full">
								<source srcset={photo.srcsets.avif} sizes="100vw" type="image/avif" />
								<source srcset={photo.srcsets.webp} sizes="100vw" type="image/webp" />
								<img
									src={photo.urls.medium}
									srcset={photo.srcsets.jpg}
									sizes="100vw"
									alt={photo.alt}
									loading="lazy"
									class="h-full w-full object-contain"
								/>
							</picture>
						</button>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
		</div>
		<Carousel.Previous class="absolute top-1/2 left-4 z-10 -translate-y-1/2" />
		<Carousel.Next class="absolute top-1/2 right-4 z-10 -translate-y-1/2" />
		<OverlayClose class="absolute top-8 right-4 z-10 " onclick={() => close()} />
	</Carousel.Root>
</main>
