import { describe, it, expect } from 'vitest';
import { getDateRange, formatDate, windowLabel } from '../../src/utils/dateRanges.ts';
import type { TimeWindow } from '../../src/types/finance.ts';

describe('getDateRange', () => {
  it('day: period1 is start of today', () => {
    const { period1, period2 } = getDateRange('day');
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    expect(period1.getTime()).toBe(startOfDay.getTime());
    expect(period2.getTime()).toBeGreaterThanOrEqual(period1.getTime());
  });

  it('7d: period1 is roughly 7 days ago', () => {
    const { period1, period2 } = getDateRange('7d');
    const diff = period2.getTime() - period1.getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    // Allow 1 second tolerance
    expect(diff).toBeGreaterThanOrEqual(sevenDaysMs - 1000);
    expect(diff).toBeLessThanOrEqual(sevenDaysMs + 1000);
  });

  it('quarter: period1 is roughly 90 days ago', () => {
    const { period1, period2 } = getDateRange('quarter');
    const diff = period2.getTime() - period1.getTime();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    expect(diff).toBeGreaterThanOrEqual(ninetyDaysMs - 1000);
    expect(diff).toBeLessThanOrEqual(ninetyDaysMs + 1000);
  });
});

describe('formatDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const d = new Date('2024-03-15T12:00:00Z');
    expect(formatDate(d)).toBe('2024-03-15');
  });
});

describe('windowLabel', () => {
  const cases: [TimeWindow, string][] = [
    ['day',     'Today'],
    ['7d',      'Last 7 Days'],
    ['quarter', 'Last Quarter'],
  ];
  it.each(cases)('%s → %s', (window, expected) => {
    expect(windowLabel(window)).toBe(expected);
  });
});
