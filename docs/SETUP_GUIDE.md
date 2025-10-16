# Complete Setup Guide

This guide provides step-by-step instructions for setting up all external services required for the SaaS template.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18.17 or later
- **pnpm** (recommended) or npm/yarn
- **Git**
- A domain name (for production)

## 🗂️ Service Setup Checklist

- [ ] **Supabase** - Database and Authentication
- [ ] **Stripe** - Payment Processing
- [ ] **Google Cloud Console** - OAuth Authentication
- [ ] **Upstash Redis** - Rate Limiting
- [ ] **Sentry** - Error Monitoring and Performance Tracking
- [ ] **Domain & DNS** - Production Setup

---

## 1. 🗄️ Supabase Setup

### Step 1.1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with GitHub or create an account
4. Click **"New Project"**
5. Fill in project details:
   - **Name**: `your-saas-name`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click **"Create new project"**
7. Wait for project initialization (2-3 minutes)

### Step 1.2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

### Step 1.3: Set Up Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Copy the entire contents of [`database/init.sql`](../database/init.sql)
4. Paste into the SQL editor
5. Click **"Run"** to execute

This creates:

- ✅ User profiles table
- ✅ Subscriptions table
- ✅ User preferences table
- ✅ Notification preferences table
- ✅ User sessions table
- ✅ Row Level Security policies
- ✅ Database functions and triggers

### Step 1.4: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to `http://localhost:3000` (development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/callback`
   - `https://yourdomain.com/callback` (for production)
