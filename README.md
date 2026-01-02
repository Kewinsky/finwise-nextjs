# Finwise

## Overview

- Finwise is an AI-powered SaaS application for personal and business financial management
- It solves the problem of fragmented financial tracking by providing a unified platform for expense and income tracking, financial analysis, and AI-powered insights
- Built for individuals and small businesses who need comprehensive financial tracking with intelligent recommendations

## Key Features

- **AI-Powered Financial Assistant**: Natural language chat interface for asking financial questions, with context-aware responses based on transaction data
- **Automated Financial Insights**: AI-generated monthly insights including spending patterns, savings recommendations, budget optimization, and areas of concern
- **Transaction Management**: Create, edit, and delete income, expense, and transfer transactions with categorization
- **Multi-Account Support**: Track multiple accounts (checking, savings, investment, credit card) with balance management
- **Financial Dashboard**: Real-time analytics with monthly summaries, category spending breakdowns, spending trends, and account balance history
- **Subscription Management**: Stripe-integrated subscription plans (Free, Basic, Pro) with checkout, webhooks, and customer portal
- **Data Export**: Export transactions to CSV and JSON formats with filtering options
- **User Authentication**: Email/password, magic link, and OAuth (Google, GitHub) authentication via Supabase Auth
- **User Preferences**: Customizable theme (dark/light mode), language, font, and notification settings
- **Rate Limiting**: API and authentication rate limiting using Upstash Redis
- **Error Monitoring**: Production error tracking and performance monitoring with Sentry

## Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Component Library**: shadcn/ui, Radix UI primitives
- **Icons**: Lucide React, Tabler Icons
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Animations**: Motion (Framer Motion)
- **Theme**: next-themes for dark/light mode

### Backend

- **Runtime**: Next.js Server Actions and API Routes
- **Language**: TypeScript (strict mode)
- **Authentication**: Supabase Auth (JWT-based)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Payment Processing**: Stripe (Checkout, Subscriptions, Webhooks)
- **AI Integration**: OpenAI API for financial insights and chat assistant
- **Rate Limiting**: Upstash Redis
- **Logging**: Pino (structured logging)

### Infrastructure / Cloud

- **Hosting**: Vercel (serverless functions, edge network, CDN)
- **Database**: Supabase (managed PostgreSQL)
- **Cache/Rate Limiting**: Upstash Redis
- **Error Monitoring**: Sentry (error tracking, performance monitoring, session replay)
- **Email**: Supabase Auth email templates

### Tooling & DevOps

- **Package Manager**: pnpm
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Git Hooks**: Husky with lint-staged
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Type Checking**: TypeScript compiler
- **Build Tool**: Next.js built-in bundler

## Architecture & Design

- **Architecture Pattern**: Layered architecture with clear separation between presentation, business logic, and data access layers
- **Design Patterns**:
  - Service Layer Pattern: Business logic encapsulated in service classes (TransactionService, AccountService, AIAssistantService, BillingService, etc.)
  - Server Actions Pattern: Form submissions and mutations via Next.js Server Actions
  - Repository Pattern: Data access abstraction through Supabase client
  - Dependency Injection: Services receive dependencies via constructor
- **Data Flow**:
  - Client components → Server Actions → Service Layer → Supabase Client → PostgreSQL (with RLS)
  - Stripe webhooks → API Routes → Service Layer → Database updates
  - AI requests → Service Layer → OpenAI API → Response processing → Database storage
- **Security Architecture**:
  - Multi-layer security: Middleware authentication checks, RLS policies at database level, rate limiting at API level
  - JWT tokens stored in HTTP-only cookies with automatic refresh
  - Service role client for webhook operations (bypasses RLS when needed)

## Project Structure

