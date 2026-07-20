import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const apiKey = sqliteTable('api_key', {
	apiKeyId: integer('api_key_id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().default(''),
	keyHash: text('key_hash').notNull(),
	keyPrefix: text('key_prefix').notNull().default(''),
	scopes: text('scopes').notNull().default('[]'),
	status: integer('status').notNull().default(0), // 0=active, 1=disabled
	userId: integer('user_id').notNull().default(0),
	createTime: text('create_time').notNull().default(sql`CURRENT_TIMESTAMP`),
	expireTime: text('expire_time'),
});

export default apiKey;
