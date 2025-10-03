import { describe, it, expect } from 'vitest';
import { contactFormSchema } from './contact-form';

describe('contactFormSchema', () => {
	const validData = {
		isAdult: 'true' as const,
		firstName: 'Jean',
		email: 'jean@example.com',
		phone: '0612345678',
		pseudonym: '',
		projectTypeFlash: true,
		projectTypeCustom: false,
		projectTypeCoverup: false,
		projectDescription: 'Je voudrais un tatouage de dragon sur le bras',
		size: 'medium',
		placement: 'bras',
		budget: '500-1000',
		timeline: 'dans 3 mois',
		additionalComments: ''
	};

	describe('isAdult field', () => {
		it('accepts "true" value', () => {
			const result = contactFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('rejects when not "true"', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				isAdult: 'false'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe('Tu dois confirmer que tu es majeur');
			}
		});

		it('rejects when missing', () => {
			const { isAdult, ...dataWithoutIsAdult } = validData;
			const result = contactFormSchema.safeParse(dataWithoutIsAdult);
			expect(result.success).toBe(false);
		});
	});

	describe('firstName field', () => {
		it('accepts valid first name', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				firstName: 'Marie'
			});
			expect(result.success).toBe(true);
		});

		it('rejects empty string', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				firstName: ''
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe('Le prénom est obligatoire');
			}
		});
	});

	describe('email field', () => {
		it('accepts valid email', () => {
			const validEmails = [
				'test@example.com',
				'user.name@example.co.uk',
				'user+tag@example.com',
				'test123@test-domain.com'
			];

			validEmails.forEach((email) => {
				const result = contactFormSchema.safeParse({
					...validData,
					email
				});
				expect(result.success).toBe(true);
			});
		});

		it('rejects invalid email formats', () => {
			const invalidEmails = ['invalid', 'test@', '@example.com', 'test @example.com'];

			invalidEmails.forEach((email) => {
				const result = contactFormSchema.safeParse({
					...validData,
					email
				});
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toBe('Saisis une adresse email valide');
				}
			});
		});

		it('rejects empty email', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				email: ''
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("L'email est obligatoire");
			}
		});
	});

	describe('phone field', () => {
		it('accepts valid French mobile numbers', () => {
			const validPhones = [
				'0612345678',
				'0712345678',
				'+33612345678',
				'+33712345678',
				'06 12 34 56 78',
				'+33 6 12 34 56 78'
			];

			validPhones.forEach((phone) => {
				const result = contactFormSchema.safeParse({
					...validData,
					phone
				});
				expect(result.success).toBe(true);
			});
		});

		it('accepts valid French landline numbers', () => {
			const validPhones = [
				'0112345678',
				'0212345678',
				'0312345678',
				'0412345678',
				'0512345678',
				'+33112345678'
			];

			validPhones.forEach((phone) => {
				const result = contactFormSchema.safeParse({
					...validData,
					phone
				});
				expect(result.success).toBe(true);
			});
		});

		it('rejects invalid phone formats', () => {
			const invalidPhones = ['123', '00123456789', '1234567890', '+1234567890', '06 12'];

			invalidPhones.forEach((phone) => {
				const result = contactFormSchema.safeParse({
					...validData,
					phone
				});
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues[0].message).toBe('Saisis un numéro de téléphone valide');
				}
			});
		});

		it('rejects empty phone', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				phone: ''
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe('Le numéro de téléphone est obligatoire');
			}
		});
	});

	describe('projectDescription field', () => {
		it('accepts valid description with minimum length', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				projectDescription: 'Un tatouage'
			});
			expect(result.success).toBe(true);
		});

		it('rejects description shorter than 10 characters', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				projectDescription: 'Court'
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe(
					'La description doit contenir au moins 10 caractères'
				);
			}
		});
	});

	describe('project type validation', () => {
		it('accepts when at least one project type is selected', () => {
			const scenarios = [
				{ projectTypeFlash: true, projectTypeCustom: false, projectTypeCoverup: false },
				{ projectTypeFlash: false, projectTypeCustom: true, projectTypeCoverup: false },
				{ projectTypeFlash: false, projectTypeCustom: false, projectTypeCoverup: true },
				{ projectTypeFlash: true, projectTypeCustom: true, projectTypeCoverup: false },
				{ projectTypeFlash: true, projectTypeCustom: true, projectTypeCoverup: true }
			];

			scenarios.forEach((projectTypes) => {
				const result = contactFormSchema.safeParse({
					...validData,
					...projectTypes
				});
				expect(result.success).toBe(true);
			});
		});

		it('rejects when no project type is selected', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				projectTypeFlash: false,
				projectTypeCustom: false,
				projectTypeCoverup: false
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe('Sélectionne au moins un type de projet');
				expect(result.error.issues[0].path).toEqual(['projectTypeFlash']);
			}
		});
	});

	describe('optional fields', () => {
		it('accepts empty optional fields', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				pseudonym: '',
				size: '',
				placement: '',
				budget: '',
				timeline: '',
				additionalComments: ''
			});
			expect(result.success).toBe(true);
		});

		it('accepts filled optional fields', () => {
			const result = contactFormSchema.safeParse({
				...validData,
				pseudonym: 'DragonSlayer',
				size: '15x10 cm',
				placement: 'Avant-bras gauche',
				budget: '800 euros',
				timeline: 'Juin 2025',
				additionalComments: 'Je préfère les rendez-vous le matin'
			});
			expect(result.success).toBe(true);
		});
	});

	describe('complete form validation', () => {
		it('validates complete valid form', () => {
			const completeData = {
				isAdult: 'true' as const,
				firstName: 'Jean-Paul',
				email: 'jean.paul@example.fr',
				phone: '+33 6 12 34 56 78',
				pseudonym: 'JP_Tattoo',
				projectTypeFlash: false,
				projectTypeCustom: true,
				projectTypeCoverup: false,
				projectDescription:
					'Je souhaite un tatouage personnalisé représentant un phénix en couleurs sur mon épaule droite',
				size: '20x15 cm',
				placement: 'Épaule droite',
				budget: '1000-1500 euros',
				timeline: 'Été 2025',
				additionalComments: 'Disponible les weekends uniquement'
			};

			const result = contactFormSchema.safeParse(completeData);
			expect(result.success).toBe(true);
		});

		it('validates form with multiple errors', () => {
			const invalidData = {
				isAdult: 'false',
				firstName: '',
				email: 'invalid-email',
				phone: '123',
				pseudonym: '',
				projectTypeFlash: false,
				projectTypeCustom: false,
				projectTypeCoverup: false,
				projectDescription: 'Court',
				size: '',
				placement: '',
				budget: '',
				timeline: '',
				additionalComments: ''
			};

			const result = contactFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.length).toBeGreaterThan(1);
			}
		});
	});
});
