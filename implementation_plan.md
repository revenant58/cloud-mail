# Discord Bot — User Creation via `/create` Slash Command

## Goal
Menambahkan Discord bot yang bisa membuat akun Cloud Mail langsung dari Discord menggunakan slash command `/create`.

## Command Format
```
/create username:john domain:example.com password:secret123
```
- `username` — email prefix (string, required)
- `domain` — domain selector (string, required)
- `password` — password (string, required)

## Architecture

```
Discord User → /create slash command → Discord Bot (Node.js) → POST /bot/create-user → Cloudflare Worker → D1 DB
```

**Standalone bot** — Node.js process menggunakan `discord.js`, berjalan secara terpisah dari Worker.

## Open Questions

> [!IMPORTANT]
> **1. Siapa yang boleh pakai `/create` dari Discord?**
> - Opsi A: Hanya admin Discord (by Discord User ID whitelist)
> - Opsi B: Semua user di server
> - Opsi C: Role tertentu di Discord
>
> **2. Password di command**
> Slash command options **tidak visible** ke user lain di UI, tapi admin bisa lihat di audit log. Alternatif: bot DM password ke user.
>
> **3. Bot location**
> Mau dijalankan di mana? VPS/PC lokal?

## Proposed Changes

### Component: discord-bot (NEW)

#### `discord-bot/package.json`
Dependencies: `discord.js`, `dotenv`, `node-fetch`

#### `discord-bot/.env.example`
```
DISCORD_BOT_TOKEN=your_token
CLOUD_MAIL_API=https://your-worker-url/api
BOT_SECRET=shared_secret_here
ALLOWED_DISCORD_IDS=123456789,987654321
```

#### `discord-bot/deploy-commands.js`
Register slash command `/create` ke Discord API:
- Option: `username` (STRING, required)
- Option: `domain` (STRING, required)
- Option: `password` (STRING, required)

#### `discord-bot/index.js`
Bot entry:
- Login, listen `interactionCreate`
- `/create` handler:
  1. Check Discord user ID in whitelist
  2. Call `POST {API}/bot/create-user` with shared secret
  3. Reply embed success/error

---

### Component: Worker (MODIFY)

#### `mail-worker/src/api/bot-api.js` (NEW)
```
POST /bot/create-user
Headers: x-bot-secret: <BOT_SECRET>
Body: { email, password }
```
- Verify `x-bot-secret` === `c.env.bot_secret`
- Delegate to `userService.add(c, ...)` — reuse existing
- Return `{ success, message, email }`

#### `mail-worker/src/hono/webs.js` (MODIFY)
Add import `'../api/bot-api'`

#### `mail-worker/wrangler.toml` (MODIFY)
Add: `#bot_secret = ""`

---

## Flow

1. User ketik `/create` di Discord
2. Bot validasi Discord user ID whitelist
3. Bot construct email: `{username}@{domain}`
4. Bot call `POST /api/bot/create-user` with shared secret
5. Worker: verify secret, check domain, create user
6. Bot reply embed ke Discord: `✅ Account created: john@example.com`

## Verification

1. Deploy worker with `bot_secret`
2. Run `node deploy-commands.js`
3. Run `node index.js`
4. Use `/create` in Discord
5. Verify user in admin panel + login via web
