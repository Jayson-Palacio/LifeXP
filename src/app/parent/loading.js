// Skeleton loading screen shown instantly when navigating to the parent dashboard
const Shimmer = ({ width = '100%', height = 20, radius = 8, style = {} }) => (
  <div style={{
    width, height,
    borderRadius: radius,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s ease-in-out infinite',
    flexShrink: 0,
    ...style,
  }} />
);

export default function Loading() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', padding: '20px 16px', overflow: 'hidden' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 28,
        background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4,
      }}>
        {[1,2,3,4,5].map(i => <Shimmer key={i} width="20%" height={38} radius={8} />)}
      </div>

      {/* Header: family name + button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Shimmer width={80} height={12} radius={4} />
          <Shimmer width={180} height={28} radius={8} />
        </div>
        <Shimmer width={80} height={32} radius={20} />
      </div>

      {/* Family grid — 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
        {[1,2].map(i => (
          <div key={i} style={{
            padding: 16, borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shimmer width={48} height={48} radius={24} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Shimmer width="70%" height={16} radius={6} />
                <Shimmer width="50%" height={12} radius={4} />
              </div>
            </div>
            <Shimmer width="100%" height={8} radius={4} />
            <div style={{ display: 'flex', gap: 6 }}>
              <Shimmer width={60} height={24} radius={20} />
              <Shimmer width={60} height={24} radius={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Action required section */}
      <Shimmer width={180} height={22} radius={6} style={{ marginBottom: 16 }} />
      {[1,2].map(i => (
        <div key={i} style={{
          padding: 16, borderRadius: 14, marginBottom: 12,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Shimmer width={56} height={56} radius={12} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Shimmer width="40%" height={12} radius={4} />
              <Shimmer width="70%" height={20} radius={6} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Shimmer width={60} height={22} radius={20} />
                <Shimmer width={60} height={22} radius={20} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Shimmer width="30%" height={44} radius={10} />
            <Shimmer width="70%" height={44} radius={10} />
          </div>
        </div>
      ))}
    </div>
  );
}
