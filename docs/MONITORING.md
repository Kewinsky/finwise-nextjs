# Monitoring & Error Tracking

This document covers the monitoring and error tracking setup using Sentry in this SaaS template.

## Table of Contents

- [Overview](#overview)
- [Sentry Integration](#sentry-integration)
- [Features](#features)
- [Configuration](#configuration)
- [Testing](#testing)
- [Production Monitoring](#production-monitoring)
- [Best Practices](#best-practices)

## Overview

This SaaS template includes **Sentry** for comprehensive error monitoring and performance tracking. Sentry provides:

- **Error Tracking**: Automatic capture of JavaScript errors
- **Performance Monitoring**: Track page loads, API calls, and user interactions
- **Session Replay**: Record user sessions to debug issues
- **Real-time Alerts**: Get notified when critical errors occur
- **Error Analytics**: Understand error frequency and user impact

## Sentry Integration

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Sentry        │
│   (Browser)     │    │   (Server)      │    │   Dashboard     │
│                 │    │                 │    │                 │
│ • Error Capture │───▶│ • Error Capture │───▶│ • Error Storage │
│ • Performance   │    │ • Performance   │    │ • Analytics     │
│ • Session Replay│    │ • Logging       │    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Files Structure

```
src/
├── instrumentation.ts          # Server-side Sentry initialization
├── sentry/
│   └── instrumentation-client.ts # Client-side Sentry initialization
├── app/
│   └── global-error.tsx       # Global error boundary
└── lib/
    └── logger.ts              # Structured logging with Pino
```

## Features

### 1. Error Tracking

**Automatic Error Capture:**

- Unhandled JavaScript errors
- API route errors
- Server action errors
- React component errors

**Error Context:**

- Stack traces
- User information
- Browser/device details
- Request data
- Custom tags and metadata

### 2. Performance Monitoring

**Tracked Metrics:**

- Page load times
- API response times
- Database query performance
- User interactions
- Navigation timing

**Performance Insights:**

- Slowest pages
- Bottleneck identification
- User experience metrics
- Performance trends

### 3. Session Replay

**Recorded Data:**

- User interactions (clicks, scrolls, form inputs)
- Network requests
- Console logs
- Error occurrences
- Page navigation

**Privacy:**

- Sensitive data is automatically masked
- Configurable recording rules
- GDPR compliant

### 4. Real-time Alerts

**Alert Types:**

- New error occurrences
- Error rate spikes
- Performance degradation
- Custom metric thresholds

**Notification Channels:**

- Email
- Slack
- Discord
- Webhooks

## Configuration

### Environment Variables

```bash
# Sentry Configuration
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Client Configuration

```typescript
// src/sentry/instrumentation-client.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://c0b0f122b077532667e9122f66abdf29@o4510184390852608.ingest.de.sentry.io/4510184393474128',

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
```

### Server Configuration

```typescript
// src/instrumentation.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 1.0,

  // Debug mode
  debug: false,
});
```

### Content Security Policy

The CSP is configured to allow Sentry connections:

```typescript
// next.config.ts
{
  key: 'Content-Security-Policy',
  value: [
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io",
    "worker-src 'self' blob:",
    // ... other directives
  ].join('; '),
}
```

## Testing

### 1. Test Error Tracking

Test error tracking by creating a test page or component:

```typescript
// In any component or server action
import * as Sentry from '@sentry/nextjs';

// This will be captured by Sentry
throw new Error('Test error message');

// Or capture manually
Sentry.captureException(new Error('Manual test error'));
```

### 2. Test Performance Monitoring

Sentry automatically tracks:

- Page load times
- API response times
- User interactions
- Navigation events

### 3. Test Session Replay

1. Enable session replay in your Sentry config
2. Interact with your app
3. Check Sentry dashboard → "Replays" section

### 4. Test Custom Errors

```typescript
// In any component or server action
import * as Sentry from '@sentry/nextjs';

// Capture custom error
Sentry.captureException(new Error('Custom error'));

// Capture message
Sentry.captureMessage('Something went wrong', 'error');

// Add context
Sentry.setContext('user', {
  id: user.id,
  email: user.email,
});
```

## Production Monitoring

### 1. Error Monitoring

**Dashboard Views:**

- **Issues**: List of all errors with frequency and impact
- **Performance**: Page load times and API performance
- **Releases**: Track errors by deployment version
- **Users**: See which users are affected by errors

**Error Details:**

- Stack trace with source maps
- User context and session data
- Browser and device information
- Request parameters and headers
- Custom tags and metadata

### 2. Performance Monitoring

**Key Metrics:**

- **Time to First Byte (TTFB)**: Server response time
- **First Contentful Paint (FCP)**: When content first appears
- **Largest Contentful Paint (LCP)**: When main content loads
- **Cumulative Layout Shift (CLS)**: Visual stability
- **First Input Delay (FID)**: Interactivity

**Performance Insights:**

- Slowest pages and API endpoints
- Performance trends over time
- User experience metrics
- Bottleneck identification

### 3. Session Replay

**Replay Features:**

- Video-like playback of user sessions
- Error occurrence highlighting
- Network request tracking
- Console log integration
- User interaction recording

**Privacy Controls:**

- Automatic sensitive data masking
- Configurable recording rules
- GDPR compliance features
- User consent management

## Best Practices

### 1. Error Handling

**Structured Error Logging:**

```typescript
import { log } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

try {
  // Your code here
} catch (error) {
  // Log to console/file
  log.error(error, 'Operation failed');

  // Send to Sentry
  Sentry.captureException(error);

  // Return user-friendly error
  return { success: false, error: 'Something went wrong' };
}
```

**Custom Error Context:**

```typescript
// Add user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.full_name,
});

// Add custom tags
Sentry.setTag('feature', 'billing');
Sentry.setTag('plan', 'pro');

// Add extra context
Sentry.setContext('subscription', {
  plan: subscription.plan_type,
  status: subscription.status,
});
```

### 2. Performance Optimization

**Reduce Sampling in Production:**

```typescript
// Development: 100% sampling
tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

// Production: 10% sampling to reduce costs
replaysSessionSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
```

**Monitor Key Transactions:**

```typescript
// Track important operations
const transaction = Sentry.startTransaction({
  name: 'user-signup',
  op: 'auth',
});

try {
  await signUpUser(userData);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### 3. Alert Configuration

**Critical Error Alerts:**

- New errors in production
- Error rate > 5% in 5 minutes
- Performance degradation > 50%

**Performance Alerts:**

- Page load time > 3 seconds
- API response time > 1 second
- Error rate > 1% for any endpoint

### 4. Privacy and Security

**Data Masking:**

```typescript
// Automatically mask sensitive data
Sentry.init({
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.creditCard;
    }
    return event;
  },
});
```

**GDPR Compliance:**

- User consent for session replay
- Data retention policies
- Right to be forgotten
- Data export capabilities

## Troubleshooting

### Common Issues

**1. Errors Not Appearing in Sentry**

- Check DSN configuration
- Verify CSP allows Sentry connections
- Check network connectivity
- Review Sentry project settings

**2. Session Replay Not Working**

- Verify `worker-src 'self' blob:` in CSP
- Check browser compatibility
- Review replay sampling rates
- Check for ad blockers

**3. Performance Data Missing**

- Verify `tracesSampleRate` > 0
- Check transaction instrumentation
- Review performance thresholds
- Check for network issues

**4. High Sentry Costs**

- Reduce sampling rates in production
- Filter out non-critical errors
- Optimize error grouping
- Review data retention settings

### Debug Mode

Enable debug mode to troubleshoot issues:

```typescript
Sentry.init({
  debug: process.env.NODE_ENV === 'development',
});
```

This will log Sentry operations to the console.

## Integration with Other Services

### 1. Logging Integration

Sentry works alongside Pino logging:

```typescript
import { log } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

// Log to file/console
log.error(error, 'Database connection failed');

// Send to Sentry
Sentry.captureException(error);
```

### 2. Monitoring Integration

Combine with other monitoring tools:

- **Vercel Analytics**: Web analytics
- **Upstash Redis**: Rate limiting and caching
- **Supabase**: Database monitoring
- **Stripe**: Payment monitoring

## Cost Optimization

### 1. Sampling Rates

```typescript
// Optimize for cost vs. coverage
const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  // Errors: Always capture
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Replays: Lower in production
  replaysSessionSampleRate: isProduction ? 0.05 : 1.0,
  replaysOnErrorSampleRate: 1.0, // Always capture error replays
});
```

### 2. Error Filtering

```typescript
Sentry.init({
  beforeSend(event) {
    // Filter out non-critical errors
    if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
      return null; // Don't send to Sentry
    }
    return event;
  },
});
```

### 3. Data Retention

Configure data retention in Sentry dashboard:

- **Errors**: 30 days (free), 90 days (paid)
- **Performance**: 7 days (free), 30 days (paid)
- **Replays**: 7 days (free), 30 days (paid)

---

**Last Updated**: October 2025

For more information, see:

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Pricing](https://sentry.io/pricing/)
- [Sentry Best Practices](https://docs.sentry.io/product/issues/issue-details/)
