const LIGHT = {
  primary: "#E8192C", primaryDark: "#c4111f", primaryLight: "#fef2f3",
  sidebar: "#18080d",
  white: "#ffffff",
  g50: "#f9fafb", g100: "#f3f4f6", g200: "#e5e7eb", g300: "#d1d5db",
  g400: "#9ca3af", g500: "#6b7280", g600: "#4b5563", g700: "#374151",
  g800: "#1f2937", g900: "#111827",
  green: "#10b981", greenL: "#d1fae5",
  yellow: "#f59e0b", yellowL: "#fef3c7",
  blue: "#3b82f6", blueL: "#dbeafe",
  red: "#ef4444", redL: "#fee2e2",
  purple: "#8b5cf6", purpleL: "#ede9fe",
  orange: "#f97316", orangeL: "#ffedd5",
  bg: "#f5f5f8",
  card: "#ffffff",
  topbar: "#ffffff",
  text: "#1f2937",
  textSecondary: "#6b7280",
};

const DARK = {
  primary: "#ff3344", primaryDark: "#e8192c", primaryLight: "rgba(255,51,68,.15)",
  sidebar: "#0f0f1a",
  white: "#ffffff",
  g50: "#1e1e2f", g100: "#252540", g200: "#2d2d44", g300: "#3d3d5c",
  g400: "#8b8ba8", g500: "#a8a8c4", g600: "#c4c4db", g700: "#d8d8ec",
  g800: "#f0f0fa", g900: "#ffffff",
  green: "#34d399", greenL: "rgba(16,185,129,.15)",
  yellow: "#fbbf24", yellowL: "rgba(245,158,11,.15)",
  blue: "#60a5fa", blueL: "rgba(59,130,246,.15)",
  red: "#f87171", redL: "rgba(239,68,68,.15)",
  purple: "#a78bfa", purpleL: "rgba(139,92,246,.15)",
  orange: "#fb923c", orangeL: "rgba(249,115,22,.15)",
  bg: "#0f0f1a",
  card: "#1a1a2e",
  topbar: "#1a1a2e",
  text: "#f0f0fa",
  textSecondary: "#a8a8c4",
};

export const C = LIGHT;

export function getThemeColors(isDark) {
  return isDark ? DARK : LIGHT;
}

export const PLATFORMS = [
  { id: "meta",     name: "Meta (Facebook)",  sub: "Business Manager & Ad Account", icon: "Meta"     },
  { id: "google",   name: "Google Ads",        sub: "Google Ads Account",            icon: "Google"   },
  { id: "tiktok",   name: "TikTok Ads",        sub: "TikTok Business Account",       icon: "TikTok"   },
  { id: "snapchat", name: "Snapchat Ads",      sub: "Snapchat Business Account",     icon: "Snapchat" },
];

export const ADMIN_CREDS = {
  email: "admin@adversolutions.com",
  password: "admin2024",
};
