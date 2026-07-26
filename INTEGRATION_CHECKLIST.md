# ✅ Integration Checklist

Gunakan checklist ini untuk memastikan semua komponen terintegrasi dengan benar.

## 📋 Pre-Integration

### Akun & Credentials

- [ ] Cloudflare account created
- [ ] Discord Developer account created
- [ ] Payinaja account created & verified
- [ ] Domain registered (untuk email)
- [ ] VPS/Cloud server ready (untuk bot)

### Software Installed

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Wrangler CLI installed
- [ ] Git installed
- [ ] PM2 installed (production)
- [ ] Nginx installed (optional)

---

## 🔧 Component Setup

### 1. CloudMail Worker (Backend)

- [ ] Repository cloned
- [ ] `cd mail-worker`
- [ ] `pnpm install` executed
- [ ] `wrangler login` successful
- [ ] D1 database created
  - [ ] `wrangler d1 create cloud-mail-db`
  - [ ] database_id copied to wrangler.toml
- [ ] KV namespace created
  - [ ] `wrangler kv:namespace create kv`
  - [ ] id copied to wrangler.toml
- [ ] R2 bucket created
  - [ ] `wrangler r2 bucket create cloud-mail-storage`
  - [ ] bucket_name added to wrangler.toml
- [ ] wrangler.toml configured
  - [ ] [[d1_databases]] uncommented & filled
  - [ ] [[kv_namespaces]] uncommented & filled
  - [ ] [[r2_buckets]] uncommented & filled
  - [ ] domain = ["yourdomain.com"] set
  - [ ] admin email set
  - [ ] jwt_secret generated & set
- [ ] Worker deployed
  - [ ] `wrangler deploy` successful
  - [ ] Custom domain added (Cloudflare Dashboard)
  - [ ] DNS configured (CNAME record)

**Test**:
```bash
curl https://mail.yourdomain.com/api/public/info
# Should return: {"code":200,"data":{...}}
```

### 2. CloudMail Vue (Frontend)

- [ ] `cd mail-vue`
- [ ] `pnpm install` executed
- [ ] Environment files checked
  - [ ] .env.dev (for development)
  - [ ] .env.release (for production)
  - [ ] VITE_BASE_URL configured
- [ ] Frontend built
  - [ ] `pnpm run build` successful
  - [ ] Output in `../mail-worker/dist` verified
- [ ] Worker redeployed with frontend
  - [ ] `cd ../mail-worker`
  - [ ] `wrangler deploy`

**Test**:
```bash
# Open in browser
https://mail.yourdomain.com
# Should show login page
```

### 3. Admin Account Setup

- [ ] First admin credentials set
  - [ ] `wrangler secret put FIRST_ADMIN_EMAIL`
  - [ ] `wrangler secret put FIRST_ADMIN_PASSWORD`
- [ ] Login successful
  - [ ] https://mail.yourdomain.com → Login
  - [ ] Credentials work
- [ ] Secrets removed after first login

**Test**:
```
Login with admin credentials → Should access dashboard
```

### 4. API Key Generation

- [ ] Logged in as admin
- [ ] Settings → API Keys opened
- [ ] New API key generated
  - [ ] Name: Discord Bot
  - [ ] Scopes: users, emails, stats (all checked)
  - [ ] Expiry: Never (or custom)
- [ ] API key copied (format: api_xxxxxxxxxx)
- [ ] API key saved securely

**Test**:
```bash
curl -X GET https://mail.yourdomain.com/api/v1/stats \
  -H "x-api-key: YOUR_API_KEY"
# Should return stats
```

### 5. Discord Bot Setup

- [ ] Discord Application created
  - [ ] https://discord.com/developers/applications
  - [ ] Application name set
- [ ] Bot configured
  - [ ] Bot added to application
  - [ ] Token copied
  - [ ] Intents enabled (SERVER MEMBERS, MESSAGE CONTENT)
