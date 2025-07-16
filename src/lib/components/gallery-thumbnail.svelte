<script lang="ts">
	import type { JsonIndexItem } from '$lib/types/gallery';
	import { base } from '$app/paths';

	interface Props {
		item: JsonIndexItem;
		index: number;
		updateUrlParam: (key: string, value: string | null) => void;
		aspectRatio?: string;
	}

	let { item, index, updateUrlParam, aspectRatio = '3/4' }: Props = $props();

	function handleClick(event: MouseEvent) {
		// Permettre l'ouverture dans un nouvel onglet avec clic droit ou Ctrl+clic
		if (event.ctrlKey || event.metaKey || event.button === 1) {
			return; // Laisser le comportement par défaut
		}

		event.preventDefault();
		updateUrlParam('slide', index.toString());
	}
</script>

<a
	href={`?slide=${index}`}
	onclick={handleClick}
	class="aspect-[{aspectRatio}] overflow-hidden rounded-sm shadow-md transition-shadow duration-300 hover:shadow-lg"
>
	<picture>
		<source srcset="{base}{item.thumbnail.path}" type="image/webp" />
		<img
			src="{base}{item.thumbnail.fallback_path}"
			alt={item.description}
			loading="lazy"
			class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
		/>
	</picture>
</a>
