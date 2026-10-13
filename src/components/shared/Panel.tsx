/**
 * Panel
 *
 * White bordered container with an optional title and subtitle.
 * Shared by all dashboard views for consistent look.
 */
import type { CSSProperties, ReactNode } from 'react';

interface PanelProps {
  title?:    string;
  subtitle?: string;
  children:  ReactNode;
}

const panelStyle: CSSProperties = {
  background:   '#ffffff',
  border:       '1px solid #e5e7eb',
  borderRadius: 8,
  padding:      16,
};

export function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section style={panelStyle}>
      {title && (
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1f2328', margin: 0 }}>{title}</h3>
      )}
      {subtitle && (
        <p style={{ fontSize: 12, color: '#57606a', margin: '2px 0 0' }}>{subtitle}</p>
      )}
      <div style={{ marginTop: title ? 12 : 0 }}>{children}</div>
    </section>
  );
}
