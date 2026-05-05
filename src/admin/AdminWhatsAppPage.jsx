import { useState, useEffect, useRef } from 'react'
import { C, getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn } from '../shared/UI.jsx'

export default function AdminWhatsAppPage() {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [status, setStatus] = useState({ connected: false, hasQR: false, error: null })
  const [qrImage, setQrImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrState, setQrState] = useState('initializing') // 'initializing' | 'qr' | 'connected' | 'error'
  const intervalRef = useRef(null)

  const poll = async () => {
    try {
      const r = await fetch('/api/whatsapp-qr')
      const data = await r.json()

      if (data.status === 'connected') {
        setQrState('connected')
        setQrImage(null)
        setStatus({ connected: true, hasQR: false, error: null })
      } else if (data.status === 'qr' && data.qr) {
        setQrState('qr')
        setQrImage(data.qr)
        setStatus({ connected: false, hasQR: true, error: null })
      } else if (data.status === 'initializing') {
        setQrState('initializing')
        setQrImage(null)
      } else if (data.error) {
        setQrState('error')
        setStatus(s => ({ ...s, error: data.error }))
      }
    } catch {
      setQrState('error')
      setStatus(s => ({ ...s, error: 'Cannot reach WhatsApp server. Is it running?' }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    poll()
    intervalRef.current = setInterval(poll, 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <PageShell
      title="WhatsApp Connection"
      subtitle="Connect your WhatsApp number to enable OTP verification for user registrations."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22 }}>
        {/* QR / Status card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: qrState === 'connected' ? C.greenL : C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {qrState === 'connected' ? '✅' : '📱'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TC.g800 }}>
                {qrState === 'connected' ? 'WhatsApp Connected' : 'Scan QR Code'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: TC.g500 }}>
                {qrState === 'connected'
                  ? 'Your WhatsApp is connected and ready to send OTPs.'
                  : 'Open WhatsApp on your phone → Linked Devices → Link a device'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: qrState === 'connected' ? C.greenL : qrState === 'error' ? '#fee2e2' : C.yellowL,
                color: qrState === 'connected' ? C.green : qrState === 'error' ? C.red : '#d97706',
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
                {qrState === 'connected' ? 'Connected' : qrState === 'error' ? 'Error' : qrState === 'initializing' ? 'Starting...' : 'Awaiting Scan'}
              </span>
            </div>
          </div>

          {/* QR Code area */}
          <div style={{
            minHeight: 320, background: TC.g50, borderRadius: 16, border: `2px dashed ${TC.g200}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14,
          }}>
            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 14, color: TC.g500 }}>Connecting to WhatsApp server...</div>
              </div>
            )}
            {!loading && qrState === 'connected' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.green, marginBottom: 8 }}>Connected!</div>
                <div style={{ fontSize: 14, color: TC.g500 }}>WhatsApp is active and ready to send OTPs.</div>
              </div>
            )}
            {!loading && qrState === 'qr' && qrImage && (
              <div style={{ textAlign: 'center' }}>
                <img src={qrImage} alt="WhatsApp QR Code" style={{ width: 260, height: 260, borderRadius: 12 }} />
                <div style={{ fontSize: 13, color: TC.g500, marginTop: 12 }}>QR code refreshes automatically every 5 seconds</div>
              </div>
            )}
            {!loading && qrState === 'initializing' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
                <div style={{ fontSize: 14, color: TC.g500 }}>WhatsApp is starting up...</div>
                <div style={{ fontSize: 12, color: TC.g400, marginTop: 6 }}>This may take up to 30 seconds on first run</div>
              </div>
            )}
            {!loading && qrState === 'error' && (
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 8 }}>Server Unreachable</div>
                <div style={{ fontSize: 13, color: TC.g500, marginBottom: 16 }}>{status.error}</div>
                <Btn onClick={poll} variant="outline">↻ Retry</Btn>
              </div>
            )}
          </div>
        </Card>

        {/* Setup instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: TC.g800 }}>How to Connect</h3>
            {[
              ['1', 'Start the WhatsApp server', 'Run: cd whatsapp-server && npm install && npm start'],
              ['2', 'Open WhatsApp on your phone', 'Go to Settings → Linked Devices'],
              ['3', 'Tap "Link a Device"', 'Your phone will open a QR scanner'],
              ['4', 'Scan the QR code', 'Point your camera at the QR code on the left'],
              ['5', 'Done!', 'The status will turn green and OTPs will be sent automatically'],
            ].map(([n, title, desc]) => (
              <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.primary + '20', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TC.g700 }}>{title}</div>
                  <div style={{ fontSize: 12, color: TC.g400, marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ background: C.primaryLight, border: `1px solid ${C.primary}20` }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: C.g700 }}>⚙️ Server Setup</h3>
            <div style={{ fontSize: 12, color: C.g600, lineHeight: 1.7 }}>
              <div style={{ marginBottom: 8 }}>The WhatsApp server must run separately. Set the URL in your Vercel environment:</div>
              <div style={{ background: '#1e293b', color: '#94d3fd', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, marginBottom: 8 }}>
                WHATSAPP_SERVER_URL=https://your-server.com
              </div>
              <div style={{ marginBottom: 8 }}>For local dev, it defaults to:</div>
              <div style={{ background: '#1e293b', color: '#94d3fd', borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 11 }}>
                http://localhost:3001
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: TC.g800 }}>OTP Flow</h3>
            <div style={{ fontSize: 12, color: TC.g500, lineHeight: 1.8 }}>
              <div>① User enters phone on registration</div>
              <div>② System sends 6-digit OTP via WhatsApp</div>
              <div>③ User enters the code to verify</div>
              <div>④ OTP expires after <strong>10 minutes</strong></div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
