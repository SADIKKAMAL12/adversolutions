import { createClient } from '@supabase/supabase-js'

let _client = null

export function getAdminSupabase() {
  if (_client) return _client

  const rawUrl = (process.env.SUPABASE_URL || '').trim()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

  if (!rawUrl || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  // Remove trailing slash to prevent URL parsing issues
  const url = rawUrl.replace(/\/$/, '')

  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  return _client
}

// Backward-compatible default export for existing imports
export const adminSupabase = new Proxy({}, {
  get(_target, prop) {
    const client = getAdminSupabase()
    return client[prop]
  }
})
