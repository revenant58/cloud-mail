# 🚀 Cloud Mail - Complete Setup Guide

## 📌 Prerequisites

### Required Software
- **Node.js** 18+ (untuk Discord Bot)
- **pnpm** (untuk Worker & Vue)
- **Wrangler CLI** (Cloudflare)
- **Git**
- **SQLite** (optional, untuk inspect database)

### Required Accounts
- Cloudflare account (Workers, D1, R2, KV)
- Discord Developer account
- Payinaja account (payment gateway)
- Domain (untuk email)

---

## 🎯 Setup Steps (Urutan Penting!)

### **STEP 1: Setup Cloudflare Worker (Backend + Frontend)**

```bash
# 1. Install pnpm (jika belum)
npm install -g pnpm

# 2. Install Wrangler
npm install -g wrangler

# 3. Login ke Cloudflare
wrangler login

# 4. Masuk ke folder worker
cd mail-worker

# 5. Install dependencies
pnpm install

# 6. Create D1 Database
wrangler d1 create cloud-mail-db
# Output: database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# COPY ID ini ke wrangler.toml → [[d1_databases]] → database_id

# 7. Create KV Namespace
wrangler kv:namespace create kv
# Output: id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# COPY ID ini ke wrangler.toml → [[kv_namespaces]] → id

# 8. Create R2 Bucket
wrangler r2 bucket create cloud-mail-storage
# COPY nama bucket ke wrangler.toml → [[r2_buckets]] → bucket_name

# 9. Edit wrangler.toml
# Uncomment sections:
# - [[d1_databases]] dan isi database_id
# - [[kv_namespaces]] dan isi id
# - [[r2_buckets]] dan isi bucket_name
# - [vars] dan isi:
#   * domain = ["revmail.my.id"]  # Ganti dengan domain Anda
#   * admin = "admin@revmail.my.id"
#   * jwt_secret = "generate_random_string_32_chars"

# 10. Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output ke wrangler.toml → jwt_secret

# 11. Build Vue Frontend
cd ../mail-vue
pnpm install
pnpm run build  # Output: ../mail-worker/dist

# 12. Deploy Worker (Backend + Frontend)
cd ../mail-worker
wrangler deploy

# 13. Setup Custom Domain di Cloudflare Dashboard
# Workers → cloud-mail → Settings → Triggers → Custom Domains
# Add domain: mail.revmail.my.id (atau domain Anda)

# 14. Setup DNS (di Cloudflare Dashboard)
# DNS → Add Record:
# Type: CNAME
# Name: mail
# Target: cloud-mail.workers.dev (atau dari custom domain)
# Proxy: ON (orange cloud)

# 15. Test Worker
curl https://mail.revmail.my.id/api/public/info
# Output: {"code":200,"data":{...}}
```

**✅ Checkpoint**: Worker & Frontend deployed, accessible via browser

---

### **STEP 2: Setup Initial Admin Account**

```bash
# 1. Akses https://mail.revmail.my.id di browser

# 2. Klik "Login" → Akan redirect ke login page

# 3. Buat admin account (hanya bisa dilakukan sekali):
# Di Cloudflare Dashboard → Workers → cloud-mail → Settings → Variables
# Add variable:
# Name: FIRST_ADMIN_EMAIL
# Value: admin@revmail.my.id
# Name: FIRST_ADMIN_PASSWORD
# Value: your_secure_password

# 4. Atau via wrangler:
wrangler secret put FIRST_ADMIN_EMAIL
# Enter: admin@revmail.my.id

wrangler secret put FIRST_ADMIN_PASSWORD
# Enter: your_secure_password

# 5. Login dengan credentials tersebut

# 6. Setelah login berhasil, hapus variables FIRST_ADMIN_EMAIL & FIRST_ADMIN_PASSWORD
```

**✅ Checkpoint**: Admin account created, dapat login ke mail-vue

---

### **STEP 3: Generate API Key untuk Discord Bot**

