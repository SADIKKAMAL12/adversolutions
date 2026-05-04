import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { pathToFileURL } from 'url'
import fs from 'fs'

// Load .env vars into process.env (Vite only exposes VITE_* to the browser,
// not to Node.js process.env, so the serverless handlers can't see them otherwise)
function loadEnvIntoProcess() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
      if (!m) continue
      const [, key, val] = m
      if (!process.env[key]) {
        process.env[key] = val.replace(/^['"]|['"]$/g, '').trim()
      }
    }
  } catch { /* .env is optional */ }
}

// Serves api/**/*.js handlers locally, mimicking Vercel's serverless routing
function localApiPlugin() {
  loadEnvIntoProcess()

  // admin-supabase.js reads SUPABASE_URL; alias from VITE_SUPABASE_URL if absent
  if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL
  }

  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const handlerPath = path.join(process.cwd(), url.pathname + '.js')

        let handler
        try {
          const mod = await import(pathToFileURL(handlerPath).href)
          handler = mod.default
        } catch {
          return next()
        }
        if (!handler) return next()

        // Parse JSON body
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

        // Parse query string
        const query = {}
        url.searchParams.forEach((v, k) => { query[k] = v })

        // Vercel-compatible res adapter
        let statusCode = 200
        const fakeRes = {
          status(code) { statusCode = code; return fakeRes },
          json(data) {
            res.writeHead(statusCode, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
          },
        }

        try {
          await handler({ method: req.method, url: req.url, headers: req.headers, body, query }, fakeRes)
        } catch (err) {
          console.error(`[api] ${req.method} ${url.pathname} →`, err.message)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: err.message }))
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
