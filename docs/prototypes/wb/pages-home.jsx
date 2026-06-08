// wb/pages-home.jsx — Workbench home + Firms directory.

// =========================================================================
// PAGE: Workbench home — focuses on resuming + starting input work.
// =========================================================================
function HomePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Workbench"
        title="Welcome back, planner.a"
        th="ยินดีต้อนรับสู่หน้าหลัก — เลือกงานที่จะทำต่อ"
        actions={
          <>
            <Button kind="secondary" icon="⤓" onClick={() => go('/import')}>Bulk import</Button>
            <Button kind="primary" icon="+" onClick={() => go('/firms/new')}>
              Add new firm <Kbd>N</Kbd>
            </Button>
          </>
        }
      />

      {/* Quick stats — tiny, restrained */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
        marginBottom: 32,
      }}>
        <StatTile label="Firms in system" value={FIRMS.length} sub={`${FIRMS.filter(f => f.status === 'published').length} published`} />
        <StatTile label="Drafts in progress" value={DRAFTS.length} sub="Resume below" accent />
        <StatTile label="Sources cited" value={SOURCES.length} sub="4 government · 2 manual" />
        <StatTile label="Records · 30 days" value="+47" sub="across 7 domains" trend="up" />
      </div>

      {/* Resume drafts — the most useful thing on this page */}
      <SectionTitle>
        <span>Resume your drafts</span>
        <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>
          {DRAFTS.length} in progress — last touched within 3 days
        </span>
      </SectionTitle>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        marginBottom: 32,
      }}>
        {DRAFTS.map(d => <DraftCard key={d.id} draft={d} />)}
      </div>

      {/* Two-column: recent firms + import jobs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24,
      }}>
        <div>
          <SectionTitle>
            <span>Recently touched firms</span>
            <a onClick={() => go('/firms')} style={{
              fontSize: 12, color: T.accent, cursor: 'pointer', fontWeight: 500,
            }}>View all {FIRMS.length} →</a>
          </SectionTitle>
          <Card pad={0}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Firm</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Completeness</th>
                  <th style={thStyle}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {FIRMS.slice(0, 5).map(f => {
                  const avg = Math.round(
                    Object.values(f.completeness).reduce((s, v) => s + v, 0) / 7
                  );
                  return (
                    <tr key={f.id} className="wb-row-hover" onClick={() => go(`/firms/${f.id}`)}
                      style={{ cursor: 'pointer' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: T.ink }}>{f.name_en}</span>
                          <span style={{ fontSize: 11.5, color: T.muted }}>{f.name_th}</span>
                        </div>
                      </td>
                      <td style={tdStyle}><StatusPill status={f.status} /></td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Ring pct={avg} size={20} />
                          <span style={{
                            fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5,
                            color: T.muted, letterSpacing: '0.02em',
                          }}>{avg}%</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
                        }}>{relTime(f.last_updated)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <SectionTitle>
            <span>Recent imports</span>
            <a onClick={() => go('/import')} style={{
              fontSize: 12, color: T.accent, cursor: 'pointer', fontWeight: 500,
            }}>New import →</a>
          </SectionTitle>
          <Card pad={0}>
            {IMPORTS.map((imp, i) => (
              <div key={imp.id} style={{
                padding: '14px 16px',
                borderBottom: i === IMPORTS.length - 1 ? 'none' : `1px solid ${T.line}`,
                cursor: 'pointer',
              }} className="wb-row-hover" onClick={() => go(`/import/${imp.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontFamily: '"IBM Plex Mono", monospace', fontSize: 12,
                    color: T.ink, fontWeight: 500,
                  }}>{imp.file}</span>
                  <ImportStatusPill status={imp.status} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: T.muted }}>
                  <span><strong style={{ color: T.ink }}>{imp.rows}</strong> rows</span>
                  <span style={{ color: T.ok }}>● {imp.ok} ok</span>
                  {imp.warn > 0 && <span style={{ color: T.warn }}>● {imp.warn} warn</span>}
                  {imp.error > 0 && <span style={{ color: T.danger }}>● {imp.error} reject</span>}
                  <span style={{ marginLeft: 'auto' }}>{relTime(imp.when)}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Tip strip */}
      <div style={{
        marginTop: 32, padding: 16,
        background: T.subtle, borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 16,
        fontFamily: 'Sarabun, sans-serif', fontSize: 13, color: T.muted,
      }}>
        <span style={{ color: T.accent, fontSize: 18 }}>◆</span>
        <span>
          <strong style={{ color: T.ink }}>Tip:</strong>{' '}
          Press <Kbd>N</Kbd> anywhere to start a new firm, <Kbd>G</Kbd> then <Kbd>F</Kbd> to jump to the directory,
          and <Kbd>/</Kbd> to focus search.
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Kbd>?</Kbd> all shortcuts
        </span>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, accent, trend }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: 8,
      padding: '14px 16px',
      borderLeft: accent ? `3px solid ${T.accent}` : `1px solid ${T.line}`,
    }}>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 11,
        color: T.muted, letterSpacing: '0.06em',
        textTransform: 'uppercase', fontWeight: 600,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
        <span style={{
          fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
          fontSize: 24, color: T.ink, letterSpacing: '-0.015em', lineHeight: 1.1,
        }}>{value}</span>
        {trend === 'up' && <span style={{ color: T.ok, fontSize: 12, fontWeight: 600 }}>▲</span>}
      </div>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted, marginTop: 2,
      }}>{sub}</div>
    </div>
  );
}

