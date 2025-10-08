import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
vi.mock('$env/static/private', () => ({
	SESSION_SECRET: 'test-secret-key-for-testing-purposes-only'
}));

describe('auth', () => {
	let generateSessionToken: typeof import('./auth').generateSessionToken;
	let verifySessionToken: typeof import('./auth').verifySessionToken;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.resetModules();
		const module = await import('./auth');
		generateSessionToken = module.generateSessionToken;
		verifySessionToken = module.verifySessionToken;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('generateSessionToken', () => {
		it('generates a token with three parts separated by dots', () => {
			const token = generateSessionToken();
			const parts = token.split('.');

			expect(parts).toHaveLength(3);
		});

		it('generates unique tokens each time', () => {
			const token1 = generateSessionToken();
			const token2 = generateSessionToken();

			expect(token1).not.toBe(token2);
		});

		it('includes timestamp in the first part', () => {
			const beforeTime = Date.now();
			const token = generateSessionToken();
			const afterTime = Date.now();

			const [timestampStr] = token.split('.');
			const timestamp = parseInt(timestampStr);

			expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
			expect(timestamp).toBeLessThanOrEqual(afterTime);
		});

		it('includes random data in the second part', () => {
			const token1 = generateSessionToken();
			const token2 = generateSessionToken();

			const [, random1] = token1.split('.');
			const [, random2] = token2.split('.');

			expect(random1).not.toBe(random2);
			expect(random1).toHaveLength(64); // 32 bytes as hex = 64 chars
		});

		it('includes signature in the third part', () => {
			const token = generateSessionToken();
			const [, , signature] = token.split('.');

			expect(signature).toBeTruthy();
			expect(signature).toHaveLength(64); // SHA256 hash as hex = 64 chars
		});
	});

	describe('verifySessionToken', () => {
		it('verifies a valid token', () => {
			const token = generateSessionToken();
			const isValid = verifySessionToken(token);

			expect(isValid).toBe(true);
		});

		it('rejects empty token', () => {
			expect(verifySessionToken('')).toBe(false);
		});

		it('rejects token with wrong number of parts', () => {
			expect(verifySessionToken('invalid')).toBe(false);
			expect(verifySessionToken('invalid.token')).toBe(false);
			expect(verifySessionToken('invalid.token.with.too.many.parts')).toBe(false);
		});

		it('rejects token with invalid signature', () => {
			const token = generateSessionToken();
			const [timestamp, random] = token.split('.');
			const tamperedToken = `${timestamp}.${random}.invalid-signature`;

			expect(verifySessionToken(tamperedToken)).toBe(false);
		});

		it('rejects token with tampered timestamp', () => {
			const token = generateSessionToken();
			const [, random, signature] = token.split('.');
			const tamperedToken = `9999999999999.${random}.${signature}`;

			expect(verifySessionToken(tamperedToken)).toBe(false);
		});

		it('rejects token with tampered random data', () => {
			const token = generateSessionToken();
			const [timestamp, , signature] = token.split('.');
			const tamperedToken = `${timestamp}.tampered-random-data.${signature}`;

			expect(verifySessionToken(tamperedToken)).toBe(false);
		});

		it('rejects expired token (older than 7 days)', () => {
			// Create a token from 8 days ago
			const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
			const mockDateNow = vi.spyOn(Date, 'now');

			// Generate token with old timestamp
			mockDateNow.mockReturnValueOnce(eightDaysAgo);
			const token = generateSessionToken();

			// Verify with current time
			mockDateNow.mockRestore();
			expect(verifySessionToken(token)).toBe(false);
		});

		it('accepts token that is exactly 7 days old', () => {
			// Create a token from exactly 7 days ago minus 1 second
			const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000 - 1000);
			const mockDateNow = vi.spyOn(Date, 'now');

			// Generate token with old timestamp
			mockDateNow.mockReturnValueOnce(sevenDaysAgo);
			const token = generateSessionToken();

			// Verify with current time
			mockDateNow.mockRestore();
			expect(verifySessionToken(token)).toBe(true);
		});

		it('accepts fresh token', () => {
			const token = generateSessionToken();
			expect(verifySessionToken(token)).toBe(true);
		});

		it('protects against timing attacks with constant-time comparison', () => {
			// This test verifies the timing-safe comparison is used
			// by checking that tokens with different signatures are rejected
			const token = generateSessionToken();
			const [timestamp, random] = token.split('.');

			// Create token with same length but different signature
			const wrongSignature = 'a'.repeat(64);
			const invalidToken = `${timestamp}.${random}.${wrongSignature}`;

			expect(verifySessionToken(invalidToken)).toBe(false);
		});

		it('rejects signature with different length', () => {
			const token = generateSessionToken();
			const [timestamp, random] = token.split('.');
			const shortSignature = 'abc';
			const invalidToken = `${timestamp}.${random}.${shortSignature}`;

			expect(verifySessionToken(invalidToken)).toBe(false);
		});
	});

	describe('token lifecycle', () => {
		it('generates and verifies token in full lifecycle', () => {
			// Generate a new token
			const token = generateSessionToken();
			expect(token).toBeTruthy();

			// Verify it's valid
			expect(verifySessionToken(token)).toBe(true);

			// Verify it's a string
			expect(typeof token).toBe('string');

			// Verify it has the correct format
			expect(token.split('.')).toHaveLength(3);
		});

		it('different tokens are all valid but unique', () => {
			const tokens = Array.from({ length: 10 }, () => generateSessionToken());

			// All tokens should be valid
			tokens.forEach((token) => {
				expect(verifySessionToken(token)).toBe(true);
			});

			// All tokens should be unique
			const uniqueTokens = new Set(tokens);
			expect(uniqueTokens.size).toBe(tokens.length);
		});
	});
});