- [ ] Bot invited to server
  - [ ] OAuth2 URL generated
  - [ ] Scopes: bot, applications.commands
  - [ ] Permissions configured
  - [ ] Bot joined server

- [ ] `cd cloud-mail-store-bot`
- [ ] `npm install` executed
- [ ] .env file created
  - [ ] `cp .env.example .env`
  - [ ] DISCORD_TOKEN set
  - [ ] CLIENT_ID set
  - [ ] PAYINAJA_API_KEY set
  - [ ] PAYINAJA_BASE set
  - [ ] CLOUDMAIL_API_KEY set (from step 4)
  - [ ] CLOUDMAIL_BASE set
  - [ ] CLOUDMAIL_EMAIL_DOMAIN set
  - [ ] ENCRYPTION_KEY generated & set
  - [ ] JWT_SECRET set (same as worker)
  - [ ] WEBHOOK_PORT set
  - [ ] ENABLE_WEBHOOKS set
  - [ ] Channel IDs set (optional)

- [ ] Database migrated
  - [ ] `npm run migrate` successful
  - [ ] data/store.db created
  - [ ] Tables verified

- [ ] Commands deployed
  - [ ] `npm run deploy` successful
  - [ ] Commands registered to Discord

- [ ] Bot started
  - [ ] `npm start` successful
  - [ ] "Bot siap!" message shown
  - [ ] Bot online in Discord

**Test**:
```
In Discord server:
/store
# Should show catalog
```

### 6. Payinaja Integration

- [ ] Payinaja account verified
- [ ] API key obtained
  - [ ] Dashboard → Settings → API Keys
  - [ ] Live key copied (sk_live_xxxxx)
  - [ ] Added to bot .env
- [ ] Webhook configured (optional)
  - [ ] Dashboard → Settings → Webhooks
  - [ ] URL: https://yourdomain.com/webhook/payinaja
  - [ ] Secret generated & added to .env
  - [ ] Events: payment.success, payment.failed
  - [ ] Webhook saved

**Test**:
```bash
# Create test payment
/store → Click "Beli Email Basic"
# Should generate QRIS code
```

---

## 🔗 Integration Testing

### Test 1: API Connectivity

- [ ] Bot can call CloudMail API
  ```bash
  # Check bot logs for API calls
  pm2 logs cloud-mail-bot
  # Should see: [CloudMail API] Request to /v1/users
  ```

### Test 2: Payment Flow

- [ ] QRIS generation works
  - [ ] `/store` → Click "Beli"
  - [ ] Private thread created
  - [ ] QRIS code shown
  
- [ ] Payment confirmation works
  - [ ] Pay with test amount (Rp 1.000)
  - [ ] Wait 5-10 seconds (webhook) or 1-2 minutes (polling)
  - [ ] "Pembayaran Berhasil!" message received

### Test 3: Email Creation

- [ ] After payment success:
  - [ ] Email credentials shown in thread
  - [ ] DM received with backup credentials
  - [ ] Order saved in database
  
- [ ] Email account works:
  - [ ] Login to https://mail.yourdomain.com
  - [ ] Use credentials from bot
  - [ ] Can access inbox
  - [ ] Can send email

### Test 4: Complete Flow

- [ ] User joins Discord server
- [ ] User runs `/store`
- [ ] User clicks "Beli Email Basic"
- [ ] Bot creates private thread
- [ ] Bot shows QRIS
- [ ] User pays
- [ ] Bot detects payment (webhook/polling)
- [ ] Bot calls CloudMail API to create user
- [ ] CloudMail creates email account
- [ ] Bot delivers credentials to user
- [ ] User logs in to webmail
- [ ] User can send/receive emails
- [ ] ✅ COMPLETE SUCCESS

---

## 🎯 Advanced Features

### Rockstar Stock (Optional)

- [ ] data/rockstar_stock.json created
- [ ] Accounts added to JSON
- [ ] Stock imported to database
- [ ] `/stock rockstar` shows count

### Vouchers

- [ ] `/voucher create` works
- [ ] Voucher code generated
- [ ] Discount applied in payment

