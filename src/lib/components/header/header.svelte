<script lang="ts">
	import { Menu, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';

	// Props
	interface Props {
		mobileMenuOpen: boolean;
	}

	let { mobileMenuOpen = $bindable() }: Props = $props();

	// Navigation items
	const navigationItems = [
		{ href: '/', label: 'Tatouages' },
		{ href: '/a-propos', label: 'À propos' },
		{ href: '/salon-le-ptit-cap', label: 'Le salon' },
		{ href: '/soins', label: 'Soins' },
		{ href: '/contact', label: 'Contact' }
	];

	// Toggle mobile menu
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	// Check if current page is active
	function isActivePage(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<header
	class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<nav
		class="flex h-20 items-center justify-between px-4 transition-all duration-300 ease-in-out md:h-28"
	>
		<!-- Logo -->
		<a href="/" aria-label="Doukypick">
			<enhanced:img
				src="./logo.png?w=160;100"
				alt="Doukypick"
				sizes="(max-width:768px) 100px, 160px"
				class="w-[100px] transition-all duration-300 ease-in-out md:w-[160px]"
			/>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center space-x-6 md:flex">
			{#each navigationItems as item}
				<a
					href={item.href}
					class="text-lg font-medium transition-colors hover:text-primary {isActivePage(item.href)
						? 'text-primary'
						: 'text-foreground/60'}"
				>
					{item.label}
				</a>
			{/each}
		</div>

		<!-- Mobile Menu Toggle -->
		<div class="md:hidden">
			<Button
				variant="ghost"
				onclick={toggleMobileMenu}
				size="lg"
				data-menu-toggle
				aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
			>
				{#if mobileMenuOpen}
					<X class="size-7" />
				{:else}
					<Menu class="size-7" />
				{/if}
			</Button>
		</div>
	</nav>

	<!-- Mobile Navigation -->
	{#if mobileMenuOpen}
		<div class="border-t bg-background/95 backdrop-blur md:hidden" data-mobile-menu>
			<div class="container mx-auto px-4 py-4">
				<div class="flex flex-col space-y-3">
					{#each navigationItems as item}
						<a
							href={item.href}
							class="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-primary {isActivePage(
								item.href
							)
								? 'bg-accent text-primary'
								: 'text-foreground'}"
							onclick={() => (mobileMenuOpen = false)}
						>
							{item.label}
						</a>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</header>
