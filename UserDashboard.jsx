import { C } from "../shared/theme";
import { Card, StatCard, Badge, PlatformIcon, Btn, PageShell } from "../shared/UI";

/* ═══════════════════════════════════════════════════
   USER DASHBOARD
═══════════════════════════════════════════════════ */
export default function UserDashboard({ balance, setPage }) {
  const recentOrders = [
    { id:"#ORD-250519", platform:"Meta",     type:"New Ad Account",       amount:120, status:"completed",  date:"May 19, 2024" },
    { id:"#ORD-250518", platform:"Google",   type:"New Ad Account",       amount:150, status:"processing", date:"May 18, 2024" },
    { id:"#ORD-250517", platform:"TikTok",   type:"Pre-Verified Account", amount: 95, status:"pending",    date:"May 17, 2024" },
    { id:"#ORD-250515", platform:"Snapchat", type:"New Ad Account",       amount: 90, status:"completed",  date:"May 15, 2024" },
  ];

  const announcements = [
    { icon:"📢", title:"New: TikTok Ads Accounts",  body:"TikTok accounts are now available!",                  date:"May 20, 2024" },
    { icon:"🛡️", title:"System Update",              body:"Updated security measures for better protection.",    date:"May 18, 2024" },
    { icon:"🎁", title:"Special Offer",              body:"Get 10% bonus on your next top up over $500!",        date:"May 15, 2024" },
  ];

  return (
    <PageShell title="Welcome back, John! 👋" subtitle="Here's what's happening with your account today.">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:22 }}>

        {/* ── Main column ── */}
        <div>
          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
            <StatCard icon="◈" label="Current Balance"  value={`$${balance.toFixed(2)}`} sub="12.5% from last week"  color={C.primary} />
            <StatCard icon="📊" label="Total Spend"      value="$5,430.60"               sub="18.3% from last week"  color={C.blue}    />
            <StatCard icon="🖥" label="Total Accounts"   value="12"                      sub="2 new this week"       color={C.green}   />
            <StatCard icon="⏱" label="Pending Orders"   value="3"                                                    color={C.yellow}  />
          </div>

          {/* Quick Actions */}
          <Card style={{ marginBottom:22 }}>
            <h3 style={{ margin:"0 0 18px", fontSize:15, fontWeight:800, color:C.g800 }}>Quick Actions</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[
                [C.primary,  "➕", "Create Ad Account",      "Request new ad account",  "ad-accounts"  ],
                [C.green,    "◈",  "Top Up Balance",          "Add funds to account",    "balance"       ],
                [C.blue,     "🛒", "Buy Verified Account",    "Browse accounts",         "pre-verified"  ],
                [C.yellow,   "👤", "Hire Media Buyer",        "Find expert media buyers","media-buyers"  ],
              ].map(([col,ic,l,s,pg])=>(
                <div key={l} onClick={()=>setPage(pg)}
                  style={{ background:C.g50, border:`1px solid ${C.g200}`, borderRadius:13, padding:"16px 12px", cursor:"pointer", textAlign:"center", transition:"all .15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=col; e.currentTarget.style.background=col+"0d"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.g200; e.currentTarget.style.background=C.g50; }}>
                  <div style={{ width:46, height:46, background:col+"20", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 10px" }}>{ic}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.g700, marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:11, color:C.g400 }}>{s}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:C.g800 }}>Recent Orders</h3>
              <Btn variant="ghost" size="sm" onClick={()=>setPage("ad-accounts")}>View all →</Btn>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${C.g200}` }}>
                  {["Order ID","Platform","Type","Amount","Status","Date"].map(h=>(
                    <th key={h} style={{ padding:"8px 10px", textAlign:"left", color:C.g400, fontWeight:700, fontSize:12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(row=>(
                  <tr key={row.id} style={{ borderBottom:`1px solid ${C.g100}` }}>
                    <td style={{ padding:"12px 10px", fontWeight:700, color:C.g700 }}>{row.id}</td>
                    <td style={{ padding:"12px 10px" }}><div style={{ display:"flex", alignItems:"center", gap:6 }}><PlatformIcon name={row.platform} />{row.platform}</div></td>
                    <td style={{ padding:"12px 10px", color:C.g500 }}>{row.type}</td>
                    <td style={{ padding:"12px 10px", fontWeight:700 }}>${row.amount}.00</td>
                    <td style={{ padding:"12px 10px" }}><Badge status={row.status} /></td>
                    <td style={{ padding:"12px 10px", color:C.g400 }}>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Announcements */}
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:C.g800 }}>Announcements</h3>
              <span style={{ color:C.primary, fontSize:12, cursor:"pointer", fontWeight:700 }}>View all</span>
            </div>
            {announcements.map((a,i)=>(
              <div key={i} style={{ display:"flex", gap:11, padding:"11px 0", borderBottom:i<announcements.length-1?`1px solid ${C.g100}`:"none" }}>
                <div style={{ width:36, height:36, background:C.primaryLight, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.g800, marginBottom:2 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:C.g500, marginBottom:3 }}>{a.body}</div>
                  <div style={{ fontSize:11, color:C.g300 }}>{a.date}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* Balance overview */}
          <Card>
            <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:800, color:C.g800 }}>Balance Overview</h3>
            <div style={{ fontSize:12, color:C.g400, marginBottom:4 }}>Current Balance</div>
            <div style={{ fontSize:30, fontWeight:900, color:C.primary, marginBottom:16 }}>${balance.toFixed(2)}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
              <div><div style={{ fontSize:12, color:C.g400 }}>Pending</div><div style={{ fontSize:17, fontWeight:800, color:C.yellow }}>$320.00</div></div>
              <div><div style={{ fontSize:12, color:C.g400 }}>Total Deposits</div><div style={{ fontSize:17, fontWeight:800, color:C.green }}>$2,850.00</div></div>
            </div>
            <Btn full onClick={()=>setPage("balance")}>◈ Top Up Balance</Btn>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
