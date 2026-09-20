'use client'

import { useState } from 'react'
import {
  DEFAULT_ANCHOR_ISO,
  PHASE_LABELS,
  STATUS_OPTIONS,
  enrichCalendar,
} from '../lib/marketing/calendarData'
import { marketingCoachNote, weekBuckets } from '../lib/marketing/marketingAgent'
import { useMarketingCalendarState } from '../lib/marketing/calendarStore'

const CHANNEL_LABEL = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitter: 'X / Twitter',
  reddit: 'Reddit',
  email: 'Email',
  product_hunt: 'Product Hunt',
  ops: 'Ops',
  blog: 'Blog',
  outreach: 'Outreach',
}

const FILTERS = [
  ['all', 'All'],
  ['open', 'Open'],
  ['today', 'Today'],
  ['overdue', 'Overdue'],
  ['setup', 'Setup'],
  ['warmup', 'Warm-up'],
  ['soft_launch', 'Soft launch'],
  ['launch', 'Launch'],
  ['growth', 'Growth'],
]

const STATUS_TONE = {
  planned: '',
  drafting: 'is-warn',
  ready: 'is-ready',
  posted: 'is-ok',
  skipped: 'is-dim',
}

export default function AdminMarketingTab() {
  const { anchorISO, statusMap, setAnchorISO, patchItem } = useMarketingCalendarState()
  const [filter, setFilter] = useState('all')
  const [focusId, setFocusId] = useState(null)
  const [copied, setCopied] = useState(false)
  const [todayISO] = useState(() => new Date().toISOString().slice(0, 10))

  const items = enrichCalendar(anchorISO, statusMap)
  const coach = marketingCoachNote({
    anchorISO,
    statusMap,
    now: new Date(`${todayISO}T12:00:00`),
  })
  const week = weekBuckets(items, todayISO)
  const focused = items.find((i) => i.id === (focusId || coach.focusId)) || items[0]

  const visible = items.filter((i) => {
    if (filter === 'all') return true
    if (filter === 'open') return i.status !== 'posted' && i.status !== 'skipped'
    if (filter === 'today') return i.date === todayISO
    if (filter === 'overdue') {
      return i.date < todayISO && i.status !== 'posted' && i.status !== 'skipped'
    }
    return i.phase === filter
  })

  const copyCaption = async () => {
    if (!focused?.caption) return
    try {
      await navigator.clipboard.writeText(focused.caption)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="admin-mkt">
      <section className="admin-panel">
        <p className="admin-kicker">{coach.kicker}</p>
        <h2 className="admin-h2">{coach.title}</h2>
        <p className="admin-muted" style={{ marginTop: -8, marginBottom: 14, maxWidth: 720 }}>{coach.body}</p>
        <div className="admin-mkt-stats">
          {coach.focusId && (
            <button type="button" className="admin-btn admin-btn-green" onClick={() => setFocusId(coach.focusId)}>
              {coach.actionLabel || 'Open item'}
            </button>
          )}
          <span>Open <strong>{coach.stats.open}</strong></span>
          <span>Done <strong>{coach.stats.done}</strong></span>
          <span>Overdue <strong>{coach.stats.overdue}</strong></span>
          <span>Today <strong>{coach.stats.today}</strong></span>
        </div>
        {coach.checklist?.length > 0 && (
          <ul className="admin-mkt-list">
            {coach.checklist.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="admin-toolbar">
        <label className="admin-mkt-anchor">
          Warm-up Day 0
          <input
            type="date"
            value={anchorISO}
            onChange={(e) => setAnchorISO(e.target.value || DEFAULT_ANCHOR_ISO)}
          />
        </label>
        <div className="admin-chips">
          {FILTERS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={filter === id ? 'is-on' : ''}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h3>This week</h3>
        </div>
        <div className="admin-mkt-week">
          {week.days.map((day) => (
            <div key={day.date} className={`admin-mkt-day${day.isToday ? ' is-today' : ''}`}>
              <div>{day.label}</div>
              {day.items.length === 0 && <p className="admin-muted">—</p>}
              {day.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className={focused?.id === it.id ? 'is-on' : ''}
                  onClick={() => setFocusId(it.id)}
                >
                  <em>{CHANNEL_LABEL[it.channel] || it.channel}</em>
                  {it.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="admin-mkt-split">
        <section>
          <div className="admin-panel-head">
            <h3>Calendar</h3>
            <span>{visible.length}</span>
          </div>
          <div className="admin-mkt-list-items">
            {visible.length === 0 && <p className="admin-empty">No items in this filter.</p>}
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-mkt-item${focused?.id === item.id ? ' is-on' : ''}`}
                onClick={() => setFocusId(item.id)}
              >
                <div className="admin-mkt-item-meta">
                  <span>
                    {item.date} · {PHASE_LABELS[item.phase]} · {CHANNEL_LABEL[item.channel]} · {item.priority}
                  </span>
                  <StatusPill status={item.status} />
                </div>
                <strong>{item.title}</strong>
                <p>{item.goal}</p>
              </button>
            ))}
          </div>
        </section>

        {focused && (
          <section className="admin-panel admin-mkt-detail">
            <p className="admin-kicker">
              {CHANNEL_LABEL[focused.channel]} · {focused.kind}
            </p>
            <h3>{focused.title}</h3>
            <p className="admin-muted">{focused.goal}</p>

            <label>
              Status
              <select
                value={focused.status}
                onChange={(e) => patchItem(focused.id, { status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>

            <label>
              Notes
              <textarea
                value={focused.notes}
                onChange={(e) => patchItem(focused.id, { notes: e.target.value })}
                rows={3}
                placeholder="Links, edit notes, who filmed…"
              />
            </label>

            {focused.checklist?.length > 0 && (
              <>
                <h4>Checklist</h4>
                <ul className="admin-mkt-list">
                  {focused.checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            )}

            {focused.production?.length > 0 && (
              <>
                <h4>Production</h4>
                <ul className="admin-mkt-list">
                  {focused.production.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </>
            )}

            {focused.caption ? (
              <>
                <div className="admin-mkt-copy-head">
                  <h4>Caption / copy</h4>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={copyCaption}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="admin-mkt-caption">{focused.caption}</pre>
              </>
            ) : null}

            <p className="admin-muted" style={{ marginTop: 12 }}>Source: {focused.source}</p>
          </section>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span className={`admin-badge ${STATUS_TONE[status] || ''}`}>
      {STATUS_OPTIONS.find((s) => s.id === status)?.label || status}
    </span>
  )
}
