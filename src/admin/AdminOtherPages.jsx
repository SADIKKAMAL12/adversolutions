import { useState, useEffect, useCallback } from 'react';
import { C, getThemeColors, PLATFORMS } from '../shared/theme.js';
import { PageShell } from '../shared/UI.jsx';
import { Card, PlatformIcon, Badge, Btn, Input, Select, DataTable, Modal, Pagination, Avatar } from '../shared/UI.jsx';
import { useTheme } from '../shared/ThemeContext.jsx';
/* ═══════════════════════════════════════════════════
   API HELPERS
═══════════════════════════════════════════════════ */
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams({ table, ...params }).toString();
  const res = await fetch(`/api/crud?${qs}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { console.error('Non-JSON:', text.slice(0,200)); return []; }
}

async function apiPost(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

async function apiPut(table, body) {
  const res = await fetch(`/api/crud?table=${table}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('Non-JSON response: ' + text.slice(0, 200)); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/* ═══════════════════════════════════════════════════
   ADMIN INVENTORY PAGE
═══════════════════════════════════════════════════ */
export function AdminInventoryPage({ products, lines, setStore }) {
  const [view, setView] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bulkInput, setBulkInput] = useState("");
  const [newProduct, setNewProduct] = useState({ title: "", platform: "Meta", customPlatform: "", type: "Aged", price: "", country: "", description: "" });
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refetch data
  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, linesData] = await Promise.all([
        apiGet('inventory_products'),
        apiGet('inventory_lines'),
      ]);
      setStore(s => ({
        ...s,
        inventoryProducts: productsData || s.inventoryProducts,
        inventoryLines: linesData || s.inventoryLines,
      }));
    } catch (err) {
      console.error('Refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  // Note: refetch is now manual-only (via button) to avoid overwriting local changes on mount

  if (view === "add") {
    const saveProduct = async () => {
      if (!newProduct.title || !newProduct.price) return;
      setSaving(true);
      setError("");
      try {
        const productId = `prod-${Date.now()}`;
        const resolvedPlatform = newProduct.platform === "Other" ? (newProduct.customPlatform || "Other") : newProduct.platform;
        const product = {
          id: productId,
          title: newProduct.title,
          platform: resolvedPlatform,
          type: newProduct.type,
          price: Number(newProduct.price),
          country: newProduct.country || "",
          description: newProduct.description || "",
          logo: logoPreview || null,
          created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        };

        const parsedLines = bulkInput.trim().split("\n").map((line, i) => {
          const parts = line.split("|").map(p => p.trim());
          return {
            id: `l-${Date.now()}-${i}`,
            product_id: productId,
            email: parts[0] || "",
            password: parts[1] || "",
            twofa: parts[2] || "",
            status: "available"
          };
        }).filter(l => l.email);

        // Save to API
        await apiPost('inventory_products', product);
        if (parsedLines.length > 0) {
          await apiPost('inventory_lines', parsedLines);
        }

        // Update local store
        setStore(s => ({
          ...s,
          inventoryProducts: [product, ...s.inventoryProducts],
          inventoryLines: [...parsedLines.map(l => ({ ...l, productId: l.product_id })), ...s.inventoryLines]
        }));

        setView("list");
        setNewProduct({ title: "", platform: "Meta", customPlatform: "", type: "Aged", price: "", country: "", description: "" });
        setLogoPreview(null);
        setBulkInput("");
      } catch (err) {
        setError('Failed to save: ' + err.message);
        console.error('Save product error:', err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <PageShell breadcrumb="Dashboard › Pre-Verified Accounts › Add New Account" title="Add New Account"
        actions={[
          <Btn key="c" variant="outline" onClick={() => setView("list")}>✕ Cancel</Btn>,
          <Btn key="s" onClick={saveProduct} disabled={saving}>{saving ? 'Saving…' : '💾 Save Account'}</Btn>
        ]}>
        {error && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <Card>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800 }}>Product Information</h3>

            {/* Logo upload */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Product Logo <span style={{ color: C.g300, fontWeight: 400 }}>(500 × 500 px recommended)</span></div>
              <label style={{ cursor: "pointer" }}>
                <div style={{ width: 110, height: 110, border: `2px dashed ${logoPreview ? C.primary : C.g200}`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: logoPreview ? C.primaryLight : C.g50, overflow: "hidden", transition: "all .15s" }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <><div style={{ fontSize: 28, color: C.g300, marginBottom: 4 }}>↑</div><div style={{ fontSize: 11, color: C.g400, textAlign: "center", lineHeight: 1.4 }}>Upload<br/>Logo</div></>
                  }
                </div>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setLogoPreview(ev.target.result);
                  reader.readAsDataURL(file);
                }} />
              </label>
              {logoPreview && (
                <button onClick={() => setLogoPreview(null)} style={{ marginTop: 6, background: "none", border: "none", fontSize: 12, color: C.red, cursor: "pointer", padding: 0 }}>✕ Remove</button>
              )}
            </div>

            <Input label="Product Title" required value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Meta Aged Accounts (US)" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Select label="Platform" required value={newProduct.platform} onChange={e => setNewProduct(p => ({ ...p, platform: e.target.value }))}
                options={["Meta", "Google", "TikTok", "Snapchat", "Twitter", "LinkedIn", "Other"]} />
              <Select label="Account Type" required value={newProduct.type} onChange={e => setNewProduct(p => ({ ...p, type: e.target.value }))}
                options={["Aged", "Fresh"]} />
            </div>
            {newProduct.platform === "Other" && (
              <Input label="Platform Name" required value={newProduct.customPlatform} onChange={e => setNewProduct(p => ({ ...p, customPlatform: e.target.value }))} placeholder="e.g. Pinterest, Reddit…" />
            )}
            <Input label="Country" value={newProduct.country} onChange={e => setNewProduct(p => ({ ...p, country: e.target.value }))} placeholder="Any country" />
            <Input label="Price (USD)" required type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="120.00" />
          </Card>
          <Card>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800 }}>Product Description</h3>
            <textarea rows={10} value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Write a detailed description about this account type…"
              style={{ width: "100%", border: `1px solid ${C.g200}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
          </Card>
        </div>
        <Card>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800 }}>Bulk Add Inventory</h3>
          <div style={{ background: "#fff7ed", border: `1px solid ${C.yellow}40`, borderRadius: 9, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: C.yellow }}>⚠</span>
            <span style={{ fontSize: 13, color: "#92400e" }}>Each line = 1 account. Format: email | password | 2fa</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20 }}>
            <textarea rows={8} value={bulkInput} onChange={e => setBulkInput(e.target.value)}
              placeholder={`john.doe@gmail.com | Passw0rd@123 | J3K4 5G6H 7J8K\nalex.smith@gmail.com | Passw0rd@123 | L1M2 3N4O 5P6Q`}
              style={{ width: "100%", border: `1px solid ${C.g200}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "monospace", background: C.g50, outline: "none" }} />
            <div style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 12, padding: 18, width: 220 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: C.g700 }}>Notes</h4>
              {["Each account on its own line.", "Format: email | password | 2fa", "2FA: any format accepted", "Editable after saving."].map(n => (
                <div key={n} style={{ fontSize: 12, color: C.g500, marginBottom: 8, display: "flex", gap: 6 }}><span style={{ color: C.primary }}>•</span>{n}</div>
              ))}
            </div>
          </div>
        </Card>
      </PageShell>
    );
  }

  if (selectedProduct) {
    const productLines = lines.filter(l => l.productId === selectedProduct.id || l.product_id === selectedProduct.id);
    const cols = [
      { label: "ID", render: r => <span style={{ fontWeight: 800, color: C.primary, fontSize: 12 }}>{r.id}</span> },
      { label: "Email", render: r => <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, color: C.g500 }}>{r.email} <span style={{ cursor: "pointer" }}>👁</span></div> },
      { label: "Password", render: () => <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, color: C.g300 }}>••••••••••••<span style={{ cursor: "pointer" }}>👁</span></div> },
      { label: "2FA", render: () => <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 12, color: C.g300 }}>••••••••<span style={{ cursor: "pointer" }}>👁</span></div> },
      { label: "Status", render: r => <Badge status={r.status} /> },
      { label: "Actions", render: r => <div style={{ display: "flex", gap: 8 }}><span style={{ cursor: "pointer" }}>✏️</span><span style={{ cursor: "pointer", color: C.red }}>🗑</span></div> },
    ];
    return (
      <PageShell breadcrumb={`Dashboard › Pre-Verified Accounts › ${selectedProduct.title}`} title={selectedProduct.title}
        actions={[<Btn key="back" variant="outline" onClick={() => setSelectedProduct(null)}>← Back</Btn>, <Btn key="add" onClick={() => setView("add")}>+ Add Lines</Btn>]}>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, background: "#1877f210", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>ℳ</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>{selectedProduct.title}</h2>
                <Badge status="active" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[[`Platform: ${selectedProduct.platform}`, C.blueL], [`Type: ${selectedProduct.type}`, C.greenL], [`Country: ${selectedProduct.country || "Any"}`, "#ede9fe"]].map(([t, bg]) => (
                  <span key={t} style={{ background: bg, color: C.g600, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }}>
              {[["Total", productLines.length, C.g600], ["Available", productLines.filter(l => l.status === "available").length, C.green], ["Sold", productLines.filter(l => l.status === "sold").length, C.blue], ["Reserved", productLines.filter(l => l.status === "reserved").length, C.yellow]].map(([l, v, c]) => (
                <div key={l}><div style={{ fontSize: 11, color: C.g400, marginBottom: 4 }}>{l}</div><div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div></div>
              ))}
            </div>
          </div>
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <DataTable cols={cols} rows={productLines} />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumb="Dashboard › Pre-Verified Accounts" title="Inventory"
      actions={[
        <Btn key="e" variant="outline" onClick={refetch} disabled={loading}>{loading ? '↻ Loading…' : '↻ Refresh'}</Btn>,
        <Btn key="a" onClick={() => setView("add")}>+ Add Product</Btn>
      ]}>
      {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading inventory…</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Products", products.length, C.blue], ["Total Lines", lines.length, C.primary], ["Available", lines.filter(l => l.status === "available").length, C.green], ["Sold", lines.filter(l => l.status === "sold").length, C.blue]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div></Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {products.map(prod => {
          const qty = lines.filter(l => (l.productId === prod.id || l.product_id === prod.id) && l.status === "available").length;
          return (
            <Card key={prod.id} onClick={() => setSelectedProduct(prod)} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <PlatformIcon name={prod.platform} size={22} logo={prod.logo} />
                <span style={{ background: prod.type === "Aged" ? C.greenL : C.blueL, color: prod.type === "Aged" ? C.green : C.blue, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>{prod.type}</span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 14, color: C.g800, marginBottom: 3 }}>{prod.title}</div>
              <div style={{ fontSize: 11, color: C.g400, marginBottom: 10 }}>{prod.platform} · {prod.country || "Any"}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.primary }}>${prod.price}.00</span>
                <span style={{ fontSize: 12, color: qty > 0 ? C.green : C.red, fontWeight: 700 }}>{qty} in stock</span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN USERS PAGE
═══════════════════════════════════════════════════ */
export function AdminUsersPage({ users, setStore }) {
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || u.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('users', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, users: data }));
      }
    } catch (err) {
      console.error('Users refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cols = [
    { label: "", render: () => <input type="checkbox" />, style: { width: 40 } },
    { label: "User", render: r => <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar initials={r.name?.split(" ").map(w => w[0]).join("") || "?"} size={32} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div><div style={{ fontSize: 11, color: C.g400 }}>{r.email}</div></div></div> },
    { label: "Balance", render: r => <span style={{ fontWeight: 700, color: C.primary }}>${(r.balance || 0).toLocaleString()}.00</span> },
    { label: "Accounts", render: r => <span style={{ fontWeight: 700 }}>{r.accounts || 0}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Joined", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.joined}</span> },
    { label: "Actions", render: r => <div style={{ display: "flex", gap: 8 }}><span style={{ cursor: "pointer" }} onClick={() => setEditUser(r)}>✏️</span></div> },
  ];

  const saveUser = async (updated) => {
    setSaving(true);
    setError("");
    try {
      await apiPut('users', {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        balance: updated.balance,
        status: updated.status,
      });
      setStore(s => ({ ...s, users: s.users.map(u => u.id === updated.id ? updated : u) }));
      setEditUser(null);
    } catch (err) {
      setError('Failed to update user: ' + err.message);
      console.error('Save user error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Users" subtitle="Manage all platform users."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Users", users.length, C.blue], ["Active", users.filter(u => u.status === "active").length, C.green], ["Banned", users.filter(u => u.status === "banned").length, C.red], ["Pending", users.filter(u => u.status === "pending").length, C.yellow]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search users…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Active</option><option>Banned</option><option>Pending</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading users…</div>}
        <DataTable cols={cols} rows={filteredUsers} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredUsers.length} users`} showing={`1–${filteredUsers.length}`} pages={["‹", 1, 2, 3, "...", Math.ceil(filteredUsers.length / 10) || 1, "›"]} />
        </div>
      </Card>
      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <Input label="Name" value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} />
          <Input label="Email" value={editUser.email} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} />
          <Input label="Balance" type="number" value={editUser.balance} onChange={e => setEditUser(u => ({ ...u, balance: Number(e.target.value) }))} />
          <Select label="Status" value={editUser.status} onChange={e => setEditUser(u => ({ ...u, status: e.target.value }))} options={["active", "banned", "pending"]} />
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn variant="outline" onClick={() => setEditUser(null)}>Cancel</Btn>
            <Btn onClick={() => saveUser(editUser)} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN ORDERS PAGE
═══════════════════════════════════════════════════ */
export function AdminOrdersPage({ orders, setStore }) {
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !search || o.id?.toLowerCase().includes(search.toLowerCase()) || o.user?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || o.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('orders', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, orders: data }));
      }
    } catch (err) {
      console.error('Orders refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateStatus = async (id, newStatus) => {
    setSavingId(id);
    setError("");
    try {
      const order = orders.find(o => o.id === id);
      if (!order) return;

      await apiPut('orders', { id, status: newStatus });

      // If completed, mark associated inventory as sold
      if (newStatus === "completed") {
        const lines = await apiGet('inventory_lines', { status: 'available', limit: '1' });
        if (lines && lines.length > 0) {
          await apiPut('inventory_lines', { id: lines[0].id, status: 'sold' });
        }
      }

      setStore(s => ({ ...s, orders: s.orders.map(o => o.id === id ? { ...o, status: newStatus } : o) }));
    } catch (err) {
      setError('Failed to update order: ' + err.message);
      console.error('Update order error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const cols = [
    { label: "Order ID", render: r => <span style={{ fontWeight: 700, color: C.g700 }}>{r.id}</span> },
    { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{r.user_email || r.user}</span> },
    { label: "Type", render: r => <span style={{ fontSize: 12 }}>{r.type}</span> },
    { label: "Platform", render: r => <span style={{ fontSize: 12 }}>{r.platform}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 800, color: C.primary }}>${r.amount}.00</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.date}</span> },
    { label: "Actions", render: r => (
      <select
        value={r.status}
        disabled={savingId === r.id}
        onChange={e => updateStatus(r.id, e.target.value)}
        style={{ fontSize: 12, borderRadius: 6, border: `1px solid ${C.g200}`, padding: "4px 8px" }}
      >
        <option>pending</option><option>processing</option><option>completed</option><option>cancelled</option>
      </select>
    )},
  ];

  return (
    <PageShell title="Orders" subtitle="View and manage all platform orders."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Orders", orders.length, C.blue], ["Completed", orders.filter(o => o.status === "completed").length, C.green], ["Processing", orders.filter(o => o.status === "processing").length, C.yellow], ["Pending", orders.filter(o => o.status === "pending").length, C.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 24, fontWeight: 900, color: c }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search orders…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Completed</option><option>Processing</option><option>Pending</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading orders…</div>}
        <DataTable cols={cols} rows={filteredOrders} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredOrders.length} orders`} showing={`1–${filteredOrders.length}`} pages={["‹", 1, 2, 3, "...", Math.ceil(filteredOrders.length / 10) || 1, "›"]} />
        </div>
      </Card>
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN DEPOSITS PAGE
═══════════════════════════════════════════════════ */
export function AdminDepositsPage({ deposits, setStore, addBalance }) {
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");
  const [proofModal, setProofModal] = useState(null);

  const filteredDeposits = deposits.filter(d => {
    const matchesSearch = !search || d.id?.toLowerCase().includes(search.toLowerCase()) || d.user?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || d.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet('deposits', { order: 'created_at', ascending: 'false' });
      if (data && data.length > 0) {
        setStore(s => ({ ...s, deposits: data }));
      }
    } catch (err) {
      console.error('Deposits refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const approve = async (id) => {
    const dep = deposits.find(d => d.id === id);
    if (!dep || !dep.user_id) return;

    setLoadingId(id);
    setError("");
    try {
      const res = await fetch('/api/admin/deposits/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId: id, userId: dep.user_id, amount: dep.amount }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Approval failed');

      if (dep) addBalance(dep.amount);
      setStore(s => ({ ...s, deposits: s.deposits.map(d => d.id === id ? { ...d, status: "completed" } : d) }));
    } catch (err) {
      setError('Approval failed: ' + err.message);
      console.error('Approve deposit error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const reject = async (id) => {
    setLoadingId(id);
    setError("");
    try {
      await apiPut('deposits', { id, status: 'rejected' });
      setStore(s => ({ ...s, deposits: s.deposits.map(d => d.id === id ? { ...d, status: "rejected" } : d) }));
    } catch (err) {
      setError('Rejection failed: ' + err.message);
      console.error('Reject deposit error:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const cols = [
    { label: "Deposit ID", render: r => <span style={{ fontWeight: 700, color: C.primary, fontSize: 12 }}>{r.id}</span> },
    { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{r.user_email || r.user}</span> },
    { label: "Method", render: r => <span style={{ fontSize: 12 }}>{r.method}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 900, color: C.green }}>${r.amount?.toFixed ? r.amount.toFixed(2) : r.amount}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Proof", render: r => r.proof && r.proof.startsWith('data:image')
      ? <img src={r.proof} alt="proof" onClick={() => setProofModal(r.proof)} style={{ height: 36, borderRadius: 4, cursor: "pointer", objectFit: "cover", border: `1px solid ${C.g200}` }} />
      : <span style={{ fontSize: 12, color: C.g400 }}>{r.proof || "—"}</span>
    },
    { label: "Date", render: r => <span style={{ fontSize: 12, color: C.g400 }}>{r.date}</span> },
    { label: "Actions", render: r => r.status === "pending"
      ? <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="success" size="sm" onClick={() => approve(r.id)} disabled={loadingId === r.id}>{loadingId === r.id ? '…' : '✓ Approve'}</Btn>
        <Btn variant="danger" size="sm" onClick={() => reject(r.id)} disabled={loadingId === r.id}>✕ Reject</Btn>
      </div>
      : <Badge status={r.status} />
    },
  ];

  const pending = deposits.filter(d => d.status === "pending");

  return (
    <PageShell title="Deposits" subtitle="Review and approve user deposit requests."
      actions={[<Btn key="exp" variant="outline">↑ Export</Btn>]}>
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      {pending.length > 0 && (
        <div style={{ background: C.yellowL, border: `1px solid ${C.yellow}40`, borderRadius: 12, padding: "14px 20px", marginBottom: 22, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div><strong style={{ color: "#92400e" }}>{pending.length} deposit{pending.length > 1 ? "s" : ""} pending review</strong><div style={{ fontSize: 13, color: "#a16207", marginTop: 2 }}>Review and approve or reject the deposits below.</div></div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
        {[["Total Deposits", `$${deposits.reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.blue], ["Approved", `$${deposits.filter(d => d.status === "completed").reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.green], ["Pending", `$${pending.reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.yellow], ["Rejected", `$${deposits.filter(d => d.status === "rejected").reduce((a, d) => a + (d.amount || 0), 0).toLocaleString()}`, C.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 12, color: C.g400, marginBottom: 6 }}>{l}</div><div style={{ fontSize: 20, fontWeight: 900, color: c }}>{v}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <input placeholder="🔍 Search deposits…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            <option>All Status</option><option>Pending</option><option>Completed</option><option>Rejected</option>
          </select>
          <Btn variant="outline" size="sm" onClick={refetch} disabled={loading}>{loading ? '↻' : '↻ Refresh'}</Btn>
        </div>
        {loading && <div style={{ textAlign: "center", padding: "20px", color: C.g400, fontSize: 14 }}>Loading deposits…</div>}
        <DataTable cols={cols} rows={filteredDeposits} />
        <div style={{ marginTop: 14 }}>
          <Pagination total={`${filteredDeposits.length} deposits`} showing={`1–${filteredDeposits.length}`} pages={["‹", 1, 2, "›"]} />
        </div>
      </Card>
      {proofModal && (
        <div onClick={() => setProofModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "relative" }}>
            <button onClick={() => setProofModal(null)} style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.3)", zIndex: 1 }}>✕</button>
            <img src={proofModal} alt="Proof of payment" style={{ maxWidth: "88vw", maxHeight: "88vh", borderRadius: 12, objectFit: "contain", display: "block" }} />
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN TICKETS PAGE
═══════════════════════════════════════════════════ */
export function AdminTicketsPage({ tickets }) {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === "All Status") return true;
    return t.status === statusFilter.toLowerCase();
  });

  return (
    <PageShell title="Support Tickets" subtitle="Manage user support requests.">
      {tickets.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "60px 32px" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💬</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.g700 }}>No Tickets Yet</h3>
          <p style={{ fontSize: 14, color: C.g400, marginTop: 8 }}>All caught up!</p>
        </Card>
      ) : (
        <Card>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              <option>All Status</option><option>Open</option><option>Closed</option>
            </select>
          </div>
          {filteredTickets.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.g100}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.g800 }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{t.user_email} · {t.created_at ? new Date(t.created_at).toLocaleDateString() : ''}</div>
                <div style={{ fontSize: 13, color: C.g500, marginTop: 4 }}>{t.message}</div>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </Card>
      )}
    </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN REPORTS PAGE
═══════════════════════════════════════════════════ */
export function AdminReportsPage() {
  return (
    <PageShell title="Reports" subtitle="Platform analytics and reporting.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Revenue Overview</h3>
          <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 6 }}>
            {[40, 65, 50, 80, 70, 90, 100].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h * 1.3, background: C.primary + "25", borderRadius: "4px 4px 0 0" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d} style={{ fontSize: 10, color: C.g400 }}>{d}</span>)}
          </div>
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>User Growth</h3>
          <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 6 }}>
            {[30, 45, 40, 60, 55, 75, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h * 1.3, background: C.blue + "25", borderRadius: "4px 4px 0 0" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <span key={d} style={{ fontSize: 10, color: C.g400 }}>{d}</span>)}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}

const SETTINGS_KEY = 'adver_settings_v1';

function loadSettings() {
  try { const raw = localStorage.getItem(SETTINGS_KEY); if (raw) return JSON.parse(raw); } catch (e) {}
  return null;
}

function saveSettings(paymentMethods, businessTypes) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ paymentMethods, businessTypes })); } catch (e) {}
}

/* ═══════════════════════════════════════════════════
   ADMIN SETTINGS PAGE
═══════════════════════════════════════════════════ */
export function AdminSettingsPage({ paymentMethods, businessTypes, setStore }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingMethod, setEditingMethod] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load from localStorage on mount, fallback to props
  const [methods, setMethods] = useState(() => {
    const local = loadSettings();
    return local?.paymentMethods || paymentMethods;
  });
  const [bizTypes, setBizTypes] = useState(() => {
    const local = loadSettings();
    return (local?.businessTypes || businessTypes).join("\n");
  });

  // Persist to localStorage + global store whenever methods or bizTypes change
  useEffect(() => {
    const btArray = bizTypes.split("\n").map(t => t.trim()).filter(Boolean);
    saveSettings(methods, btArray);
    setStore(s => ({ ...s, paymentMethods: methods, businessTypes: btArray }));
  }, [methods, bizTypes, setStore]);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const [pmRes, btRes] = await Promise.all([
        fetch('/api/admin/payment-methods'),
        fetch('/api/admin/business-types'),
      ]);
      const pmData = pmRes.ok ? await pmRes.json() : null;
      const btData = btRes.ok ? await btRes.json() : null;
      if (pmData && Array.isArray(pmData)) setMethods(pmData);
      if (btData && Array.isArray(btData)) setBizTypes(btData.join("\n"));
    } catch (err) {
      console.error('Settings refetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refetch on mount to sync with Supabase (overwrites local)
  useEffect(() => {
    refetch();
  }, [refetch]);

  const saveBizTypes = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updatedBizTypes = bizTypes.split("\n").map(t => t.trim()).filter(Boolean);
      try {
        await fetch('/api/admin/business-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: updatedBizTypes }),
        });
      } catch (dbErr) {
        console.warn('Business types API save failed:', dbErr.message);
      }
      setSuccess("Business types saved!");
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async (id) => {
    const updated = methods.map(x => x.id === id ? { ...x, active: !x.active } : x);
    const method = updated.find(x => x.id === id);
    setMethods(updated);
    try {
      await fetch('/api/admin/payment-methods', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: method.active }),
      });
    } catch (e) {}
  };

  const saveMethod = async (methodData) => {
    setSaving(true);
    setError("");
    try {
      let saved = null;
      const isExisting = methodData.id && methods.find(m => m.id === methodData.id);
      try {
        const res = await fetch('/api/admin/payment-methods', {
          method: isExisting ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(methodData),
        });
        if (res.ok) {
          const json = await res.json();
          saved = json;
        }
      } catch (dbErr) {
        console.warn('API save failed, using local state:', dbErr.message);
      }
      const finalMethod = saved || methodData;
      const updated = isExisting
        ? methods.map(m => m.id === methodData.id ? finalMethod : m)
        : [...methods, finalMethod];
      setMethods(updated);
      setEditingMethod(null);
      setShowAddModal(false);
      setSuccess("Payment method saved!");
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMethod = async (id) => {
    if (!confirm('Delete this payment method?')) return;
    setSaving(true);
    try {
      try {
        await fetch(`/api/admin/payment-methods?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
      } catch (dbErr) {}
      const updated = methods.filter(m => m.id !== id);
      setMethods(updated);
      setSuccess("Payment method deleted!");
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="System Settings" subtitle="Configure platform settings.">
      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>
      )}
      {success && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>
      )}

      {/* Payment Methods */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: TC.g800 }}>Payment Methods</h3>
          <Btn size="sm" onClick={() => setShowAddModal(true)}>+ Add Method</Btn>
        </div>
        {methods.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${TC.g100}` }}>
            <div onClick={() => toggleMethod(m.id)} style={{ width: 36, height: 20, borderRadius: 10, background: m.active ? C.primary : TC.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: m.active ? 18 : 2, transition: "all .2s" }} />
            </div>
            <div style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.logo && m.logo.startsWith('data:') ? (
                <img src={m.logo} alt="" style={{ width: 28, height: 28, objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: 20 }}>{m.logo || "💳"}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: TC.g800 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: TC.g400 }}>{m.bank_name} · {(m.fields || []).map(f => `${f.label}: ${f.value}`).join(" · ")}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setEditingMethod(m)} style={{ background: TC.g100, border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: TC.g600 }}>Edit</button>
              <button onClick={() => deleteMethod(m.id)} style={{ background: C.redL, border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: C.red }}>Delete</button>
            </div>
          </div>
        ))}
      </Card>

      {/* Business Types */}
      <Card>
        <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 800, color: TC.g800 }}>Business Types</h3>
        <p style={{ fontSize: 13, color: TC.g500, marginBottom: 12 }}>One per line. These appear in signup and ad account forms.</p>
        <textarea rows={8} value={bizTypes} onChange={e => setBizTypes(e.target.value)}
          style={{ width: "100%", border: `1px solid ${TC.g200}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 16, background: TC.card, color: TC.g800 }} />
        <Btn onClick={saveBizTypes} disabled={saving}>{saving ? 'Saving…' : '💾 Save Business Types'}</Btn>
      </Card>

      {/* Edit/Add Modal */}
      {(editingMethod || showAddModal) && (
        <PaymentMethodModal
          method={editingMethod}
          onSave={saveMethod}
          onClose={() => { setEditingMethod(null); setShowAddModal(false); }}
          saving={saving}
        />
      )}
    </PageShell>
  );
}

function PaymentMethodModal({ method, onSave, onClose, saving }) {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const isEdit = !!method;
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [logo, setLogo] = useState("💳");
  const [fields, setFields] = useState([{ label: "", value: "" }]);

  // Reset state when method prop changes
  useEffect(() => {
    setName(method?.name || "");
    setBankName(method?.bank_name || "");
    setLogo(method?.logo || "💳");
    setFields(method?.fields?.length ? method.fields : [{ label: "", value: "" }]);
  }, [method]);

  const addField = () => setFields(f => [...f, { label: "", value: "" }]);
  const removeField = (i) => setFields(f => f.filter((_, idx) => idx !== i));
  const updateField = (i, key, val) => setFields(f => f.map((fld, idx) => idx === i ? { ...fld, [key]: val } : fld));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim() || !bankName.trim()) return;
    const validFields = fields.filter(f => f.label.trim() && f.value.trim());
    onSave({
      id: method?.id || `pm-${Date.now()}`,
      name: name.trim(),
      bank_name: bankName.trim(),
      logo: logo || "💳",
      account: validFields[0]?.value || "",
      active: method?.active ?? true,
      fields: validFields,
    });
  };

  return (
    <Modal title={isEdit ? "Edit Payment Method" : "Add Payment Method"} onClose={onClose} width={520}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 6, fontWeight: 600 }}>Display Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Payoneer"
          style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 6, fontWeight: 600 }}>Bank / Provider Name *</label>
        <input value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Payoneer Inc."
          style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 6, fontWeight: 600 }}>Logo (PNG/JPG image)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logo && logo.startsWith('data:') ? (
            <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, border: `1px solid ${TC.g200}` }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 8, border: `1px solid ${TC.g200}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: TC.g50 }}>{logo || "💳"}</div>
          )}
          <div style={{ flex: 1 }}>
            <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileUpload}
              style={{ width: "100%", fontSize: 13, color: TC.g600 }} />
          </div>
          {logo && (
            <button onClick={() => setLogo('')} style={{ background: "none", border: "none", color: C.red, fontSize: 12, cursor: "pointer" }}>Remove</button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: TC.g600, fontWeight: 600 }}>Payment Details</label>
          <button onClick={addField} style={{ background: "none", border: "none", color: C.primary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add field</button>
        </div>
        {fields.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input value={f.label} onChange={e => updateField(i, "label", e.target.value)} placeholder="Label (e.g. Email)"
              style={{ flex: 1, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
            <input value={f.value} onChange={e => updateField(i, "value", e.target.value)} placeholder="Value"
              style={{ flex: 2, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "10px 14px", fontSize: 13, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }} />
            {fields.length > 1 && (
              <button onClick={() => removeField(i)} style={{ background: "none", border: "none", color: C.red, fontSize: 16, cursor: "pointer", padding: "0 4px" }}>✕</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <Btn variant="outline" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={saving || !name.trim() || !bankName.trim()}>
          {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Method')}
        </Btn>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN AGENCY AD ACCOUNTS PAGE
═══════════════════════════════════════════════════ */

const DEFAULT_PLATFORM_PRICES = Object.fromEntries(
  PLATFORMS.map(p => [p.id, { name: p.name, icon: p.icon, price: 50, fee: 6, minTopup: 200, active: true }])
);

export function AdminAgencyAdAccountsPage({ requests, users, setStore, platformPrices: propPrices }) {
  const [tab, setTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewRequest, setViewRequest] = useState(null);

  const [platformPrices, setPlatformPrices] = useState(DEFAULT_PLATFORM_PRICES);
  const [savingPrices, setSavingPrices] = useState(false);

  useEffect(() => {
    if (propPrices && Object.keys(propPrices).length > 0) {
      setPlatformPrices(() => {
        const merged = { ...DEFAULT_PLATFORM_PRICES };
        for (const id of Object.keys(merged)) {
          if (propPrices[id]) {
            merged[id] = {
              ...merged[id],
              price:    propPrices[id].price    ?? merged[id].price,
              fee:      propPrices[id].fee      ?? merged[id].fee,
              minTopup: propPrices[id].minTopup ?? merged[id].minTopup,
              active:   propPrices[id].active   ?? merged[id].active,
            };
          }
        }
        return merged;
      });
    }
  }, [propPrices]);

  const getUserEmail = (userId) => {
    const u = (users || []).find(u => u.id === userId);
    return u ? (u.email || u.name) : userId;
  };

  const filteredRequests = requests.filter(r => {
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchSearch = !search ||
      (r.account_name || r.accountName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.platform || "").toLowerCase().includes(search.toLowerCase()) ||
      getUserEmail(r.user_id).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = async (id, newStatus) => {
    setSavingId(id);
    setError("");
    try {
      await apiPut('ad_account_requests', { id, status: newStatus });
      setStore(s => ({
        ...s,
        adAccountRequests: s.adAccountRequests.map(r => r.id === id ? { ...r, status: newStatus } : r)
      }));
    } catch (err) {
      setError('Failed to update: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const savePrices = async () => {
    setSavingPrices(true);
    setError("");
    try {
      await Promise.all(
        Object.entries(platformPrices).map(([id, ps]) =>
          apiPut('platform_prices', { id, price: ps.price, fee: ps.fee, min_topup: ps.minTopup, active: ps.active })
        )
      );
      setStore(s => ({ ...s, platformPrices: Object.fromEntries(
        Object.entries(platformPrices).map(([id, ps]) => [id, { price: ps.price, fee: ps.fee, minTopup: ps.minTopup, active: ps.active }])
      )}));
      setSuccess("Platform settings saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSavingPrices(false);
    }
  };

  const updatePrice = (id, field, value) => {
    setPlatformPrices(p => ({ ...p, [id]: { ...p[id], [field]: value } }));
  };

  const STATUS_OPTIONS = ["pending", "in_review", "approved", "rejected"];

  const statCounts = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    in_review: requests.filter(r => r.status === "in_review").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const cols = [
    { label: "Account", render: r => (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.g800 }}>{r.account_name || r.accountName || "—"}</div>
        <div style={{ fontSize: 11, color: C.g400 }}>{r.requestId || r.id}</div>
      </div>
    )},
    { label: "User", render: r => <span style={{ fontSize: 12, color: C.g500 }}>{getUserEmail(r.user_id)}</span> },
    { label: "Platform", render: r => {
      const pl = PLATFORMS.find(p => p.id === r.platform);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PlatformIcon name={pl?.icon || r.platform} size={16} />
          <span style={{ fontSize: 12 }}>{pl?.name || r.platform}</span>
        </div>
      );
    }},
    { label: "Business", render: r => <span style={{ fontSize: 12, color: C.g600 }}>{r.business_type || r.businessType || "—"}</span> },
    { label: "Amount", render: r => <span style={{ fontWeight: 700, color: C.primary, fontSize: 13 }}>${r.amount || 52}.00</span> },
    { label: "Date", render: r => <span style={{ fontSize: 11, color: C.g400 }}>{r.submittedAt || (r.created_at ? new Date(r.created_at).toLocaleDateString() : "—")}</span> },
    { label: "Status", render: r => <Badge status={r.status} /> },
    { label: "Actions", render: r => (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={r.status}
          disabled={savingId === r.id}
          onChange={e => updateStatus(r.id, e.target.value)}
          style={{ fontSize: 12, borderRadius: 7, border: `1px solid ${C.g200}`, padding: "5px 8px", background: "#fff", cursor: "pointer" }}
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <button onClick={() => setViewRequest(r)}
          style={{ background: C.g100, border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: C.g600 }}>
          View
        </button>
      </div>
    )},
  ];

  return (
    <PageShell title="Agency Ad Accounts" subtitle="Manage requests and platform pricing.">
      {error && <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{success}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 22 }}>
        {[["Total", statCounts.total, C.blue], ["Pending", statCounts.pending, "#d97706"], ["In Review", statCounts.in_review, C.blue], ["Approved", statCounts.approved, C.green], ["Rejected", statCounts.rejected, C.red]].map(([l, v, c]) => (
          <Card key={l}><div style={{ fontSize: 11, color: C.g400, marginBottom: 5 }}>{l}</div><div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div></Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: C.g100, borderRadius: 10, padding: 4, width: "fit-content" }}>
        {[["requests", "📋 Requests"], ["platforms", "⚙ Platform Settings"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit",
              background: tab === key ? "#fff" : "transparent",
              color: tab === key ? C.g800 : C.g400,
              boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,.08)" : "none",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Requests Tab ── */}
      {tab === "requests" && (
        <Card>
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <input placeholder="🔍 Search by account, user, platform…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
          <DataTable cols={cols} rows={filteredRequests} emptyMsg="No ad account requests yet." />
        </Card>
      )}

      {/* ── Platform Settings Tab ── */}
      {tab === "platforms" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
            {PLATFORMS.map(p => {
              const ps = platformPrices[p.id] || DEFAULT_PLATFORM_PRICES[p.id];
              return (
                <Card key={p.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: C.g50, border: `1px solid ${C.g200}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PlatformIcon name={p.icon} size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.g800 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: C.g400 }}>{p.sub}</div>
                    </div>
                    {/* Active toggle */}
                    <div onClick={() => updatePrice(p.id, "active", !ps.active)}
                      style={{ width: 40, height: 22, borderRadius: 11, background: ps.active ? C.primary : C.g300, cursor: "pointer", position: "relative", transition: "all .2s", flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: ps.active ? 20 : 2, transition: "all .2s" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Service Price (USD)</div>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.g400, fontSize: 14, fontWeight: 700 }}>$</span>
                        <input type="number" value={ps.price} min={0}
                          onChange={e => updatePrice(p.id, "price", Number(e.target.value))}
                          style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 12px 10px 24px", fontSize: 14, fontWeight: 700, color: C.g800, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Min. Top-up (USD)</div>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.g400, fontSize: 14, fontWeight: 700 }}>$</span>
                        <input type="number" value={ps.minTopup ?? 200} min={0}
                          onChange={e => updatePrice(p.id, "minTopup", Number(e.target.value))}
                          style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 12px 10px 24px", fontSize: 14, fontWeight: 700, color: C.g800, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 6 }}>Top-up Fee (%)</div>
                      <div style={{ position: "relative" }}>
                        <input type="number" value={ps.fee} min={0} max={100}
                          onChange={e => updatePrice(p.id, "fee", Number(e.target.value))}
                          style={{ width: "100%", border: `1.5px solid ${C.g200}`, borderRadius: 9, padding: "10px 30px 10px 12px", fontSize: 14, fontWeight: 700, color: C.g800, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.g400, fontSize: 14, fontWeight: 700 }}>%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, background: C.g50, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.g500 }}>
                    User pays: <strong style={{ color: C.g800 }}>${ps.price}</strong> service + topup amount + <strong style={{ color: C.primary }}>{ps.fee}%</strong> fee on topup
                  </div>
                  {!ps.active && (
                    <div style={{ marginTop: 10, background: C.redL, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.red, fontWeight: 700, textAlign: "center" }}>
                      Hidden from users
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          <Btn onClick={savePrices} disabled={savingPrices}>
            {savingPrices ? "Saving…" : "💾 Save Platform Settings"}
          </Btn>
        </>
      )}

      {/* Request Detail Modal */}
      {viewRequest && (
        <Modal title="Request Details" onClose={() => setViewRequest(null)} width={500}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Request ID", viewRequest.requestId || viewRequest.id],
              ["Account Name", viewRequest.account_name || viewRequest.accountName],
              ["User", getUserEmail(viewRequest.user_id)],
              ["Platform", PLATFORMS.find(p => p.id === viewRequest.platform)?.name || viewRequest.platform],
              ["Business Type", viewRequest.business_type || viewRequest.businessType],
              ["Business Name", viewRequest.business_name || viewRequest.businessName],
              ["Email", viewRequest.business_email || viewRequest.email],
              ["Timezone", viewRequest.timezone],
              ["Currency", viewRequest.currency],
              ["BM ID", viewRequest.bm_id || viewRequest.bmId],
              ["Amount", `$${viewRequest.amount || 52}.00`],
              ["Submitted", viewRequest.submittedAt || (viewRequest.created_at ? new Date(viewRequest.created_at).toLocaleString() : "—")],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.g100}`, fontSize: 13 }}>
                <span style={{ color: C.g500, fontWeight: 600 }}>{k}</span>
                <span style={{ fontWeight: 700, color: C.g700, textAlign: "right", maxWidth: 260 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 12, color: C.g500, fontWeight: 600, marginBottom: 8 }}>Update Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => { updateStatus(viewRequest.id, s); setViewRequest(r => ({ ...r, status: s })); }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${viewRequest.status === s ? C.primary : C.g200}`, background: viewRequest.status === s ? C.primaryLight : "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: viewRequest.status === s ? C.primary : C.g600 }}>
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
