// Core domain types for the finance dashboard

export type TimeWindow = 'day' | '7d' | 'quarter';

export interface Quote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

/**
 * Normalized quote enriched with display-ready fields.
 * Produced by normalizeQuote() and consumed by summary card UI.
 */
export interface QuoteSummary {
  ticker: string;
  name: string;
  /** Latest trade price */
  price: number;
  /** Absolute price change since previous close */
  change: number;
  /** Percentage change since previous close */
  changePercent: number;
  /** true when changePercent >= 0 */
  isPositive: boolean;
  /** Formatted price string, e.g. "$231.45" */
  priceFormatted: string;
  /** Formatted change, e.g. "+1.23 (0.53%)" */
  changeFormatted: string;
  /** Formatted market cap, e.g. "208.4B" */
  marketCapFormatted: string | null;
  /** Raw volume */
  volume: number | null;
  /** Formatted volume, e.g. "4.2M" */
  volumeFormatted: string | null;
}

export interface HistoryPoint {
  date: string; // ISO date string YYYY-MM-DD
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

/**
 * A single aggregated quarterly data point.
 * Produced by aggregateQuarters().
 */
export interface QuarterlyPoint {
  /** Label, e.g. "Q1 2025" */
  label: string;
  /** Calendar year */
  year: number;
  /** Quarter number 1–4 */
  quarter: number;
  /** Average closing price over the quarter */
  avgClose: number;
  /** Lowest close in the quarter */
  minClose: number;
  /** Highest close in the quarter */
  maxClose: number;
  /** Last close of the quarter (period-end price) */
  endClose: number;
}

export interface CompanyInfo {
  ticker: string;
  name: string;
  color: string; // Chart series color
}

export interface MarketDataState {
  quote: Quote | null;
  history: HistoryPoint[];
  isLoading: boolean;
  error: string | null;
}

export interface DashboardConfig {
  companies: CompanyInfo[];
  selectedWindow: TimeWindow;
}
