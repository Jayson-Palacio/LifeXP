import { createAdminClient } from '../../utils/supabase/admin'
import AdminDashboardClient from '../../components/AdminDashboardClient'

export const dynamic = 'force-dynamic'

function displayNameFrom(user) {
  const meta = user.raw_user_meta_data || {}
  if (meta.first_name) return `${meta.first_name} ${meta.last_name || ''}`.trim()
  if (meta.full_name) return meta.full_name
  if (meta.name) return meta.name
  return ''
}

function uniqueIds(rows, key) {
  return new Set((rows || []).map((row) => row[key]).filter(Boolean))
}

export default async function AdminPage() {
  const admin = createAdminClient()

  const [
    childrenRes,
    settingsRes,
    ticketsRes,
    vitalRes,
    ledgerRes,
    tableRes,
    profilesRes,
    usersRes,
  ] = await Promise.all([
    admin.from('children').select('id, name, user_id, created_at'),
    admin.from('app_settings').select('user_id, family_name, setup_complete'),
    admin.from('support_tickets').select('*').order('created_at', { ascending: false }),
    admin.from('vital_members').select('owner_id, display_name, kind'),
    admin.from('ledger_settings').select('owner_id'),
    admin.from('table_plans').select('owner_id'),
    admin.from('profiles').select('user_id, first_name, last_name'),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const children = childrenRes.data || []
  const appSettings = settingsRes.data || []
  const tickets = ticketsRes.data || []
  const vitalMembers = vitalRes.data || []
  const vitalOwners = uniqueIds(vitalMembers, 'owner_id')
  const ledgerOwners = uniqueIds(ledgerRes.data, 'owner_id')
  const tableOwners = uniqueIds(tableRes.data, 'owner_id')
  const rawAuthUsers = usersRes.data?.users || []

  const settingsByUser = Object.fromEntries(appSettings.map((row) => [row.user_id, row]))
  const profileByUser = Object.fromEntries((profilesRes.data || []).map((row) => [row.user_id, row]))

  const peopleByUser = {}
  for (const child of children) {
    if (!child.user_id) continue
    if (!peopleByUser[child.user_id]) peopleByUser[child.user_id] = []
    peopleByUser[child.user_id].push({ name: child.name, kind: 'Quests' })
  }
  for (const member of vitalMembers) {
    if (!member.owner_id) continue
    if (!peopleByUser[member.owner_id]) peopleByUser[member.owner_id] = []
    peopleByUser[member.owner_id].push({ name: member.display_name, kind: 'Vital' })
  }

  const households = rawAuthUsers
    .map((user) => {
      const family = settingsByUser[user.id]
      const profile = profileByUser[user.id]
      const people = peopleByUser[user.id] || []
      const apps = []
      if (people.some((p) => p.kind === 'Quests') || family?.setup_complete) apps.push('Quests')
      if (vitalOwners.has(user.id)) apps.push('Vital')
      if (ledgerOwners.has(user.id)) apps.push('Ledger')
      if (tableOwners.has(user.id)) apps.push('Table')
      const fromProfile = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''
      return {
        id: user.id,
        email: user.email || '',
        display_name: fromProfile || displayNameFrom(user) || '—',
        family_name: family?.family_name || '—',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        apps,
        people,
      }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const householdById = Object.fromEntries(households.map((h) => [h.id, h]))
  const enrichedTickets = tickets.map((ticket) => {
    const house = householdById[ticket.user_id]
    return {
      ...ticket,
      user_email: house?.email || 'Unknown',
      user_name: house?.display_name && house.display_name !== '—' ? house.display_name : (house?.family_name || 'Unknown'),
      family_name: house?.family_name || '—',
    }
  })

  return (
    <AdminDashboardClient
      households={households}
      tickets={enrichedTickets}
    />
  )
}
