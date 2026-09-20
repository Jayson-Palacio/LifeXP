'use client'

import { useMemo, useState } from 'react'
import { isQuietHousehold } from '../lib/adminStats'

const APP_FILTERS = ['All', 'Quests', 'Vital', 'Ledger', 'Table', 'None', 'Quiet']

export default function AdminHouseholds({
  households,
  tickets,
  mounted,
  relativeTime,
  onDelete,
  presetFilter = '',
}) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState(presetFilter || 'All')
  const [openId, setOpenId] = useState(null)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return households.filter((h) => {
      if (filter === 'None' && h.apps.length) return false
      if (filter === 'Quiet' && !isQuietHousehold(h)) return false
      if (filter !== 'All' && filter !== 'None' && filter !== 'Quiet' && !h.apps.includes(filter)) return false
      if (!needle) return true
      return [h.email, h.display_name, h.family_name, ...(h.people || []).map((p) => p.name)]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [households, q, filter])

  const ticketsByUser = useMemo(() => {
    const map = {}
    for (const ticket of tickets) {
      if (!map[ticket.user_id]) map[ticket.user_id] = []
      map[ticket.user_id].push(ticket)
    }
    return map
  }, [tickets])

  return (
    <div>
      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search households"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="admin-chips">
          {APP_FILTERS.map((item) => (
            <button key={item} type="button" className={filter === item ? 'is-on' : ''} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <span className="admin-row-meta">{rows.length}</span>
      </div>

      {rows.length === 0 && <p className="admin-empty">No households in this filter.</p>}

      {rows.map((house) => {
        const open = openId === house.id
        const houseTickets = ticketsByUser[house.id] || []
        return (
          <article key={house.id} className={`admin-house${open ? ' is-open' : ''}`}>
            <button type="button" className="admin-house-head" onClick={() => setOpenId(open ? null : house.id)}>
              <span>
                <strong>{house.family_name !== '—' ? house.family_name : house.display_name}</strong>
                <em>{house.email}</em>
              </span>
              <span className="admin-apps">
                {house.apps.length ? house.apps.map((app) => <span key={app}>{app}</span>) : <span>None</span>}
              </span>
              <time>{relativeTime(house.last_sign_in_at, mounted)}</time>
            </button>
            {open && (
              <div className="admin-house-body">
                <p className="admin-muted">
                  {house.display_name !== '—' ? house.display_name : house.email} · signed up {relativeTime(house.created_at, mounted)}
                </p>
                <div className="admin-house-cols">
                  <div>
                    <p className="admin-kicker">People</p>
                    {house.people.length === 0 ? (
                      <p className="admin-muted">Nobody set up yet.</p>
                    ) : (
                      <ul>
                        {house.people.map((person, i) => (
                          <li key={`${person.name}-${i}`}>{person.name} <em>{person.kind}</em></li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="admin-kicker">Tickets</p>
                    {houseTickets.length === 0 ? (
                      <p className="admin-muted">None.</p>
                    ) : (
                      <ul>
                        {houseTickets.slice(0, 4).map((ticket) => (
                          <li key={ticket.id}>{ticket.status} · {ticket.ticket_type}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-btn admin-btn-red"
                  onClick={() => {
                    if (confirm(`Delete ${house.email}? This removes their account and household data.`)) {
                      onDelete(house.id)
                      setOpenId(null)
                    }
                  }}
                >
                  Delete household
                </button>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
