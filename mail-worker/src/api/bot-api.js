import app from '../hono/hono';
import result from '../model/result';
import BizError from '../error/biz-error';
import userService from '../service/user-service';
import analysisDao from '../dao/analysis-dao';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import orm from '../entity/orm';
import emailEntity from '../entity/email';
import { isDel } from '../const/entity-const';

function verifySecret(c) {
	const secret = c.req.header('x-bot-secret');
	if (!secret || secret !== c.env.bot_secret) {
		throw new BizError('Invalid bot secret', 401);
	}
}

app.post('/bot/create-user', async (c) => {
	verifySecret(c);
	const params = await c.req.json();
	if (!params.type) params.type = 1;
	await userService.add(c, params);
	return c.json(result.ok());
});

app.get('/bot/users', async (c) => {
	verifySecret(c);
	const data = await userService.list(c, c.req.query());
	return c.json(result.ok(data));
});

app.delete('/bot/delete-user', async (c) => {
	verifySecret(c);
	const body = await c.req.json();
	await userService.physicsDelete(c, body);
	return c.json(result.ok());
});

app.get('/bot/emails', async (c) => {
	verifySecret(c);
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

app.get('/bot/email/:emailId', async (c) => {
	verifySecret(c);
	const { emailId } = c.req.param();
	const emailRow = await orm(c).select().from(emailEntity).where(eq(emailEntity.emailId, Number(emailId))).get();
	if (!emailRow) {
		throw new BizError('Email not found', 404);
	}
	return c.json(result.ok(emailRow));
});

app.delete('/bot/delete-email', async (c) => {
	verifySecret(c);
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

app.get('/bot/stats', async (c) => {
	verifySecret(c);
	const stats = await analysisDao.numberCount(c);
	return c.json(result.ok(stats));
});