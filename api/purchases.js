import { getAdminSupabase } from './lib/admin-supabase.js'

export default async function handler(req, res) {
  try {
    const client = getAdminSupabase()

    if (req.method === 'GET') {
      const userId = req.query.user_id
      if (userId) {
        // User-scoped: query table directly filtered by user_id
        const { data, error } = await client
          .from('purchases')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return res.status(200).json(data || [])
      }
      // Admin: get all via RPC (bypasses PostgREST schema cache)
      const { data, error } = await client.rpc('get_purchases')
      if (error) throw error
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      // Use RPC to bypass PostgREST schema cache — inserts via raw SQL function
      const { error } = await client.rpc('create_purchase', { p: req.body })
      if (error) throw error
      return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[purchases]', err.message)
    return res.status(500).json({ error: err.message })
  }
}
