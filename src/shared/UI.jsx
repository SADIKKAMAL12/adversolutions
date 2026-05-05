import { C, getThemeColors } from './theme.js'
import { useTheme } from './ThemeContext.jsx'

export const Logo = ({ size = "sm" }) => {
  const lg = size === "lg";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: lg ? 14 : 8 }}>
      <svg viewBox="0 0 54 54" width={lg ? 54 : 36} height={lg ? 54 : 36}>
        <defs>
          <linearGradient id="ag1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff5577" />
            <stop offset="100%" stopColor="#E8192C" />
          </linearGradient>
          <linearGradient id="ag2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d1a2e" />
            <stop offset="100%" stopColor="#1a0a0e" />
          </linearGradient>
        </defs>
        <polygon points="6,48 22,10 30,28 18,48"  fill="url(#ag1)" />
        <polygon points="48,48 32,10 24,28 36,48" fill="url(#ag1)" />
        <polygon points="21,48 27,34 33,48"       fill="url(#ag2)" opacity="0.75" />
        <rect   x="17" y="31" width="20" height="4" rx="2" fill="url(#ag1)" />
      </svg>
      <div style={{ lineHeight: 1, display: "flex", alignItems: "center", gap: lg ? 5 : 3 }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: lg ? 22 : 15, color: "#fff", letterSpacing: lg ? 1 : .5 }}>ADVER</span>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 900, fontSize: lg ? 22 : 15, color: "#fff", background: C.primary, padding: lg ? "4px 12px" : "2px 8px", borderRadius: 30, letterSpacing: lg ? 1 : .5 }}>SOLUTIONS</span>
      </div>
    </div>
  );
};

export const PlatformIcon = ({ name, size = 16, logo }) => {
  if (logo) return <img src={logo} alt={name} style={{ width: size, height: size, objectFit: "contain", borderRadius: 4 }} />;
  const s = size;
  const icons = {
    Meta: (<svg width={s} height={s} viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>),
    Google: (<svg width={s} height={s} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>),
    TikTok: (<svg width={s} height={s} viewBox="0 0 24 24" fill="#010101"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.23 8.23 0 004.81 1.54V6.78a4.85 4.85 0 01-1.04-.09z"/></svg>),
    Snapchat: (<svg width={s} height={s} viewBox="0 0 24 24" fill="#FFFC00" stroke="#aaa" strokeWidth="0.3"><path d="M12.166.006C8.323.176 5.309 2.73 4.926 6.1c-.105.924.015 1.95.352 3.13a1.94 1.94 0 01-.647.106c-.45 0-.91-.117-1.32-.37a.578.578 0 00-.3-.084.535.535 0 00-.544.523c0 .282.195.514.46.558.854.139 1.535.55 2.03 1.243.6.84.685 1.681.685 1.724 0 .258-.196.483-.472.556C4.32 13.6 3.364 13.85 2.5 14.5c-.356.267-.5.658-.5 1.058 0 .62.306 1.23.864 1.605.21.14.445.21.683.21.22 0 .44-.055.637-.163.335-.183.639-.273.923-.273.224 0 .438.045.64.137.578.264 1.036.777 1.374 1.53.257.573.594 1.38 1.44 1.38.282 0 .603-.085.984-.27a5.3 5.3 0 012.456-.6c.84 0 1.67.2 2.456.6.38.185.702.27.984.27.846 0 1.183-.807 1.44-1.38.338-.753.796-1.266 1.374-1.53.202-.092.416-.137.64-.137.284 0 .588.09.923.273.197.108.417.163.637.163.238 0 .473-.07.683-.21.558-.375.864-.985.864-1.605 0-.4-.144-.79-.5-1.058-.864-.65-1.82-.9-2.67-1.094-.276-.073-.472-.298-.472-.556 0-.043.085-.884.685-1.724.495-.693 1.176-1.104 2.03-1.243.265-.044.46-.276.46-.558a.535.535 0 00-.544-.523.578.578 0 00-.3.084c-.41.253-.87.37-1.32.37-.22 0-.441-.035-.647-.106.337-1.18.457-2.206.352-3.13C18.691 2.73 15.677.176 12.166.006z"/></svg>),
  };
  return icons[name] || <span style={{ fontSize: s, lineHeight: 1 }}>●</span>;
};

export const Badge = ({ status }) => {
  const map = {
    available:      { bg: C.greenL,   c: C.green  },
    active:         { bg: C.greenL,   c: C.green  },
    completed:      { bg: C.greenL,   c: C.green  },
    approved:       { bg: C.greenL,   c: C.green  },
    reserved:       { bg: C.yellowL,  c: "#d97706" },
    pending:        { bg: C.yellowL,  c: "#d97706" },
    "pending review":{ bg: C.yellowL, c: "#d97706" },
    processing:     { bg: C.blueL,    c: C.blue   },
    in_review:      { bg: C.blueL,    c: C.blue   },
    sold:           { bg: C.blueL,    c: C.blue   },
    disabled:       { bg: C.redL,     c: C.red    },
    rejected:       { bg: C.redL,     c: C.red    },
    banned:         { bg: C.redL,     c: C.red    },
    open:           { bg: C.blueL,    c: C.blue   },
  };
  const s = map[(status && status.toLowerCase())] || map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.c, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.c, flexShrink: 0 }} />
      {status}
    </span>
  );
};

