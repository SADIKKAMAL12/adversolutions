import { usePath, useNavigate } from './Router.jsx'
import { C, getThemeColors } from './theme.js'
import { Logo } from './UI.jsx'
import { useTheme } from './ThemeContext.jsx'
import { useStore, useHydrated, setStore, getSession } from './store.js'
import { useState, useRef, useEffect } from 'react'
import { fetchAdAccountRequests, fetchOrders } from '../lib/db.js'
import i18n from '../landing/i18n.js'
import { useTranslation } from 'react-i18next'

// ─── Cross-tab notification sound system ────────────────────────────────────
const notificationSound = new Audio('/notification.mp3');
notificationSound.preload = 'auto';

// BroadcastChannel syncs notifications across all open tabs
const BC = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('adv_notifs') : null;

let hasUserInteracted = false;
let pendingSound = false;
let isPageVisible = !document.hidden;

function playSound() {
  notificationSound.currentTime = 0;
  notificationSound.volume = 1;
  notificationSound.play().catch(() => {});
}

function markInteracted() {
  hasUserInteracted = true;
  if (pendingSound) {
    pendingSound = false;
    playSound();
  }
}

// Queue sound if tab is hidden or user hasn't interacted yet
function queueOrPlaySound() {
  if (!hasUserInteracted) {
    pendingSound = true;
    return;
  }
  if (!isPageVisible) {
    pendingSound = true;
    // Ask other tabs to play the sound
    if (BC) BC.postMessage({ type: 'PLAY_SOUND' });
    return;
  }
  playSound();
}

// Track page visibility (hidden / visible tab)
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
  if (isPageVisible && pendingSound && hasUserInteracted) {
    pendingSound = false;
    playSound();
  }
});

// Listen for first user interaction (required by browser autoplay policy)
['click', 'keydown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, markInteracted, { once: true });
});

// If another tab receives a notification, play sound here if this tab is active
if (BC) {
  BC.onmessage = (e) => {
    if (e.data?.type === 'PLAY_SOUND' && isPageVisible && hasUserInteracted) {
      playSound();
    }
  };
}

// Request browser notification permission (for popup when in another tab)
function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

const USER_NAV = [
  { path: "/dashboard",             label: "Dashboard",              icon: "⊞"  },
  { path: "/agency-ad-accounts",    label: "Agency Ad Accounts",     icon: "◧"  },
  { path: "/preverified-accounts",  label: "Pre-Verified Accounts",  icon: "✓", badge: "HOT" },
  { path: "/purchase-history",      label: "Purchase History",       icon: "🧾" },
  { path: "/balance",               label: "Balance",                icon: "◈"  },
  { path: "/support",               label: "Support",                icon: "💬" },
];

const ADMIN_NAV = [
  { path: "/admin",                 label: "Dashboard",             icon: "⊞"           },
  { path: "/admin/users",           label: "Users",                 icon: "👥"          },
  { path: "/admin/inventory",       label: "Pre-Verified Accounts", icon: "✓"           },
  { path: "/admin/agency-accounts", label: "Agency Ad Accounts",    icon: "◧"           },
  { path: "/admin/orders",          label: "Orders",                icon: "⊡"           },
  { path: "/admin/deposits",        label: "Deposits",              icon: "↓"           },
  { path: "/admin/tickets",         label: "Support Tickets",       icon: "💬"          },
  { path: "/admin/reports",         label: "Reports",               icon: "📊"          },
  { path: "/admin/settings",        label: "System Settings",       icon: "⚙"           },
  { path: "/admin/topups",          label: "Ad Account Top-ups",    icon: "💸"          },
  { path: "/admin/whatsapp",        label: "WhatsApp OTP",          icon: "📱"          },
];

const USER_NAV_KEYS = {
  "/dashboard": "ui.nav.dashboard",
  "/agency-ad-accounts": "ui.nav.agencyAdAccounts",
  "/preverified-accounts": "ui.nav.preVerifiedAccounts",
  "/purchase-history": "ui.nav.purchaseHistory",
  "/balance": "ui.nav.balance",
  "/support": "ui.nav.support",
};

