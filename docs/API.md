# API Documentation

This document provides information about the API routes, integrations, and backend services in this SaaS template.

## Table of Contents

- [Overview](#overview)
- [API Routes](#api-routes)
- [Stripe Integration](#stripe-integration)
- [Server Actions](#server-actions)
- [Rate Limiting](#rate-limiting)
- [Email Service](#email-service)
- [Error Handling](#error-handling)
- [Testing APIs](#testing-apis)

## Overview

This SaaS template uses a combination of:

- **Next.js API Routes**: For webhooks and external integrations
- **Server Actions**: For form submissions and data mutations
- **Supabase API**: For database operations and authentication
- **Stripe API**: For payment processing
- **OpenAI API**: For AI-powered financial insights and chat assistant

### API Architecture

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       ├──────────────────┐
       │                  │
┌──────▼────────┐  ┌──────▼────────┐
│ Server Actions│  │  API Routes   │
│  (Forms, etc) │  │  (Webhooks)   │
└──────┬────────┘  └──────┬────────┘
       │                  │
       ├──────────────────┘
       │
┌──────▼─────────────────────────────┐
│        Supabase Client             │
│  (Database, Auth, Storage)         │
└────────────────────────────────────┘

External APIs:
├── Stripe (Payments)
├── OpenAI (AI Features)
├── Supabase (Database, Auth, Email Templates)
└── Upstash (Rate Limiting)
```

## API Routes

API routes are located in `src/app/api/`.

### Stripe Webhook

**Endpoint**: `POST /api/stripe/webhook`  
**Purpose**: Handle Stripe events (subscriptions, payments)  
**Authentication**: Stripe signature verification

**File**: `src/app/api/stripe/webhook/route.ts`

**Handled Events**:

- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

**Request Headers**:

```
stripe-signature: whsec_xxx... (required)
```

**Response Codes**:

- `200` - Event processed successfully
- `400` - Invalid payload or signature
- `500` - Internal server error

**Implementation**:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe/webhooks';
import { log } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    log.info('Stripe webhook received');

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      log.warn('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = await verifyWebhookSignature(body, signature);
    log.info({ eventType: event.type, eventId: event.id }, 'Processing webhook event');

    await handleWebhookEvent(event);

    const duration = Date.now() - start;
    log.info(
      { eventType: event.type, eventId: event.id, duration: `${duration}ms` },
      'Webhook event processed successfully',
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    log.error(error, 'Stripe webhook error');
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
```

### Creating New API Routes

**Example: Analytics Event**

1. Create route file:

```typescript
// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';
import { apiRateLimit, getClientIdentifier } from '@/lib/ratelimit';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const headersList = await headers();
    const clientId = getClientIdentifier(headersList);
    const { success } = await apiRateLimit.limit(clientId);

    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Authentication
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    // ... validation logic

    // Process request
    // ... business logic

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

2. Test the route:

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"event": "page_view", "page": "/dashboard"}'
```

## Stripe Integration

### Configuration

**File**: `src/lib/stripe/config.ts`

```typescript
import Stripe from 'stripe';
import { env } from '@/schemas/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});
```

### Checkout

**Create Checkout Session**:

```typescript
// src/lib/stripe/checkout.ts
import { stripe } from './config';
import { env } from '@/schemas/env';

export async function createCheckoutSession(userId: string, priceId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/billing/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/billing/payment-failed`,
    metadata: {
      userId,
    },
  });

  return session;
}
```

**Usage in Server Action**:

```typescript
// src/lib/actions/billing-actions.ts
'use server';

import { createCheckoutSession } from '@/lib/stripe/checkout';
import { requireAuth } from './auth-actions';

export async function createSubscription(priceId: string) {
  const user = await requireAuth();

  const session = await createCheckoutSession(user.id, priceId, user.email!);

  return { url: session.url };
}
```

### Customer Management

**Create Customer**:

```typescript
// src/lib/stripe/customer.ts
export async function createStripeCustomer(email: string, userId: string) {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer;
}
```

**Get Customer**:

```typescript
export async function getStripeCustomer(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId);
  return customer;
}
```

### Subscription Management

**Get Subscription**:

```typescript
// src/lib/stripe/subscription.ts
export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}
```

**Cancel Subscription**:

```typescript
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
  return subscription;
}
```

**Resume Subscription**:

```typescript
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  return subscription;
}
```

**Change Plan**:

```typescript
export async function changePlan(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  });

  return updatedSubscription;
}
```

### Webhook Handling

**File**: `src/lib/stripe/webhooks.ts`

```typescript
import Stripe from 'stripe';
import { createServiceClient } from '@/utils/supabase/server';
import { log } from '@/lib/logger';

