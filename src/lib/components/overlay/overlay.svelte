<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { browser } from '$app/environment';
	import OverlayClose from './overlay-close.svelte';
	import { cubicOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';

	const FOCUSABLE_SELECTOR =
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
	const TRANSITIONS = {
		fade: { duration: 200 },
		scale: { duration: 300, easing: cubicOut }
	} as const;

	interface Props {
		open: boolean;
		onclose?: () => void;
		children: Snippet;
		ariaLabel?: string;
		closeButtonClass?: string;
	}

	let {
		open = $bindable(),
		onclose,
		children,
		ariaLabel = 'Modal dialog',
		closeButtonClass = 'absolute top-8 right-4 z-10'
	}: Props = $props();

	let contentRef = $state<HTMLDivElement>();
	let modalRef = $state<HTMLDivElement>();

	function close() {
		open = false;
		onclose?.();
	}

	function getFocusableElements(container: HTMLElement): HTMLElement[] {
		return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
	}

	function trapFocus(event: KeyboardEvent) {
		if (!modalRef) return;

		const focusableElements = getFocusableElements(modalRef);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
		} else {
			if (document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		} else if (event.key === 'Tab') {
			trapFocus(event);
		}
	}

	function focusFirstElement() {
		if (!contentRef || !modalRef) return;

		const contentFocusable = getFocusableElements(contentRef);
		if (contentFocusable.length > 0) {
			contentFocusable[0].focus();
			return;
		}

		const allFocusable = getFocusableElements(modalRef);
		if (allFocusable.length > 0) {
			allFocusable[0].focus();
		}
	}

	let previousFocus: HTMLElement | null = null;

	$effect(() => {
		if (!browser || !open) return;

		if (document.activeElement instanceof HTMLElement) {
			previousFocus = document.activeElement;
		}

		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = 'hidden';
		document.body.style.paddingRight = `${scrollbarWidth}px`;

		document.addEventListener('keydown', handleKeydown);

		requestAnimationFrame(() => {
			focusFirstElement();
		});

		return () => {
			document.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = '';
			document.body.style.paddingRight = '';

			if (previousFocus) {
				previousFocus.focus();
				previousFocus = null;
			}
		};
	});
</script>

{#if open}
	<div
		bind:this={modalRef}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black"
		transition:fade={TRANSITIONS.fade}
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel}
	>
		<OverlayClose class={closeButtonClass} onclose={close} type="button" aria-label="Close modal" />
		<div bind:this={contentRef} class="relative h-full w-full" transition:scale={TRANSITIONS.scale}>
			{@render children()}
		</div>
	</div>
{/if}
