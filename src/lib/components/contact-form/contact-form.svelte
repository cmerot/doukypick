<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { contactFormSchema, type ContactFormType } from '$lib/schemas/contact-form';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { CircleCheck, CircleAlert, Loader, Send } from 'lucide-svelte';
	import PhotoUpload from './photo-upload.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';
	let { data }: { data: SuperValidated<ContactFormType> } = $props();

	const form = superForm(data, {
		validators: zod4Client(contactFormSchema as any),
		errorSelector: '[aria-invalid="true"],[data-invalid],[data-fs-error]',
		onResult: ({ result }) => {
			if (result.type === 'success' && result.data?.success) {
				successMessage = result.data.message;
				generalError = undefined;
				toast.success(successMessage || 'OK');
				window.scrollTo({ top: 0, behavior: 'smooth' });
				// Reset photos when form submission is successful
				if (resetPhotos) {
					resetPhotos();
				}
			} else if (result.type === 'failure') {
				generalError = result.data?.generalError || result.data?.photoError;
				successMessage = undefined;
				toast.error(generalError || 'Unknown error');
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}
	});

	const { form: formData, enhance, submitting } = form;

	let generalError = $state<string | undefined>(undefined);
	let successMessage = $state<string | undefined>(undefined);
	let resetPhotos: (() => void) | undefined = $state();
</script>

<!-- {#if successMessage}
	<div class="mb-6 flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
		<CircleCheck class="h-5 w-5 text-green-600" />
		<p class="text-green-800">{successMessage}</p>
	</div>
{/if}
-->
{#if generalError}
	<div class="mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4">
		<CircleAlert class="h-5 w-5 text-red-600" />
		<p class="text-red-800">{generalError}</p>
	</div>
{/if}

<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-8" novalidate>
	<!-- Age verification -->
	<Form.Fieldset {form} name="isAdult" role="radiogroup">
		<Form.Legend>Es-tu majeur·e ?</Form.Legend>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Form.Description class="order-1 md:order-2">
				<p>Je ne tatoue pas les mineur·e·s même avec l'accord des parents</p>
			</Form.Description>

			<div class="order-2 space-y-2 md:order-1">
				<Label class="flex items-center space-x-2">
					<input
						type="radio"
						name="isAdult"
						value="true"
						bind:group={$formData.isAdult}
						class="h-4 w-4"
					/>
					<span>Absolument, go, go, go!</span>
				</Label>
				<Label class="flex items-center space-x-2">
					<input
						type="radio"
						name="isAdult"
						value="false"
						bind:group={$formData.isAdult}
						class="h-4 w-4"
					/>
					<span>Zut je vais devoir patienter !</span>
				</Label>
			</div>
		</div>

		<Form.FieldErrors />
	</Form.Fieldset>

	<!-- First name -->
	<Form.Field {form} name="firstName">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ton prénom</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>
							Celui par lequel tu souhaites être nommé·e, si celui donné à ta naissance ne te
							correspond/plaît pas
						</p>
					</Form.Description>
					<Input
						{...props}
						bind:value={$formData.firstName}
						placeholder="Ton prénom"
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Email -->
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ton email</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Input {...props} type="email" bind:value={$formData.email} placeholder="ton@email.com" />
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Phone -->
	<Form.Field {form} name="phone">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ton numéro de téléphone</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>C'est plus facile pour te contacter en cas de besoin, pas de phoning promis!</p>
					</Form.Description>
					<Input
						{...props}
						type="tel"
						bind:value={$formData.phone}
						placeholder="06 12 34 56 78"
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Pseudonym -->
	<Form.Field {form} name="pseudonym">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ton "pseudonyme"</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>
							Si tu m'as déjà contacté sur des réseaux sociaux, merci de préciser lesquels ex:
							@zogzog Instagram
						</p>
					</Form.Description>
					<Input
						{...props}
						bind:value={$formData.pseudonym}
						placeholder="@username Instagram"
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Project type -->
	<Form.Fieldset {form} name="projectTypeFlash">
		<Form.Legend>Ton/tes envie/s</Form.Legend>
		<div class="space-y-2 pt-1">
			<Label class="flex items-center space-x-2">
				<input type="checkbox" name="projectTypeFlash" bind:checked={$formData.projectTypeFlash} />
				<span>Un flash/dessin disponible</span>
			</Label>
			<Label class="flex items-center space-x-2">
				<input
					type="checkbox"
					name="projectTypeCustom"
					bind:checked={$formData.projectTypeCustom}
				/>
				<span>Un projet personnalisé</span>
			</Label>
			<Label class="flex items-start space-x-2">
				<input
					type="checkbox"
					name="projectTypeCoverup"
					bind:checked={$formData.projectTypeCoverup}
				/>
				<span>Un projet de recouvrement d'un tattoo ou cicatrice</span>
			</Label>
		</div>
		<Form.FieldErrors />
	</Form.Fieldset>

	<!-- Project description -->
	<Form.Field {form} name="projectDescription">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ton projet en quelques mots</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>Décris-moi ici en quelques mots le motif que tu souhaites réaliser en tatouage!</p>
						<p>Exemples:</p>
						<ul>
							<li>"composition florale pour masquer une cicatrice"</li>
							<li>"Octopus tête de chat"</li>
							<li>"Un grille pain cosmique"</li>
						</ul>
						<p>
							Reste simple, en effet tu n'es pas obligé·e de "m'expliquer" ce qui motive tes
							choix/envies. Ton histoire fait partie de ton intimité et tu n'es pas forcé·e de la
							partager.
						</p>
						<p>
							Mais si tu es un petit peu perdu·e dans tes idées, n'hésite pas à me le dire, aussi je
							t'aiderai à affiner tes envies, pour créer un motif unique.
						</p>
						<p>
							Je ne fais pas de copie (je suis dessinatrice avant tout et respecte les droits
							d'auteur.) Je ne reproduis jamais un même motif, (sauf si c'est une demande de
							tatouage en commun avec l'accord de chacun·e.)
						</p>
					</Form.Description>
					<Textarea
						{...props}
						bind:value={$formData.projectDescription}
						placeholder="Décris ton projet en quelques mots..."
						rows={6}
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Size -->
	<Form.Field {form} name="size">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Taille</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>En centimètre c'est mieux !</p>
						<p>Les termes "pas grand", "petit", "méga gros de ouf" ne m'aident pas trop...</p>
						<p>
							Pour un membre, dos, torse complet tu peux passer directement aux questions suivantes,
							t'ennuies pas ton double-décimètre du collège.
						</p>
					</Form.Description>
					<Input
						{...props}
						bind:value={$formData.size}
						placeholder="ex: 15cm x 10cm"
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Placement -->
	<Form.Field {form} name="placement">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Emplacement du tattoo</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>
							Ex: "derrière mon oreille gauche", "Sur mollet droit", "De mon oreille gauche à mon
							mollet droit, en passant par mon nombril".
						</p>
					</Form.Description>
					<Input
						{...props}
						bind:value={$formData.placement}
						placeholder="Décris l'emplacement souhaité"
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Budget -->
	<Form.Field {form} name="budget">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Budget maximum</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>
							Je respecte chaque porte-monnaie, je suis capable de faire des efforts si le projet me
							motive, mais je ne travaille pas à perte...
						</p>
						<p>
							J'ai un tarif minimum de 100€ (tarif "sortie d'aiguilles" dans le "jargon" du
							tatouage)
						</p>
					</Form.Description>
					<Input
						{...props}
						bind:value={$formData.budget}
						placeholder="ex: 200€, entre 150€ et 300€..."
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Photo Upload -->
	<PhotoUpload {form} bind:resetPhotos />

	<!-- Timeline -->
	<Form.Fieldset {form} name="timeline">
		<Form.Legend>Délais</Form.Legend>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<Form.Description class="order-1 prose md:order-2">
				<p>
					Tu souhaiterais tout ça pour quand ? (Attention je ne prépare jamais les dessins plus d'un
					mois à l'avance)
				</p>
			</Form.Description>
			<div class="order-2 prose grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:order-1">
				{#each [{ value: 'asap', label: 'Dès que possible' }, { value: 'thisWeek', label: 'Cette semaine' }, { value: 'thisMonth', label: 'Ce mois en cours' }, { value: 'sepOct', label: 'Septembre/Octobre' }, { value: 'novDec', label: 'Novembre/Décembre' }, { value: 'janFeb', label: 'Janvier/Février' }, { value: 'marApr', label: 'Mars/Avril' }, { value: 'mayJun', label: 'Mai/Juin' }, { value: 'julAug', label: 'Juillet/Août' }] as option}
					<Label class="flex cursor-pointer items-center space-x-2">
						<input
							type="radio"
							name="timeline"
							value={option.value}
							bind:group={$formData.timeline}
							class="h-3.5 w-3.5 text-primary"
						/>
						<span>{option.label}</span>
					</Label>
				{/each}
			</div>
		</div>

		<Form.FieldErrors />
	</Form.Fieldset>

	<!-- Additional comments -->
	<Form.Field {form} name="additionalComments">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Autres questions et remarques</Form.Label>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Form.Description class="order-1 prose md:order-2">
						<p>N'hésite pas, je pique mais ne mords pas !</p>
					</Form.Description>
					<Textarea
						{...props}
						bind:value={$formData.additionalComments}
						placeholder="Tes questions, remarques ou informations supplémentaires..."
						rows={4}
						class="order-2 md:order-1"
					/>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<!-- Submit Button -->
	<div class="pt-2">
		<Form.Button disabled={$submitting} class="w-full md:w-auto">
			{#if $submitting}
				<Loader class="animate-spin" />
			{:else}
				<Send />
			{/if}
			C'est parti !
		</Form.Button>
	</div>
</form>
