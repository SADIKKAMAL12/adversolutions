import { getAdminSupabase } from '../lib/admin-supabase.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await getAdminSupabase().from('business_types').select('*').order('name', { ascending: true })
      if (error) throw error
      return res.status(200).json((data || []).map(r => r.name))
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const { names } = req.body
      if (!Array.isArray(names)) return res.status(400).json({ error: 'names array required' })

      // Delete all existing (filter on name avoids id-type mismatch between SERIAL vs UUID schemas)
      await getAdminSupabase().from('business_types').delete().not('name', 'is', null)

      // Insert new ones
      if (names.length > 0) {
        const { data, error } = await getAdminSupabase().from('business_types').insert(names.map(name => ({ name }))).select()
        if (error) throw error
        return res.status(200).json((data || []).map(r => r.name))
      }

      return res.status(200).json([])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
