import { describe, it, expect } from 'vitest';
import {
  normalizeQuote,
  normalizeHistory,
  aggregateQuarters,
} from '../../src/utils/normalizers.ts';
import type { Quote, HistoryPoint } from '../../src/types/finance.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const IBM_QUOTE: Quote = {
  ticker:        'IBM',
  name:          'IBM',
  price:         231.45,
  change:        1.23,
  changePercent: 0.53,
  volume:        3_850_000,
  marketCap:     208_400_000_000,
};

const NEG_QUOTE: Quote = {
  ticker:        'MSFT',
  name:          'Microsoft',
  price:         512.80,
  change:        -2.10,
  changePercent: -0.41,
  volume:        18_200_000,
  marketCap:     3_810_000_000_000,
};

const SPARSE_QUOTE: Quote = {
  ticker:        'TST',
  name:          'Test Co',
  price:         10.00,
  change:        0,
  changePercent: 0,
  // volume and marketCap intentionally absent
};

// ---------------------------------------------------------------------------
// normalizeQuote
// ---------------------------------------------------------------------------

describe('normalizeQuote', () => {
  it('sets isPositive=true for zero or positive changePercent', () => {
    expect(normalizeQuote(IBM_QUOTE).isPositive).toBe(true);
    const flat = normalizeQuote({ ...IBM_QUOTE, changePercent: 0, change: 0 });
    expect(flat.isPositive).toBe(true);
  });

  it('sets isPositive=false for negative changePercent', () => {
    expect(normalizeQuote(NEG_QUOTE).isPositive).toBe(false);
  });

  it('formats priceFormatted as $ with 2 decimal places', () => {
    expect(normalizeQuote(IBM_QUOTE).priceFormatted).toBe('$231.45');
    expect(normalizeQuote(SPARSE_QUOTE).priceFormatted).toBe('$10.00');
  });

  it('formats positive changeFormatted with leading +', () => {
    const { changeFormatted } = normalizeQuote(IBM_QUOTE);
    expect(changeFormatted).toBe('+1.23 (+0.53%)');
  });

  it('formats negative changeFormatted without double minus', () => {
    const { changeFormatted } = normalizeQuote(NEG_QUOTE);
    expect(changeFormatted).toBe('-2.10 (-0.41%)');
  });

  it('formats marketCap in billions', () => {
    expect(normalizeQuote(IBM_QUOTE).marketCapFormatted).toBe('$208.4B');
  });

  it('formats marketCap in trillions', () => {
    expect(normalizeQuote(NEG_QUOTE).marketCapFormatted).toBe('$3.8T');
  });

  it('returns null marketCapFormatted when marketCap is absent', () => {
    expect(normalizeQuote(SPARSE_QUOTE).marketCapFormatted).toBeNull();
  });

  it('formats volume in millions', () => {
    expect(normalizeQuote(IBM_QUOTE).volumeFormatted).toBe('3.9M');
  });

  it('formats large volume in billions', () => {
    const q = normalizeQuote({ ...IBM_QUOTE, volume: 2_500_000_000 });
    expect(q.volumeFormatted).toBe('2.5B');
  });

  it('returns null volume fields when volume is absent', () => {
    const q = normalizeQuote(SPARSE_QUOTE);
    expect(q.volume).toBeNull();
    expect(q.volumeFormatted).toBeNull();
  });

  it('passes through ticker and name unchanged', () => {
    const q = normalizeQuote(IBM_QUOTE);
    expect(q.ticker).toBe('IBM');
    expect(q.name).toBe('IBM');
  });
});

// ---------------------------------------------------------------------------
// normalizeHistory
// ---------------------------------------------------------------------------

describe('normalizeHistory', () => {
  const raw: HistoryPoint[] = [
    { date: '2025-03-05', close: 230.00 },
    { date: '2025-03-03', close: 228.50 },
    { date: '2025-03-04', close: 229.10 },
    { date: '2025-03-03', close: 228.50 }, // duplicate
    { date: '2025-03-06', close: 0 },      // invalid — zero close
  ];

  it('returns points sorted by date ascending', () => {
    const result = normalizeHistory(raw);
    const dates = result.map((p) => p.date);
    expect(dates).toEqual([...dates].sort());
  });

  it('removes duplicate dates (keeps first occurrence after sort)', () => {
    const result = normalizeHistory(raw);
    const dates = result.map((p) => p.date);
    const unique = new Set(dates);
    expect(dates.length).toBe(unique.size);
  });

  it('filters out rows with close <= 0', () => {
    const result = normalizeHistory(raw);
    expect(result.every((p) => p.close > 0)).toBe(true);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeHistory([])).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const input = [...raw];
    normalizeHistory(input);
    expect(input).toEqual(raw);
  });
});

// ---------------------------------------------------------------------------
// aggregateQuarters
// ---------------------------------------------------------------------------

describe('aggregateQuarters', () => {
  /** 5 trading days in Q1 2025, then 5 in Q2 2025 */
  const points: HistoryPoint[] = [
    // Q1 2025 — January
    { date: '2025-01-06', close: 220 },
    { date: '2025-01-07', close: 222 },
    { date: '2025-01-08', close: 224 },
    { date: '2025-01-09', close: 218 },
    { date: '2025-01-10', close: 226 }, // last in Q1 → endClose
    // Q2 2025 — April
    { date: '2025-04-01', close: 230 },
    { date: '2025-04-02', close: 232 },
    { date: '2025-04-03', close: 228 },
    { date: '2025-04-04', close: 235 },
    { date: '2025-04-07', close: 231 }, // last in Q2 → endClose
  ];

  it('returns one QuarterlyPoint per calendar quarter', () => {
    const result = aggregateQuarters(points);
    expect(result.length).toBe(2);
  });

  it('assigns correct year and quarter numbers', () => {
    const result = aggregateQuarters(points);
    expect(result[0].year).toBe(2025);
    expect(result[0].quarter).toBe(1);
    expect(result[1].year).toBe(2025);
    expect(result[1].quarter).toBe(2);
  });

  it('formats labels as "Qn YYYY"', () => {
    const result = aggregateQuarters(points);
    expect(result[0].label).toBe('Q1 2025');
    expect(result[1].label).toBe('Q2 2025');
  });

  it('calculates correct minClose', () => {
    const result = aggregateQuarters(points);
    expect(result[0].minClose).toBe(218);
    expect(result[1].minClose).toBe(228);
  });

  it('calculates correct maxClose', () => {
    const result = aggregateQuarters(points);
    expect(result[0].maxClose).toBe(226);
    expect(result[1].maxClose).toBe(235);
  });

  it('calculates correct avgClose', () => {
    const result = aggregateQuarters(points);
    const q1avg = (220 + 222 + 224 + 218 + 226) / 5;
    expect(result[0].avgClose).toBe(parseFloat(q1avg.toFixed(2)));
  });

  it('endClose is the last chronological close in the quarter', () => {
    const result = aggregateQuarters(points);
    expect(result[0].endClose).toBe(226);
    expect(result[1].endClose).toBe(231);
  });

  it('returns empty array for empty input', () => {
    expect(aggregateQuarters([])).toEqual([]);
  });

  it('sorts quarters chronologically', () => {
    // Reverse the input order and expect sorted output
    const reversed = [...points].reverse();
    const result = aggregateQuarters(reversed);
    expect(result[0].quarter).toBe(1);
    expect(result[1].quarter).toBe(2);
  });
});
