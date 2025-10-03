import { z } from 'zod/v4';

export const contactFormSchema = z
	.object({
		isAdult: z.enum(['true'], {
			message: 'Tu dois confirmer que tu es majeur'
		}),
		firstName: z.string().min(1, 'Le prénom est obligatoire').default(''),
		email: z
			.string()
			.min(1, "L'email est obligatoire")
			.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Saisis une adresse email valide')
			.default(''),
		phone: z
			.string()
			.min(1, 'Le numéro de téléphone est obligatoire')
			.refine((val) => /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/.test(val.replace(/\s/g, '')), {
				message: 'Saisis un numéro de téléphone valide'
			})
			.default(''),
		pseudonym: z.string().default(''),
		projectTypeFlash: z.boolean().default(false),
		projectTypeCustom: z.boolean().default(false),
		projectTypeCoverup: z.boolean().default(false),
		projectDescription: z
			.string()
			.min(10, 'La description doit contenir au moins 10 caractères')
			.default(''),
		size: z.string().default(''),
		placement: z.string().default(''),
		budget: z.string().default(''),
		timeline: z.string().default(''),
		additionalComments: z.string().default('')
	})
	.refine((data) => data.projectTypeFlash || data.projectTypeCustom || data.projectTypeCoverup, {
		message: 'Sélectionne au moins un type de projet',
		path: ['projectTypeFlash']
	});

export type ContactFormSchema = typeof contactFormSchema;
export type ContactFormType = z.infer<typeof contactFormSchema>;
