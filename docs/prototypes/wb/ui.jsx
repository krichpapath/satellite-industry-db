// wb/ui.jsx — shared UI primitives.
// Minimal / modern: subtle borders, soft shadows, generous spacing.

// ---------- BUTTON ----------
function Button({ children, kind = 'secondary', size = 'md', icon, onClick, type = 'button', disabled, full, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'Sarabun, system-ui, sans-serif',
    fontWeight: 500,
    border: '1px solid transparent',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, border-color 120ms ease, color 120ms ease',
    whiteSpace: 'nowrap',
    width: full ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    letterSpacing: '0.005em',
  };
  const sizes = {
    sm: { padding: '5px 10px', fontSize: 12.5, height: 28 },
    md: { padding: '8px 14px', fontSize: 13.5, height: 36 },
    lg: { padding: '10px 18px', fontSize: 14, height: 42 },
  };
  const kinds = {
    primary:   { background: T.accent, color: '#fff', borderColor: T.accent },
    secondary: { background: T.surface, color: T.ink, borderColor: T.line },
    ghost:     { background: 'transparent', color: T.ink2, borderColor: 'transparent' },
    danger:    { background: T.surface, color: T.danger, borderColor: T.line },
    dangerSolid: { background: T.danger, color: '#fff', borderColor: T.danger },
  };
  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? ({
    primary:   { background: T.accentHover, borderColor: T.accentHover },
    secondary: { background: T.subtle, borderColor: T.lineStrong },
    ghost:     { background: T.subtle },
    danger:    { background: T.dangerSoft, borderColor: T.danger },
    dangerSolid: { background: '#991b1b', borderColor: '#991b1b' },
  })[kind] : {};
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...base, ...sizes[size], ...kinds[kind], ...hoverStyle, ...style }}>
      {icon && <span style={{ display: 'inline-flex', fontSize: size === 'sm' ? 13 : 15 }}>{icon}</span>}
      {children}
    </button>
  );
}

// ---------- FIELD WRAPPER ----------
function Field({ label, hint, error, optional, required, children, layout = 'stack' }) {
  return (
    <div style={{ display: 'flex', flexDirection: layout === 'inline' ? 'row' : 'column', gap: layout === 'inline' ? 16 : 6, alignItems: layout === 'inline' ? 'baseline' : 'stretch' }}>
      {label && (
        <label style={{
          display: 'flex', alignItems: 'baseline', gap: 8,
          fontFamily: 'Sarabun, sans-serif',
          fontSize: 12.5, fontWeight: 500, color: T.ink2,
          minWidth: layout === 'inline' ? 160 : 'auto',
          letterSpacing: '0.005em',
        }}>
          {label}
          {required && <span style={{ color: T.danger, fontSize: 11 }}>*</span>}
          {optional && <span style={{ color: T.muted2, fontSize: 11, fontWeight: 400 }}>optional</span>}
        </label>
      )}
      <div style={{ flex: 1 }}>
        {children}
        {(hint || error) && (
          <div style={{
            marginTop: 5, fontSize: 11.5,
            color: error ? T.danger : T.muted,
            fontFamily: 'Sarabun, sans-serif',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {error && <span style={{ fontSize: 12 }}>⚠</span>}
            {error || hint}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- INPUT ----------
function Input({ value, onChange, placeholder, mono, size = 'md', prefix, suffix, autoFocus, type = 'text', error, ariaLabel, style }) {
  const [focus, setFocus] = React.useState(false);
  const heights = { sm: 30, md: 38, lg: 46 };
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: `1px solid ${error ? T.danger : focus ? T.accent : T.line}`,
      borderRadius: 6, background: T.surface,
      boxShadow: focus ? `0 0 0 3px ${error ? T.dangerSoft : T.accentSoft}` : 'none',
      transition: 'border-color 120ms, box-shadow 120ms',
      height: heights[size],
      ...style,
    }}>
      {prefix && (
        <span style={{
          padding: '0 4px 0 10px',
          fontFamily: mono ? '"IBM Plex Mono", monospace' : 'Sarabun, sans-serif',
          fontSize: 13, color: T.muted,
        }}>{prefix}</span>
      )}
      <input
        type={type} value={value || ''} aria-label={ariaLabel}
        autoFocus={autoFocus} placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          padding: prefix ? '0 8px 0 4px' : '0 10px',
          fontFamily: mono ? '"IBM Plex Mono", monospace' : 'Sarabun, sans-serif',
          fontSize: size === 'lg' ? 16 : 14,
          color: T.ink,
          letterSpacing: mono ? '0.04em' : '0',
        }}
      />
      {suffix && (
        <span style={{ padding: '0 10px', fontSize: 12, color: T.muted, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

// ---------- TEXTAREA ----------
function Textarea({ value, onChange, placeholder, rows = 3, error }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <textarea value={value || ''} onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder} rows={rows}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: '100%', resize: 'vertical',
        border: `1px solid ${error ? T.danger : focus ? T.accent : T.line}`,
        borderRadius: 6,
        boxShadow: focus ? `0 0 0 3px ${T.accentSoft}` : 'none',
        background: T.surface,
        fontFamily: 'Sarabun, sans-serif', fontSize: 13.5,
        padding: '8px 10px',
        outline: 'none',
        color: T.ink,
        transition: 'border-color 120ms, box-shadow 120ms',
      }} />
  );
}

// ---------- SELECT (native, styled) ----------
function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value || ''} onChange={e => onChange?.(e.target.value)}
      style={{
        width: '100%', height: 38,
        border: `1px solid ${T.line}`, borderRadius: 6,
        background: T.surface,
        fontFamily: 'Sarabun, sans-serif', fontSize: 13.5,
        padding: '0 10px', color: T.ink,
        outline: 'none', cursor: 'pointer',
        appearance: 'none',
        backgroundImage: 'linear-gradient(45deg, transparent 50%, #57534e 50%), linear-gradient(135deg, #57534e 50%, transparent 50%)',
        backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 11px) 50%',
        backgroundSize: '5px 5px, 5px 5px',
        backgroundRepeat: 'no-repeat',
      }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  );
}

