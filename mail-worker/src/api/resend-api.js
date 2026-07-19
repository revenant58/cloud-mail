import resendService from '../service/resend-service';
import app from '../hono/hono';
app.post('/webhooks', async (c) => {
	try {
		const rawBody = await c.req.text();
		await resendService.webhooks(c, rawBody);
		return c.text('success', 200)
	} catch (e) {
		return c.text(e.message, e.status || 500)
	}
})
