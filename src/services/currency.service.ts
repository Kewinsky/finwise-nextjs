import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { log } from '@/lib/logger';

/**
 * Cached exchange rate data
 */
interface CachedRate {
  rate: number;
  timestamp: number;
  from: string;
  to: string;
}

/**
 * CurrencyService handles currency conversion using external exchange rate APIs
 *
 * Features:
 * - Real-time exchange rate fetching
 * - In-memory caching (24h TTL)
 * - Support for multiple currencies
 * - Fallback to USD if conversion fails
 *
 * @example
 * ```typescript
 * const currencyService = new CurrencyService(supabase);
 * const result = await currencyService.convertAmount(100, 'EUR', 'USD');
 * if (result.success) {
 *   console.log(result.data); // ~108.50
 * }
 * ```
 */
export class CurrencyService {
  private cache: Map<string, CachedRate> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly API_BASE_URL_FREE = 'https://api.exchangerate-api.com/v4/latest';
  private readonly API_KEY: string | undefined;

  constructor(private readonly supabase: SupabaseClient<Database>) {
    this.API_KEY = process.env.EXCHANGERATE_API_KEY;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      // If same currency, no conversion needed
      if (fromCurrency === toCurrency) {
        return { success: true, data: amount };
      }

      // Validate currency format (ISO 4217 - 3 uppercase letters)
      const currencyRegex = /^[A-Z]{3}$/;
      if (!currencyRegex.test(fromCurrency)) {
        log.warn({ fromCurrency }, 'Invalid source currency format');
        return {
          success: false,
          error: `Invalid source currency format: ${fromCurrency}. Must be 3 uppercase letters (ISO 4217)`,
        };
      }

      if (!currencyRegex.test(toCurrency)) {
        log.warn({ toCurrency }, 'Invalid target currency format');
        return {
          success: false,
          error: `Invalid target currency format: ${toCurrency}. Must be 3 uppercase letters (ISO 4217)`,
        };
      }

      // Get exchange rate - API will handle unsupported currencies with appropriate error
      const rateResult = await this.getExchangeRate(fromCurrency, toCurrency);
      if (!rateResult.success || !rateResult.data) {
        return {
          success: false,
          error: rateResult.error || 'Failed to get exchange rate',
        };
      }

      const convertedAmount = amount * rateResult.data;
      log.info(
        { amount, fromCurrency, toCurrency, rate: rateResult.data, convertedAmount },
        'Currency conversion completed',
      );

      return { success: true, data: convertedAmount };
    } catch (error) {
      log.error({ error, fromCurrency, toCurrency }, 'Error converting currency');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during conversion',
      };
    }
  }

  /**
   * Get exchange rate between two currencies
   * Uses caching to reduce API calls
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      // Check cache first
      const cacheKey = `${fromCurrency}-${toCurrency}`;
      const cached = this.cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        log.debug({ fromCurrency, toCurrency, rate: cached.rate }, 'Using cached exchange rate');
        return { success: true, data: cached.rate };
      }

      // Fetch from API
      log.info({ fromCurrency, hasApiKey: !!this.API_KEY }, 'Fetching exchange rates from API');

      // Build API URL - use keyed endpoint if API key is available, otherwise use free tier
      const apiUrl = this.API_KEY
        ? `https://v6.exchangerate-api.com/v6/${this.API_KEY}/latest/${fromCurrency}`
        : `${this.API_BASE_URL_FREE}/${fromCurrency}`;

      log.debug({ apiUrl: apiUrl.replace(this.API_KEY || '', '***') }, 'API request URL');
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorMsg = `API returned status ${response.status}`;
        log.error({ fromCurrency, toCurrency, status: response.status }, 'Exchange rate API error');
        return { success: false, error: errorMsg };
      }

      const jsonData = await response.json();

      // Handle both API formats (free tier v4 and keyed tier v6)
      let rates: Record<string, number>;
      if (this.API_KEY && jsonData.conversion_rates) {
        // Keyed API format (v6) - uses conversion_rates
        rates = jsonData.conversion_rates;
      } else if (jsonData.rates) {
        // Free tier format (v4) - uses rates
        rates = jsonData.rates;
      } else {
        const errorMsg = 'Invalid API response format';
        log.error({ fromCurrency, toCurrency, response: jsonData }, errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!rates[toCurrency]) {
        const errorMsg = `Exchange rate for ${toCurrency} not found in API response`;
        log.error({ fromCurrency, toCurrency, availableRates: Object.keys(rates) }, errorMsg);
        return { success: false, error: errorMsg };
      }

      const rate = rates[toCurrency];

      // Cache the rate
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now(),
        from: fromCurrency,
        to: toCurrency,
      });

      // Also cache the reverse rate (1/rate) for efficiency
      const reverseCacheKey = `${toCurrency}-${fromCurrency}`;
      this.cache.set(reverseCacheKey, {
        rate: 1 / rate,
        timestamp: Date.now(),
        from: toCurrency,
        to: fromCurrency,
      });

      log.info({ fromCurrency, toCurrency, rate }, 'Exchange rate fetched and cached');
      return { success: true, data: rate };
    } catch (error) {
      log.error({ error, fromCurrency, toCurrency }, 'Error fetching exchange rate');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rate',
      };
    }
  }

  /**
   * Convert multiple amounts from different currencies to a target currency
   * Useful for calculating total balance across multiple accounts
   */
  async convertMultipleAmounts(
    amounts: Array<{ amount: number; currency: string }>,
    targetCurrency: string,
  ): Promise<{ success: boolean; data?: number; error?: string }> {
    try {
      let total = 0;
      const failedConversions: Array<{ amount: number; currency: string; error: string }> = [];

      log.info(
        { amountsCount: amounts.length, targetCurrency },
        'Starting batch currency conversion',
      );

      for (const { amount, currency } of amounts) {
        // Skip conversion if already in target currency
        if (currency === targetCurrency) {
          log.debug({ amount, currency }, 'Amount already in target currency, skipping conversion');
          total += amount;
          continue;
        }

        const conversionResult = await this.convertAmount(amount, currency, targetCurrency);
        if (!conversionResult.success) {
          const error = conversionResult.error || 'Unknown conversion error';
          log.warn(
            { amount, currency, targetCurrency, error },
            'Failed to convert amount, skipping',
          );
          failedConversions.push({ amount, currency, error });
          // Continue with other conversions even if one fails
          continue;
        }

        const convertedAmount = conversionResult.data || 0;
        log.debug(
          { amount, currency, convertedAmount, targetCurrency },
          'Amount converted successfully',
        );
        total += convertedAmount;
      }

      if (failedConversions.length > 0) {
        log.warn(
          { failedCount: failedConversions.length, failedConversions },
          'Some conversions failed during batch conversion',
        );
        // If all conversions failed, return error
        if (failedConversions.length === amounts.length) {
          return {
            success: false,
            error: `All conversions failed: ${failedConversions.map((f) => f.error).join(', ')}`,
          };
        }
      }

      log.info(
        { total, targetCurrency, convertedCount: amounts.length - failedConversions.length },
        'Batch currency conversion completed',
      );
      return { success: true, data: total };
    } catch (error) {
      log.error({ error, amounts, targetCurrency }, 'Error converting multiple amounts');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during batch conversion',
      };
    }
  }

  /**
   * Clear the exchange rate cache
   * Useful for testing or when rates need to be refreshed manually
   */
  clearCache(): void {
    this.cache.clear();
    log.info('Exchange rate cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
