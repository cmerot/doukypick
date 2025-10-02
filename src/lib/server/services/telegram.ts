import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '$env/static/private';

export interface TelegramSubmissionData {
	firstName: string;
	email: string;
	phone?: string;
	pseudonym?: string;
	isAdult: string;
	projectType: string;
	projectDescription: string;
	size?: string;
	placement?: string;
	budget?: string;
	timeline?: string;
	additionalComments?: string;
	photo_urls?: string[];
	submissionId: number;
}

async function sendMessage(message: string): Promise<void> {
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

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Telegram message failed: ${error}`);
	}
}

async function sendPhoto(photoUrl: string, caption: string): Promise<void> {
	const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

	await fetch(telegramUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_id: TELEGRAM_CHAT_ID,
			photo: photoUrl,
			caption
		})
	});
}

function formatSubmissionMessage(data: TelegramSubmissionData, baseUrl: string): string {
	return `🔔 *Nouvelle demande de tatouage*

👤 *Prénom:* ${data.firstName}
📧 *Email:* ${data.email}
${data.phone ? `📞 *Téléphone:* ${data.phone}` : ''}
${data.pseudonym ? `📱 *Pseudonyme:* ${data.pseudonym}` : ''}

🔞 *Majeur:* ${data.isAdult === 'yes' ? 'Oui ✅' : 'Non ❌'}

🎨 *Type de projet:* ${data.projectType}

📝 *Description du projet:*
${data.projectDescription}

${data.size ? `📏 *Taille:* ${data.size}` : ''}
${data.placement ? `📍 *Emplacement:* ${data.placement}` : ''}
${data.budget ? `💰 *Budget:* ${data.budget}` : ''}
${data.timeline ? `⏱️ *Délai:* ${data.timeline}` : ''}

${data.additionalComments ? `💭 *Commentaires:* ${data.additionalComments}` : ''}

${data.photo_urls?.length ? `📸 *Photos:* ${data.photo_urls.length} fichier(s)` : ''}

🆔 *ID:* #${data.submissionId}
⏰ *Reçu le:* ${new Date().toLocaleString('fr-FR')}

🔗 *Lien direct:* ${baseUrl}/admin/${data.submissionId}`;
}

export async function sendTelegramNotification(
	submissionData: TelegramSubmissionData,
	baseUrl: string
): Promise<void> {
	if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
		console.log('⚠️ Telegram not configured, skipping notification');
		return;
	}

	try {
		const message = formatSubmissionMessage(submissionData, baseUrl);
		await sendMessage(message);
		console.log('✅ Telegram notification sent successfully');

		// Send photos if any
		if (submissionData.photo_urls?.length) {
			for (const photoUrl of submissionData.photo_urls) {
				await sendPhoto(photoUrl, `📸 Photo jointe au message #${submissionData.submissionId}`);
			}
		}
	} catch (error) {
		console.error('❌ Error sending Telegram notification:', error);
	}
}
