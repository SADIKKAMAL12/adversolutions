# Deploy WhatsApp Server

## Render.com (Recommended Free Option)

1. Push your project to GitHub (if not already)
2. Go to https://dashboard.render.com/blueprints
3. Click **New Blueprint Instance**
4. Connect your GitHub repo
5. Render will detect `render.yaml` in the `whatsapp-server/` folder
6. Deploy — it will install Chromium automatically
7. Once live, copy the service URL (e.g. `https://adversolutions-whatsapp.onrender.com`)
8. Go to your **Vercel project → Settings → Environment Variables**
9. Add: `WHATSAPP_SERVER_URL=https://adversolutions-whatsapp.onrender.com`
10. Redeploy Vercel: `npx vercel --prod`

> ⚠️ **Free tier limitation**: Render free services spin down after 15 min of inactivity. First request may take 30-60s to wake up. The QR scan may need to be redone after deploys.

## Alternative: VPS / Dedicated Server

If you have a VPS (DigitalOcean, Linode, AWS, etc.):

```bash
# On your VPS
git clone <your-repo>
cd <repo>/whatsapp-server
npm install
npm start
```

Then set `WHATSAPP_SERVER_URL=http://YOUR_VPS_IP:3001` in Vercel env vars.

> Make sure port 3001 is open in your firewall.

## Alternative: Run Locally with ngrok (Testing Only)

```bash
# Terminal 1 — start WhatsApp server
cd whatsapp-server
npm install
npm start

# Terminal 2 — expose to internet
npx ngrok http 3001
```

Copy the ngrok HTTPS URL into Vercel's `WHATSAPP_SERVER_URL` env var. **Not for production** — URL changes every restart.
