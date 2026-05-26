'use client'
import { useState, useCallback, useEffect } from 'react'
import { logout } from '../app/login/actions'
import AdminOverviewTab from './AdminOverviewTab'
import AdminTableTab from './AdminTableTab'
import { getRelativeTimeString } from '../utils/time'
import GoldCoin from './GoldCoin'

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'cleanup', label: '🧹 Cleanup Hub' },
  { id: 'tickets', label: '🚨 Tickets' },
  { id: 'users', label: '👤 Users' },
  { id: 'children', label: '👥 Players' },
  { id: 'missions', label: '🎯 Missions' },
  { id: 'completions', label: '✅ Completions' },
  { id: 'rewards', label: '🎁 Rewards' },
  { id: 'redemptions', label: '🛍️ Redemptions' },
]

const COLUMNS = {
  tickets: [
    { key: 'user_email', label: 'User Email' },
    { key: 'ticket_type', label: 'Type' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status', editable: true },
    { key: 'created_at', label: 'Created At' },
  ],
  users: [
    { key: 'email', label: 'Email' },
    { key: 'display_name', label: 'Name' },
    { key: 'created_at', label: 'Signed Up' },
    { key: 'last_sign_in_at', label: 'Last Sign In' },
  ],
  children: [
    { key: 'name', label: 'Name', editable: true },
    { key: 'avatar', label: 'Avatar', editable: true },
    { key: 'xp', label: 'XP', editable: true },
    { key: 'coins', label: 'Coins', editable: true },
    { key: 'streak', label: 'Streak' },
    { key: 'theme', label: 'Theme' },
    { key: 'age_group', label: 'Age Group' },
    { key: 'last_active_at', label: 'Last Active' },
  ],
  missions: [
    { key: 'name', label: 'Name', editable: true },
    { key: 'icon', label: 'Icon', editable: true },
    { key: 'xp_reward', label: 'XP', editable: true },
    { key: 'coin_reward', label: 'Coins', editable: true },
    { key: 'frequency', label: 'Frequency' },
    { key: 'is_active', label: 'Active', editable: true },
    { key: 'last_completed_at', label: 'Last Completed' },
  ],
  completions: [
    { key: 'player_display', label: 'Player' },
    { key: 'mission_display', label: 'Mission' },
    { key: 'status', label: 'Status', editable: true },
    { key: 'submitted_at', label: 'Submitted' },
    { key: 'reviewed_at', label: 'Reviewed' },
  ],
  rewards: [
    { key: 'name', label: 'Name', editable: true },
    { key: 'icon', label: 'Icon', editable: true },
    { key: 'image', label: 'Image', editable: true },
    { key: 'cost', label: 'Cost', editable: true },
    { key: 'is_active', label: 'Active', editable: true },
    { key: 'max_total_redemptions', label: 'Max Total' },
    { key: 'last_redeemed_at', label: 'Last Redeemed' },
  ],
  redemptions: [
    { key: 'player_display', label: 'Player' },
    { key: 'reward_display', label: 'Reward' },
    { key: 'status', label: 'Status', editable: true },
    { key: 'redeemed_at', label: 'Redeemed At' },
  ],
}

const SC = {
  cleanupCard: {
    background: 'rgba(30, 33, 53, 0.5)',
    border: '1px solid #2d3148',
    borderRadius: 14,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    minHeight: 250,
  },
  cleanupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderBottom: '1px solid #1e2130',
    paddingBottom: 12,
  },
  cleanupTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
  },
  cleanupSub: {
    color: '#64748b',
    fontSize: 12,
    margin: '2px 0 0 0',
  },
  cleanupList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    maxHeight: 380,
    overflowY: 'auto',
    paddingRight: 4,
  },
  cleanupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#161926',
    border: '1px solid #2d3148',
    borderRadius: 8,
    padding: '10px 12px',
  },
  itemName: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    color: '#22c55e',
    background: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.2)',
    borderRadius: 8,
    padding: '16px 20px',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 600,
    marginTop: 20,
  },
  actionBtnRed: {
    background: 'none',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  actionBtnActive: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  actionBtnInactive: {
    background: 'rgba(71, 85, 105, 0.15)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    color: '#94a3b8',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}

function RenderIconOrImage({ val, size = 28, fallback = '❓' }) {
  if (!val) return <span style={{ fontSize: size }}>{fallback}</span>
  
  const s = String(val).trim()
  const isImage = 
    s.startsWith('data:image/') ||
    ((s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) && (
      s.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i) || 
      s.includes('/avatars/') || 
      s.includes('/rewards/')
    ))

  if (isImage) {
    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: 8, 
          overflow: 'hidden', 
          border: '1px solid #2d3148', 
          flexShrink: 0, 
          background: '#0d0d14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img src={s} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }

  return <span style={{ fontSize: size - 4, lineHeight: 1 }}>{s}</span>
}

async function apiEdit(table, id, updates) {
  const res = await fetch('/admin/api/table', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, id, updates }),
  })
  if (!res.ok) throw new Error((await res.json()).error)
}

