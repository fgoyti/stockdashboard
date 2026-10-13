/**
 * useCompanyQuotes
 *
 * Fetches a display-ready QuoteSummary for every company in parallel.
 * Returns one entry per company (in input order) with its own loading / error state.
 */
import { useQueries } from '@tanstack/react-query';
import { getQuoteSummary } from '../services/financeService.ts';
import type { CompanyInfo, QuoteSummary } from '../types/finance.ts';

export interface QuoteEntry {
  company:   CompanyInfo;
  summary:   QuoteSummary | null;
  isLoading: boolean;
  error:     string | null;
}

export function useCompanyQuotes(companies: CompanyInfo[]): QuoteEntry[] {
  const results = useQueries({
    queries: companies.map((c) => ({
      queryKey:  ['quoteSummary', c.ticker] as const,
      queryFn:   () => getQuoteSummary(c.ticker),
      staleTime: 60_000,
    })),
  });

  return companies.map((company, i) => ({
    company,
    summary:   results[i].data ?? null,
    isLoading: results[i].isLoading,
    error:     results[i].error?.message ?? null,
  }));
}
