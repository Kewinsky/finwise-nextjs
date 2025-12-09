import { describe, it, expect } from 'vitest';
import { formatDisplayDate } from '@/lib/utils';

describe('date utils', () => {
  it('formatDisplayDate formats ISO date string to short month and day', () => {
    const result = formatDisplayDate('2025-01-15T00:00:00.000Z');

    // Example expected format: "Jan 15" (locale-dependent but should contain month short name)
    expect(result).toMatch(/Jan/i);
    expect(result).toMatch(/15/);
  });
});
