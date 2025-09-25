<script lang="ts">
	import { goto } from '$app/navigation';
	let { children } = $props();

	async function handleLogout() {
		try {
			await fetch('/api/admin/logout', {
				method: 'POST'
			});
		} catch (e) {
			console.error('Logout error:', e);
		} finally {
			goto('/');
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<header class="border-b bg-white shadow-sm">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<h1 class="text-xl font-semibold">Admin Panel</h1>
			<button
				onclick={handleLogout}
				class="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
			>
				Logout
			</button>
		</div>
	</header>
	{@render children()}
</div>
