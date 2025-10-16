import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import type Stripe from 'stripe';
import type {
  CheckoutSessionOptions,
  CheckoutSession,
  CustomerPortalOptions,
  CustomerPortalSession,
  PaymentMethod,
  Invoice,
  InvoiceFilters,
} from '@/types/billing.types';
import type { PlanType } from '@/types/subscription.types';
import { log } from '@/lib/logger';
import { getPriceIdByPlan } from '@/lib/subscription-utils';
import { appConfig } from '@/config/app';

/**
 * BillingService handles billing and payment business logic
 *
 * Responsibilities:
 * - Stripe checkout session creation
 * - Customer portal session creation
 * - Payment method management
 * - Invoice retrieval and management
 * - Billing information aggregation
 *
 * Note: This service requires Stripe SDK to be passed as dependency
 *
 * @example
 * ```typescript
 * import { stripe } from "@/lib/stripe/config";
 * const supabase = await createClientForServer();
 * const billingService = new BillingService(supabase, stripe);
 *
 * const result = await billingService.createCheckoutSession({
 *   userId: "user-id",
 *   planType: "pro",
 *   successUrl: "/billing/success",
 *   cancelUrl: "/billing/cancel"
 * });
 * ```
 */
export class BillingService {
  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly stripe: Stripe,
  ) {}

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    options: CheckoutSessionOptions,
  ): Promise<ServiceResult<CheckoutSession>> {
    try {
      log.info({ userId: options.userId, planType: options.planType }, 'Creating checkout session');

      // Get or create Stripe customer ID
      const customerResult = await this.getOrCreateCustomerId(options.userId);
      if (!customerResult.success) {
        return { success: false, error: customerResult.error };
      }

      const customerId = customerResult.data;

      // Get price ID for plan (you'll need to implement getPriceIdForPlan)
      const priceId = this.getPriceIdForPlan(options.planType);
      if (!priceId) {
        return {
          success: false,
          error: `No price found for plan: ${options.planType}`,
        };
      }

      // Get base URL from config
      const baseUrl = appConfig.urls.base;

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url:
          options.successUrl ||
          `${baseUrl}/billing/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: options.cancelUrl || `${baseUrl}/billing/payment-failed`,
        metadata: {
          userId: options.userId,
        },
      };

      // Add trial period if specified
      if (options.trialDays) {
        sessionParams.subscription_data = {
          trial_period_days: options.trialDays,
        };
      }

      // Add promo code if specified
      if (options.promoCode) {
        sessionParams.discounts = [
          {
            promotion_code: options.promoCode,
          },
        ];
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      log.info({ userId: options.userId, sessionId: session.id }, 'Checkout session created');

      return {
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      };
    } catch (error) {
      log.error(error, 'Error creating checkout session');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create Stripe customer portal session
   */
  async createCustomerPortalSession(
    options: CustomerPortalOptions,
  ): Promise<ServiceResult<CustomerPortalSession>> {
    try {
      log.info({ userId: options.userId }, 'Creating customer portal session');

      // Get Stripe customer ID
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', options.userId)
        .single();

      if (!subscription?.stripe_customer_id) {
        return {
          success: false,
          error: 'No Stripe customer found for user',
        };
      }

      // Get base URL from config
      const baseUrl = appConfig.urls.base;

      const session = await this.stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: options.returnUrl || `${baseUrl}/settings/billing`,
      });

      log.info(
        { userId: options.userId, sessionUrl: session.url },
        'Customer portal session created',
      );

      return {
        success: true,
        data: {
          url: session.url,
        },
      };
    } catch (error) {
      log.error(error, 'Error creating customer portal session');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get payment methods for user
   */
  async getPaymentMethods(userId: string): Promise<ServiceResult<PaymentMethod[]>> {
    try {
      log.info({ userId }, 'Fetching payment methods');

      // Get user's Stripe customer ID
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (!subscription?.stripe_customer_id) {
        log.info({ userId }, 'No Stripe customer ID found');
        return { success: true, data: [] };
      }

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: subscription.stripe_customer_id,
        type: 'card',
      });

      const formattedMethods: PaymentMethod[] = paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
            }
          : undefined,
      }));

      log.info(
        {
          userId,
          customerId: subscription.stripe_customer_id,
          paymentMethodCount: formattedMethods.length,
        },
        'Payment methods retrieved',
      );

      return { success: true, data: formattedMethods };
    } catch (error) {
      log.error(error, 'Error fetching payment methods');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get invoices for user
   */
  async getInvoices(userId: string, filters?: InvoiceFilters): Promise<ServiceResult<Invoice[]>> {
    try {
      log.info({ userId }, 'Fetching invoices');

      // Get user's Stripe customer ID
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (!subscription?.stripe_customer_id) {
        return { success: true, data: [] };
      }

      const invoiceParams: Stripe.InvoiceListParams = {
        customer: subscription.stripe_customer_id,
        limit: filters?.limit || 10,
      };

      if (filters?.status) {
        invoiceParams.status = filters.status as Stripe.InvoiceListParams.Status;
      }

      if (filters?.startingAfter) {
        invoiceParams.starting_after = filters.startingAfter;
      }

      const invoices = await this.stripe.invoices.list(invoiceParams);

      const formattedInvoices: Invoice[] = invoices.data.map((invoice) => ({
        id: invoice.id,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        status: invoice.status,
        created: invoice.created,
        description: invoice.description,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        currency: invoice.currency,
        billing_reason: invoice.billing_reason,
        customer: invoice.customer,
      }));

      log.info({ userId, invoiceCount: formattedInvoices.length }, 'Invoices retrieved');

      return { success: true, data: formattedInvoices };
    } catch (error) {
      log.error(error, 'Error fetching invoices');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get or create Stripe customer ID for user
   */
  private async getOrCreateCustomerId(userId: string): Promise<ServiceResult<string>> {
    try {
      // Check if user already has a customer ID
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (subscription?.stripe_customer_id) {
        return { success: true, data: subscription.stripe_customer_id };
      }

      // Get user email
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!profile?.email) {
        return { success: false, error: 'User email not found' };
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: profile.email,
        name: profile.full_name || undefined,
        metadata: {
          userId,
        },
      });

      log.info({ userId, customerId: customer.id }, 'Stripe customer created');

      return { success: true, data: customer.id };
    } catch (error) {
      log.error(error, 'Error getting or creating customer ID');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get Stripe price ID for plan type
   * Uses getPriceIdByPlan from @/lib/stripe/plans
   */
  private getPriceIdForPlan(planType: string): string | null {
    return getPriceIdByPlan(planType as PlanType);
  }
}