### Referrals

- [ ] `/referral create` works
- [ ] Referral code generated
- [ ] Commission tracked

### Analytics

- [ ] `/analytics` shows stats
- [ ] Revenue tracked
- [ ] Sales counted

### Notifications (Optional)

- [ ] Admin notification channel set
- [ ] Transaction log channel set
- [ ] Testimonial channel set
- [ ] Notifications working

---

## 🚀 Production Deployment

### Bot Production

- [ ] PM2 configured
  - [ ] `pm2 start src/index.js --name cloud-mail-bot`
  - [ ] `pm2 startup` executed
  - [ ] `pm2 save` executed
  
- [ ] Auto-restart working
  - [ ] Reboot server → Bot auto-starts

### Nginx (Optional)

- [ ] Nginx installed
- [ ] Config file created
- [ ] Site enabled
- [ ] SSL configured (Let's Encrypt)
- [ ] Webhook URL updated

### Monitoring

- [ ] PM2 monitoring active
  - [ ] `pm2 monit`
  
- [ ] Cloudflare analytics checked
  - [ ] Dashboard → Workers → Metrics
  
- [ ] Logs accessible
  - [ ] `pm2 logs cloud-mail-bot`
  - [ ] `wrangler tail` (worker logs)

### Backups

- [ ] Auto-backup configured
  - [ ] Cron job set
  - [ ] Backup retention set
  
- [ ] Manual backup tested
  - [ ] `npm run backup`
  - [ ] data/backups/ created

---

## 🔒 Security Verification

- [ ] All .env files in .gitignore
- [ ] No secrets committed to Git
- [ ] API keys rotated (first test keys deleted)
- [ ] Encryption key is random & secure
- [ ] JWT secret is strong
- [ ] Webhook signature verified
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Admin commands restricted

---

## 📊 Final Verification

### Smoke Tests

- [ ] Worker responds to ping
- [ ] Frontend loads
- [ ] Login works
- [ ] Bot is online
- [ ] Commands respond
- [ ] Payment generates QRIS
- [ ] Webhook receives events (if enabled)
- [ ] Email creation works
- [ ] Email login works
- [ ] Email send/receive works

### Performance Tests

- [ ] Worker response time < 200ms
- [ ] Frontend loads < 2s
- [ ] Bot command response < 1s
- [ ] Payment generation < 3s
- [ ] Email creation < 5s

### Error Handling

- [ ] Invalid API key → Proper error
- [ ] Payment timeout → Proper message
- [ ] Stock empty → Button disabled
- [ ] DM closed → Thread-only delivery
- [ ] Network error → Retry mechanism

---

## ✅ Sign Off

**Date Completed**: _______________

**Integration Status**:
- [ ] 🟢 All systems operational
- [ ] 🟡 Minor issues, but functional
- [ ] 🔴 Critical issues, needs fix

**Components Status**:
- [ ] Worker: ✅ Deployed & Running
- [ ] Frontend: ✅ Accessible & Functional
- [ ] Bot: ✅ Online & Responding
- [ ] Payment: ✅ QRIS Generation Working
- [ ] Email: ✅ Creation & Access Working
- [ ] Database: ✅ All tables created
- [ ] Webhook: ✅ Receiving events (or polling working)

**Performance**:
- Worker uptime: _______
- Bot uptime: _______
- Error rate: _______
- Average response time: _______

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________

**Signed by**: _______________
**Role**: System Administrator

---

## 📞 Support Contacts

**Issues Found?**

1. Check logs:
   - Bot: `pm2 logs cloud-mail-bot`
   - Worker: Cloudflare Dashboard → Logs
   
2. Review documentation:
   - SETUP.md
   - INTEGRATION_GUIDE.md
   
3. Common issues:
   - API key invalid → Regenerate
   - Payment not confirming → Check webhook logs
   - Email not created → Check CloudMail API response

---

**Checklist Version**: 2.0.0
**Last Updated**: 2025-01-22
