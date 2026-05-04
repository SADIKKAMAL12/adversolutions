import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Load .env vars into process.env (Vite only exposes VITE_* to the browser)
function loadEnvIntoProcess() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (!m) continue
      const [, key, val] = m
      if (!process.env[key])
        process.env[key] = val.replace(/^['"]|['"]$/g, '').replace(/\r$/, '').trim()
    }
  } catch { /* .env is optional */ }
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL)
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
}

// Mirrors vercel.json rewrites: which URL paths map to which handler file + table
const CRUD_MAP = {
  '/api/users':               'users',
  '/api/transactions':        'transactions',
  '/api/orders':              'orders',
  '/api/deposits':            'deposits',
  '/api/media-buyers':        'media_buyers',
  '/api/payment-methods':     'payment_methods',
  '/api/business-types':      'business_types',
  '/api/support-tickets':     'support_tickets',
  '/api/inventory-products':  'inventory_products',
  '/api/inventory-lines':     'inventory_lines',
  '/api/purchases':           'purchases',
  '/api/projects':            'projects',
  '/api/announcements':       'announcements',
  '/api/ad-account-requests': 'ad_account_requests',
  '/api/settings':            'settings',
}

function resolveRoute(pathname) {
  if (CRUD_MAP[pathname]) return { file: 'api/crud.js', table: CRUD_MAP[pathname] }
  // Direct file: /api/admin/stats → api/admin/stats.js
  return { file: pathname.replace(/^\//, '') + '.js', table: null }
}

function localApiPlugin() {
  loadEnvIntoProcess()

  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const { file, table } = resolveRoute(url.pathname)

        // ssrLoadModule loads for Node.js context — does NOT pollute browser module graph
        let handler
        try {
          const mod = await server.ssrLoadModule('/' + file)
          handler = mod.default
        } catch {
          return next()
        }
        if (!handler) return next()

        // Parse JSON body for mutation requests
        let body = {}
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          await new Promise(resolve => {
            let raw = ''
            req.on('data', chunk => { raw += chunk })
            req.on('end', () => {
              try { body = JSON.parse(raw) } catch { body = {} }
              resolve()
            })
          })
        }

        // Build query: merge URL params + injected table for crud routes
        const query = {}
        url.searchParams.forEach((v, k) => { query[k] = v })
        if (table) query.table = table

        let statusCode = 200
        const fakeRes = {
          status(code) { statusCode = code; return fakeRes },
          json(data) {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
          },
        }

        try {
          await handler(
            { method: req.method, url: req.url, headers: req.headers, body, query },
            fakeRes,
          )
        } catch (err) {
          console.error(`[api] ${req.method} ${url.pathname} →`, err.message)
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 8765,
  },
})
