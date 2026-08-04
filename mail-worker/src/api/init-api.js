import app from '../hono/hono';
import { dbInit } from '../init/init';

app.get('/init/:secret', (c) => {
	// Deprecated: secret appears in URLs/logs. Prefer POST /init with JSON body.
	return dbInit.init(c);
})

app.post('/init', async (c) => {
	let secret = c.req.query('secret') || '';
	try {
		const body = await c.req.json();
		if (body && body.secret) secret = body.secret;
	} catch (e) {
		// no JSON body, keep query secret
	}
	return dbInit.init(c, secret);
})
