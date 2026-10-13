import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../../src/components/dashboard/DashboardPage.tsx';

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe('DashboardPage', () => {
  it('renders all three time-window tabs', () => {
    renderWithQueryClient(<DashboardPage />);
    expect(screen.getByRole('tab', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Last 7 Days' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Last Quarter' })).toBeInTheDocument();
  });

  it('defaults to the Today view', () => {
    renderWithQueryClient(<DashboardPage />);
    const todayTab = screen.getByRole('tab', { name: 'Today' });
    expect(todayTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Market Summary — Today')).toBeInTheDocument();
  });

  it('shows IBM and four competitors with prices on the Today view', async () => {
    renderWithQueryClient(<DashboardPage />);
    for (const ticker of ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM']) {
      expect(await screen.findByTestId(`quote-card-${ticker}`)).toBeInTheDocument();
    }
    expect(await within(screen.getByTestId('quote-card-IBM')).findByText('$231.45')).toBeInTheDocument();
    expect(await screen.findByText('Top mover today')).toBeInTheDocument();
    expect(await screen.findByText(/IBM vs peers today/)).toBeInTheDocument();
  });

  it('switches to Last 7 Days view on tab click', async () => {
    renderWithQueryClient(<DashboardPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'Last 7 Days' }));
    expect(screen.getByText('Trend Comparison — Last 7 Days')).toBeInTheDocument();
    expect(await screen.findByText(/Performance — last 7 days/)).toBeInTheDocument();
    expect(await screen.findByText('Return by company')).toBeInTheDocument();
    expect(await screen.findByText('Best performer')).toBeInTheDocument();
  });

  it('switches to Last Quarter view on tab click', async () => {
    renderWithQueryClient(<DashboardPage />);
    await userEvent.click(screen.getByRole('tab', { name: 'Last Quarter' }));
    expect(screen.getByText('Quarter Comparison — Last 90 Days')).toBeInTheDocument();
    expect(await screen.findByText(/Performance — last quarter/)).toBeInTheDocument();
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(6); // header + 5 companies
  });
});
