import Link from 'next/link';
import BrandLogo from '../components/BrandLogo';

/**
 * Global 404 — brand-styled "not found" page.
 */
export default function NotFound() {
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
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold, #facc15)',
            margin: '0 0 8px',
          }}
        >
          404
        </p>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: '0 0 12px',
          }}
        >
          This page hasn&apos;t been unlocked yet
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-muted, #94a3b8)',
            margin: '0 0 24px',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            borderRadius: 'var(--radius-md, 18px)',
            border: 'none',
            background: 'var(--gold, #facc15)',
            color: '#0d0d14',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
