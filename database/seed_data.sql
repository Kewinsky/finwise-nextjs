-- =============================================================================
-- Seed Data for Finwise - Sample Transactions and Accounts
-- =============================================================================
-- This file contains sample data for testing and development purposes.
-- 
-- IMPORTANT: Replace 'user_id' with the actual UUID of the user you want to seed.
-- 
-- Usage:
-- 1. Replace 'user_id' with your actual user UUID
-- 2. Run this file in the Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- ACCOUNTS
-- =============================================================================
-- Note: One mandatory account (Main Account) is already created automatically
-- We'll add 3 additional accounts here

-- Get the mandatory account ID (assuming it exists)
DO $$
DECLARE
    v_user_id uuid := '05b0159d-b030-4712-92bb-09e40701c67c'; -- REPLACE THIS WITH ACTUAL USER ID
    v_main_account_id uuid;
    v_savings_account_id uuid;
    v_investment_account_id uuid;
    v_credit_account_id uuid;
BEGIN
    -- Get the mandatory account ID
    SELECT id INTO v_main_account_id
    FROM public.accounts
    WHERE user_id = v_user_id AND is_mandatory = true
    LIMIT 1;

    -- Create Savings Account
    INSERT INTO public.accounts (user_id, name, type, balance, color, is_mandatory)
    VALUES (
        v_user_id,
        'Savings Account',
        'savings',
        5000.00,
        '#10B981', -- Green
        false
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_savings_account_id;

    -- Create Investment Account
    INSERT INTO public.accounts (user_id, name, type, balance, color, is_mandatory)
    VALUES (
        v_user_id,
        'Investment Portfolio',
        'investment',
        15000.00,
        '#8B5CF6', -- Purple
        false
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_investment_account_id;

    -- Create Credit Card Account
    INSERT INTO public.accounts (user_id, name, type, balance, color, is_mandatory)
    VALUES (
        v_user_id,
        'Credit Card',
        'creditcard',
        0.00,
        '#EF4444', -- Red
        false
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_credit_account_id;

    -- Get account IDs if they already exist
    IF v_savings_account_id IS NULL THEN
        SELECT id INTO v_savings_account_id
        FROM public.accounts
        WHERE user_id = v_user_id AND name = 'Savings Account'
        LIMIT 1;
    END IF;

    IF v_investment_account_id IS NULL THEN
        SELECT id INTO v_investment_account_id
        FROM public.accounts
        WHERE user_id = v_user_id AND name = 'Investment Portfolio'
        LIMIT 1;
    END IF;

    IF v_credit_account_id IS NULL THEN
        SELECT id INTO v_credit_account_id
        FROM public.accounts
        WHERE user_id = v_user_id AND name = 'Credit Card'
        LIMIT 1;
    END IF;

    -- =============================================================================
    -- TRANSACTIONS FOR 2025
    -- =============================================================================
    -- We'll create approximately 10 transactions per month for each type
    -- (income, expense, transfer) distributed throughout the year

    -- JANUARY 2025
    -- Income transactions
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-01-01', 'January salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Project Payment', 'freelance', 1200.00, '2025-01-05', 'Web development project'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Dividend Payment', 'investment', 150.00, '2025-01-10', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Design Work', 'freelance', 800.00, '2025-01-15', 'Logo design project'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift from Family', 'gift', 200.00, '2025-01-20', 'Birthday gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Consulting', 'business', 2500.00, '2025-01-22', 'Q1 consulting fee'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Stock Dividend', 'investment', 75.00, '2025-01-25', 'Monthly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Writing', 'freelance', 600.00, '2025-01-28', 'Article writing'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Side Business Income', 'business', 1800.00, '2025-01-30', 'E-commerce sales');

    -- Expense transactions
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Shopping', 'food', 120.50, '2025-01-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant Dinner', 'food', 85.00, '2025-01-04', 'Dinner with friends'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gas Station', 'transport', 45.00, '2025-01-06', 'Fuel for car'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electricity Bill', 'utilities', 120.00, '2025-01-08', 'Monthly utility'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Netflix Subscription', 'entertainment', 15.99, '2025-01-10', 'Monthly subscription'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pharmacy Purchase', 'healthcare', 35.50, '2025-01-12', 'Prescription medication'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Online Shopping', 'shopping', 250.00, '2025-01-14', 'Clothing purchase'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee Shop', 'food', 12.50, '2025-01-16', 'Morning coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Uber Ride', 'transport', 28.00, '2025-01-18', 'Airport ride'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gym Membership', 'healthcare', 50.00, '2025-01-20', 'Monthly membership');

    -- Transfer transactions
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings Transfer', 'transfer', 1000.00, '2025-01-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-01-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 300.00, '2025-01-25', 'Pay off balance');

    -- FEBRUARY 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-02-01', 'February salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Development', 'freelance', 1500.00, '2025-02-05', 'Mobile app development'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Returns', 'investment', 200.00, '2025-02-10', 'Portfolio gains'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Photography', 'freelance', 900.00, '2025-02-12', 'Event photography'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Revenue', 'business', 3200.00, '2025-02-18', 'Monthly business income'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Translation', 'freelance', 700.00, '2025-02-20', 'Document translation'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Bond Interest', 'investment', 100.00, '2025-02-22', 'Quarterly interest'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Money', 'gift', 150.00, '2025-02-25', 'Gift from friend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Consulting Fee', 'business', 1800.00, '2025-02-27', 'Business consulting');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Supermarket Shopping', 'food', 135.75, '2025-02-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Lunch Meeting', 'food', 45.00, '2025-02-04', 'Business lunch'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Maintenance', 'transport', 350.00, '2025-02-06', 'Oil change and service'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Internet Bill', 'utilities', 60.00, '2025-02-08', 'Monthly internet'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Movie Tickets', 'entertainment', 32.00, '2025-02-10', 'Cinema tickets'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Doctor Visit', 'healthcare', 120.00, '2025-02-12', 'Annual checkup'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electronics Purchase', 'shopping', 450.00, '2025-02-14', 'New headphones'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant', 'food', 95.00, '2025-02-16', 'Dinner date'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Public Transport', 'transport', 25.00, '2025-02-18', 'Monthly pass'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Online Course', 'education', 199.00, '2025-02-20', 'Programming course');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings', 'transfer', 1000.00, '2025-02-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Deposit', 'transfer', 500.00, '2025-02-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 450.00, '2025-02-25', 'Pay off balance');

    -- MARCH 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-03-01', 'March salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Web Design', 'freelance', 1800.00, '2025-03-05', 'Website redesign'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Stock Dividend', 'investment', 175.00, '2025-03-10', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Content Writing', 'freelance', 650.00, '2025-03-12', 'Blog posts'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 2800.00, '2025-03-18', 'Client payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Consulting', 'freelance', 1100.00, '2025-03-20', 'Tech consulting'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Gains', 'investment', 125.00, '2025-03-22', 'Portfolio performance'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Received', 'gift', 100.00, '2025-03-25', 'Birthday gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Side Business', 'business', 2200.00, '2025-03-28', 'E-commerce revenue');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Store', 'food', 140.00, '2025-03-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Fast Food', 'food', 22.50, '2025-03-04', 'Quick lunch'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Taxi Ride', 'transport', 35.00, '2025-03-06', 'Airport taxi'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Water Bill', 'utilities', 45.00, '2025-03-08', 'Monthly water bill'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Spotify Premium', 'entertainment', 9.99, '2025-03-10', 'Music subscription'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pharmacy', 'healthcare', 28.00, '2025-03-12', 'Medicine purchase'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Furniture Purchase', 'shopping', 650.00, '2025-03-14', 'New desk chair'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee', 'food', 8.50, '2025-03-16', 'Morning coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Train Ticket', 'transport', 45.00, '2025-03-18', 'Weekend trip'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Hotel Booking', 'travel', 180.00, '2025-03-20', 'Weekend getaway');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Savings Transfer', 'transfer', 1000.00, '2025-03-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-03-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 650.00, '2025-03-25', 'Pay off balance');

    -- APRIL 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-04-01', 'April salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Project', 'freelance', 2000.00, '2025-04-05', 'Full-stack development'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Dividend Payment', 'investment', 150.00, '2025-04-10', 'Monthly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Design', 'freelance', 950.00, '2025-04-12', 'Brand identity'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Income', 'business', 3500.00, '2025-04-18', 'Monthly revenue'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Writing', 'freelance', 750.00, '2025-04-20', 'Technical writing'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Returns', 'investment', 200.00, '2025-04-22', 'Portfolio gains'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Money', 'gift', 250.00, '2025-04-25', 'Wedding gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Consulting Revenue', 'business', 2400.00, '2025-04-28', 'Business consulting');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Shopping', 'food', 125.00, '2025-04-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant', 'food', 110.00, '2025-04-04', 'Dinner with family'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Insurance', 'transport', 180.00, '2025-04-06', 'Monthly insurance'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gas Bill', 'utilities', 85.00, '2025-04-08', 'Monthly gas bill'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Concert Tickets', 'entertainment', 150.00, '2025-04-10', 'Music concert'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Dental Checkup', 'healthcare', 200.00, '2025-04-12', 'Dental appointment'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Clothing Store', 'shopping', 320.00, '2025-04-14', 'Spring clothing'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Lunch', 'food', 35.00, '2025-04-16', 'Business lunch'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Bus Pass', 'transport', 50.00, '2025-04-18', 'Monthly pass'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Flight Ticket', 'travel', 450.00, '2025-04-20', 'Business trip');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings', 'transfer', 1000.00, '2025-04-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Deposit', 'transfer', 500.00, '2025-04-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 500.00, '2025-04-25', 'Pay off balance');

    -- MAY 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-05-01', 'May salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Development', 'freelance', 1600.00, '2025-05-05', 'API development'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Stock Dividend', 'investment', 175.00, '2025-05-10', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Photography', 'freelance', 850.00, '2025-05-12', 'Product photography'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 2900.00, '2025-05-18', 'Client invoice'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Translation', 'freelance', 680.00, '2025-05-20', 'Document translation'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Bond Interest', 'investment', 100.00, '2025-05-22', 'Quarterly interest'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Received', 'gift', 180.00, '2025-05-25', 'Anniversary gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Side Business', 'business', 2100.00, '2025-05-28', 'E-commerce sales');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Supermarket', 'food', 130.00, '2025-05-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pizza Delivery', 'food', 42.00, '2025-05-04', 'Friday night pizza'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Repair', 'transport', 420.00, '2025-05-06', 'Brake repair'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electricity Bill', 'utilities', 115.00, '2025-05-08', 'Monthly utility'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Streaming Service', 'entertainment', 14.99, '2025-05-10', 'Video streaming'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pharmacy', 'healthcare', 42.00, '2025-05-12', 'Prescription refill'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electronics', 'shopping', 380.00, '2025-05-14', 'New keyboard'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee Shop', 'food', 15.00, '2025-05-16', 'Morning coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Parking Fee', 'transport', 12.00, '2025-05-18', 'City parking'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Online Course', 'education', 149.00, '2025-05-20', 'Data science course');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Savings Transfer', 'transfer', 1000.00, '2025-05-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-05-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 800.00, '2025-05-25', 'Pay off balance');

    -- JUNE 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-06-01', 'June salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Web Design', 'freelance', 1900.00, '2025-06-05', 'E-commerce site'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Returns', 'investment', 225.00, '2025-06-10', 'Portfolio gains'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Content', 'freelance', 720.00, '2025-06-12', 'Content creation'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Revenue', 'business', 3100.00, '2025-06-18', 'Monthly income'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Consulting', 'freelance', 1300.00, '2025-06-20', 'Tech consulting'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Dividend Payment', 'investment', 150.00, '2025-06-22', 'Monthly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Money', 'gift', 120.00, '2025-06-25', 'Graduation gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 2600.00, '2025-06-28', 'Client payment');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Store', 'food', 135.00, '2025-06-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant', 'food', 95.00, '2025-06-04', 'Dinner out'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gas Station', 'transport', 48.00, '2025-06-06', 'Fuel'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Internet Bill', 'utilities', 60.00, '2025-06-08', 'Monthly internet'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Theater Tickets', 'entertainment', 85.00, '2025-06-10', 'Play tickets'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Doctor Visit', 'healthcare', 150.00, '2025-06-12', 'Specialist appointment'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Home Decor', 'shopping', 280.00, '2025-06-14', 'Furniture items'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Lunch', 'food', 28.00, '2025-06-16', 'Work lunch'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Train Ticket', 'transport', 55.00, '2025-06-18', 'Weekend trip'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Vacation Hotel', 'travel', 320.00, '2025-06-20', 'Summer vacation');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings', 'transfer', 1000.00, '2025-06-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Deposit', 'transfer', 500.00, '2025-06-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 360.00, '2025-06-25', 'Pay off balance');

    -- JULY 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-07-01', 'July salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Project', 'freelance', 2100.00, '2025-07-05', 'Mobile app'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Stock Dividend', 'investment', 175.00, '2025-07-10', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Design', 'freelance', 1000.00, '2025-07-12', 'UI/UX design'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Income', 'business', 3300.00, '2025-07-18', 'Monthly revenue'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Writing', 'freelance', 780.00, '2025-07-20', 'Technical articles'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Gains', 'investment', 250.00, '2025-07-22', 'Portfolio performance'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Received', 'gift', 200.00, '2025-07-25', 'Birthday gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Consulting Fee', 'business', 2700.00, '2025-07-28', 'Business consulting');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Shopping', 'food', 140.00, '2025-07-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Fast Food', 'food', 25.00, '2025-07-04', 'Quick meal'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Service', 'transport', 280.00, '2025-07-06', 'Regular maintenance'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Water Bill', 'utilities', 50.00, '2025-07-08', 'Monthly water'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Movie Night', 'entertainment', 45.00, '2025-07-10', 'Cinema tickets'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pharmacy', 'healthcare', 38.00, '2025-07-12', 'Medicine'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electronics', 'shopping', 520.00, '2025-07-14', 'New monitor'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee', 'food', 10.00, '2025-07-16', 'Morning coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Uber', 'transport', 32.00, '2025-07-18', 'Ride home'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Flight', 'travel', 580.00, '2025-07-20', 'Business trip flight');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Savings Transfer', 'transfer', 1000.00, '2025-07-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-07-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 800.00, '2025-07-25', 'Pay off balance');

    -- AUGUST 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-08-01', 'August salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Development', 'freelance', 1700.00, '2025-08-05', 'Backend development'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Dividend Payment', 'investment', 150.00, '2025-08-10', 'Monthly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Photography', 'freelance', 920.00, '2025-08-12', 'Event coverage'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 3000.00, '2025-08-18', 'Client invoice'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Translation', 'freelance', 650.00, '2025-08-20', 'Document translation'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Bond Interest', 'investment', 100.00, '2025-08-22', 'Quarterly interest'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Money', 'gift', 160.00, '2025-08-25', 'Gift from family'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Side Business', 'business', 2400.00, '2025-08-28', 'E-commerce revenue');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Supermarket', 'food', 125.00, '2025-08-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant', 'food', 105.00, '2025-08-04', 'Dinner'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Insurance', 'transport', 180.00, '2025-08-06', 'Monthly insurance'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gas Bill', 'utilities', 90.00, '2025-08-08', 'Monthly gas'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Concert', 'entertainment', 120.00, '2025-08-10', 'Music festival'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Dental', 'healthcare', 180.00, '2025-08-12', 'Cleaning'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Clothing', 'shopping', 290.00, '2025-08-14', 'Summer clothes'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Lunch', 'food', 40.00, '2025-08-16', 'Business lunch'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Public Transport', 'transport', 30.00, '2025-08-18', 'Monthly pass'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Hotel', 'travel', 250.00, '2025-08-20', 'Weekend trip');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings', 'transfer', 1000.00, '2025-08-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Deposit', 'transfer', 500.00, '2025-08-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 470.00, '2025-08-25', 'Pay off balance');

    -- SEPTEMBER 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-09-01', 'September salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Web Design', 'freelance', 1950.00, '2025-09-05', 'Landing page'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Returns', 'investment', 200.00, '2025-09-10', 'Portfolio gains'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Content', 'freelance', 750.00, '2025-09-12', 'Content writing'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Revenue', 'business', 3200.00, '2025-09-18', 'Monthly income'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Consulting', 'freelance', 1400.00, '2025-09-20', 'Tech consulting'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Stock Dividend', 'investment', 175.00, '2025-09-22', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Received', 'gift', 140.00, '2025-09-25', 'Gift from friend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 2500.00, '2025-09-28', 'Client payment');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Store', 'food', 130.00, '2025-09-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pizza', 'food', 38.00, '2025-09-04', 'Friday pizza'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gas Station', 'transport', 50.00, '2025-09-06', 'Fuel'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electricity Bill', 'utilities', 125.00, '2025-09-08', 'Monthly utility'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Streaming', 'entertainment', 12.99, '2025-09-10', 'Video service'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pharmacy', 'healthcare', 45.00, '2025-09-12', 'Prescription'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electronics', 'shopping', 420.00, '2025-09-14', 'New mouse'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee Shop', 'food', 12.00, '2025-09-16', 'Morning coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Parking', 'transport', 15.00, '2025-09-18', 'City parking'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Online Course', 'education', 179.00, '2025-09-20', 'Programming course');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Savings Transfer', 'transfer', 1000.00, '2025-09-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-09-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 470.00, '2025-09-25', 'Pay off balance');

    -- OCTOBER 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-10-01', 'October salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Project', 'freelance', 2200.00, '2025-10-05', 'Full-stack app'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Dividend Payment', 'investment', 150.00, '2025-10-10', 'Monthly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Design', 'freelance', 1050.00, '2025-10-12', 'Brand design'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Income', 'business', 3400.00, '2025-10-18', 'Monthly revenue'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Writing', 'freelance', 820.00, '2025-10-20', 'Article writing'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Gains', 'investment', 275.00, '2025-10-22', 'Portfolio performance'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Money', 'gift', 220.00, '2025-10-25', 'Wedding gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Consulting Fee', 'business', 2800.00, '2025-10-28', 'Business consulting');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Shopping', 'food', 145.00, '2025-10-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant', 'food', 115.00, '2025-10-04', 'Dinner'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Maintenance', 'transport', 380.00, '2025-10-06', 'Tire replacement'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Internet Bill', 'utilities', 60.00, '2025-10-08', 'Monthly internet'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Theater', 'entertainment', 95.00, '2025-10-10', 'Play tickets'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Doctor Visit', 'healthcare', 160.00, '2025-10-12', 'Checkup'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Furniture', 'shopping', 550.00, '2025-10-14', 'Office desk'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Lunch', 'food', 32.00, '2025-10-16', 'Work lunch'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Train Ticket', 'transport', 60.00, '2025-10-18', 'Weekend trip'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Vacation', 'travel', 680.00, '2025-10-20', 'Fall vacation');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings', 'transfer', 1000.00, '2025-10-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Deposit', 'transfer', 500.00, '2025-10-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 930.00, '2025-10-25', 'Pay off balance');

    -- NOVEMBER 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-11-01', 'November salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Development', 'freelance', 1800.00, '2025-11-05', 'API integration'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Stock Dividend', 'investment', 175.00, '2025-11-10', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Photography', 'freelance', 980.00, '2025-11-12', 'Portrait session'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 3100.00, '2025-11-18', 'Client invoice'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Translation', 'freelance', 700.00, '2025-11-20', 'Document translation'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Bond Interest', 'investment', 100.00, '2025-11-22', 'Quarterly interest'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Received', 'gift', 190.00, '2025-11-25', 'Holiday gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Side Business', 'business', 2300.00, '2025-11-28', 'E-commerce sales');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Supermarket', 'food', 150.00, '2025-11-02', 'Weekly groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Fast Food', 'food', 28.00, '2025-11-04', 'Quick meal'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Insurance', 'transport', 180.00, '2025-11-06', 'Monthly insurance'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Gas Bill', 'utilities', 95.00, '2025-11-08', 'Monthly gas'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Concert', 'entertainment', 140.00, '2025-11-10', 'Music concert'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Dental', 'healthcare', 220.00, '2025-11-12', 'Dental work'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Clothing', 'shopping', 380.00, '2025-11-14', 'Winter clothes'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee', 'food', 14.00, '2025-11-16', 'Morning coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Public Transport', 'transport', 35.00, '2025-11-18', 'Monthly pass'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Hotel Booking', 'travel', 290.00, '2025-11-20', 'Weekend trip');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Savings Transfer', 'transfer', 1000.00, '2025-11-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-11-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 560.00, '2025-11-25', 'Pay off balance');

    -- DECEMBER 2025
    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, NULL, v_main_account_id, 'income', 'Monthly Salary', 'salary', 5000.00, '2025-12-01', 'December salary payment'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Web Design', 'freelance', 2000.00, '2025-12-05', 'Website redesign'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Investment Returns', 'investment', 300.00, '2025-12-10', 'Year-end gains'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Content', 'freelance', 800.00, '2025-12-12', 'Content creation'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Revenue', 'business', 3600.00, '2025-12-18', 'Year-end revenue'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Freelance Consulting', 'freelance', 1500.00, '2025-12-20', 'Tech consulting'),
    (v_user_id, NULL, v_investment_account_id, 'income', 'Dividend Payment', 'investment', 175.00, '2025-12-22', 'Quarterly dividend'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Gift Money', 'gift', 300.00, '2025-12-25', 'Christmas gift'),
    (v_user_id, NULL, v_main_account_id, 'income', 'Business Payment', 'business', 2900.00, '2025-12-28', 'Year-end payment');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, NULL, 'expense', 'Grocery Store', 'food', 180.00, '2025-12-02', 'Holiday groceries'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Restaurant', 'food', 150.00, '2025-12-04', 'Holiday dinner'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Car Service', 'transport', 320.00, '2025-12-06', 'Winter service'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Electricity Bill', 'utilities', 140.00, '2025-12-08', 'Monthly utility'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Holiday Event', 'entertainment', 200.00, '2025-12-10', 'Christmas event'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Pharmacy', 'healthcare', 50.00, '2025-12-12', 'Medicine'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Holiday Shopping', 'shopping', 450.00, '2025-12-14', 'Christmas gifts'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Coffee Shop', 'food', 18.00, '2025-12-16', 'Holiday coffee'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Uber', 'transport', 40.00, '2025-12-18', 'Holiday ride'),
    (v_user_id, v_main_account_id, NULL, 'expense', 'Holiday Travel', 'travel', 750.00, '2025-12-20', 'Christmas vacation');

    INSERT INTO public.transactions (user_id, from_account_id, to_account_id, type, description, category, amount, date, notes) VALUES
    (v_user_id, v_main_account_id, v_savings_account_id, 'transfer', 'Monthly Savings', 'transfer', 1000.00, '2025-12-01', 'Regular savings'),
    (v_user_id, v_main_account_id, v_investment_account_id, 'transfer', 'Investment Contribution', 'transfer', 500.00, '2025-12-15', 'Monthly investment'),
    (v_user_id, v_main_account_id, v_credit_account_id, 'transfer', 'Credit Card Payment', 'transfer', 770.00, '2025-12-25', 'Pay off balance');

END $$;

-- =============================================================================
-- SEED DATA COMPLETE
-- =============================================================================
-- Summary:
-- ✅ 3 additional accounts created (Savings, Investment, Credit Card)
-- ✅ ~10 income transactions per month (12 months = ~108 income transactions)
-- ✅ ~10 expense transactions per month (12 months = ~108 expense transactions)
-- ✅ ~3 transfer transactions per month (12 months = ~36 transfer transactions)
-- ✅ All transactions use categories from TRANSACTION_CATEGORIES
-- ✅ Transactions distributed throughout 2025
-- 
-- Next steps:
-- 1. Replace 'user_id' with actual user UUID
-- 2. Run this file in Supabase SQL Editor
-- =============================================================================

