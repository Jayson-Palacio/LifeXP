const QUIET_MS = 90 * 24 * 60 * 60 * 1000

function isoDay(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function fillDays(count) {
  const out = {}
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    out[isoDay(d)] = 0
  }
  return out
}

export function isQuietHousehold(house, now = Date.now()) {
  const last = house.last_sign_in_at ? new Date(house.last_sign_in_at).getTime() : 0
  return !last || now - last > QUIET_MS
}

export function computeAdminStats({ households = [], tickets = [] }) {
  const now = Date.now()
  const day7 = now - 7 * 24 * 60 * 60 * 1000
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress')

  const signupsByDay = fillDays(30)
  households.forEach((h) => {
    const day = isoDay(h.created_at)
    if (day && signupsByDay[day] !== undefined) signupsByDay[day]++
  })

  const appCounts = { Quests: 0, Vital: 0, Ledger: 0, Table: 0 }
  for (const house of households) {
    for (const app of house.apps || []) {
      if (appCounts[app] != null) appCounts[app]++
    }
  }

  return {
    households: households.length,
    active7d: households.filter((h) => h.last_sign_in_at && new Date(h.last_sign_in_at).getTime() >= day7).length,
    signups7d: households.filter((h) => h.created_at && new Date(h.created_at).getTime() >= day7).length,
    openTickets: openTickets.length,
    unused: households.filter((h) => !h.apps?.length).length,
    quiet: households.filter((h) => isQuietHousehold(h, now)).length,
    appCounts,
    signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
    openTicketRows: openTickets,
  }
}

export function isImageValue(val) {
  if (typeof val !== 'string') return false
  const s = val.trim()
  if (s.startsWith('data:image/')) return true
  return (
    (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) &&
    (/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(s) || s.includes('/avatars/') || s.includes('/rewards/'))
  )
}
