/**
 * StatCard
 *
 * Compact KPI card: label, large value and an optional detail line.
 * `tone` colours the detail line; `accent` sets the top-border colour.
 */
import type { CSSProperties } from 'react';
import { TONE_COLORS } from './statCardUtils.ts';
import type { Tone } from './statCardUtils.ts';

interface StatCardProps {
  label:   string;
  value:   string;
  detail?: string;
  tone?:   Tone;
  /** Optional top-border accent colour (e.g. the company colour) */
  accent?: string;
}

export function StatCard({ label, value, detail, tone = 'neutral', accent }: StatCardProps) {
  const style: CSSProperties = {
    background:    '#ffffff',
    border:        '1px solid #e5e7eb',
    borderTop:     `3px solid ${accent ?? '#e5e7eb'}`,
    borderRadius:  8,
    padding:       '12px 16px',
    display:       'flex',
    flexDirection: 'column',
    gap:           2,
  };

  return (
    <div style={style}>
      <div style={{ fontSize: 12, color: '#57606a' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#1f2328' }}>{value}</div>
      {detail && <div style={{ fontSize: 13, color: TONE_COLORS[tone] }}>{detail}</div>}
    </div>
  );
}
