import { C, getThemeColors, PLATFORMS } from '../shared/theme.js'
import { useState } from 'react'
import { useTheme } from '../shared/ThemeContext.jsx'
import { PageShell, Card, Btn, Badge, DataTable, PlatformIcon } from '../shared/UI.jsx'
import { updateOrder, updateAdAccountRequest } from '../lib/db.js'

function parseItem(item) {
  try { return JSON.parse(item) } catch { return { accountName: item || '—', adAccountId: null, topupAmount: 0 } }
}

export default function AdminAdAccountTopupsPage({ orders, adAccountRequests, setStore }) {
  const { theme } = useTheme()
  const TC = getThemeColors(theme === 'dark')
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState(null)
  const [error, setError] = useState('')

  const topupOrders = (orders || []).filter(o => o.type === 'Ad Account Top-up')
  const filtered = filter === 'all' ? topupOrders : topupOrders.filter(o => o.status === filter)

  const markDone = async (order) => {
    setProcessing(order.id)
    setError('')
    try {
      await updateOrder(order.id, { status: 'completed' })

      const { adAccountId, topupAmount } = parseItem(order.item)
      if (adAccountId) {
        const acct = (adAccountRequests || []).find(r => r.id === adAccountId)
        const currentAmt = parseFloat(acct?.amount) || 0
        await updateAdAccountRequest(adAccountId, { amount: currentAmt + (parseFloat(topupAmount) || 0) })
      }

      setStore(s => ({
        ...s,
        orders: s.orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o),
        adAccountRequests: s.adAccountRequests.map(r => {
          const { adAccountId: aid, topupAmount: ta } = parseItem(order.item)
          return r.id === aid ? { ...r, amount: (parseFloat(r.amount) || 0) + (parseFloat(ta) || 0) } : r
        }),
      }))
    } catch (err) {
      setError('Failed to update: ' + err.message)
    } finally {
      setProcessing(null)
    }
  }

  const pending = topupOrders.filter(o => o.status === 'pending').length
  const done = topupOrders.filter(o => o.status === 'completed').length

  const cols = [
    { label: 'User', render: r => (
      <div style={{ fontWeight: 700, color: TC.g800, fontSize: 13 }}>{r.user_email || r.user || '—'}</div>
    )},
    { label: 'Ad Account', render: r => {
      const { accountName } = parseItem(r.item)
      const platform = PLATFORMS.find(p => p.id === r.platform)
      return (
        <div>
          <div style={{ fontWeight: 700, color: TC.g700 }}>{accountName || '—'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <PlatformIcon name={platform?.icon || r.platform} size={12} />
            <span style={{ fontSize: 11, color: TC.g400 }}>{platform?.name || r.platform}</span>
          </div>
        </div>
      )
    }},
    { label: 'Top-up / Total', render: r => {
      const { topupAmount } = parseItem(r.item)
      return (
        <div>
          <div style={{ fontWeight: 800, color: C.green }}>+${parseFloat(topupAmount || 0).toFixed(2)}</div>
          <div style={{ fontSize: 11, color: TC.g400 }}>Paid: ${parseFloat(r.amount || 0).toFixed(2)}</div>
        </div>
      )
    }},
    { label: 'Date', render: r => <span style={{ fontSize: 12, color: TC.g500 }}>{r.date}</span> },
    { label: 'Status', render: r => <Badge status={r.status} /> },
    { label: 'Action', render: r => r.status === 'pending' ? (
      <Btn size="sm" onClick={() => markDone(r)} disabled={processing === r.id}
        style={{ background: C.green, color: '#fff', fontSize: 12, minWidth: 100 }}>
        {processing === r.id ? 'Processing…' : '✓ Mark Done'}
      </Btn>
    ) : (
      <span style={{ fontSize: 12, color: TC.g400, fontStyle: 'italic' }}>Processed</span>
    )},
  ]

  return (
    <PageShell title="Ad Account Top-ups" subtitle="Review and process top-up requests submitted by users.">
      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: '#991b1b' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        {[['Total Requests', topupOrders.length, C.blue], ['Pending', pending, C.yellow], ['Processed', done, C.green]].map(([l, v, c]) => (
          <Card key={l}>
            <div style={{ fontSize: 12, color: TC.g400, marginBottom: 6 }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[['all', 'All'], ['pending', 'Pending'], ['completed', 'Done']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ padding: '7px 16px', borderRadius: 9, border: `1px solid ${filter === v ? C.primary : TC.g200}`, background: filter === v ? C.primaryLight : TC.card, color: filter === v ? C.primary : TC.g500, fontSize: 12, fontWeight: filter === v ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
              {l}{v === 'pending' && pending > 0 ? ` (${pending})` : ''}
            </button>
          ))}
        </div>
        <DataTable cols={cols} rows={filtered} emptyMsg="No top-up requests found." />
      </Card>
    </PageShell>
  )
}
