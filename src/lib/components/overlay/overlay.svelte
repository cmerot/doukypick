<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import OverlayClose from './overlay-close.svelte';

	interface Props {
		open: boolean;
		onclose?: () => void;
		children: any;
	}

	let { open = $bindable(), onclose, children }: Props = $props();
	let contentRef = $state<HTMLDivElement>();
	let modalRef = $state<HTMLDivElement>();
	let previouslyFocusedElement: HTMLElement | null = null;

	function close() {
		open = false;
		onclose?.();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		} else if (event.key === 'Tab') {
			trapFocus(event);
		}
	}

	function trapFocus(event: KeyboardEvent) {
		if (!modalRef) return;

		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
		const focusableElements = modalRef.querySelectorAll<HTMLElement>(focusableSelector);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (event.shiftKey) {
			// Shift+Tab: if on first element, go to last
			if (document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
		} else {
			// Tab: if on last element, go to first
			if (document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}
	}

	function focusFirstFocusableElement() {
		if (!contentRef) return;

		const focusableSelector =
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

		// First, try to find focusable elements in the content area
		const contentFocusableElements = contentRef.querySelectorAll<HTMLElement>(focusableSelector);

		if (contentFocusableElements.length > 0) {
			// Focus the first focusable element in the content
			contentFocusableElements[0].focus();
		} else {
			// Fallback: if no focusable content, focus the close button
			const allFocusableElements = modalRef?.querySelectorAll<HTMLElement>(focusableSelector);
			if (allFocusableElements && allFocusableElements.length > 0) {
				allFocusableElements[0].focus();
			}
		}
	}

	function storePreviousFocus() {
		if (browser && document.activeElement instanceof HTMLElement) {
			previouslyFocusedElement = document.activeElement;
		}
	}

	function restorePreviousFocus() {
		if (previouslyFocusedElement) {
			previouslyFocusedElement.focus();
			previouslyFocusedElement = null;
		}
	}

	function lockScroll() {
		if (!browser) return;

		// Calculer la largeur de la scrollbar
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

		// Appliquer le scroll lock et compenser la scrollbar
		document.body.style.overflow = 'hidden';
		document.body.style.paddingRight = `${scrollbarWidth}px`;
	}

	function unlockScroll() {
		if (!browser) return;

		// Restaurer le scroll et supprimer la compensation
		document.body.style.overflow = '';
		document.body.style.paddingRight = '';
	}

	// Ajouter/supprimer l'event listener quand l'overlay s'ouvre/ferme
	$effect(() => {
		if (browser && open) {
			// Store the previously focused element
			storePreviousFocus();

			document.addEventListener('keydown', handleKeydown);
			lockScroll();

			// Focus sur le premier élément focusable après l'ouverture
			// Use requestAnimationFrame for better timing
			requestAnimationFrame(() => {
				focusFirstFocusableElement();
			});

			return () => {
				document.removeEventListener('keydown', handleKeydown);
				unlockScroll();

				// Restore focus to previously focused element
				restorePreviousFocus();
			};
		}
	});
</script>

{#if open}
	<div
		bind:this={modalRef}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black"
		transition:fade={{ duration: 200 }}
		role="dialog"
		aria-modal="true"
		aria-label="Galerie d'images"
	>
		<!-- Bouton de fermeture -->
		<OverlayClose
			class="absolute top-2 right-2 z-10"
			onclick={close}
			type="button"
			aria-label="Fermer la galerie"
		/>
		<div
			bind:this={contentRef}
			class="relative max-h-full max-w-full"
			transition:scale={{ duration: 300, easing: cubicOut }}
		>
			{@render children()}
		</div>
	</div>
{/if}
