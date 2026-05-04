import { C } from "../shared/theme";
import { Card, PlatformIcon, Btn, PageShell } from "../shared/UI";

const ACCOUNTS = [
  { platform:"Meta",     type:"Aged", id:"META-64258",    age:"6+ Months", spend:"$250/day", status:"BM Verified", price:120 },
  { platform:"Google",   type:"Aged", id:"GOOGLE-19532",  age:"8+ Months", spend:"$200/day", status:"Active",      price:110 },
  { platform:"TikTok",   type:"New",  id:"TIKTOK-78412",  age:"1+ Months", spend:"$150/day", status:"Active",      price: 95 },
  { platform:"Snapchat", type:"Aged", id:"SNAP-32541",    age:"5+ Months", spend:"$100/day", status:"Active",      price: 90 },
  { platform:"Meta",     type:"Aged", id:"META-64211",    age:"7+ Months", spend:"$300/day", status:"BM Verified", price:150 },
  { platform:"Google",   type:"New",  id:"GOOGLE-19876",  age:"2+ Months", spend:"$120/day", status:"Active",      price: 85 },
  { platform:"TikTok",   type:"Aged", id:"TIKTOK-78493",  age:"4+ Months", spend:"$180/day", status:"Active",      price:105 },
  { platform:"Snapchat", type:"New",  id:"SNAP-32588",    age:"1+ Months", spend:"$80/day",  status:"Active",      price: 75 },
];

/* ═══════════════════════════════════════════════════
   PRE-VERIFIED ACCOUNTS PAGE
═══════════════════════════════════════════════════ */
export default function PreVerifiedPage() {
  return (
    <PageShell
      title="Pre-Verified Accounts"
      subtitle="Browse and purchase ready-to-use, pre-verified ad accounts."
      actions={[
        <Btn key="how" variant="outline">? How it works?</Btn>,
        <Btn key="purchases">◈ My Purchases</Btn>,
      ]}
    >
      {/* Filters */}
      <Card style={{ marginBottom:20, padding:"14px 20px" }}>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-end" }}>
          {[["Platform",["All Platforms","Meta","Google","TikTok","Snapchat"]],["Account Type",["All Types","Aged","Fresh"]],["Account Age",["All Ages","1+ Months","3+ Months","6+ Months","12+ Months"]]].map(([l,o])=>(
            <div key={l}>
              <div style={{ fontSize:12, color:C.g400, marginBottom:5, fontWeight:600 }}>{l}</div>
              <select style={{ background:C.g50, border:`1px solid ${C.g200}`, borderRadius:9, padding:"9px 14px", fontSize:13, fontFamily:"inherit", outline:"none" }}>
                {o.map(opt=><option key={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <div>
            <div style={{ fontSize:12, color:C.g400, marginBottom:5, fontWeight:600 }}>Price Range</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input placeholder="$ Min" style={{ width:72, border:`1px solid ${C.g200}`, borderRadius:8, padding:"9px 10px", fontSize:13, fontFamily:"inherit", outline:"none" }} />
              <span style={{ color:C.g300 }}>—</span>
              <input placeholder="$ Max" style={{ width:72, border:`1px solid ${C.g200}`, borderRadius:8, padding:"9px 10px", fontSize:13, fontFamily:"inherit", outline:"none" }} />
            </div>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <div style={{ fontSize:12, color:C.g400, marginBottom:5, fontWeight:600 }}>Sort By</div>
            <select style={{ background:C.g50, border:`1px solid ${C.g200}`, borderRadius:9, padding:"9px 14px", fontSize:13, fontFamily:"inherit", outline:"none" }}>
              {["Newest First","Price: Low to High","Price: High to Low","Most Popular"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Account grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {ACCOUNTS.map(acc=>(
          <Card key={acc.id}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
              <PlatformIcon name={acc.platform} size={26} />
              <span style={{ background:acc.type==="Aged"?C.greenL:C.blueL, color:acc.type==="Aged"?C.green:C.blue, fontSize:11, fontWeight:800, padding:"3px 9px", borderRadius:20 }}>{acc.type}</span>
            </div>
            <div style={{ fontWeight:900, fontSize:15, color:C.g800, marginBottom:3 }}>{acc.platform} Ads Account</div>
            <div style={{ fontSize:11, color:C.g400, marginBottom:14 }}>ID: {acc.id}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
              {[`Account Age: ${acc.age}`, `Spending Limit: ${acc.spend}`, `Status: ${acc.status}`].map(f=>(
                <div key={f} style={{ fontSize:12, color:C.g500, display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:C.green, fontWeight:800 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:20, fontWeight:900, color:C.primary }}>${acc.price}.00</span>
              <Btn size="sm">🛒 Buy Now</Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:24 }}>
        {["‹",1,2,3,"...",12,"›"].map((p,i)=>(
          <button key={i} style={{ width:36, height:36, borderRadius:8, border:`1px solid ${p===1?C.primary:C.g200}`, background:p===1?C.primary:"#fff", color:p===1?"#fff":C.g500, fontWeight:700, fontSize:13, cursor:"pointer" }}>{p}</button>
        ))}
      </div>
    </PageShell>
  );
}
