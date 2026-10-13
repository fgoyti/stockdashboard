/**
 * Pure helpers for comparing IBM against its peers.
 *
 *   periodStats       HistoryPoint[] → start / end / high / low / return %
 *   buildPeriodRows   ChartSeries[]  → one PeriodRow per company
 *   toPercentSeries   ChartSeries[]  → series rebased to % change since period start
 *   peerComparison    values[]       → IBM value, rank and peer average
 *   formatPercent     number         → "+1.23%"
 */
import type { HistoryPoint } from '../types/finance.ts';
import type { ChartSeries } from '../components/charts/PriceLineChart.tsx';
import { FOCUS_TICKER } from '../constants/companies.ts';

export interface PeriodStats {
  start:     number;
  end:       number;
  high:      number;
  low:       number;
  returnPct: number;
}

export interface PeriodRow {
  ticker: string;
  name:   string;
  color:  string;
  stats:  PeriodStats;
}

export interface PeerComparison {
  value:   number;
  peerAvg: number;
  /** 1 = best performer */
  rank:    number;
  total:   number;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/** Summarises a sorted history. Returns null for an empty history. */
export function periodStats(points: HistoryPoint[]): PeriodStats | null {
  if (points.length === 0) return null;
  const closes = points.map((p) => p.close);
  const start  = closes[0];
  const end    = closes[closes.length - 1];
  return {
    start,
    end,
    high:      Math.max(...closes),
    low:       Math.min(...closes),
    returnPct: ((end - start) / start) * 100,
  };
}

export function buildPeriodRows(series: ChartSeries[]): PeriodRow[] {
  return series.flatMap((s) => {
    const stats = periodStats(s.data);
    return stats ? [{ ticker: s.ticker, name: s.name, color: s.color, stats }] : [];
  });
}

/** Rebases each series so the first point is 0% — makes different price levels comparable. */
export function toPercentSeries(series: ChartSeries[]): ChartSeries[] {
  return series.map((s) => {
    const start = s.data[0]?.close;
    return {
      ...s,
      data: start ? s.data.map((p) => ({ date: p.date, close: ((p.close - start) / start) * 100 })) : [],
    };
  });
}

/** Compares the focus ticker (IBM) with the average of the other tickers. */
export function peerComparison(
  items: { ticker: string; value: number }[],
  focus: string = FOCUS_TICKER,
): PeerComparison | null {
  const focusItem = items.find((i) => i.ticker === focus);
  const peers     = items.filter((i) => i.ticker !== focus);
  if (!focusItem || peers.length === 0) return null;

  return {
    value:   focusItem.value,
    peerAvg: peers.reduce((sum, p) => sum + p.value, 0) / peers.length,
    rank:    1 + peers.filter((p) => p.value > focusItem.value).length,
    total:   items.length,
  };
}
