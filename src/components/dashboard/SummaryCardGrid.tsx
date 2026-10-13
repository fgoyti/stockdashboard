/**
 * SummaryCardGrid
 *
 * One card per company for the Current Day view: price and daily change.
 * Presentational — quote data is supplied by the caller (see useCompanyQuotes).
 */
import type { CSSProperties } from 'react';
import type { QuoteEntry } from '../../hooks/useCompanyQuotes.ts';
import { FOCUS_TICKER } from '../../constants/companies.ts';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import { ErrorBanner } from '../shared/ErrorBanner.tsx';

interface SummaryCardGridProps {
  entries: QuoteEntry[];
}

const gridStyle: CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap:                 12,
};

function QuoteCard({ entry }: { entry: QuoteEntry }) {
  const { company, summary, isLoading, error } = entry;
  const isFocus = company.ticker === FOCUS_TICKER;

  const style: CSSProperties = {
    background:     '#ffffff',
    border:         `1px solid ${isFocus ? company.color : '#e5e7eb'}`,
    borderTop:      `3px solid ${company.color}`,
    borderRadius:   8,
    padding:        16,
    minHeight:      96,
    display:        'flex',
    flexDirection:  'column',
    justifyContent: 'center',
  };

  return (
    <div style={style} data-testid={`quote-card-${company.ticker}`}>
      {isLoading && <LoadingSpinner size={22} label="" />}
      {error && !isLoading && <ErrorBanner message={error} ticker={company.ticker} />}
      {summary && (
        <>
          <div style={{ fontSize: 12, color: '#57606a', marginBottom: 4 }}>
            {summary.name} ({summary.ticker})
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#1f2328' }}>
            {summary.priceFormatted}
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: summary.isPositive ? '#0e9f6e' : '#e02424' }}>
            {summary.isPositive ? '▲' : '▼'} {summary.changeFormatted}
          </div>
          {summary.marketCapFormatted && (
            <div style={{ fontSize: 12, color: '#57606a', marginTop: 6 }}>
              Mkt cap {summary.marketCapFormatted}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function SummaryCardGrid({ entries }: SummaryCardGridProps) {
  return (
    <div style={gridStyle}>
      {entries.map((e) => (
        <QuoteCard key={e.company.ticker} entry={e} />
      ))}
    </div>
  );
}
