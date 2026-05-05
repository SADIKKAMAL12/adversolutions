import { usePath, useNavigate } from './Router.jsx'
import { C, getThemeColors } from './theme.js'
import { Logo } from './UI.jsx'
import { useTheme } from './ThemeContext.jsx'

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
];

export function Sidebar({ role, logout }) {
  const currentPath = usePath();
  const navigate = useNavigate();
  const items = role === "admin" ? ADMIN_NAV : USER_NAV;

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
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: C.primary, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20 }}>{item.badge}</span>}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: "0 8px 12px" }}>
        <div style={{ background: "rgba(232,25,44,.1)", border: "1px solid rgba(232,25,44,.2)", borderRadius: 12, padding: "14px 12px", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#fff", marginBottom: 3 }}>Need help?</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>Support team available 24/7</div>
          <button onClick={() => navigate("/support")} style={{ width: "100%", background: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.15)", borderRadius: 8, padding: "7px 0", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Contact Support</button>
        </div>
        <button onClick={logout} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 0", fontSize: 12, color: "rgba(255,255,255,.35)", cursor: "pointer", fontWeight: 500 }}>← Logout</button>
      </div>
    </div>
  );
}

export function TopBar({ role, user, balance }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const TC = getThemeColors(isDark);

  // Admin top bar — NO search, theme toggle + profile only
  if (role === "admin") {
    return (
      <div style={{ height: 62, background: TC.topbar, borderBottom: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 26px", gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light' : 'Switch to dark'}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: `1px solid ${TC.g200}`,
              background: TC.g50,
              color: TC.g600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Notifications */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, background: TC.g100, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🔔</div>
            <span style={{ position: "absolute", top: -2, right: -2, width: 17, height: 17, background: C.primary, borderRadius: "50%", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>3</span>
          </div>

          {/* Profile: Avatar + Name + Email */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${C.primary},#ff6b7a)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
              {user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2) || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: TC.g800 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: TC.g400 }}>{user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER top bar — profile + balance + theme toggle, NO search
  return (
    <div style={{
      height: 62,
      background: TC.topbar,
      borderBottom: `1px solid ${TC.g200}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 26px",
      gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Balance */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: isDark ? 'rgba(255,51,68,.15)' : '#fef2f3',
          border: "1px solid rgba(232,25,44,.2)",
          borderRadius: 10,
          padding: "7px 16px",
        }}>
          <span style={{ fontSize: 13, color: TC.g500 }}>Balance</span>
          <span style={{ fontSize: 15, fontWeight: 900, color: C.primary }}>
            ${(balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light' : 'Switch to dark'}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: `1px solid ${TC.g200}`,
            background: TC.g50,
            color: TC.g600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Profile: Avatar + Name + Email */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg,${C.primary},#ff6b7a)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2) || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: TC.g800 }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 11, color: TC.g400 }}>{user?.email || ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
