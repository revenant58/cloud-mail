import app from '../hono/hono';
import userService from '../service/user-service';
import roleService from '../service/role-service';
import settingService from '../service/setting-service';
import result from '../model/result';
import BizError from '../error/biz-error';
import { verify } from '@noble/ed25519';
import { hexToBytes } from '@noble/hashes/utils';

// Discord Interaction Types
const INTERACTION_PING = 1;
const INTERACTION_APPLICATION_COMMAND = 2;
const INTERACTION_AUTOCOMPLETE = 4;

// Discord Response Types
const RESPONSE_PONG = 1;
const RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE = 4;
const RESPONSE_AUTOCOMPLETE_RESULT = 8;

const CREATE_COMMAND = 'create';

// Verify Discord request signature
async function verifyDiscordRequest(signature, timestamp, rawBody, publicKeyHex) {
	const encoder = new TextEncoder();
	const timestampBytes = encoder.encode(timestamp);
	const bodyBytes = new Uint8Array(rawBody);
	const message = new Uint8Array(timestampBytes.length + bodyBytes.byteLength);
	message.set(timestampBytes);
	message.set(bodyBytes, timestampBytes.length);
	return await verify(hexToBytes(signature), message, hexToBytes(publicKeyHex));
}

// Get allowed Discord user IDs from env
function getAllowedIds(c) {
	const ids = c.env.allowed_discord_ids;
	if (!ids) return [];
	return ids.split(',').map(id => id.trim()).filter(Boolean);
}

// Discord embed helper
function makeEmbed(title, color, fields = []) {
	const embed = { title, color };
	if (fields.length) embed.fields = fields.map(f => ({
		name: f.name, value: f.value, inline: f.inline ?? false
	}));
	return embed;
}

// Handle /create command
async function handleCreateCommand(c, interaction) {
	const allowedIds = getAllowedIds(c);
	const userId = interaction.member?.user?.id || interaction.user?.id;

	if (allowedIds.length > 0 && !allowedIds.includes(userId)) {
		return {
			type: RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [makeEmbed('❌ Access Denied', 0xff0000, [
					{ name: 'Error', value: 'You are not authorized to use this command.' }
				])],
				flags: 64
			}
		};
	}

	const options = interaction.data.options || [];
	const username = options.find(o => o.name === 'username')?.value?.trim();
	const domain = options.find(o => o.name === 'domain')?.value?.trim();
	const password = options.find(o => o.name === 'password')?.value;

	if (!username || !domain || !password) {
		return {
			type: RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [makeEmbed('⚠️ Invalid Input', 0xffa500, [
					{ name: 'Error', value: 'All fields are required.' }
				])],
				flags: 64
			}
		};
	}

	if (password.length < 6) {
		return {
			type: RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [makeEmbed('⚠️ Weak Password', 0xffa500, [
					{ name: 'Error', value: 'Password must be at least 6 characters.' }
				])],
				flags: 64
			}
		};
	}

	const email = `${username}@${domain}`;

	try {
		const defaultRole = await roleService.selectDefaultRole(c);
		if (!defaultRole) {
			return {
				type: RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [makeEmbed('❌ Server Error', 0xff0000, [
						{ name: 'Error', value: 'No default role configured.' }
					])],
					flags: 64
				}
			};
		}
		await userService.add(c, { email, type: defaultRole.roleId, password });
		return {
			type: RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [makeEmbed('✅ Account Created', 0x00ff00, [
					{ name: 'Email', value: email, inline: true },
					{ name: 'Password', value: '`' + password + '`', inline: true }
				])]
			}
		};
	} catch (err) {
		return {
			type: RESPONSE_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [makeEmbed('❌ Creation Failed', 0xff0000, [
					{ name: 'Error', value: err.message || 'Unknown error.' }
				])],
				flags: 64
			}
		};
	}
}

// Handle autocomplete for domain option
async function handleAutocomplete(c, interaction) {
	const focused = interaction.data.options?.find(o => o.focused);
	if (!focused || focused.name !== 'domain') {
		return { type: RESPONSE_AUTOCOMPLETE_RESULT, data: { choices: [] } };
	}
	try {
		const setting = await settingService.query(c);
		const domainList = setting?.domainList || [];
		const filtered = domainList
			.filter(d => d.toLowerCase().includes(focused.value.toLowerCase()))
			.slice(0, 25)
			.map(d => {
				const name = d.replace('@', '');
				return { name, value: name };
			});
		return { type: RESPONSE_AUTOCOMPLETE_RESULT, data: { choices: filtered } };
	} catch (err) {
		return { type: RESPONSE_AUTOCOMPLETE_RESULT, data: { choices: [] } };
	}
}

// Main Discord Interactions endpoint
app.post('/discord/interactions', async (c) => {
	const publicKey = c.env.discord_public_key;
	if (!publicKey) {
		return c.json({ error: 'Discord public key not configured' }, 500);
	}

	const signature = c.req.header('x-signature-ed25519');
	const timestamp = c.req.header('x-signature-timestamp');
	if (!signature || !timestamp) {
		return c.json({ error: 'Missing signature headers' }, 401);
	}

	const rawBody = await c.req.clone().arrayBuffer();
	const isValid = await verifyDiscordRequest(signature, timestamp, rawBody, publicKey);
	if (!isValid) {
		return c.json({ error: 'Invalid request signature' }, 401);
	}

	const interaction = await c.req.json();

	if (interaction.type === INTERACTION_PING) {
		return c.json({ type: RESPONSE_PONG });
	}

	if (interaction.type === INTERACTION_AUTOCOMPLETE) {
		return c.json(await handleAutocomplete(c, interaction));
	}

	if (interaction.type === INTERACTION_APPLICATION_COMMAND) {
		if (interaction.data.name === CREATE_COMMAND) {
			return c.json(await handleCreateCommand(c, interaction));
		}
	}

	return c.json({ error: 'Unknown interaction type' }, 400);
});

// Keep internal API endpoint for other integrations
app.post('/bot/create-user', async (c) => {
	const secret = c.req.header('x-bot-secret');
	if (!secret || secret !== c.env.bot_secret) {
		throw new BizError('Unauthorized', 403);
	}
	const { username, domain, password } = await c.req.json();
	if (!username || !domain || !password) {
		throw new BizError('Missing required fields: username, domain, password');
	}
	if (password.length < 6) {
		throw new BizError('Password must be at least 6 characters');
	}
	const email = `${username}@${domain}`;
	const defaultRole = await roleService.selectDefaultRole(c);
	if (!defaultRole) {
		throw new BizError('No default role configured');
	}
	await userService.add(c, { email, type: defaultRole.roleId, password });
	return c.json(result.ok({ email }));
});
