/**
 * PeriodComparisonView
 *
 * Shared by the Last 7 Days and Last Quarter views. For the selected window it shows:
 *   - KPI cards: IBM return, rank vs peers, best performer, IBM high / low
 *   - line chart of % change since the start of the period (rebased so
 *     companies with different share prices are directly comparable)
 *   - bar chart of period return
 *   - table with start / end / high / low / return per company
 */
import type { CSSProperties } from 'react';
import type { CompanyInfo, TimeWindow } from '../../types/finance.ts';
import { FOCUS_TICKER } from '../../constants/companies.ts';
import { useCompanyHistories } from '../../hooks/useCompanyHistories.ts';
import { buildPeriodRows, formatPercent, peerComparison, toPercentSeries } from '../../utils/comparison.ts';
import { PriceLineChart } from '../charts/PriceLineChart.tsx';
import { ReturnBarChart } from '../charts/ReturnBarChart.tsx';
import { Panel } from '../shared/Panel.tsx';
import { StatCard } from '../shared/StatCard.tsx';
import { statGridStyle, toneFor } from '../shared/statCardUtils.ts';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import { ErrorBanner } from '../shared/ErrorBanner.tsx';

interface PeriodComparisonViewProps {
  companies:   CompanyInfo[];
  window:      Exclude<TimeWindow, 'day'>;
  /** e.g. "7 days" — used in card and chart labels */
  periodLabel: string;
}

const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const cellStyle:  CSSProperties = { padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' };
const nameCell:   CSSProperties = { ...cellStyle, textAlign: 'left' };

export function PeriodComparisonView({ companies, window, periodLabel }: PeriodComparisonViewProps) {
  const { series, errors, isLoading } = useCompanyHistories(companies, window);

  if (isLoading) return <LoadingSpinner label="Loading chart data…" />;
  if (errors.length > 0 && series.length === 0) return <ErrorBanner message={errors.join('; ')} />;

  const rows    = buildPeriodRows(series);
  const focus   = rows.find((r) => r.ticker === FOCUS_TICKER);
  const peers   = peerComparison(rows.map((r) => ({ ticker: r.ticker, value: r.stats.returnPct })));
  const best    = [...rows].sort((a, b) => b.stats.returnPct - a.stats.returnPct)[0];
  const bars    = rows.map((r) => ({ ticker: r.ticker, name: r.name, color: r.color, value: r.stats.returnPct }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {errors.length > 0 && <ErrorBanner message={errors.join('; ')} />}

      {focus && (
        <div style={statGridStyle}>
          <StatCard
            label={`${focus.name} return (${periodLabel})`}
            value={formatPercent(focus.stats.returnPct)}
            detail={`$${focus.stats.start.toFixed(2)} → $${focus.stats.end.toFixed(2)}`}
            tone={toneFor(focus.stats.returnPct)}
            accent={focus.color}
          />
          {peers && (
            <StatCard
              label={`${focus.name} vs peers`}
              value={`#${peers.rank} of ${peers.total}`}
              detail={`Peer avg ${formatPercent(peers.peerAvg)}`}
              tone={toneFor(peers.value - peers.peerAvg)}
            />
          )}
          {best && (
            <StatCard
              label="Best performer"
              value={best.name}
              detail={formatPercent(best.stats.returnPct)}
              tone={toneFor(best.stats.returnPct)}
            />
          )}
          <StatCard
            label={`${focus.name} high / low`}
            value={`$${focus.stats.high.toFixed(0)} / $${focus.stats.low.toFixed(0)}`}
          />
        </div>
      )}

      <Panel title={`Performance — last ${periodLabel}`} subtitle="Percent change since the start of the period">
        <PriceLineChart series={toPercentSeries(series)} valueMode="percent" highlight={FOCUS_TICKER} height={320} />
      </Panel>

      <Panel title="Return by company" subtitle={`Total return over the last ${periodLabel}`}>
        <ReturnBarChart data={bars} />
      </Panel>

      <Panel title="Details">
        <table style={tableStyle}>
          <thead>
            <tr style={{ color: '#57606a' }}>
              <th style={nameCell}>Company</th>
              <th style={cellStyle}>Start</th>
              <th style={cellStyle}>End</th>
              <th style={cellStyle}>High</th>
              <th style={cellStyle}>Low</th>
              <th style={cellStyle}>Return</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ticker} style={{ fontWeight: r.ticker === FOCUS_TICKER ? 600 : 400 }}>
                <td style={nameCell}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: r.color, marginRight: 8 }} />
                  {r.name}
                </td>
                <td style={cellStyle}>${r.stats.start.toFixed(2)}</td>
                <td style={cellStyle}>${r.stats.end.toFixed(2)}</td>
                <td style={cellStyle}>${r.stats.high.toFixed(2)}</td>
                <td style={cellStyle}>${r.stats.low.toFixed(2)}</td>
                <td style={{ ...cellStyle, color: r.stats.returnPct >= 0 ? '#0e9f6e' : '#e02424' }}>
                  {formatPercent(r.stats.returnPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
