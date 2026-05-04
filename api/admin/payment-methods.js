import { getAdminSupabase } from '../lib/admin-supabase.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await getAdminSupabase().from('payment_methods').select('*').order('created_at', { ascending: true })
      if (error) throw error
      return res.status(200).json(data || [])
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'POST') {
    try {
      const method = req.body
      const { data, error } = await getAdminSupabase().from('payment_methods').insert([method]).select().single()
      if (error) throw error
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const { data, error } = await getAdminSupabase().from('payment_methods').update(updates).eq('id', id).select().single()
      if (error) throw error
      return res.status(200).json(data)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'Missing id' })
      const { error } = await getAdminSupabase().from('payment_methods').delete().eq('id', id)
      if (error) throw error
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
