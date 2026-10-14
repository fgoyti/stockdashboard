/**
 * UserCompanyChart
 *
 * Renders a price-history line chart for a single user-supplied ticker.
 * All three loading / error / success states are handled here so the
 * parent (DashboardPage) stays clean.
 *
 * The chart is always shown in "price" mode (absolute dollars) because
 * there is no peer group to rebase against — the user is exploring a
 * single company in isolation.
 */
import type { TimeWindow } from '../../types/finance.ts';
import { useUserCompanyHistory } from '../../hooks/useUserCompanyHistory.ts';
import { PriceLineChart } from '../charts/PriceLineChart.tsx';
import { Panel } from '../shared/Panel.tsx';
import { LoadingSpinner } from '../shared/LoadingSpinner.tsx';
import { ErrorBanner } from '../shared/ErrorBanner.tsx';

interface UserCompanyChartProps {
  ticker: string;
  window: TimeWindow;
}

const WINDOW_LABELS: Record<TimeWindow, string> = {
  day:     'today',
  '7d':    'last 7 days',
  quarter: 'last quarter',
};

export function UserCompanyChart({ ticker, window }: UserCompanyChartProps) {
  const { series, isLoading, error } = useUserCompanyHistory(ticker, window);

  if (isLoading) {
    return <LoadingSpinner label={`Loading data for ${ticker}…`} />;
  }

  if (error) {
    return <ErrorBanner message={error} ticker={ticker} />;
  }

  if (!series) {
    // Covers the empty-data case that did not produce an explicit error
    return (
      <ErrorBanner
        message={`No price data available for "${ticker}".`}
        ticker={ticker}
      />
    );
  }

  return (
    <Panel
      title={`${ticker} — Price history`}
      subtitle={`Closing prices for ${WINDOW_LABELS[window]}`}
    >
      <PriceLineChart series={[series]} valueMode="price" height={300} />
    </Panel>
  );
}
