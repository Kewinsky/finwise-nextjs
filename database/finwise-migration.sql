-- =============================================================================
-- Finwise Financial Management Tables Migration
-- =============================================================================
-- This migration adds the core financial management tables for the Finwise app:
-- - accounts: Financial accounts (checking, savings, investment, credit card)
-- - transactions: Financial transactions (income, expense, transfer)
-- 
-- Run this file in the Supabase SQL Editor after the main init.sql
-- =============================================================================

-- =============================================================================
-- ENUMS
-- =============================================================================

-- Account types enum
CREATE TYPE "public"."account_type" AS ENUM (
    'checking',
    'savings', 
    'investment',
    'creditcard'
);

-- Transaction types enum
CREATE TYPE "public"."transaction_type" AS ENUM (
    'income',
    'expense',
    'transfer'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- Accounts table - stores all financial accounts linked to a user
CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    type account_type NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'USD' NOT NULL,
    color text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CHECK (type != 'creditcard' OR balance <= 0), -- Credit cards can have negative balance (debt)
    CHECK (type = 'creditcard' OR balance >= 0),  -- Other accounts must have non-negative balance
    CHECK (currency ~ '^[A-Z]{3}$')
);

-- Transactions table - stores all user transactions
CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    type transaction_type NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    amount numeric(12,2) NOT NULL,
    date date NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE,
    CHECK (amount > 0)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Accounts table indexes
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts USING btree (type);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts USING btree (created_at);

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions USING btree (account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions USING btree (type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions USING btree (category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions USING btree (date);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions USING btree (user_id, date DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Triggers to automatically update the updated_at column
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable Row Level Security on new tables
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Accounts table policies
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Transactions table policies
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Grant table permissions
GRANT ALL ON TABLE public.accounts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update account balance when transactions are added/updated/deleted
CREATE OR REPLACE FUNCTION "public"."update_account_balance"() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    account_balance numeric(12,2);
BEGIN
    -- Calculate new balance based on transaction type
    IF TG_OP = 'INSERT' THEN
        -- Add transaction amount to account balance
        IF NEW.type = 'income' THEN
            UPDATE public.accounts 
            SET balance = balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.accounts 
            SET balance = balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.account_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle transaction updates (remove old amount, add new amount)
        IF OLD.type = 'income' THEN
            UPDATE public.accounts 
            SET balance = balance - OLD.amount,
                updated_at = NOW()
            WHERE id = OLD.account_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.accounts 
            SET balance = balance + OLD.amount,
                updated_at = NOW()
            WHERE id = OLD.account_id;
        END IF;
        
        IF NEW.type = 'income' THEN
            UPDATE public.accounts 
            SET balance = balance + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.account_id;
        ELSIF NEW.type = 'expense' THEN
            UPDATE public.accounts 
            SET balance = balance - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.account_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove transaction amount from account balance
        IF OLD.type = 'income' THEN
            UPDATE public.accounts 
            SET balance = balance - OLD.amount,
                updated_at = NOW()
            WHERE id = OLD.account_id;
        ELSIF OLD.type = 'expense' THEN
            UPDATE public.accounts 
            SET balance = balance + OLD.amount,
                updated_at = NOW()
            WHERE id = OLD.account_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Create triggers for automatic balance updates
CREATE TRIGGER update_account_balance_on_transaction_insert
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

CREATE TRIGGER update_account_balance_on_transaction_update
AFTER UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

CREATE TRIGGER update_account_balance_on_transaction_delete
AFTER DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();

-- Grant function permissions
GRANT ALL ON FUNCTION public.update_account_balance() TO anon, authenticated, service_role;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================
-- Your Finwise financial management tables are now ready! 
-- 
-- What was created:
-- ✅ accounts table with financial account information
-- ✅ transactions table with transaction records
-- ✅ account_type and transaction_type enums
-- ✅ Performance indexes for optimal query performance
-- ✅ Auto-update triggers for timestamps and account balances
-- ✅ Row Level Security policies for data protection
-- ✅ Automatic balance calculation when transactions change
-- 
-- =============================================================================
