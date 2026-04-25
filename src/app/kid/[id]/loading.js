// Skeleton loading screen shown instantly when navigating to a kid's dashboard
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
    <div style={{ minHeight: '100dvh', background: 'var(--bg-deep)', overflow: 'hidden' }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Top nav bar skeleton */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Shimmer width={80} height={28} radius={20} />
        <Shimmer width={120} height={28} radius={20} />
        <Shimmer width={80} height={28} radius={20} />
      </div>

      {/* Hero avatar area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 20px' }}>
        {/* Avatar ring */}
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '3px solid rgba(255,255,255,0.08)',
          animation: 'shimmer 1.4s ease-in-out infinite',
          backgroundSize: '200% 100%',
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
          marginBottom: 20,
        }} />
        <Shimmer width={140} height={26} radius={8} style={{ marginBottom: 10 }} />
        <Shimmer width={100} height={16} radius={6} style={{ marginBottom: 16 }} />
        {/* XP bar */}
        <Shimmer width="80%" height={12} radius={6} style={{ marginBottom: 6 }} />
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <Shimmer width={70} height={30} radius={20} />
          <Shimmer width={70} height={30} radius={20} />
          <Shimmer width={70} height={30} radius={20} />
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, margin: '0 16px 24px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4,
      }}>
        {[1,2,3].map(i => <Shimmer key={i} width="33%" height={36} radius={8} />)}
      </div>

      {/* Mission cards skeleton */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 16, borderRadius: 14,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <Shimmer width={48} height={48} radius={12} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Shimmer width="60%" height={16} radius={6} />
              <div style={{ display: 'flex', gap: 6 }}>
                <Shimmer width={60} height={22} radius={20} />
                <Shimmer width={60} height={22} radius={20} />
              </div>
            </div>
            <Shimmer width={80} height={36} radius={20} />
          </div>
        ))}
      </div>
    </div>
  );
}
