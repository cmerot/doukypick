<script>
	import { slide } from 'svelte/transition';

	let isMenuOpen = false;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<div class="menu-container">
	<button class="menu-trigger" on:click={toggleMenu}> Menu </button>

	{#if isMenuOpen}
		<div class="menu-dropdown" transition:slide={{ duration: 300 }}>
			<ul>
				<li><a href="/">Accueil</a></li>
				<li><a href="/boutique">Boutique</a></li>
				<li><a href="/evenements">Événements</a></li>
				<li><a href="/galerie">Galerie</a></li>
				<li><a href="/soins">Soins</a></li>
				<li><a href="/contact">Contact</a></li>
			</ul>
		</div>
	{/if}
</div>

<style>
	.menu-container {
		width: 100%;
		text-align: center;
	}

	.menu-trigger {
		background: none;
		border: none;
		font-size: 1.1rem;
		cursor: pointer;
		padding: 8px 12px;
		color: #333;
		transition: color 0.2s ease;
	}

	.menu-trigger:hover {
		color: #007bff;
	}

	.menu-dropdown {
		background: white;
		border: 1px solid #ddd;
		border-radius: 4px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		width: 100%;
		overflow: hidden;
		margin-top: 4px;
	}

	.menu-dropdown ul {
		list-style: none;
		margin: 0;
		padding: 0;
		text-align: center;
	}

	.menu-dropdown li {
		border-bottom: 1px solid #eee;
	}

	.menu-dropdown li:last-child {
		border-bottom: none;
	}

	.menu-dropdown a {
		display: block;
		padding: 12px 16px;
		text-decoration: none;
		color: #333;
		transition: background-color 0.2s ease;
	}

	.menu-dropdown a:hover {
		background-color: #f5f5f5;
	}
</style>
