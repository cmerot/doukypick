<script lang="ts">
	import { optimize } from '$lib/image';

	let { children } = $props();
</script>

<div class="mb-12 flex items-center justify-center">
	<div class="flex-shrink-0">
		<img
			srcset={optimize('/images/crevette.png', [100, 160])}
			alt=""
			class="relative left-8 w-[100px] md:w-[160px]"
			sizes="(min-width: 768px) 160px, 100px"
		/>
	</div>
	<h1 class="font-logo mb-0 text-center text-3xl font-normal break-words sm:text-4xl md:text-5xl">
		{@render children()}
	</h1>
	<div class="flex-shrink-0">
		<img
			srcset={optimize('/images/crevette.png', [100, 160])}
			alt=""
			class="relative right-8 w-[100px] scale-x-[-1] md:w-[160px]"
			sizes="(min-width: 768px) 160px, 100px"
		/>
	</div>
</div>
