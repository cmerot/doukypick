<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Upload, X, CircleCheck, CircleAlert } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { optimize } from '$lib/image';
	// Define ActionData type locally since we can't import from route $types in components
	type ActionData = {
		success?: boolean;
		message?: string;
		submissionId?: string;
		errors?: Record<string, string>;
		email?: string;
		isAdult?: string;
		firstName?: string;
		pseudonym?: string;
		phone?: string;
		projectType?: string;
		projectDescription?: string;
		size?: string;
		placement?: string;
		budget?: string;
		timeline?: string;
		additionalComments?: string;
		sendCopy?: boolean;
	};

	// Props from page
	let { form }: { form?: ActionData | null } = $props();

	// Form data - matching the detailed form structure
	let formData = $state({
		isAdult: form?.isAdult || '',
		firstName: form?.firstName || '',
		email: form?.email || '',
		phone: form?.phone || '',
		pseudonym: form?.pseudonym || '',
		projectType: (form?.projectType || '').split(',').filter(Boolean),
		projectDescription: form?.projectDescription || '',
		size: form?.size || '',
		placement: form?.placement || '',
		budget: form?.budget || '',
		timeline: form?.timeline || '',
		additionalComments: form?.additionalComments || '',
		photos: [] as File[]
	});

	// Form state
	let isSubmitting = $state(false);

	// File input reference
	let fileInput = $state<HTMLInputElement | undefined>();

	// Client-side validation (for UX)
	let clientErrors = $state<Record<string, string>>({});

	// Scroll to first error field
	function scrollToFirstError(errors: Record<string, string>) {
		// Define field order to scroll to the first error in form order
		const fieldOrder = [
			'email',
			'isAdult',
			'firstName',
			'phone',
			'projectType',
			'projectDescription'
		];

		for (const field of fieldOrder) {
			if (errors[field]) {
				const element = document.getElementById(field);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					// Focus the element for better UX
					setTimeout(() => element.focus(), 100);
					break;
				}
			}
		}
	}

	function validateClientSide(): boolean {
		const newErrors: Record<string, string> = {};

		// Email is required
		if (!formData.email.trim()) {
			newErrors.email = "L'email est obligatoire";
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				newErrors.email = 'Saisis une adresse email valide';
			}
		}

		// Age verification is required
		if (!formData.isAdult) {
			newErrors.isAdult = 'Cette information est obligatoire';
		}

		// First name is required
		if (!formData.firstName.trim()) {
			newErrors.firstName = 'Le prénom est obligatoire';
		}

		// Phone is required
		if (!formData.phone.trim()) {
			newErrors.phone = 'Le numéro de téléphone est obligatoire';
		} else {
			const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
			if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
				newErrors.phone = 'Saisis un numéro de téléphone valide';
			}
		}

		// Project type is required
		if (formData.projectType.length === 0) {
			newErrors.projectType = 'Choisis au moins un type de projet';
		}

		// Project description is required
		if (!formData.projectDescription.trim()) {
			newErrors.projectDescription = 'La description du projet est obligatoire';
		} else if (formData.projectDescription.length < 10) {
			newErrors.projectDescription = 'La description doit contenir au moins 10 caractères';
		}

		clientErrors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	function handleProjectTypeChange(value: string, checked: boolean) {
		if (checked) {
			formData.projectType = [...formData.projectType, value];
		} else {
			formData.projectType = formData.projectType.filter((type: string) => type !== value);
		}
	}

	// Handle file selection
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (files) {
			const newFiles = Array.from(files);
			const availableSlots = 5 - formData.photos.length;

			if (newFiles.length > availableSlots) {
				alert(`Vous ne pouvez ajouter que ${availableSlots} photo(s) supplémentaire(s)`);
				return;
			}

			// Validate file types and sizes
			const validFiles = newFiles.filter((file) => {
				const isValidType = file.type.startsWith('image/');
				const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max

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

			formData.photos = [...formData.photos, ...validFiles];
		}

		// Reset file input
		if (fileInput) {
			fileInput.value = '';
		}
	}

	// Remove photo
	function removePhoto(index: number) {
		formData.photos = formData.photos.filter((_, i) => i !== index);
	}

	// Format file size
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	// Reset form on success and handle notifications
	$effect(() => {
		if (form?.success || form?.errors?.general) {
			// Scroll to top to show notification
			window.scrollTo({ top: 0, behavior: 'smooth' });

			if (form?.success) {
				// Reset form data after successful submission
				setTimeout(() => {
					formData = {
						isAdult: '',
						firstName: '',
						email: '',
						phone: '',
						pseudonym: '',
						projectType: [],
						projectDescription: '',
						size: '',
						placement: '',
						budget: '',
						timeline: '',
						additionalComments: '',
						photos: []
					};
				}, 3000);
			}
		}
	});
</script>

{#if form?.success}
	<div class="mb-6 flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
		<CircleCheck class="h-5 w-5 text-green-600" />
		<p class="text-green-800">{form.message}</p>
	</div>
{/if}

{#if form?.errors?.general}
	<div class="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
		<CircleAlert class="h-5 w-5 text-red-600" />
		<p class="text-red-800">{form.errors.general}</p>
	</div>
{/if}

<form
	method="POST"
	enctype="multipart/form-data"
	use:enhance={({ formData, cancel }) => {
		// Validate client-side before submitting
		if (!validateClientSide()) {
			// Don't submit if validation fails
			cancel();
			// Scroll to first error field
			setTimeout(() => scrollToFirstError(clientErrors), 100);
			return;
		}

		isSubmitting = true;
		// Clear client-side errors on submit since validation passed
		clientErrors = {};

		return async ({ update }) => {
			isSubmitting = false;
			await update();
			// Scroll to top to show any validation errors or success message
			window.scrollTo({ top: 0, behavior: 'smooth' });
		};
	}}
	class="space-y-8"
>
	<!-- Age verification -->
	<div class="space-y-2" id="isAdult">
		<Label class="text-lg font-medium">Es-tu majeur·e ? *</Label>
		<div class="prose prose-sm">
			<p>Je ne tatoue pas les mineur·e·s même avec l'accord des parents</p>
		</div>
		<div class="space-y-2">
			<label class="flex items-center space-x-2">
				<input
					type="radio"
					name="isAdult"
					value="yes"
					bind:group={formData.isAdult}
					class="h-4 w-4"
					required
				/>
				<span>Absolument, go, go, go!</span>
			</label>
			<label class="flex items-center space-x-2">
				<input
					type="radio"
					name="isAdult"
					value="no"
					bind:group={formData.isAdult}
					class="h-4 w-4"
					required
				/>
				<span>Zut je vais devoir patienter !</span>
			</label>
		</div>
		{#if form?.errors?.isAdult || clientErrors.isAdult}
			<p class="text-sm text-red-600">{form?.errors?.isAdult || clientErrors.isAdult}</p>
		{/if}
	</div>

	<!-- First name -->
	<div class="space-y-2">
		<Label for="firstName" class="text-lg font-medium">Ton prénom *</Label>
		<div class="prose prose-sm">
			<p>
				Celui par lequel tu souhaites être nommé·e, si celui donné à ta naissance ne te
				correspond/plaît pas
			</p>
		</div>
		<Input
			id="firstName"
			name="firstName"
			bind:value={formData.firstName}
			placeholder="Ton prénom"
			class={form?.errors?.firstName || clientErrors.firstName ? 'border-red-500' : ''}
			required
		/>
		{#if form?.errors?.firstName || clientErrors.firstName}
			<p class="text-sm text-red-600">{form?.errors?.firstName || clientErrors.firstName}</p>
		{/if}
	</div>

	<!-- Email -->
	<div class="space-y-2">
		<Label for="email" class="text-lg font-medium">Ton email *</Label>
		<Input
			id="email"
			name="email"
			type="email"
			bind:value={formData.email}
			placeholder="ton@email.com"
			class={form?.errors?.email || clientErrors.email ? 'border-red-500' : ''}
			required
		/>
		{#if form?.errors?.email || clientErrors.email}
			<p class="text-sm text-red-600">{form?.errors?.email || clientErrors.email}</p>
		{/if}
	</div>

	<!-- Phone -->
	<div class="space-y-2">
		<Label for="phone" class="text-lg font-medium">Ton numéro de téléphone *</Label>
		<div class="prose prose-sm">
			<p>C'est plus facile pour te contacter en cas de besoin, pas de phoning promis!</p>
		</div>
		<Input
			id="phone"
			name="phone"
			type="tel"
			bind:value={formData.phone}
			placeholder="06 12 34 56 78"
			class={form?.errors?.phone || clientErrors.phone ? 'border-red-500' : ''}
			required
		/>
		{#if form?.errors?.phone || clientErrors.phone}
			<p class="text-sm text-red-600">{form?.errors?.phone || clientErrors.phone}</p>
		{/if}
	</div>

	<!-- Pseudonym -->
	<div class="space-y-2">
		<Label for="pseudonym" class="text-lg font-medium">Ton "pseudonyme"</Label>
		<div class="prose prose-sm">
			<p>
				Si tu m'as déjà contacté sur des réseaux sociaux, merci de préciser lesquels ex: @zogzog
				Instagram
			</p>
		</div>
		<Input
			id="pseudonym"
			name="pseudonym"
			bind:value={formData.pseudonym}
			placeholder="@username Instagram"
			class={form?.errors?.pseudonym ? 'border-red-500' : ''}
		/>
		{#if form?.errors?.pseudonym}
			<p class="text-sm text-red-600">{form?.errors?.pseudonym}</p>
		{/if}
	</div>

	<!-- Project type -->
	<div class="space-y-2" id="projectType">
		<Label class="text-lg font-medium">Ton/tes envie/s *</Label>
		<div class="space-y-2">
			<label class="flex items-start space-x-2">
				<input
					type="checkbox"
					value="flash"
					checked={formData.projectType.includes('flash')}
					onchange={(e) => handleProjectTypeChange('flash', e.currentTarget.checked)}
					class="mt-0.5 h-4 w-4"
				/>
				<span>Un flash/dessin disponible</span>
			</label>
			<label class="flex items-start space-x-2">
				<input
					type="checkbox"
					value="custom"
					checked={formData.projectType.includes('custom')}
					onchange={(e) => handleProjectTypeChange('custom', e.currentTarget.checked)}
					class="mt-0.5 h-4 w-4"
				/>
				<span>Un projet personnalisé</span>
			</label>
			<label class="flex items-start space-x-2">
				<input
					type="checkbox"
					value="coverup"
					checked={formData.projectType.includes('coverup')}
					onchange={(e) => handleProjectTypeChange('coverup', e.currentTarget.checked)}
					class="mt-0.5 h-4 w-4"
				/>
				<span>Un projet de recouvrement d'un tattoo ou cicatrice</span>
			</label>
		</div>
		<input type="hidden" name="projectType" value={formData.projectType.join(',')} />
		{#if form?.errors?.projectType || clientErrors.projectType}
			<p class="text-sm text-red-600">{form?.errors?.projectType || clientErrors.projectType}</p>
		{/if}
	</div>

	<!-- Project description -->
	<div class="space-y-2">
		<Label for="projectDescription" class="text-lg font-medium">Ton projet en quelques mots *</Label
		>
		<div class="prose prose-sm">
			<p>Décris-moi ici en quelques mots le motif que tu souhaites réaliser en tatouage!</p>
			<p>Exemples:</p>
			<ul>
				<li>"composition florale pour masquer une cicatrice"</li>
				<li>"Octopus tête de chat"</li>
				<li>"Un grille pain cosmique"</li>
			</ul>
			<p>
				Reste simple, en effet tu n'es pas obligé·e de "m'expliquer" ce qui motive tes choix/envies.
				Ton histoire fait partie de ton intimité et tu n'es pas forcé·e de la partager.
			</p>
			<p>
				Mais si tu es un petit peu perdu·e dans tes idées, n'hésite pas à me le dire, aussi je
				t'aiderai à affiner tes envies, pour créer un motif unique.
			</p>
			<p>
				Je ne fais pas de copie (je suis dessinatrice avant tout et respecte les droits d'auteur.)
				Je ne reproduis jamais un même motif, (sauf si c'est une demande de tatouage en commun avec
				l'accord de chacun·e.)
			</p>
		</div>
		<Textarea
			id="projectDescription"
			name="projectDescription"
			bind:value={formData.projectDescription}
			placeholder="Décris ton projet en quelques mots..."
			rows={6}
			class={form?.errors?.projectDescription || clientErrors.projectDescription
				? 'border-red-500'
				: ''}
			required
		/>
		{#if form?.errors?.projectDescription || clientErrors.projectDescription}
			<p class="text-sm text-red-600">
				{form?.errors?.projectDescription || clientErrors.projectDescription}
			</p>
		{/if}
	</div>

	<!-- Size -->
	<div class="space-y-2">
		<Label for="size" class="text-lg font-medium">Taille</Label>
		<div class="prose prose-sm">
			<p>En centimètre c'est mieux !</p>
			<p>Les termes "pas grand", "petit", "méga gros de ouf" ne m'aident pas trop...</p>
			<p>
				Pour un membre, dos, torse complet tu peux passer directement aux questions suivantes,
				t'ennuies pas ton double-décimètre du collège.
			</p>
		</div>
		<Input
			id="size"
			name="size"
			bind:value={formData.size}
			placeholder="ex: 15cm x 10cm"
			class={form?.errors?.size ? 'border-red-500' : ''}
		/>
		{#if form?.errors?.size}
			<p class="text-sm text-red-600">{form?.errors?.size}</p>
		{/if}
	</div>

	<!-- Placement -->
	<div class="space-y-2">
		<Label for="placement" class="text-lg font-medium">Emplacement du tattoo</Label>
		<div class="prose prose-sm">
			<p>
				Ex: "derrière mon oreille gauche", "Sur mollet droit", "De mon oreille gauche à mon mollet
				droit, en passant par mon nombril".
			</p>
		</div>
		<Input
			id="placement"
			name="placement"
			bind:value={formData.placement}
			placeholder="Décris l'emplacement souhaité"
			class={form?.errors?.placement ? 'border-red-500' : ''}
		/>
		{#if form?.errors?.placement}
			<p class="text-sm text-red-600">{form?.errors?.placement}</p>
		{/if}
	</div>

	<!-- Budget -->
	<div class="space-y-2">
		<Label for="budget" class="text-lg font-medium">Budget maximum</Label>
		<div class="prose prose-sm">
			<p>
				Je respecte chaque porte-monnaie, je suis capable de faire des efforts si le projet me
				motive, mais je ne travaille pas à perte...
			</p>
			<p>J'ai un tarif minimum de 100€ (tarif "sortie d'aiguilles" dans le "jargon" du tatouage)</p>
		</div>
		<Input
			id="budget"
			name="budget"
			bind:value={formData.budget}
			placeholder="ex: 200€, entre 150€ et 300€..."
			class={form?.errors?.budget ? 'border-red-500' : ''}
		/>
		{#if form?.errors?.budget}
			<p class="text-sm text-red-600">{form?.errors?.budget}</p>
		{/if}
	</div>

	<!-- Photo Upload -->
	<div class="space-y-2">
		<Label class="text-lg font-medium">Photos</Label>
		<div class="prose prose-sm">
			<p>Tu peux importer ici tes photos.</p>
			<p>Images qui inspirent ton projet, et/ou zone de ton corps que tu souhaites tatouer.</p>
			<p class="mb-1.5 font-medium">
				Avant d'envoyer une photo, je t'encourage à "flouter" ou "masquer" toutes parties intimes
				qui pourraient être visibles.
			</p>
			<div class="sm:flex sm:items-center sm:space-x-4">
				<div class="sm:w-64 sm:flex-shrink-0">
					<img
						srcset={optimize('/images/placement.png', [400, 520])}
						sizes="(max-width:640px) 520px, 400px"
						alt="Placement de tatoo"
						class="mb-3 w-full rounded-md sm:mb-0 sm:w-auto"
					/>
				</div>
				<p>
					Aussi avant de prendre la photo tu peux, à l'aide d'une carte (visite, vitale, ou bancaire
					etc...) tracer des repères sur ta peau afin de me donner une échelle de grandeur, veilles
					aussi à ce que ton appareil soit bien parallèle à la zone à tatouer, pour éviter les
					"déformations" liées à la perspective/angles de vue.
				</p>
			</div>
		</div>
		<div class="space-y-4">
			<!-- Upload Area -->
			{#if formData.photos.length < 5}
				<div
					class="rounded-md border-2 border-dashed border-muted-foreground/20 p-4 text-center transition-colors hover:border-muted-foreground/40"
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
						<button
							type="button"
							onclick={() => fileInput?.click()}
							class="font-medium text-primary hover:underline"
						>
							cliquez pour parcourir
						</button>
					</p>
					<p class="text-muted-foreground">
						Max 5 fichiers, 10 MB par fichier ({formData.photos.length}/5 utilisés)
					</p>
				</div>
			{/if}

			<!-- Hidden inputs for photos (for form submission) -->
			{#each formData.photos as photo}
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
			{#if formData.photos.length > 0}
				<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
					{#each formData.photos as photo, index}
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

			{#if form?.errors?.photos}
				<p class="text-sm text-red-600">{form.errors.photos}</p>
			{/if}
		</div>
	</div>

	<!-- Timeline -->
	<div class="space-y-2">
		<Label class="text-lg font-medium">Délais</Label>
		<div class="prose prose-sm">
			<p>
				Tu souhaiterais tout ça pour quand ? (Attention je ne prépare jamais les dessins plus d'un
				mois à l'avance)
			</p>
		</div>
		<div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
			{#each [{ value: 'asap', label: 'Dès que possible' }, { value: 'thisWeek', label: 'Cette semaine' }, { value: 'thisMonth', label: 'Ce mois en cours' }, { value: 'sepOct', label: 'Septembre/Octobre' }, { value: 'novDec', label: 'Novembre/Décembre' }, { value: 'janFeb', label: 'Janvier/Février' }, { value: 'marApr', label: 'Mars/Avril' }, { value: 'mayJun', label: 'Mai/Juin' }, { value: 'julAug', label: 'Juillet/Août' }] as option}
				<label class="flex cursor-pointer items-center space-x-2">
					<input
						type="radio"
						name="timeline"
						value={option.value}
						bind:group={formData.timeline}
						class="h-3.5 w-3.5 text-primary"
					/>
					<span class="">{option.label}</span>
				</label>
			{/each}
		</div>
		{#if form?.errors?.timeline}
			<p class="text-sm text-red-600">{form?.errors?.timeline}</p>
		{/if}
	</div>

	<!-- Additional comments -->
	<div class="space-y-2">
		<Label for="additionalComments" class="text-lg font-medium">
			Autres questions et remarques
		</Label>
		<div class="prose prose-sm">
			<p>N'hésite pas, je pique mais ne mords pas !</p>
		</div>
		<Textarea
			id="additionalComments"
			name="additionalComments"
			bind:value={formData.additionalComments}
			placeholder="Tes questions, remarques ou informations supplémentaires..."
			rows={4}
			class={form?.errors?.additionalComments ? 'border-red-500' : ''}
		/>
		{#if form?.errors?.additionalComments}
			<p class="text-sm text-red-600">{form?.errors?.additionalComments}</p>
		{/if}
	</div>

	<!-- Submit Button -->
	<div class="pt-2">
		<Button type="submit" disabled={isSubmitting} class="w-full md:w-auto">
			{#if isSubmitting}
				Envoi en cours...
			{:else}
				Envoyer ma demande
			{/if}
		</Button>
	</div>
</form>
