import { describe, it, expect } from 'vitest';
import { createServiceClient } from '@/utils/supabase/server';

// NOTE:
// These are true integration tests that talk to a real Supabase instance.
// They are skipped automatically unless the required environment variables
// are present and point to a test database:
// - NEXT_PUBLIC_SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY

const hasSupabaseEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(!hasSupabaseEnv)('Supabase transactions integration (requires test DB)', () => {
  it('inserts and reads a transaction for a user (RLS via user_id)', async () => {
    const supabase = await createServiceClient();

    // Create an isolated test user & accounts directly via service client
    const userId = crypto.randomUUID();

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: `test-${userId}@example.com`,
    });
    expect(profileError).toBeNull();

    const { data: accountInsert, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name: 'Test Account',
        type: 'checking',
        balance: 0,
      })
      .select('id')
      .single();
    expect(accountError).toBeNull();

    const accountId = accountInsert!.id as string;

    const { data: txInsert, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'income',
        description: 'Integration test income',
        category: 'salary',
        amount: 100,
        date: '2025-01-01',
        to_account_id: accountId,
      })
      .select('id, amount, type, user_id')
      .single();

    expect(txError).toBeNull();
    expect(txInsert!.user_id).toBe(userId);
    expect(txInsert!.amount).toBe(100);
  });
});
