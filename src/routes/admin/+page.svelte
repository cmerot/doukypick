<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { MessageSquare, Hammer, FileEdit, Globe } from 'lucide-svelte';

	const menuItems = [
		{
			href: '/admin/build',
			title: 'Build',
			description: 'Déclenche le carnage ! Lance un build et mate-le cramer en temps réel',
			icon: Hammer,
			iconColor: 'text-orange-500'
		},
		{
			href: '/tina/index.html',
			title: 'TinaCMS',
			description: 'Modifie ton contenu sans toucher au code (ouf !)',
			icon: FileEdit,
			iconColor: 'text-green-500',
			external: true
		},
		{
			href: '/',
			title: 'Retour au site',
			description: "Casse-toi d'ici et va voir le site comme les autres mortels",
			icon: Globe,
			iconColor: 'text-purple-500'
		}
	];
</script>

<svelte:head>
	<title>Administration - Accueil</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Tableau de bord</h1>
		<p class="mt-2 text-muted-foreground">Yo ! Bienvenue dans le cockpit de ton site 🚀</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		{#each menuItems as item}
			<a href={item.href} data-sveltekit-reload={item.external} class="group">
				<Card.Root class="h-full transition-all hover:border-primary/50 hover:shadow-lg">
					<Card.Header>
						<div class="flex items-start gap-4">
							<div class="rounded-lg bg-muted p-2 transition-colors group-hover:bg-primary/10">
								<svelte:component this={item.icon} class="size-6 {item.iconColor}" />
							</div>
							<div class="flex-1">
								<Card.Title class="transition-colors group-hover:text-primary">
									{item.title}
								</Card.Title>
								<Card.Description class="mt-2">
									{item.description}
								</Card.Description>
							</div>
						</div>
					</Card.Header>
				</Card.Root>
			</a>
		{/each}
	</div>
</div>
