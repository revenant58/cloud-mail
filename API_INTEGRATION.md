# 🔌 CloudMail API - Bot Integration Guide

## 📋 Overview

Dokumen ini menjelaskan endpoint API yang digunakan oleh Discord Bot untuk integrasi dengan CloudMail Worker.

**Base URL**: `https://mail.revmail.my.id/api` (ganti dengan domain Anda)

**Authentication**: API Key via header `x-api-key`

---

## 🔐 Authentication

### Generate API Key

1. Login ke mail-vue sebagai admin
2. Navigate: Settings → API Keys
3. Click "Generate New API Key"
4. Configure:
   - **Name**: Discord Bot
   - **Scopes**: `users`, `emails`, `stats`
   - **Expires**: Never (atau set custom)
5. Copy API key (format: `api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. Add to bot `.env`: `CLOUDMAIL_API_KEY=api_xxxxx`

### Usage

```javascript
const headers = {
  'x-api-key': process.env.CLOUDMAIL_API_KEY,
  'Content-Type': 'application/json'
};
```

---

## 📊 Endpoints Used by Bot

### 1. Create User (Email Account)

**Endpoint**: `POST /v1/users`

**Required Scope**: `users`

**Usage**: Bot calls this when payment is confirmed to create email account

**Request**:
```javascript
POST /v1/users
Headers:
  x-api-key: api_xxxxx
  Content-Type: application/json

Body:
{
  "email": "user123@revmail.my.id",
  "password": "SecurePassword123!",
  "type": 1  // Optional, default: 1 (regular user)
}
```

**Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": null
}
```

**Error Responses**:

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 400 | Email already exists | Email sudah terdaftar | Generate email lain |
| 403 | Missing required scope: users | API key tidak punya scope users | Regenerate API key |
| 400 | Invalid email format | Format email salah | Validasi email dulu |
| 500 | Internal server error | Database error | Retry atau contact admin |

**Bot Implementation**:
```javascript
// cloud-mail-store-bot/src/api/cloudmail.js
export async function createUser(email, password) {
  const response = await fetch(`${BASE_URL}/v1/users`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to create user');
  }

  return data.data;
}
```

---

### 2. List Users

**Endpoint**: `GET /v1/users`

**Required Scope**: `users`

**Usage**: Admin commands (optional, untuk check user existence)

**Request**:
```javascript
GET /v1/users?num=1&size=20
Headers:
  x-api-key: api_xxxxx
```

**Query Parameters**:
- `num` (number): Page number (default: 1)
- `size` (number): Items per page (default: 20, max: 50)

**Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "user_id": 1,
        "email": "user@revmail.my.id",
        "type": 1,
        "role_id": null,
        "is_del": 0,
        "created_at": "2025-01-20T10:00:00Z",
        "updated_at": "2025-01-20T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 3. Get Statistics

**Endpoint**: `GET /v1/stats`

**Required Scope**: `stats`

**Usage**: Bot analytics command (`/analytics`)

**Request**:
```javascript
GET /v1/stats
Headers:
  x-api-key: api_xxxxx
```

**Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "userCount": 150,
    "emailCount": 3240,
    "inboxCount": 2100,
    "sentCount": 1140,
    "todayReceived": 45,
    "todaySent": 23
  }
}
```

**Bot Implementation**:
```javascript
export async function getStats() {
  const response = await fetch(`${BASE_URL}/v1/stats`, {
    headers: { 'x-api-key': API_KEY }
  });

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to get stats');
  }

  return data.data;
}
```

---

### 4. List Emails (Optional)

**Endpoint**: `GET /v1/emails`

**Required Scope**: `emails`

**Usage**: Future feature - show user's emails in Discord

**Request**:
```javascript
GET /v1/emails?num=1&size=10&type=0
Headers:
  x-api-key: api_xxxxx
```

**Query Parameters**:
- `num` (number): Page number (default: 1)
- `size` (number): Items per page (default: 20, max: 50)
- `type` (number): Email type
  - `0` = Inbox
  - `1` = Sent
  - `2` = Trash

**Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "list": [
      {
        "email_id": 1,
        "user_id": 1,
        "from_email": "sender@example.com",
        "to_email": "user@revmail.my.id",
        "subject": "Welcome!",
        "content": "Email body...",
        "type": 0,
        "is_star": 0,
        "is_del": 0,
        "created_at": "2025-01-20T10:00:00Z"
      }
    ],
    "total": 1
  }
}
```

