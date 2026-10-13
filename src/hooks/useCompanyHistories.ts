/**
 * useCompanyHistories
 *
 * Fetches price history for every company in parallel and returns
 * chart-ready series (companies with no data are omitted).
 */
import { useQueries } from '@tanstack/react-query';
import { getHistory } from '../services/financeService.ts';
import type { CompanyInfo, TimeWindow } from '../types/finance.ts';
import type { ChartSeries } from '../components/charts/PriceLineChart.tsx';

export function useCompanyHistories(companies: CompanyInfo[], window: TimeWindow) {
  const results = useQueries({
    queries: companies.map((c) => ({
      queryKey:  ['history', c.ticker, window] as const,
      queryFn:   () => getHistory(c.ticker, window),
      staleTime: 60_000,
    })),
  });

  const series: ChartSeries[] = companies
    .map((c, i) => ({ ticker: c.ticker, name: c.name, color: c.color, data: results[i].data ?? [] }))
    .filter((s) => s.data.length > 0);

  const errors = companies.flatMap((c, i) => {
    const message = results[i].error?.message;
    return message ? [`${c.ticker}: ${message}`] : [];
  });

  return { series, errors, isLoading: results.some((r) => r.isLoading) };
}
