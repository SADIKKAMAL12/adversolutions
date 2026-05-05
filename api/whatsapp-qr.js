const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const r = await fetch(`${WA_SERVER}/qr`, { signal: AbortSignal.timeout(8000) })
    const data = await r.json()
    return res.status(r.status).json(data)
  } catch (err) {
    return res.status(503).json({ error: 'WhatsApp server unreachable. Make sure the WhatsApp server is running.' })
  }
}
