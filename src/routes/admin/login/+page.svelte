<script lang="ts">
	import { goto } from '$app/navigation';

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
				goto('/admin');
			} else {
				error = result.error || 'Authentication failed';
			}
		} catch (e) {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
		<h2 class="mb-6 text-center text-2xl font-bold">Admin Login</h2>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleLogin();
			}}
		>
			<div class="mb-4">
				<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
					Password
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					required
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{loading ? 'Authenticating...' : 'Login'}
			</button>
		</form>
	</div>
</div>