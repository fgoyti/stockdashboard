/**
 * ReturnBarChart
 *
 * One bar per company showing a percentage value (e.g. today's change or
 * period return), coloured by company. The focus ticker (IBM) is full
 * opacity; peers are slightly muted so IBM stands out.
 */
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { FOCUS_TICKER } from '../../constants/companies.ts';
import { formatPercent } from '../../utils/comparison.ts';

export interface BarDatum {
  ticker: string;
  name:   string;
  color:  string;
  value:  number;
}

interface ReturnBarChartProps {
  data:    BarDatum[];
  height?: number;
}

export function ReturnBarChart({ data, height = 260 }: ReturnBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#57606a' }} />
        <YAxis
          tick={{ fontSize: 11, fill: '#57606a' }}
          tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          width={48}
        />
        <Tooltip formatter={(v) => [formatPercent(Number(v)), 'Change']} />
        <ReferenceLine y={0} stroke="#9ca3af" />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell
              key={d.ticker}
              fill={d.color}
              fillOpacity={d.ticker === FOCUS_TICKER ? 1 : 0.65}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