// ---------- SEGMENTED (radio group) ----------
function Segmented({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex',
      border: `1px solid ${T.line}`, borderRadius: 6,
      background: T.surface, padding: 2,
    }}>
      {options.map(o => {
        const v = o.value || o;
        const isActive = value === v;
        return (
          <button key={v} type="button" onClick={() => onChange(v)}
            style={{
              padding: '6px 14px', borderRadius: 4,
              border: 'none', cursor: 'pointer',
              fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, fontWeight: 500,
              background: isActive ? T.accent : 'transparent',
              color: isActive ? '#fff' : T.ink2,
              transition: 'background 120ms, color 120ms',
            }}>
            {o.label || o}
          </button>
        );
      })}
    </div>
  );
}

// ---------- CHECKBOX-STYLE PILL TOGGLE ----------
function Chip({ label, on, onClick, color }) {
  const c = color || T.accent;
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 999,
        border: `1px solid ${on ? c : T.line}`,
        background: on ? `${c}10` : T.surface,
        color: on ? c : T.ink2,
        fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
        fontWeight: on ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 120ms',
      }}>
      {on && <span style={{ fontSize: 11 }}>✓</span>}
      {label}
    </button>
  );
}

// ---------- CARD ----------
function Card({ children, style, pad = 20, accent }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: 8,
      padding: pad,
      borderTop: accent ? `2px solid ${accent}` : undefined,
      ...style,
    }}>{children}</div>
  );
}

// ---------- PILL / TAG ----------
function Pill({ children, color, tone = 'soft', size = 'md' }) {
  const c = color || T.accent;
  const pads = { sm: '1px 7px', md: '2px 9px' };
  const fs   = { sm: 10.5, md: 11.5 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pads[size], borderRadius: 999,
      background: tone === 'soft' ? `${c}15` : c,
      color: tone === 'soft' ? c : '#fff',
      fontFamily: 'Sarabun, sans-serif', fontSize: fs[size],
      fontWeight: 600, letterSpacing: '0.02em',
      lineHeight: 1.4,
    }}>{children}</span>
  );
}

// ---------- DOMAIN PILL ----------
function DomainPill({ domain, size = 'md' }) {
  const d = DOMAIN_META[domain] || DOMAIN_META.firm;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      borderRadius: 999, background: `${d.color}12`, color: d.color,
      fontFamily: 'Sarabun, sans-serif', fontSize: size === 'sm' ? 10.5 : 11.5,
      fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }}></span>
      {d.name}
    </span>
  );
}

// ---------- STATUS PILL ----------
function StatusPill({ status }) {
  const map = {
    published: { color: T.ok, soft: T.okSoft, label: 'Published', dot: '●' },
    pending_review: { color: T.warn, soft: T.warnSoft, label: 'Pending review', dot: '●' },
    draft: { color: T.muted, soft: T.subtle, label: 'Draft', dot: '○' },
    retired: { color: T.muted2, soft: T.subtle, label: 'Retired', dot: '◌' },
  };
  const m = map[status] || map.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 999,
      background: m.soft, color: m.color,
      fontFamily: 'Sarabun, sans-serif', fontSize: 11,
      fontWeight: 600, letterSpacing: '0.04em',
    }}>
      <span style={{ fontSize: 8 }}>{m.dot}</span>
      {m.label}
    </span>
  );
}