export const Btn = ({ children, variant = "primary", size = "md", full, style: st, ...props }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  const sz = { sm: { padding: "7px 14px", fontSize: 12 }, md: { padding: "10px 22px", fontSize: 13 }, lg: { padding: "13px 28px", fontSize: 15 } }[size];
  const v = {
    primary: { background: C.primary,     color: "#fff",   border: "none"                               },
    outline: { background: TC.card,        color: TC.g700,  border: `1.5px solid ${TC.g200}`             },
    ghost:   { background: "transparent",  color: TC.g500,  border: "none"                               },
    dark:    { background: TC.g800,        color: "#fff",   border: "none"                               },
    success: { background: C.green,        color: "#fff",   border: "none"                               },
    danger:  { background: C.red,          color: "#fff",   border: "none"                               },
    warning: { background: C.yellow,       color: "#fff",   border: "none"                               },
  }[variant];
  return (
    <button style={{ ...sz, ...v, borderRadius: 10, cursor: "pointer", fontWeight: 700, fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "opacity .15s", width: full ? "100%" : undefined, ...st }}
      onMouseEnter={e => e.currentTarget.style.opacity = ".85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, style, onClick }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div onClick={onClick} style={{ background: TC.card, border: `1px solid ${TC.g200}`, borderRadius: 16, padding: "22px 24px", color: TC.text, transition: "background .2s, color .2s", ...style }}>
      {children}
    </div>
  );
};

export const StatCard = ({ icon, label, value, sub, color, subPositive = true }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <Card>
      <div style={{ width: 42, height: 42, background: color + "20", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 12, color: TC.g400, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: TC.g800 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subPositive ? C.green : C.red, marginTop: 4 }}>{subPositive ? "↑" : "↓"} {sub}</div>}
    </Card>
  );
};

export const Input = ({ label, required, hint, ...props }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>{label}{required && <span style={{ color: C.primary }}> *</span>}</label>}
      <input
        style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card }}
        onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = TC.g200}
        {...props}
      />
      {hint && <div style={{ fontSize: 12, color: TC.g400, marginTop: 5 }}>{hint}</div>}
    </div>
  );
};

export const Select = ({ label, required, options, hint, ...props }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>{label}{required && <span style={{ color: C.primary }}> *</span>}</label>}
      <select style={{ width: "100%", background: TC.card, border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, color: TC.g700, fontFamily: "inherit", outline: "none", cursor: "pointer" }} {...props}>
        {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
      {hint && <div style={{ fontSize: 12, color: TC.g400, marginTop: 5 }}>{hint}</div>}
    </div>
  );
};

