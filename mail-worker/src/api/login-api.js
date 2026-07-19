import app from '../hono/hono';
import loginService from '../service/login-service';
import result from '../model/result';
import userContext from '../security/user-context';
import verifyRecordService from '../service/verify-record-service';
import { verifyRecordType } from '../const/entity-const';

app.post('/login', async (c) => {
	await verifyRecordService.checkRateLimit(c, verifyRecordType.LOGIN);
	const token = await loginService.login(c, await c.req.json());
	return c.json(result.ok({ token: token }));
});

app.post('/register', async (c) => {
	await verifyRecordService.checkRateLimit(c, verifyRecordType.LOGIN);
	const jwt = await loginService.register(c, await c.req.json());
	return c.json(result.ok(jwt));
});

app.delete('/logout', async (c) => {
	await loginService.logout(c, userContext.getUserId(c));
	return c.json(result.ok());
});

