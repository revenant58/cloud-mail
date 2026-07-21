import app from '../hono/hono';
import result from '../model/result';
import BizError from '../error/biz-error';
import apiKeyService from '../service/api-key-service';

app.post('/apiKey/create', async (c) => {
	const params = await c.req.json();
	const data = await apiKeyService.create(c, params);
	return c.json(result.ok(data));
});

app.get('/apiKey/list', async (c) => {
	const data = await apiKeyService.list(c);
	return c.json(result.ok(data));
});

app.put('/apiKey/update', async (c) => {
	const params = await c.req.json();
	await apiKeyService.update(c, params);
	return c.json(result.ok());
});

app.delete('/apiKey/delete', async (c) => {
	const apiKeyIds = c.req.query('apiKeyIds');
	if (!apiKeyIds) {
		throw new BizError('apiKeyIds is required', 400);
	}
	await apiKeyService.delete(c, { apiKeyIds });
	return c.json(result.ok());
});
