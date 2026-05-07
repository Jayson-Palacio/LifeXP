import { createAdminClient } from '../../utils/supabase/admin'
import AdminDashboardClient from '../../components/AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const admin = createAdminClient()

  // Fetch all tables in parallel
  const [
    { data: children },
    { data: missions },
    { data: completions },
    { data: rewards },
    { data: redemptions },
    { data: appSettings },
  ] = await Promise.all([
    admin.from('children').select('*').order('name'),
    admin.from('missions').select('*').order('name'),
    admin.from('completions').select('*').order('submitted_at', { ascending: false }),
    admin.from('rewards').select('*').order('name'),
    admin.from('redemptions').select('*').order('redeemed_at', { ascending: false }),
    admin.from('app_settings').select('*'),
  ])

  // Fetch auth users via the admin API
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 })

  // ── Analytics aggregations ──────────────────────────────────────────────────

  // Signups per day (last 30 days)
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 29)

  const signupsByDay = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(thirtyDaysAgo.getDate() + i)
    signupsByDay[d.toISOString().slice(0, 10)] = 0
  }
  ;(authUsers || []).forEach(u => {
    const day = u.created_at?.slice(0, 10)
    if (day && signupsByDay[day] !== undefined) signupsByDay[day]++
  })

  // Completions per day (last 14 days)
  const fourteenDaysAgo = new Date(now)
  fourteenDaysAgo.setDate(now.getDate() - 13)
  const completionsByDay = {}
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo)
    d.setDate(fourteenDaysAgo.getDate() + i)
    completionsByDay[d.toISOString().slice(0, 10)] = 0
  }
  ;(completions || []).forEach(c => {
    const day = c.submitted_at?.slice(0, 10)
    if (day && completionsByDay[day] !== undefined) completionsByDay[day]++
  })

  // Top missions by approval count
  const missionCompletionCounts = {}
  ;(completions || []).filter(c => c.status === 'approved').forEach(c => {
    missionCompletionCounts[c.mission_id] = (missionCompletionCounts[c.mission_id] || 0) + 1
  })
  const topMissions = Object.entries(missionCompletionCounts)
    .map(([id, count]) => {
      const m = (missions || []).find(m => m.id === id)
      return { id, name: m?.name || 'Unknown', icon: m?.icon || '🎯', count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Top rewards by fulfillment count
  const rewardRedemptionCounts = {}
  ;(redemptions || []).filter(r => r.status === 'fulfilled').forEach(r => {
    rewardRedemptionCounts[r.reward_id] = (rewardRedemptionCounts[r.reward_id] || 0) + 1
  })
  const topRewards = Object.entries(rewardRedemptionCounts)
    .map(([id, count]) => {
      const r = (rewards || []).find(r => r.id === id)
      return { id, name: r?.name || 'Unknown', icon: r?.icon || '🎁', count }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats = {
    totalUsers: authUsers?.length || 0,
    totalChildren: children?.length || 0,
    totalMissions: missions?.length || 0,
    totalCompletions: (completions || []).filter(c => c.status === 'approved').length,
    totalCoinsSpent: (redemptions || []).filter(r => r.status === 'fulfilled').reduce((sum, r) => {
      const reward = (rewards || []).find(rw => rw.id === r.reward_id)
      return sum + (reward?.cost || 0)
    }, 0),
    pendingApprovals: (completions || []).filter(c => c.status === 'pending').length,
    signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
    completionsByDay: Object.entries(completionsByDay).map(([date, count]) => ({ date, count })),
    topMissions,
    topRewards,
  }

  return (
    <AdminDashboardClient
      authUsers={authUsers || []}
      children={children || []}
      missions={missions || []}
      completions={completions || []}
      rewards={rewards || []}
      redemptions={redemptions || []}
      appSettings={appSettings || []}
      stats={stats}
    />
  )
}
