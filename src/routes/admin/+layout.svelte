<script lang="ts">
	import { goto } from '$app/navigation';
	import { invalidateAll } from '$app/navigation';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogout() {
		try {
			await fetch('/api/admin/logout', {
				method: 'POST'
			});
			await invalidateAll(); // Refresh all server data to clear authentication state
		} catch (e) {
			console.error('Logout error:', e);
		} finally {
			goto('/');
		}
	}

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
				await invalidateAll(); // Refresh all server data including authentication state

				// Check if there's a redirect URL stored
				const redirectResponse = await fetch('/api/admin/redirect', {
					method: 'GET'
				});

				if (redirectResponse.ok) {
					const redirectData = await redirectResponse.json();
					if (redirectData.redirectUrl) {
						goto(redirectData.redirectUrl);
						return;
					}
				}

				goto('/admin');
			} else {
				error = result.error || 'Échec de l\'authentification';
			}
		} catch (e) {
			error = 'Erreur réseau. Veuillez réessayer.';
		} finally {
			loading = false;
		}
	}
</script>

<div class=" bg-gray-50">
	<header class="border-b bg-white shadow-sm">
		<div class="container mx-auto px-4 py-4">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<h1 class="text-xl font-semibold">Panneau d'administration</h1>
				{#if data.isAuthenticated}
					<button
						onclick={handleLogout}
						class="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 sm:shrink-0"
					>
						Se déconnecter
					</button>
				{:else}
					<form
						onsubmit={(e) => {
							e.preventDefault();
							handleLogin();
						}}
						class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2"
					>
						<input
							type="password"
							bind:value={password}
							placeholder="Mot de passe"
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
							required
							disabled={loading}
						/>
						<button
							type="submit"
							disabled={loading}
							class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:shrink-0"
						>
							{loading ? 'Connexion...' : 'Se connecter'}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</header>
	{#if error}
		<div class="border-b bg-red-50 px-4 py-2">
			<div class="container mx-auto">
				<div class="text-sm text-red-600">{error}</div>
			</div>
		</div>
	{/if}
	{@render children()}
</div>
