<script lang="ts">
	import { cn, createSrcset } from '$lib/utils';
	import type { Snippet } from 'svelte';

	// Props
	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className }: Props = $props();
</script>

<header
	class={cn(
		'sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
		className
	)}
>
	<div class="flex items-center justify-between">
		<!-- Logo -->
		<a href="/" aria-label="Doukypick">
			<img
				srcset={createSrcset('/images/logo.png', [160, 100])}
				sizes="(max-width:768px) 100px, 160px"
				alt="Doukypick"
				width="160"
				class="inline w-[120px] transition-all md:w-[160px] dark:invert"
			/>
		</a>

		{@render children()}
	</div>
	<div
		class="mt-3 mb-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent md:mt-6"
	></div>
</header>
