/**
 * Data normalizers for the finance data layer.
 *
 * These pure functions convert raw Yahoo Finance payloads (or mock data)
 * into the UI-ready types defined in types/finance.ts:
 *
 *   normalizeQuote       Quote          → QuoteSummary
 *   normalizeHistory     HistoryPoint[] → HistoryPoint[]  (sorted, de-duped)
 *   aggregateQuarters    HistoryPoint[] → QuarterlyPoint[]
 *
 * Keeping normalisation here (not in the adapter or the component) means:
 *  - Adding a new data source only requires implementing the adapter interface.
 *  - Adding a new company requires zero code changes here.
 *  - Unit tests for formatting/aggregation logic are isolated from HTTP calls.
 */
import type { Quote, QuoteSummary, HistoryPoint, QuarterlyPoint } from '../types/finance.ts';

// ---------------------------------------------------------------------------
// Formatting helpers (module-private)
// ---------------------------------------------------------------------------

/** Format a number as a compact currency string, e.g. 208_400_000_000 → "$208.4B" */
function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

/** Format a raw share volume number, e.g. 4_200_000 → "4.2M" */
function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return String(value);
}

/** Return the ISO calendar quarter (1–4) for a given month (0-based). */
function monthToQuarter(month: number): number {
  return Math.floor(month / 3) + 1;
}

/** Build a human-readable quarter label, e.g. "Q2 2025" */
function quarterLabel(year: number, quarter: number): string {
  return `Q${quarter} ${year}`;
}

// ---------------------------------------------------------------------------
// Public normalizers
// ---------------------------------------------------------------------------

/**
 * Converts a raw Quote into a display-ready QuoteSummary.
 * All formatted string fields are computed once here so components stay
 * purely presentational.
 */
export function normalizeQuote(raw: Quote): QuoteSummary {
  const isPositive = raw.changePercent >= 0;
  const sign       = isPositive ? '+' : '';

  return {
    ticker:             raw.ticker,
    name:               raw.name,
    price:              raw.price,
    change:             raw.change,
    changePercent:      raw.changePercent,
    isPositive,
    priceFormatted:     `$${raw.price.toFixed(2)}`,
    changeFormatted:    `${sign}${raw.change.toFixed(2)} (${sign}${raw.changePercent.toFixed(2)}%)`,
    marketCapFormatted: raw.marketCap != null ? formatLargeNumber(raw.marketCap) : null,
    volume:             raw.volume ?? null,
    volumeFormatted:    raw.volume != null ? formatVolume(raw.volume) : null,
  };
}

/**
 * Sorts and de-duplicates an array of HistoryPoints by date (ascending).
 * Filters out any rows with a non-positive close price.
 * Safe to call on already-sorted data — produces a new array.
 */
export function normalizeHistory(points: HistoryPoint[]): HistoryPoint[] {
  const seen = new Set<string>();
  return points
    .filter((p) => p.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((p) => {
      if (seen.has(p.date)) return false;
      seen.add(p.date);
      return true;
    });
}

/**
 * Aggregates a flat HistoryPoint array into per-calendar-quarter summaries.
 *
 * Input  : any time range of daily/weekly HistoryPoints (sorted or unsorted)
 * Output : one QuarterlyPoint per calendar quarter found in the data,
 *          sorted chronologically.
 *
 * Intended use: feed quarter-window history into this function and render
 * the result as an area/bar chart to show the quarterly price trend.
 */
export function aggregateQuarters(points: HistoryPoint[]): QuarterlyPoint[] {
  // Group normalised points by "YYYY-Qn" bucket key
  const buckets = new Map<string, HistoryPoint[]>();

  for (const p of normalizeHistory(points)) {
    const d       = new Date(p.date);
    const year    = d.getUTCFullYear();
    const quarter = monthToQuarter(d.getUTCMonth());
    const key     = `${year}-Q${quarter}`;

    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(p);
    } else {
      buckets.set(key, [p]);
    }
  }

  // Reduce each bucket to a QuarterlyPoint
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => {
      const closes  = bucket.map((p) => p.close);
      const [yearStr, qStr] = key.split('-');
      const year    = Number(yearStr);
      const quarter = Number(qStr.slice(1)); // strip "Q"

      const sum     = closes.reduce((acc, c) => acc + c, 0);
      return {
        label:    quarterLabel(year, quarter),
        year,
        quarter,
        avgClose: parseFloat((sum / closes.length).toFixed(2)),
        minClose: parseFloat(Math.min(...closes).toFixed(2)),
        maxClose: parseFloat(Math.max(...closes).toFixed(2)),
        endClose: closes[closes.length - 1],
      };
    });
}
