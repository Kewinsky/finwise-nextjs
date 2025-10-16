# SaaS Template

A modern, production-ready SaaS template built with Next.js 15, Supabase, Stripe, and TypeScript. This template provides a complete foundation for building subscription-based SaaS applications with authentication, billing, and user management.

## 🚀 Features

### Core Features

- **Services Layer**: Clean architecture with separated business logic (User, Auth, Subscription, Billing, Notification services)
- **Authentication**: Complete auth system with Supabase (login, signup, password reset, magic links, OAuth)
- **Billing & Subscriptions**: Stripe integration with subscription management, webhooks, and customer portal
- **User Dashboard**: Protected dashboard with user settings and profile management
- **Error Monitoring**: Sentry integration for error tracking, performance monitoring, and session replay
- **Responsive Design**: Mobile-first design with Tailwind CSS and shadcn/ui
- **Dark/Light Mode**: Theme switching with next-themes
- **Email System**: Custom email templates with Supabase integration
- **Rate Limiting**: Built-in rate limiting with Upstash Redis
- **Security**: Comprehensive security headers, CSP, and middleware
- **Type Safety**: Full TypeScript support with Zod validation

### UI Components

- Modern, accessible components with Radix UI primitives
- Responsive navigation and sidebar
- Form components with validation
- Data tables with sorting and filtering
- Charts and analytics components
- Toast notifications and modals

### Developer Experience

- ESLint and Prettier configuration
- Husky git hooks
- TypeScript strict mode
- Hot reloading and fast refresh
- Comprehensive error handling
- Structured logging with Pino
- Error monitoring with Sentry
- Performance tracking and session replay

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or later
- **pnpm** (recommended) or npm/yarn
- **Git**

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <your-repository-url>
cd saas-template
pnpm install
```

### 2. Environment Setup

```bash
cp env.example .env.local
# Edit .env.local with your actual values
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📖 Complete Setup Guide

For detailed setup instructions including all external services (Supabase, Stripe, Upstash Redis, Sentry), see the **[Complete Setup Guide](docs/SETUP_GUIDE.md)**.

The setup guide covers:

- ✅ Supabase database and authentication setup
- ✅ Stripe payment processing configuration
- ✅ Rate limiting setup (Upstash Redis)
- ✅ Error monitoring setup (Sentry)
- ✅ OAuth provider configuration
- ✅ Domain and DNS setup
- ✅ Production deployment
- ✅ Application configuration

## 📁 Project Structure

```
saas-template/
├── src/
│   ├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── services/              # Business logic layer (6 services)
│   ├── components/            # React components (UI, forms, layouts)
│   ├── lib/                   # Utilities (actions, stripe, rate limiting)
│   ├── contexts/              # React contexts (settings, cookies)
│   ├── hooks/                 # Custom React hooks
│   ├── schemas/               # Zod validation schemas
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility functions
│   └── sentry/                # Error monitoring configuration
├── database/                  # Database initialization
├── emails/                    # Email templates
├── scripts/                   # Utility scripts
├── docs/                      # Comprehensive documentation
└── public/                    # Static assets
```

For detailed file structure and architecture information, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors
pnpm type-check       # Run TypeScript type checking
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Maintenance
pnpm clean            # Clean build cache
pnpm clean:all        # Clean everything and reinstall
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### Main Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System architecture, dependencies, and data flows
- **[Security](docs/SECURITY.md)** - Security features, authentication, and best practices
- **[Database](docs/DATABASE.md)** - Database schema, setup, and best practices
- **[API](docs/API.md)** - API routes, integrations, and server actions
- **[Services](docs/SERVICES.md)** - Services architecture and business logic guide
- **[Monitoring](docs/MONITORING.md)** - Error tracking, performance monitoring, and Sentry integration

## 📄 License

This project is licensed under the **MIT License**.

### License Summary

**You are free to:**

- ✅ Use this template for commercial and non-commercial projects
- ✅ Modify and customize the code
- ✅ Distribute your modified version
- ✅ Use this template for client projects
- ✅ Create derivative works

**You must:**

- 📝 Include the original license and copyright notice
- 📝 Include a copy of the MIT License with your distribution

### Full License

```
MIT License

Copyright (c) 2025 SaaS Template

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

For the complete license text, see the [LICENSE](LICENSE) file in the root directory.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform

---

**Happy coding! 🚀**
