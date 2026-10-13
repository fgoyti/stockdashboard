/**
 * TodayView
 *
 * Current-day market summary:
 *   - KPI cards for IBM (price, rank vs peers, volume)
 *   - bar chart of today's % change for every company
 *   - quote card per company
 */
import type { CompanyInfo } from '../../types/finance.ts';
import { FOCUS_TICKER } from '../../constants/companies.ts';
import { useCompanyQuotes } from '../../hooks/useCompanyQuotes.ts';
import { peerComparison, formatPercent } from '../../utils/comparison.ts';
import { SummaryCardGrid } from './SummaryCardGrid.tsx';
import { ReturnBarChart } from '../charts/ReturnBarChart.tsx';
import type { BarDatum } from '../charts/ReturnBarChart.tsx';
import { Panel } from '../shared/Panel.tsx';
import { StatCard } from '../shared/StatCard.tsx';
import { statGridStyle, toneFor } from '../shared/statCardUtils.ts';

export function TodayView({ companies }: { companies: CompanyInfo[] }) {
  const entries = useCompanyQuotes(companies);

  const loaded = entries.flatMap((e) => (e.summary ? [{ company: e.company, summary: e.summary }] : []));
  const focus  = loaded.find((l) => l.company.ticker === FOCUS_TICKER);
  const peers  = peerComparison(loaded.map((l) => ({ ticker: l.company.ticker, value: l.summary.changePercent })));

  const bars: BarDatum[] = loaded.map((l) => ({
    ticker: l.company.ticker,
    name:   l.company.name,
    color:  l.company.color,
    value:  l.summary.changePercent,
  }));

  const best = [...loaded].sort((a, b) => b.summary.changePercent - a.summary.changePercent)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {focus && (
        <div style={statGridStyle}>
          <StatCard
            label={`${focus.company.name} price`}
            value={focus.summary.priceFormatted}
            detail={focus.summary.changeFormatted}
            tone={toneFor(focus.summary.changePercent)}
            accent={focus.company.color}
          />
          {peers && (
            <StatCard
              label={`${focus.company.name} vs peers today`}
              value={`#${peers.rank} of ${peers.total}`}
              detail={`Peer avg ${formatPercent(peers.peerAvg)}`}
              tone={toneFor(peers.value - peers.peerAvg)}
            />
          )}
          {best && (
            <StatCard
              label="Top mover today"
              value={best.company.name}
              detail={formatPercent(best.summary.changePercent)}
              tone={toneFor(best.summary.changePercent)}
            />
          )}
          {focus.summary.volumeFormatted && (
            <StatCard label={`${focus.company.name} volume`} value={focus.summary.volumeFormatted} />
          )}
        </div>
      )}

      <Panel title="Daily change by company" subtitle="Percent change since previous close">
        {bars.length > 0 && <ReturnBarChart data={bars} />}
      </Panel>

      <SummaryCardGrid entries={entries} />
    </div>
  );
}
