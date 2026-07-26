# 🔗 Cloud Mail - Integration Guide

## 📋 Ringkasan Proyek

Proyek ini terdiri dari **3 komponen utama** yang saling terintegrasi:

### 1. **mail-worker** (Backend API - Cloudflare Worker)
- **Teknologi**: Cloudflare Workers, Hono.js, Drizzle ORM
- **Database**: D1 (SQLite), KV, R2 Object Storage
- **Fungsi**: Email server backend, API endpoints, scheduled tasks
- **Port Development**: 8787
- **Deploy**: Cloudflare Workers

### 2. **mail-vue** (Frontend - Vue.js SPA)
- **Teknologi**: Vue 3, Vite, Pinia, Element Plus, Vue Router
- **Fungsi**: Web interface untuk email client
- **Port Development**: 5173
- **Deploy**: Build ke `mail-worker/dist` → Served by Cloudflare Worker

### 3. **cloud-mail-store-bot** (Discord Store Bot)
- **Teknologi**: Discord.js 14, SQLite (better-sqlite3), Express
- **Fungsi**: Penjualan paket email via Discord dengan payment gateway QRIS
- **Port Webhook**: 3000
- **Deploy**: Node.js server (VPS/Cloud)

---

## 🔄 Alur Integrasi

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. User di Discord → /store command
2. Discord Bot → Show packages (CloudMail email + Rockstar accounts)
3. User → Click "Beli" button
4. Discord Bot → Create QRIS payment (Payinaja API)
5. User → Scan & pay
6. Payinaja → Webhook to Discord Bot OR Polling
7. Discord Bot → Call CloudMail API (/v1/users) to create email
8. CloudMail API → Create email user in D1 database
9. Discord Bot → Send credentials to user (Thread + DM)
10. User → Access email via mail-vue (https://mail.revmail.my.id)
```

---

## 🔌 API Integration Points

### **Discord Bot ↔ CloudMail Worker**

**File**: `cloud-mail-store-bot/src/api/cloudmail.js`

#### Endpoints yang digunakan:

| Method | Endpoint | Fungsi | Scope Required |
|--------|----------|--------|----------------|
| POST | `/v1/users` | Create new email user | `users` |
| GET | `/v1/users` | List users (pagination) | `users` |
| GET | `/v1/emails` | List emails inbox/sent/trash | `emails` |
| GET | `/v1/emails/{id}` | Get email detail | `emails` |
| DELETE | `/v1/emails` | Delete emails | `emails` |
| GET | `/v1/stats` | Get statistics | `stats` |

#### Autentikasi:
```javascript
Headers: {
  'x-api-key': process.env.CLOUDMAIL_API_KEY
}
```

#### Konfigurasi Bot:
```env
# .env di cloud-mail-store-bot/
CLOUDMAIL_API_KEY=your_api_key_here
CLOUDMAIL_BASE=https://mail.revmail.my.id/api
```

#### Konfigurasi Worker:
```toml
# wrangler.toml
[vars]
domain = ["revmail.my.id"]  # Email domain
admin = "admin@revmail.my.id"
bot_secret = "secret_key_for_discord_bot"  # Set via Dashboard
```

---

## 🔐 Authentication Flow

### 1. **API Key Generation** (Worker Side)

File: `mail-worker/src/service/api-key-service.js`

```javascript
// Admin login ke mail-vue
// Settings → API Keys → Generate New Key
// Pilih scopes: users, emails, stats
// Copy API key → Simpan di Discord Bot .env
```

**Scopes Available**:
- `users` - Create, list, delete users
- `emails` - Read, list, delete emails
- `stats` - Get statistics
- `all` - Full access

### 2. **JWT Token** (Frontend Auth)

File: `mail-vue/src/store/user.js`

```javascript
// User login via mail-vue
// Token stored in localStorage
// Auto-refresh on API calls
```

---

## 📦 Package Configuration

### **Discord Bot Packages** (`cloud-mail-store-bot/src/config.js`)

```javascript
export const PACKAGES = [
  {
    id: 'basic',
    name: 'Email Basic',
    type: 'email',
    price: 15000,
    emoji: '📧',
    features: [
      '✅ 1 Email @revmail.my.id',
      '✅ Unlimited emails (kirim/terima)',
      '✅ SMTP/IMAP support',
      '✅ Webmail access'
    ],
    duration: 'Lifetime',
    storage: 'Unlimited',
    color: 0x3b82f6
  },
  {
    id: 'rockstar',
    name: 'Rockstar + GTA V',
    type: 'rockstar',
    price: 35000,
    emoji: '🎮',
    features: [
      '✅ Akun Rockstar Social Club',
      '✅ GTA V Full Game',
      '✅ Support FiveM',
      '✅ Garansi 7 hari'
    ],
    duration: 'Lifetime',
    storage: 'N/A',
    color: 0xef4444
  }
];
```

**Price Mapping**:
- Harga di bot HARUS sesuai dengan value proposisi
- Dynamic pricing otomatis naik saat stock rendah
- Voucher/referral discount di-handle bot side

---

## 🗄️ Database Schema

### **Discord Bot** (SQLite - `cloud-mail-store-bot/data/store.db`)

```sql
-- Orders table
CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  fee INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  voucher_code TEXT,
  referral_code TEXT,
  payinaja_trx_id TEXT,
  status TEXT DEFAULT 'pending',
  thread_id TEXT,
  email_created TEXT,
  rockstar_account_id TEXT,
  rockstar_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME,
  completed_at DATETIME,
  cancelled_at DATETIME,
  error_at DATETIME,
  error_message TEXT
);

