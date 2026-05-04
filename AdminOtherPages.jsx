import { useState } from "react";
import { C } from "../shared/theme";
import { Card, Badge, Btn, Input, Select, Avatar, DataTable, Pagination, Modal, PageShell } from "../shared/UI";
import { MOCK_INVENTORY, MOCK_USERS, MOCK_ORDERS, MOCK_DEPOSITS } from "../shared/mockData";

/* ═══════════════════════════════════════════════════
   ADMIN INVENTORY PAGE
═══════════════════════════════════════════════════ */
function AddAccountForm({ onCancel }) {
  return (
    <PageShell breadcrumb="Dashboard › Pre-Verified Accounts › Add New Account" title="Add New Account"
      actions={[<Btn key="c" variant="outline" onClick={onCancel}>✕ Cancel</Btn>, <Btn key="s">💾 Save Account</Btn>]}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
        <Card>
          <h3 style={{ margin:"0 0 18px",fontSize:15,fontWeight:800 }}>Product Information</h3>
          <div style={{ border:`2px dashed ${C.g200}`,borderRadius:12,padding:32,textAlign:"center",marginBottom:16,cursor:"pointer",background:C.g50 }}>
            <div style={{ fontSize:32,color:C.primary,marginBottom:8 }}>↑</div>
            <div style={{ fontWeight:700,color:C.g500 }}>Click to upload product logo</div>
            <div style={{ fontSize:12,color:C.g300,marginTop:4 }}>PNG, JPG or WEBP (Max. 2MB)</div>
          </div>
          <Input label="Product Title"             required placeholder="e.g. Meta Aged Accounts (US)" />
          <Input label="Short Description"                  placeholder="Brief description about this account type" />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <Select label="Platform"     required options={["Meta","Google","TikTok","Snapchat"]} />
            <Select label="Account Type" required options={["Aged","Fresh"]} />
          </div>
          <Select label="Country" required options={["🇺🇸 United States","🇬🇧 United Kingdom","🇫🇷 France","🇲🇦 Morocco","🇦🇪 UAE"]} />
          <Input  label="Price (USD)"    required type="number" placeholder="120.00" />
        </Card>
        <Card>
          <h3 style={{ margin:"0 0 18px",fontSize:15,fontWeight:800 }}>Product Description</h3>
          <div style={{ border:`1px solid ${C.g200}`,borderRadius:11,overflow:"hidden" }}>
            <div style={{ background:C.g50,padding:"8px 12px",borderBottom:`1px solid ${C.g200}`,display:"flex",gap:8,fontSize:13,color:C.g500 }}>
              <select style={{ background:"transparent",border:"none",fontSize:12,fontFamily:"inherit" }}><option>Paragraph</option></select>
              {["B","I","U"].map(f=><button key={f} style={{ background:"none",border:"none",fontWeight:700,cursor:"pointer",color:C.g500,fontFamily:"inherit" }}>{f}</button>)}
            </div>
            <textarea rows={8} placeholder="Write a detailed description about this account type…"
              style={{ width:"100%",border:"none",padding:"12px 14px",fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit" }} />
            <div style={{ padding:"4px 12px",borderTop:`1px solid ${C.g200}`,fontSize:11,color:C.g300,textAlign:"right" }}>0 / 5000</div>
          </div>
        </Card>
      </div>
      <Card>
        <h3 style={{ margin:"0 0 8px",fontSize:15,fontWeight:800 }}>Bulk Add Inventory</h3>
        <div style={{ background:"#fff7ed",border:`1px solid ${C.yellow}40`,borderRadius:9,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"center" }}>
          <span style={{ color:C.yellow }}>⚠</span>
          <span style={{ fontSize:13,color:"#92400e" }}>Each line = 1 account. Format: email | password | 2fa</span>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr auto",gap:20 }}>
          <textarea rows={8}
            placeholder={`john.doe@gmail.com | Passw0rd@123 | J3K4 5G6H 7J8K\nalex.smith@gmail.com | Passw0rd@123 | L1M2 3N4O 5P6Q`}
            style={{ width:"100%",border:`1px solid ${C.g200}`,borderRadius:10,padding:"12px 14px",fontSize:13,resize:"vertical",boxSizing:"border-box",fontFamily:"monospace",background:C.g50,outline:"none" }} />
          <div style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:12,padding:18,width:220 }}>
            <h4 style={{ margin:"0 0 12px",fontSize:13,fontWeight:800,color:C.g700 }}>Notes</h4>
            {["Each account on its own line.","Format: email | password | 2fa","2FA: any format accepted","Editable after saving."].map(n=>(
              <div key={n} style={{ fontSize:12,color:C.g500,marginBottom:8,display:"flex",gap:6 }}><span style={{ color:C.primary }}>•</span>{n}</div>
            ))}
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

export function AdminInventoryPage() {
  const [view, setView] = useState("list");
  if (view==="add") return <AddAccountForm onCancel={()=>setView("list")} />;

  const cols = [
    { label:"", render:()=><input type="checkbox" />, style:{width:40} },
    { label:"ID",       render:r=><span style={{ fontWeight:800,color:C.primary,fontSize:12 }}>{r.id}</span> },
    { label:"Email",    render:r=><div style={{ display:"flex",alignItems:"center",gap:6,fontFamily:"monospace",fontSize:12,color:C.g500 }}>{r.email} <span style={{ cursor:"pointer" }}>👁</span></div> },
    { label:"Password", render:()=><div style={{ display:"flex",alignItems:"center",gap:6,fontFamily:"monospace",fontSize:12,color:C.g300 }}>••••••••••••<span style={{ cursor:"pointer" }}>👁</span></div> },
    { label:"2FA",      render:()=><div style={{ display:"flex",alignItems:"center",gap:6,fontFamily:"monospace",fontSize:12,color:C.g300 }}>••••••••<span style={{ cursor:"pointer" }}>👁</span></div> },
    { label:"Status",   render:r=><Badge status={r.status} /> },
    { label:"Added On", render:r=><span style={{ fontSize:12,color:C.g400 }}>{r.date}</span> },
    { label:"Actions",  render:()=><div style={{ display:"flex",gap:8 }}><span style={{ cursor:"pointer" }}>👁</span><span style={{ cursor:"pointer" }}>✏️</span><span style={{ cursor:"pointer",color:C.red }}>🗑</span></div> },
  ];

  return (
    <PageShell breadcrumb="Dashboard › Pre-Verified Accounts › Inventory" title="Inventory"
      actions={[<Btn key="e" variant="outline">↑ Export</Btn>,<Btn key="b" variant="outline">↓ Bulk Import</Btn>,<Btn key="a" onClick={()=>setView("add")}>+ Add Accounts</Btn>]}>
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex",gap:16,alignItems:"center",marginBottom:16 }}>
          <div style={{ width:52,height:52,background:"#1877f210",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>ℳ</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
              <h2 style={{ margin:0,fontSize:17,fontWeight:900 }}>Meta Aged Accounts (US)</h2>
              <Badge status="active" />
            </div>
            <div style={{ display:"flex",gap:8 }}>
              {[["Platform: Meta",C.blueL],["Type: Aged",C.greenL],["Country: United States","#ede9fe"]].map(([t,bg])=>(
                <span key={t} style={{ background:bg,color:C.g600,fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:700 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,textAlign:"center" }}>
            {[["Total","1,200",C.g600],["Available","980",C.green],["Sold","180",C.blue],["Reserved","40",C.yellow]].map(([l,v,c])=>(
              <div key={l}><div style={{ fontSize:11,color:C.g400,marginBottom:4 }}>{l}</div><div style={{ fontSize:22,fontWeight:900,color:c }}>{v}</div></div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",gap:12 }}>
          <input placeholder="🔍 Search by email or ID…" style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,width:230,fontFamily:"inherit",outline:"none" }} />
          <select style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }}><option>All Status</option><option>Available</option><option>Reserved</option><option>Sold</option></select>
        </div>
      </Card>
      <Card style={{ padding:0,overflow:"hidden" }}>
        <DataTable cols={cols} rows={MOCK_INVENTORY} />
        <div style={{ padding:"14px 22px",borderTop:`1px solid ${C.g200}` }}>
          <Pagination total="1,200 accounts" showing="1–10" pages={["‹",1,2,3,"...",60,"›"]} />
        </div>
      </Card>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN USERS PAGE
═══════════════════════════════════════════════════ */
export function AdminUsersPage() {
  const cols = [
    { label:"",          render:()=><input type="checkbox" />, style:{width:40} },
    { label:"User",      render:r=><div style={{ display:"flex",alignItems:"center",gap:10 }}><Avatar initials={r.name.split(" ").map(w=>w[0]).join("")} size={32} /><div><div style={{ fontWeight:700,fontSize:13 }}>{r.name}</div><div style={{ fontSize:11,color:C.g400 }}>{r.email}</div></div></div> },
    { label:"Balance",   render:r=><span style={{ fontWeight:700,color:C.primary }}>${r.balance.toLocaleString()}.00</span> },
    { label:"Accounts",  render:r=><span style={{ fontWeight:700 }}>{r.accounts}</span> },
    { label:"Status",    render:r=><Badge status={r.status} /> },
    { label:"Joined",    render:r=><span style={{ fontSize:12,color:C.g400 }}>{r.joined}</span> },
    { label:"Actions",   render:()=><div style={{ display:"flex",gap:8 }}><span style={{ cursor:"pointer" }}>👁</span><span style={{ cursor:"pointer" }}>✏️</span><span style={{ cursor:"pointer",color:C.red }}>🚫</span></div> },
  ];

  return (
    <PageShell title="Users" subtitle="Manage all platform users."
      actions={[<Btn key="add">+ Add New User</Btn>,<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
        {[["Total Users","1,248",C.blue],["Active","892",C.green],["Banned","45",C.red],["Pending","78",C.yellow]].map(([l,v,c])=>(
          <Card key={l}><div style={{ fontSize:12,color:C.g400,marginBottom:6 }}>{l}</div><div style={{ fontSize:24,fontWeight:900,color:c }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display:"flex",gap:12,marginBottom:18 }}>
          <input placeholder="🔍 Search users…" style={{ flex:1,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }} />
          <select style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }}><option>All Status</option><option>Active</option><option>Banned</option><option>Pending</option></select>
        </div>
        <DataTable cols={cols} rows={MOCK_USERS} />
        <div style={{ marginTop:14 }}>
          <Pagination total="1,248 users" showing={`1–${MOCK_USERS.length}`} pages={["‹",1,2,3,"...",125,"›"]} />
        </div>
      </Card>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN ORDERS PAGE
═══════════════════════════════════════════════════ */
export function AdminOrdersPage() {
  const cols = [
    { label:"Order ID",  render:r=><span style={{ fontWeight:700,color:C.g700 }}>{r.id}</span> },
    { label:"User",      render:r=><span style={{ fontSize:12,color:C.g500 }}>{r.user}</span> },
    { label:"Type",      render:r=><span style={{ fontSize:12 }}>{r.type}</span> },
    { label:"Platform",  render:r=><span style={{ fontSize:12 }}>{r.platform}</span> },
    { label:"Amount",    render:r=><span style={{ fontWeight:800,color:C.primary }}>${r.amount}.00</span> },
    { label:"Status",    render:r=><Badge status={r.status} /> },
    { label:"Date",      render:r=><span style={{ fontSize:12,color:C.g400 }}>{r.date}</span> },
    { label:"Actions",   render:()=><span style={{ cursor:"pointer" }}>👁</span> },
  ];

  return (
    <PageShell title="Orders" subtitle="View and manage all platform orders."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
        {[["Total Orders","3,987",C.blue],["Completed","3,245",C.green],["Processing","521",C.yellow],["Pending","221",C.red]].map(([l,v,c])=>(
          <Card key={l}><div style={{ fontSize:12,color:C.g400,marginBottom:6 }}>{l}</div><div style={{ fontSize:24,fontWeight:900,color:c }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display:"flex",gap:12,marginBottom:18 }}>
          <input placeholder="🔍 Search orders…" style={{ flex:1,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }} />
          <select style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }}><option>All Status</option><option>Completed</option><option>Processing</option><option>Pending</option></select>
        </div>
        <DataTable cols={cols} rows={MOCK_ORDERS} />
        <div style={{ marginTop:14 }}>
          <Pagination total="3,987 orders" showing={`1–${MOCK_ORDERS.length}`} pages={["‹",1,2,3,"...",399,"›"]} />
        </div>
      </Card>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN DEPOSITS PAGE
═══════════════════════════════════════════════════ */
export function AdminDepositsPage() {
  const [deposits, setDeposits] = useState(MOCK_DEPOSITS);

  const approve = id => setDeposits(p=>p.map(d=>d.id===id?{...d,status:"completed"}:d));
  const reject  = id => setDeposits(p=>p.map(d=>d.id===id?{...d,status:"rejected"}:d));

  const cols = [
    { label:"Deposit ID", render:r=><span style={{ fontWeight:700,color:C.primary,fontSize:12 }}>{r.id}</span> },
    { label:"User",       render:r=><span style={{ fontSize:12,color:C.g500 }}>{r.user}</span> },
    { label:"Method",     render:r=><span style={{ fontSize:12 }}>{r.method}</span> },
    { label:"Amount",     render:r=><span style={{ fontWeight:900,color:C.green }}>${r.amount.toFixed(2)}</span> },
    { label:"Status",     render:r=><Badge status={r.status} /> },
    { label:"Proof",      render:r=><span style={{ fontSize:12,color:C.blue,cursor:"pointer" }}>{r.proof}</span> },
    { label:"Date",       render:r=><span style={{ fontSize:12,color:C.g400 }}>{r.date}</span> },
    { label:"Actions",    render:r=>r.status==="pending"
        ? <div style={{ display:"flex",gap:8 }}>
            <Btn variant="success" size="sm" onClick={()=>approve(r.id)}>✓ Approve</Btn>
            <Btn variant="danger"  size="sm" onClick={()=>reject(r.id)}>✕ Reject</Btn>
          </div>
        : <Badge status={r.status} />
    },
  ];

  const pending = deposits.filter(d=>d.status==="pending");

  return (
    <PageShell title="Deposits" subtitle="Review and approve user deposit requests."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>

      {pending.length > 0 && (
        <div style={{ background:C.yellowL,border:`1px solid ${C.yellow}40`,borderRadius:12,padding:"14px 20px",marginBottom:22,display:"flex",gap:12,alignItems:"center" }}>
          <span style={{ fontSize:22 }}>⏳</span>
          <div><strong style={{ color:"#92400e" }}>{pending.length} deposit{pending.length>1?"s":""} pending review</strong><div style={{ fontSize:13,color:"#a16207",marginTop:2 }}>Review and approve or reject the deposits below.</div></div>
        </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22 }}>
        {[["Total Deposits","$86,245.30",C.blue],["Approved","$85,095.30",C.green],["Pending","$700.00",C.yellow],["Rejected","$450.00",C.red]].map(([l,v,c])=>(
          <Card key={l}><div style={{ fontSize:12,color:C.g400,marginBottom:6 }}>{l}</div><div style={{ fontSize:20,fontWeight:900,color:c }}>{v}</div></Card>
        ))}
      </div>

      <Card>
        <div style={{ display:"flex",gap:12,marginBottom:18 }}>
          <input placeholder="🔍 Search deposits…" style={{ flex:1,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }} />
          <select style={{ background:C.g50,border:`1px solid ${C.g200}`,borderRadius:9,padding:"9px 14px",fontSize:13,fontFamily:"inherit",outline:"none" }}><option>All Status</option><option>Pending</option><option>Completed</option><option>Rejected</option></select>
        </div>
        <DataTable cols={cols} rows={deposits} />
        <div style={{ marginTop:14 }}>
          <Pagination total={`${deposits.length} deposits`} showing={`1–${deposits.length}`} pages={["‹",1,2,"›"]} />
        </div>
      </Card>
    </PageShell>
  );
}
