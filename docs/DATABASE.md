# Database Documentation

This document provides comprehensive information about the database schema, setup, and best practices for this SaaS template.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [Tables](#tables)
- [Relationships](#relationships)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Triggers and Functions](#triggers-and-functions)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Database Clients](#database-clients)
- [Best Practices](#best-practices)
- [Common Operations](#common-operations)

## Overview

This application uses **PostgreSQL** via **Supabase** as its database provider.

### Key Features

- **PostgreSQL 15+**: Modern, powerful relational database
- **Row Level Security (RLS)**: Fine-grained access control
- **Real-time subscriptions**: Live data updates (optional)
- **Full-text search**: Built-in search capabilities
- **JSON support**: Store and query JSON data
- **Automatic backups**: Point-in-time recovery
- **Performance indexes**: Optimized query performance

### Database Tools

- **Supabase Dashboard**: Web-based SQL editor and table viewer
- **pg_admin**: Desktop PostgreSQL administration tool
- **Supabase CLI**: Command-line database management
- **TypeScript Types**: Auto-generated types from schema

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│                 │
│ • id (UUID)     │
│ • email         │
│ • created_at    │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐        ┌──────────────────┐
│    profiles     │        │  subscriptions   │
│                 │   1:1  │                  │
│ • id (UUID) PK  ├────────┤ • id (UUID) PK   │
│ • email         │        │ • user_id FK     │
│ • full_name     │        │ • stripe_*       │
│ • avatar_url    │        │ • plan_type      │
│ • role          │        │ • status         │
│ • created_at    │        │ • trial_end      │
│ • updated_at    │        │ • has_used_trial │
│ • deleted_at    │        │ • created_at     │
└────────┬────────┘        │ • updated_at     │
         │                 └──────────────────┘
         │ 1:1
         │
┌────────▼────────┐        ┌──────────────────┐
│user_preferences │        │notification_prefs│
│                 │   1:1  │                  │
│ • id (UUID) PK  ├────────┤ • id (UUID) PK   │
│ • user_id FK    │        │ • user_id FK     │
│ • theme         │        │ • email_*        │
│ • language      │        │ • push_*         │
│ • font_size     │        │ • created_at     │
│ • created_at    │        │ • updated_at     │
│ • updated_at    │        └──────────────────┘
└─────────────────┘
```

### Schema Overview

The database consists of:

- **4 main tables**: `profiles`, `subscriptions`, `user_preferences`, and `notification_preferences`
- **1 auth schema**: Managed by Supabase Auth
- **2 custom enums**: `subscription_status` and `user_role`
- **Multiple indexes**: For query performance
- **RLS policies**: For data security
- **Triggers**: For automatic updates

## Tables

### profiles

Stores user profile information.

**Schema**:

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NULL,
  avatar_url TEXT NULL,
  role user_role DEFAULT 'user'::user_role,
  is_first_login BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users (id)
    ON DELETE CASCADE
);
```

**Columns**:

| Column           | Type        | Nullable | Default | Description                         |
| ---------------- | ----------- | -------- | ------- | ----------------------------------- |
| `id`             | UUID        | No       | -       | User ID (foreign key to auth.users) |
| `email`          | TEXT        | No       | -       | User email address                  |
| `full_name`      | TEXT        | Yes      | NULL    | User's full name                    |
| `avatar_url`     | TEXT        | Yes      | NULL    | URL to user's avatar image          |
| `role`           | user_role   | Yes      | 'user'  | User role (user, admin)             |
| `is_first_login` | BOOLEAN     | Yes      | true    | Flag for first-time login           |
| `created_at`     | TIMESTAMPTZ | Yes      | NOW()   | Account creation timestamp          |
| `updated_at`     | TIMESTAMPTZ | Yes      | NOW()   | Last update timestamp               |
| `deleted_at`     | TIMESTAMPTZ | Yes      | NULL    | Soft delete timestamp               |

**Indexes**:

- `idx_profiles_email` on `email` (for quick email lookups)
- `idx_profiles_role` on `role` (for role-based queries)
- `idx_profiles_deleted_at` on `deleted_at` (for soft delete queries)
- `idx_profiles_created_at` on `created_at` (for sorting by creation date)
- Primary key index on `id`
- Unique constraint on `email`

**TypeScript Type**:

```typescript
// src/types/user.ts
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_first_login: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### subscriptions

Stores user subscription and billing information.

**Schema**:

```sql
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_type TEXT DEFAULT 'free',
  status subscription_status DEFAULT 'active' NOT NULL,
  current_period_start TIMESTAMPTZ,
  stripe_current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  has_used_trial BOOLEAN DEFAULT false,
  billing_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles (id)
    ON DELETE CASCADE
);
```

**Columns**:

| Column                      | Type                | Nullable | Default           | Description                       |
| --------------------------- | ------------------- | -------- | ----------------- | --------------------------------- |
| `id`                        | UUID                | No       | gen_random_uuid() | Subscription record ID            |
| `user_id`                   | UUID                | No       | -                 | User ID (foreign key to profiles) |
| `stripe_customer_id`        | TEXT                | Yes      | NULL              | Stripe customer ID                |
| `stripe_subscription_id`    | TEXT                | Yes      | NULL              | Stripe subscription ID            |
| `stripe_price_id`           | TEXT                | Yes      | NULL              | Stripe price ID for current plan  |
| `plan_type`                 | TEXT                | Yes      | 'free'            | Plan type (free, basic, pro)      |
| `status`                    | subscription_status | No       | 'active'          | Subscription status               |
| `current_period_start`      | TIMESTAMPTZ         | Yes      | NULL              | Current billing period start      |
| `stripe_current_period_end` | TIMESTAMPTZ         | Yes      | NULL              | Current billing period end        |
| `cancel_at_period_end`      | BOOLEAN             | Yes      | false             | Cancel subscription at period end |
| `trial_end`                 | TIMESTAMPTZ         | Yes      | NULL              | Trial period end date             |
| `canceled_at`               | TIMESTAMPTZ         | Yes      | NULL              | Subscription cancellation date    |
| `ended_at`                  | TIMESTAMPTZ         | Yes      | NULL              | Subscription end date             |
| `has_used_trial`            | BOOLEAN             | Yes      | false             | Whether user has used trial       |
| `billing_status`            | TEXT                | Yes      | NULL              | Additional billing status info    |
| `created_at`                | TIMESTAMPTZ         | Yes      | NOW()             | Subscription creation timestamp   |
| `updated_at`                | TIMESTAMPTZ         | Yes      | NOW()             | Last update timestamp             |

**Indexes**:

- `idx_subscriptions_user_id` on `user_id`
- `idx_subscriptions_stripe_customer_id` on `stripe_customer_id`
- `idx_subscriptions_stripe_subscription_id` on `stripe_subscription_id`
- `idx_subscriptions_status` on `status`
- Unique constraints on `user_id`, `stripe_customer_id`, `stripe_subscription_id`

**Subscription Statuses**:

- `active` - Subscription is active
- `canceled` - Subscription canceled
- `past_due` - Payment failed
- `unpaid` - Payment required
- `incomplete` - Setup incomplete
- `trialing` - In trial period

**TypeScript Type**:

```typescript
// src/types/subscription.ts
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_type: string | null;
  status: string;
  current_period_start: string | null;
  stripe_current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### user_preferences

Stores user UI and application preferences.

**Schema**:

```sql
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system' NOT NULL,
  language TEXT DEFAULT 'en' NOT NULL,
  system_font TEXT DEFAULT 'system' NOT NULL,
  font_size TEXT DEFAULT 'medium' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT user_preferences_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles (id)
    ON DELETE CASCADE,
  CHECK (theme IN ('light','dark','system')),
  CHECK (font_size IN ('small','medium','large'))
);
```

**Columns**:

| Column        | Type        | Nullable | Default           | Description                       |
| ------------- | ----------- | -------- | ----------------- | --------------------------------- |
| `id`          | UUID        | No       | gen_random_uuid() | Preference record ID              |
| `user_id`     | UUID        | No       | -                 | User ID (foreign key to profiles) |
| `theme`       | TEXT        | No       | 'system'          | UI theme (light, dark, system)    |
| `language`    | TEXT        | No       | 'en'              | User's preferred language         |
| `system_font` | TEXT        | No       | 'system'          | System font preference            |
| `font_size`   | TEXT        | No       | 'medium'          | Font size (small, medium, large)  |
| `created_at`  | TIMESTAMPTZ | Yes      | NOW()             | Preference creation timestamp     |
| `updated_at`  | TIMESTAMPTZ | Yes      | NOW()             | Last update timestamp             |

**TypeScript Type**:

```typescript
// src/types/user-preferences.types.ts
export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  system_font: string;
  font_size: 'small' | 'medium' | 'large';
  created_at: string | null;
  updated_at: string | null;
}
```

### notification_preferences

Stores user notification settings and preferences.

**Schema**:

```sql
CREATE TABLE public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Email notification preferences
  email_marketing BOOLEAN DEFAULT true NOT NULL,
  email_security BOOLEAN DEFAULT true NOT NULL,
  email_updates BOOLEAN DEFAULT false NOT NULL,
  email_weekly_digest BOOLEAN DEFAULT true NOT NULL,
  email_billing BOOLEAN DEFAULT true NOT NULL,
  email_social BOOLEAN DEFAULT false NOT NULL,
  -- Push notification preferences
  push_security BOOLEAN DEFAULT true NOT NULL,
  push_updates BOOLEAN DEFAULT false NOT NULL,
  push_mentions BOOLEAN DEFAULT true NOT NULL,
  push_comments BOOLEAN DEFAULT true NOT NULL,
  push_likes BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT notification_preferences_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles (id)
    ON DELETE CASCADE
);
```

**Columns**:

| Column                | Type        | Nullable | Default           | Description                       |
| --------------------- | ----------- | -------- | ----------------- | --------------------------------- |
| `id`                  | UUID        | No       | gen_random_uuid() | Preference record ID              |
| `user_id`             | UUID        | No       | -                 | User ID (foreign key to profiles) |
| `email_marketing`     | BOOLEAN     | No       | true              | Marketing email notifications     |
| `email_security`      | BOOLEAN     | No       | true              | Security email notifications      |
| `email_updates`       | BOOLEAN     | No       | false             | Product update emails             |
| `email_weekly_digest` | BOOLEAN     | No       | true              | Weekly digest emails              |
| `email_billing`       | BOOLEAN     | No       | true              | Billing email notifications       |
| `email_social`        | BOOLEAN     | No       | false             | Social activity emails            |
| `push_security`       | BOOLEAN     | No       | true              | Security push notifications       |
| `push_updates`        | BOOLEAN     | No       | false             | Product update push notifications |
| `push_mentions`       | BOOLEAN     | No       | true              | Mention push notifications        |
| `push_comments`       | BOOLEAN     | No       | true              | Comment push notifications        |
| `push_likes`          | BOOLEAN     | No       | false             | Like push notifications           |
| `created_at`          | TIMESTAMPTZ | Yes      | NOW()             | Preference creation timestamp     |
| `updated_at`          | TIMESTAMPTZ | Yes      | NOW()             | Last update timestamp             |

**TypeScript Type**:

```typescript
// src/types/notification.types.ts
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_marketing: boolean;
  email_security: boolean;
  email_updates: boolean;
  email_weekly_digest: boolean;
  email_billing: boolean;
  email_social: boolean;
  push_security: boolean;
  push_updates: boolean;
  push_mentions: boolean;
  push_comments: boolean;
  push_likes: boolean;
  created_at: string | null;
  updated_at: string | null;
}
```

## Enums

### subscription_status

Defines the possible states of a subscription.

```sql
CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid'
);
```

**Values**:

- `active` - Subscription is active and paid
- `canceled` - Subscription has been canceled
- `incomplete` - Subscription setup is incomplete
- `incomplete_expired` - Subscription setup expired
- `past_due` - Payment failed, subscription is past due
- `trialing` - Subscription is in trial period
- `unpaid` - Payment required

### user_role

Defines user roles in the system.

```sql
CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'user'
);
```

**Values**:

- `user` - Regular user (default)
- `admin` - Administrator with elevated permissions

## Relationships

### profiles ↔ auth.users

**Type**: One-to-One  
**Foreign Key**: `profiles.id → auth.users.id`  
**On Delete**: CASCADE (deleting auth user deletes profile)

This relationship ensures that every authenticated user has a profile.

### subscriptions ↔ profiles

**Type**: One-to-One  
**Foreign Key**: `subscriptions.user_id → profiles.id`  
**On Delete**: CASCADE (deleting profile deletes subscription)

This relationship ensures that every user has exactly one subscription record.

### user_preferences ↔ profiles

**Type**: One-to-One  
**Foreign Key**: `user_preferences.user_id → profiles.id`  
**On Delete**: CASCADE (deleting profile deletes preferences)

This relationship ensures that every user has UI and application preferences.

### notification_preferences ↔ profiles

**Type**: One-to-One  
**Foreign Key**: `notification_preferences.user_id → profiles.id`  
**On Delete**: CASCADE (deleting profile deletes notification preferences)

This relationship ensures that every user has notification settings.

## Row Level Security (RLS)

All tables have RLS enabled for security. Users can only access their own data.

### profiles Policies

**View Own Profile**:

```sql
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

**Insert Own Profile**:

```sql
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**Update Own Profile**:

```sql
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### subscriptions Policies

**View Own Subscription**:

```sql
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

**Insert Own Subscription**:

```sql
CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Update Own Subscription**:

```sql
CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
```

### Testing RLS Policies

```sql
-- Test as authenticated user
SELECT * FROM profiles WHERE id = auth.uid();
-- Should return own profile only

SELECT * FROM subscriptions WHERE user_id = auth.uid();
-- Should return own subscription only
```

### Bypassing RLS (Admin Operations)

Use the service role client to bypass RLS:

```typescript
// src/utils/supabase/server.ts
import { createServiceClient } from '@/utils/supabase/server';

// Only use for admin operations!
const supabase = await createServiceClient();
const { data } = await supabase.from('profiles').select('*');
// Returns all profiles, bypassing RLS
```

⚠️ **Warning**: Only use service client for trusted operations like webhooks.

## Triggers and Functions

### update_updated_at_column()

Automatically updates the `updated_at` column when a row is modified.

**Function**:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Triggers**:

```sql
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### handle_new_user()

Automatically creates profile, subscription, and preference records when a user signs up.

**Function**:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create subscription (free tier)
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Trigger**:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

This ensures:

- Every new user automatically gets a profile
- Every new user starts with a free subscription
- Every new user gets default notification preferences
- Every new user gets default UI preferences
- No manual intervention required

## Indexes

Indexes improve query performance by allowing faster lookups.

### Created Indexes

```sql
-- Profiles table
CREATE INDEX idx_profiles_email ON profiles (email);

-- Subscriptions table
CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions (stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions (stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
```

### When to Add Indexes

Add indexes when:

- ✅ Querying by a column frequently
- ✅ Joining on a column
- ✅ Sorting by a column
- ✅ Filtering with WHERE clauses

Don't add indexes when:

- ❌ Table is very small (< 1000 rows)
- ❌ Column has low cardinality (few unique values)
- ❌ Table has heavy write operations

### Creating New Indexes

```sql
-- Example: Index on profile role for filtering users by role
CREATE INDEX idx_profiles_role ON profiles (role)
WHERE role IS NOT NULL;

-- Example: Composite index for complex queries
CREATE INDEX idx_subscriptions_status_plan
ON subscriptions (status, plan_type);
```

## Migrations

### Initial Setup

The initial database setup is in `database/init.sql`. Run this once when setting up a new project:

1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy contents of `database/init.sql`
4. Click "Run"

### Schema Changes

For ongoing development, use migrations:

**Option 1: Supabase Dashboard**

1. Make changes in SQL Editor
2. Save SQL to a migration file
3. Commit to version control

**Option 2: Supabase CLI**

```bash
# Create a new migration
supabase migration new add_user_preferences

# Edit the migration file
# migrations/20231001000000_add_user_preferences.sql

# Apply migration
supabase db push
```

**Example Migration**:

```sql
-- migrations/20231001000000_add_user_preferences.sql

-- Add new column
ALTER TABLE profiles
ADD COLUMN preferences JSONB DEFAULT '{}';

-- Create index
CREATE INDEX idx_profiles_preferences
ON profiles USING GIN (preferences);

-- Add RLS policy
CREATE POLICY "Users can update own preferences" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Migration Best Practices

- ✅ Always test migrations in development first
- ✅ Use transactions for complex migrations
- ✅ Include rollback scripts
- ✅ Document breaking changes
- ✅ Version control all migrations
- ✅ Run migrations during low-traffic periods

## Database Clients

### Regular Client (RLS Enabled)

Used for user-facing operations:

```typescript
import { createClientForServer } from '@/utils/supabase/server';

const supabase = await createClientForServer();

// Select (filtered by RLS)
const { data, error } = await supabase.from('profiles').select('*').eq('id', userId);

// Insert (checked by RLS)
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'New Name' })
  .eq('id', userId);
```

### Service Client (RLS Bypassed)

Used for admin operations:

```typescript
import { createServiceClient } from '@/utils/supabase/server';

const supabase = await createServiceClient();

// Returns all profiles (bypasses RLS)
const { data, error } = await supabase.from('profiles').select('*');

// Use only for trusted operations!
```

### Client-Side Client

Used in Client Components:

```typescript
// src/utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

## Best Practices

### Query Optimization

**Use Select Sparingly**:

```typescript
// ❌ Bad: Fetches all columns
const { data } = await supabase.from('profiles').select('*');

// ✅ Good: Only fetch needed columns
const { data } = await supabase.from('profiles').select('id, full_name, email');
```

**Use Pagination**:

```typescript
// Paginate large result sets
const { data } = await supabase.from('profiles').select('*').range(0, 9); // First 10 results
```

**Use Filters**:

```typescript
// Filter on indexed columns
const { data } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('status', 'active')
  .eq('plan_type', 'pro');
```

### Data Integrity

**Use Transactions**:

```typescript
// Not directly supported by Supabase client
// Use database functions for complex transactions

CREATE OR REPLACE FUNCTION update_subscription(
  p_user_id UUID,
  p_plan_type TEXT
) RETURNS void AS $$
BEGIN
  -- Update subscription
  UPDATE subscriptions
  SET plan_type = p_plan_type
  WHERE user_id = p_user_id;

  -- Update profile
  UPDATE profiles
  SET updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

**Validate Data**:

```typescript
// Always validate before database operations
const validatedData = updateProfileSchema.parse(data);

const { error } = await supabase.from('profiles').update(validatedData).eq('id', userId);
```

### Security

- ✅ Always use RLS for user-facing tables
- ✅ Test RLS policies thoroughly
- ✅ Use service client only when necessary
- ✅ Validate all user inputs
- ✅ Use parameterized queries (handled by Supabase)
- ✅ Regularly backup database
- ✅ Monitor for suspicious queries

## Common Operations

### Create Profile

```typescript
const { data, error } = await supabase.from('profiles').insert({
  id: userId,
  email: 'user@example.com',
  full_name: 'John Doe',
});
```

### Update Profile

```typescript
const { error } = await supabase
  .from('profiles')
  .update({ full_name: 'Jane Doe' })
  .eq('id', userId);
```

### Get User Subscription

```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Update Subscription

```typescript
const { error } = await supabase
  .from('subscriptions')
  .update({
    stripe_subscription_id: 'sub_123',
    plan_type: 'pro',
    status: 'active',
  })
  .eq('user_id', userId);
```

### Join Queries

```typescript
// Get profile with subscription
const { data, error } = await supabase
  .from('profiles')
  .select(
    `
    *,
    subscriptions (*)
  `,
  )
  .eq('id', userId)
  .single();
```

### Full-Text Search

```typescript
// Search profiles by name
const { data, error } = await supabase.from('profiles').select('*').textSearch('full_name', 'John');
```

### Count Records

```typescript
const { count, error } = await supabase
  .from('subscriptions')
  .select('*', { count: 'exact', head: true })
  .eq('plan_type', 'pro');
```

---

**Last Updated**: October 2025
