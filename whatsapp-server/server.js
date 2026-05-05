const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory OTP store: phone -> { otp, expires }
const otpStore = new Map();

let client = null;
let qrData = null;
let isReady = false;
let initError = null;

function cleanPhone(phone) {
  // Normalize phone to WhatsApp chat ID format
  // Remove all non-digits, then append @c.us
  return phone.replace(/\D/g, '') + '@c.us';
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function initClient() {
  console.log('[WA] Initializing WhatsApp client...');
  qrData = null;
  isReady = false;
  initError = null;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    },
  });

  client.on('qr', async (qr) => {
    console.log('[WA] QR code received — scan it on the admin panel');
    qrData = qr;
    isReady = false;
  });

  client.on('ready', () => {
    console.log('[WA] Client is ready!');
    isReady = true;
    qrData = null;
    initError = null;
  });

  client.on('auth_failure', (msg) => {
    console.error('[WA] Authentication failed:', msg);
    initError = msg;
    isReady = false;
  });

  client.on('disconnected', (reason) => {
    console.warn('[WA] Client disconnected:', reason);
    isReady = false;
    qrData = null;
    // Re-initialize after 5s
    setTimeout(initClient, 5000);
  });

  client.initialize().catch(err => {
    console.error('[WA] Init error:', err.message);
    initError = err.message;
    setTimeout(initClient, 10000);
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /status — connection status
app.get('/status', (req, res) => {
  res.json({
    connected: isReady,
    hasQR: !!qrData,
    error: initError || null,
  });
});

// GET /qr — get QR code as base64 image
app.get('/qr', async (req, res) => {
  if (isReady) {
    return res.json({ status: 'connected', message: 'WhatsApp is already connected' });
  }
  if (!qrData) {
    return res.json({ status: 'initializing', message: 'Generating QR code, please wait...' });
  }
  try {
    const qrImage = await qrcode.toDataURL(qrData);
    res.json({ status: 'qr', qr: qrImage });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR: ' + err.message });
  }
});

// POST /send-otp — generate and send OTP to phone
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!isReady) {
    return res.status(503).json({
      error: 'WhatsApp is not connected. Admin needs to scan the QR code first.',
    });
  }

  const otp = generateOTP();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(phone.trim(), { otp, expires });

  try {
    const chatId = cleanPhone(phone);
    const message =
      `🔐 *AdverSolutions Verification*\n\n` +
      `Your one-time verification code is:\n\n` +
      `*${otp}*\n\n` +
      `This code expires in *10 minutes*.\n` +
      `Do not share this code with anyone.`;

    await client.sendMessage(chatId, message);
    console.log(`[OTP] Sent OTP to ${phone}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    otpStore.delete(phone.trim());
    console.error('[OTP] Send failed:', err.message);
    res.status(500).json({ error: 'Failed to send OTP: ' + err.message });
  }
});

// POST /verify-otp — verify OTP entered by user
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const stored = otpStore.get(phone.trim());

  if (!stored) {
    return res.status(400).json({ error: 'No OTP found for this number. Please request a new code.' });
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(phone.trim());
    return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
  }

  if (stored.otp !== otp.toString().trim()) {
    return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
  }

  otpStore.delete(phone.trim());
  console.log(`[OTP] Verified for ${phone}`);
  res.json({ success: true, verified: true });
});

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 WhatsApp OTP server running on http://localhost:${PORT}`);
  console.log('   GET  /status       — connection status');
  console.log('   GET  /qr           — get QR code');
  console.log('   POST /send-otp     — send OTP to phone');
  console.log('   POST /verify-otp   — verify OTP\n');
  initClient();
});
