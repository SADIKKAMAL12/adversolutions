import express from 'express'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env into process.env (no external package needed)
try {
  const raw = readFileSync(join(__dirname, '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/)
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
} catch { /* .env is optional — env vars can be set via shell */ }
const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  next()
})

// Maps short /api/X routes → api/crud.js with injected table param
const CRUD_ROUTES = {
  '/api/users':               'users',
  '/api/transactions':        'transactions',
  '/api/orders':              'orders',
  '/api/deposits':            'deposits',
  '/api/payment-methods':     'payment_methods',
  '/api/business-types':      'business_types',
  '/api/support-tickets':     'support_tickets',
  '/api/inventory-products':  'inventory_products',
  '/api/inventory-lines':     'inventory_lines',
  '/api/purchases':           'purchases',
  '/api/announcements':       'announcements',
  '/api/ad-account-requests': 'ad_account_requests',
  '/api/platform-prices':     'platform_prices',
  '/api/settings':            'settings',
}

// Cache loaded handlers (ESM already caches, this is an extra safeguard)
const handlerCache = new Map()

async function loadHandler(filePath) {
  if (!handlerCache.has(filePath)) {
    const mod = await import(filePath)
    handlerCache.set(filePath, mod.default)
  }
  return handlerCache.get(filePath)
}

app.use('/api', async (req, res) => {
  // req.path is already stripped of /api prefix, e.g. /crud or /admin/stats
  const fullPath = '/api' + req.path
  let file, extraQuery = {}

  if (CRUD_ROUTES[fullPath]) {
    file = join(__dirname, 'api/crud.js')
    extraQuery = { table: CRUD_ROUTES[fullPath] }
  } else {
    // e.g. /api/admin/stats → api/admin/stats.js
    //      /api/otp        → api/otp.js
    file = join(__dirname, fullPath.replace(/^\//, '') + '.js')
  }

  let handler
  try {
    handler = await loadHandler(file)
  } catch {
    return res.status(404).json({ error: 'API route not found: ' + fullPath })
  }
  if (!handler) return res.status(404).json({ error: 'No handler exported from ' + fullPath })

  const fakeReq = {
    method:  req.method,
    url:     req.url,
    headers: req.headers,
    body:    req.body,
    query:   { ...req.query, ...extraQuery },
  }

  try {
    await handler(fakeReq, res)
  } catch (err) {
    console.error(`[api] ${req.method} ${fullPath}`, err.message)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
})

// Serve built React SPA
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(join(__dirname, 'dist/index.html')))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`✓ AdverSolutions running on :${PORT}`))