export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = await createServiceClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          stripe_price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_customer_id', subscription.customer);

      log.info({ subscriptionId: subscription.id }, 'Subscription updated');
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id);

      log.info({ subscriptionId: subscription.id }, 'Subscription canceled');
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      log.info({ invoiceId: invoice.id }, 'Payment succeeded');
      // Send invoice email, etc.
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      log.warn({ invoiceId: invoice.id }, 'Payment failed');
      // Send payment failure email
      break;
    }

    default:
      log.warn({ eventType: event.type }, 'Unhandled webhook event');
  }
}
```

### Testing Stripe Integration

**Use Stripe CLI**:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

**Test Cards**:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3DS: `4000 0025 0000 3155`

## Server Actions

Server Actions are the preferred way to handle form submissions and data mutations. They act as thin wrappers that handle HTTP concerns (rate limiting, input parsing, redirects) while delegating business logic to the services layer.

> **Note**: All business logic has been extracted to the services layer (`src/services/`). Server actions now focus on HTTP concerns while services handle domain logic. See [SERVICES.md](./SERVICES.md) for complete documentation.

### Available Server Actions

#### Authentication Actions (`src/lib/actions/auth-actions.ts`)

- `signUpWithEmail(formData)` - User registration
- `signInWithEmail(formData)` - User login
- `signInWithMagicLink(formData)` - Magic link login
- `signInWithOAuth(provider, redirectUrl?)` - OAuth login
- `signOut()` - User logout
- `forgotPassword(formData)` - Password reset request
- `resetPassword(formData)` - Password reset confirmation
- `updateProfile(formData)` - Profile update
- `getCurrentUser()` - Get current user
- `getAuthenticationMethod()` - Detect user's auth method
- `deleteAccount()` - Delete user account
- `requireAuth()` - Require authentication utility

#### Billing Actions (`src/lib/actions/billing-actions.ts`)

- `getUserSubscription(userId)` - Get user subscription
- `getUserSubscriptionStatusInfo(userId)` - Get subscription status info
- `getInvoices(userId, limit?)` - Get user invoices
- `createCheckoutSessionAction(planType, successUrl?, cancelUrl?)` - Create Stripe checkout
- `createCustomerPortalAction(returnUrl?)` - Create customer portal session
- `startTrialAction(planType)` - Start trial for plan
- `upgradeSubscriptionAction(planType)` - Upgrade subscription

#### GDPR Actions (`src/lib/actions/gdpr-actions.ts`)

- `exportUserData()` - Export user data for GDPR compliance

#### Notification Actions (`src/lib/actions/notification-actions.ts`)

- `getNotificationPreferences()` - Get user notification preferences
- `saveNotificationPreferences(preferences)` - Save notification preferences

See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed authentication documentation.

### Example Server Action Implementation

**Update Profile**:

```typescript
// src/lib/actions/auth-actions.ts
import { UserService } from '@/services';
import { createClientForServer } from '@/utils/supabase/server';

