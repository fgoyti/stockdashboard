import type { CompanyInfo } from '../types/finance.ts';

/** The company the dashboard is centred on; all others are treated as peers. */
export const FOCUS_TICKER = 'IBM';

// Default set of companies tracked by the dashboard (IBM first, then competitors)
export const DEFAULT_COMPANIES: CompanyInfo[] = [
  { ticker: 'IBM',  name: 'IBM',        color: '#1a56db' },
  { ticker: 'MSFT', name: 'Microsoft',  color: '#7e3af2' },
  { ticker: 'ORCL', name: 'Oracle',     color: '#e3a008' },
  { ticker: 'SAP',  name: 'SAP',        color: '#0e9f6e' },
  { ticker: 'CRM',  name: 'Salesforce', color: '#e02424' },
];

export const TIME_WINDOW_LABELS: Record<string, string> = {
  day:     'Today',
  '7d':    'Last 7 Days',
  quarter: 'Last Quarter',
};
