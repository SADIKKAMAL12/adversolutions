const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, otp } = req.body || {}
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' })

  try {
    const r = await fetch(`${WA_SERVER}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await r.json()
    return res.status(r.status).json(data)
  } catch (err) {
    return res.status(503).json({ error: 'WhatsApp server unreachable: ' + err.message })
  }
}
