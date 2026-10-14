/**
 * Integration tests for UserCompanyChart + CompanySearchPanel wired through
 * DashboardPage.
 *
 * Strategy:
 *   - Run in mock mode (MODE=test is already set by the test runner).
 *   - Switch to the "Last 7 Days" tab first so the history query always returns
 *     multiple data points (the "day" window only returns today's single bar,
 *     which works fine but makes assertions on loaded state harder to time).
 *   - AMZN is a known mock ticker → success path.
 *   - UNKNOWN is not in mock data → error path.
 *   - Clearing the ticker via the ✕ badge → chart removed.
 *   - Switching the time-window tab after submitting a ticker → chart updates.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from '../../src/components/dashboard/DashboardPage.tsx';

function renderDashboard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}

/** Switch to the "Last 7 Days" tab so history always returns multiple bars. */
async function switchTo7dTab() {
  await userEvent.click(screen.getByRole('tab', { name: 'Last 7 Days' }));
}

/** Submits ticker via the search panel. Call after switchTo7dTab() if needed. */
async function submitTicker(ticker: string) {
  const input = screen.getByRole('searchbox', { name: /stock ticker symbol/i });
  await userEvent.clear(input);
  await userEvent.type(input, ticker);
  await userEvent.click(screen.getByRole('button', { name: /view chart/i }));
}

// Panel title uses an em-dash (U+2014) — match it literally in assertions.
const amznPanelTitle = 'AMZN \u2014 Price history';

describe('Explore a Company — search panel', () => {
  it('renders the "Explore a Company" section heading and input', () => {
    renderDashboard();
    expect(screen.getByText('Explore a Company')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /stock ticker symbol/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view chart/i })).toBeInTheDocument();
  });

  it('"View Chart" button is disabled when the input is empty', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: /view chart/i })).toBeDisabled();
  });

  it('"View Chart" button is enabled once the user types a symbol', async () => {
    renderDashboard();
    await userEvent.type(screen.getByRole('searchbox', { name: /stock ticker symbol/i }), 'AMZN');
    expect(screen.getByRole('button', { name: /view chart/i })).not.toBeDisabled();
  });
});

describe('Explore a Company — valid ticker (AMZN)', () => {
  it('shows the Panel title after submitting a known ticker', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('AMZN');

    expect(await screen.findByText(amznPanelTitle)).toBeInTheDocument();
  });

  it('shows the active ticker badge after submission', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('AMZN');

    expect(await screen.findByRole('button', { name: /clear chart for amzn/i })).toBeInTheDocument();
  });

  it('normalises ticker to upper-case on submission', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('amzn');

    expect(await screen.findByText(amznPanelTitle)).toBeInTheDocument();
  });
});

describe('Explore a Company — invalid ticker', () => {
  it('shows an error banner for an unknown symbol', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('UNKNOWN');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/No mock/i);
  });

  it('does not render a chart panel when the ticker is invalid', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('UNKNOWN');

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Price history/)).not.toBeInTheDocument();
  });
});

describe('Explore a Company — clearing the selection', () => {
  it('removes the chart when the user clicks the clear (✕) button', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('AMZN');

    // Wait for chart to appear
    await screen.findByText(amznPanelTitle);

    // Clear it
    await userEvent.click(screen.getByRole('button', { name: /clear chart for amzn/i }));

    // Chart and badge should be gone
    await waitFor(() => {
      expect(screen.queryByText(amznPanelTitle)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /clear chart for amzn/i })).not.toBeInTheDocument();
  });
});

describe('Explore a Company — persists across time-window tabs', () => {
  it('ticker selection and badge survive a tab switch', async () => {
    renderDashboard();
    await switchTo7dTab();
    await submitTicker('AMZN');
    await screen.findByText(amznPanelTitle);

    // Switch to the Quarter tab (re-uses the same query shape, different window)
    await userEvent.click(screen.getByRole('tab', { name: 'Last Quarter' }));

    // The active ticker badge must still be present — the selection persists
    expect(screen.getByRole('button', { name: /clear chart for amzn/i })).toBeInTheDocument();
    // The section heading is always rendered
    expect(screen.getByText('Explore a Company')).toBeInTheDocument();
    // The panel title should appear once the quarter-window query resolves
    expect(await screen.findByText(amznPanelTitle)).toBeInTheDocument();
  });
});

describe('Existing dashboards — non-regression', () => {
  it('still shows all five default company quote cards on the Today view', async () => {
    renderDashboard();
    for (const ticker of ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM']) {
      expect(await screen.findByTestId(`quote-card-${ticker}`)).toBeInTheDocument();
    }
  });

  it('does not show AMZN or GOOGL in the default Today view quote cards', async () => {
    renderDashboard();
    // Give the default cards time to render
    await screen.findByTestId('quote-card-IBM');
    expect(screen.queryByTestId('quote-card-AMZN')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quote-card-GOOGL')).not.toBeInTheDocument();
  });
});
