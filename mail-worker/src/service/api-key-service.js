import BizError from '../error/biz-error';
import orm from '../entity/orm';
import apiKeyEntity from '../entity/api-key';
import { eq, desc, inArray } from 'drizzle-orm';
import { t } from '../i18n/i18n';

const encoder = new TextEncoder();

async function sha256(text) {
	const data = encoder.encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateKey() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
	return 'cm_' + hex;
}

const apiKeyService = {

	async create(c, params) {
		const user = c.get('user');
		const { name, scopes, expireTime } = params;

		if (!name) {
			throw new BizError('Name is required', 400);
		}

		const rawKey = generateKey();
		const keyHash = await sha256(rawKey);
		const keyPrefix = rawKey.substring(0, 16) + '...';
		const scopesStr = JSON.stringify(scopes || []);

		const insertResult = await orm(c).insert(apiKeyEntity).values({
			name,
			keyHash,
			keyPrefix,
			scopes: scopesStr,
			status: 0,
			userId: user.userId || 0,
			expireTime: expireTime || null,
		}).returning().get();

		return {
			apiKey: rawKey,
			keyData: {
				...insertResult,
				keyHash: undefined,
			},
		};
	},

	async list(c) {
		const list = await orm(c).select().from(apiKeyEntity)
			.orderBy(desc(apiKeyEntity.apiKeyId))
			.all();
		return list.map(item => ({
			...item,
			keyHash: undefined,
		}));
	},

	async update(c, params) {
		const { apiKeyId, name, scopes, status, expireTime } = params;
		if (!apiKeyId) {
			throw new BizError('apiKeyId is required', 400);
		}
		const updates = {};
		if (name !== undefined) updates.name = name;
		if (scopes !== undefined) updates.scopes = JSON.stringify(scopes);
		if (status !== undefined) updates.status = status;
		if (expireTime !== undefined) updates.expireTime = expireTime;

		if (Object.keys(updates).length === 0) {
			throw new BizError('No fields to update', 400);
		}

		await orm(c).update(apiKeyEntity).set(updates)
			.where(eq(apiKeyEntity.apiKeyId, apiKeyId)).run();
	},

	async delete(c, params) {
		const { apiKeyIds } = params;
		if (!apiKeyIds) {
			throw new BizError('apiKeyIds is required', 400);
		}
		const idList = apiKeyIds.split(',').map(Number);
		await orm(c).delete(apiKeyEntity)
			.where(inArray(apiKeyEntity.apiKeyId, idList)).run();
	},

	async verify(c, key) {
		if (!key) {
			throw new BizError(t('authExpired'), 401);
		}
		const keyHash = await sha256(key);
		const row = await orm(c).select().from(apiKeyEntity)
			.where(eq(apiKeyEntity.keyHash, keyHash)).get();

		if (!row) {
			throw new BizError('Invalid API key', 401);
		}
		if (row.status === 1) {
			throw new BizError('API key is disabled', 401);
		}
		if (row.expireTime) {
			const now = new Date().toISOString();
			if (now > row.expireTime) {
				throw new BizError('API key has expired', 401);
			}
		}
		return JSON.parse(row.scopes);
	},
};

export default apiKeyService;
