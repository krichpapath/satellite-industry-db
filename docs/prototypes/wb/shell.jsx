// wb/shell.jsx — application shell: top bar + left nav + content slot.

function Shell({ children, route }) {
  // Determine which nav item is active from the route
  const seg = parseRoute(route);
  const top = seg[0] || '';
  const active = (() => {
    if (top === '' || route === '/') return 'home';
    if (top === 'firms' && seg[1] === 'new') return 'new-firm';
    if (top === 'firms') return 'firms';
    if (top === 'import') return 'import';
    if (top === 'sources') return 'sources';
    if (top === 'taxonomy') return 'taxonomy';
    return '';
  })();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '232px 1fr',
      background: T.bg,
      fontFamily: 'Sarabun, system-ui, sans-serif',
    }}>
      <Sidebar active={active} />
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <div style={{ flex: 1, padding: '32px 40px 64px', maxWidth: 1440, width: '100%' }}>
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Sidebar({ active }) {
  const sections = [
    {
      label: 'Main',
      items: [
        { key: 'home',     name: 'Workbench',    th: 'หน้าหลัก',         to: '/',     icon: '◐', shortcut: 'G H' },
        { key: 'firms',    name: 'Firms',        th: 'บริษัท',           to: '/firms', icon: '◇', shortcut: 'G F', count: FIRMS.length },
        { key: 'new-firm', name: 'Add new firm', th: 'เพิ่มบริษัท',      to: '/firms/new', icon: '+', shortcut: 'N', primary: true },
      ],
    },
    {
      label: 'Bulk operations',
      items: [
        { key: 'import',   name: 'Bulk import',  th: 'นำเข้าข้อมูล',     to: '/import', icon: '⤓', shortcut: 'G I', badge: '1' },
      ],
    },
    {
      label: 'Governance',
      items: [
        { key: 'sources',  name: 'Sources',      th: 'แหล่งที่มา',      to: '/sources',  icon: '☷', count: SOURCES.length },
        { key: 'taxonomy', name: 'Taxonomy',     th: 'อนุกรมวิธาน',     to: '/taxonomy', icon: '☰' },
        { key: 'audit',    name: 'Audit trail',  th: 'บันทึก',           to: '/audit',    icon: '⤳' },
      ],
    },
  ];

  return (
    <aside style={{
      borderRight: `1px solid ${T.line}`,
      background: T.surface,
      padding: '18px 0 24px',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
      overflow: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        padding: '0 20px 18px',
        borderBottom: `1px solid ${T.line}`,
        marginBottom: 18,
        cursor: 'pointer',
      }} onClick={() => go('/')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: T.accent, display: 'grid', placeItems: 'center',
            color: '#fff', fontFamily: '"IBM Plex Serif", serif',
            fontWeight: 700, fontSize: 13,
          }}>S</div>
          <div>
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontWeight: 700, fontSize: 13,
              color: T.ink, lineHeight: 1.1, letterSpacing: '-0.005em',
            }}>SatIndex</div>
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
              color: T.muted, marginTop: 1,
            }}>Industry DB · TH</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ flex: 1 }}>
        {sections.map((sec, si) => (
          <div key={si} style={{ padding: '0 12px 4px', marginBottom: 16 }}>
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
              color: T.muted2, letterSpacing: '0.1em',
              textTransform: 'uppercase', fontWeight: 600,
              padding: '0 8px 6px',
            }}>{sec.label}</div>
            {sec.items.map(it => (
              <NavItem key={it.key} item={it} active={active === it.key} />
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px 0',
        borderTop: `1px solid ${T.line}`,
        fontSize: 11, color: T.muted2,
        fontFamily: 'Sarabun, sans-serif',
      }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: T.muted, fontWeight: 500 }}>Phase 1 · prototype</span>
        </div>
        <div>Data shown is mock. Real records pending Phase 2.</div>
      </div>
    </aside>
  );
}

