# Architecture Documentation

This document provides a high-level overview of the SaaS template architecture, including system design, dependencies, and data flows.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Dependency Diagram](#dependency-diagram)
- [Application Layers](#application-layers)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Component Architecture](#component-architecture)
- [Authentication Flow](#authentication-flow)
- [Billing Flow](#billing-flow)
- [Request Lifecycle](#request-lifecycle)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

## Overview

This SaaS template is built using a modern, serverless architecture with the following principles:

- **Server-Side Rendering (SSR)**: Fast initial page loads and SEO optimization
- **API-First Design**: Clean separation between frontend and backend
- **Stateless Architecture**: Horizontally scalable without server-side session storage
- **Event-Driven**: Webhooks for external integrations
- **Security-First**: Multiple layers of security controls

### Design Patterns

- **Server Actions**: For form submissions and mutations
- **Row Level Security (RLS)**: Database-level access control
- **Repository Pattern**: Data access through Supabase client
- **Dependency Injection**: Environment variables via centralized config
- **Middleware Pattern**: Route protection and authentication

## Technology Stack

### Frontend

- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context + Server Components
- **Forms**: React Hook Form + Zod validation
- **Theming**: next-themes (dark/light mode)

### Backend

- **Runtime**: Node.js (via Next.js)
- **API**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (JWT-based)
- **File Storage**: Supabase Storage (optional)
- **Real-time**: Supabase Real-time (optional)

### External Services

- **Payments**: Stripe (subscriptions, checkout, invoices)
- **Email**: Resend (transactional emails)
- **Rate Limiting**: Upstash Redis
- **Hosting**: Vercel (recommended)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry (optional)

### Developer Tools

- **Language**: TypeScript 5
- **Package Manager**: pnpm
- **Linting**: ESLint 9
- **Formatting**: Prettier (via ESLint)
- **Git Hooks**: Husky
- **Logging**: Pino

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Browser    │  │    Mobile    │  │   Desktop    │           │
│  │   (React)    │  │   (React)    │  │   (React)    │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │              Next.js Application (Vercel)                 │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │   Pages/     │  │   Server     │  │  API Routes  │     │   │
│  │  │  Components  │  │   Actions    │  │  (Webhooks)  │     │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │   │
│  │         │                  │                  │           │   │
│  │         └──────────────────┼──────────────────┘           │   │
│  │                            │                              │   │
│  │                    ┌───────▼────────┐                     │   │
│  │                    │   Middleware   │                     │   │
│  │                    │  (Auth/Route)  │                     │   │
│  │                    └────────────────┘                     │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────┬─────────────┬─────────────┬────────────────┘
                      │             │             │
                      │             │             │
        ┌─────────────▼───┐   ┌─────▼──────┐  ┌──▼──────────────┐
        │   Supabase      │   │   Stripe   │  │  Upstash Redis  │
        │  (Database &    │   │ (Payments) │  │ (Rate Limiting) │
        │     Auth)       │   └────────────┘  └─────────────────┘
        │                 │
        │  ┌───────────┐  │   ┌────────────┐
        │  │PostgreSQL │  │   │   Resend   │
        │  │    DB     │  │   │  (Email)   │
        │  └───────────┘  │   └────────────┘
        └─────────────────┘
```

## Dependency Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                Next.js Application                     │    │
│  │                                                        │    │
│  │  Pages & Components ──→ Server Actions ──→ API Routes  │    │
│  │       │                      │                  │      │    │
│  │       │                      │                  │      │    │
│  │       └──────────┬───────────┴──────────────────┘      │    │
│  └──────────────────┼─────────────────────────────────────┘    │
│                     │                                          │
└─────────────────────┼──────────────────────────────────────────┘
                      │
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        │             │             │
┌───────▼─────┐  ┌────▼──────┐  ┌──▼───────────┐
│  Supabase   │  │  Stripe   │  │   Upstash    │
│             │  │           │  │    Redis     │
│  ┌────────┐ │  │ ┌───────┐ │  │              │
│  │  Auth  │ │  │ │Billing│ │  │  ┌────────┐  │
│  └────────┘ │  │ └───────┘ │  │  │  Rate  │  │
│             │  │           │  │  │ Limit  │  │
│  ┌────────┐ │  │ ┌───────┐ │  │  └────────┘  │
│  │   DB   │ │  │ │Webhook│ │  │              │
│  └────────┘ │  │ └───────┘ │  │              │
│             │  │           │  │              │
│  ┌────────┐ │  │ ┌───────┐ │  │              │
│  │Storage │ │  │ │Portal │ │  │              │
│  └────────┘ │  │ └───────┘ │  │              │
└─────────────┘  └───────────┘  └──────────────┘
       │
       │
┌──────▼─────┐
│   Resend   │
│  (Email)   │
└────────────┘
```

### Dependency Relationships

**Next.js** depends on:

- Supabase: Database queries, authentication
- Stripe: Payment processing
- Upstash: Rate limiting
- Resend: Email delivery

**Supabase** provides:

- PostgreSQL database
- JWT-based authentication
- Real-time subscriptions
- File storage

**Stripe** provides:

- Subscription management
- Payment processing
- Customer portal
- Webhooks for events

**Upstash Redis** provides:

- Rate limiting
- Analytics data (optional)

## Application Layers

```
┌──────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  • React Components (Client & Server)                    │
│  • Pages (App Router)                                    │
│  • UI Components (shadcn/ui)                             │
│  • Forms (React Hook Form)                               │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                     ROUTING LAYER                        │
│  • Next.js App Router                                    │
│  • Middleware (Auth, Protection)                         │
│  • API Routes (Webhooks)                                 │
│  • Server Actions (Mutations)                            │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
│  • Authentication Logic (auth-actions.ts)                │
│  • Billing Logic (billing-actions.ts)                    │
│  • User Management (user-helpers.ts)                     │
│  • Stripe Integration (lib/stripe/)                      │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                   VALIDATION LAYER                       │
│  • Zod Schemas (schemas/)                                │
│  • Input Validation                                      │
│  • Environment Validation                                │
│  • Type Safety (TypeScript)                              │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                    DATA ACCESS LAYER                     │
│  • Supabase Client (server/client)                       │
│  • Database Queries                                      │
│  • RLS Policies                                          │
│  • Triggers & Functions                                  │
└──────────────────┬───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                     DATA LAYER                           │
│  • PostgreSQL Database                                   │
│  • Tables (profiles, subscriptions)                      │
│  • Indexes                                               │
│  • Relationships                                         │
└──────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### User Registration Flow

```
┌──────────┐
│  User    │
│  Visits  │
│ /signup  │
└────┬─────┘
     │
     │ 1. Enters email, password, name
     │
┌────▼─────────────────┐
│  SignupForm.tsx      │
│  (Client Component)  │
└────┬─────────────────┘
     │
     │ 2. Submit form → Server Action
     │
┌────▼──────────────────────┐
│  signUpWithEmail()        │
│  (Server Action)          │
│                           │
│  • Rate limit check       │
│  • Validate with Zod      │
│  • Call Supabase Auth     │
└────┬──────────────────────┘
     │
     │ 3. Create auth user
     │
┌────▼────────────────┐
│  Supabase Auth      │
│  • Create user      │
│  • Send verify email│
└────┬────────────────┘
     │
     │ 4. Trigger on_auth_user_created
     │
┌────▼──────────────────────┐
│  handle_new_user()        │
│  (Database Trigger)       │
│                           │
│  • Insert into profiles   │
│  • Insert into subs       │
└────┬──────────────────────┘
     │
     │ 5. Return success
     │
┌────▼─────────────────┐
│  Redirect to         │
│  /email-sent         │
└──────────────────────┘
```

### Login Flow

```
┌──────────┐
│  User    │
│  Visits  │
│  /login  │
└────┬─────┘
     │
     │ 1. Enters credentials
     │
┌────▼─────────────────┐
│  LoginForm.tsx       │
│  (Client Component)  │
└────┬─────────────────┘
     │
     │ 2. Submit → Server Action
     │
┌────▼──────────────────────┐
│  signInWithEmail()        │
│  (Server Action)          │
│                           │
│  • Rate limit check       │
│  • Validate credentials   │
└────┬──────────────────────┘
     │
     │ 3. Verify credentials
     │
┌────▼────────────────┐
│  Supabase Auth      │
│  • Verify password  │
│  • Create JWT       │
│  • Return JWT       │
└────┬────────────────┘
     │
     │ 4. Set auth cookies
     │
┌────▼──────────────────────┐
│  Middleware               │
│  • Validate JWT           │
│  • Refresh if needed      │
│  • Allow access           │
└────┬──────────────────────┘
     │
     │ 5. Redirect
     │
┌────▼─────────────────┐
│  /dashboard          │
│  (Protected Page)    │
└──────────────────────┘
```

### Dashboard Page Load Flow

```
┌──────────┐
│  User    │
│  Visits  │
│/dashboard│
└────┬─────┘
     │
     │ 1. Request page
     │
┌────▼──────────────────────┐
│  Middleware.ts            │
│                           │
│  • Get JWT from cookie   │
│  • Verify JWT             │
│  • Refresh if needed      │
└────┬──────────────────────┘
     │
     │ 2. JWT valid?
     │
     ├─ No ──→ Redirect to /login
     │
     │ Yes
     │
┌────▼──────────────────────┐
│  /dashboard/page.tsx      │
│  (Server Component)       │
│                           │
│  • Get user from JWT      │
│  • Fetch user data        │
└────┬──────────────────────┘
     │
     │ 3. Query database
     │
┌────▼────────────────┐
│  Supabase DB        │
│  • Get profile      │
│  • Get subscription │
│  • Apply RLS        │
└────┬────────────────┘
     │
     │ 4. Return data
     │
┌────▼──────────────────────┐
│  Dashboard Component      │
│  • Render user info       │
│  • Show subscription      │
│  • Display stats          │
└───────────────────────────┘
```

### Subscription Creation Flow

```
┌──────────┐
│  User    │
│  Clicks  │
│"Upgrade" │
└────┬─────┘
     │
     │ 1. Select plan
     │
┌────▼─────────────────┐
│  PricingCard.tsx     │
│  (Client Component)  │
└────┬─────────────────┘
     │
     │ 2. Click "Subscribe" → Server Action
     │
┌────▼──────────────────────┐
│  createCheckout()         │
│  (Server Action)          │
│                           │
│  • Verify auth            │
│  • Get user data          │
└────┬──────────────────────┘
     │
     │ 3. Create checkout session
     │
┌────▼────────────────┐
│  Stripe API         │
│  • Create JWT       │
│  • Set customer     │
│  • Set price        │
└────┬────────────────┘
     │
     │ 4. Return checkout URL
     │
┌────▼──────────────────────┐
│  Redirect to Stripe       │
│  • User enters card       │
│  • Completes payment      │
└────┬──────────────────────┘
     │
     │ 5. Payment success
     │
┌────▼────────────────┐
│  Stripe Webhook     │
│  • Send event       │
└────┬────────────────┘
     │
     │ 6. Receive webhook
     │
┌────▼──────────────────────┐
│  /api/stripe/webhook      │
│                           │
│  • Verify signature       │
│  • Process event          │
└────┬──────────────────────┘
     │
     │ 7. Update database
     │
┌────▼────────────────┐
│  Supabase DB        │
│  • Update sub table │
│  • Set stripe_id    │
│  • Set plan_type    │
│  • Set status       │
└────┬────────────────┘
     │
     │ 8. Send confirmation email
     │
┌────▼────────────────┐
│  Resend API         │
│  • Send invoice     │
└────┬────────────────┘
     │
     │ 9. Redirect user
     │
┌────▼─────────────────┐
│  /payment-success    │
└──────────────────────┘
```

### API Request Flow with Rate Limiting

```
┌──────────┐
│  Client  │
│  Request │
└────┬─────┘
     │
     │ 1. HTTP Request
     │
┌────▼──────────────────────┐
│  Middleware               │
│  • Check auth JWT         │
│  • Refresh if needed      │
└────┬──────────────────────┘
     │
     │ 2. Route to handler
     │
┌────▼──────────────────────┐
│  API Route / Server Action│
│                           │
│  • Extract client ID      │
│  • Check rate limit       │
└────┬──────────────────────┘
     │
     │ 3. Query rate limit
     │
┌────▼────────────────┐
│  Upstash Redis      │
│  • Check count      │
│  • Increment        │
│  • Return status    │
└────┬────────────────┘
     │
     │ 4. Rate limited?
     │
     ├─ Yes ──→ Return 429 Too Many Requests
     │
     │ No
     │
┌────▼──────────────────────┐
│  Business Logic           │
│  • Validate input         │
│  • Process request        │
└────┬──────────────────────┘
     │
     │ 5. Query/Update data
     │
┌────▼────────────────┐
│  Supabase DB        │
│  • Apply RLS        │
│  • Execute query    │
│  • Return result    │
└────┬────────────────┘
     │
     │ 6. Return response
     │
┌────▼──────────────────────┐
│  JSON Response            │
│  • Status code            │
│  • Data/Error             │
└───────────────────────────┘
```

## Component Architecture

### File Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup)
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── signup/
│   │   │   └── page.tsx          # Signup page
│   │   └── layout.tsx            # Auth layout
│   │
│   ├── (protected)/              # Protected routes (require auth)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard page
│   │   ├── settings/
│   │   │   └── page.tsx          # Settings page
│   │   └── layout.tsx            # Protected layout
│   │
│   ├── (public)/                 # Public routes
│   │   ├── pricing/
│   │   │   └── page.tsx          # Pricing page
│   │   └── layout.tsx            # Public layout
│   │
│   └── api/                      # API routes
│       └── stripe/
│           └── webhook/
│               └── route.ts      # Stripe webhook handler
│
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── billing/                  # Billing-specific components
│
├── lib/                          # Business logic
│   ├── actions/                  # Server actions
│   │   ├── auth-actions.ts       # Authentication
│   │   └── billing-actions.ts    # Billing operations
│   │
│   ├── stripe/                   # Stripe integration
│   │   ├── config.ts             # Stripe client
│   │   ├── checkout.ts           # Checkout logic
│   │   └── webhooks.ts           # Webhook handlers
│   │
│   └── user/                     # User helpers
│       ├── user-helpers.server.ts
│       └── user-helpers.client.ts
│
├── schemas/                      # Validation schemas
│   ├── auth.ts                   # Auth schemas
│   ├── profile.ts                # Profile schemas
│   └── env.ts                    # Environment validation
│
├── types/                        # TypeScript types
│   ├── user.ts                   # User types
│   ├── subscription.ts           # Subscription types
│   └── database.types.ts         # Database types
│
├── utils/                        # Utilities
│   └── supabase/                 # Supabase clients
│       ├── server.ts             # Server client
│       └── client.ts             # Client client
│
└── middleware.ts                 # Next.js middleware
```

### Component Hierarchy

```
┌─────────────────────────────────────────────┐
│            Root Layout (layout.tsx)         │
│  • Global styles                            │
│  • Theme provider                           │
│  • Toaster                                  │
└─────────────┬───────────────────────────────┘
              │
    ┌─────────┴─────────┬──────────────────┐
    │                   │                  │
┌───▼────────┐  ┌───────▼────────┐  ┌──────▼────────┐
│  Auth      │  │  Protected     │  │   Public      │
│  Layout    │  │  Layout        │  │   Layout      │
└───┬────────┘  └───────┬────────┘  └──────┬────────┘
    │                   │                   │
    │           ┌───────┴────────┐          │
    │           │                │          │
┌───▼────┐  ┌───▼─────┐  ┌────▼────┐  ┌────▼────┐
│ Login  │  │Dashboard│  │Settings │  │ Pricing │
│ Page   │  │  Page   │  │  Page   │  │  Page   │
└────────┘  └─────────┘  └─────────┘  └─────────┘
```

## Authentication Flow

### JWT Token Flow

```
1. User Login
   ↓
2. Supabase Auth validates credentials
   ↓
3. Generate JWT access token (1hr expiry)
   ↓
4. Generate refresh token (7 days expiry)
   ↓
5. Set tokens in HTTP-only cookies
   ↓
6. Return success to client
   ↓
7. Middleware intercepts requests
   ↓
8. Verify JWT signature
   ↓
9. Check expiration
   ↓
10. If expired, use refresh token
    ↓
11. Get new access token
    ↓
12. Update cookies
    ↓
13. Allow request to proceed
```

### Authentication Flow

```
Browser                 Middleware              Supabase
   │                        │                       │
   ├─ Request Page ────────→│                       │
   │                        │                       │
   │                        ├─ Get Cookies ────────→│
   │                        │                       │
   │                        │←─ Verify JWT ─────────┤
   │                        │                       │
   │                        │  Valid?               │
   │                        │   │                   │
   │                        │   ├─ Yes → Allow      │
   │                        │   │                   │
   │                        │   └─ No → Refresh     │
   │                        │         │             │
   │                        │         ├─ Get refresh│
   │                        │         │   token ───→│
   │                        │         │             │
   │                        │         │←─ New JWT ──┤
   │                        │         │             │
   │                        │         └─ Set cookie │
   │                        │                       │
   │←─ Render Page ─────────┤                       │
   │                        │                       │
```

## Billing Flow

### Stripe Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Application                           │
│                                                          │
│  ┌─────────────┐         ┌─────────────┐                 │
│  │   Pricing   │────────→│  Checkout   │                 │
│  │    Page     │ Select  │   Action    │                 │
│  └─────────────┘  Plan   └──────┬──────┘                 │
│                                  │                       │
│                                  │ Create JWT            │
│                                  ↓                       │
│                          ┌───────────────┐               │
│                          │ Stripe Client │               │
│                          └───────┬───────┘               │
└──────────────────────────────────┼───────────────────────┘
                                   │
                                   │ POST /checkout/sessions
                                   ↓
┌──────────────────────────────────────────────────────────┐
│                       Stripe                             │
│                                                          │
│  ┌──────────────┐                                        │
│  │   Checkout   │ User completes payment                 │
│  │   Process    │                                        │
│  └──────┬───────┘                                        │
│         │                                                │
│         │ Payment Success                                │
│         ↓                                                │
│  ┌──────────────┐                                        │
│  │  Webhook     │ Send event                             │
│  │  Event       │                                        │
│  └──────┬───────┘                                        │
└─────────┼────────────────────────────────────────────────┘
          │
          │ POST /api/stripe/webhook
          ↓
┌──────────────────────────────────────────────────────────┐
│                    Application                           │
│                                                          │
│  ┌──────────────────────┐                                │
│  │  Webhook Handler     │                                │
│  │  • Verify signature  │                                │
│  │  • Process event     │                                │
│  └──────┬───────────────┘                                │
│         │                                                │
│         │ Update subscription                            │
│         ↓                                                │
│  ┌──────────────────────┐                                │
│  │   Supabase DB        │                                │
│  │  • Update sub row    │                                │
│  │  • Set stripe_id     │                                │
│  └──────┬───────────────┘                                │
│         │                                                │
│         │ Send email                                     │
│         ↓                                                │
│  ┌──────────────────────┐                                │
│  │   Resend API         │                                │
│  │  • Send invoice      │                                │
│  └──────────────────────┘                                │
└──────────────────────────────────────────────────────────┘
```

## Request Lifecycle

### Server-Side Request Flow

```
1. Client Request
   ↓
2. Next.js Server receives request
   ↓
3. Middleware runs
   ├─ Get cookies
   ├─ Verify JWT
   ├─ Check route protection
   └─ Refresh JWT if needed
   ↓
4. Route matched (App Router)
   ↓
5. Server Component executes
   ├─ Get user from JWT
   ├─ Fetch data from Supabase
   └─ Apply RLS policies
   ↓
6. Component renders to HTML
   ↓
7. Send HTML to client
   ↓
8. Client hydrates React
   ↓
9. Interactive page ready
```

### API Route Request Flow

```
1. Client POST/GET request
   ↓
2. Route handler receives request
   ↓
3. Rate limiting check
   ├─ Get client identifier
   ├─ Check Upstash Redis
   └─ Allow or deny
   ↓
4. Authentication check
   ├─ Get JWT
   ├─ Verify user
   └─ Get user ID
   ↓
5. Input validation
   ├─ Parse request body
   ├─ Validate with Zod
   └─ Sanitize inputs
   ↓
6. Business logic
   ├─ Process request
   ├─ Query database
   └─ Call external APIs
   ↓
7. Response formatting
   ├─ Success: { success: true, data }
   └─ Error: { success: false, error }
   ↓
8. Send JSON response
```

### Server Action Flow

```
1. Form submission
   ↓
2. Server Action invoked
   ↓
3. Rate limiting (if configured)
   ↓
4. Input validation with Zod
   ↓
5. Authentication check
   ↓
6. Business logic execution
   ↓
7. Database operation
   ↓
8. Response or redirect
   ├─ Success: redirect()
   └─ Error: return { error }
```

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Client-Side Security                          │
│  • Input validation                                     │
│  • XSS prevention                                       │
│  • HTTPS enforcement                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Layer 2: Network Security                              │
│  • CDN (Vercel Edge)                                    │
│  • DDoS protection                                      │
│  • Rate limiting (Upstash)                              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Layer 3: Application Security                          │
│  • Middleware authentication                            │
│  • JWT validation                                       │
│  • CSRF protection                                      │
│  • Input sanitization                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  Layer 4: Database Security                             │
│  • Row Level Security (RLS)                             │
│  • Prepared statements                                  │
│  • Encrypted at rest                                    │
│  • Connection pooling                                   │
└─────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

The application is designed to scale horizontally:

- **Stateless**: No server-side session storage
- **Serverless Functions**: Auto-scale with traffic
- **Database Connection Pooling**: Via Supabase Supavisor
- **CDN**: Static assets served from edge
- **Caching**: Redis for rate limiting

### Performance Optimizations

1. **Server Components**: Reduced JavaScript bundle size
2. **Streaming**: Progressive rendering with Suspense
3. **Image Optimization**: Next.js Image component
4. **Code Splitting**: Automatic route-based splitting
5. **Database Indexes**: Optimized queries
6. **Edge Functions**: Low-latency API responses

### Load Distribution

```
┌──────────┐
│   User   │
└────┬─────┘
     │
     ↓
┌────────────────┐
│  CDN (Global)  │  ← Static assets
└────┬───────────┘
     │
     ↓
┌────────────────┐
│ Edge Functions │  ← Middleware, Auth
└────┬───────────┘
     │
     ↓
┌────────────────┐
│ Serverless Fns │  ← Server components, API routes
└────┬───────────┘
     │
     ├──────────────┬──────────────┐
     ↓              ↓              ↓
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Supabase │  │  Stripe  │  │ Upstash  │
│    DB    │  │   API    │  │  Redis   │
└──────────┘  └──────────┘  └──────────┘
```

### Database Scaling

- **Read Replicas**: Supabase supports read replicas for read-heavy workloads
- **Connection Pooling**: Supavisor manages connections efficiently
- **Indexes**: Proper indexing for query performance
- **Partitioning**: Can partition large tables (future consideration)

### Caching Strategy

```
Level 1: Browser Cache
  ↓ (miss)
Level 2: CDN Cache (Vercel Edge)
  ↓ (miss)
Level 3: Redis Cache (Upstash)
  ↓ (miss)
Level 4: Database (Supabase)
```

---

**Last Updated**: October 2025

For more detailed information, see:

- [Authentication Guide](AUTHENTICATION.md)
- [Database Guide](DATABASE.md)
- [API Guide](API.md)
- [Security Guide](SECURITY.md)
- [Deployment Guide](DEPLOYMENT.md)
