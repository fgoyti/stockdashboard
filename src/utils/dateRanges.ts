import type { TimeWindow } from '../types/finance.ts';

export interface DateRange {
  period1: Date;
  period2: Date;
}

/**
 * Returns a { period1, period2 } date range for the given TimeWindow.
 * period2 is always "now".
 */
export function getDateRange(window: TimeWindow): DateRange {
  const period2 = new Date();
  const period1 = new Date();

  switch (window) {
    case 'day':
      // Start of the current calendar day
      period1.setHours(0, 0, 0, 0);
      break;
    case '7d':
      period1.setDate(period2.getDate() - 7);
      break;
    case 'quarter':
      period1.setDate(period2.getDate() - 90);
      break;
  }

  return { period1, period2 };
}

/** Format a Date as YYYY-MM-DD for display */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Human-readable label for a TimeWindow */
export function windowLabel(window: TimeWindow): string {
  const labels: Record<TimeWindow, string> = {
    day:     'Today',
    '7d':    'Last 7 Days',
    quarter: 'Last Quarter',
  };
  return labels[window];
}
