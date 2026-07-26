# ☁️ CloudMail - Complete Email & Store System

> **Sistem Email Terintegrasi dengan Discord Store Bot + Payment Gateway QRIS**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)

## 📖 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur](#-arsitektur)
- [Teknologi](#-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Quick Start](#-quick-start)
- [Dokumentasi](#-dokumentasi)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Tentang Proyek

**CloudMail** adalah sistem lengkap yang terdiri dari:

1. **Email Server** - Temporary/permanent email dengan webmail interface
2. **Discord Store Bot** - Penjualan otomatis paket email + game accounts
3. **Payment Gateway** - Integrasi QRIS (Payinaja) untuk pembayaran instant
4. **Admin Dashboard** - Analytics, monitoring, dan management

### Use Cases

- 💼 **Bisnis Email** - Jual paket email custom domain
- 🎮 **Game Account Store** - Jual akun Rockstar/GTA V via Discord
- 🤖 **Automated Sales** - Bot handle semua dari order sampai delivery
- 📊 **Business Analytics** - Track revenue, sales, user growth

---

## ✨ Fitur Utama

### 📧 Email System (mail-vue + mail-worker)

- ✅ Webmail modern (Vue.js + Element Plus)
- ✅ Send/receive email dengan SMTP/IMAP
- ✅ Attachment support (R2 storage)
- ✅ Star/folder management
- ✅ Multi-user dengan role-based access
- ✅ API endpoints (RESTful)
- ✅ Real-time email notifications
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ PWA (Progressive Web App)

### 🤖 Discord Store Bot

- ✅ Slash commands (`/store`, `/saldo`, `/analytics`, dll)
- ✅ Private thread untuk setiap transaksi
- ✅ QRIS payment (semua e-wallet/bank)
- ✅ Instant delivery via webhook
- ✅ Auto-create email account
- ✅ Rockstar Games account delivery
- ✅ Voucher system (percentage/fixed)
- ✅ Referral program (komisi otomatis)
- ✅ Dynamic pricing (stock-based)
- ✅ Warranty tracking
- ✅ Review/testimonial system
- ✅ Admin notifications
- ✅ Transaction logging
- ✅ Auto-backup database

### 💰 Payment & Business

- ✅ Payinaja integration (QRIS)
- ✅ Webhook support (instant confirmation)
- ✅ Polling fallback (jika webhook down)
- ✅ Multiple payment methods
- ✅ Transaction history
- ✅ Refund tracking
- ✅ Revenue analytics

### 🔐 Security

- ✅ AES-256-GCM encryption
- ✅ JWT authentication
- ✅ API key with scopes
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Webhook signature verification
- ✅ SQL injection protection (ORM)
- ✅ XSS protection

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                        │
└─────────────────────────────────────────────────────────────────┘
           │                           │                    │
           │                           │                    │
    ┌──────▼──────┐          ┌────────▼────────┐   ┌──────▼──────┐
    │   Browser   │          │  Discord Client │   │   Mobile    │
    │  (Webmail)  │          │   (Store Bot)   │   │    Apps     │
    └──────┬──────┘          └────────┬────────┘   └──────┬──────┘
           │                           │                    │
           │ HTTPS                     │ Discord API        │ API
           │                           │                    │
┌──────────▼─────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKERS (Edge Network)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  mail-worker (Hono.js)                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │  │
│  │  │  API Routes│  │  Email Svc │  │   Auth     │        │  │
│  │  └────────────┘  └────────────┘  └────────────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Static      │  │  D1 Database │  │  KV Storage  │        │
│  │  Assets      │  │  (SQLite)    │  │  (Cache)     │        │
│  │  (Vue SPA)   │  └──────────────┘  └──────────────┘        │
│  └──────────────┘                                              │
│                     ┌──────────────┐                           │
│                     │  R2 Storage  │                           │
│                     │  (Files)     │                           │
│                     └──────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
           │                           │                    │
           │ API Call                  │ Create User        │
           ▼                           ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DISCORD BOT (Node.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  cloud-mail-store-bot                                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Commands  │  │  Handlers  │  │  Database  │        │   │
│  │  │  (/store)  │  │  (Payment) │  │  (SQLite)  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Webhook     │  │  Payinaja    │  │  CloudMail   │         │
│  │  Server      │  │  API Client  │  │  API Client  │         │
│  │  (Express)   │  └──────────────┘  └──────────────┘         │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
           │                           │
           │ Webhook                   │ Payment API
           ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Payinaja   │  │   Discord    │  │   SMTP/IMAP  │         │
│  │   (Payment)  │  │     API      │  │    Servers   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Purchase Flow**:
```
User → Discord → Bot → Payment Gateway → Webhook → Bot → CloudMail API → Create Email → Deliver to User
```

**Email Flow**:
```
User → Browser → Worker → D1 Database → R2 Storage → Response → Browser
```

---

## 🛠️ Teknologi

### Frontend (mail-vue)
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 7
- **UI Library**: Element Plus
- **State Management**: Pinia
- **Router**: Vue Router 4
- **HTTP Client**: Axios
- **Icons**: Iconify
- **Charts**: ECharts
- **I18n**: Vue I18n
- **PWA**: Vite PWA Plugin

### Backend (mail-worker)
- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **Database**: D1 (SQLite + Drizzle ORM)
- **Storage**: R2 (Object Storage)
- **Cache**: KV (Key-Value)
- **Email Parser**: postal-mime
- **AI**: Workers AI (LLaMA 3.1)

### Discord Bot (cloud-mail-store-bot)
- **Runtime**: Node.js 18+
- **Library**: Discord.js 14
- **Database**: better-sqlite3
- **Web Server**: Express
- **Scheduler**: node-cron
- **Security**: Helmet, CORS, Rate Limiting
- **Encryption**: Native Crypto (AES-256-GCM)

### Infrastructure
- **Deployment**: Cloudflare Workers, VPS/Cloud
- **CI/CD**: Wrangler CLI
- **Process Manager**: PM2
- **Proxy**: Nginx (optional)
- **SSL**: Let's Encrypt

---

## 📁 Struktur Proyek

```
cloud-mail/
├── mail-worker/              # Backend API (Cloudflare Worker)
│   ├── src/
│   │   ├── api/             # API endpoints
│   │   ├── dao/             # Data Access Objects
│   │   ├── entity/          # Drizzle ORM entities
│   │   ├── service/         # Business logic
│   │   ├── security/        # Auth middleware
│   │   ├── hono/            # Hono.js setup
│   │   └── index.js         # Worker entry point
│   ├── dist/                # Vue build output (static files)
│   ├── wrangler.toml        # Worker config
│   └── package.json
│
├── mail-vue/                 # Frontend (Vue.js SPA)
│   ├── src/
│   │   ├── views/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── store/           # Pinia stores
│   │   ├── router/          # Vue Router
│   │   ├── axios/           # HTTP client config
│   │   ├── i18n/            # Internationalization
│   │   └── main.js          # Vue entry point
│   ├── public/              # Static assets
│   ├── vite.config.js       # Vite config
│   └── package.json
│
├── cloud-mail-store-bot/    # Discord Store Bot
│   ├── src/
│   │   ├── commands/        # Slash commands
│   │   ├── handlers/        # Event handlers
│   │   ├── api/             # External API clients
│   │   ├── database/        # SQLite models & migrations
│   │   ├── utils/           # Utilities
│   │   ├── webhook/         # Webhook server
│   │   └── index.js         # Bot entry point
│   ├── data/                # Database & backups
│   ├── .env.example         # Environment template
│   └── package.json
│
├── docs-site/               # API Documentation
│   └── index.html
│
├── INTEGRATION_GUIDE.md     # Integration documentation
├── SETUP.md                 # Step-by-step setup guide
├── API_DOCS.html            # API reference
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+
node -v

# pnpm
npm install -g pnpm

# Wrangler CLI
npm install -g wrangler
```

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/cloud-mail.git
cd cloud-mail
```

### 2. Setup Worker (Backend)

```bash
cd mail-worker
pnpm install

# Login ke Cloudflare
wrangler login

# Create resources
wrangler d1 create cloud-mail-db
wrangler kv:namespace create kv
wrangler r2 bucket create cloud-mail-storage

# Edit wrangler.toml dengan IDs yang dihasilkan
# Uncomment [[d1_databases]], [[kv_namespaces]], [[r2_buckets]]

# Build Vue & Deploy
pnpm run deploy
```

### 3. Setup Frontend

```bash
cd ../mail-vue
pnpm install
pnpm run build  # Build ke ../mail-worker/dist
```

### 4. Setup Discord Bot

```bash
cd ../cloud-mail-store-bot
npm install

# Copy & edit .env
cp .env.example .env
nano .env  # Isi dengan config Anda

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run migration
npm run migrate

# Deploy commands
npm run deploy

# Start bot
npm start

# Production dengan PM2
pm2 start src/index.js --name cloud-mail-bot
```

### 5. Access System

- **Webmail**: https://mail.yourdomain.com
- **Discord**: `/store` command di server
- **API**: https://mail.yourdomain.com/api

---

## 📚 Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [SETUP.md](./SETUP.md) | Step-by-step setup lengkap |
| [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) | Panduan integrasi semua komponen |
| [API_DOCS.html](./API_DOCS.html) | API reference lengkap |
| [CODEBASE.md](./cloud-mail-store-bot/CODEBASE.md) | Bot codebase documentation |
| [ROCKSTAR_GUIDE.md](./cloud-mail-store-bot/ROCKSTAR_GUIDE.md) | Panduan sell Rockstar accounts |

---

## 📸 Screenshots

### Webmail Interface
![Webmail](docs/screenshots/webmail.png)
*Modern email interface dengan dark mode*

### Discord Store Bot
![Discord Bot](docs/screenshots/discord-store.png)
*Katalog produk dengan QRIS payment*

### Payment Flow
![Payment](docs/screenshots/payment-flow.png)
*Private thread untuk transaksi aman*

### Analytics Dashboard
![Analytics](docs/screenshots/analytics.png)
*Real-time business metrics*

---

## 🗺️ Roadmap

### ✅ Completed (v2.0)

- [x] Email system dengan webmail
- [x] Discord store bot
- [x] QRIS payment integration
- [x] Webhook support
- [x] Voucher & referral system
- [x] Rockstar account delivery
- [x] Analytics dashboard

### 🚧 In Progress (v2.1)

- [ ] Multi-language support (EN, ID, CN)
- [ ] Telegram bot alternative
- [ ] WhatsApp Business API
- [ ] Advanced analytics (cohorts, retention)
- [ ] Subscription billing

### 📋 Planned (v3.0)

- [ ] Multi-tenant support
- [ ] White-label solution
- [ ] Mobile app (React Native)
- [ ] Advanced fraud detection
- [ ] Cryptocurrency payment
- [ ] Affiliate dashboard
- [ ] Customer support ticketing

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Development Guidelines**:
- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Discord.js](https://discord.js.org/) - Discord bot library
- [Payinaja](https://payinaja.com/) - QRIS payment gateway
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Hono](https://hono.dev/) - Ultrafast web framework

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cloud-mail/issues)
- **Discord**: [Join our server](https://discord.gg/yourserver)
- **Email**: support@yourdomain.com
- **Documentation**: [Wiki](https://github.com/yourusername/cloud-mail/wiki)

---

## 📊 Stats

![GitHub Stars](https://img.shields.io/github/stars/yourusername/cloud-mail?style=social)
![GitHub Forks](https://img.shields.io/github/forks/yourusername/cloud-mail?style=social)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/cloud-mail)
![GitHub PRs](https://img.shields.io/github/issues-pr/yourusername/cloud-mail)

---

<div align="center">

**Made with ❤️ by CloudMail Team**

[Website](https://cloudmail.example.com) • [Documentation](./SETUP.md) • [Discord](https://discord.gg/yourserver)

</div>
