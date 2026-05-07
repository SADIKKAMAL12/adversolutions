import { useState, useEffect, useRef } from 'react'
import { C, getThemeColors } from '../shared/theme.js'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn } from '../shared/UI.jsx'

export default function AdminWhatsAppPage() {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [qrImage, setQrImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrState, setQrState] = useState('initializing')
  const [errorMsg, setErrorMsg] = useState('')
  const [info, setInfo] = useState(null)
  const [disconnecting, setDisconnecting] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const intervalRef = useRef(null)

  const poll = async () => {
    try {
      const r = await fetch('/api/whatsapp?type=qr')
      const data = await r.json()
      if (data.status === 'connected') {
        setQrState('connected')
        setQrImage(null)
        setErrorMsg('')
        fetchInfo()
      } else if (data.status === 'qr' && data.qr) {
        setQrState('qr')
        setQrImage(data.qr)
        setInfo(null)
      } else if (data.status === 'initializing') {
        setQrState('initializing')
        setQrImage(null)
      } else if (data.error) {
        setQrState('error')
        setErrorMsg(data.error)
      }
    } catch {
      setQrState('error')
      setErrorMsg('Cannot reach WhatsApp server.')
    } finally {
      setLoading(false)
    }
  }

  const fetchInfo = async () => {
    try {
      const r = await fetch('/api/whatsapp?type=info')
      const data = await r.json()
      if (data.connected) setInfo(data)
    } catch {}
  }

  const disconnect = async () => {
    if (!confirm('This will log out WhatsApp and require a new QR scan. Continue?')) return
    setDisconnecting(true)
    try {
      await fetch('/api/whatsapp?type=disconnect', { method: 'POST' })
      setQrState('initializing')
      setInfo(null)
      setQrImage(null)
    } catch {}
    setDisconnecting(false)
  }

  const reconnect = async () => {
    setReconnecting(true)
    try {
      await fetch('/api/whatsapp?type=reconnect', { method: 'POST' })
      setQrState('initializing')
      setQrImage(null)
    } catch {}
    setTimeout(() => setReconnecting(false), 3000)
  }

  const sendTest = async () => {
    if (!testPhone.trim()) return
    setTestSending(true)
    setTestResult(null)
    try {
      const r = await fetch('/api/otp?action=send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone.trim() }),
      })
      const data = await r.json()
      setTestResult(r.ok ? { ok: true, msg: 'OTP sent! Check WhatsApp on that number.' } : { ok: false, msg: data.error })
    } catch (err) {
      setTestResult({ ok: false, msg: err.message })
    }
    setTestSending(false)
  }

  useEffect(() => {
    poll()
    intervalRef.current = setInterval(poll, 5000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const connected = qrState === 'connected'

  return (
    <PageShell
      title="WhatsApp Connection"
      subtitle="Connect your WhatsApp number to enable OTP verification for user registrations."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22 }}>

        {/* Main card */}
        <Card>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: connected ? C.greenL : C.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {connected ? '✅' : '📱'}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TC.g800 }}>
                {connected ? 'WhatsApp Connected' : 'Scan QR Code'}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: TC.g500 }}>
                {connected
                  ? info?.pushname ? `Logged in as ${info.pushname}${info.phone ? ' (+' + info.phone + ')' : ''}` : 'Ready to send OTPs'
                  : 'Open WhatsApp → Linked Devices → Link a device'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: connected ? C.greenL : qrState === 'error' ? '#fee2e2' : C.yellowL,
                color: connected ? C.green : qrState === 'error' ? C.red : '#d97706',
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />
                {connected ? 'Connected' : qrState === 'error' ? 'Error' : qrState === 'initializing' ? 'Starting…' : 'Awaiting Scan'}
              </span>
              {connected && (
                <Btn variant="outline" size="sm" onClick={reconnect} disabled={reconnecting} style={{ fontSize: 12 }}>
                  {reconnecting ? '…' : '↺ Reconnect'}
                </Btn>
              )}
            </div>
          </div>

          {/* QR / status area */}
          <div style={{
            minHeight: 280, background: TC.g50, borderRadius: 16, border: `2px dashed ${TC.g200}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14,
          }}>
            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 14, color: TC.g500 }}>Connecting to WhatsApp server…</div>
              </div>
            )}
            {!loading && connected && (
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.green, marginBottom: 4 }}>Connected!</div>
                {info?.pushname && <div style={{ fontSize: 14, color: TC.g500, marginBottom: 4 }}>{info.pushname}</div>}
                {info?.phone && <div style={{ fontSize: 13, color: TC.g400, marginBottom: 16 }}>+{info.phone}</div>}
                <Btn variant="outline" onClick={disconnect} disabled={disconnecting}
                  style={{ borderColor: C.red, color: C.red, fontSize: 13 }}>
                  {disconnecting ? 'Disconnecting…' : '⏏ Disconnect / Change Account'}
                </Btn>
              </div>
            )}
            {!loading && qrState === 'qr' && qrImage && (
              <div style={{ textAlign: 'center' }}>
                <img src={qrImage} alt="WhatsApp QR Code" style={{ width: 240, height: 240, borderRadius: 12 }} />
                <div style={{ fontSize: 13, color: TC.g500, marginTop: 10 }}>Refreshes every 5 seconds</div>
              </div>
            )}
            {!loading && qrState === 'initializing' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
                <div style={{ fontSize: 14, color: TC.g500 }}>WhatsApp is starting up…</div>
                <div style={{ fontSize: 12, color: TC.g400, marginTop: 6 }}>May take up to 30 seconds on first run</div>
              </div>
            )}
            {!loading && qrState === 'error' && (
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 8 }}>Server Unreachable</div>
                <div style={{ fontSize: 13, color: TC.g500, marginBottom: 16 }}>{errorMsg}</div>
                <Btn onClick={poll} variant="outline">↻ Retry</Btn>
              </div>
            )}
          </div>

          {/* Test OTP — only shown when connected */}
          {connected && (
            <div style={{ marginTop: 20, borderTop: `1px solid ${TC.g200}`, paddingTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: TC.g700, marginBottom: 12 }}>🧪 Send Test OTP</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  style={{ flex: 1, border: `1.5px solid ${TC.g200}`, borderRadius: 9, padding: '9px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: TC.card, color: TC.g800 }}
                />
                <Btn onClick={sendTest} disabled={testSending || !testPhone.trim()}>
                  {testSending ? 'Sending…' : 'Send OTP'}
                </Btn>
              </div>
              {testResult && (
                <div style={{ marginTop: 10, padding: '9px 14px', borderRadius: 9, fontSize: 13, background: testResult.ok ? C.greenL : '#fee2e2', color: testResult.ok ? C.green : C.red }}>
                  {testResult.msg}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 800, color: TC.g800 }}>How to Connect</h3>
            {[
              ['1', 'WhatsApp server is running', 'Already running on this server (PM2)'],
              ['2', 'Open WhatsApp on your phone', 'Go to Settings → Linked Devices'],
              ['3', 'Tap "Link a Device"', 'Your phone will open a QR scanner'],
              ['4', 'Scan the QR code', 'Point your camera at the QR code on the left'],
              ['5', 'Done!', 'Status turns green and OTPs are sent automatically'],
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

          <Card>
            <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 800, color: TC.g800 }}>OTP Flow</h3>
            <div style={{ fontSize: 12, color: TC.g500, lineHeight: 1.8 }}>
              <div>① User enters phone on registration</div>
              <div>② System sends 6-digit OTP via WhatsApp</div>
              <div>③ User enters the code to verify</div>
              <div>④ OTP expires after <strong>10 minutes</strong></div>
            </div>
          </Card>

          <Card style={{ background: connected ? C.greenL : C.yellowL, border: `1px solid ${connected ? C.green : '#d97706'}30` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: connected ? C.green : '#92400e', marginBottom: 6 }}>
              {connected ? '✅ System Status: Active' : '⚠️ System Status: Not Ready'}
            </div>
            <div style={{ fontSize: 12, color: connected ? '#065f46' : '#78350f', lineHeight: 1.6 }}>
              {connected
                ? 'New user registrations will receive OTP verification via WhatsApp.'
                : 'Scan the QR code to enable WhatsApp OTP verification for new registrations.'}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
