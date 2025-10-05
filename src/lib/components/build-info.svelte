<script lang="ts">
	import { FolderGit2, Ship } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';

	// Props
	interface Props {
		class?: string;
	}

	const { class: className }: Props = $props();
</script>

<Button
	href={import.meta.env.VITE_COMMIT_URL}
	target="_blank"
	rel="noopener noreferrer"
	class={cn('opacity-30 hover:opacity-60', className)}
	size="sm"
	variant="outline"
>
	<FolderGit2 size={16} class="mr-1" />
	{import.meta.env.VITE_BUILD_COMMIT}
	<Ship size={16} class="mx-1" />
	{new Date(import.meta.env.VITE_BUILD_DATE).toLocaleDateString()}
</Button>