function NavItem({ item, active }) {
  const [hover, setHover] = React.useState(false);
  const itemColor =
    active ? T.accent :
    item.primary ? T.accent :
    T.ink2;
  const bg =
    active ? T.accentSoft :
    hover ? T.subtle : 'transparent';
  return (
    <a onClick={() => go(item.to)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '20px 1fr auto',
        gap: 10, alignItems: 'center',
        padding: '7px 8px', borderRadius: 6, cursor: 'pointer',
        background: bg, transition: 'background 100ms',
        textDecoration: 'none',
      }}>
      <span style={{
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 13,
        color: itemColor, textAlign: 'center', opacity: active ? 1 : 0.7,
      }}>{item.icon}</span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <span style={{
          fontFamily: 'Sarabun, sans-serif',
          fontSize: 13, fontWeight: active || item.primary ? 600 : 500,
          color: itemColor, lineHeight: 1.2,
        }}>{item.name}</span>
        <span style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
          color: active ? T.accent : T.muted2, opacity: 0.85,
        }}>{item.th}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {item.count !== undefined && (
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
            color: T.muted, padding: '0 6px',
            background: T.subtle, borderRadius: 4,
            height: 16, display: 'inline-flex', alignItems: 'center',
          }}>{item.count}</span>
        )}
        {item.badge && (
          <span style={{
            background: T.warn, color: '#fff', borderRadius: 999,
            fontSize: 9.5, fontWeight: 700, padding: '1px 6px',
            fontFamily: '"IBM Plex Mono", monospace',
          }}>{item.badge}</span>
        )}
      </span>
    </a>
  );
}

function TopBar() {
  return (
    <header style={{
      height: 56, borderBottom: `1px solid ${T.line}`,
      background: T.surface,
      display: 'flex', alignItems: 'center',
      padding: '0 32px', gap: 16,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Command palette stub */}
      <div onClick={() => window.toast?.('Command palette · ⌘K — not in prototype scope', { kind: '' })}
        style={{
          flex: 1, maxWidth: 480,
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${T.line}`, borderRadius: 8,
          padding: '6px 12px',
          background: T.subtle,
          fontFamily: 'Sarabun, sans-serif', fontSize: 13, color: T.muted,
          cursor: 'pointer',
          transition: 'border-color 120ms, background 120ms',
        }}>
        <span style={{ color: T.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>⌕</span>
        <span>Search firms, sources, taxonomy…</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <Kbd>⌘</Kbd><Kbd>K</Kbd>
        </span>
      </div>

      <div style={{ flex: 1 }}></div>

      {/* Language toggle */}
      <div style={{
        display: 'inline-flex',
        border: `1px solid ${T.line}`, borderRadius: 6,
        background: T.surface, padding: 2,
      }}>
        <button style={{
          padding: '4px 10px', border: 'none', borderRadius: 4,
          background: T.accent, color: '#fff',
          fontFamily: 'Sarabun, sans-serif', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.04em', cursor: 'pointer',
        }}>EN</button>
        <button style={{
          padding: '4px 10px', border: 'none', borderRadius: 4,
          background: 'transparent', color: T.muted,
          fontFamily: 'Sarabun, sans-serif', fontSize: 12, cursor: 'pointer',
        }}>ไทย</button>
      </div>

      {/* Help / shortcuts */}
      <button style={{
        width: 32, height: 32, borderRadius: 6,
        border: `1px solid ${T.line}`, background: T.surface,
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 12,
        color: T.muted, cursor: 'pointer',
      }} title="Keyboard shortcuts">?</button>

      {/* Planner badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 10px 5px 5px',
        border: `1px solid ${T.line}`, borderRadius: 999,
        background: T.surface,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: T.accent, color: '#fff',
          display: 'grid', placeItems: 'center',
          fontFamily: 'Sarabun, sans-serif', fontSize: 11, fontWeight: 700,
        }}>P</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, fontWeight: 600,
            color: T.ink, lineHeight: 1.1,
          }}>planner.a</span>
          <span style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 10,
            color: T.muted2,
          }}>Data Planner</span>
        </div>
      </div>
    </header>
  );
}

window.Shell = Shell;
