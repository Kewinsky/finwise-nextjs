-- =============================================================================
-- SaaS Template Database Initialization
-- =============================================================================
-- This file contains all the SQL commands needed to set up the database
-- for the SaaS template application.
-- 
-- Run this file in the Supabase SQL Editor to set up your database.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS "public";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE "public"."subscription_status" AS ENUM (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid'
);

CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'user'
);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Function to handle new user registration and create related records
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into subscriptions table with free plan
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;


-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table - stores user profile information
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    role user_role DEFAULT 'user'::user_role,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_first_login boolean DEFAULT true,
    deleted_at timestamptz,
    PRIMARY KEY (id),
    UNIQUE (email),
    FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Subscriptions table - stores user subscription information
CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_price_id text,
    plan_type text DEFAULT 'free',
    status subscription_status DEFAULT 'active' NOT NULL,
    current_period_start timestamptz,
    stripe_current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    trial_end timestamptz,
    canceled_at timestamptz,
    ended_at timestamptz,
    has_used_trial boolean DEFAULT false,
    billing_status text,
    PRIMARY KEY (id),
    UNIQUE (user_id),
    UNIQUE (stripe_customer_id),
    UNIQUE (stripe_subscription_id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- User preferences table - stores user UI and app preferences
CREATE TABLE public.user_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    theme text DEFAULT 'system' NOT NULL,
    language text DEFAULT 'en' NOT NULL,
    system_font text DEFAULT 'system' NOT NULL,
    font_size text DEFAULT 'medium' NOT NULL,
    header_title_preference text DEFAULT 'time-based' NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CHECK (theme IN ('light','dark','system')),
    CHECK (font_size IN ('small','medium','large')),
    CHECK (header_title_preference IN ('time-based', 'page-based', 'financial-status', 'quick-stats', 'motivational'))
);

-- Notification preferences table - stores user notification settings
CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    -- Email notification preferences
    email_marketing boolean DEFAULT true NOT NULL,
    email_security boolean DEFAULT true NOT NULL,
    email_updates boolean DEFAULT false NOT NULL,
    email_weekly_digest boolean DEFAULT true NOT NULL,
    email_billing boolean DEFAULT true NOT NULL,
    email_social boolean DEFAULT false NOT NULL,
    -- Push notification preferences
    push_security boolean DEFAULT true NOT NULL,
    push_updates boolean DEFAULT false NOT NULL,
    push_mentions boolean DEFAULT true NOT NULL,
    push_comments boolean DEFAULT true NOT NULL,
    push_likes boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);


-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles USING btree (deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles USING btree (created_at);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions USING btree (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions USING btree (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON public.subscriptions USING btree (plan_type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_status ON public.subscriptions USING btree (billing_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_start ON public.subscriptions USING btree (current_period_start);

-- User preferences table indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON public.user_preferences USING btree (theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_language ON public.user_preferences USING btree (language);

-- Notification preferences table indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences USING btree (user_id);


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Profiles table policies
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Subscriptions table policies
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- User preferences table policies
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

-- Notification preferences table policies
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);


-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table permissions
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subscriptions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_preferences TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notification_preferences TO anon, authenticated, service_role;

-- Grant function permissions
GRANT ALL ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon, authenticated, service_role;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- Your database is now ready! 
-- 
-- What was created:
-- ✅ profiles table with user information
-- ✅ subscriptions table with Stripe integration
-- ✅ notification_preferences table with user notification settings
-- ✅ user_preferences table with UI/app preferences
-- ✅ Performance indexes for optimal query performance
-- ✅ Auto-update triggers for timestamps
-- ✅ Row Level Security policies for data protection
-- ✅ Automatic user registration function
-- 
-- =============================================================================