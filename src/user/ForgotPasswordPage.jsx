import { C } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { Logo, Btn, Input } from '../shared/UI.jsx'
import bcrypt from 'bcryptjs'

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const startCountdown = () => {
    setCountdown(60);
    const t = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleFindAccount = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/crud?table=users&email=${encodeURIComponent(email)}&single=true`);
      const data = await res.json();
      if (!res.ok || data.error || !data) throw new Error('No account found with that email.');
      if (!data.phone) throw new Error('No WhatsApp number on file for this account.');
      setPhone(data.phone);
      setUserId(data.id);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/otp?action=send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Failed to send OTP');
      setSent(true); startCountdown();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/otp?action=verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Verification failed');
      setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      const password_hash = await bcrypt.hash(newPass, 10);
      const res = await fetch('/api/crud?table=users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, password_hash }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to update password');
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const maskPhone = (p) => {
    if (!p || p.length < 6) return p;
    return p.slice(0, 4) + '••••' + p.slice(-3);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg,#18080d 0%,#2d1018 40%,#18080d 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", padding: 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ width: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Logo size="md" />
        </div>
        <div style={{ background: '#fff', borderRadius: 24, padding: '40px 36px', boxShadow: '0 40px 80px rgba(0,0,0,.4)' }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: C.g800, margin: '0 0 10px' }}>Password Updated!</h2>
              <p style={{ fontSize: 14, color: C.g500, margin: '0 0 28px' }}>Your password has been changed successfully.</p>
              <Btn full size="lg" onClick={() => navigate('/login')}>Back to Login →</Btn>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: C.g800 }}>
                  {step === 1 ? 'Reset Password' : step === 2 ? 'Verify WhatsApp' : 'New Password'}
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: C.g500 }}>
                  {step === 1 ? 'Enter your account email to get started.' : step === 2 ? `We'll send an OTP to ${maskPhone(phone)}` : 'Choose a new secure password.'}
                </p>
              </div>

              {error && (
                <div style={{ background: C.redL, border: `1px solid ${C.red}40`, borderRadius: 9, padding: '11px 14px', fontSize: 13, color: C.red, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {step === 1 && (
                <>
                  <Input label="Email Address" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                  <Btn full size="lg" onClick={handleFindAccount} disabled={!email || loading} style={{ opacity: email ? 1 : .4 }}>
                    {loading ? 'Looking up…' : 'Continue →'}
                  </Btn>
                </>
              )}

              {step === 2 && (
                <>
                  {!sent ? (
                    <>
                      <div style={{ background: C.g50, borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: C.g500, lineHeight: 1.6 }}>
                        A 6-digit OTP will be sent to the WhatsApp number on your account: <strong>{maskPhone(phone)}</strong>
                      </div>
                      <Btn full size="lg" onClick={sendOTP} disabled={loading}>
                        {loading ? 'Sending…' : '📲 Send OTP via WhatsApp'}
                      </Btn>
                    </>
                  ) : (
                    <>
                      <div style={{ background: C.greenL, border: `1px solid ${C.green}40`, borderRadius: 9, padding: '11px 14px', marginBottom: 20, fontSize: 13, color: C.green, fontWeight: 700 }}>
                        ✓ Code sent. Check your WhatsApp.
                      </div>
                      <Input label="Enter 6-digit OTP" required value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="483921" style={{ letterSpacing: 8, fontSize: 22, textAlign: 'center', fontWeight: 900 }} />
                      <Btn full size="lg" onClick={verifyOTP} disabled={otp.length !== 6 || loading} style={{ marginBottom: 12 }}>
                        {loading ? 'Verifying…' : 'Verify & Continue →'}
                      </Btn>
                      <div style={{ textAlign: 'center', fontSize: 13, color: C.g400 }}>
                        {countdown > 0 ? `Resend in ${countdown}s` : <span onClick={sendOTP} style={{ color: C.primary, cursor: 'pointer', fontWeight: 700 }}>Resend OTP</span>}
                      </div>
                    </>
                  )}
                  <button onClick={() => setStep(1)} style={{ marginTop: 16, width: '100%', background: 'none', border: 'none', color: C.g400, cursor: 'pointer', fontSize: 13, padding: '8px 0', fontFamily: 'inherit' }}>← Back</button>
                </>
              )}

              {step === 3 && (
                <>
                  <Input label="New Password" required type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min. 8 characters" />
                  <Input label="Confirm New Password" required type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat password" />
                  {confirmPass && newPass !== confirmPass && (
                    <div style={{ background: C.redL, color: C.red, borderRadius: 9, padding: '9px 14px', fontSize: 13, marginBottom: 16 }}>Passwords do not match.</div>
                  )}
                  <Btn full size="lg" onClick={handleReset} disabled={!newPass || !confirmPass || loading} style={{ opacity: newPass && confirmPass ? 1 : .4 }}>
                    {loading ? 'Saving…' : 'Set New Password →'}
                  </Btn>
                </>
              )}

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.g400 }}>
                <span onClick={() => navigate('/login')} style={{ color: C.primary, cursor: 'pointer', fontWeight: 700 }}>← Back to Login</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