---

### 5. Get Email Detail (Optional)

**Endpoint**: `GET /v1/emails/:emailId`

**Required Scope**: `emails`

**Request**:
```javascript
GET /v1/emails/123
Headers:
  x-api-key: api_xxxxx
```

**Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "email_id": 123,
    "user_id": 1,
    "from_email": "sender@example.com",
    "to_email": "user@revmail.my.id",
    "subject": "Welcome!",
    "content": "Full email body content...",
    "attachments": "[{\"name\":\"file.pdf\",\"url\":\"/attachments/...\"}]",
    "type": 0,
    "is_star": 0,
    "is_del": 0,
    "created_at": "2025-01-20T10:00:00Z"
  }
}
```

---

### 6. Delete Emails (Optional)

**Endpoint**: `DELETE /v1/emails`

**Required Scope**: `emails`

**Request**:
```javascript
DELETE /v1/emails
Headers:
  x-api-key: api_xxxxx
  Content-Type: application/json

Body:
{
  "emailIds": "1,2,3"  // Comma-separated email IDs
}
```

**Response**:
```json
{
  "code": 200,
  "message": "Success",
  "data": null
}
```

---

## 🔄 Integration Flow

### Complete Purchase Flow

```
┌─────────────┐
│ User runs   │
│ /store      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Bot shows   │
│ catalog     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ User clicks │
│ "Beli"      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Bot creates thread &    │
│ generates QRIS payment  │
│ (Payinaja API)          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────┐
│ User scans  │
│ & pays QRIS │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Payinaja sends webhook  │
│ OR bot polls status     │
└──────┬──────────────────┘
       │
       ▼ Payment Success
┌─────────────────────────┐
│ Bot calls:              │
│ POST /v1/users          │ ← INTEGRATION POINT
│ {email, password}       │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ CloudMail API creates   │
│ user in D1 database     │
└──────┬──────────────────┘
       │
       ▼ Success
┌─────────────────────────┐
│ Bot delivers credentials│
│ to user (thread + DM)   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────┐
│ User logs   │
│ in webmail  │
└─────────────┘
```

---

## 🛠️ Bot Implementation Reference

### File Structure

```
cloud-mail-store-bot/src/
├── api/
│   └── cloudmail.js          ← API wrapper
├── handlers/
│   ├── paymentFlowV2.js      ← Payment handling
│   └── successHandler.js     ← Success & delivery
└── config.js                 ← Settings
```

### cloudmail.js (API Wrapper)

```javascript
const BASE_URL = process.env.CLOUDMAIL_BASE;
const API_KEY = process.env.CLOUDMAIL_API_KEY;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.message || `API error (code: ${data.code})`);
  }

  return data.data;
}