export async function updateProfile(formData: FormData) {
  try {
    const rawData = {
      fullName: formData.get('fullName') as string,
    };

    const validatedData = updateProfileSchema.parse(rawData);
    const supabase = await createClientForServer();

    // Get current user (server action responsibility)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const userService = new UserService(supabase);
    const result = await userService.updateProfile(user.id, {
      fullName: validatedData.fullName,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

**Billing Action Example**:

```typescript
// src/lib/actions/billing-actions.ts
import { BillingService } from '@/services';
import { stripe } from '@/lib/stripe/config';

export async function createCheckoutSessionAction(
  planType: PlanType,
  successUrl?: string,
  cancelUrl?: string,
) {
  try {
    // Apply rate limiting (server action responsibility)
    const rateLimitResult = await checkBillingRateLimit('checkout');
    if (!rateLimitResult.success && rateLimitResult.isRateLimited) {
      return {
        success: false,
        error: 'Too many checkout attempts. Please wait 15 minutes before trying again.',
      };
    }

    const supabase = await createClientForServer();

    // Get authenticated user (server action responsibility)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Delegate to service (business logic)
    const billingService = new BillingService(supabase, stripe);

    const result = await billingService.createCheckoutSession({
      userId: user.id,
      planType,
      successUrl,
      cancelUrl,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
```

### Creating Server Actions

**Best Practices**:

1. **Always add "use server" directive**:

```typescript
'use server';
```

2. **Validate inputs**:

```typescript
const validatedData = schema.parse(data);
```

3. **Check authentication**:

```typescript
const user = await requireAuth();
```

4. **Apply rate limiting**:

```typescript
const rateLimitResult = await checkActionRateLimit('action-type');
if (!rateLimitResult.success) {
  return { success: false, error: 'Rate limited' };
}
```

5. **Handle errors gracefully**:

```typescript
try {
  // ... action logic
  return { success: true };
} catch (error) {
  log.error(error, 'Action failed');
  return { success: false, error: 'Something went wrong' };
}
```

6. **Return structured responses**:

```typescript
return {
  success: boolean,
  data: any,
  error: string,
  message: string,
};
```

## Rate Limiting

Rate limiting protects your API from abuse.

### Implementation

See `src/lib/ratelimit.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
  analytics: true,
});
```

### Usage in API Routes

```typescript
import { apiRateLimit, getClientIdentifier } from '@/lib/ratelimit';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const headersList = await headers();
  const clientId = getClientIdentifier(headersList);

  const { success } = await apiRateLimit.limit(clientId);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // ... rest of handler
}
```

### Configuring Rate Limits

Adjust limits based on your needs:

```typescript
// Very strict (auth)
Ratelimit.slidingWindow(5, '15 m');

// Moderate (API)
Ratelimit.slidingWindow(100, '1 h');

// Lenient (public endpoints)
Ratelimit.slidingWindow(1000, '1 h');
```

## Email Service

### Supabase Auth Email Templates

Emails are handled by Supabase Auth using customizable email templates. The application uses Supabase's built-in email service for:

- **Signup confirmations**: Email verification links
- **Magic link authentication**: Passwordless login emails
- **Password reset**: Password recovery emails

### Email Template Customization

Email templates can be customized in the Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Signup confirmation
   - Magic link
   - Password reset
   - Email change confirmation

### Custom Email Templates

Custom email templates are stored in `emails/` directory:

```
emails/
├── custom/
│   └── invoice.html          # Custom invoice email template
└── supabase/
    ├── magic-link.html       # Magic link template override
    ├── reset-password.html   # Password reset template override
    └── signup.html           # Signup template override
```

### Email Configuration

Email settings are configured in Supabase Dashboard:

- **SMTP Settings**: Configure custom SMTP (optional)
- **Email Templates**: Customize HTML templates
- **Email Rate Limiting**: Built-in protection against spam

await resend.emails.send({
from: env.EMAIL_FROM,
to: email,
subject: 'Your Invoice',
html,
});

````

## Error Handling

### API Route Error Handling

```typescript
export async function POST(request: Request) {
  try {
    // ... handler logic

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Error) {
      log.error(error, 'API error');
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
````

### Server Action Error Handling

```typescript
export async function myAction(formData: FormData) {
  try {
    // ... action logic
    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: error.issues[0].message };
    }

    log.error(error, 'Action error');
    return { success: false, error: 'Something went wrong' };
  }
}
```

### Error Response Formats

**Success**:

```json
{
  "success": true,
  "data": { ... }
}
```

**Validation Error**:

```json
{
  "success": false,
  "error": "Invalid email address"
}
```

**Server Error**:

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Testing APIs

### Manual Testing

**Using cURL**:

```bash
# Test Stripe webhook
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "stripe-signature: test_signature" \
  -d '{"type":"customer.subscription.created"}'

# Test API with auth
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"event":"page_view"}'
```

**Using Postman**:

1. Import API collection
2. Set environment variables
3. Test endpoints

### Automated Testing

**Example with Vitest**:

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/analytics/route';

describe('Analytics API', () => {
  it('should track page view', async () => {
    const request = new Request('http://localhost:3000/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: 'page_view', page: '/dashboard' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

---

**Last Updated**: October 2025
