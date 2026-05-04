import { getAdminSupabase } from '../lib/admin-supabase.js'

async function safeCount(table) {
  try {
    const { count, error } = await getAdminSupabase()
      .from(table)
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count || 0
  } catch (err) {
    console.error(`[stats] Count error for ${table}:`, err.message)
    return 0
  }
}

async function safeSumBalance() {
  try {
    const { data, error } = await getAdminSupabase().from('users').select('balance')
    if (error) throw error
    return (data || []).reduce((sum, u) => sum + parseFloat(u.balance || 0), 0)
  } catch (err) {
    console.error('[stats] Balance sum error:', err.message)
    return 0
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const [userCount, orderCount, depositCount, ticketCount, buyerCount, totalBalanceSum] = await Promise.all([
      safeCount('users'),
      safeCount('orders'),
      safeCount('deposits'),
      safeCount('support_tickets'),
      safeCount('media_buyers'),
      safeSumBalance(),
    ])

    res.status(200).json({
      users: userCount,
      orders: orderCount,
      deposits: depositCount,
      tickets: ticketCount,
      mediaBuyers: buyerCount,
      totalBalance: totalBalanceSum,
    })
  } catch (err) {
    console.error('[stats] Unexpected error:', err)
    res.status(500).json({ error: err.message })
  }
}
