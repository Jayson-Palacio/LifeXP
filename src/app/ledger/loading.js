'use client';

export default function Loading() {
  return (
    <div className="vital-app ledger-app" style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: 36,
        height: 36,
        margin: '0 auto 16px',
        borderRadius: '50%',
        border: '2px solid rgba(28, 28, 30, 0.12)',
        borderTopColor: '#1c1c1e',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.03em', color: '#1c1c1e', margin: 0 }}>
        Opening Ledger
      </p>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}
