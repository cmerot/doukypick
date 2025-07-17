<script lang="ts">
	import type { JsonIndexItem } from '$lib/types/gallery';
	import { base } from '$app/paths';

	interface Props {
		item: JsonIndexItem;
		index: number;
		onclick?: () => void;
		aspectRatio?: string;
	}

	let { item, index, onclick, aspectRatio = '3/4' }: Props = $props();
	function handleClick(e: MouseEvent) {
		// Permettre l'ouverture dans un nouvel onglet avec clic droit ou Ctrl+clic
		if (e.ctrlKey || e.metaKey || e.button === 1) {
			return; // Laisser le comportement par défaut
		}

		e.preventDefault();
		onclick?.();
	}
</script>

<a
	href={`?slide=${index}`}
	onclick={handleClick}
	class="group aspect-[{aspectRatio}] block overflow-hidden rounded-sm shadow-md transition-shadow duration-300 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
	<picture>
		<source srcset="{base}{item.thumbnail.path}" type="image/webp" />
		<img
			src="{base}{item.thumbnail.fallback_path}"
			alt={item.description}
			loading="lazy"
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105"
		/>
	</picture>
</a>