-- Rockstar Stock table
CREATE TABLE rockstar_stock (
  account_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  order_id TEXT,
  buyer_discord_id TEXT,
  sold_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE vouchers (
  code TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  value INTEGER NOT NULL,
  min_purchase INTEGER,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE referrals (
  code TEXT PRIMARY KEY,
  owner_discord_id TEXT NOT NULL,
  owner_username TEXT NOT NULL,
  use_count INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **CloudMail Worker** (D1 Database)

File: `mail-worker/src/entity/*.js` (Drizzle ORM)

```sql
-- Users table
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  type INTEGER DEFAULT 1,
  role_id INTEGER,
  is_del INTEGER DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
);

-- Emails table
CREATE TABLE emails (
  email_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  from_email TEXT,
  to_email TEXT,
  subject TEXT,
  content TEXT,
  attachments TEXT,
  type INTEGER DEFAULT 0,
  is_star INTEGER DEFAULT 0,
  is_del INTEGER DEFAULT 0,
  created_at DATETIME
);

-- API Keys table
CREATE TABLE api_keys (
  key_id INTEGER PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  scopes TEXT NOT NULL,
  expires_at DATETIME,
  created_at DATETIME
);
```

---

## 🚀 Deployment Guide

### **1. Deploy CloudMail Worker (Backend + Frontend)**

```bash
cd mail-worker

# Install dependencies
pnpm install

# Create D1 database
wrangler d1 create cloud-mail-db
# Copy database_id ke wrangler.toml

# Create KV namespace
wrangler kv:namespace create kv
# Copy id ke wrangler.toml

# Create R2 bucket
wrangler r2 bucket create cloud-mail-storage
# Update wrangler.toml

# Update wrangler.toml dengan config
# [[d1_databases]]
# binding = "db"
# database_name = "cloud-mail-db"
# database_id = "YOUR_D1_ID"

# [[kv_namespaces]]
# binding = "kv"
# id = "YOUR_KV_ID"

# [[r2_buckets]]
# binding = "r2"
# bucket_name = "cloud-mail-storage"

# [vars]
# domain = ["revmail.my.id"]
# admin = "admin@revmail.my.id"
# jwt_secret = "your_random_jwt_secret_here"

# Build frontend + deploy worker
pnpm run deploy

# Set secret (API key untuk bot)
wrangler secret put bot_secret
# Enter: your_bot_secret_key
```

**Domain Setup**:
1. Cloudflare Workers → Custom Domain
2. Add CNAME: `mail.revmail.my.id` → `your-worker.workers.dev`
3. Update DNS settings

### **2. Deploy Discord Bot**

```bash
cd cloud-mail-store-bot

# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env

# Edit .env dengan config Anda:
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
PAYINAJA_API_KEY=sk_live_xxxxx
CLOUDMAIL_API_KEY=your_api_key_from_worker
CLOUDMAIL_BASE=https://mail.revmail.my.id/api
ENCRYPTION_KEY=generate_with_crypto_random_bytes
WEBHOOK_PORT=3000
ENABLE_WEBHOOKS=true

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run migration (create tables)
npm run migrate

# Deploy slash commands to Discord
npm run deploy

# Start bot
npm start

# Production (with PM2)
pm2 start src/index.js --name cloud-mail-bot
```

**Discord Bot Setup**:
1. Discord Developer Portal → Create Application
2. Bot → Add Bot → Copy Token
3. OAuth2 → Scopes: `bot`, `applications.commands`
4. Bot Permissions: `Send Messages`, `Manage Threads`, `Embed Links`
5. Invite bot ke server Anda

### **3. Webhook Setup (Instant Payment)**

**Payinaja Webhook Configuration**:
1. Login ke Payinaja Dashboard
2. Settings → Webhooks → Add Webhook
3. URL: `https://your-vps-domain.com/webhook/payinaja`
4. Secret: Copy ke `.env` → `PAYINAJA_WEBHOOK_SECRET`
5. Events: `payment.success`, `payment.failed`

**Nginx Reverse Proxy** (jika perlu):
```nginx
server {
    listen 80;
    server_name your-vps-domain.com;

    location /webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔄 Integration Testing

### **Test CloudMail API**

```bash
# Get API Key dari mail-vue
# Settings → API Keys → Generate (scopes: users, emails, stats)

# Test create user
curl -X POST https://mail.revmail.my.id/api/v1/users \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@revmail.my.id","password":"test123"}'

# Test list users
curl https://mail.revmail.my.id/api/v1/users?num=1&size=10 \
  -H "x-api-key: YOUR_API_KEY"

# Test stats
curl https://mail.revmail.my.id/api/v1/stats \
  -H "x-api-key: YOUR_API_KEY"
```

### **Test Discord Bot**

```bash
# Di Discord server:
/store                 # Lihat katalog
/saldo                 # Cek saldo (admin)
/stock rockstar        # Cek stock Rockstar
/voucher create        # Buat voucher (admin)
/referral create       # Buat kode referral
/analytics             # Lihat statistik (admin)
```

---

## 🐛 Common Issues & Solutions

### **1. Bot tidak bisa create email**

**Symptom**: Error "Missing required scope: users"

**Solution**:
```bash
# 1. Generate API key di mail-vue dengan scope 'users'
# 2. Update .env di bot:
CLOUDMAIL_API_KEY=new_api_key_with_users_scope

# 3. Restart bot
pm2 restart cloud-mail-bot
```

### **2. Frontend tidak bisa load**

**Symptom**: 404 pada static assets

**Solution**:
```bash
cd mail-vue
pnpm install
pnpm run build  # Build ke ../mail-worker/dist

cd ../mail-worker
pnpm run deploy  # Deploy ulang worker
```

### **3. Webhook tidak trigger**

**Symptom**: Payment success tapi bot tidak kirim produk

**Solution**:
```bash
# 1. Check webhook server running
pm2 list  # Pastikan bot running

# 2. Check port forwarding / nginx
curl http://localhost:3000/webhook/payinaja -X POST

# 3. Check Payinaja webhook logs di Dashboard

# 4. Fallback: Disable webhook, use polling
# .env:
ENABLE_WEBHOOKS=false
```

### **4. CORS Error di Frontend**

**Symptom**: CORS policy blocked

**Solution**:
```javascript
// mail-worker/src/security/security.js
// Sudah ada CORS middleware, check origin whitelist

// Jika perlu tambah origin:
app.use('*', cors({
  origin: ['https://mail.revmail.my.id', 'http://localhost:5173'],
  credentials: true
}));
```

---

## 📊 Monitoring & Analytics

### **CloudMail Stats**

Access: `mail-vue` → Settings → Analytics

- Total users
- Total emails sent/received
- Storage usage
- API usage

### **Discord Bot Analytics**

Command: `/analytics` (admin only)

- Total sales
- Revenue
- Top selling products
- User growth
- Referral commissions

### **Database Queries**

```sql
-- Bot: Check pending orders
SELECT * FROM orders WHERE status = 'pending';

-- Bot: Revenue today
SELECT SUM(total_amount) FROM orders 
WHERE status = 'completed' 
AND DATE(paid_at) = DATE('now');

-- Worker: Active users
SELECT COUNT(*) FROM users WHERE is_del = 0;

-- Worker: Emails today
SELECT COUNT(*) FROM emails 
WHERE DATE(created_at) = DATE('now');
```

---

## 🔒 Security Best Practices

1. **Environment Variables**: NEVER commit `.env` files
2. **API Keys**: Rotate regularly, use minimal scopes
3. **Encryption**: Bot uses AES-256-GCM for sensitive data
4. **JWT Secret**: Use strong random strings (32+ chars)
5. **Rate Limiting**: Enabled di worker & webhook server
6. **Webhook Signature**: Always verify Payinaja signature
7. **SQL Injection**: Using Drizzle ORM (prepared statements)
8. **XSS Protection**: Helmet.js di webhook server

---

## 📚 API Documentation

Full API docs: `API_DOCS.html`

Key endpoints documented:
- Authentication (`/login`, `/register`)
- User management (`/v1/users`)
- Email operations (`/v1/emails`)
- API key management (`/api-keys`)
- Public APIs (`/public/*`)

---

## 🤝 Support

**Discord Bot Issues**:
- Check logs: `pm2 logs cloud-mail-bot`
- Database: `sqlite3 data/store.db`

**CloudMail Issues**:
- Check worker logs: Cloudflare Dashboard → Workers → Logs
- Check D1: `wrangler d1 execute cloud-mail-db --command "SELECT * FROM users"`

**Payment Issues**:
- Payinaja Dashboard: https://payinaja.com/dashboard
- Check webhook logs
- Verify API key validity

---

## 📝 Changelog

**v2.0.0** (Current)
- ✅ Full integration Discord Bot + CloudMail
- ✅ Webhook support (instant payment)
- ✅ Rockstar Games accounts
- ✅ Dynamic pricing
- ✅ Voucher system
- ✅ Referral program
- ✅ Analytics dashboard

---

**Made with ❤️ by CloudMail Team**
