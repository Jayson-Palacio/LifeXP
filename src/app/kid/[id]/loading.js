const css = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0); }
    50%       { box-shadow: 0 0 0 12px rgba(168,85,247,0.15); }
  }
  @keyframes cosmicGradient {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes floatAvatar {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
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
    border-radius: 8px;
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

      {/* Cosmic animated background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(-45deg, #0f172a, #312e81, #1e1b4b, #000000)',
        backgroundSize: '400% 400%',
        animation: 'cosmicGradient 15s ease infinite',
        opacity: 0.9,
      }} />
      {/* Soft purple radial bloom */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top nav bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(139,92,246,0.15)',
          backdropFilter: 'blur(8px)',
          background: 'rgba(10,8,20,0.4)',
        }}>
          <S w={90} h={32} r={20} />
          <S w={130} h={32} r={20} />
          <S w={90} h={32} r={20} />
        </div>

        {/* ── Glowing floating avatar ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '36px 20px 24px',
          textAlign: 'center',
        }}>
          {/* Avatar ring */}
          <div style={{
            width: 118, height: 118, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.35))',
            border: '3px solid rgba(168,85,247,0.4)',
            animation: 'floatAvatar 3s ease-in-out infinite, pulseGlow 2.5s ease-in-out infinite',
            marginBottom: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(139,92,246,0.12)',
            }} className="sk-shimmer" />
          </div>

          {/* Name + level */}
          <S w={150} h={28} r={10} style={{ marginBottom: 10 }} />
          <S w={100} h={18} r={20} style={{ marginBottom: 18 }} />

          {/* XP bar */}
          <div style={{
            width: '75%', height: 10, borderRadius: 10,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden', marginBottom: 6,
          }}>
            <div className="sk-shimmer" style={{ width: '55%', height: '100%', borderRadius: 10 }} />
          </div>
          <S w={120} h={12} r={6} style={{ marginBottom: 20 }} />

          {/* Stat chips */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[80, 72, 76].map((w, i) => (
              <div key={i} className="sk-shimmer" style={{
                width: w, height: 34, borderRadius: 20,
                border: '1px solid rgba(168,85,247,0.15)',
              }} />
            ))}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{
          display: 'flex', gap: 4, margin: '0 16px 24px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12, padding: 4,
          border: '1px solid rgba(139,92,246,0.1)',
          backdropFilter: 'blur(6px)',
        }}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="sk-shimmer" style={{
              flex: 1, height: 38, borderRadius: 9,
              ...(i === 0 ? {
                background: 'linear-gradient(90deg, rgba(99,102,241,0.35) 0%, rgba(168,85,247,0.35) 100%)',
                backgroundSize: '250% 100%',
              } : {}),
            }} />
          ))}
        </div>

        {/* ── Mission cards ── */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0.9, 1, 0.85, 0.7].map((opacity, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(139,92,246,0.12)',
              borderLeft: '4px solid rgba(168,85,247,0.35)',
              backdropFilter: 'blur(8px)',
              opacity,
            }}>
              {/* Icon placeholder */}
              <div className="sk-shimmer" style={{
                width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <S w={`${45 + i * 10}%`} h={15} r={6} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <S w={62} h={22} r={20} />
                  <S w={62} h={22} r={20} />
                </div>
              </div>
              <S w={86} h={36} r={20} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
