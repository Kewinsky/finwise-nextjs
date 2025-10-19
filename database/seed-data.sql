-- =============================================================================
-- Finwise Seed Data for User: dd9e1784-ec71-49ad-a3b9-b096e0e70108
-- =============================================================================
-- This file contains sample data for testing the Finwise financial management system
-- Run this after the main migration to populate the database with realistic test data
-- =============================================================================

-- =============================================================================
-- ACCOUNTS SEED DATA
-- =============================================================================

-- Insert sample accounts for the user
INSERT INTO public.accounts (id, user_id, name, type, balance, currency, color) VALUES
-- Checking Account
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'Main Checking', 'checking', 2500.00, 'USD', '#3B82F6'),

-- Savings Account
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'Emergency Savings', 'savings', 8500.00, 'USD', '#10B981'),

-- Investment Account
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'Investment Portfolio', 'investment', 15000.00, 'USD', '#8B5CF6'),

-- Credit Card
('d4e5f6a7-b8c9-0123-defa-456789012345', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'Credit Card', 'creditcard', -1200.00, 'USD', '#EF4444');

-- =============================================================================
-- TRANSACTIONS SEED DATA
-- =============================================================================

-- Income Transactions
INSERT INTO public.transactions (id, user_id, account_id, type, description, category, amount, date, notes) VALUES
-- Salary payments
('1a2b3c4d-5e6f-7890-abcd-ef1234567890', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Monthly Salary', 'Salary', 4500.00, '2024-01-01', 'Regular monthly salary'),
('2b3c4d5e-6f7a-8901-bcde-f23456789012', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Monthly Salary', 'Salary', 4500.00, '2024-02-01', 'Regular monthly salary'),
('3c4d5e6f-7a8b-9012-cdef-345678901234', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Monthly Salary', 'Salary', 4500.00, '2024-03-01', 'Regular monthly salary'),

-- Freelance income
('4d5e6f7a-8b9c-0123-defa-456789012345', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Freelance Project', 'Freelance', 1200.00, '2024-01-15', 'Web development project'),
('5e6f7a8b-9c0d-1234-efab-567890123456', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Freelance Project', 'Freelance', 800.00, '2024-02-20', 'Consulting work');

-- Expense Transactions
INSERT INTO public.transactions (id, user_id, account_id, type, description, category, amount, date, notes) VALUES
-- Housing expenses
('6f7a8b9c-0d1e-2345-fabc-678901234567', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Rent Payment', 'Bills & Utilities', 1200.00, '2024-01-01', 'Monthly rent'),
('7a8b9c0d-1e2f-3456-abcd-789012345678', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Rent Payment', 'Bills & Utilities', 1200.00, '2024-02-01', 'Monthly rent'),
('8b9c0d1e-2f3a-4567-bcde-890123456789', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Rent Payment', 'Bills & Utilities', 1200.00, '2024-03-01', 'Monthly rent'),

-- Utilities
('9c0d1e2f-3a4b-5678-cdef-901234567890', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Electricity Bill', 'Bills & Utilities', 85.50, '2024-01-05', 'Monthly electricity'),
('0d1e2f3a-4b5c-6789-defa-012345678901', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Internet Bill', 'Bills & Utilities', 65.00, '2024-01-10', 'Monthly internet'),
('1e2f3a4b-5c6d-7890-efab-123456789012', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Phone Bill', 'Bills & Utilities', 45.00, '2024-01-15', 'Monthly phone'),

-- Food & Dining
('2f3a4b5c-6d7e-8901-fabc-234567890123', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Grocery Shopping', 'Food & Dining', 120.75, '2024-01-03', 'Weekly groceries'),
('3a4b5c6d-7e8f-9012-abcd-345678901234', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Restaurant Dinner', 'Food & Dining', 45.80, '2024-01-08', 'Date night dinner'),
('4b5c6d7e-8f9a-0123-bcde-456789012345', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Coffee Shop', 'Food & Dining', 12.50, '2024-01-12', 'Morning coffee'),
('5c6d7e8f-9a0b-1234-cdef-567890123456', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Grocery Shopping', 'Food & Dining', 95.30, '2024-01-17', 'Weekly groceries'),

-- Transportation
('6d7e8f9a-0b1c-2345-defa-678901234567', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Gas Station', 'Transportation', 45.00, '2024-01-04', 'Car fuel'),
('7e8f9a0b-1c2d-3456-efab-789012345678', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Uber Ride', 'Transportation', 18.50, '2024-01-14', 'Airport ride'),
('8f9a0b1c-2d3e-4567-fabc-890123456789', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Gas Station', 'Transportation', 42.75, '2024-01-20', 'Car fuel'),

-- Shopping
('9a0b1c2d-3e4f-5678-abcd-901234567890', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Amazon Purchase', 'Shopping', 89.99, '2024-01-06', 'Office supplies'),
('0b1c2d3e-4f5a-6789-bcde-012345678901', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Clothing Store', 'Shopping', 125.00, '2024-01-11', 'New winter jacket'),
('1c2d3e4f-5a6b-7890-cdef-123456789012', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Electronics Store', 'Shopping', 299.99, '2024-01-18', 'New headphones'),

-- Entertainment
('2d3e4f5a-6b7c-8901-defa-234567890123', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Movie Theater', 'Entertainment', 25.00, '2024-01-07', 'Weekend movie'),
('3e4f5a6b-7c8d-9012-efab-345678901234', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Netflix Subscription', 'Entertainment', 15.99, '2024-01-13', 'Monthly subscription'),
('4f5a6b7c-8d9e-0123-fabc-456789012345', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Concert Tickets', 'Entertainment', 85.00, '2024-01-19', 'Music concert'),

-- Healthcare
('5a6b7c8d-9e0f-1234-abcd-567890123456', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Doctor Visit', 'Healthcare', 150.00, '2024-01-09', 'Annual checkup'),
('6b7c8d9e-0f1a-2345-bcde-678901234567', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Pharmacy', 'Healthcare', 35.50, '2024-01-16', 'Prescription medication'),

-- Transfer to Savings
('7c8d9e0f-1a2b-3456-cdef-789012345678', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'transfer', 'Transfer to Savings', 'Transfer', 500.00, '2024-01-25', 'Monthly savings transfer'),
('8d9e0f1a-2b3c-4567-defa-890123456789', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'transfer', 'Transfer from Checking', 'Transfer', 500.00, '2024-01-25', 'Monthly savings transfer'),

-- Investment Contribution
('9e0f1a2b-3c4d-5678-efab-901234567890', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'transfer', 'Investment Contribution', 'Transfer', 1000.00, '2024-01-30', 'Monthly investment'),
('0f1a2b3c-4d5e-6789-fabc-012345678901', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'transfer', 'Investment from Checking', 'Transfer', 1000.00, '2024-01-30', 'Monthly investment'),

-- Credit Card Payments
('1a2b3c4d-5e6f-7890-abcd-ef1234567891', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'transfer', 'Credit Card Payment', 'Transfer', 300.00, '2024-01-28', 'Monthly credit card payment'),
('2b3c4d5e-6f7a-8901-bcde-f23456789013', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'transfer', 'Payment from Checking', 'Transfer', 300.00, '2024-01-28', 'Monthly credit card payment');

-- =============================================================================
-- ADDITIONAL TRANSACTIONS FOR FEBRUARY AND MARCH
-- =============================================================================

-- February Transactions
INSERT INTO public.transactions (id, user_id, account_id, type, description, category, amount, date, notes) VALUES
-- Income
('3c4d5e6f-7a8b-9012-cdef-345678901235', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Monthly Salary', 'Salary', 4500.00, '2024-02-01', 'Regular monthly salary'),
('4d5e6f7a-8b9c-0123-defa-456789012346', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Freelance Project', 'Freelance', 950.00, '2024-02-10', 'Mobile app development'),

-- Major Expenses
('5e6f7a8b-9c0d-1234-efab-567890123457', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Rent Payment', 'Bills & Utilities', 1200.00, '2024-02-01', 'Monthly rent'),
('6f7a8b9c-0d1e-2345-fabc-678901234568', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Car Insurance', 'Bills & Utilities', 180.00, '2024-02-05', 'Quarterly car insurance'),
('7a8b9c0d-1e2f-3456-abcd-789012345679', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Grocery Shopping', 'Food & Dining', 135.25, '2024-02-03', 'Weekly groceries'),
('8b9c0d1e-2f3a-4567-bcde-890123456780', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Restaurant Dinner', 'Food & Dining', 68.90, '2024-02-14', 'Valentine\'s Day dinner'),
('9c0d1e2f-3a4b-5678-cdef-901234567891', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Gas Station', 'Transportation', 48.50, '2024-02-08', 'Car fuel'),
('0d1e2f3a-4b5c-6789-defa-012345678902', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Online Shopping', 'Shopping', 156.75, '2024-02-12', 'Books and electronics'),

-- Transfers
('1e2f3a4b-5c6d-7890-efab-123456789013', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'transfer', 'Transfer to Savings', 'Transfer', 500.00, '2024-02-25', 'Monthly savings transfer'),
('2f3a4b5c-6d7e-8901-fabc-234567890124', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'transfer', 'Transfer from Checking', 'Transfer', 500.00, '2024-02-25', 'Monthly savings transfer');

-- March Transactions
INSERT INTO public.transactions (id, user_id, account_id, type, description, category, amount, date, notes) VALUES
-- Income
('3a4b5c6d-7e8f-9012-abcd-345678901235', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Monthly Salary', 'Salary', 4500.00, '2024-03-01', 'Regular monthly salary'),
('4b5c6d7e-8f9a-0123-bcde-456789012346', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'income', 'Freelance Project', 'Freelance', 1500.00, '2024-03-15', 'Website redesign project'),

-- Expenses
('5c6d7e8f-9a0b-1234-cdef-567890123457', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Rent Payment', 'Bills & Utilities', 1200.00, '2024-03-01', 'Monthly rent'),
('6d7e8f9a-0b1c-2345-defa-678901234568', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Grocery Shopping', 'Food & Dining', 142.80, '2024-03-05', 'Weekly groceries'),
('7e8f9a0b-1c2d-3456-efab-789012345679', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Spring Shopping', 'Shopping', 89.99, '2024-03-10', 'New spring clothes'),
('8f9a0b1c-2d3e-4567-fabc-890123456780', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'expense', 'Gas Station', 'Transportation', 52.25, '2024-03-12', 'Car fuel'),

-- Transfers
('9a0b1c2d-3e4f-5678-abcd-901234567891', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'transfer', 'Transfer to Savings', 'Transfer', 500.00, '2024-03-25', 'Monthly savings transfer'),
('0b1c2d3e-4f5a-6789-bcde-012345678902', 'dd9e1784-ec71-49ad-a3b9-b096e0e70108', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'transfer', 'Transfer from Checking', 'Transfer', 500.00, '2024-03-25', 'Monthly savings transfer');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check account balances
SELECT 
    a.name as account_name,
    a.type as account_type,
    a.balance,
    a.currency
FROM public.accounts a
WHERE a.user_id = 'dd9e1784-ec71-49ad-a3b9-b096e0e70108'
ORDER BY a.type, a.name;

-- Check transaction summary
SELECT 
    t.type,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount
FROM public.transactions t
WHERE t.user_id = 'dd9e1784-ec71-49ad-a3b9-b096e0e70108'
GROUP BY t.type
ORDER BY t.type;

-- Check monthly spending by category
SELECT 
    t.category,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    ROUND(AVG(t.amount), 2) as avg_amount
FROM public.transactions t
WHERE t.user_id = 'dd9e1784-ec71-49ad-a3b9-b096e0e70108'
    AND t.type = 'expense'
GROUP BY t.category
ORDER BY total_amount DESC;

-- Check recent transactions
SELECT 
    t.date,
    t.description,
    t.category,
    t.amount,
    t.type,
    a.name as account_name
FROM public.transactions t
JOIN public.accounts a ON t.account_id = a.id
WHERE t.user_id = 'dd9e1784-ec71-49ad-a3b9-b096e0e70108'
ORDER BY t.date DESC, t.created_at DESC
LIMIT 10;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This seed data provides:
-- ✅ 4 different account types (checking, savings, investment, credit card)
-- ✅ 30+ transactions across 3 months
-- ✅ Realistic spending patterns and categories
-- ✅ Income from salary and freelance work
-- ✅ Regular transfers to savings and investments
-- ✅ Credit card payments and balances
-- ✅ Various expense categories (food, transportation, shopping, etc.)
-- ✅ Proper account balance calculations via triggers
-- 
-- The data represents a realistic financial profile for testing:
-- - Monthly income: ~$4,500 salary + variable freelance
-- - Monthly expenses: ~$2,000-2,500
-- - Savings rate: ~10-15% of income
-- - Investment contributions: ~$1,000/month
-- - Credit card debt: ~$1,200 (being paid down)
-- =============================================================================