export async function createUser(email, password) {
  return await request('/v1/users', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getStats() {
  return await request('/v1/stats');
}
```

### successHandler.js (Email Delivery)

```javascript
import { createUser, generateEmail } from '../api/cloudmail.js';
import { generatePassword, SETTINGS } from '../config.js';

export async function handleSuccessfulPayment(thread, user, pkg, orderId) {
  // Generate credentials
  const email = generateEmail(user.username, SETTINGS.EMAIL_DOMAIN);
  const password = generatePassword();

  // Create CloudMail account
  await createUser(email, password);

  // Deliver credentials
  const embed = new EmbedBuilder()
    .setTitle('✅ Pembelian Berhasil!')
    .setDescription(
      `**📧 Email:** \`${email}\`\n` +
      `**🔑 Password:** \`${password}\`\n\n` +
      `**Akses:** https://mail.revmail.my.id`
    )
    .setColor(0x10b981);

  await thread.send({ embeds: [embed] });
  
  // Send to DM
  try {
    await user.send({ embeds: [embed] });
  } catch (e) {
    // DM closed
  }
}
```

---

## 🔒 Security Best Practices

### 1. API Key Management

```bash
# NEVER hardcode API key
# ❌ BAD
const API_KEY = 'api_abc123...';

# ✅ GOOD
const API_KEY = process.env.CLOUDMAIL_API_KEY;
```

### 2. Error Handling

```javascript
try {
  await createUser(email, password);
} catch (error) {
  if (error.message.includes('already exists')) {
    // Handle duplicate email
    email = generateAlternativeEmail();
    await createUser(email, password);
  } else if (error.message.includes('scope')) {
    // API key issue
    console.error('API key missing scope');
    // Notify admin
  } else {
    // Unknown error
    throw error;
  }
}
```

### 3. Rate Limiting

```javascript
// Bot should respect rate limits
const RATE_LIMIT = {
  maxRequests: 100,
  perMinutes: 1
};

// Use rate limiter middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: RATE_LIMIT.perMinutes * 60 * 1000,
  max: RATE_LIMIT.maxRequests
});
```

### 4. Input Validation

```javascript
export function validateEmailFormat(email, domain) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  if (!email.endsWith(`@${domain}`)) {
    return { valid: false, message: `Must use @${domain}` };
  }
  
  return { valid: true };
}
```

---

## 🧪 Testing

### Manual Test with curl

```bash
# Set variables
API_KEY="api_your_key_here"
BASE_URL="https://mail.revmail.my.id/api"

# Test 1: Get stats
curl -X GET "${BASE_URL}/v1/stats" \
  -H "x-api-key: ${API_KEY}"

# Test 2: Create user
curl -X POST "${BASE_URL}/v1/users" \
  -H "x-api-key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@revmail.my.id",
    "password": "TestPassword123!"
  }'

# Test 3: List users
curl -X GET "${BASE_URL}/v1/users?num=1&size=10" \
  -H "x-api-key: ${API_KEY}"
```

### Automated Test

```bash
# Run integration test script
node test-integration.js
```

### Bot Integration Test

```javascript
// In Discord:
/store
// Click "Beli Email Basic"
// Pay with test amount (Rp 1.000 if sandbox)
// Wait for confirmation
// Check credentials delivered
// Login to webmail with credentials
```

---

## 🐛 Troubleshooting

### Error: "Missing required scope: users"

**Cause**: API key tidak punya scope `users`

**Solution**:
1. Login ke mail-vue
2. Settings → API Keys
3. Delete old key
4. Generate new key dengan scope `users`
5. Update `.env` di bot
6. Restart bot

### Error: "Email already exists"

**Cause**: Email sudah terdaftar di database

**Solution**:
```javascript
// Generate alternative email
function generateAlternativeEmail(baseEmail) {
  const [username, domain] = baseEmail.split('@');
  const random = Math.random().toString(36).substring(2, 6);
  return `${username}${random}@${domain}`;
}
```

### Error: "Invalid API key"

**Cause**: API key salah atau expired

**Solution**:
1. Check `.env` → `CLOUDMAIL_API_KEY`
2. Verify key format: `api_` prefix
3. Regenerate if expired
4. Check worker logs di Cloudflare Dashboard

### Error: "Connection timeout"

**Cause**: Worker tidak accessible atau down

**Solution**:
1. Check worker status di Cloudflare Dashboard
2. Check custom domain DNS
3. Check `CLOUDMAIL_BASE` in `.env`
4. Test: `curl https://mail.yourdomain.com/api/public/info`

---

## 📚 Additional Resources

- [Main Integration Guide](./INTEGRATION_GUIDE.md)
- [Setup Guide](./SETUP.md)
- [Full API Documentation](./API_DOCS.html)
- [Bot Codebase](./cloud-mail-store-bot/CODEBASE.md)

---

## 🆘 Support

**Issues with API**:
- Check Cloudflare Worker logs
- Verify API key scopes
- Test with curl/Postman

**Issues with Bot**:
- Check bot logs: `pm2 logs cloud-mail-bot`
- Verify .env configuration
- Run integration test: `node test-integration.js`

**Contact**:
- GitHub Issues: [Link]
- Discord: [Link]
- Email: support@yourdomain.com

---

**Last Updated**: 2025-01-22
**API Version**: v1
**Bot Version**: 2.0.0