```
finwise-nextjs/
├── src/
│   ├── app/                    # Next.js App Router (pages, layouts, API routes)
│   │   ├── (auth)/            # Authentication pages (login, signup)
│   │   ├── (protected)/       # Protected routes (dashboard, transactions, settings)
│   │   ├── (public)/          # Public pages (landing, pricing)
│   │   └── api/               # API routes (Stripe webhooks)
│   ├── components/             # React components
│   │   ├── accounts/          # Account management components
│   │   ├── assistant/         # AI chat interface components
│   │   ├── dashboard/         # Dashboard analytics components
│   │   ├── transactions/      # Transaction management components
│   │   ├── settings/          # Settings and preferences components
│   │   └── ui/                # Reusable UI components (shadcn/ui)
│   ├── services/              # Business logic layer
│   │   ├── account.service.ts
│   │   ├── ai.service.ts
│   │   ├── auth.service.ts
│   │   ├── billing.service.ts
│   │   ├── subscription.service.ts
│   │   └── transaction.service.ts
│   ├── lib/                   # Utilities and helpers
│   │   ├── actions/           # Server actions
│   │   ├── stripe/            # Stripe integration utilities
│   │   ├── openai/            # OpenAI client and configuration
│   │   ├── ratelimit/         # Rate limiting utilities
│   │   └── constants/         # Error messages, logs
│   ├── hooks/                 # Custom React hooks
│   ├── contexts/              # React contexts (settings, AI usage)
│   ├── types/                 # TypeScript type definitions
│   ├── validation/            # Zod validation schemas
│   └── middleware.ts          # Next.js middleware for route protection
├── database/                  # Database initialization scripts
├── emails/                    # Email templates
├── e2e/                      # Playwright E2E tests
├── integration/               # Integration tests
└── docs/                     # Project documentation
```

## Setup & Local Development

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm/yarn
- Git
- Supabase account (for database and authentication)
- Stripe account (for payment processing)
- Upstash Redis account (for rate limiting)
- OpenAI API key (for AI features)
- Sentry account (for error monitoring, optional)

### Installation Steps

1. Clone the repository:

```bash
git clone <repository-url>
cd finwise-nextjs
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp env.example .env.local
```

4. Configure environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `UPSTASH_REDIS_REST_URL` - Upstash Redis endpoint
   - `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
   - `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` - Stripe Basic plan price ID
   - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Stripe Pro plan price ID
   - `OPENAI_API_KEY` - OpenAI API key (optional, set `ENABLE_OPENAI=true` to use)
   - `SENTRY_AUTH_TOKEN` - Sentry auth token (optional)

5. Set up Supabase database:
   - Run `database/init.sql` in Supabase SQL Editor to create tables, functions, and RLS policies

6. Run the development server:

```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

All required environment variables are documented in `env.example`. Key variables include:

- Supabase configuration (database and authentication)
- Stripe configuration (payment processing)
- Upstash Redis configuration (rate limiting)
- OpenAI configuration (AI features)
- Sentry configuration (error monitoring, optional)
- Application URLs (for production)

## Deployment

- **Deployment Platform**: Vercel (serverless hosting with edge network and CDN)
- **Deployment Process**:
  - Connect GitHub repository to Vercel
  - Configure environment variables in Vercel dashboard
  - Automatic deployments on push to main branch
  - Preview deployments for pull requests
- **Infrastructure Services**:
  - Vercel: Application hosting, edge functions, CDN
  - Supabase: Database and authentication (managed PostgreSQL)
  - Upstash: Redis for rate limiting
  - Stripe: Payment processing (hosted checkout)
  - Sentry: Error monitoring (external service)

## Security & Best Practices

### Authentication / Authorization

- **Authentication Method**: Supabase Auth with JWT tokens
- **Session Management**:
  - Access tokens (1 hour expiry) and refresh tokens (7 days expiry)
  - Tokens stored in HTTP-only cookies with Secure and SameSite flags
  - Automatic token refresh via Next.js middleware
- **Authorization**:
  - Row Level Security (RLS) policies at database level ensure users can only access their own data
  - Middleware protection for protected routes
  - Service role client used only for webhook operations (bypasses RLS)

### Data Validation and Error Handling

- **Input Validation**: Zod schemas for all user inputs (transactions, accounts, user preferences)
- **Error Handling**:
  - Centralized error messages in `src/lib/constants/errors.ts`
  - Service layer returns `ServiceResult<T>` type for consistent error handling
  - User-friendly error messages displayed via toast notifications
- **Type Safety**: Full TypeScript coverage with strict mode enabled

### Security-Related Practices

- **Rate Limiting**:
  - Authentication endpoints: 5 requests per 15 minutes per IP
  - API endpoints: 100 requests per 15 minutes per IP
  - AI queries: Plan-based limits (Free: 5/month, Basic: 50/month, Pro: unlimited)
- **Security Headers**:
  - Content Security Policy (CSP) configured in `next.config.ts`
  - X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers
  - Permissions-Policy header for feature restrictions
- **Password Security**: Handled by Supabase Auth (bcrypt hashing, strength requirements)
- **CSRF Protection**: SameSite cookie flags and CSRF token validation
- **SQL Injection Prevention**: Parameterized queries via Supabase client (no raw SQL in application code)
- **XSS Prevention**: React's built-in XSS protection, CSP headers, input sanitization
