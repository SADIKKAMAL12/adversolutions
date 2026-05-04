import { useState } from "react";
import { C } from "../shared/theme";
import { Logo, Input, Select, Btn } from "../shared/UI";

/* ═══════════════════════════════════════════════════
   USER REGISTER — Create Account
   Multi-step: Account Info → Business Info → Done
═══════════════════════════════════════════════════ */
const STEPS = [
  { label:"Account Info",   sub:"Your personal details"  },
  { label:"Business Info",  sub:"Your company details"   },
  { label:"Confirm",        sub:"Review & finish"        },
];

function StepDots({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", marginBottom:36 }}>
      {STEPS.map((s,i)=>{
        const n=i+1, done=current>n, active=current===n;
        return (
          <div key={n} style={{ display:"flex", alignItems:"flex-start", flex:n<STEPS.length?1:"auto" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:7 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", border:`2px solid ${done||active?C.primary:C.g300}`, background:done||active?C.primary:"#fff", color:done||active?"#fff":C.g400, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, transition:"all .3s" }}>{done?"✓":n}</div>
              <div style={{ textAlign:"center", width:90 }}>
                <div style={{ fontSize:12, fontWeight:700, color:active?C.primary:done?C.g600:C.g400 }}>{s.label}</div>
                <div style={{ fontSize:10, color:C.g400, marginTop:1 }}>{s.sub}</div>
              </div>
            </div>
            {n<STEPS.length && <div style={{ flex:1, height:2, background:done?C.primary:C.g200, marginTop:17, transition:"all .3s" }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Account Info ── */
function Step1({ data, set, onNext }) {
  const ok = data.firstName && data.lastName && data.email && data.password && data.confirm;
  const passwordMatch = data.password === data.confirm;

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="First Name"    required value={data.firstName} onChange={e=>set("firstName",e.target.value)}  placeholder="John"  />
        <Input label="Last Name"     required value={data.lastName}  onChange={e=>set("lastName",e.target.value)}   placeholder="Doe"   />
      </div>
      <Input label="Email Address"   required type="email"    value={data.email}    onChange={e=>set("email",e.target.value)}    placeholder="john@example.com" />
      <Input label="Phone Number"             type="tel"      value={data.phone}    onChange={e=>set("phone",e.target.value)}    placeholder="+1 555 123 4567"  />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Input label="Password"      required type="password" value={data.password} onChange={e=>set("password",e.target.value)} placeholder="Min. 8 characters" />
        <Input label="Confirm Password" required type="password" value={data.confirm} onChange={e=>set("confirm",e.target.value)} placeholder="Repeat password" />
      </div>
      {data.confirm && !passwordMatch && <div style={{ background:C.redL, color:C.red, borderRadius:9, padding:"9px 14px", fontSize:13, marginBottom:16 }}>Passwords do not match.</div>}

      <div style={{ background:C.g50, border:`1px solid ${C.g200}`, borderRadius:10, padding:"12px 14px", marginBottom:20, fontSize:13, color:C.g500, lineHeight:1.6 }}>
        By creating an account you agree to our <span style={{ color:C.primary, cursor:"pointer", fontWeight:700 }}>Terms of Service</span> and <span style={{ color:C.primary, cursor:"pointer", fontWeight:700 }}>Privacy Policy</span>.
      </div>

      <Btn full size="lg" onClick={()=>ok&&passwordMatch&&onNext()} style={{ opacity:ok&&passwordMatch?1:.4, cursor:ok&&passwordMatch?"pointer":"default" }}>
        Continue →
      </Btn>
    </>
  );
}

/* ── Step 2: Business Info ── */
function Step2({ data, set, onNext, onBack }) {
  const ok = data.businessName && data.businessType && data.country;

  return (
    <>
      <Input label="Business / Agency Name" required value={data.businessName} onChange={e=>set("businessName",e.target.value)} placeholder="My Agency LLC" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Select label="Business Type" required value={data.businessType} onChange={e=>set("businessType",e.target.value)}
          options={["","Marketing Agency","E-Commerce Brand","Freelancer","Startup","Enterprise","Other"]} />
        <Select label="Country" required value={data.country} onChange={e=>set("country",e.target.value)}
          options={["","United States","United Kingdom","France","Germany","Morocco","UAE","Saudi Arabia","Canada","Australia","Other"]} />
      </div>
      <Input label="Website (Optional)" value={data.website} onChange={e=>set("website",e.target.value)} placeholder="https://myagency.com" />
      <Input label="How did you hear about us?" value={data.referral} onChange={e=>set("referral",e.target.value)} placeholder="Google, friend, social media…" />

      <div style={{ display:"flex", gap:12, marginTop:8 }}>
        <Btn variant="outline" size="lg" style={{ flex:1 }} onClick={onBack}>← Back</Btn>
        <Btn size="lg" style={{ flex:2, opacity:ok?1:.4, cursor:ok?"pointer":"default" }} onClick={()=>ok&&onNext()}>Continue →</Btn>
      </div>
    </>
  );
}

/* ── Step 3: Confirm ── */
function Step3({ data, onDone, onBack }) {
  return (
    <>
      <div style={{ textAlign:"center", padding:"10px 0 20px" }}>
        <div style={{ width:72, height:72, background:C.greenL, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:34, margin:"0 auto 18px" }}>✓</div>
        <h2 style={{ fontSize:22, fontWeight:900, color:C.g800, margin:"0 0 8px" }}>You're all set!</h2>
        <p style={{ fontSize:14, color:C.g500, margin:"0 0 28px" }}>Review your details before finishing.</p>
      </div>

      <div style={{ background:C.g50, borderRadius:13, padding:"18px 20px", marginBottom:24 }}>
        {[
          ["Name",     `${data.firstName} ${data.lastName}`],
          ["Email",    data.email],
          ["Phone",    data.phone||"—"],
          ["Business", data.businessName],
          ["Type",     data.businessType],
          ["Country",  data.country],
          ["Website",  data.website||"—"],
        ].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.g200}`, fontSize:14 }}>
            <span style={{ color:C.g500, fontWeight:600 }}>{k}</span>
            <span style={{ color:C.g800, fontWeight:700 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:12 }}>
        <Btn variant="outline" size="lg" style={{ flex:1 }} onClick={onBack}>← Edit</Btn>
        <Btn size="lg" style={{ flex:2 }} onClick={onDone}>🎉 Create My Account</Btn>
      </div>
    </>
  );
}

/* ── Main Register component ── */
export default function RegisterPage({ onLogin, goToLogin }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    firstName:"", lastName:"", email:"", phone:"", password:"", confirm:"",
    businessName:"", businessType:"", country:"", website:"", referral:"",
  });

  const set = (k,v) => setData(p=>({...p,[k]:v}));

  const handleDone = () => {
    onLogin("user", { name:`${data.firstName} ${data.lastName}`, email:data.email });
  };

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,#18080d 0%,#2d1018 40%,#18080d 100%)`, display:"flex", fontFamily:"'Sora',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Left panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 70px", color:"#fff" }}>
        <Logo size="lg" />
        <div style={{ marginTop:50 }}>
          <h2 style={{ fontSize:34, fontWeight:900, margin:"0 0 14px", lineHeight:1.2 }}>
            Start Advertising<br /><span style={{ color:C.primary }}>Smarter Today.</span>
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.5)", maxWidth:400, lineHeight:1.8, margin:"0 0 36px" }}>
            Join thousands of advertisers who trust AdverSolutions to manage and scale their ad campaigns.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              ["✅","Free to sign up","No setup fees or hidden charges"],
              ["⚡","Instant access","Start ordering accounts right away"],
              ["🔒","Secure & encrypted","Your data and credentials are always protected"],
              ["🎯","Verified accounts","Every account is pre-tested and ready to run"],
            ].map(([ic,t,s])=>(
              <div key={t} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:40, height:40, background:"rgba(232,25,44,.15)", border:"1px solid rgba(232,25,44,.3)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{ic}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#fff" }}>{t}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:2 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width:520, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 50px" }}>
        <div style={{ width:"100%", background:"#fff", borderRadius:24, padding:"40px 36px", boxShadow:"0 40px 80px rgba(0,0,0,.4)" }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ margin:"0 0 6px", fontSize:24, fontWeight:900, color:C.g800 }}>Create your account</h2>
            <p style={{ margin:0, fontSize:14, color:C.g500 }}>
              Already have an account?{" "}
              <span onClick={goToLogin} style={{ color:C.primary, cursor:"pointer", fontWeight:700 }}>Sign in</span>
            </p>
          </div>

          <StepDots current={step} />

          {step===1 && <Step1 data={data} set={set} onNext={()=>setStep(2)} />}
          {step===2 && <Step2 data={data} set={set} onNext={()=>setStep(3)} onBack={()=>setStep(1)} />}
          {step===3 && <Step3 data={data} onDone={handleDone} onBack={()=>setStep(2)} />}
        </div>
      </div>
    </div>
  );
}
