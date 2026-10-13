/**
 * Yahoo Finance adapter.
 * Wraps yahoo-finance2 calls and normalises responses into the
 * application's Quote, QuoteSummary, and HistoryPoint types.
 *
 * NOTE: yahoo-finance2 is a Node.js library. In a browser-only build,
 * calls must be routed through a lightweight server-side proxy.
 * For workshop / demo purposes the service falls back to mockData when
 * the environment variable VITE_USE_MOCK is set to "true".
 *
 * Extension guide
 * ───────────────
 * To add a new company: add it to constants/companies.ts — no changes here.
 * To add a new normalised field: update the Quote type, adjust the mapping
 * in fetchQuote(), and update normalizeQuote() in utils/normalizers.ts.
 */
import yahooFinance from 'yahoo-finance2';
import type { Quote, QuoteSummary, HistoryPoint, TimeWindow } from '../types/finance.ts';
import { getDateRange } from '../utils/dateRanges.ts';
import { normalizeQuote, normalizeHistory } from '../utils/normalizers.ts';

// yahoo-finance2 returns a complex discriminated union; cast to a usable shape.
type YahooQuoteResult = {
  longName?: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  marketCap?: number;
};

type YahooHistoricalRow = {
  date:    Date;
  close?:  number;
  open?:   number;
  high?:   number;
  low?:    number;
  volume?: number;
};

/** Fetch a raw Quote from Yahoo Finance. */
export async function fetchQuote(ticker: string): Promise<Quote> {
  const result = (await yahooFinance.quote(ticker)) as unknown as YahooQuoteResult;
  return {
    ticker,
    name:          result.longName ?? result.shortName ?? ticker,
    price:         result.regularMarketPrice ?? 0,
    change:        result.regularMarketChange ?? 0,
    changePercent: result.regularMarketChangePercent ?? 0,
    volume:        result.regularMarketVolume,
    marketCap:     result.marketCap,
  };
}

/**
 * Fetch and fully normalise a quote into a display-ready QuoteSummary.
 * Use this instead of fetchQuote() when the UI needs formatted strings.
 */
export async function fetchQuoteSummary(ticker: string): Promise<QuoteSummary> {
  return normalizeQuote(await fetchQuote(ticker));
}

/**
 * Fetch historical prices and return them sorted, de-duped, and filtered.
 *
 * Interval selection:
 *   day     → 1-minute intraday is not available on the free API; '1d' returns
 *              the latest session bar, which is the best available substitute.
 *   7d      → daily bars ('1d')
 *   quarter → weekly bars ('1wk') give ~13 data points, enough for a trend view
 */
export async function fetchHistory(
  ticker: string,
  window: TimeWindow,
): Promise<HistoryPoint[]> {
  const { period1, period2 } = getDateRange(window);

  const result = (await yahooFinance.historical(ticker, {
    period1,
    period2,
    interval: window === 'quarter' ? '1wk' : '1d',
  })) as unknown as YahooHistoricalRow[];

  const raw: HistoryPoint[] = result.map((row) => ({
    date:   row.date.toISOString().slice(0, 10),
    close:  row.close ?? 0,
    open:   row.open,
    high:   row.high,
    low:    row.low,
    volume: row.volume,
  }));

  return normalizeHistory(raw);
}