// ---------- BREADCRUMB ----------
function Breadcrumb({ items }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.muted,
    }}>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ color: T.muted2 }}>/</span>}
          {it.to && i < items.length - 1 ? (
            <a onClick={() => go(it.to)} style={{
              cursor: 'pointer', color: T.muted, textDecoration: 'none',
            }}>{it.label}</a>
          ) : (
            <span style={{ color: i === items.length - 1 ? T.ink : T.muted, fontWeight: i === items.length - 1 ? 600 : 400 }}>
              {it.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ---------- PAGE HEADER ----------
function PageHeader({ eyebrow, title, th, actions, breadcrumb }) {
  return (
    <div style={{
      paddingBottom: 20, marginBottom: 24,
      borderBottom: `1px solid ${T.line}`,
    }}>
      {breadcrumb && <div style={{ marginBottom: 12 }}><Breadcrumb items={breadcrumb} /></div>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
        <div style={{ flex: 1 }}>
          {eyebrow && (
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 11,
              color: T.accent, letterSpacing: '0.1em',
              textTransform: 'uppercase', fontWeight: 600,
              marginBottom: 6,
            }}>{eyebrow}</div>
          )}
          <h1 style={{
            margin: 0, fontFamily: 'Sarabun, sans-serif',
            fontWeight: 600, fontSize: 26, color: T.ink,
            letterSpacing: '-0.015em', lineHeight: 1.1,
          }}>{title}</h1>
          {th && (
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 14.5,
              color: T.muted, marginTop: 4,
            }}>{th}</div>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
}

// ---------- COMPLETENESS RING ----------
function Ring({ pct, size = 22, color, thickness = 3 }) {
  const r = size / 2 - thickness / 2 - 0.5;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const col = color || (pct >= 80 ? T.ok : pct >= 40 ? T.accent : T.muted2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={T.line} strokeWidth={thickness} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={col} strokeWidth={thickness}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

// ---------- TOAST ----------
function Toaster() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    window.toast = (msg, opt = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(t => [...t, { id, msg, ...opt }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opt.duration || 4000);
    };
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          minWidth: 280, maxWidth: 420,
          background: T.ink, color: '#f5f5f4',
          padding: '12px 16px', borderRadius: 8,
          fontFamily: 'Sarabun, sans-serif', fontSize: 13,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
          animation: 'toastIn 200ms ease',
        }}>
          {t.kind === 'success' && <span style={{ color: '#86efac', fontSize: 16 }}>✓</span>}
          {t.kind === 'error' && <span style={{ color: '#fca5a5', fontSize: 16 }}>!</span>}
          {!t.kind && <span style={{ color: T.muted2, fontSize: 16 }}>·</span>}
          <div style={{ flex: 1 }}>
            <div>{t.msg}</div>
            {t.sub && <div style={{ fontSize: 11.5, color: T.muted2, marginTop: 2 }}>{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- DRAWER (right-side) ----------
function Drawer({ open, onClose, title, width = 520, children, footer }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      animation: 'fadeIn 160ms ease',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(12, 10, 9, 0.32)',
      }}></div>
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width, background: T.surface,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        animation: 'drawerIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: `1px solid ${T.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h3 style={{
            margin: 0, fontFamily: 'Sarabun, sans-serif',
            fontWeight: 600, fontSize: 16, color: T.ink,
          }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 20, color: T.muted, padding: 4, lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>{children}</div>
        {footer && (
          <div style={{
            padding: '14px 24px',
            borderTop: `1px solid ${T.line}`,
            background: T.subtle,
            display: 'flex', gap: 8, justifyContent: 'flex-end',
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

// ---------- SKELETON ----------
function Skeleton({ w = '100%', h = 14, style }) {
  return (
    <div style={{
      width: w, height: h,
      background: 'linear-gradient(90deg, #f5f5f4 0%, #e7e5e4 50%, #f5f5f4 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s linear infinite',
      borderRadius: 4,
      ...style,
    }}></div>
  );
}

// ---------- SHORTCUT KBD ----------
function Kbd({ children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, padding: '0 5px',
      borderRadius: 4,
      border: `1px solid ${T.line}`,
      background: T.surface,
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      color: T.muted, fontWeight: 500,
      letterSpacing: 0,
    }}>{children}</span>
  );
}

// ---------- INJECTED CSS ----------
(() => {
  if (document.getElementById('wb-anim')) return;
  const s = document.createElement('style');
  s.id = 'wb-anim';
  s.textContent = `
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes drawerIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes toastIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
    @keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .wb-row-hover:hover { background: ${T.hover} !important; }
    .wb-link:hover { color: ${T.accent} !important; }
  `;
  document.head.appendChild(s);
})();

Object.assign(window, {
  Button, Field, Input, Textarea, Select, Segmented, Chip,
  Card, Pill, DomainPill, StatusPill, Breadcrumb, PageHeader,
  Ring, Toaster, Drawer, Skeleton, Kbd,
});