function DraftCard({ draft }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: 8,
      padding: 16,
      cursor: 'pointer',
      transition: 'border-color 120ms, transform 120ms',
    }} className="wb-row-hover"
      onClick={() => go('/firms/new?resume=' + draft.id)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <StatusPill status="draft" />
        <Ring pct={draft.completeness} size={28} />
      </div>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600,
        color: draft.name_th ? T.ink : T.muted2,
        marginBottom: 2,
      }}>{draft.name_en || draft.name_th || '(no name)'}</div>
      <div style={{
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
        color: T.muted, marginBottom: 12, letterSpacing: '0.02em',
      }}>JID {draft.juristic}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px',
        background: T.subtle, borderRadius: 6,
        fontFamily: 'Sarabun, sans-serif', fontSize: 12,
        color: T.ink2,
      }}>
        <DomainPill domain={draft.next_domain} size="sm" />
        <span style={{ flex: 1, color: T.muted }}>Next: {draft.next}</span>
        <span style={{ color: T.accent, fontWeight: 600 }}>Resume →</span>
      </div>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 11, color: T.muted2,
        marginTop: 10,
      }}>Last edited {relTime(draft.last_touched)}</div>
    </div>
  );
}

// =========================================================================
// PAGE: Firms directory
// =========================================================================
function FirmsPage() {
  const [filter, setFilter] = React.useState('all');
  const [q, setQ] = React.useState('');

  const filtered = FIRMS.filter(f => {
    if (filter !== 'all' && f.status !== filter) return false;
    if (q) {
      const Q = q.toLowerCase();
      if (!f.name_en.toLowerCase().includes(Q) &&
          !f.name_th.toLowerCase().includes(Q) &&
          !f.juristic.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Workbench', to: '/' }, { label: 'Firms' }]}
        eyebrow="Directory"
        title="Firms"
        th={`ทั้งหมด ${FIRMS.length} บริษัทในระบบ`}
        actions={
          <>
            <Button kind="secondary" icon="⤓">Export</Button>
            <Button kind="primary" icon="+" onClick={() => go('/firms/new')}>
              Add new firm
            </Button>
          </>
        }
      />

      {/* Filter row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 16,
      }}>
        <div style={{ width: 320 }}>
          <Input
            value={q} onChange={setQ}
            placeholder="Search name or juristic ID…"
            prefix="⌕"
          />
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All · ${FIRMS.length}` },
            { value: 'published', label: `Published · ${FIRMS.filter(f => f.status === 'published').length}` },
            { value: 'pending_review', label: `Pending · ${FIRMS.filter(f => f.status === 'pending_review').length}` },
            { value: 'draft', label: `Drafts · ${FIRMS.filter(f => f.status === 'draft').length}` },
          ]}
        />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted }}>
          {filtered.length} of {FIRMS.length}
        </div>
      </div>

      {/* Table */}
      <Card pad={0}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Firm</th>
              <th style={thStyle}>Juristic ID</th>
              <th style={thStyle}>HQ</th>
              <th style={thStyle}>Industry</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Completeness</th>
              <th style={thStyle}>Sources</th>
              <th style={thStyle}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const avg = Math.round(
                Object.values(f.completeness).reduce((s, v) => s + v, 0) / 7
              );
              return (
                <tr key={f.id} className="wb-row-hover" onClick={() => go(`/firms/${f.id}`)}
                  style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: T.ink }}>{f.name_en}</span>
                      <span style={{ fontSize: 11.5, color: T.muted }}>{f.name_th}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, color: T.muted, letterSpacing: '0.02em' }}>
                    {f.juristic}
                  </td>
                  <td style={tdStyle}>{f.hq_city_en}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12.5, color: T.ink2 }}>{f.industry}</span>
                    <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: T.muted2 }}>
                      ISIC {f.isic}
                    </div>
                  </td>
                  <td style={tdStyle}><StatusPill status={f.status} /></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Ring pct={avg} size={20} />
                      <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, color: T.muted }}>{avg}%</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, color: T.muted }}>{f.source_count}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: T.muted }}>{relTime(f.last_updated)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// =========================================================================
// Helpers
// =========================================================================
function SectionTitle({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 12, paddingBottom: 4,
      fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600,
      color: T.ink, letterSpacing: '0.005em',
    }}>{children}</div>
  );
}

function ImportStatusPill({ status }) {
  if (status === 'committed') return <Pill color={T.ok} size="sm">✓ committed</Pill>;
  if (status === 'partial')   return <Pill color={T.warn} size="sm">partial</Pill>;
  if (status === 'rejected')  return <Pill color={T.danger} size="sm">rejected</Pill>;
  if (status === 'staging')   return <Pill color={T.accent} size="sm">in staging</Pill>;
  return <Pill size="sm">{status}</Pill>;
}

function relTime(iso) {
  // crude but fine for prototype
  const d = new Date(iso + 'T12:00:00');
  const days = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)   return `${days}d ago`;
  if (days < 14)  return `${Math.floor(days / 7)}w ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const tableStyle = {
  width: '100%', borderCollapse: 'collapse',
  fontFamily: 'Sarabun, sans-serif',
};
const thStyle = {
  textAlign: 'left',
  padding: '10px 16px',
  borderBottom: `1px solid ${T.line}`,
  fontSize: 10.5, fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: T.muted2, background: T.surface,
};
const tdStyle = {
  padding: '12px 16px',
  borderBottom: `1px solid ${T.line}`,
  fontSize: 13, color: T.ink2,
  verticalAlign: 'middle',
};

Object.assign(window, { HomePage, FirmsPage, SectionTitle, tableStyle, thStyle, tdStyle, relTime, ImportStatusPill });
