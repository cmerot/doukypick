<script lang="ts">
	import { Menu, LogOut } from 'lucide-svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import { Separator } from '$lib/components/ui/separator';
	import { page } from '$app/state';
	import { createSrcset } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';

	// Props
	interface Props {
		isAuthenticated: boolean;
	}

	let { isAuthenticated }: Props = $props();

	// Local state for mobile menu
	let mobileMenuOpen = $state(false);

	// Navigation items
	const allNavigationItems = [
		{ href: '/admin/messages', label: 'Messages', requiresAuth: true, external: false },
		{ href: '/tina/index.html', label: 'TinaCMS', requiresAuth: true, external: true },
		{ href: '/', label: 'Site', requiresAuth: false, external: false }
	];

	// Filter navigation items based on authentication status
	const navigationItems = $derived(
		isAuthenticated ? allNavigationItems : allNavigationItems.filter((item) => !item.requiresAuth)
	);

	// Check if current page is active
	function isActivePage(href: string): boolean {
		return page.url.pathname === href;
	}

	async function handleLogout() {
		try {
			await fetch('/api/admin/logout', {
				method: 'POST'
			});
			await invalidateAll(); // Refresh all server data to clear authentication state
		} catch (e) {
			console.error('Logout error:', e);
		}
	}
</script>

<header
	class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<nav
		class="flex h-20 items-center justify-between px-4 transition-all duration-300 ease-in-out md:h-28"
	>
		<!-- Logo -->
		<a href="/admin" aria-label="Doukypick">
			<img
				srcset={createSrcset('/images/logo.png', [160, 100])}
				sizes="(max-width:768px) 100px, 160px"
				alt="Doukypick"
				class="inline w-[100px] transition-all duration-300 ease-in-out md:w-[160px] dark:invert"
			/>
			<span class="font-logo text-4xl">Admin</span>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center space-x-4 md:flex">
			<NavigationMenu.Root>
				<NavigationMenu.List class="space-x-2">
					{#each navigationItems as item}
						<NavigationMenu.Item>
							<NavigationMenu.Link
								href={item.href}
								data-sveltekit-reload={item.external}
								class="text-lg font-medium transition-colors hover:text-primary {isActivePage(
									item.href
								)
									? 'text-primary'
									: 'text-foreground/60'}"
							>
								{item.label}
							</NavigationMenu.Link>
						</NavigationMenu.Item>
					{/each}
				</NavigationMenu.List>
			</NavigationMenu.Root>
			{#if isAuthenticated}
				<Button onclick={handleLogout} variant="secondary">
					<LogOut />
					Se déconnecter
				</Button>
			{/if}
		</div>

		<!-- Mobile Menu Sheet -->
		<div class="md:hidden">
			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger
					class={buttonVariants({ variant: 'ghost', size: 'lg' })}
					aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
				>
					<Menu class="size-7" />
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-[300px] sm:w-[400px]">
					<Sheet.Header>
						<Sheet.Title>Menu Admin</Sheet.Title>
						<Sheet.Description>Navigation administrative</Sheet.Description>
					</Sheet.Header>
					<Separator class="my-4" />
					<div class="flex flex-col space-y-3">
						{#each navigationItems as item}
							<NavigationMenu.Link
								href={item.href}
								data-sveltekit-reload={item.external}
								class="block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-primary {isActivePage(
									item.href
								)
									? 'bg-accent text-primary'
									: 'text-foreground'}"
								onclick={() => (mobileMenuOpen = false)}
							>
								{item.label}
							</NavigationMenu.Link>
						{/each}
						{#if isAuthenticated}
							<Separator class="my-2" />
							<Button onclick={handleLogout} class="justify-normal">
								<LogOut />
								Se déconnecter
							</Button>
						{/if}
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</nav>
</header>
