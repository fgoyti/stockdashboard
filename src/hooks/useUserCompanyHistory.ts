/**
 * useUserCompanyHistory
 *
 * Fetches price history for a single user-supplied ticker.
 * When ticker is null or an empty string the query is disabled
 * and the hook returns an empty, non-loading state — no request
 * is ever made.
 *
 * Uses the same query-key shape as useCompanyHistories so that
 * React Query cache-shares results when the user types a ticker
 * that is already in DEFAULT_COMPANIES.
 */
import { useQuery } from '@tanstack/react-query';
import { getHistory } from '../services/financeService.ts';
import type { TimeWindow } from '../types/finance.ts';
import type { ChartSeries } from '../components/charts/PriceLineChart.tsx';

/** User-supplied color for the ad-hoc series — distinct from DEFAULT_COMPANIES palette. */
export const USER_COMPANY_COLOR = '#0284c7';

interface UseUserCompanyHistoryResult {
  series: ChartSeries | null;
  isLoading: boolean;
  error: string | null;
}

export function useUserCompanyHistory(
  ticker: string | null,
  window: TimeWindow,
): UseUserCompanyHistoryResult {
  const normalised = ticker ? ticker.trim().toUpperCase() : null;

  const { data, isLoading, error } = useQuery({
    queryKey:  ['history', normalised, window] as const,
    queryFn:   () => getHistory(normalised!, window),
    enabled:   !!normalised,
    staleTime: 60_000,
    retry:     false,
  });

  if (!normalised) {
    return { series: null, isLoading: false, error: null };
  }

  const series: ChartSeries | null =
    data && data.length > 0
      ? { ticker: normalised, name: normalised, color: USER_COMPANY_COLOR, data }
      : null;

  // No data returned (empty array) without an error → treat as unknown symbol
  const noDataError =
    !isLoading && !error && data !== undefined && data.length === 0
      ? `No price data available for "${normalised}".`
      : null;

  return {
    series,
    isLoading,
    error: noDataError ?? (error ? (error as Error).message : null),
  };
}
