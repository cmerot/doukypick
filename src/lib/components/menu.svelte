<script>
	import { slide } from 'svelte/transition';
	import { base } from '$app/paths';

	let isMenuOpen = false;

	// Menu data
	const menuItems = [
		{ href: '/', label: 'Accueil' },
		{ href: '/boutique', label: 'Boutique' },
		// { href: '/evenements', label: 'Événements' }, // Commented out as in original
		{ href: '/galerie', label: 'Galerie' },
		{ href: '/soins', label: 'Soins' },
		{ href: '/contact', label: 'Contact' }
	];

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
				{#each menuItems as item, index}
					<li class={index < menuItems.length - 1 ? 'border-b border-gray-200' : ''}>
						<a
							href="{base}{item.href}"
							class="block px-4 py-3 text-gray-700 no-underline transition-colors duration-200 hover:bg-gray-100"
							on:click={closeMenu}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
