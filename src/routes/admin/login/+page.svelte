<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
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
					<Input type="password" name="password" id="password" required disabled={loading} />
				</div>
				{#if form?.error}
					<p class="text-sm text-destructive">{form.error}</p>
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
