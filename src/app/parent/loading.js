'use client';

const css = `
  @keyframes cosmicGradient {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes spinSlow {
    100% { transform: rotate(360deg); }
  }
  @keyframes spinReverseFast {
    100% { transform: rotate(-360deg); }
  }
  @keyframes pulseOpacity {
    0%, 100% { opacity: 0.6; transform: scale(0.95); }
    50%       { opacity: 1; transform: scale(1.05); }
  }
  @keyframes shimmerText {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes floatUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function Loading() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0814',
      overflow: 'hidden',
      position: 'relative',
      padding: '20px'
    }}>
      <style>{css}</style>

      {/* Cosmic bg */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #000000)',
        backgroundSize: '400% 400%',
        animation: 'cosmicGradient 15s ease infinite',
        opacity: 0.85,
      }} />

      {/* Deep purple radial bloom */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 60%)',
      }} />

      {/* Main Glassmorphic Container */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '48px 40px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(139,92,246,0.15)',
        borderRadius: '32px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
        animation: 'floatUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        maxWidth: '100%',
        textAlign: 'center'
      }}>
        
        {/* Intricate Sync Rings */}
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: '36px' }}>
          
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute', inset: '20%',
            background: '#8b5cf6',
            filter: 'blur(30px)',
            opacity: 0.5,
            animation: 'pulseOpacity 3s ease-in-out infinite'
          }} />

          {/* Outer Ring (Dashed) */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px dashed rgba(139,92,246,0.3)',
            borderRadius: '50%',
            animation: 'spinSlow 12s linear infinite'
          }} />

          {/* Middle Ring (Solid with gaps) */}
          <div style={{
            position: 'absolute', inset: 12,
            border: '3px solid transparent',
            borderTopColor: 'rgba(99,102,241,0.9)',
            borderBottomColor: 'rgba(168,85,247,0.9)',
            borderRadius: '50%',
            animation: 'spinReverseFast 3s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }} />

          {/* Inner Ring (Dotted) */}
          <div style={{
            position: 'absolute', inset: 26,
            border: '2px dotted rgba(255,255,255,0.3)',
            borderRadius: '50%',
            animation: 'spinSlow 8s linear infinite'
          }} />

          {/* Center Icon */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem',
            animation: 'pulseOpacity 2s ease-in-out infinite',
            textShadow: '0 0 20px rgba(139,92,246,0.6)',
            paddingBottom: '4px' // Optical alignment for emoji
          }}>
            🔓
          </div>
        </div>

        {/* Premium Typography */}
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 800,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: '12px',
          background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #a855f7, #6366f1)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'shimmerText 3s linear infinite'
        }}>
          Accessing Dashboard
        </div>

        <div style={{
          fontSize: '0.95rem',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
          letterSpacing: '0.05em'
        }}>
          Syncing family data...
        </div>

      </div>
    </div>
  );
}
