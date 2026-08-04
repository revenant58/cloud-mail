import app from '../hono/hono';
import result from '../model/result';
import publicService from '../service/public-service';
import verifyRecordService from '../service/verify-record-service';
import { verifyRecordType } from '../const/entity-const';

app.post('/public/genToken', async (c) => {
	await verifyRecordService.checkRateLimit(c, verifyRecordType.LOGIN);
	const data = await publicService.genToken(c, await c.req.json());
	return c.json(result.ok(data));
});

app.post('/public/emailList', async (c) => {
	const list = await publicService.emailList(c, await c.req.json());
	return c.json(result.ok(list));
});

app.post('/public/addUser', async (c) => {
	await publicService.addUser(c, await c.req.json());
	return c.json(result.ok());
});
