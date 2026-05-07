'use client'

const S = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 },
  card: { background: 'rgba(30,33,53,0.8)', border: '1px solid #2d3148', borderRadius: 14, padding: '20px 24px' },
  label: { color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  value: { fontSize: '2rem', fontWeight: 800, lineHeight: 1 },
  sub: { color: '#475569', fontSize: 12, marginTop: 4 },
  section: { marginBottom: 36 },
  h3: { color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  chartWrap: { background: 'rgba(30,33,53,0.5)', border: '1px solid #2d3148', borderRadius: 14, padding: 24 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 },
  topRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  topItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1e2130' },
  bar: (pct, color) => ({ height: 6, borderRadius: 3, background: color, width: pct + '%', minWidth: 4 }),
}

function BarChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const W = 100 / data.length
  return (
    <div style={S.chartWrap}>
      <div style={S.h3}>{label}</div>
      <svg viewBox={`0 0 ${data.length * 10} 60`} style={{ width: '100%', height: 100 }}>
        {data.map((d, i) => {
          const h = Math.max((d.count / max) * 55, 1)
          return (
            <g key={d.date}>
              <title>{d.date}: {d.count}</title>
              <rect x={i * 10 + 1} y={60 - h} width={8} height={h} rx={2} fill={color} opacity={0.8} />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: 4 }}>
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  )
}

function LineChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 300},${60 - (d.count / max) * 55}`).join(' ')
  return (
    <div style={S.chartWrap}>
      <div style={S.h3}>{label}</div>
      <svg viewBox="0 0 300 65" style={{ width: '100%', height: 100 }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.date}>
            <title>{d.date}: {d.count}</title>
            <circle cx={(i / (data.length - 1)) * 300} cy={60 - (d.count / max) * 55} r="3" fill={color} />
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: 10, marginTop: 4 }}>
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  )
}

function TopList({ items, color, label }) {
  const max = Math.max(...items.map(i => i.count), 1)
  return (
    <div style={S.chartWrap}>
      <div style={S.h3}>{label}</div>
      {items.length === 0 && <p style={{ color: '#475569', fontSize: 13 }}>No data yet</p>}
      {items.map(item => (
        <div key={item.id} style={S.topItem}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
            <div style={{ marginTop: 4 }}><div style={S.bar((item.count / max) * 100, color)} /></div>
          </div>
          <span style={{ color, fontWeight: 700, fontSize: 14, minWidth: 28, textAlign: 'right' }}>{item.count}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminOverviewTab({ stats }) {
  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#3b82f6', icon: '👤' },
    { label: 'Total Children', value: stats.totalChildren, color: '#a855f7', icon: '👶' },
    { label: 'Missions Created', value: stats.totalMissions, color: '#f59e0b', icon: '🎯' },
    { label: 'Completions', value: stats.totalCompletions, color: '#22c55e', icon: '✅' },
    { label: 'Coins Spent', value: stats.totalCoinsSpent, color: '#f97316', icon: '🪙' },
    { label: 'Pending Reviews', value: stats.pendingApprovals, color: '#ef4444', icon: '⏳' },
  ]

  return (
    <div style={{ padding: '0 24px 40px' }}>
      <div style={S.grid}>
        {cards.map(c => (
          <div key={c.label} style={{ ...S.card, borderTop: `3px solid ${c.color}` }}>
            <div style={S.label}>{c.icon} {c.label}</div>
            <div style={{ ...S.value, color: c.color }}>{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={S.chartsRow}>
        <BarChart data={stats.signupsByDay} color="#3b82f6" label="📈 New Signups (Last 30 Days)" />
        <LineChart data={stats.completionsByDay} color="#22c55e" label="✅ Completions (Last 14 Days)" />
      </div>

      <div style={S.topRow}>
        <TopList items={stats.topMissions} color="#f59e0b" label="🏆 Top Missions" />
        <TopList items={stats.topRewards} color="#a855f7" label="🎁 Top Rewards" />
      </div>
    </div>
  )
}
