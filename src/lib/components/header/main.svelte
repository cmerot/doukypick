<script lang="ts">
	import { Menu } from 'lucide-svelte';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import { page } from '$app/state';
	import siteSettings from '$content/settings/settings.json';
	import { cn } from '$lib/utils';

	// Props
	interface Props {
		isAuthenticated?: boolean;
		class?: string;
	}

	let { isAuthenticated = false, class: className }: Props = $props();

	// Local state for mobile menu
	let mobileMenuOpen = $state(false);

	// Navigation items
	const navigationItems = siteSettings.menu;

	// Check if current page is active
	function isActivePage(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<!-- Desktop Navigation -->
<NavigationMenu.Root class={cn('hidden md:flex', className)}>
	<NavigationMenu.List class="space-x-2">
		{#each navigationItems as item}
			<NavigationMenu.Item>
				<NavigationMenu.Link
					href={item.href}
					class="text-lg font-medium transition-colors hover:text-primary {isActivePage(item.href)
						? 'text-primary'
						: 'text-foreground/60'}"
				>
					{item.label}
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		{/each}
		{#if isAuthenticated}
			<NavigationMenu.Item>
				<NavigationMenu.Link
					href="/admin"
					class="text-lg font-medium transition-colors hover:text-primary {isActivePage('/admin')
						? 'text-primary'
						: 'text-foreground/60'}"
				>
					Admin
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		{/if}
	</NavigationMenu.List>
</NavigationMenu.Root>

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
				<Sheet.Title>Menu</Sheet.Title>
			</Sheet.Header>
			<div class="mx-2 flex flex-col space-y-2">
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
				{#if isAuthenticated}
					<a
						href="/admin"
						class="block rounded-md px-3 py-2 text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
						onclick={() => (mobileMenuOpen = false)}
					>
						Admin
					</a>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>
