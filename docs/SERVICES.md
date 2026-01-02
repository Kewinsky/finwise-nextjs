# Services Layer

This directory contains the business logic layer for the application. Services provide a clean separation between data access, business rules, and presentation logic.

## Architecture Principles

### 1. **Single Responsibility**

Each service handles a specific domain (User, Auth, Subscription, Billing, etc.)

### 2. **No UI Dependencies**

Services should never import or depend on UI components, React hooks, or Next.js app-specific features.

### 3. **Dependency Injection**

Services receive their dependencies (database client, external APIs) through constructor parameters or factory functions.

### 4. **Type Safety**

All service methods have explicit TypeScript types for parameters and return values.

### 5. **Error Handling**

Services use centralized error handling with consistent patterns:

- **Centralized error messages** via `ERROR_MESSAGES` constants
- **Structured logging** via `LOG_MESSAGES` constants
- **Consistent response patterns** (`{ success: boolean, data?: T, error?: string }`)

## Folder Structure

```
src/services/
├── account.service.ts           # Account management service
├── ai.service.ts               # AI assistant and insights service
├── auth.service.ts             # Authentication service
├── billing.service.ts           # Billing and payments service
├── notification.service.ts      # Notification preferences service
├── openai-usage.service.ts      # OpenAI usage tracking service
├── subscription.service.ts      # Subscription management service
├── transaction.service.ts       # Transaction management service
├── user-preferences.service.ts  # User preferences service
├── user.service.ts              # User profile service
└── index.ts                     # Service exports
```

## Available Services

### AuthService

**File**: `src/services/auth.service.ts`  
**Responsibilities**: Authentication, OAuth, magic links, password reset, session management

**Key Methods**:

- `signUp(input, redirectUrl?)` - User registration
- `signIn(input)` - Email/password login
- `signInWithMagicLink(input)` - Magic link authentication
- `signInWithOAuth(provider, redirectUrl?)` - OAuth login
- `resetPassword(input)` - Password reset
- `getCurrentUser()` - Get authenticated user
- `getAuthenticationMethod(userId)` - Detect auth method

### BillingService

**File**: `src/services/billing.service.ts`  
**Responsibilities**: Stripe integration, checkout sessions, customer portal, invoices

**Key Methods**:

- `createCheckoutSession(options)` - Create Stripe checkout
- `createCustomerPortalSession(options)` - Customer portal access
- `getPaymentMethods(customerId)` - List payment methods
- `getInvoices(customerId, filters?)` - Retrieve invoices

### NotificationService

**File**: `src/services/notification.service.ts`  
**Responsibilities**: Notification preferences management

**Key Methods**:

- `getNotificationPreferences(userId)` - Get user preferences
- `updateNotificationPreferences(userId, preferences)` - Update preferences
- `getNotificationHistory(userId, filters?)` - Get notification history

### SubscriptionService

**File**: `src/services/subscription.service.ts`  
**Responsibilities**: Subscription CRUD, status calculations, Stripe sync

**Key Methods**:

- `getUserSubscription(userId)` - Get user's subscription
- `createSubscription(input)` - Create new subscription
- `updateSubscription(id, input)` - Update subscription
- `getSubscriptionStatusInfo(subscription)` - Calculate status info
- `syncFromStripe(stripeSubscription)` - Sync from Stripe

### UserPreferencesService

**File**: `src/services/user-preferences.service.ts`  
**Responsibilities**: User settings and preferences management

**Key Methods**:

- `getUserPreferences(userId)` - Get user preferences
- `updateUserPreferences(userId, preferences)` - Update preferences
- `getUserSettings(userId)` - Get user settings
- `updateUserSettings(userId, settings)` - Update settings

### UserService

**File**: `src/services/user.service.ts`  
**Responsibilities**: User profiles, search, metadata management

**Key Methods**:

- `getUserById(userId)` - Get user by ID
- `updateProfile(userId, input)` - Update user profile
- `createUserProfile(input)` - Create new profile
- `searchUsers(filters)` - Search users
- `getUserMetadata(userId)` - Get user metadata

### AccountService

**File**: `src/services/account.service.ts`  
**Responsibilities**: Financial account management (checking, savings, investment, credit card)