```bash
# 1. Login ke https://mail.revmail.my.id sebagai admin

# 2. Klik Settings (⚙️) → API Keys

# 3. Click "Generate New API Key"
# Name: Discord Bot
# Scopes: ✅ users, ✅ emails, ✅ stats
# Expires: Never (atau set expiry)

# 4. COPY API KEY yang muncul (hanya tampil sekali!)
# Format: api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 5. Simpan untuk digunakan di Discord Bot .env
```

**✅ Checkpoint**: API Key generated dengan scopes yang benar

---

### **STEP 4: Setup Discord Bot**

```bash
# 1. Create Discord Application
# Buka: https://discord.com/developers/applications
# Click "New Application" → Nama: CloudMail Store Bot

# 2. Bot Settings
# Bot → Add Bot → Confirm
# Token → Copy (simpan untuk .env)
# Privileged Gateway Intents:
#   - ✅ SERVER MEMBERS INTENT (untuk thread management)
#   - ✅ MESSAGE CONTENT INTENT (untuk commands)

# 3. OAuth2 Settings
# OAuth2 → URL Generator
# Scopes:
#   - ✅ bot
#   - ✅ applications.commands
# Bot Permissions:
#   - ✅ Send Messages
#   - ✅ Create Public Threads
#   - ✅ Create Private Threads
#   - ✅ Send Messages in Threads
#   - ✅ Manage Threads
#   - ✅ Embed Links
#   - ✅ Attach Files
#   - ✅ Read Message History
# Copy Generated URL → Invite bot ke server Anda

# 4. Get Application ID
# General Information → Application ID → Copy (untuk CLIENT_ID)

# 5. Masuk ke folder bot
cd cloud-mail-store-bot

# 6. Install dependencies
npm install

# 7. Copy .env.example to .env
cp .env.example .env

# 8. Edit .env
nano .env  # atau text editor favorit Anda

# Isi wajib:
DISCORD_TOKEN=your_bot_token_from_step_2
CLIENT_ID=your_application_id_from_step_4
PAYINAJA_API_KEY=sk_live_xxxxx  # Dari Payinaja Dashboard
PAYINAJA_BASE=https://payinaja.com/api/v1
CLOUDMAIL_API_KEY=api_xxxxx  # Dari STEP 3
CLOUDMAIL_BASE=https://mail.revmail.my.id/api
ENCRYPTION_KEY=generate_with_crypto  # Generate di step berikutnya
JWT_SECRET=same_as_worker_jwt_secret  # Dari wrangler.toml
WEBHOOK_PORT=3000
ENABLE_WEBHOOKS=true

# 9. Generate Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output ke .env → ENCRYPTION_KEY

# 10. Setup Database
npm run migrate
# Output: ✅ Migration completed

# 11. Deploy Slash Commands ke Discord
npm run deploy
# Output: Successfully registered X application commands

# 12. Test Bot Locally
npm start
# Output: ✅ Bot siap! Logged in as CloudMail Store Bot#1234

# 13. Test di Discord
# Di server yang bot sudah join:
/store
# Harus muncul katalog paket email
```

**✅ Checkpoint**: Bot online, slash commands berfungsi, `/store` tampil katalog

---

### **STEP 5: Setup Payinaja Payment Gateway**

```bash
# 1. Daftar di Payinaja
# https://payinaja.com/register

# 2. Verifikasi akun (KYC)
# Submit dokumen yang diminta

# 3. Dapatkan API Key
# Dashboard → Settings → API Keys
# Copy "Live API Key" (format: sk_live_xxxxx)
# Paste ke Discord Bot .env → PAYINAJA_API_KEY

# 4. Setup Webhook (untuk instant notification)
# Dashboard → Settings → Webhooks → Add Webhook
# URL: https://your-domain.com/webhook/payinaja
#      atau http://your-vps-ip:3000/webhook/payinaja
# Secret: Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy ke .env → PAYINAJA_WEBHOOK_SECRET
# Events: Select "payment.success" dan "payment.failed"
# Save

# 5. Test Webhook (optional)
# Payinaja Dashboard → Webhooks → Test Webhook
# Harus muncul log di bot: [Webhook] Received Payinaja webhook
```

