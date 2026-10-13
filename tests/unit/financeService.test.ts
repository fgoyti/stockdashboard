import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getQuote, getQuoteSummary, getHistory, getQuarterlyTrend } from '../../src/services/financeService.ts';
import { MOCK_QUOTES, MOCK_HISTORY } from '../../src/services/mockData.ts';

// Force mock mode on for tests
vi.stubEnv('MODE', 'test');

describe('getQuote (mock mode)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('MODE', 'test');
  });

  it('returns mock quote for IBM', async () => {
    const q = await getQuote('IBM');
    expect(q.ticker).toBe('IBM');
    expect(q.price).toBe(MOCK_QUOTES['IBM'].price);
    expect(typeof q.change).toBe('number');
    expect(typeof q.changePercent).toBe('number');
  });

  it('throws for unknown ticker', async () => {
    await expect(getQuote('UNKNOWN')).rejects.toThrow('No mock data for ticker: UNKNOWN');
  });

  it('is case-insensitive', async () => {
    const q = await getQuote('ibm');
    expect(q.ticker).toBe('IBM');
  });
});

describe('getHistory (mock mode)', () => {
  it('returns array of HistoryPoints for IBM / 7d', async () => {
    const history = await getHistory('IBM', '7d');
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty('date');
    expect(history[0]).toHaveProperty('close');
  });

  it('filters by time window — day < 7d < quarter', async () => {
    const day     = await getHistory('IBM', 'day');
    const week    = await getHistory('IBM', '7d');
    const quarter = await getHistory('IBM', 'quarter');

    // Each smaller window should have <= points than larger ones
    expect(day.length).toBeLessThanOrEqual(week.length);
    expect(week.length).toBeLessThanOrEqual(quarter.length);
  });

  it('throws for unknown ticker', async () => {
    await expect(getHistory('UNKNOWN', '7d')).rejects.toThrow('No mock history for ticker: UNKNOWN');
  });

  it('quarter history has at most 91 points', async () => {
    const quarter = await getHistory('IBM', 'quarter');
    // MOCK_HISTORY is generated for 90 days
    expect(quarter.length).toBeLessThanOrEqual(MOCK_HISTORY['IBM'].length);
  });

  it('returns history sorted by date ascending', async () => {
    const history = await getHistory('IBM', 'quarter');
    for (let i = 1; i < history.length; i++) {
      expect(history[i].date >= history[i - 1].date).toBe(true);
    }
  });
});

describe('getQuoteSummary (mock mode)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('MODE', 'test');
  });

  it('returns a QuoteSummary with formatted fields for IBM', async () => {
    const s = await getQuoteSummary('IBM');
    expect(s.ticker).toBe('IBM');
    expect(s.priceFormatted).toMatch(/^\$\d+\.\d{2}$/);
    expect(typeof s.changeFormatted).toBe('string');
    expect(typeof s.isPositive).toBe('boolean');
  });

  it('includes marketCapFormatted when marketCap is present', async () => {
    const s = await getQuoteSummary('IBM');
    expect(s.marketCapFormatted).not.toBeNull();
  });

  it('includes volumeFormatted when volume is present', async () => {
    const s = await getQuoteSummary('IBM');
    expect(s.volumeFormatted).not.toBeNull();
  });

  it('throws for unknown ticker', async () => {
    await expect(getQuoteSummary('UNKNOWN')).rejects.toThrow('No mock data');
  });
});

describe('getQuarterlyTrend (mock mode)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('MODE', 'test');
  });

  it('returns an array of QuarterlyPoints for IBM', async () => {
    const trend = await getQuarterlyTrend('IBM');
    expect(Array.isArray(trend)).toBe(true);
    expect(trend.length).toBeGreaterThan(0);
  });

  it('each point has label, avgClose, minClose, maxClose, endClose', async () => {
    const [point] = await getQuarterlyTrend('IBM');
    expect(point).toHaveProperty('label');
    expect(point).toHaveProperty('avgClose');
    expect(point).toHaveProperty('minClose');
    expect(point).toHaveProperty('maxClose');
    expect(point).toHaveProperty('endClose');
  });

  it('minClose <= avgClose <= maxClose for every point', async () => {
    const trend = await getQuarterlyTrend('IBM');
    for (const p of trend) {
      expect(p.minClose).toBeLessThanOrEqual(p.avgClose);
      expect(p.avgClose).toBeLessThanOrEqual(p.maxClose);
    }
  });

  it('points are sorted chronologically', async () => {
    const trend = await getQuarterlyTrend('IBM');
    for (let i = 1; i < trend.length; i++) {
      const prev = trend[i - 1];
      const curr = trend[i];
      const prevKey = `${prev.year}-${prev.quarter}`;
      const currKey = `${curr.year}-${curr.quarter}`;
      expect(currKey > prevKey).toBe(true);
    }
  });

  it('throws for unknown ticker', async () => {
    await expect(getQuarterlyTrend('UNKNOWN')).rejects.toThrow('No mock history');
  });
});
