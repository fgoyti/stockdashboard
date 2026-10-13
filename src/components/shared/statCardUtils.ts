import type { CSSProperties } from 'react';

export type Tone = 'positive' | 'negative' | 'neutral';

export const TONE_COLORS: Record<Tone, string> = {
  positive: '#0e9f6e',
  negative: '#e02424',
  neutral:  '#57606a',
};

export function toneFor(value: number): Tone {
  return value >= 0 ? 'positive' : 'negative';
}

export const statGridStyle: CSSProperties = {
  display:             'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap:                 12,
};
