const encoder = new TextEncoder();

const PBKDF2_PREFIX = 'pbkdf2$';
const PBKDF2_ITERATIONS = 100000;

function toBase64(bytes) {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	}
	return btoa(binary);
}

function constantTimeEqual(a, b) {
	// constant-time comparison to prevent timing attacks
	const x = encoder.encode(a);
	const y = encoder.encode(b);
	if (x.length !== y.length) return false;
	let diff = 0;
	for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
	return diff === 0;
}

async function pbkdf2(password, salt, iterations) {
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		encoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);

	const bits = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			hash: 'SHA-256',
			salt: encoder.encode(salt),
			iterations
		},
		keyMaterial,
		256
	);

	return toBase64(new Uint8Array(bits));
}

const saltHashUtils = {

	generateSalt(length = 16) {
		const array = new Uint8Array(length);
		crypto.getRandomValues(array);
		return toBase64(array);
	},

	isModernHash(hash) {
		return typeof hash === 'string' && hash.startsWith(PBKDF2_PREFIX);
	},

	async hashPassword(password) {
		const salt = this.generateSalt();
		const hash = await this.genHashPassword(password, salt);
		return { salt, hash };
	},

	// PBKDF2-SHA256, format: pbkdf2$<iterations>$<derivedKeyBase64>
	async genHashPassword(password, salt) {
		const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
		return `${PBKDF2_PREFIX}${PBKDF2_ITERATIONS}$${derived}`;
	},

	// Legacy single-iteration SHA-256 hash (kept for existing accounts)
	async genLegacyHash(password, salt) {
		const data = encoder.encode(salt + password);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		return toBase64(new Uint8Array(hashBuffer));
	},

	async verifyPassword(inputPassword, salt, storedHash) {
		if (!storedHash) return false;

		if (this.isModernHash(storedHash)) {
			const parts = storedHash.split('$');
			if (parts.length !== 3) return false;
			const iterations = Number(parts[1]);
			if (!iterations) return false;
			const derived = await pbkdf2(inputPassword, salt, iterations);
			return constantTimeEqual(derived, parts[2]);
		}

		const hash = await this.genLegacyHash(inputPassword, salt);
		return constantTimeEqual(hash, storedHash);
	},

	// use CSPRNG instead of Math.random()
	genRandomPwd(length = 8) {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const array = new Uint8Array(length);
		crypto.getRandomValues(array);
		return Array.from(array, b => chars[b % chars.length]).join('');
	}
};

export default saltHashUtils;
