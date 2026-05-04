import { getAdminSupabase } from './lib/admin-supabase.js'

const ALLOWED_TABLES = [
  'users', 'transactions', 'ad_account_requests', 'inventory_products',
  'inventory_lines', 'purchases', 'projects', 'orders', 'deposits',
  'media_buyers', 'payment_methods', 'business_types', 'support_tickets',
  'announcements', 'settings'
]

function isAllowed(table) {
  return ALLOWED_TABLES.includes(table)
}

async function safeJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { error: 'Invalid JSON response', raw: text.slice(0, 500) }
  }
}

export default async function handler(req, res) {
  const table = req.query.table

  if (!table) {
    return res.status(400).json({ error: 'Missing table parameter' })
  }

  if (!isAllowed(table)) {
    return res.status(403).json({ error: 'Table not allowed: ' + table })
  }

  try {
    const client = getAdminSupabase()

    // ── GET ──
    if (req.method === 'GET') {
      let query = client.from(table).select(req.query.select || '*')

      // Apply filters from query params
      const { order, ascending, limit, single, ...filters } = req.query
      for (const [key, val] of Object.entries(filters)) {
        if (key === 'table' || key === 'select') continue
        query = query.eq(key, val)
      }
      if (order) {
        query = query.order(order, { ascending: ascending !== 'false' })
      }
      if (limit) {
        query = query.limit(parseInt(limit))
      }
      if (single === 'true') {
        query = query.single()
      }

      const { data, error } = await query
      if (error) throw error
      return res.status(200).json(data || [])
    }

    // ── POST ──
    if (req.method === 'POST') {
      const rows = Array.isArray(req.body) ? req.body : [req.body]
      const { data, error } = await client.from(table).insert(rows).select()
      if (error) throw error
      return res.status(200).json(Array.isArray(req.body) ? (data || []) : (data?.[0] || null))
    }

    // ── PUT ──
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body
      if (!id) {
        return res.status(400).json({ error: 'Missing id in body' })
      }
      const { data, error } = await client.from(table).update(updates).eq('id', id).select()
      if (error) throw error
      return res.status(200).json(data?.[0] || null)
    }

    // ── DELETE ──
    if (req.method === 'DELETE') {
      const id = req.query.id
      if (!id) {
        return res.status(400).json({ error: 'Missing id query param' })
      }
      const { error } = await client.from(table).delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error(`[crud ${table} ${req.method}]`, err.message)
    return res.status(500).json({ error: err.message })
  }
}