**Key Methods**:

- `getAccounts(userId, filters?)` - Get all accounts for user
- `getAccountById(userId, accountId)` - Get account by ID
- `createAccount(userId, input)` - Create new account
- `updateAccount(userId, accountId, input)` - Update account
- `deleteAccount(userId, accountId)` - Delete account
- `getAccountBalances(userId)` - Get all account balances

### TransactionService

**File**: `src/services/transaction.service.ts`  
**Responsibilities**: Transaction CRUD, filtering, analytics, and exports

**Key Methods**:

- `getTransactions(userId, filters?, pagination?, sort?)` - Get transactions with filtering
- `getTransactionById(userId, transactionId)` - Get transaction by ID
- `createTransaction(userId, input)` - Create new transaction
- `updateTransaction(userId, transactionId, input)` - Update transaction
- `deleteTransaction(userId, transactionId)` - Delete transaction
- `getMonthlySummary(userId)` - Get monthly income/expense summary
- `getCategorySpending(userId, type)` - Get spending by category
- `getSpendingTrends(userId, days)` - Get spending trends over time
- `exportTransactions(userId, filters?, format)` - Export transactions (CSV/JSON)

### AIAssistantService

**File**: `src/services/ai.service.ts`  
**Responsibilities**: AI-powered financial insights and chat assistant

**Key Methods**:

- `generateInsights(userId)` - Generate automated monthly financial insights
- `askQuestion(userId, message)` - Answer financial questions using AI
- `saveInsights(userId, insights)` - Save insights to database
- `getLatestInsights(userId)` - Get most recent insights

### OpenAIUsageService

**File**: `src/services/openai-usage.service.ts`  
**Responsibilities**: Track and limit OpenAI API usage per user/plan

**Key Methods**:

- `canMakeAPICall(userId)` - Check if user can make AI query (rate limit check)
- `recordUsage(userId, tokens, queryType)` - Record API usage
- `getUsageStats(userId)` - Get usage statistics for current period
- `getUsageHistory(userId, period?)` - Get historical usage data

## Usage Patterns

### In Server Actions

```typescript
'use server';

import { UserService } from '@/services';
import { createClientForServer } from '@/utils/supabase/server';

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClientForServer();
  const userService = new UserService(supabase);

  const result = await userService.updateProfile(userId, {
    fullName: formData.get('fullName') as string,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data };
}
```

### In API Routes

```typescript
import { UserService } from '@/services';
import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClientForServer();
  const userService = new UserService(supabase);

  const result = await userService.getUserById(userId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result.data);
}
```

### Direct Usage (Server Components)

```typescript
import { UserService } from "@/services";
import { createClientForServer } from "@/utils/supabase/server";

export default async function UserProfile({ userId }: { userId: string }) {
  const supabase = await createClientForServer();
  const userService = new UserService(supabase);

  const result = await userService.getUserById(userId);

  if (!result.success) {
    return <div>Error loading profile</div>;
  }

  return <div>{result.data.full_name}</div>;
}
```

## Best Practices

### 1. **Service Instantiation**

Always instantiate services with the appropriate Supabase client for the context:

- **Server Actions/Components**: `createClientForServer()`
- **Service-to-Service (bypassing RLS)**: `createServiceClient()`
- **Webhooks/Background Jobs**: `createServiceClient()`

### 2. **Result Objects**

Use `ServiceResult<T>` for operations that can fail:

```typescript
type ServiceResult<T> = { success: true; data: T } | { success: false; error: string };
```

### 3. **Validation**

Validate input at the service boundary using Zod schemas:

```typescript
export class UserService {
  async updateProfile(userId: string, data: UpdateProfileInput) {
    // Validate input
    const validated = updateProfileSchema.parse(data);

    // Business logic
    // ...
  }
}
```

### 4. **Logging**

Use structured logging for important operations:

```typescript
import { log } from '@/lib/logger';

export class UserService {
  async createUser(data: CreateUserInput) {
    log.info({ email: data.email }, 'Creating user');

    try {
      // ...
      log.info({ userId: user.id }, 'User created successfully');
      return { success: true, data: user };
    } catch (error) {
      log.error(error, 'Failed to create user');
      return { success: false, error: 'Failed to create user' };
    }
  }
}
```

