'use client';

import { useState, useEffect } from 'react';
import { createClientForBrowser } from '@/utils/supabase/client';
import { SubscriptionService } from '@/services/subscription.service';
import type { PlanType } from '@/config/app';
import { log } from '@/lib/logger';

interface UseSubscriptionReturn {
  planType: PlanType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get the current user's subscription plan type
 *
 * @example
 * ```typescript
 * const { planType, isLoading } = useSubscription();
 *
 * if (isLoading) return <div>Loading...</div>;
 * const currentPlan = planType || 'free';
 * ```
 */
export function useSubscription(): UseSubscriptionReturn {
  const [planType, setPlanType] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClientForBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPlanType('free');
        setIsLoading(false);
        return;
      }

      const subscriptionService = new SubscriptionService(supabase);
      const result = await subscriptionService.getUserSubscription(user.id);

      if (!result.success) {
        setPlanType('free');
        setError(result.error);
        return;
      }

      const subscription = result.data;
      const plan = (subscription?.plan_type || 'free') as PlanType;
      setPlanType(plan);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      log.error(err, 'Error fetching subscription in useSubscription hook');
      setPlanType('free');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    planType,
    isLoading,
    error,
    refetch: fetchSubscription,
  };
}
