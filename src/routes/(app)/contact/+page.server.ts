import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const prerender = false;
import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';
import { dev } from '$app/environment';
import {
	BLOB_READ_WRITE_TOKEN,
	SUPABASE_URL,
	SUPABASE_ANON_KEY,
	TELEGRAM_BOT_TOKEN,
	TELEGRAM_CHAT_ID
} from '$env/static/private';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Telegram notification function
async function sendTelegramNotification(submissionData: any, baseUrl: string) {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
		console.log('⚠️ Telegram not configured, skipping notification');
		return;
	}

	try {
		const message = `🔔 *Nouvelle demande de tatouage*

👤 *Prénom:* ${submissionData.firstName}
📧 *Email:* ${submissionData.email}
${submissionData.phone ? `📞 *Téléphone:* ${submissionData.phone}` : ''}
${submissionData.pseudonym ? `📱 *Pseudonyme:* ${submissionData.pseudonym}` : ''}

🔞 *Majeur:* ${submissionData.isAdult === 'yes' ? 'Oui ✅' : 'Non ❌'}

🎨 *Type de projet:* ${submissionData.projectType}

📝 *Description du projet:*
${submissionData.projectDescription}

${submissionData.size ? `📏 *Taille:* ${submissionData.size}` : ''}
${submissionData.placement ? `📍 *Emplacement:* ${submissionData.placement}` : ''}
${submissionData.budget ? `💰 *Budget:* ${submissionData.budget}` : ''}
${submissionData.timeline ? `⏱️ *Délai:* ${submissionData.timeline}` : ''}

${submissionData.additionalComments ? `💭 *Commentaires:* ${submissionData.additionalComments}` : ''}

${submissionData.photo_urls?.length > 0 ? `📸 *Photos:* ${submissionData.photo_urls.length} fichier(s)` : ''}

🆔 *ID:* #${submissionData.submissionId}
⏰ *Reçu le:* ${new Date().toLocaleString('fr-FR')}

🔗 *Lien direct:* ${baseUrl}/admin/${submissionData.submissionId}`;

		const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

		const response = await fetch(telegramUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				chat_id: TELEGRAM_CHAT_ID,
				text: message,
				parse_mode: 'Markdown',
				disable_web_page_preview: true
			})
		});

		if (response.ok) {
			console.log('✅ Telegram notification sent successfully');
		} else {
			const error = await response.text();
			console.error('❌ Telegram notification failed:', error);
		}

		// Send photos if any
		if (submissionData.photo_urls?.length > 0) {
			for (const photoUrl of submissionData.photo_urls) {
				await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						chat_id: TELEGRAM_CHAT_ID,
						photo: photoUrl,
						caption: `📸 Photo jointe au message #${submissionData.submissionId}`
					})
				});
			}
		}
	} catch (error) {
		console.error('❌ Error sending Telegram notification:', error);
	}
}

