<script lang="ts">
	import { Menu, LogOut } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import { Separator } from '$lib/components/ui/separator';
	import { page } from '$app/state';

	// Props
	interface Props {
		isAuthenticated: boolean;
	}

	let { isAuthenticated }: Props = $props();

	// Local state for mobile menu and logout
	let mobileMenuOpen = $state(false);
	let loggingOut = $state(false);

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
</script>

<a href="/admin" class="font-logo mr-auto ml-4 text-4xl">Admin</a>

<!-- Desktop Navigation -->
<div class="hidden items-center space-x-4 md:flex">
	<NavigationMenu.Root>
		<NavigationMenu.List class="space-x-2">
			{#each navigationItems as item}
				<NavigationMenu.Item>
					<NavigationMenu.Link
						href={item.href}
						data-sveltekit-reload={item.external}
						class="text-lg font-medium transition-colors hover:text-primary {isActivePage(item.href)
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
		<form
			method="POST"
			action="/admin/logout"
			use:enhance={() => {
				loggingOut = true;
				return async ({ update }) => {
					await update();
					loggingOut = false;
				};
			}}
		>
			<Button type="submit" variant="secondary" disabled={loggingOut}>
				<LogOut />
				{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
			</Button>
		</form>
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
			<div class="mx-2 flex flex-col space-y-2">
				{#each navigationItems as item}
					<a
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
					</a>
				{/each}
				{#if isAuthenticated}
					<Separator />
					<form
						method="POST"
						action="/admin/logout"
						use:enhance={() => {
							loggingOut = true;
							mobileMenuOpen = false;
							return async ({ update }) => {
								await update();
								loggingOut = false;
							};
						}}
					>
						<Button type="submit" variant="ghost" class="w-full" disabled={loggingOut}>
							<LogOut />
							{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
						</Button>
					</form>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>
