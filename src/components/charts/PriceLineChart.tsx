/**
 * PriceLineChart
 *
 * Multi-series line chart. Accepts an array of { ticker, color, data } series.
 *
 *   valueMode="price"   → y-axis in dollars (default)
 *   valueMode="percent" → y-axis in % change (series are expected to be rebased)
 *   highlight           → ticker drawn with a thicker line; others are thinner
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryPoint } from '../../types/finance.ts';

export interface ChartSeries {
  ticker: string;
  name:   string;
  color:  string;
  data:   HistoryPoint[];
}

interface PriceLineChartProps {
  series:     ChartSeries[];
  height?:    number;
  valueMode?: 'price' | 'percent';
  highlight?: string;
}

/** Merge multiple series onto a shared date axis */
function mergeSeriesData(
  series: ChartSeries[],
): Record<string, string | number>[] {
  const dateMap = new Map<string, Record<string, string | number>>();

  for (const s of series) {
    for (const point of s.data) {
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, { date: point.date });
      }
      dateMap.get(point.date)![s.ticker] = point.close;
    }
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    (a.date as string).localeCompare(b.date as string),
  );
}

export function PriceLineChart({
  series,
  height = 280,
  valueMode = 'price',
  highlight,
}: PriceLineChartProps) {
  const merged    = mergeSeriesData(series);
  const isPercent = valueMode === 'percent';

  const formatTick = (v: number) => (isPercent ? `${v.toFixed(0)}%` : `$${v.toFixed(0)}`);
  const formatTip  = (v: number) =>
    isPercent ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : `$${v.toFixed(2)}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#57606a' }}
          tickFormatter={(v: string) => v.slice(5)} // MM-DD
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#57606a' }}
          tickFormatter={formatTick}
          width={56}
        />
        <Tooltip
          formatter={(value, name) => [formatTip(Number(value)), String(name)]}
          labelFormatter={(label) => `Date: ${String(label)}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => {
          const isFocus = highlight === undefined || s.ticker === highlight;
          return (
            <Line
              key={s.ticker}
              type="monotone"
              dataKey={s.ticker}
              name={s.name}
              stroke={s.color}
              strokeWidth={isFocus ? 3 : 1.5}
              strokeOpacity={isFocus ? 1 : 0.7}
              dot={false}
              activeDot={{ r: 4 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
