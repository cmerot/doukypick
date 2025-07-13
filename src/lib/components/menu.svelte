<script>
	import { slide } from 'svelte/transition';
	import { base } from '$app/paths';

	let isMenuOpen = false;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<div class="mb-8 w-full text-center">
	<button
		class="cursor-pointer border-0 bg-transparent px-3 py-2 text-lg text-gray-700 transition-colors duration-200 hover:text-blue-600"
		on:click={toggleMenu}
	>
		Menu
	</button>

	{#if isMenuOpen}
		<div
			class="mt-1 mb-4 w-full overflow-hidden rounded border border-gray-300 bg-white shadow-lg"
			transition:slide={{ duration: 300 }}
		>
			<ul class="m-0 list-none p-0 text-center">
				<li class="border-b border-gray-200">
					<a
						href="{base}/"
						class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
						on:click={closeMenu}
					>
						Accueil
					</a>
				</li>
				<li class="border-b border-gray-200">
					<a
						href="{base}/boutique"
						class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
						on:click={closeMenu}
					>
						Boutique
					</a>
				</li>
				<li class="border-b border-gray-200">
					<a
						href="{base}/evenements"
						class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
						on:click={closeMenu}
					>
						Événements
					</a>
				</li>
				<li class="border-b border-gray-200">
					<a
						href="{base}/galerie"
						class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
						on:click={closeMenu}
					>
						Galerie
					</a>
				</li>
				<li class="border-b border-gray-200">
					<a
						href="{base}/soins"
						class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
						on:click={closeMenu}
					>
						Soins
					</a>
				</li>
				<li>
					<a
						href="{base}/contact"
						class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
						on:click={closeMenu}
					>
						Contact
					</a>
				</li>
			</ul>
		</div>
	{/if}
</div>
