<script lang="ts">
	import Header from '$lib/components/header/header.svelte';
	import { fade } from 'svelte/transition';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// Store for mobile menu state
	let mobileMenuOpen = $state(false);

	// Close mobile menu when clicking outside
	function handleOutsideClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('[data-mobile-menu]') && !target.closest('[data-menu-toggle]')) {
			mobileMenuOpen = false;
		}
	}
</script>

<svelte:document on:click={handleOutsideClick} />

<div class="relative flex min-h-screen flex-col">
	<div class="container mx-auto max-w-4xl">
		<Header bind:mobileMenuOpen />
		{#key data.pathname}
			<main
				class="px-4 py-8 sm:px-4 md:px-20"
				in:fade={{ duration: 150, delay: 150 }}
				out:fade={{ duration: 150 }}
			>
				{@render children()}
			</main>
		{/key}
	</div>

	<footer class="mt-auto border-t border-gray-200 bg-gray-100 py-8">
		<div class="mx-auto max-w-2xl px-4">
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div>
					<h3 class="mb-4 font-semibold text-gray-900">Contact</h3>
					<div class="space-y-2 text-sm text-gray-600">
						<span class="font-medium">Adresse :</span><br />
						<address>
							<a
								href="https://maps.app.goo.gl/JzNUh39j34VvizLo8"
								target="_blank"
								rel="noopener noreferrer"
							>
								12 avenue du Maréchal de Lattre de Tassigny<br />
								33130 Bègles, France
							</a>
						</address>
						<p>
							<span class="font-medium">Email :</span><br />
							<a href="mailto:doukypick@gmail.com" class="text-blue-600 hover:text-blue-800">
								doukypick@gmail.com
							</a>
						</p>
					</div>
				</div>

				<div>
					<h3 class="mb-4 font-semibold text-gray-900">Suivez-moi</h3>
					<div class="flex space-x-4">
						<a
							href="https://www.instagram.com/doukypick/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-pink-600 transition-colors hover:text-pink-800"
							aria-label="Instagram"
						>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
								/>
							</svg>
						</a>
						<a
							href="https://www.facebook.com/doukypick/"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-600 transition-colors hover:text-blue-800"
							aria-label="Facebook"
						>
							<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
								<path
									d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>
