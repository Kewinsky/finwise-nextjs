import { stripe, STRIPE_WEBHOOK_SECRET } from './config';
import { syncSubscriptionToDatabase, deleteSubscriptionFromDatabase } from './subscription';
import { log } from '@/lib/logger';
import type Stripe from 'stripe';

/**
 * Handle subscription events that require database sync
 */
async function handleSubscriptionEvent(
  eventType: string,
  subscription: Stripe.Subscription,
  startTime: number,
): Promise<void> {
  try {
    await syncSubscriptionToDatabase(subscription);

    log.info(
      {
        subscriptionId: subscription.id,
        status: subscription.status,
        customerId: subscription.customer,
        eventType,
        duration: `${Date.now() - startTime}ms`,
      },
      'Subscription synced successfully',
    );
  } catch (error) {
    log.error(
      {
        subscriptionId: subscription.id,
        eventType,
        error: error instanceof Error ? error.message : String(error),
        duration: `${Date.now() - startTime}ms`,
      },
      'Failed to sync subscription',
    );
    throw error; // Re-throw to trigger webhook retry
  }
}

export async function handleWebhookEvent(event: Stripe.Event) {
  const startTime = Date.now();

  try {
    log.info(
      {
        eventType: event.type,
        eventId: event.id,
        created: event.created,
      },
      'Processing webhook event',
    );

    // Handle subscription events that require database sync
    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.trial_will_end',
      'customer.subscription.paused',
      'customer.subscription.resumed',
    ];

    if (subscriptionEvents.includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(event.type, subscription, startTime);
      return;
    }

    switch (event.type) {
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        try {
          await deleteSubscriptionFromDatabase(subscription.id);

          log.info(
            {
              subscriptionId: subscription.id,
              customerId: subscription.customer,
              duration: `${Date.now() - startTime}ms`,
            },
            'Subscription deleted successfully',
          );
        } catch (error) {
          log.error(
            {
              subscriptionId: subscription.id,
              eventId: event.id,
              error: error instanceof Error ? error.message : String(error),
              duration: `${Date.now() - startTime}ms`,
            },
            'Failed to delete subscription',
          );
          throw error;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceWithSubscription = invoice as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };

        try {
          // Update subscription billing_status to null when payment succeeds
          if (invoiceWithSubscription.subscription) {
            const subscriptionId =
              typeof invoiceWithSubscription.subscription === 'string'
                ? invoiceWithSubscription.subscription
                : invoiceWithSubscription.subscription.id;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await syncSubscriptionToDatabase(subscription);

            log.info(
              {
                invoiceId: invoice.id,
                subscriptionId: subscription.id,
                customerId: invoice.customer,
                amount: invoice.amount_paid,
                duration: `${Date.now() - startTime}ms`,
              },
              'Payment succeeded - subscription billing_status updated',
            );
          }
        } catch (error) {
          log.error(
            {
              invoiceId: invoice.id,
              eventId: event.id,
              error: error instanceof Error ? error.message : String(error),
              duration: `${Date.now() - startTime}ms`,
            },
            'Failed to handle payment succeeded',
          );
          throw error;
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceWithSubscription = invoice as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription;
        };

        try {
          // Set billing_status to past_due when payment fails
          if (invoiceWithSubscription.subscription) {
            const subscriptionId =
              typeof invoiceWithSubscription.subscription === 'string'
                ? invoiceWithSubscription.subscription
                : invoiceWithSubscription.subscription.id;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await syncSubscriptionToDatabase(subscription);

            log.warn(
              {
                invoiceId: invoice.id,
                subscriptionId: subscription.id,
                customerId: invoice.customer,
                amount: invoice.amount_due,
                duration: `${Date.now() - startTime}ms`,
              },
              'Payment failed - subscription billing_status set to past_due',
            );
          }
        } catch (error) {
          log.error(
            {
              invoiceId: invoice.id,
              eventId: event.id,
              error: error instanceof Error ? error.message : String(error),
              duration: `${Date.now() - startTime}ms`,
            },
            'Failed to handle payment failed',
          );
          throw error;
        }
        break;
      }

      case 'invoice.payment_action_required': {
        const invoice = event.data.object as Stripe.Invoice;

        try {
          // Handle payment action required (3D Secure, etc.)
          const invoiceWithSubscription = invoice as Stripe.Invoice & {
            subscription?: string | Stripe.Subscription;
          };
          if (invoiceWithSubscription.subscription) {
            const subscriptionId =
              typeof invoiceWithSubscription.subscription === 'string'
                ? invoiceWithSubscription.subscription
                : invoiceWithSubscription.subscription.id;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            await syncSubscriptionToDatabase(subscription);

            log.warn(
              {
                invoiceId: invoice.id,
                subscriptionId: subscription.id,
                customerId: invoice.customer,
                amount: invoice.amount_due,
                duration: `${Date.now() - startTime}ms`,
              },
              'Payment action required - subscription status updated',
            );
          }
        } catch (error) {
          log.error(
            {
              invoiceId: invoice.id,
              eventId: event.id,
              error: error instanceof Error ? error.message : String(error),
              duration: `${Date.now() - startTime}ms`,
            },
            'Failed to handle payment action required',
          );
          throw error;
        }
        break;
      }

      default:
        log.info(
          {
            eventType: event.type,
            eventId: event.id,
            duration: `${Date.now() - startTime}ms`,
          },
          'Unhandled webhook event type',
        );
        break;
    }

    log.info(
      {
        eventType: event.type,
        eventId: event.id,
        duration: `${Date.now() - startTime}ms`,
      },
      'Webhook event processed successfully',
    );
  } catch (error) {
    log.error(
      {
        eventType: event.type,
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
        duration: `${Date.now() - startTime}ms`,
      },
      'Webhook event processing failed',
    );
    throw error; // Re-throw to trigger webhook retry
  }
}

export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
): Promise<Stripe.Event> {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
    return event;
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`);
  }
}
