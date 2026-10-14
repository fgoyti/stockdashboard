/**
 * DashboardPage
 *
 * Root page component with three views, chosen by tab:
 *   - day     → TodayView            (KPI cards, daily change bar chart, quote cards)
 *   - 7d      → PeriodComparisonView (% performance lines, return bars, table)
 *   - quarter → PeriodComparisonView (same layout over ~90 days)
 *
 * Time-window selection and the optional user-selected company ticker are
 * managed locally via useState. The user-company feature is purely additive —
 * DEFAULT_COMPANIES and all existing sub-views are untouched.
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { TimeWindow } from '../../types/finance.ts';
import { DEFAULT_COMPANIES } from '../../constants/companies.ts';
import { TodayView } from './TodayView.tsx';
import { PeriodComparisonView } from './PeriodComparisonView.tsx';
import { UserCompanyChart } from './UserCompanyChart.tsx';
import { CompanySearchPanel } from '../shared/CompanySearchPanel.tsx';

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: 'day',     label: 'Today' },
  { value: '7d',      label: 'Last 7 Days' },
  { value: 'quarter', label: 'Last Quarter' },
];

const pageStyle: CSSProperties = {
  maxWidth: 1100,
  margin:   '0 auto',
  padding:  '24px 20px',
  textAlign: 'left',
};

const tabBarStyle: CSSProperties = {
  display:       'flex',
  gap:           4,
  marginBottom:  24,
  borderBottom:  '1px solid #e5e7eb',
  paddingBottom: 0,
};

function tabStyle(active: boolean): CSSProperties {
  return {
    padding:      '8px 18px',
    fontSize:     14,
    fontWeight:   active ? 600 : 400,
    color:        active ? '#1a56db' : '#57606a',
    background:   'none',
    border:       'none',
    borderBottom: active ? '2px solid #1a56db' : '2px solid transparent',
    cursor:       'pointer',
    marginBottom: -1,
  };
}

const sectionTitleStyle: CSSProperties = {
  fontSize:     18,
  fontWeight:   600,
  color:        '#1f2328',
  margin:       '0 0 16px',
  textAlign:    'left',
};

export function DashboardPage() {
  const [window, setWindow] = useState<TimeWindow>('day');
  const [userTicker, setUserTicker] = useState<string | null>(null);

  return (
    <div style={pageStyle}>
      {/* Time-window tabs */}
      <nav style={tabBarStyle} role="tablist" aria-label="Time window">
        {TIME_WINDOWS.map((tw) => (
          <button
            key={tw.value}
            role="tab"
            aria-selected={window === tw.value}
            style={tabStyle(window === tw.value)}
            onClick={() => setWindow(tw.value)}
          >
            {tw.label}
          </button>
        ))}
      </nav>

      {window === 'day' && (
        <>
          <h2 style={sectionTitleStyle}>Market Summary — Today</h2>
          <TodayView companies={DEFAULT_COMPANIES} />
        </>
      )}

      {window === '7d' && (
        <>
          <h2 style={sectionTitleStyle}>Trend Comparison — Last 7 Days</h2>
          <PeriodComparisonView companies={DEFAULT_COMPANIES} window="7d" periodLabel="7 days" />
        </>
      )}

      {window === 'quarter' && (
        <>
          <h2 style={sectionTitleStyle}>Quarter Comparison — Last 90 Days</h2>
          <PeriodComparisonView companies={DEFAULT_COMPANIES} window="quarter" periodLabel="quarter" />
        </>
      )}

      {/* ── User-selected company chart ── */}
      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={sectionTitleStyle}>Explore a Company</h2>
        <CompanySearchPanel
          onSubmit={setUserTicker}
          onClear={() => setUserTicker(null)}
          currentTicker={userTicker}
        />
        {userTicker && (
          <UserCompanyChart ticker={userTicker} window={window} />
        )}
      </div>
    </div>
  );
}
