<script lang="ts">
	import { createSrcset } from '$lib/utils';

	let { children } = $props();
</script>

<h1
	class="font-logo mb-12 flex items-center justify-center text-center text-3xl break-words sm:text-4xl md:text-5xl"
>
	<img
		srcset={createSrcset('/images/crevette.png', [100, 160])}
		alt=""
		width="160"
		class="relative left-8 w-[100px] shrink-0 md:w-[160px] dark:invert"
		sizes="(min-width: 768px) 160px, 100px"
	/>
	{@render children()}
	<img
		srcset={createSrcset('/images/crevette.png', [100, 160])}
		alt=""
		width="160"
		class="relative right-8 w-[100px] shrink-0 -scale-x-100 md:w-[160px] dark:invert"
		sizes="(min-width: 768px) 160px, 100px"
	/>
</h1>
