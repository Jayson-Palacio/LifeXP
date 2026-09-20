'use client';

const css = `
  @keyframes questsSpin {
    to { transform: rotate(360deg); }
  }
`;

export default function Loading() {
  return (
    <div className="quests-app" style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: 20,
    }}>
      <style>{css}</style>
      <div className="kaeluma-bg" />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{
          width: 36,
          height: 36,
          margin: '0 auto 16px',
          borderRadius: '50%',
          border: '2px solid rgba(28, 28, 30, 0.12)',
          borderTopColor: '#1c1c1e',
          animation: 'questsSpin 0.7s linear infinite',
        }} />
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.03em', color: '#1c1c1e' }}>
          Opening parent mode
        </div>
      </div>
    </div>
  );
}
