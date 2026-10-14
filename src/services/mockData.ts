/**
 * Static mock data used in tests and when VITE_USE_MOCK=true.
 * Each entry covers the full history needed for day / 7d / quarter windows.
 *
 * Adding a new company:
 *   1. Add an entry to MOCK_QUOTES (with realistic price, change, volume, marketCap)
 *   2. Add a matching entry to MOCK_HISTORY using syntheticHistory()
 *   3. Add the company to constants/companies.ts (only needed for DEFAULT_COMPANIES)
 *
 * AMZN and GOOGL are included here so the user-selected company feature can be
 * exercised in mock / test mode without hitting the error path.
 */
import type { Quote, HistoryPoint } from '../types/finance.ts';

export const MOCK_QUOTES: Record<string, Quote> = {
  IBM:  {
    ticker: 'IBM',  name: 'IBM',
    price: 231.45,  change:  1.23, changePercent:  0.53,
    volume: 3_850_000,   marketCap: 208_400_000_000,
  },
  MSFT: {
    ticker: 'MSFT', name: 'Microsoft',
    price: 512.80,  change: -2.10, changePercent: -0.41,
    volume: 18_200_000,  marketCap: 3_810_000_000_000,
  },
  ORCL: {
    ticker: 'ORCL', name: 'Oracle',
    price: 195.60,  change:  3.40, changePercent:  1.77,
    volume: 7_100_000,   marketCap: 535_000_000_000,
  },
  SAP:  {
    ticker: 'SAP',  name: 'SAP',
    price: 248.75,  change:  0.95, changePercent:  0.38,
    volume: 1_250_000,   marketCap: 300_000_000_000,
  },
  CRM:  {
    ticker: 'CRM',  name: 'Salesforce',
    price: 318.20,  change: -1.85, changePercent: -0.58,
    volume: 5_900_000,   marketCap: 308_000_000_000,
  },
  AMZN: {
    ticker: 'AMZN', name: 'Amazon',
    price: 228.50,  change:  2.75, changePercent:  1.22,
    volume: 32_000_000,  marketCap: 2_410_000_000_000,
  },
  GOOGL: {
    ticker: 'GOOGL', name: 'Alphabet',
    price: 194.30,  change: -0.85, changePercent: -0.44,
    volume: 22_500_000,  marketCap: 2_380_000_000_000,
  },
};

/**
 * Generate n synthetic daily OHLCV history points seeded from a base price.
 * Uses deterministic trigonometric jitter so tests produce stable values.
 *
 * Each daily bar includes open/high/low derived from the close so the data
 * is realistic for candlestick or range charts.
 */
function syntheticHistory(baseTicker: string, days: number): HistoryPoint[] {
  const base   = MOCK_QUOTES[baseTicker]?.price ?? 100;
  const volBase = MOCK_QUOTES[baseTicker]?.volume ?? 1_000_000;
  const points: HistoryPoint[] = [];
  const now    = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    // Deterministic intraday spread based on position in series
    const drift  = Math.sin(i * 17 + base) * 0.03;
    const spread = Math.abs(Math.cos(i * 7 + base)) * 0.015;

    const close  = parseFloat((base * (1 + drift)).toFixed(2));
    const open   = parseFloat((close * (1 - spread * 0.5)).toFixed(2));
    const high   = parseFloat((close * (1 + spread)).toFixed(2));
    const low    = parseFloat((close * (1 - spread)).toFixed(2));
    const volume = Math.round(volBase * (0.8 + Math.abs(Math.sin(i * 3)) * 0.4));

    points.push({ date: d.toISOString().slice(0, 10), close, open, high, low, volume });
  }
  return points;
}

export const MOCK_HISTORY: Record<string, HistoryPoint[]> = {
  IBM:   syntheticHistory('IBM',   90),
  MSFT:  syntheticHistory('MSFT',  90),
  ORCL:  syntheticHistory('ORCL',  90),
  SAP:   syntheticHistory('SAP',   90),
  CRM:   syntheticHistory('CRM',   90),
  AMZN:  syntheticHistory('AMZN',  90),
  GOOGL: syntheticHistory('GOOGL', 90),
};