**Note**: Jika tidak bisa setup webhook (local dev), set `ENABLE_WEBHOOKS=false` di `.env` untuk fallback ke polling mode.

**✅ Checkpoint**: Payinaja configured, webhook ready

---

### **STEP 6: Setup Rockstar Stock (Optional)**

```bash
# 1. Siapkan akun Rockstar (email + password)

# 2. Masuk ke folder bot
cd cloud-mail-store-bot

# 3. Buat file stock
cp data/rockstar_stock.example.json data/rockstar_stock.json

# 4. Edit data/rockstar_stock.json
nano data/rockstar_stock.json

# Format:
[
  {
    "email": "rockstar1@example.com",
    "password": "password123"
  },
  {
    "email": "rockstar2@example.com",
    "password": "password456"
  }
]

# 5. Import stock ke database
node -e "
const { RockstarStock } = require('./src/database/models.js');
const fs = require('fs');
const accounts = JSON.parse(fs.readFileSync('./data/rockstar_stock.json'));
accounts.forEach(acc => {
  RockstarStock.add(acc.email, acc.password);
});
console.log('✅ Imported ' + accounts.length + ' accounts');
"

# 6. Verify stock
sqlite3 data/store.db "SELECT COUNT(*) FROM rockstar_stock WHERE status='available'"

# 7. Test di Discord
/stock rockstar
# Output: 📦 Stock Rockstar: X akun tersedia
```

**✅ Checkpoint**: Rockstar stock ready

---

### **STEP 7: Production Deployment (VPS/Cloud)**

#### **Option A: PM2 (Recommended)**

```bash
# 1. Install PM2
npm install -g pm2

# 2. Start bot dengan PM2
cd cloud-mail-store-bot
pm2 start src/index.js --name cloud-mail-bot

# 3. Setup auto-restart on system boot
pm2 startup
# Follow instructions (copy-paste command)

pm2 save

# 4. Monitor
pm2 logs cloud-mail-bot  # View logs
pm2 status                # Status
pm2 restart cloud-mail-bot  # Restart
```

#### **Option B: Docker**

```bash
# 1. Build image
cd cloud-mail-store-bot
docker build -t cloud-mail-bot .

# 2. Run container
docker run -d \
  --name cloud-mail-bot \
  --env-file .env \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  cloud-mail-bot

# 3. View logs
docker logs -f cloud-mail-bot
```

#### **Option C: Systemd Service**

```bash
# 1. Create service file
sudo nano /etc/systemd/system/cloud-mail-bot.service

# Content:
[Unit]
Description=CloudMail Discord Store Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/cloud-mail-store-bot
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# 2. Enable & start
sudo systemctl enable cloud-mail-bot
sudo systemctl start cloud-mail-bot

# 3. Check status
sudo systemctl status cloud-mail-bot
sudo journalctl -u cloud-mail-bot -f  # Logs
```

**✅ Checkpoint**: Bot running in production

---

### **STEP 8: Setup Reverse Proxy (Nginx - Optional)**

Jika bot di-host di VPS dan perlu domain untuk webhook:

```bash
# 1. Install Nginx
sudo apt update
sudo apt install nginx

# 2. Create config
sudo nano /etc/nginx/sites-available/cloud-mail-webhook

# Content:
server {
    listen 80;
    server_name webhook.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}

# 3. Enable site
sudo ln -s /etc/nginx/sites-available/cloud-mail-webhook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 4. Setup SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d webhook.yourdomain.com

# 5. Update Payinaja webhook URL
# https://webhook.yourdomain.com/webhook/payinaja
```

**✅ Checkpoint**: HTTPS webhook ready

---

## 🧪 Testing Integration

### **Test 1: CloudMail API**

```bash
# Get API key dari mail-vue Settings → API Keys

# Test create user
curl -X POST https://mail.revmail.my.id/api/v1/users \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@revmail.my.id","password":"test123"}'

# Expected: {"code":200,"data":{}}
```

### **Test 2: Discord Bot Commands**

