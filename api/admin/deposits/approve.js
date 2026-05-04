import { getAdminSupabase } from '../../lib/admin-supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { depositId, userId, amount } = req.body

  if (!depositId || !userId || amount == null) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // 1. Update deposit status to completed
    const { error: depositError } = await getAdminSupabase()
      .from('deposits')
      .update({ status: 'completed' })
      .eq('id', depositId)

    if (depositError) throw depositError

    // 2. Update user balance
    const { data: user, error: userError } = await getAdminSupabase()
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    const newBalance = parseFloat(user.balance || 0) + parseFloat(amount)

    const { error: updateError } = await getAdminSupabase()
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId)

    if (updateError) throw updateError

    // 3. Create a completed transaction record
    const { error: txError } = await getAdminSupabase()
      .from('transactions')
      .insert([{
        user_id: userId,
        type: 'Deposit',
        method: 'Admin Approval',
        amount: parseFloat(amount),
        status: 'completed',
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }])

    if (txError) throw txError

    res.status(200).json({ success: true, newBalance })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
