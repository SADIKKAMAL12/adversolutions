import { C } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { Logo, Btn, Input } from '../shared/UI.jsx'
import { useAuth } from '../shared/AuthContext.jsx'

export default function UserLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("john.doe@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,#18080d 0%,#2d1018 40%,#18080d 100%)`, display: "flex", fontFamily: "'Sora',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 70px", color: "#fff" }}>
        <Logo size="lg" />
        <div style={{ marginTop: 50 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 14px", lineHeight: 1.2 }}>
            Scale Your Ads.<br /><span style={{ color: C.primary }}>Faster.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", maxWidth: 400, lineHeight: 1.8, margin: "0 0 40px" }}>
            Access pre-verified ad accounts, hire expert media buyers, and manage all your advertising in one place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[
              ["🎯", "Pre-Verified Ad Accounts", "Meta, Google, TikTok & Snapchat — ready to run"],
              ["👤", "Expert Media Buyers", "Hire certified professionals for your campaigns"],
              ["📊", "Real-Time Tracking", "Monitor performance and scale with confidence"],
            ].map(([ic, t, s]) => (
              <div key={t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 42, height: 42, background: "rgba(232,25,44,.15)", border: "1px solid rgba(232,25,44,.3)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{ic}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{t}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 3 }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 50px" }}>
        <div style={{ width: "100%", background: "#fff", borderRadius: 24, padding: "40px 36px", boxShadow: "0 40px 80px rgba(0,0,0,.4)" }}>
          <div style={{ marginBottom: 30 }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: C.g800 }}>Welcome back!</h2>
            <p style={{ margin: 0, fontSize: 14, color: C.g500 }}>Sign in to your account to continue</p>
          </div>
          <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <div style={{ background: C.redL, color: C.red, padding: "10px 14px", borderRadius: 9, fontSize: 13, marginBottom: 16 }}>{error}</div>}
          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: C.primary, cursor: "pointer", fontWeight: 700 }}>Forgot password?</span>
          </div>
          <Btn full size="lg" onClick={submit} style={{ marginBottom: 18 }}>
            {loading ? "Signing in…" : "Sign In →"}
          </Btn>
          <div style={{ textAlign: "center", fontSize: 13, color: C.g500 }}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={{ color: C.primary, cursor: "pointer", fontWeight: 700 }}>Create Account</span>
          </div>
          <div style={{ borderTop: `1px solid ${C.g100}`, marginTop: 24, paddingTop: 16, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: C.g300 }}>Demo credentials are pre-filled — just click Sign In</span>
          </div>
        </div>
      </div>
    </div>
  );
}
