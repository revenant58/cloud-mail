import app from '../hono/hono';
import result from '../model/result';
import BizError from '../error/biz-error';
import apiKeyService from '../service/api-key-service';

// Admin-only: create API key (returns plaintext once)
app.post('/apiKey/create', async (c) => {
	const user = c.get('user');
	if (user.email !== c.env.admin) {
		throw new BizError('Admin only', 403);
	}
	const params = await c.req.json();
	const data = await apiKeyService.create(c, params);
	return c.json(result.ok(data));
});

// Admin-only: list all keys
app.get('/apiKey/list', async (c) => {
	const user = c.get('user');
	if (user.email !== c.env.admin) {
		throw new BizError('Admin only', 403);
	}
	const data = await apiKeyService.list(c);
	return c.json(result.ok(data));
});

// Admin-only: update key
app.put('/apiKey/update', async (c) => {
	const user = c.get('user');
	if (user.email !== c.env.admin) {
		throw new BizError('Admin only', 403);
	}
	const params = await c.req.json();
	await apiKeyService.update(c, params);
	return c.json(result.ok());
});

// Admin-only: delete key
app.delete('/apiKey/delete', async (c) => {
	const user = c.get('user');
	if (user.email !== c.env.admin) {
		throw new BizError('Admin only', 403);
	}
	const apiKeyIds = c.req.query('apiKeyIds');
	if (!apiKeyIds) {
		throw new BizError('apiKeyIds is required', 400);
	}
	await apiKeyService.delete(c, { apiKeyIds });
	return c.json(result.ok());
});
