<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		children: Snippet;
	}

	let { children, open = $bindable(false) }: Props = $props();

	let childrenContainer: HTMLDivElement | undefined = $state();

	onMount(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (open && event.key === 'Escape') {
				open = false;
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	});

	// Fonction pour obtenir les éléments focusables
	function getFocusableElements(container: HTMLElement): HTMLElement[] {
		const selector = [
			'a[href]',
			'button:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"])',
			'[contenteditable="true"]'
		].join(', ');

		const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
		return elements.filter((el) => {
			const style = window.getComputedStyle(el);
			return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
		});
	}

	// Gestion du scroll et du focus
	$effect(() => {
		if (open && childrenContainer) {
			// Calculer la largeur de la scrollbar
			const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

			// Désactiver le scroll et compenser la scrollbar
			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = `${scrollbarWidth}px`;

			// Focus sur le premier élément focusable dans les children
			setTimeout(() => {
				const focusableElements = getFocusableElements(childrenContainer!);
				if (focusableElements.length > 0) {
					focusableElements[0].focus();
				}
			}, 0);

			// Fonction de nettoyage
			return () => {
				// Réactiver le scroll
				document.body.style.overflow = '';
				document.body.style.paddingRight = '';
			};
		}
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-10 flex items-center justify-center bg-black p-4 transition-opacity duration-300"
		role="dialog"
		aria-modal="true"
		aria-label="Fenêtre modale"
	>
		<button
			onclick={() => (open = !open)}
			class="absolute top-4 right-4 z-10 rounded-full bg-white p-2 transition-colors hover:bg-gray-100"
			aria-label="Fermer"
		>
			<X class="h-5 w-5" />
		</button>
		<div bind:this={childrenContainer} class="relative mx-10 w-full">
			{@render children()}
		</div>
	</div>
{/if}
