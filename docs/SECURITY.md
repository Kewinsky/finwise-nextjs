# Security Documentation

This document outlines the security features, best practices, and considerations implemented in this SaaS template.

## Table of Contents

- [Overview](#overview)
- [Authentication Security](#authentication-security)
- [Rate Limiting](#rate-limiting)
- [Input Validation](#input-validation)
- [Database Security](#database-security)
- [API Security](#api-security)
- [Environment Variables](#environment-variables)
- [Security Headers](#security-headers)
- [Best Practices](#best-practices)
- [Security Checklist](#security-checklist)

## Overview

This SaaS template implements multiple layers of security to protect user data and prevent common vulnerabilities:

- **Authentication**: Secure JWT-based authentication with Supabase
- **Authorization**: Row Level Security (RLS) in PostgreSQL
- **Rate Limiting**: Protection against brute force and DoS attacks
- **Input Validation**: Comprehensive schema validation with Zod
- **CSRF Protection**: Token-based CSRF protection
- **Secure Headers**: HTTP security headers via Next.js configuration
- **Password Security**: Bcrypt hashing handled by Supabase Auth

## Authentication Security

The authentication system is built on **Supabase Auth**, providing secure, production-ready authentication with minimal configuration.

### Key Features

- **Email/Password Authentication**: Traditional email and password login
- **Magic Link Authentication**: Passwordless login via email
- **OAuth Providers**: GitHub and Google authentication
- **Password Reset**: Secure password recovery flow
- **Email Verification**: Optional email confirmation
- **Rate Limiting**: Protection against brute force attacks
- **First Login Detection**: Welcome new users

### Session Management

The application uses Supabase Auth for session management:

- **JWT Tokens**: Short-lived access tokens (1 hour default)
- **Refresh Tokens**: Secure refresh tokens stored in HTTP-only cookies
- **Secure Cookie Options**:
  - `HttpOnly`: Prevents JavaScript access
  - `Secure`: Only transmitted over HTTPS (production)
  - `SameSite`: CSRF protection

### Password Requirements

Passwords are validated with the following requirements:

```typescript
// Minimum 8 characters
// At least one uppercase letter
// At least one lowercase letter
// At least one number
// At least one special character (!@#$%^&* etc.)
```

**Accepted special characters**: `!@#$%^&*()_+-=[]{};':"\\|,.<>/?`

**Example valid passwords**:

- `MyP@ssw0rd` ✅
- `Secure123!` ✅
- `Test#Pass1` ✅

**Example invalid passwords**:

- `password` ❌ (no uppercase, no number, no special char)
- `Password` ❌ (no number, no special char)
- `Password1` ❌ (no special char)
- `Pass1!` ❌ (less than 8 characters)

See `src/schemas/auth.ts` for complete validation rules and regex patterns.

### Authentication Methods

#### 1. Email/Password Authentication

**Sign Up**:

- Email validation
- Password strength requirements (8+ chars, uppercase, lowercase, number, special character)
- Automatic profile creation
- Optional email verification
- Rate limited (5 attempts per 15 minutes)

**Sign In**:

- Secure credential validation
- First login detection
- Rate limited (5 attempts per 15 minutes)

#### 2. Magic Link Authentication

**How it works**:

1. User enters email
2. System sends magic link to email
3. User clicks link in email
4. User is automatically logged in
5. Profile created if first time

**Benefits**:

- No password to remember
- Reduces password reset requests
- Simpler user experience
- Built-in email verification

#### 3. OAuth Authentication

**Supported Providers**:

- GitHub
- Google

**Configuration Required**:

1. **GitHub OAuth**:
   - Create OAuth App in GitHub Settings
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
   - Add Client ID and Secret to Supabase Dashboard

2. **Google OAuth**:
   - Create project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth credentials
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
   - Add Client ID and Secret to Supabase Dashboard

**Flow**:

1. User clicks "Sign in with GitHub/Google"
2. Redirected to provider's login page
3. User authorizes the app
4. Redirected back with auth code
5. Supabase exchanges code for token
6. User logged in with profile created

OAuth flow is handled securely through Supabase Auth with:

- State parameter for CSRF protection
- Automatic profile creation
- Email verification (provider-dependent)

### Authentication Flow

#### Sign Up Flow

1. User submits form
2. Rate limit check
3. Validate input with Zod
4. Call Supabase Auth signUp
5. Database trigger fires
6. Create profile record
7. Create subscription record
8. Send verification email
9. Redirect to email-sent page

#### Sign In Flow

1. User submits credentials
2. Rate limit check
3. Validate input
4. Call Supabase Auth signIn
5. Check first login
6. Redirect to dashboard (with welcome flag if first time)

#### Password Reset Flow

1. User requests password reset
2. Rate limit check
3. Validate email
4. Send reset email
5. User clicks link in email
6. Redirect to reset-password page
7. User enters new password
8. Validate password
9. Update password in Supabase
10. Redirect to login

### Server Actions

All authentication logic is implemented using Next.js Server Actions for security and simplicity.

#### Available Actions

**User Authentication**:

- `signUpWithEmail(formData: FormData)` - Creates new user account
- `signInWithEmail(formData: FormData)` - Authenticates existing user
- `signInWithMagicLink(formData: FormData)` - Sends magic link to email
- `signInWithOAuth(provider: "github" | "google")` - Initiates OAuth flow
- `signOut()` - Logs out current user

**Password Management**:

- `forgotPassword(formData: FormData)` - Sends password reset email
- `resetPassword(formData: FormData)` - Updates user password

**User Profile**:

- `updateProfile(formData: FormData)` - Updates user profile information
- `getCurrentUser()` - Retrieves current authenticated user
- `requireAuth()` - Utility to require authentication

### Middleware

The middleware handles route protection.

#### Protected Routes

Routes that require authentication:

- `/dashboard/*` - User dashboard and features
- `/settings/*` - User settings pages

#### Authentication Routes

Routes for unauthenticated users:

- `/login` - Login page
- `/signup` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form (accessible by both)

#### Middleware Behavior

**For Protected Routes**:

- Checks if user is authenticated
- If not authenticated: redirects to `/login?redirectTo=<current-path>`
- If authenticated: allows access

**For Auth Routes**:

- Checks if user is authenticated
- If authenticated: redirects to `/dashboard`
- If not authenticated: allows access
- **Exception**: `/reset-password` is accessible to all

### Email Templates

Email templates are located in the `emails/` directory.

#### Available Templates

**Supabase Templates** (`emails/supabase/`):

- `signup.html` - Email verification
- `magic-link.html` - Magic link email
- `reset-password.html` - Password reset email

**Custom Templates** (`emails/custom/`):

- `invoice.html` - Invoice notification (example)

#### Configuring Email Templates in Supabase

1. Go to Supabase Dashboard
2. Navigate to Authentication > Email Templates
3. Select template to customize
4. Edit HTML/text content
5. Use variables like `{{ .ConfirmationURL }}`

#### Available Variables

**Confirmation Email**:

- `{{ .ConfirmationURL }}` - Email verification link
- `{{ .Token }}` - Verification token
- `{{ .TokenHash }}` - Token hash

**Magic Link Email**:

- `{{ .ConfirmationURL }}` - Magic link URL
- `{{ .Token }}` - OTP token

**Password Reset**:

- `{{ .ConfirmationURL }}` - Reset link
- `{{ .Token }}` - Reset token

### Customization

#### Adding New Authentication Methods

**Example: Phone Authentication**

1. Enable phone authentication in Supabase Dashboard
2. Create server action:

```typescript
export async function signInWithPhone(formData: FormData) {
  const phone = formData.get('phone') as string;
  const supabase = await createClientForServer();

  const { error } = await supabase.auth.signInWithOtp({ phone });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Check your phone for OTP' };
}
```

3. Create form component:

```typescript
export function PhoneLoginForm() {
  return (
    <form action={signInWithPhone}>
      <input name="phone" type="tel" placeholder="+1234567890" />
      <button type="submit">Send OTP</button>
    </form>
  );
}
```

#### Multi-Factor Authentication (MFA)

Supabase supports TOTP-based MFA:

1. Enable MFA in Supabase Dashboard
2. Implement enrollment flow:

```typescript
export async function enrollMFA() {
  const supabase = await createClientForServer();
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  // Return QR code and secret to user
  return { qrCode: data?.totp.qr_code, secret: data?.totp.secret };
}
```

3. Implement verification flow:

```typescript
export async function verifyMFA(code: string, factorId: string) {
  const supabase = await createClientForServer();
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    code,
  });

  return { success: !error };
}
```

### Troubleshooting Authentication

#### Common Issues

**1. "Email not confirmed"**

- **Cause**: Email verification is enabled but user hasn't clicked confirmation link
- **Solutions**: Disable email confirmation in Supabase Dashboard (dev only), resend confirmation email, check spam folder

**2. "Rate limited"**

- **Cause**: Too many authentication attempts
- **Solutions**: Wait 15 minutes, adjust rate limits in `src/lib/ratelimit.ts` (dev only), whitelist IP addresses for testing

**3. "Invalid login credentials"**

- **Cause**: Wrong email/password or user doesn't exist
- **Solutions**: Verify email is correct, use password reset if forgotten, check if user signed up with OAuth

**4. "Session expired"**

- **Cause**: User's session has expired
- **Solutions**: User needs to log in again, increase session duration in Supabase

**5. "OAuth provider not configured"**

- **Cause**: OAuth credentials not set up properly
- **Solutions**: Verify client ID and secret in Supabase Dashboard, check redirect URLs match exactly, ensure provider app is not in sandbox mode

## Rate Limiting

Rate limiting is implemented using Upstash Redis to prevent abuse and brute force attacks.

### Rate Limit Configurations

**Authentication Routes** (`authRateLimit`):

```typescript
5 requests per 15 minutes
```

Applied to:

- `/login` - Email/password login
- `/signup` - New user registration
- `/forgot-password` - Password reset requests
- `/reset-password` - Password reset confirmation
- Magic link requests
- OAuth login attempts

**API Routes** (`apiRateLimit`):

```typescript
100 requests per 1 hour
```

Applied to:

- General API endpoints
- Data fetching routes
- Update operations

### Implementation

Rate limiting uses a sliding window algorithm for accurate rate limiting:

```typescript
// src/lib/ratelimit.ts
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
});
```

**Client Identification Strategy**:

1. JWT token hash (if authenticated)
2. `X-Forwarded-For` header
3. `X-Real-IP` header
4. `CF-Connecting-IP` header (Cloudflare)
5. Fallback to "unknown"

### Bypassing Rate Limits

To whitelist specific IPs or users (e.g., for testing):

```typescript
// Add to src/lib/ratelimit.ts
const WHITELIST = ['127.0.0.1', 'your-trusted-ip'];

export const getClientIdentifier = (headers: Headers): string => {
  const ip = getIPFromHeaders(headers);

  if (WHITELIST.includes(ip)) {
    return `whitelisted:${ip}`;
  }

  // ... existing logic
};
```

## Input Validation

All user inputs are validated using Zod schemas before processing.

### Validation Layers

1. **Client-Side**: Form validation with `react-hook-form` + Zod
2. **Server-Side**: Schema validation in server actions
3. **Database**: PostgreSQL constraints and RLS policies

### Schema Definitions

Schemas are centralized in `src/schemas/`:

- `auth.ts` - Authentication schemas (signup, login, password reset)
- `profile.ts` - User profile update schemas
- `env.ts` - Environment variable validation

### Example Schema

```typescript
// src/schemas/auth.ts
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});
```

### Best Practices

- ✅ Always validate on the server, even if client-side validation exists
- ✅ Use strict types and schemas
- ✅ Sanitize HTML inputs to prevent XSS
- ✅ Validate file uploads (type, size, content)
- ✅ Use parameterized queries (handled by Supabase client)

## Database Security

### Row Level Security (RLS)

All tables have RLS enabled with fine-grained access control:

**Profiles Table**:

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

**Subscriptions Table**:

```sql
-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
```

### Database Access

**Two Client Types**:

1. **Regular Client** (`createClientForServer`):
   - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Subject to RLS policies
   - Used for user-facing operations

2. **Service Client** (`createServiceClient`):
   - Uses `SUPABASE_SERVICE_ROLE_KEY`
   - Bypasses RLS policies
   - Only used for admin operations (e.g., Stripe webhooks)
   - ⚠️ **Use with extreme caution**

### Foreign Key Constraints

All relationships use proper foreign keys with cascade delete:

```sql
CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users (id)
  ON DELETE CASCADE
```

This ensures data integrity and automatic cleanup when users are deleted.

## API Security

### Stripe Webhook Security

Stripe webhooks are secured using webhook signature verification:

```typescript
// src/app/api/stripe/webhook/route.ts
const signature = headers().get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
```

**Security Features**:

- Signature verification prevents spoofing
- Idempotency handling prevents duplicate processing
- Service role key used only for webhook operations
- Detailed logging for audit trails

### API Route Protection

Protected API routes should:

1. Verify user authentication
2. Apply rate limiting
3. Validate all inputs
4. Use appropriate HTTP methods
5. Return appropriate status codes

Example:

```typescript
export async function POST(request: Request) {
  // 1. Rate limiting
  const rateLimitResult = await apiRateLimit.limit(clientId);
  if (!rateLimitResult.success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // 2. Authentication
  const supabase = await createClientForServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 3. Input validation
  const body = await request.json();
  const validatedData = schema.parse(body);

  // 4. Process request
  // ...
}
```

## Environment Variables

### Validation

All environment variables are validated at build time using Zod:

```typescript
// src/schemas/env.ts
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  // ...
});
```

**Benefits**:

- Fails fast if required variables are missing
- Type-safe access to environment variables
- Clear error messages for configuration issues
- Separates client and server variables

### Secret Management

**Development**:

- Store secrets in `.env.local` (gitignored)
- Use test/development keys
- Never commit secrets to version control

**Production**:

- Use platform environment variables (Vercel, Railway, etc.)
- Rotate keys regularly
- Use different keys for staging and production
- Consider using secret management services (AWS Secrets Manager, etc.)

### CSRF Protection

A `CSRF_SECRET` is required for CSRF token generation:

```bash
# Generate a strong secret
openssl rand -hex 32
```

This secret is used to:

- Generate CSRF tokens for forms
- Validate token authenticity
- Prevent cross-site request forgery attacks

## Security Headers

Security headers are configured in Next.js config (or middleware):

```typescript
// Recommended headers for next.config.ts
headers: async () => [
  {
    source: '/:path*',
    headers: [
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ],
  },
],
```

### Content Security Policy (CSP)

Consider implementing CSP headers for additional protection:

```typescript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
}
```

**Note**: CSP configuration may need adjustments based on third-party services used.

## Best Practices

### Code Security

- ✅ Keep dependencies updated (`pnpm update`)
- ✅ Run security audits (`pnpm audit`)
- ✅ Use TypeScript strict mode
- ✅ Follow principle of least privilege
- ✅ Sanitize user inputs
- ✅ Use prepared statements (handled by Supabase)
- ✅ Implement proper error handling (don't leak stack traces)

### Authentication

- ✅ Use multi-factor authentication (optional, via Supabase)
- ✅ Implement account lockout after failed attempts (via rate limiting)
- ✅ Force HTTPS in production
- ✅ Implement proper logout functionality
- ✅ Clear sessions on password change

### Data Protection

- ✅ Encrypt sensitive data at rest (via Supabase)
- ✅ Use HTTPS for all communications
- ✅ Implement proper backup strategies
- ✅ Comply with data protection regulations (GDPR, CCPA)
- ✅ Implement data retention policies
- ✅ Allow users to export/delete their data

### Monitoring and Logging

- ✅ Log security events (login attempts, rate limit hits)
- ✅ Monitor for suspicious activity
- ✅ Set up alerts for security events
- ✅ Use structured logging (Pino)
- ✅ Don't log sensitive information (passwords, tokens)

## Security Checklist

### Pre-Launch

- [ ] All environment variables properly configured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured and tested
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] RLS policies reviewed and tested
- [ ] OAuth providers configured correctly
- [ ] Stripe webhooks secured with signature verification
- [ ] Email verification enabled (if required)
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies updated and audited
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

### Post-Launch

- [ ] Regular security audits
- [ ] Dependency updates and patches
- [ ] Log monitoring for suspicious activity
- [ ] Regular backup testing
- [ ] Key rotation schedule
- [ ] Incident response plan
- [ ] Security training for team members
- [ ] Compliance with data protection regulations

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email security@yourdomain.com with details
3. Include steps to reproduce
4. Allow reasonable time for a fix before disclosure

## Additional Resources

- [Supabase Security](https://supabase.com/docs/guides/auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Stripe Security](https://stripe.com/docs/security/guide)
- [Upstash Security](https://upstash.com/docs/redis/overall/security)

---

**Last Updated**: October 2025
