import type { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

const spinnerStyle: CSSProperties = {
  display:      'inline-block',
  width:        32,
  height:       32,
  border:       '3px solid #e5e7eb',
  borderTop:    '3px solid #1a56db',
  borderRadius: '50%',
  animation:    'spin 0.8s linear infinite',
};

const wrapperStyle: CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            8,
  padding:        24,
  color:          '#57606a',
  fontSize:       13,
};

export function LoadingSpinner({ size = 32, label = 'Loading…' }: LoadingSpinnerProps) {
  return (
    <div style={wrapperStyle} role="status" aria-label={label}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ ...spinnerStyle, width: size, height: size }} />
      <span>{label}</span>
    </div>
  );
}
