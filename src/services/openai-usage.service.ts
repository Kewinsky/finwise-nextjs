import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import type { ServiceResult } from '@/types/service.types';
import { log } from '@/lib/logger';
import { PLAN_LIMITS, type PlanType } from '@/config/app';
import { SubscriptionService } from './subscription.service';

export interface AIUsageData {
  queryCount: number;
  tokensUsed: number;
  limit: number;
  percentage: number;
}

/**
 * OpenAIUsageService handles tracking and limiting AI API usage
 *
 * Responsibilities:
 * - Track monthly AI query usage per user
 * - Enforce subscription plan limits
 * - Record API calls with token usage
 * - Calculate usage percentages
 *
 * @example
 * ```typescript
 * const supabase = await createClientForServer();
 * const usageService = new OpenAIUsageService(supabase);
 *
 * const canMakeCall = await usageService.canMakeAPICall(userId);
 * if (canMakeCall.success && canMakeCall.data) {
 *   // Make API call
 *   await usageService.recordAPICall(userId, 150);
 * }
 * ```
 */
export class OpenAIUsageService {
  private subscriptionService: SubscriptionService;

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.subscriptionService = new SubscriptionService(supabase);
  }

  /**
   * Get current month usage for a user
   * @param userId - User ID
   * @param planType - Optional plan type to avoid fetching subscription if already known
   */
  async getCurrentMonthUsage(
    userId: string,
    planType?: PlanType,
  ): Promise<ServiceResult<AIUsageData>> {
    try {
      let finalPlanType: PlanType;
      if (planType) {
        finalPlanType = planType;
      } else {
        const subscriptionResult = await this.subscriptionService.getUserSubscription(userId);
        if (!subscriptionResult.success) {
          return { success: false, error: subscriptionResult.error };
        }
        const subscription = subscriptionResult.data;
        finalPlanType = (subscription?.plan_type || 'free') as PlanType;
      }

      const limit = PLAN_LIMITS[finalPlanType].aiQueriesPerMonth;

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const { data: usage, error } = await this.supabase
        .from('openai_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (error && error.code !== 'PGRST116') {
        log.error({ userId, error: error.message }, 'Failed to get OpenAI usage');
        return { success: false, error: error.message };
      }

      if (!usage) {
        const { data: newUsage, error: insertError } = await this.supabase
          .from('openai_usage')
          .insert({
            user_id: userId,
            year,
            month,
            query_count: 0,
            tokens_used: 0,
          })
          .select()
          .single();

        if (insertError) {
          log.error({ userId, error: insertError.message }, 'Failed to create OpenAI usage record');
          return { success: false, error: insertError.message };
        }

        const queryCount = newUsage.query_count || 0;
        const tokensUsed = newUsage.tokens_used || 0;
        const percentage = limit === Infinity ? 0 : (queryCount / limit) * 100;

        return {
          success: true,
          data: {
            queryCount,
            tokensUsed,
            limit,
            percentage: Math.min(percentage, 100),
          },
        };
      }

      const queryCount = usage.query_count || 0;
      const tokensUsed = usage.tokens_used || 0;
      const percentage = limit === Infinity ? 0 : (queryCount / limit) * 100;

      return {
        success: true,
        data: {
          queryCount,
          tokensUsed,
          limit,
          percentage: Math.min(percentage, 100),
        },
      };
    } catch (error) {
      log.error(error, 'Error getting current month usage');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user can make an API call (hasn't reached limit)
   */
  async canMakeAPICall(userId: string): Promise<ServiceResult<boolean>> {
    try {
      const usageResult = await this.getCurrentMonthUsage(userId);
      if (!usageResult.success) {
        return { success: false, error: usageResult.error };
      }

      const usage = usageResult.data!;
      const canMakeCall = usage.queryCount < usage.limit || usage.limit === Infinity;

      return { success: true, data: canMakeCall };
    } catch (error) {
      log.error(error, 'Error checking if user can make API call');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record an API call with token usage
   */
  async recordAPICall(userId: string, tokensUsed: number): Promise<ServiceResult<void>> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const { data: usage, error: selectError } = await this.supabase
        .from('openai_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        log.error(
          { userId, error: selectError.message },
          'Failed to get OpenAI usage for recording',
        );
        return { success: false, error: selectError.message };
      }

      if (usage) {
        const { error: updateError } = await this.supabase
          .from('openai_usage')
          .update({
            query_count: (usage.query_count || 0) + 1,
            tokens_used: (usage.tokens_used || 0) + tokensUsed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', usage.id);

        if (updateError) {
          log.error({ userId, error: updateError.message }, 'Failed to update OpenAI usage');
          return { success: false, error: updateError.message };
        }
      } else {
        // Create new record
        const { error: insertError } = await this.supabase.from('openai_usage').insert({
          user_id: userId,
          year,
          month,
          query_count: 1,
          tokens_used: tokensUsed,
        });

        if (insertError) {
          log.error({ userId, error: insertError.message }, 'Failed to create OpenAI usage record');
          return { success: false, error: insertError.message };
        }
      }

      log.info({ userId, tokensUsed }, 'Recorded OpenAI API call');
      return { success: true };
    } catch (error) {
      log.error(error, 'Error recording API call');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
