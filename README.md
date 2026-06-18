<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">RevMailHost</h1>
    <p align="center">A simple, responsive email service built on Cloudflare, supporting email sending and attachments 🎉</p> 
    <p align="center">
        English | <a href="/README-en.md" style="margin-left: 5px">简体中文 </a>
    </p>
    <p align="center">
        <a href="https://github.com/revenant58/cloud-mail/tree/main?tab=MIT-1-ov-file" target="_blank" >
            <img src="https://img.shields.io/badge/license-MIT-green" />
        </a>    
        <a href="https://github.com/revenant58/cloud-mail/releases" target="_blank" >
            <img src="https://img.shields.io/github/v/release/revenant58/cloud-mail" alt="releases" />
        </a>  
        <a href="https://github.com/revenant58/cloud-mail/issues" >
            <img src="https://img.shields.io/github/issues/revenant58/cloud-mail" alt="issues" />
        </a>  
        <a href="https://github.com/revenant58/cloud-mail/stargazers" target="_blank">
            <img src="https://img.shields.io/github/stars/revenant58/cloud-mail" alt="stargazers" />
        </a>  
        <a href="https://github.com/revenant58/cloud-mail/forks" target="_blank" >
            <img src="https://img.shields.io/github/forks/revenant58/cloud-mail" alt="forks" />
        </a>
    </p>
</p>


## About

With just one domain, you can create multiple email addresses — similar to major email platforms. This project can be deployed on Cloudflare Workers to reduce server costs and build your own email service.

## Live Demo

- [Online Demo](https://skymail.ink)<br>
- [Deployment Docs](https://doc.skymail.ink)<br>

| ![](/doc/demo/demo1.png) | ![](/doc/demo/demo2.png) |
|-----------------------|-----------------------|
| ![](/doc/demo/demo3.png) | ![](/doc/demo/demo4.png) |




## Features

- **💰 Low-Cost Usage**: Deploy to Cloudflare Workers to reduce server costs

- **💻 Responsive Design**: Automatically adapts to desktop and most mobile browsers

- **📧 Email Sending**: Integrated with Resend for sending emails, supporting bulk sends, inline images, and attachments

- **🛡️ Admin Features**: Manage users and emails, with RBAC access control for feature and resource limits

- **📦 Attachment Support**: Send and receive attachments, stored and downloaded via R2 object storage

- **🔔 Email Push**: Forward received emails to Telegram bots or other email providers

- **📡 Open API**: Supports batch user creation via API and multi-condition email queries

- **🔢 Verification Code Recognition**: Uses Workers AI to automatically detect email verification codes

- **📈 Data Visualization**: Uses ECharts to display system data and user email growth charts

- **🎨 Customization**: Customize website title, login background, and transparency

- **🤖 CAPTCHA**: Integrated with Turnstile CAPTCHA to prevent automated registration

- **📜 More Features**: Under development...



## Tech Stack

- **Platform**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)

- **Web Framework**: [Hono](https://hono.dev/)

- **ORM**: [Drizzle](https://orm.drizzle.team/)

- **Frontend**: [Vue3](https://vuejs.org/) 

- **UI Framework**: [Element Plus](https://element-plus.org/) 

- **Email Service**: [Resend](https://resend.com/)

- **Cache**: [Cloudflare KV](https://developers.cloudflare.com/kv/)

- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)

- **File Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)

## Directory Structure

```
cloud-mail
├── mail-worker			    # Worker backend project
│   ├── src                 
│   │   ├── api	 		    # API layer
│   │   ├── const 		    # Project constants
│   │   ├── dao             # Data access layer
│   │   ├── email		    # Email processing
│   │   ├── entity		    # Database entities
│   │   ├── error		    # Custom exceptions
│   │   ├── hono		    # Web framework, middleware, error handling
│   │   ├── i18n		    # Internationalization
│   │   ├── init		    # Database and cache initialization
│   │   ├── model		    # Response data models
│   │   ├── security		# Authentication and authorization
│   │   ├── service		    # Business logic layer
│   │   ├── template		# Message templates
│   │   ├── utils		    # Utility functions
│   │   └── index.js		# Entry point
│   ├── package.json		# Dependencies
│   └── wrangler.toml		# Project configuration
│
├── mail-vue			    # Vue frontend project
│   ├── src
│   │   ├── axios 		    # Axios configuration
│   │   ├── components		# Custom components
│   │   ├── echarts		    # ECharts integration
│   │   ├── i18n		    # Internationalization
│   │   ├── init		    # App initialization
│   │   ├── layout		    # Layout components
│   │   ├── perm		    # Permissions and access control
│   │   ├── request		    # API request layer
│   │   ├── router		    # Router configuration
│   │   ├── store		    # Global state management
│   │   ├── utils		    # Utility functions
│   │   ├── views		    # Page components
│   │   ├── app.vue		    # Root component
│   │   ├── main.js		    # Entry JS
│   │   └── style.css		# Global styles
│   ├── package.json		# Dependencies
└── └── env.release			# Environment configuration
```

## Sponsor

<a href="https://doc.skymail.ink/support.html" >
<img width="170px" src="./doc/images/support.png" alt="">
</a>

## License

This project is licensed under the [MIT](LICENSE) license.	


## Community

[Telegram](https://t.me/cloud_mail_tg)


