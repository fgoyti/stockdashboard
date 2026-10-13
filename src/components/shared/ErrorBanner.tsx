import type { CSSProperties } from 'react';

interface ErrorBannerProps {
  message: string;
  ticker?: string;
}

const bannerStyle: CSSProperties = {
  display:      'flex',
  alignItems:   'center',
  gap:          10,
  padding:      '10px 16px',
  borderRadius: 6,
  background:   '#fef2f2',
  border:       '1px solid #fecaca',
  color:        '#991b1b',
  fontSize:     14,
};

const iconStyle: CSSProperties = {
  fontSize: 18,
  flexShrink: 0,
};

export function ErrorBanner({ message, ticker }: ErrorBannerProps) {
  const label = ticker ? `${ticker}: ${message}` : message;
  return (
    <div style={bannerStyle} role="alert" aria-label={label}>
      <span style={iconStyle}>⚠</span>
      <span>{label}</span>
    </div>
  );
}
