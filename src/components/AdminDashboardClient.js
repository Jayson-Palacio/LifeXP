'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { logout } from '../app/login/actions'
import { showToast } from '../lib/ui'
import { computeAdminStats } from '../lib/adminStats'
import { getRelativeTimeString } from '../utils/time'
import AdminOverviewTab from './AdminOverviewTab'
import AdminTableTab from './AdminTableTab'
import AdminHouseholds from './AdminHouseholds'
import AdminMarketingTab from './AdminMarketingTab'
import BrandLogo from './BrandLogo'

const TABS = [
  { id: 'overview', label: 'Home' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'households', label: 'Households' },
  { id: 'marketing', label: 'Marketing' },
]

const TAB_ALIAS = { tickets: 'inbox', users: 'households', children: 'households' }

const INBOX_COLUMNS = [
  { key: 'user_email', label: 'From' },
  { key: 'family_name', label: 'Household' },
  { key: 'ticket_type', label: 'Type' },
  { key: 'message', label: 'Message', wrap: true },
  { key: 'status', label: 'Status', editable: true, options: ['open', 'in_progress', 'resolved', 'closed'] },
  { key: 'created_at', label: 'Opened' },
]

function readTabFromUrl() {
  if (typeof window === 'undefined') return 'overview'
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('tab') || 'overview'
  return TAB_ALIAS[raw] || raw
}

function readParam(key) {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(key) || ''
}

async function apiEdit(table, id, updates) {
  const res = await fetch('/admin/api/table', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, id, updates }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not save')
}

async function apiDelete(table, id) {
  const res = await fetch('/admin/api/table', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, id }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Could not delete')
}

export default function AdminDashboardClient({ households: initialHouseholds, tickets: initialTickets }) {
  const [tab, setTab] = useState('overview')
  const [presetStatus, setPresetStatus] = useState('')
  const [presetFilter, setPresetFilter] = useState('')
  const [households, setHouseholds] = useState(initialHouseholds)
  const [tickets, setTickets] = useState(initialTickets)
  const [mounted, setMounted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTab(readTabFromUrl())
    setPresetStatus(readParam('status'))
    const filter = readParam('filter')
    setPresetFilter(filter === 'none' ? 'None' : filter === 'quiet' ? 'Quiet' : filter)
  }, [])

  const jump = useCallback((nextTab, extra = {}) => {
    const id = TAB_ALIAS[nextTab] || nextTab
    setTab(id)
    setPresetStatus(extra.status || '')
    const filter = extra.filter === 'none' ? 'None' : extra.filter === 'quiet' ? 'Quiet' : (extra.filter || '')
    setPresetFilter(filter)
    const params = new URLSearchParams()
    params.set('tab', id)
    if (extra.status) params.set('status', extra.status)
    if (extra.filter) params.set('filter', extra.filter)
    window.history.replaceState(null, '', `/admin?${params}`)
  }, [])

  const handleTicketEdit = useCallback(async (id, updates) => {
    setBusy(true)
    try {
      await apiEdit('support_tickets', id, updates)
      setTickets((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)))
      showToast('Saved')
    } catch (err) {
      showToast(err.message, 'error')
      throw err
    } finally {
      setBusy(false)
    }
  }, [])

  const handleTicketDelete = useCallback(async (id) => {
    setBusy(true)
    try {
      await apiDelete('support_tickets', id)
      setTickets((prev) => prev.filter((row) => row.id !== id))
      showToast('Deleted')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }, [])

  const handleHouseholdDelete = useCallback(async (id) => {
    setBusy(true)
    try {
      await apiDelete('users', id)
      setHouseholds((prev) => prev.filter((row) => row.id !== id))
      setTickets((prev) => prev.filter((row) => row.user_id !== id))
      showToast('Deleted')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }, [])

  const stats = useMemo(() => computeAdminStats({ households, tickets }), [households, tickets])

  return (
    <div className="admin-app">
      <header className="admin-header">
        <div className="admin-header-brand">
          <BrandLogo href="/apps" size="sm" tone="ink" />
          <span>Admin</span>
        </div>
        <div className="admin-header-actions">
          <Link href="/apps" className="admin-text-btn">Apps</Link>
          <button type="button" className="admin-text-btn" onClick={() => logout()}>Log out</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-body" aria-busy={busy}>
          <nav className="admin-nav" aria-label="Admin sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? 'is-on' : ''}
                onClick={() => jump(item.id)}
              >
                {item.label}
                {item.id === 'inbox' && stats.openTickets > 0 && (
                  <span className="admin-count is-hot">{stats.openTickets}</span>
                )}
              </button>
            ))}
          </nav>

          {tab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              mounted={mounted}
              relativeTime={getRelativeTimeString}
              onJump={jump}
            />
          )}

          {tab === 'inbox' && (
            <AdminTableTab
              rows={tickets}
              columns={INBOX_COLUMNS}
              statusField="status"
              statusOptions={['open', 'in_progress', 'resolved', 'closed']}
              presetStatus={presetStatus}
              defaultStatus="open"
              onDelete={handleTicketDelete}
              onEdit={handleTicketEdit}
              rowName={(row) => `ticket from ${row.user_email}`}
              empty="No tickets in this filter."
            />
          )}

          {tab === 'households' && (
            <AdminHouseholds
              key={presetFilter}
              households={households}
              tickets={tickets}
              mounted={mounted}
              relativeTime={getRelativeTimeString}
              onDelete={handleHouseholdDelete}
              presetFilter={presetFilter}
            />
          )}

          {tab === 'marketing' && <AdminMarketingTab />}
        </div>
      </main>
    </div>
  )
}
