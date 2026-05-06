import { useCallback, useEffect, useState } from 'react';
import { Router, Route, useNavigate } from './shared/Router.jsx';
import { AuthProvider, useAuth } from './shared/AuthContext.jsx';
import { ThemeProvider, useTheme } from './shared/ThemeContext.jsx';
import { getThemeColors } from './shared/theme.js';
import { useStore, setStore, hydrateStore } from './shared/store.js';
import { Sidebar, TopBar } from './shared/Layout.jsx';
import UserLoginPage from './user/UserLoginPage.jsx';
import RegisterPage from './user/RegisterPage.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import AgencyAdAccountsPage from './user/AgencyAdAccountsPage.jsx';
import PreVerifiedPage from './user/PreVerifiedPage.jsx';
import { SupportPage } from './user/ProjectsAndSupport.jsx'
import PurchaseHistoryPage from './user/PurchaseHistoryPage.jsx';
import BalancePage from './user/BalancePage.jsx';
import AdminLoginPage from './user/AdminLoginPage.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import { AdminUsersPage, AdminInventoryPage, AdminOrdersPage, AdminDepositsPage, AdminTicketsPage, AdminReportsPage, AdminSettingsPage, AdminAgencyAdAccountsPage } from './admin/AdminOtherPages.jsx';
import AdminWhatsAppPage from './admin/AdminWhatsAppPage.jsx';

function ThemedMain({ children, role }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const TC = getThemeColors(isDark);
  return (
    <main style={{
      flex: 1,
      overflowY: "auto",
      background: TC.bg,
      color: TC.text,
      transition: "background .2s, color .2s",
    }}>
      {children}
    </main>
  );
}

function AppRoutes() {
  const [store, setStore] = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateStore().then(() => setLoading(false));
  }, []);

  const addTransaction = useCallback((tx) => {
    setStore(s => ({
      ...s,
      transactions: [tx, ...s.transactions]
    }));
  }, [setStore]);

  const addBalance = useCallback((amount) => {
    setStore(s => ({
      ...s,
      balance: s.balance + amount
    }));
  }, [setStore]);

  useEffect(() => {
    if (loading) return; // wait for hydration before any redirect
    const hash = window.location.hash.slice(1) || "/";
    if (!user) {
      if (!hash.startsWith("/login") && !hash.startsWith("/register") && !hash.startsWith("/admin/login")) {
        window.location.hash = "/login";
      }
    } else {
      if (hash === "/login" || hash === "/register" || hash === "/admin/login") {
        window.location.hash = user.role === "admin" ? "/admin" : "/dashboard";
      }
      if (user.role !== "admin" && hash.startsWith("/admin")) {
        window.location.hash = "/dashboard";
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Sora',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#E8192C', marginBottom: 16 }}>ADVER<span style={{ background: '#E8192C', color: '#fff', padding: '4px 12px', borderRadius: 30 }}>SOLUTIONS</span></div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/" element={<UserLoginPage />} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Sora',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <Sidebar role={user.role} logout={logout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar role={user.role} user={user} balance={store.balance} />
        <ThemedMain role={user.role}>
          {user.role === "user" && (
            <>
              <Route path="/dashboard" element={<UserDashboard balance={store.balance} transactions={store.transactions} />} />
              <Route path="/agency-ad-accounts" element={<AgencyAdAccountsPage balance={store.balance} requests={store.adAccountRequests} setStore={setStore} platformPrices={store.platformPrices} />} />
              <Route path="/preverified-accounts" element={<PreVerifiedPage products={store.inventoryProducts} lines={store.inventoryLines} balance={store.balance} purchases={store.purchases} setStore={setStore} />} />
              <Route path="/purchase-history" element={<PurchaseHistoryPage purchases={store.purchases} />} />
              <Route path="/balance" element={<BalancePage balance={store.balance} transactions={store.transactions} paymentMethods={store.paymentMethods} addTransaction={addTransaction} addBalance={addBalance} setStore={setStore} />} />
              <Route path="/support" element={<SupportPage tickets={store.supportTickets} setStore={setStore} />} />
              <Route path="/" element={<UserDashboard balance={store.balance} transactions={store.transactions} />} />
            </>
          )}
          {user.role === "admin" && (
            <>
              <Route path="/admin" element={<AdminDashboard users={store.users} orders={store.orders} deposits={store.deposits} />} />
              <Route path="/admin/users" element={<AdminUsersPage users={store.users} setStore={setStore} />} />
              <Route path="/admin/inventory" element={<AdminInventoryPage products={store.inventoryProducts} lines={store.inventoryLines} setStore={setStore} />} />
              <Route path="/admin/orders" element={<AdminOrdersPage orders={store.orders} setStore={setStore} />} />
              <Route path="/admin/deposits" element={<AdminDepositsPage deposits={store.deposits} setStore={setStore} addBalance={addBalance} />} />
              <Route path="/admin/tickets" element={<AdminTicketsPage tickets={store.supportTickets} />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/agency-accounts" element={<AdminAgencyAdAccountsPage requests={store.adAccountRequests} users={store.users} setStore={setStore} platformPrices={store.platformPrices} />} />
              <Route path="/admin/settings" element={<AdminSettingsPage paymentMethods={store.paymentMethods} businessTypes={store.businessTypes} setStore={setStore} />} />
              <Route path="/admin/whatsapp" element={<AdminWhatsAppPage />} />
              <Route path="/" element={<AdminDashboard users={store.users} orders={store.orders} deposits={store.deposits} />} />
            </>
          )}
        </ThemedMain>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
