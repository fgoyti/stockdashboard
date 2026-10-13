/**
 * AppShell
 *
 * Top navigation bar and outer page wrapper.
 * Kept intentionally simple for the workshop — the shell
 * can be extended with routing in a future enhancement.
 */
import type { CSSProperties } from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

const navStyle: CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  padding:        '0 20px',
  height:         56,
  background:     '#1a56db',
  color:          '#ffffff',
  boxShadow:      '0 1px 3px rgba(0,0,0,0.12)',
};

const logoStyle: CSSProperties = {
  fontSize:   18,
  fontWeight: 700,
  letterSpacing: '0.02em',
};

const subStyle: CSSProperties = {
  fontSize:    12,
  marginLeft:  10,
  opacity:     0.75,
  fontWeight:  400,
};

const contentStyle: CSSProperties = {
  minHeight:  'calc(100vh - 56px)',
  background: '#f7f8fa',
};

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <nav style={navStyle}>
        <span style={logoStyle}>IBM Market Dashboard</span>
        <span style={subStyle}>Finance Analytics Lab</span>
      </nav>
      <main style={contentStyle}>
        {children}
      </main>
    </>
  );
}
