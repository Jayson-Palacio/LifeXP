'use client'
import { useState, useCallback } from 'react'
import { logout } from '../app/login/actions'
import AdminOverviewTab from './AdminOverviewTab'
import AdminTableTab from './AdminTableTab'

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'users', label: '👤 Users' },
  { id: 'children', label: '👶 Children' },
  { id: 'missions', label: '🎯 Missions' },
  { id: 'completions', label: '✅ Completions' },
  { id: 'rewards', label: '🎁 Rewards' },
  { id: 'redemptions', label: '🛍️ Redemptions' },
]

const COLUMNS = {
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
  ],
  missions: [
    { key: 'name', label: 'Name', editable: true },
    { key: 'icon', label: 'Icon', editable: true },
    { key: 'xp_reward', label: 'XP', editable: true },
    { key: 'coin_reward', label: 'Coins', editable: true },
    { key: 'frequency', label: 'Frequency' },
    { key: 'is_active', label: 'Active' },
  ],
  completions: [
    { key: 'child_id', label: 'Child ID' },
    { key: 'mission_id', label: 'Mission ID' },
    { key: 'status', label: 'Status', editable: true },
    { key: 'submitted_at', label: 'Submitted' },
    { key: 'reviewed_at', label: 'Reviewed' },
  ],
  rewards: [
    { key: 'name', label: 'Name', editable: true },
    { key: 'icon', label: 'Icon', editable: true },
    { key: 'cost', label: 'Cost', editable: true },
    { key: 'is_active', label: 'Active' },
    { key: 'max_total_redemptions', label: 'Max Total' },
  ],
  redemptions: [
    { key: 'child_id', label: 'Child ID' },
    { key: 'reward_id', label: 'Reward ID' },
    { key: 'status', label: 'Status', editable: true },
    { key: 'redeemed_at', label: 'Redeemed At' },
  ],
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
  rewards, redemptions, appSettings, stats,
}) {
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState({
    users: authUsers,
    children: childrenData,
    missions,
    completions,
    rewards,
    redemptions,
  })

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
            ['Children', stats.totalChildren, '#a855f7'],
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

          {tab === 'users' && (
            <AdminTableTab
              rows={data.users}
              columns={COLUMNS.users}
              statusField={null}
              onDelete={id => handleDelete('users', id)}
              onEdit={null}
            />
          )}

          {tab === 'children' && (
            <AdminTableTab
              rows={data.children}
              columns={COLUMNS.children}
              statusField={null}
              onDelete={id => handleDelete('children', id)}
              onEdit={(id, updates) => handleEdit('children', id, updates)}
            />
          )}

          {tab === 'missions' && (
            <AdminTableTab
              rows={data.missions}
              columns={COLUMNS.missions}
              statusField={null}
              onDelete={id => handleDelete('missions', id)}
              onEdit={(id, updates) => handleEdit('missions', id, updates)}
            />
          )}

          {tab === 'completions' && (
            <AdminTableTab
              rows={data.completions}
              columns={COLUMNS.completions}
              statusField="status"
              onDelete={id => handleDelete('completions', id)}
              onEdit={(id, updates) => handleEdit('completions', id, updates)}
            />
          )}

          {tab === 'rewards' && (
            <AdminTableTab
              rows={data.rewards}
              columns={COLUMNS.rewards}
              statusField={null}
              onDelete={id => handleDelete('rewards', id)}
              onEdit={(id, updates) => handleEdit('rewards', id, updates)}
            />
          )}

          {tab === 'redemptions' && (
            <AdminTableTab
              rows={data.redemptions}
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
