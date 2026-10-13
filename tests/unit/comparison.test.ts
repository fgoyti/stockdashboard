import { describe, it, expect } from 'vitest';
import {
  periodStats,
  buildPeriodRows,
  toPercentSeries,
  peerComparison,
  formatPercent,
} from '../../src/utils/comparison.ts';
import type { ChartSeries } from '../../src/components/charts/PriceLineChart.tsx';

const series = (ticker: string, closes: number[]): ChartSeries => ({
  ticker,
  name:  ticker,
  color: '#000000',
  data:  closes.map((close, i) => ({ date: `2025-01-0${i + 1}`, close })),
});

describe('periodStats', () => {
  it('returns null for empty input', () => {
    expect(periodStats([])).toBeNull();
  });

  it('computes start, end, high, low and return %', () => {
    const stats = periodStats(series('X', [100, 120, 90, 110]).data);
    expect(stats).toEqual({ start: 100, end: 110, high: 120, low: 90, returnPct: 10 });
  });
});

describe('buildPeriodRows', () => {
  it('skips series with no data', () => {
    const rows = buildPeriodRows([series('A', [10, 11]), series('B', [])]);
    expect(rows.map((r) => r.ticker)).toEqual(['A']);
    expect(rows[0].stats.returnPct).toBeCloseTo(10);
  });
});

describe('toPercentSeries', () => {
  it('rebases each series so the first point is 0%', () => {
    const [s] = toPercentSeries([series('A', [50, 55, 45])]);
    expect(s.data.map((p) => p.close)).toEqual([0, 10, -10]);
  });

  it('returns empty data for an empty series', () => {
    expect(toPercentSeries([series('A', [])])[0].data).toEqual([]);
  });
});

describe('peerComparison', () => {
  const items = [
    { ticker: 'IBM',  value: 2 },
    { ticker: 'MSFT', value: 4 },
    { ticker: 'ORCL', value: 1 },
    { ticker: 'SAP',  value: -1 },
  ];

  it('ranks the focus ticker and averages the peers', () => {
    expect(peerComparison(items)).toEqual({ value: 2, peerAvg: (4 + 1 - 1) / 3, rank: 2, total: 4 });
  });

  it('returns null when the focus ticker or peers are missing', () => {
    expect(peerComparison(items.slice(1))).toBeNull();
    expect(peerComparison([items[0]])).toBeNull();
  });
});

describe('formatPercent', () => {
  it('adds a sign for positive values', () => {
    expect(formatPercent(1.234)).toBe('+1.23%');
    expect(formatPercent(-0.5)).toBe('-0.50%');
    expect(formatPercent(0)).toBe('+0.00%');
  });
});
