/**
 * Public finance service API.
 *
 * Components and hooks call only these functions — never the adapter directly.
 * The implementation switches between the Yahoo Finance adapter and static
 * mock data based on the VITE_USE_MOCK environment variable, making the UI
 * and tests hermetic.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Function            Returns         Used by            │
 * │  ──────────────────  ──────────────  ─────────────────  │
 * │  getQuote            Quote             raw data consumers │
 * │  getQuoteSummary     QuoteSummary      useCompanyQuotes   │
 * │  getHistory          HistoryPoint[]    useCompanyHistories│
 * │  getQuarterlyTrend   QuarterlyPoint[]  quarterly rollups  │
 * └─────────────────────────────────────────────────────────┘
 */
import type { Quote, QuoteSummary, HistoryPoint, QuarterlyPoint, TimeWindow } from '../types/finance.ts';
import { MOCK_QUOTES, MOCK_HISTORY } from './mockData.ts';
import * as yahoo from './yahooAdapter.ts';
import { getDateRange } from '../utils/dateRanges.ts';
import { normalizeQuote, normalizeHistory, aggregateQuarters } from '../utils/normalizers.ts';

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.MODE === 'test';

/** Returns the raw Quote for a ticker. */
export async function getQuote(ticker: string): Promise<Quote> {
  if (USE_MOCK) {
    const mock = MOCK_QUOTES[ticker.toUpperCase()];
    if (!mock) throw new Error(`No mock data for ticker: ${ticker}`);
    return mock;
  }
  return yahoo.fetchQuote(ticker);
}

/**
 * Returns a fully normalised QuoteSummary with display-ready formatted fields.
 * Preferred over getQuote() for all UI components.
 */
export async function getQuoteSummary(ticker: string): Promise<QuoteSummary> {
  return normalizeQuote(await getQuote(ticker));
}

/** Returns sorted, de-duped HistoryPoints for the requested time window. */
export async function getHistory(
  ticker: string,
  window: TimeWindow,
): Promise<HistoryPoint[]> {
  if (USE_MOCK) {
    const all = MOCK_HISTORY[ticker.toUpperCase()];
    if (!all) throw new Error(`No mock history for ticker: ${ticker}`);
    const { period1 } = getDateRange(window);
    const filtered = all.filter((p) => new Date(p.date) >= period1);
    return normalizeHistory(filtered);
  }
  return yahoo.fetchHistory(ticker, window);
}

/**
 * Returns per-calendar-quarter aggregated price data for the requested ticker.
 * Always fetches the 'quarter' window and aggregates into QuarterlyPoints.
 * Ideal for the quarterly trend area chart.
 */
export async function getQuarterlyTrend(ticker: string): Promise<QuarterlyPoint[]> {
  const history = await getHistory(ticker, 'quarter');
  return aggregateQuarters(history);
}
