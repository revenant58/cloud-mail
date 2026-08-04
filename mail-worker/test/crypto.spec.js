import { describe, it, expect } from 'vitest';
import saltHashUtils from '../src/utils/crypto-utils.js';

describe('crypto-utils password hashing', () => {

	it('hashPassword produces a modern PBKDF2 hash with base64 salt', async () => {
		const { salt, hash } = await saltHashUtils.hashPassword('CorrectHorse9');
		expect(salt.length).toBeGreaterThanOrEqual(16);
		expect(hash.startsWith('pbkdf2$')).toBe(true);
		const parts = hash.split('$');
		expect(parts).toHaveLength(3);
		expect(Number(parts[1])).toBeGreaterThan(1000);
	});

	it('verifyPassword accepts the correct password for modern hashes', async () => {
		const { salt, hash } = await saltHashUtils.hashPassword('CorrectHorse9');
		expect(await saltHashUtils.verifyPassword('CorrectHorse9', salt, hash)).toBe(true);
	});

	it('verifyPassword rejects a wrong password', async () => {
		const { salt, hash } = await saltHashUtils.hashPassword('CorrectHorse9');
		expect(await saltHashUtils.verifyPassword('WrongPassword', salt, hash)).toBe(false);
	});

	it('verifyPassword handles empty/undefined stored hash', async () => {
		expect(await saltHashUtils.verifyPassword('anything', 'salt', undefined)).toBe(false);
		expect(await saltHashUtils.verifyPassword('anything', 'salt', '')).toBe(false);
	});

	it('verifyPassword rejects malformed modern hashes', async () => {
		expect(await saltHashUtils.verifyPassword('pwd', 'salt', 'pbkdf2$notanumber$abc')).toBe(false);
		expect(await saltHashUtils.verifyPassword('pwd', 'salt', 'pbkdf2$onlytwoparts')).toBe(false);
	});

	it('verifies legacy single-iteration SHA-256 hashes (backward compatibility)', async () => {
		const password = 'LegacyPwd123';
		const salt = 'legacy-salt';
		const legacyHash = await saltHashUtils.genLegacyHash(password, salt);
		expect(saltHashUtils.isModernHash(legacyHash)).toBe(false);
		expect(await saltHashUtils.verifyPassword(password, salt, legacyHash)).toBe(true);
		expect(await saltHashUtils.verifyPassword('OtherPwd', salt, legacyHash)).toBe(false);
	});

	it('genRandomPwd uses only alphanumerics and respects length', () => {
		const pwd = saltHashUtils.genRandomPwd(16);
		expect(pwd).toHaveLength(16);
		expect(pwd).toMatch(/^[A-Za-z0-9]+$/);
	});
});
