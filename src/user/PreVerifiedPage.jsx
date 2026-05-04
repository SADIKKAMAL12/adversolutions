import { C } from '../shared/theme.js'
import { useState } from 'react'
import { useNavigate } from '../shared/Router.jsx'
import { PageShell, Card, Btn, PlatformIcon, Badge } from '../shared/UI.jsx'

export default function PreVerifiedPage({ products, lines, balance, purchases, setStore }) {
  const navigate = useNavigate();
  const [view, setView] = useState("shop");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({ platform: "All", type: "All", min: "", max: "", sort: "Newest First" });

  const getQty = (pid) => lines.filter(l => l.productId === pid && l.status === "available").length;

  const filtered = products.filter(p => {
    if (filters.platform !== "All" && p.platform !== filters.platform) return false;
    if (filters.type !== "All" && p.type !== filters.type) return false;
    if (filters.min && p.price < Number(filters.min)) return false;
    if (filters.max && p.price > Number(filters.max)) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sort === "Price: Low to High") return a.price - b.price;
    if (filters.sort === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  const buyProduct = (product) => {
    const available = lines.filter(l => l.productId === product.id && l.status === "available");
    if (available.length === 0) { alert("Out of stock!"); return; }
    if (balance < product.price) { alert("Insufficient balance!"); return; }
    const line = available[0];
    const purchase = {
      id: "PUR-" + Date.now(),
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      price: product.price,
      lineId: line.id,
      email: line.email,
      password: line.password,
      twofa: line.twofa,
      purchasedAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    setStore(s => ({
      ...s,
      balance: s.balance - product.price,
      purchases: [purchase, ...s.purchases],
      inventoryLines: s.inventoryLines.map(l => l.id === line.id ? { ...l, status: "sold" } : l),
      transactions: [{ id: Date.now(), type: "Spent", method: "Pre-Verified Account", amount: -product.price, status: "completed", date: purchase.purchasedAt }, ...s.transactions],
      orders: [{ id: "ORD-" + Date.now(), user: (s.auth && s.auth.email) || "user", type: "Pre-Verified Account", platform: product.platform, amount: product.price, status: "completed", date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...s.orders],
    }));
    alert("Purchase successful! View your accounts in My Purchases.");
  };

  if (view === "purchases") {
    return (
      <PageShell title="My Purchases" subtitle="All your purchased pre-verified accounts."
        actions={[<Btn key="back" variant="outline" onClick={() => setView("shop")}>← Back to Shop</Btn>]}>
        {purchases.length === 0 ? (
          <Card style={{ textAlign: "center", padding: "60px 32px" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🛒</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.g700, margin: "0 0 8px" }}>No Purchases Yet</h3>
            <p style={{ fontSize: 14, color: C.g400, margin: "0 0 20px" }}>Browse the marketplace and buy your first verified account.</p>
            <Btn onClick={() => setView("shop")}>Browse Accounts →</Btn>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {purchases.map(pur => <PurchaseCard key={pur.id} purchase={pur} />)}
          </div>
        )}
      </PageShell>
    );
  }

  if (view === "product" && selectedProduct) {
    const qty = getQty(selectedProduct.id);
    return (
      <PageShell title={selectedProduct.title} subtitle={`${selectedProduct.platform} · ${selectedProduct.type} · ${selectedProduct.country}`}
        actions={[
          <Btn key="back" variant="outline" onClick={() => setView("shop")}>← Back</Btn>,
          <Btn key="buy" onClick={() => buyProduct(selectedProduct)} disabled={qty === 0 || balance < selectedProduct.price}>
            {qty === 0 ? "Out of Stock" : balance < selectedProduct.price ? "Insufficient Balance" : `Buy Now $${selectedProduct.price}`}
          </Btn>,
        ]}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <PlatformIcon name={selectedProduct.platform} size={32} logo={selectedProduct.logo} />
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.g800 }}>{selectedProduct.title}</div>
                <div style={{ fontSize: 12, color: C.g400 }}>ID: {selectedProduct.id}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.g500, lineHeight: 1.7, marginBottom: 20 }}>{selectedProduct.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["Platform", selectedProduct.platform], ["Type", selectedProduct.type], ["Country", selectedProduct.country], ["Created", selectedProduct.created]].map(([k, v]) => (
                <div key={k} style={{ background: C.g50, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: C.g400, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.g800 }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <div style={{ fontSize: 12, color: C.g400, marginBottom: 4 }}>Price</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: C.primary, marginBottom: 12 }}>${selectedProduct.price}.00</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: qty > 0 ? C.green : C.red }} />
                <span style={{ fontSize: 13, color: C.g600 }}>{qty} in stock</span>
              </div>
              <Btn full onClick={() => buyProduct(selectedProduct)} disabled={qty === 0 || balance < selectedProduct.price}>
                {qty === 0 ? "Out of Stock" : balance < selectedProduct.price ? "Insufficient Balance" : "Buy Now"}
              </Btn>
            </Card>
            <Card>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800 }}>Delivery</h4>
              <div style={{ fontSize: 12, color: C.g500, lineHeight: 1.6 }}>Instant delivery after purchase. Credentials will appear in My Purchases.</div>
            </Card>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Pre-Verified Accounts"
      subtitle="Browse and purchase ready-to-use, pre-verified ad accounts."
      actions={[
        <Btn key="purchases" onClick={() => setView("purchases")}>◈ My Purchases ({purchases.length})</Btn>,
      ]}
    >
      <Card style={{ marginBottom: 20, padding: "14px 20px" }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 12, color: C.g400, marginBottom: 5, fontWeight: 600 }}>Platform</div>
            <select value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))} style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              {["All", "Meta", "Google", "TikTok", "Snapchat"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.g400, marginBottom: 5, fontWeight: 600 }}>Account Type</div>
            <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              {["All", "Aged", "New"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: C.g400, marginBottom: 5, fontWeight: 600 }}>Price Range</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input value={filters.min} onChange={e => setFilters(f => ({ ...f, min: e.target.value }))} placeholder="$ Min" style={{ width: 72, border: `1px solid ${C.g200}`, borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
              <span style={{ color: C.g300 }}>—</span>
              <input value={filters.max} onChange={e => setFilters(f => ({ ...f, max: e.target.value }))} placeholder="$ Max" style={{ width: 72, border: `1px solid ${C.g200}`, borderRadius: 8, padding: "9px 10px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <div style={{ fontSize: 12, color: C.g400, marginBottom: 5, fontWeight: 600 }}>Sort By</div>
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              {["Newest First", "Price: Low to High", "Price: High to Low"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {filtered.map(acc => {
          const qty = getQty(acc.id);
          return (
            <Card key={acc.id} onClick={() => { setSelectedProduct(acc); setView("product"); }} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <PlatformIcon name={acc.platform} size={26} logo={acc.logo} />
                <span style={{ background: acc.type === "Aged" ? C.greenL : C.blueL, color: acc.type === "Aged" ? C.green : C.blue, fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>{acc.type}</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 15, color: C.g800, marginBottom: 3 }}>{acc.title}</div>
              <div style={{ fontSize: 11, color: C.g400, marginBottom: 14 }}>{acc.country}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.g500, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: C.green, fontWeight: 800 }}>✓</span>Platform: {acc.platform}
                </div>
                <div style={{ fontSize: 12, color: C.g500, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: C.green, fontWeight: 800 }}>✓</span>{qty} in stock
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.primary }}>${acc.price}.00</span>
                <Btn size="sm" onClick={e => { e.stopPropagation(); buyProduct(acc); }} disabled={qty === 0 || balance < acc.price}>
                  {qty === 0 ? "Sold Out" : "Buy"}
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

function PurchaseCard({ purchase }) {
  const [revealed, setRevealed] = useState({ email: false, password: false, twofa: false });
  const copy = (text) => { navigator.clipboard && navigator.clipboard.writeText(text); alert("Copied to clipboard!"); };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <PlatformIcon name={purchase.platform} size={24} />
        <Badge status="completed" />
      </div>
      <div style={{ fontWeight: 900, fontSize: 15, color: C.g800, marginBottom: 3 }}>{purchase.productTitle}</div>
      <div style={{ fontSize: 11, color: C.g400, marginBottom: 14 }}>{purchase.purchasedAt}</div>
      {[["Email", purchase.email, "email"], ["Password", purchase.password, "password"], ["2FA", purchase.twofa, "twofa"]].map(([label, value, key]) => (
        <div key={key} style={{ background: C.g50, borderRadius: 9, padding: "10px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: C.g400, width: 60 }}>{label}</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: C.g700, flex: 1 }}>
            {revealed[key] ? value : "••••••••••••"}
          </div>
          <button onClick={() => setRevealed(r => ({ ...r, [key]: !r[key] }))} style={{ background: C.g100, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>{revealed[key] ? "Hide" : "Reveal"}</button>
          <button onClick={() => copy(value)} style={{ background: C.primaryLight, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: C.primary, fontWeight: 700 }}>Copy</button>
        </div>
      ))}
    </Card>
  );
}
