<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	async function handleLogin() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/admin/auth', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password })
			});

			const result = await response.json();

			if (response.ok) {
				password = '';
				error = '';
				await invalidateAll(); // Refresh all server data, triggers +page.server.ts which handles redirect
			} else {
				error = result.error || "Échec de l'authentification";
			}
		} catch (e) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}
</script>

<form
	onsubmit={(e) => {
		e.preventDefault();
		handleLogin();
	}}
>
	<Card.Root>
		<Card.Header>
			<Card.Title>Authentification requise</Card.Title>
			<Card.Description>Saisis ton mot de passe pour accéder à l'admin.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="password">Mot de passe</Label>
					<Input type="password" bind:value={password} required disabled={loading} />
				</div>
				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}
			</div>
		</Card.Content>
		<Card.Footer>
			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Connexion...' : 'Se connecter'}
			</Button>
		</Card.Footer>
	</Card.Root>
</form>