### 5. **Transaction Support**

For operations requiring multiple database queries, consider wrapping in transactions:

```typescript
export class UserService {
  async deleteUserAndData(userId: string): Promise<ServiceResult<void>> {
    const supabase = this.supabase;

    // Delete related data first (respecting foreign keys)
    const { error: subsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subsError) {
      return { success: false, error: subsError.message };
    }

    const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true, data: undefined };
  }
}
```

### 6. **Service Composition**

Services can depend on other services, but avoid circular dependencies:

```typescript
export class BillingService {
  constructor(
    private supabase: SupabaseClient,
    private subscriptionService: SubscriptionService,
  ) {}

  async getBillingInfo(userId: string) {
    const subscription = await this.subscriptionService.getUserSubscription(userId);
    // Use subscription data
  }
}
```

### 7. **Testing**

Services should be easily testable by mocking the Supabase client:

```typescript
describe('UserService', () => {
  it('should get user by id', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: '123', email: 'test@example.com' },
              error: null,
            }),
          }),
        }),
      }),
    };

    const userService = new UserService(mockSupabase as any);
    const result = await userService.getUserById('123');

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe('test@example.com');
  });
});
```

## Migration Guide

When extracting business logic from server actions:

1. **Identify the core business logic** (database queries, validations, transformations)
2. **Create a service method** with clear input/output types
3. **Move the logic** to the service method
4. **Update the server action** to call the service
5. **Handle rate limiting, logging, and redirects** in the server action (not in the service)

### Before:

```typescript
export async function updateProfile(formData: FormData) {
  const supabase = await createClientForServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: formData.get('fullName') })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
```

### After:

```typescript
// service
export class UserService {
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const { error } = await this.supabase
      .from('profiles')
      .update({ full_name: data.fullName })
      .eq('id', userId);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  }
}

// server action
export async function updateProfile(formData: FormData) {
  const supabase = await createClientForServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userService = new UserService(supabase);
  return userService.updateProfile(user.id, {
    fullName: formData.get('fullName') as string,
  });
}
```

## Code Consistency & Type Safety

This template implements enterprise-level code consistency through centralized constants and type-safe error handling.

### Centralized Error Messages

All error messages are defined in `src/lib/constants/errors.ts`:

```typescript
export const ERROR_MESSAGES = {
  UNEXPECTED: 'An unexpected error occurred',
  VALIDATION: 'Please check your information and try again',
  RATE_LIMITED: 'Too many requests. Please wait before trying again',
  INVALID_CREDENTIALS: 'Invalid email or password',
  // ... more error messages
} as const;
```

### Centralized Log Messages

All log messages are defined in `src/lib/constants/logs.ts`:

```typescript
export const LOG_MESSAGES = {
  PROCESSING_FAILED: (action: string) => `${action} failed`,
  VALIDATION_FAILED: (action: string) => `${action} validation failed`,
  RATE_LIMITED: (action: string) => `${action} rate limited`,
  // ... more log messages
} as const;
```

### Type-Safe Error Handling

Server actions use consistent error handling patterns:

```typescript
try {
  // business logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return handleValidationError(error, 'signup', {
      validationErrors: JSON.stringify(error.issues),
    });
  }
  return handleActionError(error, 'signup');
}
```

### Benefits

- ✅ **Consistent user experience** - Same error messages across the app
- ✅ **Better debugging** - Structured logging with context
- ✅ **Type safety** - No `any` types, proper TypeScript usage
- ✅ **Maintainable** - Single place to update error messages
- ✅ **Professional quality** - Enterprise-level code standards

## Anti-Patterns to Avoid

❌ **Don't** include HTTP/routing logic in services
❌ **Don't** import Next.js server-specific utilities (headers, cookies, redirect) in services
❌ **Don't** use global singletons unless absolutely necessary
❌ **Don't** mix presentation logic with business logic
❌ **Don't** return different types based on success/failure without using discriminated unions

✅ **Do** keep services focused on business logic and data access
✅ **Do** use dependency injection for external dependencies
✅ **Do** use TypeScript for strong typing
✅ **Do** return consistent result objects
✅ **Do** handle errors gracefully with proper logging
