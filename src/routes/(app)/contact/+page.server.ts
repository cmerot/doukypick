import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { contactFormSchema, type ContactFormType } from '$lib/schemas/contact-form';
import { uploadPhotos } from '$lib/server/services/blob-storage';
import { saveContactSubmission } from '$lib/server/services/contact-database';
import { sendTelegramNotification } from '$lib/server/services/telegram';

export const prerender = false;

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(contactFormSchema as any))
	};
};

function validatePhotos(photos: File[]): { errors?: string; validPhotos: File[] } {
	const validPhotos: File[] = [];

	for (const photo of photos) {
		if (photo.size > 0) {
			if (!photo.type.startsWith('image/')) {
				return { errors: `${photo.name} n'est pas un fichier image valide`, validPhotos: [] };
			}

			if (photo.size > 10 * 1024 * 1024) {
				return { errors: `${photo.name} est trop volumineux (max 10MB)`, validPhotos: [] };
			}

			validPhotos.push(photo);
		}
	}

	if (validPhotos.length > 5) {
		return { errors: 'Vous ne pouvez télécharger que 5 photos maximum', validPhotos: [] };
	}

	return { validPhotos };
}

export const actions: Actions = {
	default: async ({ request, url }) => {
		console.log('🚀 Form submission started');
		const rawFormData = await request.formData();

		// Validate form data with superforms
		const form = await superValidate(rawFormData, zod4(contactFormSchema as any));

		// Handle photo validation separately
		const photos = rawFormData.getAll('photos') as File[];
		const photoValidation = validatePhotos(photos);

		// Return validation errors if any
		if (!form.valid) {
			console.log('❌ Validation failed:', form.errors);
			return fail(400, { form });
		}

		if (photoValidation.errors) {
			console.log('❌ Photo validation failed:', photoValidation.errors);
			return fail(400, {
				form,
				photoError: photoValidation.errors
			});
		}

		const validPhotos = photoValidation.validPhotos;
		const formData = form.data as ContactFormType;

		console.log('✅ Validation passed, processing submission...');
		console.log('📁 Valid photos count:', validPhotos.length);

		// Build project type string from booleans
		const projectTypes: string[] = [];
		if (formData.projectTypeFlash) projectTypes.push('flash');
		if (formData.projectTypeCustom) projectTypes.push('custom');
		if (formData.projectTypeCoverup) projectTypes.push('coverup');
		const projectType = projectTypes.join(',');

		try {
			// Upload photos to blob storage
			const uploadResult = await uploadPhotos(validPhotos);

			if (uploadResult.error) {
				return fail(400, {
					form,
					photoError: `Erreur lors du téléchargement: ${uploadResult.error}`
				});
			}

			// Prepare database submission
			const submissionData = {
				email: formData.email,
				is_adult: formData.isAdult === 'true' ? 'yes' : 'no',
				first_name: formData.firstName,
				pseudonym: formData.pseudonym || null,
				phone: formData.phone,
				project_type: projectType,
				project_description: formData.projectDescription,
				size: formData.size || null,
				placement: formData.placement || null,
				budget: formData.budget || null,
				timeline: formData.timeline || null,
				additional_comments: formData.additionalComments || null,
				send_copy: false,
				photo_urls: uploadResult.urls,
				created_at: new Date().toISOString()
			};

			// Save to database
			const { data, error } = await saveContactSubmission(submissionData);

			if (error || !data) {
				return fail(500, {
					form,
					generalError: 'Erreur lors de la sauvegarde. Veuillez réessayer.'
				});
			}

			// Send Telegram notification
			await sendTelegramNotification(
				{
					firstName: formData.firstName,
					email: formData.email,
					phone: formData.phone,
					pseudonym: formData.pseudonym || '',
					isAdult: formData.isAdult === 'true' ? 'yes' : 'no',
					projectType: projectType,
					projectDescription: formData.projectDescription,
					size: formData.size || '',
					placement: formData.placement || '',
					budget: formData.budget || '',
					timeline: formData.timeline || '',
					additionalComments: formData.additionalComments || '',
					photo_urls: uploadResult.urls,
					submissionId: data.id
				},
				url.origin
			);

			return {
				form,
				success: true,
				message: 'Ton message a été envoyé avec succès ! Je te répondrai bientôt.',
				submissionId: String(data.id)
			};
		} catch (error) {
			console.error('❌ Error processing contact form:', error);

			return fail(500, {
				form,
				generalError: "Une erreur s'est produite lors de l'envoi. Merci de réessayer."
			});
		}
	}
};
