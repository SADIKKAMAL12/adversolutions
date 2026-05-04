import { createContext, useContext, useCallback } from 'react'
import bcrypt from 'bcryptjs'
// Auth no longer depends on Supabase client — uses API endpoints
import { useStore, setStore, getSession, setSession } from './store.js'

const DEMO_USERS = [
  { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "John Doe",       email: "john.doe@example.com",   password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", role: "user",   status: "active", balance: 1240 },
  { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "William Smith",  email: "william@example.com",    password_hash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", role: "user",   status: "active", balance: 850 },
  { id: "c9d0e1f2-a3b4-5678-c345-789012345678", name: "Super Admin",    email: "admin@adversolutions.com", password_hash: "$2b$10$IHLMQQNvKH3hWB58Ej1MEO.Fmmish7e9iLHBy1tD38q1FhF42HiXW", role: "admin",  status: "active", balance: 0 },
];

const AuthContext = createContext({ user: null, login: () => {}, logout: () => {}, register: () => {} });

export function AuthProvider({ children }) {
  const [store, setLocalStore] = useStore();
  const user = store.auth;

  const login = useCallback(async (email, password) => {
    // Check demo users first — these always work regardless of Supabase state
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (demoUser) {
      const valid = await bcrypt.compare(password, demoUser.password_hash);
      if (!valid) {
        throw new Error('Invalid email or password');
      }
      // Use demo user data (override any Supabase data for demo accounts)
      const data = demoUser;
      const session = {
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
        }
      };
      setSession(session);
      setLocalStore(s => ({
        ...s,
        auth: { ...data, role: data.role },
        balance: parseFloat(data.balance) || 0,
      }));
      return data;
    }

    // Non-demo users: query API
    let data = null;
    try {
      const res = await fetch(`/api/crud?table=users&email=${encodeURIComponent(email)}&single=true`);
      const json = await res.json();
      if (res.ok && json && !json.error) data = json;
    } catch (apiErr) {
      console.warn('API login error:', apiErr.message);
    }

    if (!data) {
      throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const session = {
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
      }
    };

    setSession(session);
    setLocalStore(s => ({
      ...s,
      auth: { ...data, role: data.role },
      balance: parseFloat(data.balance) || 0,
    }));

    return data;
  }, [setLocalStore]);

  const register = useCallback(async (name, email, password) => {
    // Check if email already exists via API
    try {
      const checkRes = await fetch(`/api/crud?table=users&email=${encodeURIComponent(email)}&single=true`);
      const existing = await checkRes.json();
      if (existing && !existing.error) {
        throw new Error('Email already registered');
      }

      const password_hash = await bcrypt.hash(password, 10);

      const res = await fetch('/api/crud?table=users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password_hash,
          role: 'user',
          status: 'active',
          balance: 0,
          accounts: 0,
          joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed');
      }

      const session = {
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
        }
      };

      setSession(session);
      setLocalStore(s => ({
        ...s,
        auth: { ...data, role: data.role },
        balance: parseFloat(data.balance) || 0,
      }));

      return data;
    } catch (err) {
      if (err.message === 'Email already registered') throw err;
      console.warn('API register error:', err.message);
    }

    // Fallback demo mode
      // Demo mode: just log in the user locally
      const demoUser = {
        id: "demo-" + Date.now(),
        name,
        email,
        role: "user",
        status: "active",
        balance: 0,
      };
      const session = { user: { id: demoUser.id, name, email, role: "user", status: "active" } };
      setSession(session);
      setLocalStore(s => ({
        ...s,
        auth: demoUser,
        balance: 0,
      }));
      return demoUser;
  }, [setLocalStore]);

  const logout = useCallback(() => {
    setSession(null);
    setLocalStore(s => ({ ...s, auth: null }));
    window.location.hash = "/login";
  }, [setLocalStore]);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
