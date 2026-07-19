import emailService from './email-service';
import { emailConst } from '../const/entity-const';
import BizError from '../error/biz-error';

const encoder = new TextEncoder();

const resendService = {

	// Fix #2: verify Resend webhook HMAC-SHA256 signature (svix format)
	async verifyWebhookSignature(c, rawBody) {
		const secret = c.env.resend_webhook_secret;
		if (!secret) throw new BizError('Webhook secret not configured', 500);

		const msgId = c.req.header('svix-id');
		const msgTimestamp = c.req.header('svix-timestamp');
		const msgSignature = c.req.header('svix-signature');

		if (!msgId || !msgTimestamp || !msgSignature) {
			throw new BizError('Missing webhook signature headers', 401);
		}

		// Reject if timestamp is older than 5 minutes
		const ts = parseInt(msgTimestamp, 10);
		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - ts) > 300) {
			throw new BizError('Webhook timestamp too old', 401);
		}

		// Strip "whsec_" prefix and decode base64 secret
		const secretBytes = Uint8Array.from(atob(secret.replace(/^whsec_/, '')), c => c.charCodeAt(0));

		const toSign = encoder.encode(`${msgId}.${msgTimestamp}.${rawBody}`);
		const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
		const sigBuffer = await crypto.subtle.sign('HMAC', key, toSign);
		const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

		// svix-signature may contain multiple sigs like "v1,<base64> v1,<base64>"
		const signatures = msgSignature.split(' ').map(s => s.replace(/^v1,/, ''));
		if (!signatures.includes(expectedSig)) {
			throw new BizError('Invalid webhook signature', 401);
		}
	},

	async webhooks(c, rawBody) {
		await this.verifyWebhookSignature(c, rawBody);

		const body = JSON.parse(rawBody);

		const params = {
			resendEmailId: body.data.email_id,
			status: emailConst.status.SENT
		}

		if (body.type === 'email.delivered') {
			params.status = emailConst.status.DELIVERED
			params.message = null
		}

		if (body.type === 'email.complained') {
			params.status = emailConst.status.COMPLAINED
			params.message = null
		}

		if (body.type === 'email.bounced') {
			let bounce = body.data.bounce
			bounce = JSON.stringify(bounce);
			params.status = emailConst.status.BOUNCED
			params.message = bounce
		}

		if (body.type === 'email.delivery_delayed') {
			params.status = emailConst.status.DELAYED
			params.message = null
		}

		if (body.type === 'email.failed') {
			params.status = emailConst.status.FAILED
			params.message = body.data.failed.reason
		}

		const emailRow = await emailService.updateEmailStatus(c, params)

		if (!emailRow) {
			throw new BizError('Failed to update email status');
		}

	}
}

export default resendService
