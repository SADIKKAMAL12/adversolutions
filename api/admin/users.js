import { getAdminSupabase } from '../lib/admin-supabase.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await getAdminSupabase().from('users').select('*').order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body
    const { data, error } = await getAdminSupabase().from('users').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  res.status(405).json({ error: 'Method not allowed' })
}
