<script lang="ts">
	let { children } = $props();
</script>

<h2 class="mx-auto mb-16 max-w-2xl text-center text-lg text-muted-foreground md:text-xl">
	{@render children()}
</h2>