export const actions: Actions = {
	default: async ({ request, url }) => {
		console.log('🚀 Form submission started');
		const formData = await request.formData();

		// Extract form fields
		const email = formData.get('email') as string;
		const isAdult = formData.get('isAdult') as string;
		const firstName = formData.get('firstName') as string;
		const pseudonym = formData.get('pseudonym') as string;
		const phone = formData.get('phone') as string;
		const projectType = formData.get('projectType') as string;
		const projectDescription = formData.get('projectDescription') as string;
		const size = formData.get('size') as string;
		const placement = formData.get('placement') as string;
		const budget = formData.get('budget') as string;
		const timeline = formData.get('timeline') as string;
		const additionalComments = formData.get('additionalComments') as string;
		const sendCopy = formData.get('sendCopy') === 'on';
		const photos = formData.getAll('photos') as File[];

		// Validation errors object
		const errors: Record<string, string> = {};

		// Email validation (required)
		if (!email?.trim()) {
			errors.email = "L'email est obligatoire";
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				errors.email = 'Veuillez saisir une adresse email valide';
			}
		}

		// Age verification (required)
		if (!isAdult) {
			errors.isAdult = 'Cette information est obligatoire';
		}

		// First name validation (required)
		if (!firstName?.trim()) {
			errors.firstName = 'Le prénom est obligatoire';
		}

		// Phone validation (required)
		if (!phone?.trim()) {
			errors.phone = 'Le numéro de téléphone est obligatoire';
		} else {
			const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
			if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
				errors.phone = 'Veuillez saisir un numéro de téléphone valide';
			}
		}

		// Project type validation (required)
		if (!projectType?.trim()) {
			errors.projectType = 'Veuillez sélectionner au moins un type de projet';
		}

		// Project description validation (required)
		if (!projectDescription?.trim()) {
			errors.projectDescription = 'La description du projet est obligatoire';
		} else if (projectDescription.length < 10) {
			errors.projectDescription = 'La description doit contenir au moins 10 caractères';
		}

		// Photo validation
		const validPhotos: File[] = [];
		for (const photo of photos) {
			if (photo.size > 0) {
				// Check if file was actually uploaded
				// Validate file type
				if (!photo.type.startsWith('image/')) {
					errors.photos = `${photo.name} n'est pas un fichier image valide`;
					break;
				}

				// Validate file size (10MB max)
				if (photo.size > 10 * 1024 * 1024) {
					errors.photos = `${photo.name} est trop volumineux (max 10MB)`;
					break;
				}

				validPhotos.push(photo);
			}
		}

		// Check max 5 photos
		if (validPhotos.length > 5) {
			errors.photos = 'Vous ne pouvez télécharger que 5 photos maximum';
		}

		// If validation fails, return errors
		if (Object.keys(errors).length > 0) {
			console.log('❌ Validation failed:', errors);
			return fail(400, {
				errors,
				email,
				isAdult,
				firstName,
				pseudonym,
				phone,
				projectType,
				projectDescription,
				size,
				placement,
				budget,
				timeline,
				additionalComments,
				sendCopy
			});
		}

		console.log('✅ Validation passed, processing submission...');
		console.log('📁 Valid photos count:', validPhotos.length);
		console.log('🔑 Environment check:', {
			hasBlobToken: !!BLOB_READ_WRITE_TOKEN,
			hasSupabaseUrl: !!SUPABASE_URL,
			hasSupabaseKey: !!SUPABASE_ANON_KEY
		});

		try {
			// Process photo uploads if any
			const photoUrls: string[] = [];

			if (validPhotos.length > 0) {
				// Upload each photo to Vercel Blob
				for (let i = 0; i < validPhotos.length; i++) {
					const photo = validPhotos[i];
					const timestamp = Date.now();
					const randomSuffix = Math.random().toString(36).substring(2, 8);
					const extension = photo.name.split('.').pop() || 'jpg';
					const filename = `contact-${timestamp}-${randomSuffix}.${extension}`;

					try {
						// Convert File to Buffer for Vercel Blob
						const arrayBuffer = await photo.arrayBuffer();
						const buffer = Buffer.from(arrayBuffer);

						// Upload to Vercel Blob
						const blob = await put(filename, buffer, {
							access: 'public',
							token: BLOB_READ_WRITE_TOKEN,
							contentType: photo.type
						});

						photoUrls.push(blob.url);
						console.log(`Photo uploaded successfully: ${blob.url}`);
					} catch (uploadError) {
						console.error(`Error uploading ${photo.name}:`, uploadError);
						return fail(500, {
							errors: {
								photos: `Erreur lors du téléchargement de ${photo.name}`
							},
							email,
							isAdult,
							firstName,
							pseudonym,
							phone,
							projectType,
							projectDescription,
							size,
							placement,
							budget,
							timeline,
							additionalComments,
							sendCopy
						});
					}
				}
			}

			// Save to Supabase database
			console.log('💾 Saving to Supabase...');
			const submissionData = {
				email: email.trim(),
				is_adult: isAdult,
				first_name: firstName.trim(),
				pseudonym: pseudonym?.trim() || null,
				phone: phone.trim(),
				project_type: projectType,
				project_description: projectDescription.trim(),
				size: size?.trim() || null,
				placement: placement?.trim() || null,
				budget: budget?.trim() || null,
				timeline: timeline || null,
				additional_comments: additionalComments?.trim() || null,
				send_copy: sendCopy,
				photo_urls: photoUrls,
				created_at: new Date().toISOString()
			};
			console.log('📝 Submission data:', submissionData);

			const { data, error } = await supabase
				.from('contact_submissions')
				.insert(submissionData)
				.select()
				.single();

			if (error) {
				console.error('❌ Supabase error:', error);
				return fail(500, {
					errors: {
						general: 'Erreur lors de la sauvegarde. Veuillez réessayer.'
					},
					email,
					isAdult,
					firstName,
					pseudonym,
					phone,
					projectType,
					projectDescription,
					size,
					placement,
					budget,
					timeline,
					additionalComments,
					sendCopy
				});
			}

			console.log('✅ Contact form submission saved:', data);

			// Send Telegram notification
			await sendTelegramNotification({
				firstName,
				email,
				phone,
				pseudonym,
				isAdult,
				projectType,
				projectDescription,
				size,
				placement,
				budget,
				timeline,
				additionalComments,
				photo_urls: photoUrls,
				submissionId: data.id
			}, url.origin);

			// Here you would typically send an email notification
			if (!dev) {
				// await sendContactEmail({
				//   nom,
				//   email,
				//   telephone,
				//   description,
				//   photoUrls,
				//   submissionId: data.id
				// });
			}

			return {
				success: true,
				message: 'Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.',
				submissionId: data.id
			};
		} catch (error) {
			console.error('Error processing contact form:', error);

			return fail(500, {
				errors: {
					general: "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."
				},
				email,
				isAdult,
				firstName,
				pseudonym,
				phone,
				projectType,
				projectDescription,
				size,
				placement,
				budget,
				timeline,
				additionalComments,
				sendCopy
			});
		}
	}
};
