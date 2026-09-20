'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { getRelativeTimeString } from '../utils/time'
import { isImageValue } from '../lib/adminStats'

const STATUS_COLORS = {
  pending: '#8a6a2a',
  approved: '#2f6b4f',
  fulfilled: '#2f6b4f',
  rejected: '#8a2f24',
  refunded: '#3d5a80',
  open: '#8a6a2a',
  in_progress: '#3d5a80',
  resolved: '#2f6b4f',
  closed: '#6e6e73',
  bug: '#8a2f24',
  feature: '#3d5a80',
}

const PAGE_SIZE = 25

function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false)
  if (text.length <= 48) return <span>{text}</span>
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
      style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
    >
      {expanded ? text : `${text.slice(0, 48)}…`}
    </button>
  )
}

function CellValue({ value, mounted }) {
  if (value === null || value === undefined || value === '') {
    return <span className="admin-muted">—</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span className="admin-badge" style={{ background: value ? 'rgba(47,107,79,.12)' : '#f2f2f7', color: value ? '#2f6b4f' : '#6e6e73' }}>
        {value ? 'Yes' : 'No'}
      </span>
    )
  }
  if (typeof value === 'object') return <ExpandableText text={JSON.stringify(value)} />
  const s = String(value)
  if (isImageValue(s)) {
    return (
      <a href={s} target="_blank" rel="noopener noreferrer" className="admin-thumb">
        <img src={s} alt="" />
      </a>
    )
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    return <span title={new Date(s).toLocaleString()}>{getRelativeTimeString(s, mounted)}</span>
  }
  if (STATUS_COLORS[s]) {
    return <span className="admin-badge" style={{ background: `${STATUS_COLORS[s]}22`, color: STATUS_COLORS[s] }}>{s.replace('_', ' ')}</span>
  }
  if (s.includes(', ') && ['Quests', 'Vital', 'Ledger'].some((app) => s.includes(app))) {
    return (
      <span className="admin-apps">
        {s.split(', ').map((app) => <span key={app}>{app}</span>)}
      </span>
    )
  }
  if (s.length > 48) return <ExpandableText text={s} />
  return s
}

function coerceForSave(columns, draft) {
  const updates = {}
  for (const col of columns.filter((c) => c.editable)) {
    const raw = draft[col.key]
    if (col.type === 'boolean') updates[col.key] = raw === true || raw === 'true'
    else if (col.type === 'number') updates[col.key] = raw === '' || raw == null ? null : Number(raw)
    else updates[col.key] = raw
  }
  return updates
}

export default function AdminTableTab({
  rows = [],
  columns,
  statusField,
  statusOptions,
  presetStatus = '',
  defaultStatus = '',
  onDelete,
  onEdit,
  rowName,
  empty = 'No results',
}) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState(presetStatus || defaultStatus)
  const [sortKey, setSortKey] = useState(columns[0]?.key)
  const [sortDir, setSortDir] = useState('desc')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    setStatus(presetStatus || defaultStatus)
    setPage(0)
  }, [presetStatus])

  const statuses = statusOptions || (statusField
    ? [...new Set(rows.map((r) => r[statusField]).filter(Boolean))]
    : [])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const next = rows.filter((row) => {
      if (status && row[statusField] !== status) return false
      if (!needle) return true
      return columns.some((col) => {
        const value = row[col.key]
        if (isImageValue(value)) return false
        return String(value ?? '').toLowerCase().includes(needle)
      })
    })
    next.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })
    return next
  }, [rows, q, status, statusField, columns, sortKey, sortDir])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
  const editableCols = columns.filter((c) => c.editable)

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  async function saveEdit(row) {
    setSaving(true)
    try {
      await onEdit(row.id, coerceForSave(editableCols, editData))
      setEditId(null)
    } catch {
      // Error toast is handled by the dashboard.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search this table"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(0) }}
        />
        {statuses.length > 0 && (
          <div className="admin-chips">
            <button type="button" className={!status ? 'is-on' : ''} onClick={() => { setStatus(''); setPage(0) }}>All</button>
            {statuses.map((s) => (
              <button key={s} type="button" className={status === s ? 'is-on' : ''} onClick={() => { setStatus(s); setPage(0) }}>
                {String(s).replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
        <span className="admin-row-meta">{filtered.length} of {rows.length}</span>
      </div>
      <div className="admin-table-scroller">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={sortKey === c.key ? 'is-sort' : ''} onClick={() => toggleSort(c.key)}>
                  {c.label}{sortKey === c.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <Fragment key={row.id}>
                <tr className={editId === row.id ? 'is-edit' : ''}>
                  {columns.map((c) => (
                    <td key={c.key} style={c.wrap ? { whiteSpace: 'normal', maxWidth: 360, overflow: 'visible' } : undefined}>
                      {c.key === statusField
                        ? <span className="admin-badge" style={{ background: `${STATUS_COLORS[row[c.key]] || '#6e6e73'}18`, color: STATUS_COLORS[row[c.key]] || '#6e6e73' }}>{String(row[c.key] || '—').replace('_', ' ')}</span>
                        : <CellValue value={row[c.key]} mounted={mounted} />}
                    </td>
                  ))}
                  <td>
                    <div className="admin-actions">
                      {onEdit && editableCols.length > 0 && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-blue"
                          onClick={() => {
                            if (editId === row.id) { setEditId(null); return }
                            setEditId(row.id)
                            const d = {}
                            editableCols.forEach((c) => { d[c.key] = row[c.key] })
                            setEditData(d)
                          }}
                        >
                          {editId === row.id ? 'Cancel' : 'Edit'}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-red"
                          onClick={() => {
                            const label = rowName ? rowName(row) : row.name || row.email || row.id
                            if (confirm(`Delete ${label}? This cannot be undone.`)) onDelete(row.id)
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {editId === row.id && (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ padding: 0 }}>
                      <div className="admin-edit">
                        <div className="admin-edit-grid">
                          {editableCols.map((c) => (
                            <div key={c.key}>
                              <label>{c.label}</label>
                              {c.type === 'boolean' ? (
                                <select value={String(editData[c.key] !== false && editData[c.key] !== 'false')} onChange={(e) => setEditData((p) => ({ ...p, [c.key]: e.target.value === 'true' }))}>
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              ) : c.options ? (
                                <select value={editData[c.key] ?? ''} onChange={(e) => setEditData((p) => ({ ...p, [c.key]: e.target.value }))}>
                                  {c.options.map((opt) => <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={c.type === 'number' ? 'number' : 'text'}
                                  value={editData[c.key] ?? ''}
                                  onChange={(e) => setEditData((p) => ({ ...p, [c.key]: e.target.value }))}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <button type="button" className="admin-btn admin-btn-green" style={{ marginTop: 14 }} onClick={() => saveEdit(row)} disabled={saving}>
                          {saving ? 'Saving…' : 'Save changes'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="admin-empty">{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="admin-pager">
          <button type="button" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
          <span className="admin-muted">Page {safePage + 1} of {pages}</span>
          <button type="button" disabled={safePage >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
