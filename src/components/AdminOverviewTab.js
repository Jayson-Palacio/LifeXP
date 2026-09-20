'use client'

const APPS = ['Quests', 'Vital', 'Ledger', 'Table']

function Chart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const total = data.reduce((sum, d) => sum + d.count, 0)
  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h3>Signups · 30 days</h3>
        <span>{total}</span>
      </div>
      {total === 0 ? (
        <p className="admin-muted">No new households in this window.</p>
      ) : (
        <svg className="admin-chart" viewBox={`0 0 ${data.length * 10} 60`}>
          {data.map((d, i) => {
            const h = Math.max((d.count / max) * 54, d.count ? 2 : 1)
            return (
              <rect key={d.date} x={i * 10 + 1} y={60 - h} width={8} height={h} rx={2} fill="#0d7377" opacity={d.count ? 0.9 : 0.2}>
                <title>{`${d.date}: ${d.count}`}</title>
              </rect>
            )
          })}
        </svg>
      )}
      <div className="admin-chart-axis">
        <span>{data[0]?.date?.slice(5)}</span>
        <span>{data[data.length - 1]?.date?.slice(5)}</span>
      </div>
    </div>
  )
}

export default function AdminOverviewTab({ stats, mounted, relativeTime, onJump }) {
  const maxApp = Math.max(...APPS.map((app) => stats.appCounts[app] || 0), 1)
  const cards = [
    { label: 'Households', value: stats.households, sub: `${stats.signups7d} new this week`, tab: 'households' },
    { label: 'Signed in · 7 days', value: stats.active7d, sub: `${stats.quiet} quiet for 90+ days`, tab: 'households', filter: 'quiet' },
    { label: 'Open tickets', value: stats.openTickets, sub: 'Inbox', tab: 'inbox', status: 'open', alert: true },
    { label: 'No app yet', value: stats.unused, sub: 'Signed up, never started', tab: 'households', filter: 'none' },
  ]

  return (
    <div>
      <div className="admin-grid-cards">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            className={`admin-stat${card.alert && card.value ? ' is-alert' : ''}`}
            onClick={() => onJump(card.tab, { status: card.status, filter: card.filter })}
          >
            <p>{card.label}</p>
            <strong>{card.value.toLocaleString()}</strong>
            <small>{card.sub}</small>
          </button>
        ))}
      </div>

      <div className="admin-grid-charts">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h3>Who is using what</h3>
            <span>{stats.households} households</span>
          </div>
          <div className="admin-apps-meter">
            {APPS.map((app) => (
              <button key={app} type="button" onClick={() => onJump('households', { filter: app })}>
                <span>{app}</span>
                <div className="admin-bar">
                  <i style={{ width: `${((stats.appCounts[app] || 0) / maxApp) * 100}%` }} />
                </div>
                <strong>{stats.appCounts[app] || 0}</strong>
              </button>
            ))}
          </div>
        </div>
        <Chart data={stats.signupsByDay} />
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Needs a reply</h3>
          <button type="button" className="admin-text-btn" onClick={() => onJump('inbox', { status: 'open' })}>Inbox</button>
        </div>
        {stats.openTicketRows.length === 0 ? (
          <p className="admin-muted">Nothing waiting.</p>
        ) : (
          <div className="admin-feed">
            {stats.openTicketRows.slice(0, 8).map((ticket) => (
              <button key={ticket.id} type="button" onClick={() => onJump('inbox', { status: ticket.status })}>
                <strong>{ticket.user_email}</strong>
                <time>{relativeTime(ticket.created_at, mounted)}</time>
                <em>{ticket.ticket_type} · {ticket.message}</em>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
