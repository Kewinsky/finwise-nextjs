import type { PlanType } from '@/types/subscription.types';
import type Stripe from 'stripe';

/**
 * Plan type for billing - re-export from subscription types for consistency
 */
export type BillingPlanType = PlanType;

/**
 * Checkout session options
 */
export interface CheckoutSessionOptions {
  userId: string;
  planType: PlanType;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
  promoCode?: string;
}

/**
 * Checkout session result
 */
export interface CheckoutSession {
  sessionId: string;
  url: string | null;
}

/**
 * Customer portal options
 */
export interface CustomerPortalOptions {
  userId: string;
  returnUrl?: string;
}

/**
 * Customer portal result
 */
export interface CustomerPortalSession {
  url: string;
}

/**
 * Payment method data
 */
export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault?: boolean;
}

/**
 * Invoice data - simplified from Stripe's Invoice object
 * Only includes fields we actually use in the application
 */
export interface Invoice {
  id?: string;
  amount_paid: number;
  amount_due: number;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void' | null;
  created: number;
  description: string | null;
  invoice_pdf?: string | null;
  hosted_invoice_url?: string | null;
  currency: string;
  billing_reason: string | null;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
}

/**
 * Billing info aggregate
 */
export interface BillingInfo {
  customerId: string | null;
  hasPaymentMethod: boolean;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  upcomingInvoice?: Invoice | null;
}

/**
 * Invoice filters
 */
export interface InvoiceFilters {
  status?: string;
  limit?: number;
  startingAfter?: string;
}

/**
 * Usage record for metered billing
 */
export interface UsageRecord {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
  action?: 'increment' | 'set';
}
