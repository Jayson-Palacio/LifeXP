import { createAdminClient } from '../../../../utils/supabase/admin'
import { createClient } from '../../../../utils/supabase/server'

const ALLOWED_TABLES = ['children', 'missions', 'completions', 'rewards', 'redemptions', 'app_settings']

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return allowed.includes(user.email.toLowerCase())
}

export async function PATCH(request) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id, updates } = await request.json()

  if (!ALLOWED_TABLES.includes(table)) {
    return Response.json({ error: 'Table not allowed' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from(table).update(updates).eq('id', id).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function DELETE(request) {
  if (!await verifyAdmin()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id } = await request.json()

  if (!ALLOWED_TABLES.includes(table)) {
    return Response.json({ error: 'Table not allowed' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from(table).delete().eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
