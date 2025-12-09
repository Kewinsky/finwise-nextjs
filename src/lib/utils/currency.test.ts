import { describe, it, expect } from 'vitest';
import { calculatePercentageChange, formatPercentageChange, formatCurrency } from '@/lib/utils';

describe('currency and percentage utils', () => {
  it('calculatePercentageChange handles normal values', () => {
    expect(calculatePercentageChange(120, 100)).toBe(20);
    expect(calculatePercentageChange(80, 100)).toBe(-20);
  });

  it('calculatePercentageChange handles previous = 0', () => {
    expect(calculatePercentageChange(100, 0)).toBe(100);
    expect(calculatePercentageChange(0, 0)).toBe(0);
  });

  it('formatPercentageChange returns rounded value with sign', () => {
    const positive = formatPercentageChange(12.345);
    expect(positive.text).toBe('+12.3%');
    expect(positive.isPositive).toBe(true);

    const negative = formatPercentageChange(-3.21);
    expect(negative.text).toBe('-3.2%');
    expect(negative.isPositive).toBe(false);
  });

  it('formatCurrency formats amounts using Intl API (locale independent)', () => {
    const usd = formatCurrency(1234.56, 'USD');
    const eur = formatCurrency(1234.56, 'EUR');

    // Basic sanity checks that are robust across locales
    expect(usd).toMatch(/\d/);
    expect(usd).toContain('1');
    expect(usd).toContain('234');

    expect(eur).toMatch(/\d/);
    expect(eur).not.toBe(usd);
  });
});
