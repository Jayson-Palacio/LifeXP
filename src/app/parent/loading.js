const css = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes cosmicGradient {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes auraFloat {
    0%, 100% { transform: scale(1);   opacity: 0.5; }
    50%       { transform: scale(1.1); opacity: 0.85; }
  }
  .sk-shimmer {
    background: linear-gradient(
      90deg,
      rgba(99,102,241,0.07) 0%,
      rgba(168,85,247,0.18) 40%,
      rgba(99,102,241,0.07) 80%
    );
    background-size: 250% 100%;
    animation: shimmer 1.8s ease-in-out infinite;
    flex-shrink: 0;
  }
`;

const S = ({ w = '100%', h = 16, r = 8, style = {} }) => (
  <div className="sk-shimmer" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

export default function Loading() {
  return (
    <div style={{ minHeight: '100dvh', background: '#0a0814', overflow: 'hidden', position: 'relative' }}>
      <style>{css}</style>

      {/* Cosmic bg */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #000000)',
        backgroundSize: '400% 400%',
        animation: 'cosmicGradient 15s ease infinite',
        opacity: 0.85,
      }} />
      {/* Top glow */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 30% at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '20px 16px' }}>

        {/* ── Tab bar ── */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 28,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12, padding: 4,
          border: '1px solid rgba(139,92,246,0.12)',
        }}>
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div key={i} className="sk-shimmer" style={{
              flex: 1, height: 38, borderRadius: 9,
              ...(i === 0 ? {
                background: 'linear-gradient(90deg, rgba(99,102,241,0.4) 0%, rgba(168,85,247,0.4) 100%)',
                backgroundSize: '250% 100%',
              } : {}),
            }} />
          ))}
        </div>

        {/* ── Header row ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <S w={90} h={11} r={4} />
            <S w={200} h={30} r={8} />
          </div>
          <S w={80} h={34} r={20} />
        </div>

        {/* ── Family card grid — 2 col ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              padding: 16, borderRadius: 18,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.15)',
              backdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', gap: 12,
              // stagger opacity so it looks alive
              opacity: i === 0 ? 1 : 0.75,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar with glow ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="sk-shimmer" style={{
                    width: 52, height: 52, borderRadius: '50%',
                    border: '2px solid rgba(168,85,247,0.3)',
                  }} />
                  <div style={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent 70%)',
                    animation: 'auraFloat 2.5s ease-in-out infinite',
                  }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <S w="70%" h={16} r={6} />
                  <S w="50%" h={12} r={4} />
                </div>
              </div>
              {/* XP bar */}
              <div style={{ height: 7, borderRadius: 10, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div className="sk-shimmer" style={{ width: `${55 + i * 15}%`, height: '100%', borderRadius: 10 }} />
              </div>
              {/* Stat chips */}
              <div style={{ display: 'flex', gap: 6 }}>
                <S w={58} h={24} r={20} />
                <S w={58} h={24} r={20} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Pending approvals section ── */}
        <S w={190} h={20} r={6} style={{ marginBottom: 14 }} />
        {[1, 0.7].map((opacity, i) => (
          <div key={i} style={{
            padding: 16, borderRadius: 16, marginBottom: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(250,204,21,0.1)',
            backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', gap: 12,
            opacity,
          }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="sk-shimmer" style={{
                width: 54, height: 54, borderRadius: 14, flexShrink: 0,
              }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <S w="38%" h={11} r={4} />
                <S w="68%" h={18} r={6} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <S w={58} h={22} r={20} />
                  <S w={58} h={22} r={20} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <S w="28%" h={42} r={12} />
              <S w="72%" h={42} r={12} />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
