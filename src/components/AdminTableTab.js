'use client'
import { useState } from 'react'

const S = {
  wrap: { padding: '0 24px 40px' },
  search: { width: '100%', maxWidth: 340, background: '#1e2130', border: '1px solid #2d3148', borderRadius: 8, color: '#e2e8f0', padding: '8px 14px', fontSize: 14, marginBottom: 18, outline: 'none' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', background: '#161926', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #2d3148' },
  td: { padding: '10px 12px', borderBottom: '1px solid #1e2130', color: '#cbd5e1', verticalAlign: 'top', wordBreak: 'break-word', maxWidth: 240 },
  badge: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: color + '22', color }),
  btn: (color) => ({ background: 'none', border: `1px solid ${color}44`, color, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', marginRight: 6 }),
  editBox: { background: '#1a1f35', border: '1px solid #3b82f6', borderRadius: 8, padding: 16, marginBottom: 8 },
  input: { background: '#0f1117', border: '1px solid #2d3148', borderRadius: 6, color: '#e2e8f0', padding: '6px 10px', fontSize: 13, width: '100%', marginTop: 4 },
  label: { color: '#94a3b8', fontSize: 12, display: 'block', marginTop: 10 },
  page: { display: 'flex', gap: 8, marginTop: 16, alignItems: 'center', justifyContent: 'flex-end' },
  pageBtn: (active) => ({ background: active ? '#3b82f6' : '#1e2130', border: '1px solid #2d3148', color: active ? '#fff' : '#94a3b8', borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer' }),
}

const STATUS_COLORS = { pending: '#f59e0b', approved: '#22c55e', fulfilled: '#22c55e', rejected: '#ef4444', refunded: '#6366f1' }
const PAGE_SIZE = 25

function fmt(val) {
  if (val === null || val === undefined) return <span style={{ color: '#475569' }}>—</span>
  if (typeof val === 'boolean') return val ? '✅' : '❌'
  if (typeof val === 'object') return <span style={{ color: '#64748b', fontSize: 11 }}>{JSON.stringify(val).slice(0, 60)}</span>
  const s = String(val)
  if (s.match(/^\d{4}-\d{2}-\d{2}T/)) return new Date(s).toLocaleString()
  if (s.length > 80) return s.slice(0, 80) + '…'
  return s
}

export default function AdminTableTab({ rows = [], columns, statusField, onDelete, onEdit }) {
  const [q, setQ] = useState('')
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)

  const filtered = rows.filter(r => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  async function saveEdit(row) {
    setSaving(true)
    await onEdit(row.id, editData)
    setSaving(false)
    setEditId(null)
  }

  const editableCols = columns.filter(c => c.editable)

  return (
    <div style={S.wrap}>
      <input style={S.search} placeholder="Search…" value={q} onChange={e => { setQ(e.target.value); setPage(0) }} />
      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>{columns.map(c => <th key={c.key} style={S.th}>{c.label}</th>)}
              <th style={S.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(row => (
              <>
                <tr key={row.id} style={{ background: editId === row.id ? '#1a1f35' : 'transparent' }}>
                  {columns.map(c => (
                    <td key={c.key} style={S.td}>
                      {c.key === statusField
                        ? <span style={S.badge(STATUS_COLORS[row[c.key]] || '#94a3b8')}>{row[c.key]}</span>
                        : fmt(row[c.key])}
                    </td>
                  ))}
                  <td style={S.td}>
                    {onEdit && editableCols.length > 0 && (
                      <button style={S.btn('#3b82f6')} onClick={() => {
                        if (editId === row.id) { setEditId(null); return }
                        setEditId(row.id)
                        const d = {}
                        editableCols.forEach(c => { d[c.key] = row[c.key] })
                        setEditData(d)
                      }}>{editId === row.id ? 'Cancel' : 'Edit'}</button>
                    )}
                    {onDelete && (
                      <button style={S.btn('#ef4444')} onClick={() => {
                        if (confirm(`Delete row ${row.id}?`)) onDelete(row.id)
                      }}>Delete</button>
                    )}
                  </td>
                </tr>
                {editId === row.id && (
                  <tr key={row.id + '-edit'}>
                    <td colSpan={columns.length + 1} style={{ padding: 0 }}>
                      <div style={S.editBox}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                          {editableCols.map(c => (
                            <div key={c.key}>
                              <label style={S.label}>{c.label}</label>
                              <input style={S.input} value={editData[c.key] ?? ''} onChange={e => setEditData(p => ({ ...p, [c.key]: e.target.value }))} />
                            </div>
                          ))}
                        </div>
                        <button style={{ ...S.btn('#22c55e'), marginTop: 14 }} onClick={() => saveEdit(row)} disabled={saving}>
                          {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={columns.length + 1} style={{ ...S.td, textAlign: 'center', color: '#475569', padding: 32 }}>No results</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={S.page}>
          <span style={{ color: '#64748b', fontSize: 13 }}>{filtered.length} rows</span>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} style={S.pageBtn(i === page)} onClick={() => setPage(i)}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  )
}
