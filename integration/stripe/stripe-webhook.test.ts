import { describe, it, expect, vi, beforeEach } from 'vitest';
import type Stripe from 'stripe';
import { handleWebhookEvent } from '@/lib/stripe/webhooks';
import * as subscriptionModule from '@/lib/stripe/subscription';

vi.mock('@/lib/stripe/subscription', () => ({
  syncSubscriptionToDatabase: vi.fn().mockResolvedValue(undefined),
  deleteSubscriptionFromDatabase: vi.fn().mockResolvedValue(undefined),
}));

// We only need a very small subset of the Stripe client surface for this test.
vi.mock('@/lib/stripe/config', () => {
  const retrieve = vi.fn(async (id: string) => ({
    id,
    status: 'active',
  }));

  const stripe = {
    subscriptions: {
      retrieve,
    },
    webhooks: {
      // Not used in this test – verifyWebhookSignature has its own tests.
      constructEvent: vi.fn(),
    },
  } as unknown as { subscriptions: Stripe.SubscriptionsResource };

  return {
    stripe,
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
  };
});

describe('Stripe webhook handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses invoice.payment_succeeded and syncs subscription', async () => {
    const event: Stripe.Event = {
      id: 'evt_1',
      object: 'event',
      api_version: '2024-06-20' as Stripe.Event['api_version'],
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'in_123',
          object: 'invoice',
          amount_paid: 1000,
          customer: 'cus_123',
          subscription: 'sub_123',
        } as unknown as Stripe.Invoice,
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: 'req_1', idempotency_key: null },
      type: 'invoice.payment_succeeded',
    };

    await handleWebhookEvent(event);

    const syncSubscriptionToDatabase = subscriptionModule.syncSubscriptionToDatabase as ReturnType<
      typeof vi.fn
    >;

    expect(syncSubscriptionToDatabase).toHaveBeenCalledTimes(1);
    const [subscriptionArg] = syncSubscriptionToDatabase.mock.calls[0];
    expect(subscriptionArg.id).toBe('sub_123');
  });
});