4. Configure **Email Templates** (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize signup, magic link, and password reset emails

### Step 1.5: Enable OAuth Providers (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **GitHub**:
   - Toggle **Enable sign in with GitHub**
   - Add **Client ID** and **Client Secret** (see Google Console setup)
3. Enable **Google**:
   - Toggle **Enable sign in with Google**
   - Add **Client ID** and **Client Secret** (see Google Console setup)

---

## 2. 💳 Stripe Setup

### Step 2.1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Sign up with email or GitHub
4. Complete account verification
5. Activate your account

### Step 2.2: Get API Keys

1. Go to **Developers** → **API keys**
2. Copy the following:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### Step 2.3: Create Products and Prices

1. Go to **Products** → **Add product**
2. Create **Basic Plan**:
   - **Name**: `Basic Plan`
   - **Description**: `Perfect for individuals and small teams`
   - **Pricing**: `$19/month` (recurring)
   - **Billing period**: `Monthly`
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_`)
5. Repeat for **Pro Plan**:
   - **Name**: `Pro Plan`
   - **Description**: `Advanced features for growing businesses`
   - **Pricing**: `$49/month` (recurring)
   - **Billing period**: `Monthly`

### Step 2.4: Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Set **Endpoint URL** to `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.payment_action_required`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 2.5: Configure Payment Methods

1. Go to **Settings** → **Payment methods**
2. Enable payment methods you want to accept:
   - **Credit cards** (Visa, Mastercard, American Express)
   - **Digital wallets** (Apple Pay, Google Pay)
   - **Bank transfers** (ACH, SEPA)

---

## 3. 🔐 Google Cloud Console Setup

### Step 3.1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Fill in project details:
   - **Project name**: `your-saas-oauth`
   - **Organization**: Select your organization
4. Click **"Create"**

### Step 3.2: Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on **Google+ API**
4. Click **"Enable"**

### Step 3.3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Configure consent screen:
   - **User Type**: External
   - **App name**: `Your SaaS Name`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://yourdomain.com`
5. Add **Authorized redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
6. Click **"Save and Continue"**
7. Copy **Client ID** and **Client Secret**

### Step 3.4: Configure Supabase OAuth

1. Go back to Supabase Dashboard
2. **Authentication** → **Providers** → **Google**
3. Paste **Client ID** and **Client Secret**
4. Click **"Save"**

---

## 4. ⚡ Upstash Redis Setup

### Step 4.1: Create Upstash Account

1. Go to [upstash.com](https://upstash.com)
2. Click **"Sign Up"**
3. Sign up with GitHub or email
4. Verify your email

### Step 4.2: Create Redis Database

1. Click **"Create Database"**
2. Fill in details:
   - **Database Name**: `saas-template-rate-limit`
   - **Region**: Choose closest to your app
   - **Type**: Regional (for production) or Global (for global apps)
3. Click **"Create"**

### Step 4.3: Get Connection Details

1. Click on your database
2. Go to **Details** tab
3. Copy the following:
   - **REST URL** (e.g., `https://xyz.upstash.io`)
   - **REST Token** (starts with `AX...`)

---

## 5. 🚨 Sentry Setup

### Step 5.1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Click **"Get Started"**
3. Sign up with GitHub or email
4. Verify your email address

### Step 5.2: Create Project

1. Click **"Create Project"**
2. Select **"Next.js"** as platform
3. Fill in project details:
   - **Project Name**: `your-saas-name`
   - **Team**: Select or create team
4. Click **"Create Project"**

### Step 5.3: Get DSN

1. After project creation, copy the **DSN** (Data Source Name)
2. It looks like: `https://xxx@xxx.ingest.sentry.io/xxx`

### Step 5.4: Configure Environment Variables

Add to your `.env.local`:

```bash
# Sentry
SENTRY_DSN=your-sentry-dsn-here
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

### Step 5.5: Test Integration

1. Visit `/sentry-example-page` in your app
2. Click **"Throw Sample Error"**
3. Check your Sentry dashboard for the error

---

## 6. 🌐 Domain & DNS Setup

### Step 6.1: Purchase Domain

1. Choose a domain registrar (Namecheap, GoDaddy, etc.)
2. Search for your desired domain
3. Purchase the domain
4. Wait for domain activation (usually instant)

### Step 6.2: Configure DNS Records

1. Go to your domain registrar's DNS management
2. Add the following records:

**For Vercel deployment:**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

**For custom domain with SSL:**

```
Type: CNAME
Name: @
Value: your-app.vercel.app

Type: CNAME
Name: www
Value: your-app.vercel.app
```

### Step 6.3: SSL Certificate

1. If using Vercel, SSL is automatic
2. If using other platforms, configure SSL certificate
3. Test SSL at [ssllabs.com](https://ssllabs.com)

---

## 7. 🔧 Environment Variables & Configuration

### Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_your-basic-price-id
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your-pro-price-id

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Sentry
SENTRY_DSN=your-sentry-dsn-here
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional
GOOGLE_SITE_VERIFICATION=your-google-verification-code
```

### Application Configuration

The application uses a centralized configuration system located in `src/config/app.ts`. This file contains:

#### Core Configuration

- **App Metadata**: Name, description, version
- **URLs**: Base URL, social links, documentation links
- **Contact Information**: Support email, sales email
- **SEO Settings**: Default meta tags, Open Graph images

#### Subscription Plans

- **Plan Definitions**: Basic, Pro plan details
- **Feature Lists**: What's included in each plan
- **Usage Limits**: Project limits, storage limits, API call limits

#### Feature Flags

- **Development Features**: Beta features, debugging options
- **Production Features**: Analytics, API access, etc.

#### Helper Functions

- **Feature Checking**: `hasFeature(plan, feature)`
- **Limit Checking**: `hasReachedLimit(current, max)`
- **Usage Calculation**: `getUsagePercentage(current, max)`
- **URL Generation**: `getAbsoluteUrl(path)`

#### Usage Examples

```typescript
import { appConfig } from '@/config/app';

// Check if user has access to a feature
const hasAnalytics = appConfig.helpers.hasFeature('pro', 'analytics');

// Check usage limits
const usagePercentage = appConfig.helpers.getUsagePercentage(8, 10);

// Get plan information
const basicPlan = appConfig.plans.basic;
console.log(basicPlan.price); // 19

// Generate absolute URLs
const profileUrl = appConfig.helpers.getAbsoluteUrl('/profile');
```

#### Customizing Configuration

To modify plans, features, or limits:

1. **Update Plan Limits**:

```typescript
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  basic: {
    maxProjects: 10,
    maxStorage: '1GB',
    // ... other limits
  },
  pro: {
    maxProjects: 50,
    maxStorage: '10GB',
    // ... other limits
  },
};
```

2. **Add New Features**:

```typescript
export const FEATURE_FLAGS = {
  enableAnalytics: true,
  enableApiAccess: true,
  enableNewFeature: false, // Add your feature
} as const;
```

3. **Update Plan Features**:

```typescript
export const PLAN_FEATURES = {
  basic: [
    'All basic features',
    'Email support',
    'New feature', // Add to plan
  ],
  pro: [
    'All basic features',
    'Priority support',
    'Advanced analytics',
    'New feature', // Add to plan
  ],
} as const;
```

#### Environment-Specific Configuration

```typescript
const isProduction = process.env.NODE_ENV === 'production';

export const MY_CONFIG = {
  apiUrl: isProduction ? 'https://api.production.com' : 'http://localhost:3001',
  debug: !isProduction,
  logLevel: isProduction ? 'error' : 'debug',
} as const;
```

#### Best Practices

- Use `as const` for all configuration objects to get strict typing
- Group related constants in their own sections
- Use environment variables for sensitive or environment-specific values
- Keep the config immutable - don't modify values at runtime
- Export types for all major configuration sections

---

## 8. 🚀 Deployment Setup

### Step 8.1: Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure environment variables:
   - Copy all variables from `.env.local`
   - Paste into Vercel environment variables
6. Click **"Deploy"**

### Step 8.2: Configure Custom Domain

1. Go to **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Add DNS records as instructed
4. Wait for domain verification

### Step 8.3: Update Service URLs

Update the following URLs in your services:

**Supabase:**

- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/callback`

**Stripe:**

- Webhook URL: `https://yourdomain.com/api/stripe/webhook`

**Google OAuth:**

- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`

---

## 9. ✅ Testing & Verification

### Step 9.1: Test Authentication

1. Visit `https://yourdomain.com/signup`
2. Create a test account
3. Verify email confirmation works
4. Test login/logout
5. Test password reset

### Step 9.2: Test Payments

1. Go to billing page
2. Start a subscription with test card: `4242 4242 4242 4242`
3. Verify webhook receives events
4. Check subscription status updates

### Step 9.3: Test Rate Limiting

1. Make multiple rapid requests
2. Verify rate limiting works
3. Check Redis dashboard for activity

### Step 9.4: Test Error Monitoring

1. Visit `/sentry-example-page`
2. Click **"Throw Sample Error"**
3. Check Sentry dashboard for the error
4. Verify session replay is working

---

## 10. 🔍 Troubleshooting

### Common Issues

**Supabase Connection Issues:**

- Verify project URL and keys are correct
- Check if project is paused
- Ensure RLS policies are enabled

**Stripe Webhook Issues:**

- Verify webhook URL is accessible
- Check webhook secret matches
- Ensure all required events are selected

**OAuth Issues:**

- Verify redirect URIs match exactly
- Check client ID and secret are correct
- Ensure OAuth consent screen is configured

**Rate Limiting Issues:**

- Verify Redis connection details
- Check if Redis database is active
- Ensure API keys are correct

**Sentry Issues:**

- Verify DSN is correct in environment variables
- Check CSP allows Sentry connections
- Ensure Sentry project is active

### Getting Help

1. Check service dashboards for error logs
2. Review application logs in deployment platform
3. Test with curl commands for API endpoints
4. Use service-specific debugging tools

---

## 📚 Next Steps

After completing setup:

1. **Customize branding** - Update app name, colors, logos
2. **Configure email templates** - Customize authentication emails
3. **Set up Sentry alerts** - Configure error notifications
4. **Configure backups** - Set up database backups
5. **Security audit** - Review security settings
6. **Performance optimization** - Monitor and optimize performance

---

## 🆘 Support

If you encounter issues:

1. **Check service status pages** for outages
2. **Review service documentation** for updates
3. **Test with minimal configuration** to isolate issues
4. **Contact service support** for platform-specific issues

**Service Support Links:**

- [Supabase Support](https://supabase.com/support)
- [Stripe Support](https://support.stripe.com)
- [Vercel Support](https://vercel.com/support)
- [Upstash Support](https://upstash.com/support)
- [Sentry Support](https://sentry.io/support/)

---

**🎉 Congratulations!** Your SaaS template is now fully configured and ready for production use.
