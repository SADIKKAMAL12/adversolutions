import { C } from "./theme";
import { Logo } from "./UI";

/* ════════════════════════════════════════════════
   USER NAV
════════════════════════════════════════════════ */
const USER_NAV = [
  { id:"dashboard",    label:"Dashboard",              icon:"⊞"  },
  { id:"ad-accounts",  label:"Ad Accounts",            icon:"◧"  },
  { id:"pre-verified", label:"Pre-Verified Accounts",  icon:"✓", badge:"HOT" },
  { id:"media-buyers", label:"Media Buyers",           icon:"👤" },
  { id:"projects",     label:"Projects",               icon:"📋" },
  { id:"balance",      label:"Balance",                icon:"◈"  },
  { id:"support",      label:"Support",                icon:"💬" },
];

/* ════════════════════════════════════════════════
   ADMIN NAV
════════════════════════════════════════════════ */
const ADMIN_NAV = [
  { id:"admin-dashboard",    label:"Dashboard",             icon:"⊞"           },
  { id:"admin-users",        label:"Users",                 icon:"👥"          },
  { id:"admin-ad-accounts",  label:"Ad Accounts",           icon:"◧"           },
  { id:"admin-inventory",    label:"Pre-Verified Accounts", icon:"✓"           },
  { id:"admin-media-buyers", label:"Media Buyers",          icon:"👤", badge:"NEW" },
  { id:"admin-orders",       label:"Orders",                icon:"⊡"           },
  { id:"admin-deposits",     label:"Deposits",              icon:"↓"           },
  { id:"admin-tickets",      label:"Support Tickets",       icon:"💬"          },
  { id:"admin-reports",      label:"Reports",               icon:"📊"          },
  { id:"admin-settings",     label:"System Settings",       icon:"⚙"           },
];

/* ════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════ */
export function Sidebar({ role, activePage, setActivePage, logout }) {
  const items = role === "admin" ? ADMIN_NAV : USER_NAV;

  return (
    <div style={{ width:224, minWidth:224, background:C.sidebar, height:"100%", display:"flex", flexDirection:"column", flexShrink:0 }}>
      {/* Brand */}
      <div style={{ padding:"20px 18px 16px", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <Logo size="sm" />
        {role === "admin" && (
          <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:5, background:"rgba(232,25,44,.15)", border:"1px solid rgba(232,25,44,.3)", borderRadius:20, padding:"3px 10px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.primary }} />
            <span style={{ fontSize:10, fontWeight:800, color:C.primary, letterSpacing:1 }}>SUPER ADMIN</span>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex:1, padding:"10px 8px", overflowY:"auto" }}>
        {items.map(item => {
          const active = activePage === item.id;
          return (
            <div key={item.id} onClick={()=>setActivePage(item.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, cursor:"pointer", margin:"1px 0", background:active?"rgba(232,25,44,.15)":"transparent", color:active?"#fff":"rgba(255,255,255,.5)", fontWeight:active?700:400, fontSize:13, transition:"all .15s", borderLeft:active?`3px solid ${C.primary}`:"3px solid transparent" }}>
              <span style={{ fontSize:15, width:18, textAlign:"center", flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.badge && <span style={{ background:C.primary, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:20 }}>{item.badge}</span>}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:"0 8px 12px" }}>
        <div style={{ background:"rgba(232,25,44,.1)", border:"1px solid rgba(232,25,44,.2)", borderRadius:12, padding:"14px 12px", marginBottom:8 }}>
          <div style={{ fontWeight:700, fontSize:12, color:"#fff", marginBottom:3 }}>Need help?</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:10 }}>Support team available 24/7</div>
          <button onClick={()=>setActivePage("support")} style={{ width:"100%", background:"rgba(255,255,255,.08)", color:"#fff", border:"1px solid rgba(255,255,255,.15)", borderRadius:8, padding:"7px 0", fontSize:12, cursor:"pointer", fontWeight:600 }}>Contact Support</button>
        </div>
        <button onClick={logout} style={{ width:"100%", background:"transparent", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"8px 0", fontSize:12, color:"rgba(255,255,255,.35)", cursor:"pointer", fontWeight:500 }}>← Logout</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TOP BAR
════════════════════════════════════════════════ */
export function TopBar({ role, user, balance }) {
  return (
    <div style={{ height:62, background:"#fff", borderBottom:`1px solid ${C.g200}`, display:"flex", alignItems:"center", padding:"0 26px", gap:16, flexShrink:0 }}>
      {/* Search */}
      <div style={{ flex:1, maxWidth:420 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, background:C.g50, border:`1px solid ${C.g200}`, borderRadius:10, padding:"9px 14px" }}>
          <span style={{ color:C.g400, fontSize:14 }}>🔍</span>
          <span style={{ color:C.g400, fontSize:13 }}>Search anything...</span>
          <span style={{ marginLeft:"auto", fontSize:11, color:C.g400, background:C.g100, padding:"2px 7px", borderRadius:5 }}>⌘K</span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        {/* Balance pill — only for users */}
        {role !== "admin" && (
          <div style={{ display:"flex", alignItems:"center", gap:9, background:"#fef2f3", border:"1px solid rgba(232,25,44,.2)", borderRadius:10, padding:"7px 16px" }}>
            <span style={{ fontSize:13, color:C.g500 }}>Balance</span>
            <span style={{ fontSize:15, fontWeight:900, color:C.primary }}>${balance.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
          </div>
        )}

        {/* Bell */}
        <div style={{ position:"relative", cursor:"pointer" }}>
          <div style={{ width:38, height:38, background:C.g100, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>🔔</div>
          <span style={{ position:"absolute", top:-2, right:-2, width:17, height:17, background:C.primary, borderRadius:"50%", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>3</span>
        </div>

        {/* User pill */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, background:`linear-gradient(135deg,${C.primary},#ff6b7a)`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>
            {user.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:C.g800 }}>{user.name}</div>
            <div style={{ fontSize:11, color:C.g400 }}>{user.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
