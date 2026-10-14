/**
 * CompanySearchPanel
 *
 * Controlled input that lets the user enter a stock ticker symbol and
 * submit it to the parent. Deliberately stateless — it does not own
 * the resolved ticker; the parent (DashboardPage) does.
 *
 * Props:
 *   onSubmit(ticker)  — called with the trimmed, upper-cased ticker
 *   onClear()         — called when the user explicitly clears the selection
 *   currentTicker     — the currently active ticker (to show a clear button)
 */
import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

interface CompanySearchPanelProps {
  onSubmit: (ticker: string) => void;
  onClear: () => void;
  currentTicker: string | null;
}

const containerStyle: CSSProperties = {
  display:      'flex',
  alignItems:   'center',
  gap:          8,
  flexWrap:     'wrap',
  padding:      '14px 16px',
  background:   '#f7f8fa',
  border:       '1px solid #e5e7eb',
  borderRadius: 8,
};

const labelStyle: CSSProperties = {
  fontSize:   13,
  fontWeight: 600,
  color:      '#1f2328',
  whiteSpace: 'nowrap',
};

const inputStyle: CSSProperties = {
  padding:      '6px 10px',
  fontSize:     13,
  border:       '1px solid #d1d5db',
  borderRadius: 6,
  width:        140,
  outline:      'none',
  color:        '#1f2328',
  background:   '#ffffff',
};

function buttonStyle(primary: boolean): CSSProperties {
  return {
    padding:      '6px 14px',
    fontSize:     13,
    fontWeight:   600,
    border:       primary ? 'none' : '1px solid #d1d5db',
    borderRadius: 6,
    background:   primary ? '#1a56db' : '#ffffff',
    color:        primary ? '#ffffff' : '#57606a',
    cursor:       'pointer',
    whiteSpace:   'nowrap',
  };
}

const activeBadgeStyle: CSSProperties = {
  display:      'flex',
  alignItems:   'center',
  gap:          6,
  padding:      '4px 10px',
  background:   '#dbeafe',
  border:       '1px solid #93c5fd',
  borderRadius: 12,
  fontSize:     12,
  fontWeight:   600,
  color:        '#1d4ed8',
};

export function CompanySearchPanel({
  onSubmit,
  onClear,
  currentTicker,
}: CompanySearchPanelProps) {
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ticker = inputValue.trim().toUpperCase();
    if (!ticker) return;
    onSubmit(ticker);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={containerStyle}
      aria-label="Company search"
    >
      <span style={labelStyle}>Add company chart:</span>

      <input
        type="search"
        aria-label="Stock ticker symbol"
        placeholder="e.g. AAPL, GOOGL"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={inputStyle}
        autoComplete="off"
        spellCheck={false}
      />

      <button
        type="submit"
        disabled={!inputValue.trim()}
        style={buttonStyle(true)}
        aria-label="View chart for entered symbol"
      >
        View Chart
      </button>

      {currentTicker && (
        <div style={activeBadgeStyle}>
          <span>{currentTicker}</span>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear chart for ${currentTicker}`}
            style={{
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              fontSize:   14,
              lineHeight: 1,
              color:      '#1d4ed8',
              padding:    0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </form>
  );
}
