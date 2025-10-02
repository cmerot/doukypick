<script lang="ts">
	import { Upload, X } from 'lucide-svelte';
	import { createSrcset } from '$lib/utils';
	import { formatFileSize } from './utils';
	import { Label } from '$lib/components/ui/label';
	import * as Form from '$lib/components/ui/form';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { ContactFormType } from '$lib/schemas/contact-form';

	let { form, resetPhotos = $bindable() }: { form: SuperForm<ContactFormType>; resetPhotos?: () => void } = $props();

	let fileInput = $state<HTMLInputElement | undefined>();
	let photos = $state<File[]>([]);

	const MAX_FILES = 5;
	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

	// Expose reset function to parent
	resetPhotos = () => {
		photos = [];
	};

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files) {
			const newFiles = Array.from(files);
			const availableSlots = MAX_FILES - photos.length;

			if (newFiles.length > availableSlots) {
				alert(`Vous ne pouvez ajouter que ${availableSlots} photo(s) supplémentaire(s)`);
				return;
			}

			const validFiles = newFiles.filter((file) => {
				const isValidType = file.type.startsWith('image/');
				const isValidSize = file.size <= MAX_FILE_SIZE;

				if (!isValidType) {
					alert(`${file.name} n'est pas un fichier image valide`);
					return false;
				}

				if (!isValidSize) {
					alert(`${file.name} est trop volumineux (max 10MB)`);
					return false;
				}

				return true;
			});

			photos = [...photos, ...validFiles];
		}

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function removePhoto(index: number) {
		photos = photos.filter((_: File, i: number) => i !== index);
	}
</script>

<Form.Fieldset {form} name="photos">
	<Form.Legend>Photos du projet</Form.Legend>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<Form.Description class="order-1 prose md:order-2">
			<p>Tu peux importer ici tes photos.</p>
			<p>Images qui inspirent ton projet, et/ou zone de ton corps que tu souhaites tatouer.</p>
			<p class="mb-1.5 font-medium">
				Avant d'envoyer une photo, je t'encourage à "flouter" ou "masquer" toutes parties intimes
				qui pourraient être visibles.
			</p>
			<img
				srcset={createSrcset('/images/placement.png', [400, 520])}
				sizes="(max-width:640px) 520px, 400px"
				alt="Placement de tatoo"
				class="mb-3 w-full rounded-md sm:mb-0 sm:w-auto"
			/>
			<p>
				Aussi avant de prendre la photo tu peux, à l'aide d'une carte (visite, vitale, ou bancaire
				etc...) tracer des repères sur ta peau afin de me donner une échelle de grandeur, veilles
				aussi à ce que ton appareil soit bien parallèle à la zone à tatouer, pour éviter les
				"déformations" liées à la perspective/angles de vue.
			</p>
		</Form.Description>
		<div class="order-2 md:order-1">
			<!-- Upload Area -->
			{#if photos.length < MAX_FILES}
				<Label
					class="block cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/20 p-4 text-center transition-colors hover:border-muted-foreground/40"
				>
					<input
						bind:this={fileInput}
						name="photos"
						type="file"
						multiple
						accept="image/*"
						onchange={handleFileSelect}
						class="sr-only"
					/>
					<Upload class="mx-auto mb-1.5 h-6 w-6" />
					<p class="mb-1.5">
						Glisse tes images ici ou
						<span class="font-medium text-primary hover:underline"> cliquez pour parcourir </span>
					</p>
					<p class="text-muted-foreground">
						Max {MAX_FILES} fichiers, 10 MB par fichier ({photos.length}/{MAX_FILES} utilisés)
					</p>
				</Label>
			{/if}

			<!-- Hidden inputs for photos (for form submission) -->
			{#each photos as photo}
				<input
					type="file"
					name="photos"
					files={(() => {
						const dataTransfer = new DataTransfer();
						dataTransfer.items.add(photo);
						return dataTransfer.files;
					})()}
					class="sr-only"
				/>
			{/each}

			<!-- Photo Preview -->
			{#if photos.length > 0}
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
					{#each photos as photo, index}
						<div class="group relative">
							<img
								src={URL.createObjectURL(photo)}
								alt="Aperçu {index + 1}"
								class="h-20 w-full rounded-md border border-muted/20 object-cover"
							/>
							<button
								type="button"
								onclick={() => removePhoto(index)}
								class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
								aria-label="Supprimer cette photo"
							>
								<X class="h-3 w-3" />
							</button>
							<p class="mt-0.5 truncate">
								{photo.name} ({formatFileSize(photo.size)})
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<Form.FieldErrors />
</Form.Fieldset>