export function Sidebar({ role, logout }) {
  const currentPath = usePath();
  const navigate = useNavigate();
  const [store] = useStore();
  const { t } = useTranslation();
  const items = role === "admin" ? ADMIN_NAV : USER_NAV;

  const pendingTopups = (store.orders || []).filter(o => o.type === 'Ad Account Top-up' && o.status === 'pending').length;
  const pendingDeposits = (store.deposits || []).filter(d => d.status === 'pending').length;

  const navBadge = (path) => {
    if (path === '/admin/topups' && pendingTopups > 0) return pendingTopups;
    if (path === '/admin/deposits' && pendingDeposits > 0) return pendingDeposits;
    return null;
  };

  const getLabel = (item) => {
    if (role !== "admin" && USER_NAV_KEYS[item.path]) return t(USER_NAV_KEYS[item.path]);
    return item.label;
  };

  return (
    <div style={{ width: 224, minWidth: 224, background: C.sidebar, height: "100%", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <Logo size="sm" />
        {role === "admin" && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(232,25,44,.15)", border: "1px solid rgba(232,25,44,.3)", borderRadius: 20, padding: "3px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: C.primary, letterSpacing: 1 }}>SUPER ADMIN</span>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {items.map(item => {
          const active = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
          return (
            <div key={item.path} onClick={() => navigate(item.path)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", margin: "1px 0", background: active ? "rgba(232,25,44,.15)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,.5)", fontWeight: active ? 700 : 400, fontSize: 13, transition: "all .15s", borderLeft: active ? `3px solid ${C.primary}` : "3px solid transparent" }}>
              <span style={{ fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{getLabel(item)}</span>
              {item.badge && <span style={{ background: C.primary, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>{item.badge}</span>}
              {navBadge(item.path) && <span style={{ background: C.yellow, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, minWidth: 16, textAlign: 'center' }}>{navBadge(item.path)}</span>}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: "0 8px 12px" }}>
        <div style={{ background: "rgba(232,25,44,.1)", border: "1px solid rgba(232,25,44,.2)", borderRadius: 12, padding: "14px 12px", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#fff", marginBottom: 3 }}>{t('ui.nav.needHelp')}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>{t('ui.nav.supportAvailable')}</div>
          <button onClick={() => navigate("/support")} style={{ width: "100%", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "7px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{t('ui.nav.contactSupport')}</button>
        </div>
        <button onClick={logout} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 0", fontSize: 12, color: "rgba(255,255,255,.35)", cursor: "pointer", fontWeight: 500 }}>{t('ui.nav.logout')}</button>
      </div>
    </div>
  );
}

const NOTIF_SEEN_KEY = 'adv_notif_seen';

function NotificationBell({ balance, TC }) {
  const [store] = useStore();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [];
  if ((balance || 0) < 20 && (balance !== undefined)) {
    notifications.push({ id: 'low-balance', icon: '💰', title: 'Low Balance', body: `Your balance is $${(balance || 0).toFixed(2)}. Top up to continue.`, color: C.red });
  }
  (store.adAccountRequests || []).filter(r => r.status === 'approved' || r.status === 'rejected').forEach(r => {
    notifications.push({
      id: `req-${r.id}`,
      icon: r.status === 'approved' ? '✅' : '❌',
      title: `Agency Account ${r.status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: `Your${r.platform ? ' ' + r.platform : ''} account request has been ${r.status}.`,
      color: r.status === 'approved' ? C.green : C.red,
    });
  });
  (store.orders || []).filter(o => o.type === 'Ad Account Top-up' && o.status === 'completed').forEach(o => {
    let accountName = o.item;
    try { accountName = JSON.parse(o.item).accountName || o.item; } catch {}
    notifications.push({
      id: `topup-${o.id}`,
      icon: '💸',
      title: 'Top-up Processed',
      body: `Your top-up of $${parseFloat(o.amount || 0).toFixed(2)} for "${accountName}" has been processed.`,
      color: C.green,
    });
  });

  const notifKey = notifications.map(n => n.id).sort().join(',');

  useEffect(() => {
    if (!hydrated) return;
    const stored = localStorage.getItem(NOTIF_SEEN_KEY);
    const seenIds = new Set((stored || '').split(',').filter(Boolean));
    const newNotifs = notifications.filter(n => !seenIds.has(n.id));
    if (newNotifs.length > 0) {
      queueOrPlaySound();
      if (!isPageVisible && 'Notification' in window && Notification.permission === 'granted') {
        const n = newNotifs[0];
        new Notification('AdverSolutions', {
          body: n.title + (n.body ? ' — ' + n.body : ''),
          icon: '/favicon.ico',
          tag: n.id,
        });
      }
    }
    localStorage.setItem(NOTIF_SEEN_KEY, notifKey);
  }, [hydrated, notifKey]);

  // ─── Poll for new notifications every 10 seconds ───────────────────────────
  useEffect(() => {
    if (!hydrated) return;
    const session = getSession();
    const userId = session?.user?.id || null;
    const isAdmin = session?.user?.role === 'admin';
    const pollUserId = isAdmin ? null : userId;

    const poll = async () => {
      try {
        const [freshRequests, freshOrders] = await Promise.all([
          fetchAdAccountRequests(pollUserId),
          fetchOrders(pollUserId),
        ]);
        setStore(s => {
          const changed =
            JSON.stringify(s.adAccountRequests) !== JSON.stringify(freshRequests) ||
            JSON.stringify(s.orders) !== JSON.stringify(freshOrders);
          return changed ? { ...s, adAccountRequests: freshRequests || [], orders: freshOrders || [] } : s;
        });
      } catch (e) {
        // Silently fail on poll errors (network offline, etc.)
      }
    };

    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [hydrated]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => { setOpen(o => !o); requestNotifPermission(); }} style={{ width: 38, height: 38, background: TC.g100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, cursor: 'pointer' }}>
        🔔
        {notifications.length > 0 && (
          <span style={{ position: 'absolute', top: -2, right: -2, minWidth: 17, height: 17, background: C.primary, borderRadius: '50%', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, padding: '0 4px' }}>
            {notifications.length}
          </span>
        )}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 46, right: 0, width: 320, background: TC.card, borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.15)', border: `1px solid ${TC.g200}`, zIndex: 999, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${TC.g200}`, fontWeight: 800, fontSize: 13, color: TC.g800 }}>
            Notifications {notifications.length > 0 && <span style={{ background: C.primary, color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 20, marginLeft: 6 }}>{notifications.length}</span>}
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: TC.g400, fontSize: 13 }}>You're all caught up ✓</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{ padding: '13px 16px', borderBottom: `1px solid ${TC.g100}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: n.color, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: TC.g500, lineHeight: 1.5 }}>{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
];

export function TopBar({ role, user, balance }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const TC = getThemeColors(isDark);
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language || localStorage.getItem('adv_lang') || 'en');

  const switchLang = (code) => {
    setLang(code);
    i18n.changeLanguage(code);
  };

  const langSwitcher = (
    <div style={{ display: 'flex', gap: 2, background: TC.g100, borderRadius: 8, padding: 2 }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={() => switchLang(l.code)}
          style={{ padding: '4px 9px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: lang === l.code ? 800 : 500, background: lang === l.code ? TC.card : 'transparent', color: lang === l.code ? TC.g800 : TC.g400, fontFamily: 'inherit', transition: 'all .15s' }}>
          {l.label}
        </button>
      ))}
    </div>
  );

  const themeBtn = (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light' : 'Switch to dark'}
      style={{ width: 38, height: 38, borderRadius: 10, border: `1px solid ${TC.g200}`, background: TC.g50, color: TC.g600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );

  const avatar = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${C.primary},#ff6b7a)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
        {user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2) || '?'}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: TC.g800 }}>{user?.name || "User"}</div>
        <div style={{ fontSize: 11, color: TC.g400 }}>{user?.email || ""}</div>
      </div>
    </div>
  );

  if (role === "admin") {
    return (
      <div style={{ height: 62, background: TC.topbar, borderBottom: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 26px", gap: 14, flexShrink: 0 }}>
        {langSwitcher}
        {themeBtn}
        {avatar}
      </div>
    );
  }

  return (
    <div style={{ height: 62, background: TC.topbar, borderBottom: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 26px", gap: 14, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, background: isDark ? 'rgba(255,51,68,.15)' : '#fef2f3', border: "1px solid rgba(232,25,44,.2)", borderRadius: 10, padding: "7px 16px" }}>
        <span style={{ fontSize: 13, color: TC.g500 }}>{t('ui.topbar.balance')}</span>
        <span style={{ fontSize: 15, fontWeight: 900, color: C.primary }}>${(balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
      </div>
      {langSwitcher}
      {themeBtn}
      <NotificationBell balance={balance} TC={TC} />
      {avatar}
    </div>
  );
}
