import { SUBSCRIPTION_PLANS, type PlanType } from '@/config/app';

/**
 * Get plan by Stripe price ID
 */
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [planType, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return planType as PlanType;
    }
  }
  return null;
}

/**
 * Get price ID by plan type
 */
export function getPriceIdByPlan(planType: PlanType): string | null {
  const plan = SUBSCRIPTION_PLANS[planType];
  return plan?.priceId || null;
}

/**
 * Get trial days by plan type
 */
export function getTrialDaysByPlan(planType: PlanType): number {
  const plan = SUBSCRIPTION_PLANS[planType];
  return plan?.trialDays || 0;
}

/**
 * Check if a plan has a trial period
 */
export function hasTrialPeriod(planType: PlanType): boolean {
  return getTrialDaysByPlan(planType) > 0;
}

/**
 * Get plan name by plan type
 */
export function getPlanName(planType: PlanType): string {
  const plan = SUBSCRIPTION_PLANS[planType];
  return plan?.name || 'Unknown';
}

/**
 * Get plan price by plan type
 */
export function getPlanPrice(planType: PlanType): number {
  const plan = SUBSCRIPTION_PLANS[planType];
  return plan?.price || 0;
}

/**
 * Get plan features by plan type
 */
export function getPlanFeatures(planType: PlanType): string[] {
  const plan = SUBSCRIPTION_PLANS[planType];
  return [...(plan?.features || [])];
}

/**
 * Get all available plan types
 */
export function getAllPlanTypes(): PlanType[] {
  return Object.keys(SUBSCRIPTION_PLANS) as PlanType[];
}

/**
 * Get all paid plan types (excludes free)
 */
export function getPaidPlanTypes(): PlanType[] {
  return getAllPlanTypes().filter((planType) => planType !== 'free');
}

/**
 * Check if a plan type is paid
 */
export function isPaidPlan(planType: PlanType): boolean {
  return planType !== 'free' && getPlanPrice(planType) > 0;
}

/**
 * Get plan comparison data for pricing pages
 */
export function getPlanComparison() {
  return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
    key: key as PlanType,
    name: plan.name,
    price: plan.price,
    trialDays: plan.trialDays,
    features: [...plan.features],
    priceId: plan.priceId,
    isPaid: key !== 'free' && plan.price > 0,
    hasTrial: plan.trialDays > 0,
  }));
}
