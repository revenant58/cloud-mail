import app from '../hono/hono';
import result from '../model/result';
import BizError from '../error/biz-error';
import apiKeyService from '../service/api-key-service';
import userService from '../service/user-service';
import analysisDao from '../dao/analysis-dao';
import orm from '../entity/orm';
import emailEntity from '../entity/email';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { isDel } from '../const/entity-const';

async function requireScope(c, requiredScope) {
	const key = c.req.header('x-api-key');
	const scopes = await apiKeyService.verify(c, key);
	if (!scopes.includes(requiredScope)) {
		throw new BizError(`Missing required scope: ${requiredScope}`, 403);
	}
	return scopes;
}

// Users
app.post('/v1/users', async (c) => {
	await requireScope(c, 'users');
	const params = await c.req.json();
	if (!params.type) params.type = 1;
	await userService.add(c, params);
	return c.json(result.ok());
});

app.get('/v1/users', async (c) => {
	await requireScope(c, 'users');
	const data = await userService.list(c, c.req.query());
	return c.json(result.ok(data));
});

app.delete('/v1/users', async (c) => {
	await requireScope(c, 'users');
	const body = await c.req.json();
	await userService.physicsDelete(c, body);
	return c.json(result.ok());
});

// Emails
app.get('/v1/emails', async (c) => {
	await requireScope(c, 'emails');
	let { num, size, type } = c.req.query();
	size = Number(size) || 20;
	num = Number(num) || 1;
	type = type !== undefined ? Number(type) : undefined;

	if (size > 50) size = 50;
	const offset = (num - 1) * size;

	const conditions = [eq(emailEntity.isDel, isDel.NORMAL)];
	if (type !== undefined) {
		conditions.push(eq(emailEntity.type, type));
	}

	const query = orm(c).select().from(emailEntity).where(and(...conditions)).orderBy(desc(emailEntity.emailId));
	const totalQuery = orm(c).select({ total: sql`count(*)`.as('total') }).from(emailEntity).where(and(...conditions));

	const [list, totalRow] = await Promise.all([
		query.limit(size).offset(offset).all(),
		totalQuery.get()
	]);

	return c.json(result.ok({ list, total: totalRow?.total || 0 }));
});

app.get('/v1/emails/:emailId', async (c) => {
	await requireScope(c, 'emails');
	const { emailId } = c.req.param();
	const emailRow = await orm(c).select().from(emailEntity).where(eq(emailEntity.emailId, Number(emailId))).get();
	if (!emailRow) {
		throw new BizError('Email not found', 404);
	}
	return c.json(result.ok(emailRow));
});

app.delete('/v1/emails', async (c) => {
	await requireScope(c, 'emails');
	const { emailIds } = await c.req.json();
	const emailIdList = emailIds.split(',').map(Number);
	await orm(c).update(emailEntity).set({ isDel: isDel.DELETE }).where(
		and(
			inArray(emailEntity.emailId, emailIdList),
			eq(emailEntity.isDel, isDel.NORMAL)
		)
	).run();
	return c.json(result.ok());
});

// Stats
app.get('/v1/stats', async (c) => {
	await requireScope(c, 'stats');
	const stats = await analysisDao.numberCount(c);
	return c.json(result.ok(stats));
});