```
/store              ← Show catalog
/saldo              ← Admin only - Check balance
/stock rockstar     ← Check Rockstar stock
/analytics          ← Admin only - Show stats
/voucher list       ← Show available vouchers
/referral create    ← Create referral code
/faq                ← Show FAQ
```

### **Test 3: Complete Purchase Flow**

```
1. /store → Click "Beli Email Basic"
2. Bot creates private thread
3. Bot shows QRIS code
4. Scan & pay (use test mode: Rp 1.000)
5. Wait 5-10 seconds (webhook) or 1-2 minutes (polling)
6. Bot sends email credentials in thread + DM
7. Login ke https://mail.revmail.my.id dengan credentials
8. ✅ Success!
```

### **Test 4: Email Sending**

```
1. Login ke mail-vue
2. Compose new email
3. To: test@gmail.com (atau email Anda)
4. Subject: Test Email
5. Body: Hello from CloudMail!
6. Send
7. Check inbox email tujuan
8. ✅ Email received!
```

---

## 🔧 Troubleshooting

### Issue: Bot tidak online

```bash
# Check logs
pm2 logs cloud-mail-bot

# Common causes:
# - Invalid DISCORD_TOKEN
# - Bot not invited to server
# - Wrong intents enabled
```

### Issue: API Key invalid

```bash
# Regenerate API key di mail-vue
# Update .env → CLOUDMAIL_API_KEY
# Restart bot: pm2 restart cloud-mail-bot
```

### Issue: Payment tidak terkonfirmasi

```bash
# Check webhook:
pm2 logs cloud-mail-bot | grep -i webhook

# If webhook not working:
# Set ENABLE_WEBHOOKS=false in .env
# Restart bot
# Payment will use polling (slower but works)
```

### Issue: Frontend tidak load

```bash
# Rebuild frontend
cd mail-vue
pnpm run build

# Redeploy worker
cd ../mail-worker
wrangler deploy
```

### Issue: Database migration error

```bash
# Delete and recreate database
cd cloud-mail-store-bot
rm data/store.db
npm run migrate
```

---

## 📊 Post-Setup Tasks

### 1. Create Admin Channels (Discord)

```
Right-click server → Create Channel → Text Channel:
- admin-notifications (untuk notif sales)
- transaction-logs (untuk audit)
- testimonial (untuk review otomatis)

Copy Channel IDs:
Right-click channel → Copy Channel ID

Update .env:
ADMIN_NOTIFICATION_CHANNEL=123456789012345678
TRANSACTION_LOG_CHANNEL=123456789012345678
TESTIMONIAL_CHANNEL=123456789012345678

Restart bot: pm2 restart cloud-mail-bot
```

### 2. Create Vouchers

```
/voucher create
Code: LAUNCH50
Type: percentage
Value: 50
Min Purchase: 10000
Max Uses: 100
Expires: 2025-12-31
```

### 3. Setup Auto Backup

```bash
# Edit crontab
crontab -e

# Add:
0 2 * * * cd /path/to/cloud-mail-store-bot && npm run backup

# Backups stored in: data/backups/
```

### 4. Monitor Performance

```bash
# Bot stats
pm2 monit

# Worker stats
# Cloudflare Dashboard → Workers → cloud-mail → Metrics

# Database size
du -h cloud-mail-store-bot/data/store.db
```

---

## 🎉 Setup Complete!

Your CloudMail system is now fully integrated and running:

✅ **Frontend**: https://mail.revmail.my.id (Vue.js webmail)
✅ **Backend**: CloudMail Worker API (Cloudflare)
✅ **Bot**: Discord Store Bot (Node.js + PM2)
✅ **Payment**: Payinaja QRIS (instant webhook)
✅ **Database**: D1 (backend) + SQLite (bot)

**Next Steps**:
- Share `/store` command di Discord server
- Market produk Anda
- Monitor sales via `/analytics`
- Respond to customer support
- Regularly backup database

**Support**:
- Check logs: `pm2 logs cloud-mail-bot`
- Check worker logs: Cloudflare Dashboard
- Documentation: `INTEGRATION_GUIDE.md`

---

**Made with ❤️ by CloudMail Team**