export const Textarea = ({ label, required, rows = 4, ...props }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, color: TC.g600, marginBottom: 7, fontWeight: 600 }}>{label}{required && <span style={{ color: C.primary }}> *</span>}</label>}
      <textarea rows={rows}
        style={{ width: "100%", border: `1.5px solid ${TC.g200}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", color: TC.g800, background: TC.card, resize: "vertical" }}
        onFocus={e => e.target.style.borderColor = C.primary} onBlur={e => e.target.style.borderColor = TC.g200}
        {...props} />
    </div>
  );
};

export const StepHeader = ({ steps, current }) => (
  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 36, padding: "0 4px" }}>
    {steps.map((step, i) => {
      const n = i + 1, done = current > n, active = current === n;
      return (
        <div key={n} style={{ display: "flex", alignItems: "flex-start", flex: n < steps.length ? 1 : "auto" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", border: `2px solid ${done || active ? C.primary : C.g300}`, background: done || active ? C.primary : "#fff", color: done || active ? "#fff" : C.g400, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, transition: "all .3s" }}>
              {done ? "✓" : n}
            </div>
            <div style={{ textAlign: "center", width: 100 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: active ? C.primary : done ? C.g700 : C.g400 }}>{step.label}</div>
              <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{step.sub}</div>
            </div>
          </div>
          {n < steps.length && <div style={{ flex: 1, height: 2, background: done ? C.primary : C.g200, marginTop: 18, transition: "all .3s" }} />}
        </div>
      );
    })}
  </div>
);

export const PageShell = ({ breadcrumb, title, subtitle, actions, children }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ padding: 28, fontFamily: "'Sora',sans-serif", minHeight: "100%", boxSizing: "border-box", color: TC.text, transition: "color .2s" }}>
      {breadcrumb && <div style={{ fontSize: 12, color: TC.g400, marginBottom: 6 }}>{breadcrumb}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: TC.g800 }}>{title}</h1>
          {subtitle && <p style={{ margin: "5px 0 0", fontSize: 13, color: TC.g500 }}>{subtitle}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
};

export const DataTable = ({ cols, rows, emptyMsg = "No data found." }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: TC.g50, borderBottom: `1px solid ${TC.g200}` }}>
            {cols.map(c => (
              <th key={c.key || c.label} style={{ padding: "10px 14px", textAlign: "left", color: TC.g400, fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={cols.length} style={{ padding: "40px", textAlign: "center", color: TC.g400 }}>{emptyMsg}</td></tr>
            : rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: `1px solid ${TC.g100}` }}>
                  {cols.map(c => (
                    <td key={c.key || c.label} style={{ padding: "12px 14px", color: TC.g700, ...c.style }}>{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  );
};

export const Pagination = ({ total, showing, pages = ["‹", 1, 2, 3, "...", 60, "›"] }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "0 2px" }}>
    <span style={{ fontSize: 13, color: C.g400 }}>Showing {showing} of {total}</span>
    <div style={{ display: "flex", gap: 6 }}>
      {pages.map((p, i) => (
        <button key={i} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${p === 1 ? C.primary : C.g200}`, background: p === 1 ? C.primary : "#fff", color: p === 1 ? "#fff" : C.g500, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
      ))}
    </div>
  </div>
);

export const Modal = ({ title, onClose, children, width = 520 }) => {
  const { theme } = useTheme();
  const TC = getThemeColors(theme === 'dark');
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div style={{ background: TC.card, borderRadius: 20, width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto", padding: 30, color: TC.text }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: TC.g800 }}>{title}</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: TC.g100, border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: TC.g600 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Avatar = ({ initials, size = 40, gradient = true }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: gradient ? `linear-gradient(135deg,${C.primary},#ff6b7a)` : C.g200, display: "flex", alignItems: "center", justifyContent: "center", color: gradient ? "#fff" : C.g500, fontWeight: 800, fontSize: size * .35, flexShrink: 0 }}>
    {initials}
  </div>
);