async function apiDelete(table, id) {
  const res = await fetch('/admin/api/table', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, id }),
  })
  if (!res.ok) throw new Error((await res.json()).error)
}

export default function AdminDashboardClient({
  authUsers, children: childrenData, missions, completions,
  rewards, redemptions, appSettings, tickets, stats,
}) {
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState({
    users: authUsers,
    children: childrenData,
    missions,
    completions,
    rewards,
    redemptions,
    support_tickets: tickets,
  })

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEdit = useCallback(async (table, id, updates) => {
    await apiEdit(table, id, updates)
    setData(prev => ({
      ...prev,
      [table]: prev[table].map(r => r.id === id ? { ...r, ...updates } : r),
    }))
  }, [])

  const handleDelete = useCallback(async (table, id) => {
    await apiDelete(table, id)
    setData(prev => ({
      ...prev,
      [table]: prev[table].filter(r => r.id !== id),
    }))
  }, [])

  // ── Dynamic Enrichment ──────────────────────────────────────────────────────

  // 1. Children/Players last active computation
  const enrichedChildren = data.children.map(ch => {
    const childComps = data.completions.filter(c => c.child_id === ch.id)
    const lastCompTime = childComps.length > 0 
      ? Math.max(...childComps.map(c => new Date(c.submitted_at).getTime()))
      : 0
    
    const childReds = data.redemptions.filter(r => r.child_id === ch.id)
    const lastRedTime = childReds.length > 0
      ? Math.max(...childReds.map(r => new Date(r.redeemed_at).getTime()))
      : 0

    const lastCompDateVal = ch.last_completion_date ? new Date(ch.last_completion_date).getTime() : 0
    const createdTime = ch.created_at ? new Date(ch.created_at).getTime() : 0

    const maxTime = Math.max(lastCompTime, lastRedTime, lastCompDateVal, createdTime)
    const lastActiveDate = maxTime > 0 ? new Date(maxTime) : null

    // Inactive if no activity for 7+ days
    const isInactive = lastActiveDate ? (Date.now() - lastActiveDate.getTime() > 7 * 24 * 60 * 60 * 1000) : true

    return {
      ...ch,
      last_active_at: lastActiveDate ? lastActiveDate.toISOString() : null,
      is_inactive: isInactive,
    }
  })

  // 2. Missions last completed computation
  const enrichedMissions = data.missions.map(m => {
    const missionComps = data.completions.filter(c => c.mission_id === m.id)
    const lastCompTime = missionComps.length > 0
      ? Math.max(...missionComps.map(c => new Date(c.submitted_at).getTime()))
      : 0
    const lastCompletedDate = lastCompTime > 0 ? new Date(lastCompTime) : null
    
    // Stale if no completions in 90+ days (changed from 14)
    const isStale = lastCompletedDate 
      ? (Date.now() - lastCompletedDate.getTime() > 90 * 24 * 60 * 60 * 1000)
      : true

    return {
      ...m,
      last_completed_at: lastCompletedDate ? lastCompletedDate.toISOString() : null,
      is_stale: isStale,
    }
  })

  // 3. Rewards last redeemed computation
  const enrichedRewards = data.rewards.map(rw => {
    const rewardReds = data.redemptions.filter(r => r.reward_id === rw.id)
    const lastRedTime = rewardReds.length > 0
      ? Math.max(...rewardReds.map(r => new Date(r.redeemed_at).getTime()))
      : 0
    const lastRedeemedDate = lastRedTime > 0 ? new Date(lastRedTime) : null
    
    // Stale if no redemptions in 90+ days (changed from 30)
    const isStale = lastRedeemedDate
      ? (Date.now() - lastRedeemedDate.getTime() > 90 * 24 * 60 * 60 * 1000)
      : true

    return {
      ...rw,
      last_redeemed_at: lastRedeemedDate ? lastRedeemedDate.toISOString() : null,
      is_stale: isStale,
    }
  })

  // 4. Users/Parents inactivity check
  const enrichedUsers = data.users.map(u => {
    const lastSignInTime = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0
    
    // Inactive if no login in 90+ days (changed from 14)
    const isInactive = lastSignInTime 
      ? (Date.now() - lastSignInTime > 90 * 24 * 60 * 60 * 1000)
      : true

    return {
      ...u,
      is_inactive: isInactive,
    }
  })

  // 5. Completions enriched displays
  const enrichedCompletions = data.completions.map(c => {
    const child = data.children.find(ch => ch.id === c.child_id)
    const mission = data.missions.find(m => m.id === c.mission_id)
    return {
      ...c,
      player_display: child ? `${child.avatar} ${child.name}` : `Child (${c.child_id?.slice(0, 8)})`,
      mission_display: mission ? `${mission.icon || '🎯'} ${mission.name}` : `Mission (${c.mission_id?.slice(0, 8)})`,
    }
  })

  // 6. Redemptions enriched displays
  const enrichedRedemptions = data.redemptions.map(r => {
    const child = data.children.find(ch => ch.id === r.child_id)
    const reward = data.rewards.find(rw => rw.id === r.reward_id)
    return {
      ...r,
      player_display: child ? `${child.avatar} ${child.name}` : `Child (${r.child_id?.slice(0, 8)})`,
      reward_display: reward ? `${reward.icon || '🎁'} ${reward.name}` : `Reward (${r.reward_id?.slice(0, 8)})`,
    }
  })

  // ── Staleness Filtering ─────────────────────────────────────────────────────
  const staleChildren = enrichedChildren.filter(ch => ch.is_inactive)
  const staleMissions = enrichedMissions.filter(m => m.is_stale)
  const staleRewards = enrichedRewards.filter(rw => rw.is_stale)
  const staleUsers = enrichedUsers.filter(u => u.is_inactive)

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .admin-header { padding: 0 16px !important; gap: 12px !important; }
        .admin-header-title { font-size: 14px !important; }
        .admin-header-pipe { display: none !important; }
        .admin-header-subtitle { display: none !important; }
        .admin-summary { padding: 12px 16px !important; gap: 16px !important; justify-content: space-between; }
        .admin-summary-item { flex-basis: calc(50% - 8px); }
        .admin-content { padding: 0 16px 24px !important; }
        
        .admin-grid-cards { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; }
        .admin-grid-charts { grid-template-columns: 1fr !important; }
        
        .admin-nav::-webkit-scrollbar { display: none; }
        .admin-nav { -ms-overflow-style: none; scrollbar-width: none; }

        .cleanup-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 0 24px 40px;
        }

        .cleanup-list::-webkit-scrollbar {
          width: 4px;
        }
        .cleanup-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .cleanup-list::-webkit-scrollbar-thumb {
          background: #2d3148;
          border-radius: 2px;
        }

        @media (max-width: 640px) {
          .admin-header { padding: 0 12px !important; gap: 8px !important; }
          .admin-header-title { font-size: 13px !important; }
          .admin-summary { padding: 10px 12px !important; gap: 10px !important; }
          .admin-summary-item { flex-basis: calc(50% - 6px); }
          .admin-summary-item span:first-child { font-size: 15px !important; }
          .admin-summary-item span:last-child { font-size: 11px !important; }
          .admin-content { padding: 0 12px 20px !important; }
          .cleanup-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
            padding: 0 12px 30px !important;
          }
          .cleanup-card {
            padding: 12px 14px !important;
          }
          .cleanup-item {
            padding: 8px 10px !important;
            gap: 8px !important;
          }
          .itemName {
            font-size: 12px !important;
          }
          .itemMeta {
            font-size: 10px !important;
          }
          .actionBtnRed, .actionBtnActive, .actionBtnInactive {
            padding: 3px 8px !important;
            font-size: 10px !important;
          }
        }

        @media (min-width: 640px) {
          .admin-header { padding: 0 24px !important; gap: 24px !important; }
          .admin-header-title { font-size: 16px !important; }
          .admin-header-pipe { display: inline !important; }
          .admin-header-subtitle { display: inline !important; }
          .admin-summary { padding: 16px 24px !important; gap: 24px !important; justify-content: flex-start; }
          .admin-summary-item { flex-basis: auto; }
          .admin-content { padding: 0 24px 40px !important; }
          .admin-grid-cards { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important; }
        }
        @media (min-width: 768px) {
          .admin-grid-charts { grid-template-columns: 1fr 1fr !important; }
          .cleanup-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 1200px) {
          .cleanup-grid {
            grid-template-columns: 1fr 1fr 1fr 1fr;
          }
        }
      `}} />
      {/* Header */}
      <header className="admin-header" style={{ background: '#0a0d16', borderBottom: '1px solid #1e2130', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24, height: 56, flexShrink: 0 }}>
        <span className="admin-header-title" style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg,#3b82f6,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>
          Kaeluma Admin
        </span>
        <span className="admin-header-pipe" style={{ color: '#334155', fontSize: 12 }}>|</span>
        <span className="admin-header-subtitle" style={{ color: '#475569', fontSize: 13, whiteSpace: 'nowrap' }}>Command Center</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: '#22c55e22', color: '#22c55e', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
            ● LIVE
          </span>
          <button 
            onClick={() => logout()} 
            style={{ background: 'none', border: '1px solid #2d3148', color: '#94a3b8', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="admin-nav" style={{ background: '#0a0d16', borderBottom: '1px solid #1e2130', display: 'flex', overflowX: 'auto', flexShrink: 0 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: 'none', border: 'none', color: tab === t.id ? '#e2e8f0' : '#475569',
              padding: '14px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
              transition: 'color .15s',
            }}
          >{t.label}</button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {/* Summary bar */}
        <div className="admin-summary" style={{ display: 'flex', gap: 24, padding: '16px 24px', background: '#0a0d16', borderBottom: '1px solid #1e2130', flexWrap: 'wrap' }}>
          {[
            ['Users', stats.totalUsers, '#3b82f6'],
            ['Players', stats.totalChildren, '#a855f7'],
            ['Completions', stats.totalCompletions, '#22c55e'],
            ['Pending', stats.pendingApprovals, '#ef4444'],
            ['Coins Spent', stats.totalCoinsSpent, '#f97316'],
          ].map(([l, v, c]) => (
            <div key={l} className="admin-summary-item" style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ color: c, fontWeight: 800, fontSize: 18 }}>{v.toLocaleString()}</span>
              <span style={{ color: '#475569', fontSize: 12 }}>{l}</span>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 24 }}>
          {tab === 'overview' && <AdminOverviewTab stats={stats} />}

          {/* 🧹 Cleanup Hub Tab */}
          {tab === 'cleanup' && (
            <div className="cleanup-grid">
              
              {/* Card 1: Inactive Players */}
              <div className="cleanup-card" style={SC.cleanupCard}>
                <div style={SC.cleanupHeader}>
                  <span style={{ fontSize: 20 }}>👶</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={SC.cleanupTitle}>Inactive Players</h3>
                    <p style={SC.cleanupSub}>No activity in 7+ days ({staleChildren.length})</p>
                  </div>
                </div>
                <div className="cleanup-list" style={SC.cleanupList}>
                  {staleChildren.length === 0 ? (
                    <div style={SC.emptyState}>✅ All players active!</div>
                  ) : (
                    staleChildren.map(c => (
                      <div key={c.id} className="cleanup-item" style={SC.cleanupItem}>
                        <RenderIconOrImage val={c.avatar} size={28} fallback="👶" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="itemName" style={SC.itemName}>{c.name}</div>
                          <div className="itemMeta" style={SC.itemMeta}>
                            <GoldCoin size="11px" /> {c.coins} | ✨ {c.xp} XP | {getRelativeTimeString(c.last_active_at, mounted)}
                          </div>
                        </div>
                        <button 
                          className="actionBtnRed"
                          style={SC.actionBtnRed}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete player "${c.name}"? This deletes all progress permanently!`)) {
                              handleDelete('children', c.id)
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card 2: Stale Missions */}
              <div className="cleanup-card" style={SC.cleanupCard}>
                <div style={SC.cleanupHeader}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={SC.cleanupTitle}>Stale Missions</h3>
                    <p style={SC.cleanupSub}>No completions in 90+ days ({staleMissions.length})</p>
                  </div>
                </div>
                <div className="cleanup-list" style={SC.cleanupList}>
                  {staleMissions.length === 0 ? (
                    <div style={SC.emptyState}>✅ All missions utilized!</div>
                  ) : (
                    staleMissions.map(m => (
                      <div key={m.id} className="cleanup-item" style={SC.cleanupItem}>
                        <RenderIconOrImage val={m.icon} size={28} fallback="🎯" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="itemName" style={SC.itemName}>{m.name}</div>
                          <div className="itemMeta" style={SC.itemMeta}>
                            {m.frequency} | {getRelativeTimeString(m.last_completed_at, mounted)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            className="actionBtnActive"
                            style={m.is_active ? SC.actionBtnActive : SC.actionBtnInactive}
                            onClick={() => handleEdit('missions', m.id, { is_active: !m.is_active })}
                          >
                            {m.is_active ? 'Active' : 'Paused'}
                          </button>
                          <button 
                            className="actionBtnRed"
                            style={SC.actionBtnRed}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete mission "${m.name}"?`)) {
                                handleDelete('missions', m.id)
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card 3: Stale Rewards */}
              <div className="cleanup-card" style={SC.cleanupCard}>
                <div style={SC.cleanupHeader}>
                  <span style={{ fontSize: 20 }}>🎁</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={SC.cleanupTitle}>Stale Rewards</h3>
                    <p style={SC.cleanupSub}>No redemptions in 90+ days ({staleRewards.length})</p>
                  </div>
                </div>
                <div className="cleanup-list" style={SC.cleanupList}>
                  {staleRewards.length === 0 ? (
                    <div style={SC.emptyState}>✅ All rewards redeemed recently!</div>
                  ) : (
                    staleRewards.map(r => (
                      <div key={r.id} className="cleanup-item" style={SC.cleanupItem}>
                        <RenderIconOrImage val={r.image || r.icon} size={28} fallback="🎁" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="itemName" style={SC.itemName}>{r.name}</div>
                          <div className="itemMeta" style={SC.itemMeta}>
                            <GoldCoin size="11px" /> {r.cost} coins | {getRelativeTimeString(r.last_redeemed_at, mounted)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            className="actionBtnActive"
                            style={r.is_active ? SC.actionBtnActive : SC.actionBtnInactive}
                            onClick={() => handleEdit('rewards', r.id, { is_active: !r.is_active })}
                          >
                            {r.is_active ? 'Active' : 'Paused'}
                          </button>
                          <button 
                            className="actionBtnRed"
                            style={SC.actionBtnRed}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete reward "${r.name}"?`)) {
                                handleDelete('rewards', r.id)
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Card 4: Inactive Parents */}
              <div className="cleanup-card" style={SC.cleanupCard}>
                <div style={SC.cleanupHeader}>
                  <span style={{ fontSize: 20 }}>👤</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={SC.cleanupTitle}>Inactive Parents</h3>
                    <p style={SC.cleanupSub}>No login in 90+ days ({staleUsers.length})</p>
                  </div>
                </div>
                <div className="cleanup-list" style={SC.cleanupList}>
                  {staleUsers.length === 0 ? (
                    <div style={SC.emptyState}>✅ All parents active!</div>
                  ) : (
                    staleUsers.map(u => (
                      <div key={u.id} className="cleanup-item" style={SC.cleanupItem}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="itemName" style={SC.itemName}>{u.display_name}</div>
                          <div className="itemMeta" style={{ ...SC.itemMeta, fontSize: 10, opacity: 0.8 }}>{u.email}</div>
                          <div className="itemMeta" style={SC.itemMeta}>
                            Last login: {getRelativeTimeString(u.last_sign_in_at, mounted)}
                          </div>
                        </div>
                        <button 
                          className="actionBtnRed"
                          style={SC.actionBtnRed}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete parent account "${u.email}"? This will delete their account and ALL child accounts permanently!`)) {
                              handleDelete('users', u.id)
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {tab === 'tickets' && (
            <AdminTableTab
              rows={data.support_tickets}
              columns={COLUMNS.tickets}
              statusField="status"
              onDelete={id => handleDelete('support_tickets', id)}
              onEdit={(id, updates) => handleEdit('support_tickets', id, updates)}
            />
          )}

          {tab === 'users' && (
            <AdminTableTab
              rows={enrichedUsers}
              columns={COLUMNS.users}
              statusField={null}
              onDelete={id => handleDelete('users', id)}
              onEdit={null}
            />
          )}

          {tab === 'children' && (
            <AdminTableTab
              rows={enrichedChildren}
              columns={COLUMNS.children}
              statusField={null}
              onDelete={id => handleDelete('children', id)}
              onEdit={(id, updates) => handleEdit('children', id, updates)}
            />
          )}

          {tab === 'missions' && (
            <AdminTableTab
              rows={enrichedMissions}
              columns={COLUMNS.missions}
              statusField={null}
              onDelete={id => handleDelete('missions', id)}
              onEdit={(id, updates) => handleEdit('missions', id, updates)}
            />
          )}

          {tab === 'completions' && (
            <AdminTableTab
              rows={enrichedCompletions}
              columns={COLUMNS.completions}
              statusField="status"
              onDelete={id => handleDelete('completions', id)}
              onEdit={(id, updates) => handleEdit('completions', id, updates)}
            />
          )}

          {tab === 'rewards' && (
            <AdminTableTab
              rows={enrichedRewards}
              columns={COLUMNS.rewards}
              statusField={null}
              onDelete={id => handleDelete('rewards', id)}
              onEdit={(id, updates) => handleEdit('rewards', id, updates)}
            />
          )}

          {tab === 'redemptions' && (
            <AdminTableTab
              rows={enrichedRedemptions}
              columns={COLUMNS.redemptions}
              statusField="status"
              onDelete={id => handleDelete('redemptions', id)}
              onEdit={(id, updates) => handleEdit('redemptions', id, updates)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
