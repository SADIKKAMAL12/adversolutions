const WA_SERVER = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { type } = req.query

  if (type === 'qr') {
    try {
      const r = await fetch(`${WA_SERVER}/qr`, { signal: AbortSignal.timeout(8000) })
      const data = await r.json()
      return res.status(r.status).json(data)
    } catch {
      return res.status(503).json({ error: 'WhatsApp server unreachable.' })
    }
  }

  if (type === 'status') {
    try {
      const r = await fetch(`${WA_SERVER}/status`, { signal: AbortSignal.timeout(4000) })
      const data = await r.json()
      return res.status(r.status).json(data)
    } catch {
      return res.status(503).json({ connected: false, error: 'WhatsApp server unreachable' })
    }
  }

  if (type === 'info') {
    try {
      const r = await fetch(`${WA_SERVER}/info`, { signal: AbortSignal.timeout(4000) })
      const data = await r.json()
      return res.status(r.status).json(data)
    } catch {
      return res.status(503).json({ connected: false })
    }
  }

  if (type === 'disconnect') {
    try {
      const r = await fetch(`${WA_SERVER}/disconnect`, { method: 'POST', signal: AbortSignal.timeout(8000) })
      const data = await r.json()
      return res.status(r.status).json(data)
    } catch {
      return res.status(503).json({ error: 'WhatsApp server unreachable' })
    }
  }

  if (type === 'reconnect') {
    try {
      const r = await fetch(`${WA_SERVER}/reconnect`, { method: 'POST', signal: AbortSignal.timeout(8000) })
      const data = await r.json()
      return res.status(r.status).json(data)
    } catch {
      return res.status(503).json({ error: 'WhatsApp server unreachable' })
    }
  }

  return res.status(400).json({ error: 'Invalid type' })
}
