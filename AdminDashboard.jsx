import { C } from "../shared/theme";
import { Card, Badge, PlatformIcon, Btn, PageShell } from "../shared/UI";

/* ═══════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════ */
export default function AdminDashboard({ mediaBuyers, setPage }) {
  const pendingBuyers = (mediaBuyers||[]).filter(m=>m.status==="pending").length;

  return (
    <PageShell title="Dashboard" subtitle="Welcome back, Super Admin! Here's what's happening on your platform.">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:22 }}>
        <div>
          {/* Top stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
            {[["👥","Total Users","1,248",C.blue],["◧","Ad Accounts","2,346",C.green],["✓","Verified Accounts","4,562",C.primary],["👤","Media Buyers","312",C.purple]].map(([ic,l,v,c])=>(
              <Card key={l}>
                <div style={{ width:38,height:38,background:c+"20",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:10 }}>{ic}</div>
                <div style={{ fontSize:12,color:C.g400 }}>{l}</div>
                <div style={{ fontSize:22,fontWeight:900,color:C.g800,margin:"4px 0" }}>{v}</div>
                <div style={{ fontSize:11,color:C.green }}>↑ 18.5% from last week</div>
              </Card>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
            {[["◈","Total Balance","$125,430.50",C.primary],["↓","Total Deposits","$86,245.30",C.blue],["🛒","Total Orders","3,987",C.green],["💬","Open Tickets","128",C.yellow]].map(([ic,l,v,c])=>(
              <Card key={l}>
                <div style={{ width:38,height:38,background:c+"20",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:10 }}>{ic}</div>
                <div style={{ fontSize:12,color:C.g400 }}>{l}</div>
                <div style={{ fontSize:18,fontWeight:900,color:C.g800,margin:"4px 0" }}>{v}</div>
                <div style={{ fontSize:11,color:C.green }}>↑ 20.4% from last week</div>
              </Card>
            ))}
          </div>

          {/* Pending media buyer alert */}
          {pendingBuyers > 0 && (
            <div onClick={()=>setPage("admin-media-buyers")}
              style={{ background:C.yellowL, border:`2px solid ${C.yellow}50`, borderRadius:13, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
              <div style={{ width:44,height:44,background:C.yellow+"30",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>⏳</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,fontSize:14,color:"#92400e" }}>{pendingBuyers} Media Buyer Application{pendingBuyers>1?"s":""} Pending Review</div>
                <div style={{ fontSize:13,color:"#a16207",marginTop:2 }}>Review and approve or reject media buyer applications to make them visible on the platform.</div>
              </div>
              <Btn variant="warning" size="sm">Review Now →</Btn>
            </div>
          )}

          {/* Charts row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
                <h3 style={{ margin:0,fontSize:14,fontWeight:800 }}>Overview Chart</h3>
                <select style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:7,padding:"3px 8px",fontSize:12,fontFamily:"inherit",outline:"none" }}><option>This Week</option></select>
              </div>
              <div style={{ height:130, display:"flex", alignItems:"flex-end", gap:5 }}>
                {[60,80,55,90,75,85,100].map((h,i)=>(
                  <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                    <div style={{ width:"100%",height:h*1.2,background:`${C.primary}18`,borderRadius:"4px 4px 0 0",position:"relative" }}>
                      <div style={{ width:"100%",height:"55%",background:C.primary+"70",borderRadius:"4px 4px 0 0",position:"absolute",bottom:0 }} />
                    </div>
                    <span style={{ fontSize:10,color:C.g300 }}>May {19+i}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:800 }}>Accounts by Platform</h3>
              <div style={{ display:"flex",gap:14,alignItems:"center" }}>
                <div style={{ position:"relative",width:90,height:90,flexShrink:0 }}>
                  <svg viewBox="0 0 100 100" style={{ transform:"rotate(-90deg)",width:90,height:90 }}>
                    {[{p:53.1,c:C.primary},{p:23.9,c:C.green},{p:15.2,c:C.blue},{p:7.8,c:C.yellow}].reduce((acc,seg)=>{
                      const dash=(seg.p/100)*251.2;
                      acc.els.push(<circle key={seg.c} cx="50" cy="50" r="40" fill="none" stroke={seg.c} strokeWidth="18" strokeDasharray={`${dash} ${251.2-dash}`} strokeDashoffset={-acc.offset*2.512} />);
                      acc.offset+=seg.p; return acc;
                    },{els:[],offset:0}).els}
                  </svg>
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ fontSize:13,fontWeight:900 }}>2,346</div>
                  </div>
                </div>
                <div style={{ flex:1 }}>
                  {[["Meta","1,245","53.1%",C.primary],["Google","562","23.9%",C.green],["TikTok","356","15.2%",C.blue],["Snapchat","183","7.8%",C.yellow]].map(([p,n,pct,c])=>(
                    <div key={p} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                      <div style={{ width:8,height:8,background:c,borderRadius:2 }} />
                      <span style={{ fontSize:12,color:C.g500,flex:1 }}>{p}</span>
                      <span style={{ fontSize:12,fontWeight:700 }}>{n}</span>
                      <span style={{ fontSize:11,color:C.g300 }}>({pct})</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Latest orders */}
          <Card>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}>
              <h3 style={{ margin:0,fontSize:14,fontWeight:800 }}>Latest Orders</h3>
              <Btn variant="ghost" size="sm" onClick={()=>setPage("admin-orders")}>View All →</Btn>
            </div>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
              <thead><tr style={{ borderBottom:`1px solid ${C.g200}`,background:C.g50 }}>
                {["Order ID","User","Type","Platform","Amount","Status","Date"].map(h=>(
                  <th key={h} style={{ padding:"9px 10px",textAlign:"left",color:C.g400,fontWeight:700,fontSize:12 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[["ORD-98765","john.doe@example.com","Ad Account","Meta",120,"completed"],["ORD-98764","william@example.com","Pre-Verified","Google",150,"completed"],["ORD-98763","emma@example.com","Ad Account","TikTok",100,"processing"],["ORD-98762","olivia@example.com","Ad Account","Snapchat",90,"pending"]].map(([id,u,t,p,a,s])=>(
                  <tr key={id} style={{ borderBottom:`1px solid ${C.g100}` }}>
                    <td style={{ padding:"10px",fontWeight:700,color:C.g700,fontSize:12 }}>{id}</td>
                    <td style={{ padding:"10px",color:C.g500,fontSize:12 }}>{u}</td>
                    <td style={{ padding:"10px",color:C.g500,fontSize:12 }}>{t}</td>
                    <td style={{ padding:"10px" }}><div style={{ display:"flex",alignItems:"center",gap:5,fontSize:12 }}><PlatformIcon name={p} size={14}/>{p}</div></td>
                    <td style={{ padding:"10px",fontWeight:700 }}>${a}.00</td>
                    <td style={{ padding:"10px" }}><Badge status={s} /></td>
                    <td style={{ padding:"10px",color:C.g400,fontSize:12 }}>May 25, 2024</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card>
            <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:800 }}>Platform Overview</h3>
            {[["Active Users",892,C.green],["Inactive Users",356,C.g300],["Banned Users",45,C.red],["Pending Users",78,C.yellow]].map(([l,v,c])=>(
              <div key={l} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:c }} />
                <span style={{ fontSize:12,color:C.g500,flex:1 }}>{l}</span>
                <span style={{ fontSize:12,fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
              <h3 style={{ margin:0,fontSize:14,fontWeight:800 }}>Recent Activity</h3>
              <span style={{ color:C.primary,fontSize:12,cursor:"pointer",fontWeight:700 }}>View All</span>
            </div>
            {[["👤","New user registered","2 min ago"],["💰","New deposit $500.00","8 min ago"],["◧","Ad account submitted","15 min ago"],["✓","Verified account purchased","22 min ago"]].map(([ic,t,d])=>(
              <div key={t} style={{ display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.g100}` }}>
                <div style={{ width:28,height:28,background:C.primaryLight,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>{ic}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:12,fontWeight:600,color:C.g700 }}>{t}</div></div>
                <div style={{ fontSize:11,color:C.g300,whiteSpace:"nowrap" }}>{d}</div>
              </div>
            ))}
          </Card>
          <Card>
            <h3 style={{ margin:"0 0 12px",fontSize:14,fontWeight:800 }}>System Info</h3>
            {[["Version","v2.4.1"],["DB Status","● Connected"],["Storage","68% (136.5 GB)"],["Backup","● Up to date"]].map(([k,v])=>(
              <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.g100}`,fontSize:12 }}>
                <span style={{ color:C.g400 }}>{k}</span><span style={{ color:C.g700,fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card style={{ background:C.primaryLight,border:`1px solid ${C.primary}20` }}>
            <h3 style={{ margin:"0 0 12px",fontSize:13,fontWeight:800,color:C.g700 }}>Quick Actions</h3>
            {[["+ Add New User","admin-users"],["+ Add Balance","admin-deposits"],["📢 Create Announcement","admin-settings"],["📋 View All Orders","admin-orders"]].map(([l,pg])=>(
              <button key={l} onClick={()=>setPage(pg)} style={{ width:"100%",background:"#fff",border:`1px solid ${C.g200}`,borderRadius:8,padding:"9px 12px",fontSize:12,cursor:"pointer",color:C.g700,textAlign:"left",marginBottom:7,fontWeight:700,fontFamily:"inherit" }}>{l}</button>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
