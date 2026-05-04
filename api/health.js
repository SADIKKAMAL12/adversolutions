import { getAdminSupabase } from './lib/admin-supabase.js'

export default async function handler(req, res) {
  const checks = {
    node: process.version,
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseConnected: false,
  }

  try {
    const client = getAdminSupabase()
    const { data, error } = await client.from('users').select('id', { count: 'exact', head: true })
    checks.supabaseConnected = !error
    if (error) checks.supabaseError = error.message
  } catch (err) {
    checks.supabaseError = err.message
  }

  res.status(200).json(checks)
}
