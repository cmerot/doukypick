<script lang="ts">
	let { children } = $props();
</script>

<p class="mx-auto mb-16 max-w-2xl text-center text-xl text-muted-foreground">
	{@render children()}
</p>
