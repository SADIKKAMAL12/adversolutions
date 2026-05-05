import { useState, useEffect } from 'react'
import {
  fetchUsers, fetchTransactions, fetchInventoryProducts, fetchInventoryLines,
  fetchOrders, fetchDeposits, fetchMediaBuyers, fetchPaymentMethods,
  fetchBusinessTypes, fetchTickets, fetchAdAccountRequests, fetchPurchases,
  fetchProjects, fetchAnnouncements, fetchPlatformPrices
} from '../lib/db.js'


const STORAGE_KEY = "adver_auth_v1";

const DEMO_STORE = {
  auth: null,
  balance: 1240.00,
  transactions: [
    { id: 1, type: "Deposit",      method: "Payoneer",       amount:  350,  status: "pending",   date: "May 19, 2024 10:30 AM" },
    { id: 2, type: "Deposit",      method: "USDT (TRC20)",   amount:  200,  status: "completed", date: "May 17, 2024 08:15 PM" },
    { id: 3, type: "Top Up Bonus", method: "System",         amount:   20,  status: "completed", date: "May 17, 2024 08:16 PM" },
    { id: 4, type: "Spent",        method: "Ad Account",     amount: -120,  status: "completed", date: "May 16, 2024 03:45 PM" },
    { id: 5, type: "Deposit",      method: "Bank Transfer",  amount:  500,  status: "completed", date: "May 15, 2024 11:20 AM" },
    { id: 6, type: "Spent",        method: "Pre-Verified",   amount:  -95,  status: "completed", date: "May 14, 2024 02:10 PM" },
    { id: 7, type: "Deposit",      method: "Wise",           amount:  300,  status: "completed", date: "May 12, 2024 09:00 AM" },
    { id: 8, type: "Refund",       method: "System",         amount:   50,  status: "completed", date: "May 11, 2024 04:30 PM" },
  ],
  adAccountRequests: [],
  inventoryProducts: [
    { id: "prod-1", platform: "Meta",     type: "Aged",  title: "Meta Aged Accounts (US)",  description: "High-quality aged Meta Business Manager accounts. BM verified, ready to run ads immediately.", price: 120, country: "United States", created: "May 20, 2024" },
    { id: "prod-2", platform: "Google",   type: "Aged",  title: "Google Aged Accounts (US)", description: "Mature Google Ads accounts with billing history. Perfect for scaling.", price: 110, country: "United States", created: "May 18, 2024" },
    { id: "prod-3", platform: "TikTok",   type: "New",   title: "TikTok Fresh Accounts",     description: "Brand new TikTok Business Center accounts. Quick setup, low risk.", price: 95,  country: "United States", created: "May 22, 2024" },
    { id: "prod-4", platform: "Snapchat", type: "Aged",  title: "Snapchat Aged Accounts",    description: "Aged Snapchat Ads accounts with spending history. $100/day limit.", price: 90,  country: "United States", created: "May 15, 2024" },
    { id: "prod-5", platform: "Meta",     type: "Aged",  title: "Meta Aged Accounts (UK)",  description: "UK-based Meta Business Manager accounts. BM verified, GBP billing.", price: 150, country: "United Kingdom", created: "May 25, 2024" },
    { id: "prod-6", platform: "Google",   type: "New",   title: "Google Fresh Accounts",     description: "New Google Ads accounts with USD billing. Great for testing.", price: 85,  country: "United States", created: "May 21, 2024" },
    { id: "prod-7", platform: "TikTok",   type: "Aged",  title: "TikTok Aged Accounts",      description: "Aged TikTok accounts with $180/day spend limit. Stable performance.", price: 105, country: "United States", created: "May 19, 2024" },
    { id: "prod-8", platform: "Snapchat", type: "New",   title: "Snapchat Fresh Accounts",   description: "New Snapchat Ads accounts ready to launch. Low initial limits.", price: 75,  country: "United States", created: "May 23, 2024" },
  ],
  inventoryLines: [
    { id: "l1",  productId: "prod-1", email: "john.doe***@gmail.com", password: "Pass123!", twofa: "J3K4 5G6H", status: "available" },
    { id: "l2",  productId: "prod-1", email: "alex.smi***@gmail.com", password: "Pass456!", twofa: "L1M2 3N4O", status: "available" },
    { id: "l3",  productId: "prod-1", email: "mark.joh***@gmail.com", password: "Pass789!", twofa: "P5Q6 7R8S", status: "sold" },
    { id: "l4",  productId: "prod-2", email: "sarah.wil***@gmail.com", password: "Ggl123!", twofa: "A1B2 C3D4", status: "available" },
    { id: "l5",  productId: "prod-2", email: "james.bro***@gmail.com", password: "Ggl456!", twofa: "E5F6 G7H8", status: "available" },
    { id: "l6",  productId: "prod-3", email: "lisa.tay***@gmail.com", password: "Tik123!", twofa: "Z1X2 C3V4", status: "available" },
    { id: "l7",  productId: "prod-4", email: "kevin.lee***@gmail.com", password: "Snap123!", twofa: "B1N2 M3K4", status: "available" },
    { id: "l8",  productId: "prod-5", email: "emma.wat***@gmail.com", password: "MetaUK1!", twofa: "Q1W2 E3R4", status: "available" },
    { id: "l9",  productId: "prod-6", email: "noah.jam***@gmail.com", password: "GglNew1!", twofa: "T5Y6 U7I8", status: "available" },
    { id: "l10", productId: "prod-7", email: "olivia.bro***@gmail.com", password: "TikAge1!", twofa: "O1P2 A3S4", status: "available" },
    { id: "l11", productId: "prod-8", email: "liam.joh***@gmail.com", password: "SnapNew1!", twofa: "D5F6 G7H8", status: "available" },
    { id: "l12", productId: "prod-1", email: "ava.dav***@gmail.com", password: "Pass012!", twofa: "J9K0 L1M2", status: "available" },
  ],
  purchases: [],
  projects: [],
  mediaBuyers: [
    { id: 1, name: "Alex Morgan",    avatar: "AM", email: "alex@mediapro.com",    speciality: "Meta Ads Expert",         platforms: ["Meta","Google"],           experience: "5 years", spent: "$2.4M+", rate: 350, rating: 4.9, reviews: 128, orders: 156, status: "approved", joined: "May 1, 2024",   portfolio: "https://alexmorgan.media"  },
    { id: 2, name: "Sarah Johnson",  avatar: "SJ", email: "sarah@adspro.com",     speciality: "Google Ads Specialist",   platforms: ["Google"],                  experience: "4 years", spent: "$1.8M+", rate: 320, rating: 4.8, reviews:  96, orders: 112, status: "approved", joined: "Apr 15, 2024",  portfolio: "https://sarahjohnson.ads"  },
    { id: 3, name: "David Lee",      avatar: "DL", email: "david@tiktokads.io",   speciality: "TikTok Ads Expert",       platforms: ["TikTok"],                  experience: "3 years", spent: "$1.2M+", rate: 300, rating: 4.7, reviews:   0, orders:   0, status: "pending",  joined: "May 20, 2024",  portfolio: "https://davidlee.io"        },
    { id: 4, name: "Emily Carter",   avatar: "EC", email: "emily@fullads.com",    speciality: "Snapchat Ads Expert",     platforms: ["Snapchat","Meta"],         experience: "6 years", spent: "$950K+", rate: 280, rating: 4.9, reviews:   0, orders:   0, status: "pending",  joined: "May 22, 2024",  portfolio: "https://emilycarter.ads"   },
    { id: 5, name: "Michael Brown",  avatar: "MB", email: "mike@adscale.com",     speciality: "Meta & TikTok Expert",    platforms: ["Meta","TikTok"],           experience: "4 years", spent: "$1.6M+", rate: 400, rating: 4.6, reviews:  58, orders:  84, status: "approved", joined: "Mar 10, 2024",  portfolio: "https://mikebrown.media"   },
    { id: 6, name: "James Wilson",   avatar: "JW", email: "james@googleads.pro",  speciality: "Google & YouTube Ads",   platforms: ["Google"],                  experience: "2 years", spent: "$780K+", rate: 250, rating:   0, reviews:   0, orders:   0, status: "rejected", joined: "May 18, 2024",  portfolio: "https://jameswilson.pro",  rejectReason: "Insufficient portfolio documentation" },
    { id: 7, name: "Daniel Sanchez", avatar: "DS", email: "daniel@tikpro.io",     speciality: "TikTok & Meta Expert",   platforms: ["TikTok","Meta"],           experience: "3 years", spent: "$1.1M+", rate: 330, rating:   0, reviews:   0, orders:   0, status: "pending",  joined: "May 25, 2024",  portfolio: "https://danielsanchez.io"  },
    { id: 8, name: "Sophia Martinez",avatar: "SM", email: "sophia@fullfunnel.co", speciality: "Full Funnel Specialist",  platforms: ["Meta","Google","TikTok"],  experience: "7 years", spent: "$2.2M+", rate: 450, rating: 4.8, reviews:  91, orders: 131, status: "approved", joined: "Feb 5, 2024",   portfolio: "https://sophiamartinez.co" },
  ],
  deposits: [
    { id: "DEP-001", user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", user: "john.doe@example.com",  method: "Payoneer",     amount:  350, status: "pending",   date: "May 19, 2024 10:30 AM", proof: "proof_001.png" },
    { id: "DEP-002", user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", user: "william@example.com",   method: "Bank Transfer",amount:  500, status: "completed", date: "May 18, 2024 09:00 AM", proof: "proof_002.pdf" },
    { id: "DEP-003", user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012", user: "emma@example.com",      method: "USDT (TRC20)", amount:  200, status: "pending",   date: "May 17, 2024 02:30 PM", proof: "proof_003.png" },
    { id: "DEP-004", user_id: "d4e5f6a7-b8c9-0123-def1-234567890123", user: "olivia@example.com",    method: "Wise",         amount: 1000, status: "completed", date: "May 16, 2024 11:00 AM", proof: "proof_004.jpg" },
    { id: "DEP-005", user_id: "f6a7b8c9-d0e1-2345-f123-456789012345", user: "sophia@example.com",    method: "Binance",      amount:  150, status: "pending",   date: "May 15, 2024 04:15 PM", proof: "proof_005.png" },
  ],
  orders: [
    { id: "ORD-98765", user_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", user: "john.doe@example.com",  type: "Ad Account",          platform: "Meta",     amount: 120, status: "completed",  date: "May 25, 2024" },
    { id: "ORD-98764", user_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", user: "william@example.com",   type: "Pre-Verified Account",platform: "Google",   amount: 150, status: "completed",  date: "May 25, 2024" },
    { id: "ORD-98763", user_id: "c3d4e5f6-a7b8-9012-cdef-123456789012", user: "emma@example.com",      type: "Ad Account",          platform: "TikTok",   amount: 100, status: "processing", date: "May 25, 2024" },
    { id: "ORD-98762", user_id: "d4e5f6a7-b8c9-0123-def1-234567890123", user: "olivia@example.com",    type: "Ad Account",          platform: "Snapchat", amount:  90, status: "pending",    date: "May 25, 2024" },
    { id: "ORD-98761", user_id: "f6a7b8c9-d0e1-2345-f123-456789012345", user: "james@example.com",     type: "Pre-Verified Account",platform: "Meta",     amount: 110, status: "completed",  date: "May 25, 2024" },
  ],
  users: [
    { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "John Doe",       email: "john.doe@example.com",   balance: 1240, accounts: 12, status: "active",   joined: "Jan 5, 2024"   },
    { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", name: "William Smith",  email: "william@example.com",    balance:  850, accounts:  8, status: "active",   joined: "Jan 18, 2024"  },
    { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", name: "Emma Johnson",   email: "emma@example.com",       balance:  320, accounts:  3, status: "active",   joined: "Feb 2, 2024"   },
    { id: "d4e5f6a7-b8c9-0123-def1-234567890123", name: "Olivia Brown",   email: "olivia@example.com",     balance: 2100, accounts: 21, status: "active",   joined: "Feb 14, 2024"  },
    { id: "e5f6a7b8-c9d0-1234-ef12-345678901234", name: "James Wilson",   email: "james@example.com",      balance:    0, accounts:  0, status: "banned",   joined: "Mar 1, 2024"   },
    { id: "f6a7b8c9-d0e1-2345-f123-456789012345", name: "Sophia Garcia",  email: "sophia@example.com",     balance:  670, accounts:  5, status: "active",   joined: "Mar 20, 2024"  },
    { id: "a7b8c9d0-e1f2-3456-a123-567890123456", name: "Daniel Martinez",email: "daniel@example.com",     balance:    0, accounts:  0, status: "pending",  joined: "Apr 3, 2024"   },
    { id: "b8c9d0e1-f2a3-4567-b234-678901234567", name: "Mia Anderson",   email: "mia@example.com",        balance: 1580, accounts: 14, status: "active",   joined: "Apr 15, 2024"  },
    { id: "c9d0e1f2-a3b4-5678-c345-789012345678", name: "Super Admin",    email: "admin@adversolutions.com", balance: 0, accounts: 0, status: "active",   joined: "Jan 1, 2024", role: "admin" },
  ],
  paymentMethods: [
    { id: "pm-1", name: "Payoneer", bank_name: "Payoneer", logo: "💳", account: "adver@solution.com", active: true, fields: [{ label: "Email", value: "adver@solution.com" }] },
    { id: "pm-2", name: "Wise", bank_name: "Wise", logo: "💳", account: "adver@solution.com", active: true, fields: [{ label: "Email", value: "adver@solution.com" }] },
    { id: "pm-3", name: "USDC (TRC20)", bank_name: "Tron", logo: "₿", account: "TY8c...b3fD", active: true, fields: [{ label: "Wallet Address", value: "TY8c...b3fD" }] },
    { id: "pm-4", name: "Binance", bank_name: "Binance", logo: "💰", account: "456789852", active: true, fields: [{ label: "User ID", value: "456789852" }] },
    { id: "pm-5", name: "Bank Transfer", bank_name: "Bank of America", logo: "🏦", account: "XXXX XXXX XXXX 1234", active: true, fields: [{ label: "Account Number", value: "XXXX XXXX XXXX 1234" }, { label: "SWIFT", value: "BOFAUS3N" }] },
    { id: "pm-6", name: "Local Moroccan Banks", bank_name: "Attijariwafa Bank", logo: "🏦", account: "Contact support", active: true, fields: [{ label: "RIB", value: "Contact support for details" }] },
    { id: "pm-7", name: "Other", bank_name: "Other", logo: "💳", account: "Contact support", active: true, fields: [{ label: "Details", value: "Contact support" }] },
  ],
  businessTypes: ["Marketing Agency","E-Commerce Brand","Freelancer","Startup","Enterprise","Other"],
  supportTickets: [],
  announcements: [
    { icon: "📢", title: "New: TikTok Ads Accounts",  body: "TikTok accounts are now available!",                  date: "May 20, 2024" },
    { icon: "🛡️", title: "System Update",              body: "Updated security measures for better protection.",    date: "May 18, 2024" },
    { icon: "🎁", title: "Special Offer",              body: "Get 10% bonus on your next top up over $500!",        date: "May 15, 2024" },
  ],
};

let _store = { ...DEMO_STORE };
let _listeners = [];
let _hydrated = false;

export function getStore() {
  return { ..._store };
}

export function setStore(updater) {
  const next = typeof updater === "function" ? updater({ ..._store }) : { ..._store, ...updater };
  _store = next;
  _listeners.forEach(fn => fn(_store));
}

export function subscribeStore(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(f => f !== fn); };
}

export function useStore() {
  const [state, setState] = useState(getStore());
  useEffect(() => subscribeStore(setState), []);
  return [state, setStore];
}

export function useStoreValue(selector) {
  const [state, setState] = useState(() => selector(getStore()));
  useEffect(() => {
    const cb = (s) => setState(selector(s));
    _listeners.push(cb);
    return () => { _listeners = _listeners.filter(f => f !== cb); };
  }, []);
  return state;
}

export function resetStore() {
  _store = { ...DEMO_STORE };
  _listeners.forEach(fn => fn(_store));
}

// Auth session helpers
export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setSession(session) {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {}
}

// Hydrate store from Supabase
export async function hydrateStore() {
  if (_hydrated) return;

  try {
    // First batch — everything except purchases (which needs user_id filter)
    const [
      users, transactions, inventoryProducts, inventoryLines, orders,
      deposits, mediaBuyers, paymentMethods, businessTypes, supportTickets,
      adAccountRequests, projects, announcements, platformPrices
    ] = await Promise.all([
      fetchUsers(),
      fetchTransactions(),
      fetchInventoryProducts(),
      fetchInventoryLines(),
      fetchOrders(),
      fetchDeposits(),
      fetchMediaBuyers(),
      fetchPaymentMethods(),
      fetchBusinessTypes(),
      fetchTickets(),
      fetchAdAccountRequests(),
      fetchProjects(),
      fetchAnnouncements(),
      fetchPlatformPrices(),
    ]);

    const session = getSession();
    let auth = null;
    let balance = 1240;

    if (session && session.user) {
      const me = users.find(u => u.id === session.user.id);
      if (me) {
        auth = { ...me, role: me.role };
        balance = parseFloat(me.balance) || 0;
      }
    }

    // Second: fetch purchases filtered by user (admin gets all)
    const purchases = await fetchPurchases(
      auth && auth.role !== 'admin' ? auth.id : null
    );

    _store = {
      auth,
      balance,
      transactions: transactions || DEMO_STORE.transactions,
      adAccountRequests: adAccountRequests || [],
      inventoryProducts: inventoryProducts || DEMO_STORE.inventoryProducts,
      inventoryLines: inventoryLines || DEMO_STORE.inventoryLines,
      purchases: purchases || [],
      projects: (projects || []).map(p => ({
        ...p,
        updates: p.updates || [],
        files: p.files || [],
        messages: p.messages || [],
      })),
      mediaBuyers: mediaBuyers || DEMO_STORE.mediaBuyers,
      deposits: deposits || DEMO_STORE.deposits,
      orders: orders || DEMO_STORE.orders,
      users: users || DEMO_STORE.users,
      paymentMethods: paymentMethods || DEMO_STORE.paymentMethods,
      businessTypes: businessTypes || DEMO_STORE.businessTypes,
      supportTickets: supportTickets || [],
      announcements: announcements || DEMO_STORE.announcements,
      platformPrices: platformPrices || {},
    };

    _hydrated = true;
    _listeners.forEach(fn => fn(_store));
  } catch (err) {
    console.error("Hydrate error:", err);
    _store = { ...DEMO_STORE };
    _hydrated = true;
    _listeners.forEach(fn => fn(_store));
  }
}
