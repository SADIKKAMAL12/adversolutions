import { getAdminSupabase } from '../lib/admin-supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, action, reason } = req.body

  if (!id || !action) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const updates = action === 'approve'
      ? { status: 'approved', reject_reason: null }
      : { status: 'rejected', reject_reason: reason || '' }

    const { data, error } = await getAdminSupabase()
      .from('media_buyers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.status(200).json({ success: true, data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
