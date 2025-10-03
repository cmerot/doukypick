import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelegramNotification, type TelegramSubmissionData } from './telegram';

// Mock environment variables
vi.mock('$env/static/private', () => ({
	TELEGRAM_BOT_TOKEN: 'test-bot-token',
	TELEGRAM_CHAT_ID: 'test-chat-id'
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('telegram service', () => {
	const baseSubmissionData: TelegramSubmissionData = {
		firstName: 'Jean',
		email: 'jean@example.com',
		isAdult: 'yes',
		projectType: 'Tatouage personnalisé',
		projectDescription: 'Je souhaite un tatouage de dragon sur le bras',
		submissionId: 123
	};

	const baseUrl = 'https://example.com';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('message formatting', () => {
		it('formats message with required fields', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				text: async () => 'OK'
			});

			await sendTelegramNotification(baseSubmissionData, baseUrl);

			const messageBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(messageBody.text).toContain('Jean');
			expect(messageBody.text).toContain('jean@example.com');
			expect(messageBody.text).toContain('Tatouage personnalisé');
			expect(messageBody.text).toContain('Je souhaite un tatouage de dragon sur le bras');
			expect(messageBody.text).toContain('#123');
			expect(messageBody.text).toContain(`${baseUrl}/admin/123`);
		});

		it('formats isAdult as "Oui ✅" when value is "yes"', async () => {
			mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification({ ...baseSubmissionData, isAdult: 'yes' }, baseUrl);

			const messageBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(messageBody.text).toContain('🔞 *Majeur:* Oui ✅');
		});

		it('formats isAdult as "Non ❌" when value is "no"', async () => {
			mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification({ ...baseSubmissionData, isAdult: 'no' }, baseUrl);

			const messageBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(messageBody.text).toContain('🔞 *Majeur:* Non ❌');
		});

		it('includes optional fields when provided', async () => {
			const fullData: TelegramSubmissionData = {
				...baseSubmissionData,
				phone: '+33612345678',
				pseudonym: '@jeandu93',
				size: '15x20cm',
				placement: 'Bras gauche',
				budget: '500-800€',
				timeline: '2-3 mois',
				additionalComments: 'Préférence pour le style japonais'
			};

			mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification(fullData, baseUrl);

			const messageBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(messageBody.text).toContain('+33612345678');
			expect(messageBody.text).toContain('@jeandu93');
			expect(messageBody.text).toContain('15x20cm');
			expect(messageBody.text).toContain('Bras gauche');
			expect(messageBody.text).toContain('500-800€');
			expect(messageBody.text).toContain('2-3 mois');
			expect(messageBody.text).toContain('Préférence pour le style japonais');
		});

		it('omits optional fields when not provided', async () => {
			mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification(baseSubmissionData, baseUrl);

			const messageBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(messageBody.text).not.toContain('📞 *Téléphone:*');
			expect(messageBody.text).not.toContain('📱 *Pseudonyme:*');
			expect(messageBody.text).not.toContain('📏 *Taille:*');
			expect(messageBody.text).not.toContain('📍 *Emplacement:*');
			expect(messageBody.text).not.toContain('💰 *Budget:*');
			expect(messageBody.text).not.toContain('⏱️ *Délai:*');
			expect(messageBody.text).not.toContain('💭 *Commentaires:*');
		});

		it('includes photo count when photos are present', async () => {
			const dataWithPhotos: TelegramSubmissionData = {
				...baseSubmissionData,
				photo_urls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
			};

			mockFetch
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' })
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' })
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification(dataWithPhotos, baseUrl);

			const messageBody = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(messageBody.text).toContain('📸 *Photos:* 2 fichier(s)');
		});
	});

	describe('photo handling', () => {
		it('sends photos separately after main message', async () => {
			const dataWithPhotos: TelegramSubmissionData = {
				...baseSubmissionData,
				photo_urls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
			};

			mockFetch
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' }) // sendMessage
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' }) // sendPhoto 1
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' }); // sendPhoto 2

			await sendTelegramNotification(dataWithPhotos, baseUrl);

			expect(mockFetch).toHaveBeenCalledTimes(3);

			// Verify photos sent to correct endpoint
			expect(mockFetch.mock.calls[1][0]).toContain('/sendPhoto');
			expect(mockFetch.mock.calls[2][0]).toContain('/sendPhoto');

			// Verify photo URLs
			const photo1Body = JSON.parse(mockFetch.mock.calls[1][1].body);
			const photo2Body = JSON.parse(mockFetch.mock.calls[2][1].body);
			expect(photo1Body.photo).toBe('https://example.com/photo1.jpg');
			expect(photo2Body.photo).toBe('https://example.com/photo2.jpg');
		});

		it('does not send photos when array is empty', async () => {
			const dataWithEmptyPhotos: TelegramSubmissionData = {
				...baseSubmissionData,
				photo_urls: []
			};

			mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification(dataWithEmptyPhotos, baseUrl);

			expect(mockFetch).toHaveBeenCalledTimes(1); // Only sendMessage
		});

		it('does not send photos when photo_urls is undefined', async () => {
			mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });

			await sendTelegramNotification(baseSubmissionData, baseUrl);

			expect(mockFetch).toHaveBeenCalledTimes(1); // Only sendMessage
		});
	});

	describe('error handling', () => {
		it('does not throw when sendMessage fails', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				text: async () => 'Bad Request'
			});

			await expect(sendTelegramNotification(baseSubmissionData, baseUrl)).resolves.not.toThrow();
		});

		it('logs errors to console when notification fails', async () => {
			const error = new Error('Network error');
			mockFetch.mockRejectedValue(error);

			await sendTelegramNotification(baseSubmissionData, baseUrl);

			expect(console.error).toHaveBeenCalledWith('❌ Error sending Telegram notification:', error);
		});

		it('does not throw when sendPhoto fails', async () => {
			const dataWithPhotos: TelegramSubmissionData = {
				...baseSubmissionData,
				photo_urls: ['https://example.com/photo1.jpg']
			};

			mockFetch
				.mockResolvedValueOnce({ ok: true, text: async () => 'OK' }) // sendMessage succeeds
				.mockResolvedValueOnce({ ok: false, text: async () => 'Error' }); // sendPhoto fails

			await expect(sendTelegramNotification(dataWithPhotos, baseUrl)).resolves.not.toThrow();
		});
	});
});
