<script lang="ts">
	import { onMount } from 'svelte';

	let screenHeight = $state(0);
	let viewportHeight = $state(0);
	let isFullscreen = $state(false);
	let mounted = $state(false);

	function updateHeights() {
		screenHeight = window.screen.height;
		viewportHeight = window.innerHeight;
	}

	function toggleFullscreen() {
		const element = document.documentElement as any;
		const doc = document as any;

		if (!isFullscreen) {
			element.requestFullscreen?.() ||
				element.webkitRequestFullscreen?.() ||
				element.mozRequestFullScreen?.();
		} else {
			doc.exitFullscreen?.() || doc.webkitExitFullscreen?.() || doc.mozCancelFullScreen?.();
		}
	}

	onMount(() => {
		updateHeights();
		mounted = true;

		const handleResize = () => updateHeights();
		const handleFullscreenChange = () => {
			const doc = document as any;
			isFullscreen = !!(
				doc.fullscreenElement ||
				doc.webkitFullscreenElement ||
				doc.mozFullScreenElement
			);
		};

		window.addEventListener('resize', handleResize);
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.addEventListener('mozfullscreenchange', handleFullscreenChange);

		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
			document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
		};
	});
</script>

{#if mounted}
	<div class="min-h-screen p-4">
		<div class="mb-8 text-center">
			<h1 class="mb-4 text-3xl font-bold">Mobile Fullscreen Demo</h1>
			<button
				onclick={toggleFullscreen}
				class="cursor-pointer rounded-lg border-2 border-white/40 bg-white/30 px-6 py-3 text-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/40"
			>
				{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
			</button>
		</div>

		<div class="mx-auto max-w-4xl space-y-8">
			<div class="rounded-xl border border-white/30 bg-white/20 p-6">
				<h2 class="mb-4 text-xl font-semibold">Screen Information</h2>
				<div class="space-y-3">
					<div class="flex items-center justify-between rounded-lg bg-white/10 p-3">
						<span class="font-medium">Screen Height:</span>
						<span class="font-mono text-sm">{screenHeight}px</span>
					</div>
					<div class="flex items-center justify-between rounded-lg bg-white/10 p-3">
						<span class="font-medium">Viewport Height:</span>
						<span class="font-mono text-sm">{viewportHeight}px</span>
					</div>
					<div class="flex items-center justify-between rounded-lg bg-white/10 p-3">
						<span class="font-medium">Address Bar Space:</span>
						<span class="font-mono text-sm">{screenHeight - viewportHeight}px</span>
					</div>
					<div class="flex items-center justify-between rounded-lg bg-white/10 p-3">
						<span class="font-medium">Fullscreen Status:</span>
						<span
							class="rounded px-2 py-1 font-mono text-sm {isFullscreen
								? 'bg-green-500/50 text-green-100'
								: 'bg-white/20'}"
						>
							{isFullscreen ? 'Active' : 'Inactive'}
						</span>
					</div>
				</div>
			</div>

			<div class="rounded-xl border border-white/30 bg-white/20 p-6">
				<h2 class="mb-4 text-xl font-semibold">Viewport Visualization</h2>
				<div class="overflow-hidden rounded-lg border-2 border-white/40 bg-black/30">
					<div class="border-b border-white/30 bg-white/20 p-3 text-center text-sm">
						Address Bar ({screenHeight - viewportHeight}px)
					</div>
					<div class="bg-white/10 p-8 text-center text-lg">
						Viewport Area ({viewportHeight}px)
					</div>
				</div>
			</div>

			<div class="rounded-xl border border-white/30 bg-white/20 p-6">
				<h2 class="mb-4 text-xl font-semibold">Mobile Address Bar Tips</h2>
				<div class="space-y-3">
					<div class="rounded-lg border-l-4 border-white/40 bg-white/10 p-4">
						Use <code class="rounded bg-black/40 px-2 py-1 font-mono text-sm">100vh</code> for full viewport
						height
					</div>
					<div class="rounded-lg border-l-4 border-white/40 bg-white/10 p-4">
						Use <code class="rounded bg-black/40 px-2 py-1 font-mono text-sm">100dvh</code> for dynamic
						viewport height (modern browsers)
					</div>
					<div class="rounded-lg border-l-4 border-white/40 bg-white/10 p-4">
						Use <code class="rounded bg-black/40 px-2 py-1 font-mono text-sm">100svh</code> for small
						viewport height (excluding address bar)
					</div>
					<div class="rounded-lg border-l-4 border-white/40 bg-white/10 p-4">
						Use <code class="rounded bg-black/40 px-2 py-1 font-mono text-sm">100lvh</code> for large
						viewport height (including address bar space)
					</div>
					<div class="rounded-lg border-l-4 border-white/40 bg-white/10 p-4">
						Monitor resize events to handle address bar show/hide
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
	>
		<div class="text-xl text-white">Loading...</div>
	</div>
{/if}
