import { createHmac, randomBytes } from 'crypto';
import { SESSION_SECRET } from '$env/static/private';

if (!SESSION_SECRET) {
	throw new Error(
		'Missing SESSION_SECRET environment variable. Please set SESSION_SECRET in your .env file.'
	);
}

/**
 * Generates a cryptographically secure session token
 * Format: {timestamp}.{randomData}.{signature}
 */
export function generateSessionToken(): string {
	const timestamp = Date.now().toString();
	const random = randomBytes(32).toString('hex');
	const data = `${timestamp}.${random}`;
	const signature = createHmac('sha256', SESSION_SECRET).update(data).digest('hex');

	return `${data}.${signature}`;
}

/**
 * Verifies a session token's signature and expiration
 * Returns true if valid and not expired (7 days)
 */
export function verifySessionToken(token: string): boolean {
	if (!token) return false;

	const parts = token.split('.');
	if (parts.length !== 3) return false;

	const [timestamp, random, signature] = parts;
	const data = `${timestamp}.${random}`;

	// Verify signature
	const expectedSignature = createHmac('sha256', SESSION_SECRET).update(data).digest('hex');

	// Use timing-safe comparison to prevent timing attacks
	if (!timingSafeEqual(signature, expectedSignature)) {
		return false;
	}

	// Check expiration (7 days)
	const tokenAge = Date.now() - parseInt(timestamp);
	const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

	return tokenAge < maxAge;
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;

	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}
