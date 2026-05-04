import { C } from '../shared/theme.js'
import { useState } from 'react'
import { PageShell, Card, Btn, Badge, DataTable } from '../shared/UI.jsx'
import { useAuth } from '../shared/AuthContext.jsx'
import { createDeposit, createTransaction } from '../lib/db.js'

export default function BalancePage({ balance, transactions, paymentMethods, addTransaction, addBalance, setStore }) {
  const { user } = useAuth();
  const [payStep, setPayStep] = useState(1);
  const firstMethod = paymentMethods[0];
  const [method, setMethod] = useState((firstMethod && firstMethod.name) || "Payoneer");
  const [amount, setAmount] = useState("350.00");
  const [proof, setProof] = useState(false);
  const [txFilter, setTxFilter] = useState("all");
  const [successBanner, setSuccessBanner] = useState(false);
  const activeMethods = paymentMethods.filter(m => m.active);

  const filtered = txFilter === "all" ? transactions : transactions.filter(t => t.type.toLowerCase().includes(txFilter) || t.status === txFilter);

  const submitDeposit = async () => {
    if (!proof) { alert("Please upload payment proof."); return; }
    if (!user) { alert("Please log in."); return; }

    const dateStr = new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const depositId = "DEP-" + Date.now();

    try {
      // Write to Supabase
      await createDeposit({
        id: depositId,
        user_id: user.id,
        method,
        amount: parseFloat(amount) || 0,
        status: "pending",
        date: dateStr,
        proof: "proof_upload.png",
      });

      await createTransaction({
        user_id: user.id,
        type: "Deposit",
        method,
        amount: parseFloat(amount) || 0,
        status: "pending",
        date: dateStr,
      });

      // Update local state
      setStore(s => ({
        ...s,
        transactions: [{
          id: Date.now(),
          type: "Deposit", method,
          amount: parseFloat(amount) || 0,
          status: "pending",
          date: dateStr,
        }, ...s.transactions],
        deposits: [{
          id: depositId,
          user: user.email,
          method,
          amount: parseFloat(amount) || 0,
          status: "pending",
          date: dateStr,
          proof: "proof_upload.png",
        }, ...s.deposits],
      }));

      setSuccessBanner(true);
      setPayStep(1);
      setProof(false);
      setAmount("350.00");
    } catch (err) {
      alert("Failed to submit deposit: " + err.message);
    }
  };

  const txCols = [
    { label: "#", render: r => <span style={{ color: C.g400 }}>{r.id}</span> },
    { label: "Type", render: r => <span style={{ fontWeight: 700, color: C.g700 }}>{r.type}</span> },
    { label: "Method", render: r => <span style={{ color: C.g500 }}>{r.method}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 900, color: r.amount < 0 ? C.red : C.green }}>{r.amount < 0 ? "−" : "+"} ${Math.abs(r.amount).toFixed(2)}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.date}</span> },
    { label: "", render: () => <span style={{ cursor: "pointer" }}>👁</span> },
  ];

  const selectedMethod = activeMethods.find(m => m.name === method);
  const selectedAccount = selectedMethod && selectedMethod.account;

  return (
    <PageShell title="Balance & Transactions" subtitle="Manage your account balance, top up, and view your full transaction history.">
      {successBanner && (
        <div style={{ background: C.greenL, border: `1px solid ${C.green}40`, borderRadius: 13, padding: "14px 20px", marginBottom: 22, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <strong style={{ color: C.green }}>Deposit request submitted!</strong>
            <div style={{ fontSize: 13, color: "#065f46", marginTop: 2 }}>Pending admin approval — you'll be notified once it's confirmed.</div>
          </div>
          <button onClick={() => setSuccessBanner(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.green }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[[C.primary, "◈", "Current Balance", `$${balance.toFixed(2)}`], [C.yellow, "⏱", "Pending Balance", "$320.00"], [C.green, "↓", "Total Deposits", "$5,850.00"], [C.blue, "↑", "Total Spent", "$4,610.00"]].map(([col, ic, l, v]) => (
          <Card key={l}>
            <div style={{ width: 40, height: 40, background: col + "20", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{ic}</div>
            <div style={{ fontSize: 12, color: C.g400 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: col, margin: "4px 0" }}>{v}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div>
          <Card style={{ marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 900, color: C.g800 }}>Top Up Balance</h3>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: C.g500 }}>Add funds to your account balance.</p>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
              {[{ n: 1, l: "Payment Method" }, { n: 2, l: "Payment Details" }, { n: 3, l: "Upload Proof" }].map((s, i) => (
                <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "auto" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: payStep >= s.n ? C.primary : C.g200, color: payStep >= s.n ? "#fff" : C.g400, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{payStep > s.n ? "✓" : s.n}</div>
                    <span style={{ fontSize: 11, color: payStep === s.n ? C.primary : C.g400, fontWeight: payStep === s.n ? 700 : 400, whiteSpace: "nowrap" }}>{s.l}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: payStep > s.n ? C.primary : C.g200, margin: "0 6px", marginBottom: 18 }} />}
                </div>
              ))}
            </div>

            {payStep === 1 && (
              <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
                  {activeMethods.map(m => (
                    <div key={m.name} onClick={() => setMethod(m.name)}
                      style={{ border: `2px solid ${method === m.name ? C.primary : C.g200}`, borderRadius: 11, padding: "11px 16px", cursor: "pointer", background: method === m.name ? C.primaryLight : "#fff", display: "flex", alignItems: "center", gap: 8, transition: "all .15s" }}>
                      {m.logo && m.logo.startsWith('data:') ? (
                        <img src={m.logo} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
                      ) : (
                        <span style={{ fontSize: 18 }}>{m.logo || "💳"}</span>
                      )}
                      <span style={{ fontSize: 13, fontWeight: 700, color: method === m.name ? C.primary : C.g600 }}>{m.name}</span>
                    </div>
                  ))}
                </div>
                <Btn onClick={() => setPayStep(2)}>Next Step →</Btn>
              </>
            )}

            {payStep === 2 && (
              <>
                {/* Admin-configured payment details */}
                <div style={{ background: C.g50, borderRadius: 11, padding: "16px 18px", marginBottom: 18, border: `1px solid ${C.g200}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    {selectedMethod?.logo && selectedMethod.logo.startsWith('data:') ? (
                      <img src={selectedMethod.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 24 }}>{selectedMethod?.logo || "💳"}</span>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: C.g800 }}>{selectedMethod?.name}</div>
                      <div style={{ fontSize: 12, color: C.g400 }}>{selectedMethod?.bank_name}</div>
                    </div>
                  </div>
                  {(selectedMethod?.fields || []).map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i === 0 ? `1px solid ${C.g200}` : "none", borderBottom: `1px solid ${C.g100}` }}>
                      <span style={{ fontSize: 12, color: C.g500, fontWeight: 600, minWidth: 100 }}>{f.label}</span>
                      <span style={{ fontSize: 13, color: C.g800, fontWeight: 700, flex: 1, fontFamily: "monospace" }}>{f.value}</span>
                      <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(f.value)} style={{ background: C.g100, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: C.g500, fontWeight: 600 }}>Copy</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.g500, marginBottom: 6, fontWeight: 600 }}>Your Account</label>
                    <input placeholder="Email / Wallet / ID" style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.g500, marginBottom: 6, fontWeight: 600 }}>Amount (USD)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                    <div style={{ fontSize: 11, color: C.g400, marginTop: 4 }}>Minimum: $10</div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: C.g500, marginBottom: 6, fontWeight: 600 }}>You receive</label>
                    <div style={{ fontSize: 24, fontWeight: 900, color: C.primary, paddingTop: 6 }}>${parseFloat(amount || 0).toFixed(2)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="outline" onClick={() => setPayStep(1)}>← Back</Btn>
                  <Btn onClick={() => setPayStep(3)}>Next Step →</Btn>
                </div>
              </>
            )}

            {payStep === 3 && (
              <>
                <div style={{ background: C.yellowL, border: `1px solid ${C.yellow}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#92400e" }}>
                  ⚠️ Send <strong>${parseFloat(amount || 0).toFixed(2)} USD</strong> via <strong>{selectedMethod?.name || method}</strong> ({selectedMethod?.bank_name}). Use the account details shown in step 2, then upload your payment screenshot below.
                </div>
                <div onClick={() => setProof(p => !p)}
                  style={{ border: `2px dashed ${proof ? C.green : C.g300}`, borderRadius: 13, padding: "38px", textAlign: "center", cursor: "pointer", background: proof ? C.greenL : C.g50, marginBottom: 18, transition: "all .2s" }}>
                  {proof
                    ? <><div style={{ fontSize: 36, marginBottom: 8 }}>✅</div><div style={{ fontWeight: 700, color: C.green }}>proof_payment.png uploaded</div><div style={{ fontSize: 12, color: "#065f46" }}>Click to replace</div></>
                    : <><div style={{ fontSize: 36, marginBottom: 8, color: C.g400 }}>↑</div><div style={{ fontWeight: 700, color: C.g500 }}>Click to Upload Payment Proof</div><div style={{ fontSize: 12, color: C.g400, marginTop: 4 }}>PNG, JPG, PDF up to 5MB</div></>
                  }
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn variant="outline" onClick={() => setPayStep(2)}>← Back</Btn>
                  <Btn onClick={submitDeposit} style={{ background: proof ? C.primary : C.g300, cursor: proof ? "pointer" : "default" }}>Submit Deposit Request</Btn>
                </div>
              </>
            )}
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: C.g800 }}>Transaction History</h3>
              <div style={{ display: "flex", gap: 7 }}>
                {[["all", "All"], ["deposit", "Deposits"], ["spent", "Spent"], ["refund", "Refunds"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTxFilter(v)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${txFilter === v ? C.primary : C.g200}`, background: txFilter === v ? C.primaryLight : "#fff", color: txFilter === v ? C.primary : C.g500, fontSize: 12, fontWeight: txFilter === v ? 700 : 400, cursor: "pointer" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <DataTable cols={txCols} rows={filtered} emptyMsg="No transactions found." />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 900, color: C.g800 }}>Payment Methods</h3>
            {activeMethods.map(m => (
              <div key={m.id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.g100}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 32, height: 32, background: C.primaryLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {m.logo && m.logo.startsWith('data:') ? (
                      <img src={m.logo} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 18 }}>{m.logo || "💳"}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 12, color: C.g700 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: C.g400 }}>{m.bank_name}</div>
                  </div>
                </div>
                {(m.fields || []).map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0 3px 42px" }}>
                    <span style={{ fontSize: 11, color: C.g500, minWidth: 70 }}>{f.label}:</span>
                    <span style={{ fontSize: 11, color: C.g700, fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{f.value}</span>
                    <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(f.value)} style={{ background: C.g100, border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 10, cursor: "pointer", color: C.g500, flexShrink: 0 }}>Copy</button>
                  </div>
                ))}
              </div>
            ))}
          </Card>
          <div style={{ background: C.yellowL, border: `1px solid ${C.yellow}30`, borderRadius: 13, padding: 16 }}>
            <div style={{ display: "flex", gap: 9 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e", marginBottom: 3 }}>Important</div>
                <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.5 }}>Please send the exact amount. Wrong amounts may cause processing delays.</div>
              </div>
            </div>
          </div>
          <Card>
            <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 900, color: C.g800 }}>Balance Summary</h3>
            {[["Total Deposits", "$5,850.00", C.green], ["Total Spent", "$4,610.00", C.red], ["Pending", "$320.00", C.yellow], ["Net Balance", `$${balance.toFixed(2)}`, C.primary]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.g100}`, fontSize: 13 }}>
                <span style={{ color: C.g500 }}>{l}</span><span style={{ fontWeight: 800, color: c }}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
