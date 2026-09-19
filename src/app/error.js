'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import BrandLogo from '../components/BrandLogo';

/**
 * Root error boundary — replaces the crashing subtree with a friendly,
 * brand-styled fallback. `error` carries the thrown error; `reset` retries.
 */
export default function GlobalError({ error, reset }) {
  // Auto-log on the console for local diagnosis; the UI stays calm.
  useEffect(() => {
    console.error('Kaeluma error boundary caught:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--bg-deep, #0d0d14)',
        color: 'var(--text-bright, #f8fafc)',
        fontFamily: 'var(--font-main, system-ui, sans-serif)',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <BrandLogo href="/" size="md" />
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: '0 0 12px',
            color: 'var(--gold, #facc15)',
          }}
        >
          Something went off the beaten path
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-muted, #94a3b8)',
            margin: '0 0 24px',
          }}
        >
          We hit an unexpected error. Your data is safe — try again, or head
          back to the dashboard.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md, 18px)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 14,
              background: 'var(--gold, #facc15)',
              color: '#0d0d14',
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md, 18px)',
              border: '1px solid var(--bg-glass-border, rgba(255,255,255,0.08))',
              background: 'var(--bg-glass, rgba(255,255,255,0.03))',
              color: 'var(--text-bright, #f8fafc)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
