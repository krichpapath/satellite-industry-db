// wb/pages-firm.jsx — Firm detail shell + per-domain input pages.

function FirmDetailPage({ firmId, subroute }) {
  const firm = FIRMS.find(f => f.id === firmId) || FIRMS[0];
  const sub = subroute || 'overview';

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Workbench', to: '/' },
          { label: 'Firms', to: '/firms' },
          { label: firm.name_en },
        ]}
      />
      {/* Identity strip */}
      <FirmIdentityBar firm={firm} />

      {/* Domain tabs */}
      <DomainTabRow firm={firm} active={sub} />

      {/* Tab body */}
      <div style={{ marginTop: 24 }}>
        {sub === 'overview'      && <FirmOverview firm={firm} />}
        {sub === 'valuechain'    && <ValueChainPage firm={firm} />}
        {sub === 'technology'    && <TechnologyPage firm={firm} />}
        {sub === 'hr'            && <HrPage firm={firm} />}
        {sub === 'supply-chain'  && <SupplyChainPage firm={firm} />}
        {sub === 'investment'    && <InvestmentPage firm={firm} />}
        {sub === 'esg'           && <EsgPage firm={firm} />}
      </div>
    </div>
  );
}

function FirmIdentityBar({ firm }) {
  const avg = Math.round(Object.values(firm.completeness).reduce((s, v) => s + v, 0) / 7);
  return (
    <div style={{
      marginTop: -8, marginBottom: 18,
      display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <DomainPill domain="firm" />
          <StatusPill status={firm.status} />
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: T.muted, letterSpacing: '0.04em' }}>
            JID {firm.juristic}
          </span>
        </div>
        <h1 style={{
          margin: 0, fontFamily: 'Sarabun, sans-serif',
          fontWeight: 600, fontSize: 28, color: T.ink,
          letterSpacing: '-0.015em', lineHeight: 1.1,
        }}>{firm.name_en}</h1>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 15,
          color: T.muted, marginTop: 4,
        }}>{firm.name_th}</div>
      </div>

      <div style={{
        marginLeft: 'auto',
        display: 'flex', gap: 8,
      }}>
        <Button kind="secondary" icon="⤳" onClick={() => window.toast?.('Audit timeline · not in prototype', { kind: '' })}>Audit</Button>
        <Button kind="primary" icon="✎">Edit identity</Button>
      </div>

      <div style={{ width: '100%', display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
        <FirmMeta k="Founded" v={`${firm.founded}`} sub={`${2026 - firm.founded} yrs`} />
        <FirmMeta k="Ownership" v={firm.ownership} sub={firm.listed} />
        <FirmMeta k="HQ" v={firm.hq_city_en} sub={firm.hq_city_th} />
        <FirmMeta k="Industry" v={firm.industry} sub={`ISIC ${firm.isic}`} />
        <FirmMeta k="Workforce" v={`${firm.workforce}`} sub={`${firm.rd_headcount} R&D`} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ring pct={avg} size={32} thickness={4} />
          <div>
            <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Completeness
            </div>
            <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 18, fontWeight: 700, color: T.ink, lineHeight: 1 }}>
              {avg}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirmMeta({ k, v, sub }) {
  return (
    <div>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 10.5, color: T.muted2,
        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
      }}>{k}</div>
      <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, fontWeight: 600, color: T.ink, marginTop: 1 }}>
        {v}
      </div>
      {sub && <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11, color: T.muted }}>{sub}</div>}
    </div>
  );
}

function DomainTabRow({ firm, active }) {
  const tabs = [
    { key: 'overview',     name: 'Overview',         th: 'ภาพรวม',           domain: 'firm', count: '—' },
    { key: 'valuechain',   name: 'Value Chain',      th: 'ห่วงโซ่คุณค่า',     domain: 'vc',   count: 2 },
    { key: 'technology',   name: 'Technology',       th: 'เทคโนโลยี',         domain: 'tech', count: 4 },
    { key: 'hr',           name: 'Human Resources',  th: 'ทรัพยากรบุคคล',     domain: 'hr',   count: 3 },
    { key: 'supply-chain', name: 'Supply Chain',     th: 'ห่วงโซ่อุปทาน',     domain: 'sc',   count: 17 },
    { key: 'investment',   name: 'Investment',       th: 'การลงทุน',          domain: 'inv',  count: 2 },
    { key: 'esg',          name: 'ESG',              th: 'ESG',               domain: 'esg',  count: 1 },
  ];
  return (
    <div style={{
      display: 'flex', gap: 0,
      borderBottom: `1px solid ${T.line}`,
      overflowX: 'auto',
    }}>
      {tabs.map(t => {
        const d = DOMAIN_META[t.domain];
        const isActive = active === t.key;
        const pct = firm.completeness[t.domain] || 0;
        return (
          <a key={t.key}
            onClick={() => go(`/firms/${firm.id}/${t.key === 'overview' ? '' : t.key}`)}
            style={{
              padding: '12px 18px',
              borderBottom: isActive ? `2px solid ${d.color}` : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              background: isActive ? `${d.color}08` : 'transparent',
              transition: 'background 120ms',
            }}>
            <Ring pct={pct} size={18} thickness={2.5} color={d.color} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'Sarabun, sans-serif', fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? d.color : T.ink2,
                lineHeight: 1.1,
              }}>{t.name}</span>
              <span style={{
                fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
                color: isActive ? d.color : T.muted2,
                opacity: 0.9,
              }}>{t.th}</span>
            </div>
            <span style={{
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
              color: isActive ? d.color : T.muted, fontWeight: 600,
              padding: '0 6px', borderRadius: 4,
              background: isActive ? '#fff' : T.subtle,
              height: 18, display: 'inline-flex', alignItems: 'center',
            }}>{t.count}</span>
          </a>
        );
      })}
    </div>
  );
}

// =========================================================================
// FIRM OVERVIEW — landing page after onboarding, focused on what's next
// =========================================================================
function FirmOverview({ firm }) {
  const incomplete = Object.entries(firm.completeness)
    .filter(([k, v]) => k !== 'firm' && v < 100)
    .sort((a, b) => a[1] - b[1]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        {/* What's next CTA */}
        {incomplete.length > 0 && (
          <Card style={{
            background: T.accentSoft,
            border: `1px solid ${T.accentLine}`,
            marginBottom: 20,
          }} pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: T.accent, color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 18,
              }}>→</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.accent, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Suggested next
                </div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 15, color: T.ink, fontWeight: 600 }}>
                  {DOMAIN_META[incomplete[0][0]].name} is only {incomplete[0][1]}% complete
                </div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                  Add the {DOMAIN_META[incomplete[0][0]].th} entries to bring this firm up to coverage.
                </div>
              </div>
              <Button kind="primary" onClick={() => go(`/firms/${firm.id}/${incomplete[0][0] === 'sc' ? 'supply-chain' : incomplete[0][0] === 'vc' ? 'valuechain' : incomplete[0][0]}`)}>
                Open {DOMAIN_META[incomplete[0][0]].name} →
              </Button>
            </div>
          </Card>
        )}

        {/* 7-domain grid */}
        <SectionTitle>
          <span>Domains</span>
          <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>
            Click a card to start adding records
          </span>
        </SectionTitle>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        }}>
          {Object.keys(DOMAIN_META)
            .filter(k => k !== 'firm')
            .map(k => {
              const d = DOMAIN_META[k];
              const pct = firm.completeness[k];
              const route = k === 'sc' ? 'supply-chain' : k === 'vc' ? 'valuechain' : k;
              return (
                <DomainCard key={k} domain={k} pct={pct}
                  onClick={() => go(`/firms/${firm.id}/${route}`)} />
              );
            })}
        </div>
      </div>

      {/* Right rail — provenance summary */}
      <div>
        <SectionTitle>
          <span>Provenance</span>
        </SectionTitle>
        <Card>
          <div style={{ display: 'grid', gap: 10 }}>
            <PreviewRowSmall k="Sources cited" v={
              <strong style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 14 }}>{firm.source_count}</strong>
            } />
            <PreviewRowSmall k="Records · all domains" v={
              <strong style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 14 }}>{firm.record_count}</strong>
            } />
            <PreviewRowSmall k="Last updated" v={firm.last_updated} />
            <PreviewRowSmall k="Maintained by" v="planner.a" />
          </div>
          <Divider />
          <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted, marginBottom: 8, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Sources
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {['boi', 'dbd', 'nriis', 'dip'].slice(0, firm.source_count).map(sid => {
              const s = SOURCES.find(x => x.id === sid);
              return (
                <div key={sid} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.ink2,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }}></span>
                  {s?.name}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DomainCard({ domain, pct, onClick }) {
  const d = DOMAIN_META[domain];
  const recordHints = {
    vc:   { records: pct > 0 ? '2 segments' : '0 segments', cta: pct >= 100 ? 'Review' : pct > 0 ? 'Add another' : 'Add segment' },
    tech: { records: pct > 0 ? '4 technologies · 11 patents' : '0 technologies', cta: pct >= 100 ? 'Review' : pct > 0 ? 'Add another' : 'Add technology' },
    hr:   { records: pct > 0 ? '3 snapshots · 2022–24' : '0 snapshots', cta: pct >= 100 ? 'Review' : pct > 0 ? 'New snapshot' : 'Add snapshot' },
    sc:   { records: pct > 0 ? '17 edges · 9 sup · 6 cust' : '0 edges', cta: pct >= 100 ? 'Review' : pct > 0 ? 'Add edge' : 'Add relationship' },
    inv:  { records: pct > 0 ? '2 snapshots · 2023–24' : '0 snapshots', cta: pct >= 100 ? 'Review' : pct > 0 ? 'New snapshot' : 'Add snapshot' },
    esg:  { records: pct > 0 ? '1 snapshot · 2024' : '0 snapshots', cta: pct >= 100 ? 'Review' : pct > 0 ? 'New snapshot' : 'Add snapshot' },
  };
  const r = recordHints[domain];
  return (
    <button type="button" onClick={onClick}
      style={{
        background: T.surface, border: `1px solid ${T.line}`,
        borderRadius: 8, padding: 18,
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 120ms, transform 120ms, box-shadow 120ms',
        borderTop: `2px solid ${d.color}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = d.color;
        e.currentTarget.style.boxShadow = `0 2px 8px ${d.color}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.line;
        e.currentTarget.style.borderTop = `2px solid ${d.color}`;
        e.currentTarget.style.boxShadow = 'none';
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <DomainPill domain={domain} />
        <Ring pct={pct} size={28} color={d.color} thickness={3.5} />
      </div>
      <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted, marginBottom: 4 }}>
        {r?.records}
      </div>
      <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: d.color, fontWeight: 600 }}>
        + {r?.cta}
      </div>
    </button>
  );
}

function PreviewRowSmall({ k, v }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '6px 0',
      fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
    }}>
      <span style={{ color: T.muted }}>{k}</span>
      <span style={{ color: T.ink2 }}>{v}</span>
    </div>
  );
}

// =========================================================================
// VALUE CHAIN PAGE — input form
// =========================================================================
function ValueChainPage({ firm }) {
  const [segment, setSegment] = React.useState('');
  const [activity, setActivity] = React.useState('');
  const [productDesc, setProductDesc] = React.useState('');
  const [certs, setCerts] = React.useState([]);
  const [markets, setMarkets] = React.useState([]);
  const [techLevel, setTechLevel] = React.useState('');

  const seg = VC_TAXONOMY[segment];

  const toggle = (arr, setArr, v) => {
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  const save = () => {
    window.toast?.(`Value-chain entry saved · ${seg?.label} segment`, { kind: 'success', sub: '+1 record · ${firm.name_en}' });
    setSegment(''); setActivity(''); setProductDesc(''); setCerts([]); setMarkets([]); setTechLevel('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      {/* Left — form + existing list */}
      <div>
        {/* Existing entries */}
        <SectionTitle>
          <span>Recorded segments · 2</span>
          <span style={{ color: T.muted, fontSize: 12, fontWeight: 400 }}>
            A firm may occupy more than one segment
          </span>
        </SectionTitle>
        <Card pad={0} style={{ marginBottom: 24 }}>
          {[
            { seg: 'midstream', act: 'Ground systems', desc: 'Gateway antennas + TT&C software', tech: 'Advanced', certs: ['ISO 9001', 'AS9100D'], src: 'BOI' },
            { seg: 'downstream', act: 'Satellite data services', desc: 'EO data + analytics for ASEAN customers', tech: 'Mature', certs: ['ISO 27001'], src: 'GISTDA' },
          ].map((e, i, arr) => (
            <div key={i} style={{
              padding: 18,
              borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${T.line}`,
              display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'flex-start',
            }}>
              <SegmentChip segment={e.seg} />
              <div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink }}>
                  {e.act}
                </div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.muted, marginTop: 2, marginBottom: 8 }}>
                  {e.desc}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Pill color={T.muted} size="sm">tech · {e.tech}</Pill>
                  {e.certs.map(c => <Pill key={c} color={T.muted} size="sm">{c}</Pill>)}
                  <Pill color={T.accent} size="sm">src · {e.src}</Pill>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button kind="ghost" size="sm">Edit</Button>
                <Button kind="ghost" size="sm">⋯</Button>
              </div>
            </div>
          ))}
        </Card>

        {/* Add new */}
        <SectionTitle>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: DOMAIN_META.vc.color }}>+</span>
            Add value-chain entry
          </span>
        </SectionTitle>
        <Card pad={24}>
          <Field label="Segment" required hint="Upstream → Midstream → Downstream — pick one">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {Object.entries(VC_TAXONOMY).map(([key, s]) => (
                <SegmentPicker key={key} segKey={key} segment={s}
                  selected={segment === key}
                  onClick={() => { setSegment(key); setActivity(''); }} />
              ))}
            </div>
          </Field>

          {segment && (
            <div style={{ marginTop: 18, animation: 'slideUp 200ms ease' }}>
              <Field label="Sub-activity" required hint={`Selected ${seg.label} → choose specific activity`}>
                <Select value={activity} onChange={setActivity}
                  placeholder="Select…"
                  options={seg.activities.map(a => ({ value: a.id, label: a.label }))} />
              </Field>
            </div>
          )}

          {activity && (
            <div style={{ marginTop: 18, animation: 'slideUp 200ms ease' }}>
              <Field label="Product / service description" hint="Free text · keep concise" optional>
                <Textarea rows={2} value={productDesc} onChange={setProductDesc}
                  placeholder="e.g. Phased-array antennas for low-earth orbit gateways…" />
              </Field>
            </div>
          )}

          {activity && (
            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Technology level" optional>
                <Segmented value={techLevel} onChange={setTechLevel}
                  options={[
                    { value: 'basic', label: 'Basic' },
                    { value: 'mature', label: 'Mature' },
                    { value: 'advanced', label: 'Advanced' },
                  ]} />
              </Field>
              <Field label="Target markets" hint="Multi-select" optional>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {TARGET_MARKETS.slice(0, 6).map(m => (
                    <Chip key={m.id} label={m.name}
                      on={markets.includes(m.id)}
                      onClick={() => toggle(markets, setMarkets, m.id)}
                      color={DOMAIN_META.vc.color} />
                  ))}
                </div>
              </Field>
            </div>
          )}

          {activity && (
            <Field label="Quality certifications" hint="Pulled from reference table · multi-select" optional>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                {CERTIFICATIONS.map(c => (
                  <Chip key={c} label={c}
                    on={certs.includes(c)}
                    onClick={() => toggle(certs, setCerts, c)}
                    color={DOMAIN_META.vc.color} />
                ))}
              </div>
            </Field>
          )}

          <Divider />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <Button kind="ghost" onClick={() => { setSegment(''); setActivity(''); }}>Cancel</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button kind="secondary" disabled={!activity}>Save & add another</Button>
              <Button kind="primary" disabled={!activity} onClick={save}>
                Save entry <Kbd>⌘↵</Kbd>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right — provenance reminder + taxonomy reference */}
      <ProvenanceReminder domain="vc" />
    </div>
  );
}

function SegmentPicker({ segKey, segment, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        padding: '12px 14px',
        border: `1px solid ${selected ? segment.color : T.line}`,
        background: selected ? `${segment.color}10` : T.surface,
        borderRadius: 8, cursor: 'pointer', textAlign: 'left',
        transition: 'all 120ms',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: segment.color }}></span>
        <span style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600,
          color: selected ? segment.color : T.ink,
        }}>{segment.label}</span>
      </div>
      <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11, color: T.muted, marginLeft: 16 }}>
        {segment.th} · {segment.activities.length} activities
      </div>
    </button>
  );
}

function SegmentChip({ segment }) {
  const s = VC_TAXONOMY[segment];
  return (
    <div style={{
      width: 110, padding: '8px 10px',
      background: `${s.color}10`,
      borderLeft: `3px solid ${s.color}`,
      borderRadius: 4,
      fontFamily: 'Sarabun, sans-serif',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: s.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {s.label}
      </div>
      <div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{s.th}</div>
    </div>
  );
}

// =========================================================================
// TECHNOLOGY PAGE
// =========================================================================
function TechnologyPage({ firm }) {
  const [techName, setTechName] = React.useState('');
  const [trl, setTrl] = React.useState(0);
  const [patents, setPatents] = React.useState('');
  const [rd, setRd] = React.useState('');
  const [infra, setInfra] = React.useState([]);

  const trlBand = trl === 0 ? null : trl <= 3 ? { c: T.danger, l: 'Research' } : trl <= 6 ? { c: T.warn, l: 'Development' } : { c: T.ok, l: 'Deployment' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        <SectionTitle>
          <span>Recorded technologies · 4</span>
          <Button kind="secondary" size="sm" icon="✎">Edit scalar profile (TRL, R&D)</Button>
        </SectionTitle>
        <Card pad={0} style={{ marginBottom: 24 }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Technology</th>
                <th style={thStyle}>TRL</th>
                <th style={thStyle}>Patents</th>
                <th style={thStyle}>R&D spend</th>
                <th style={thStyle}>Infrastructure</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Phased-array antenna', trl: 7, pat: 4, rd: '฿58M', infra: ['Anechoic chamber', 'RF lab'], src: 'NRIIS' },
                { name: 'Earth-observation payload', trl: 7, pat: 5, rd: '฿72M', infra: ['Clean room', 'Optics lab'], src: 'NRIIS' },
                { name: 'SAR signal processing', trl: 6, pat: 2, rd: '฿18M', infra: ['Compute cluster'], src: 'Survey' },
                { name: 'On-board edge AI', trl: 3, pat: 0, rd: '฿10M', infra: ['FPGA bench'], src: 'Manual' },
              ].map((t, i, arr) => (
                <tr key={i} className="wb-row-hover" style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}><strong style={{ color: T.ink }}>{t.name}</strong></td>
                  <td style={tdStyle}>
                    <TrlChip trl={t.trl} />
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>{t.pat}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>{t.rd}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {t.infra.map(x => <Pill key={x} color={T.muted} size="sm">{x}</Pill>)}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Pill color={T.accent} size="sm">{t.src}</Pill>
                  </td>
                  <td style={tdStyle}><Button kind="ghost" size="sm">⋯</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Add new */}
        <SectionTitle>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: DOMAIN_META.tech.color }}>+</span>
            Add a technology
          </span>
        </SectionTitle>
        <Card pad={24}>
          <div style={{ display: 'grid', gap: 18 }}>
            <Field label="Technology name" required>
              <Input value={techName} onChange={setTechName}
                placeholder="e.g. Phased-array antenna, propulsion thruster…" />
            </Field>

            <Field label="Technology Readiness Level (TRL)" required
              hint="1–9. NASA TRL scale. Required by §3 Data Standardization.">
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 4,
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
                  const band = n <= 3 ? T.danger : n <= 6 ? T.warn : T.ok;
                  return (
                    <button key={n} type="button" onClick={() => setTrl(n)}
                      style={{
                        padding: '12px 0',
                        border: `1px solid ${trl === n ? band : T.line}`,
                        background: trl === n ? `${band}15` : T.surface,
                        borderRadius: 6, cursor: 'pointer',
                        fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
                        fontSize: 16, color: trl === n ? band : T.muted,
                        transition: 'all 120ms',
                      }}>
                      {n}
                    </button>
                  );
                })}
              </div>
              {trlBand && (
                <div style={{
                  marginTop: 8, padding: '6px 10px',
                  background: `${trlBand.c}10`, borderRadius: 4,
                  fontFamily: 'Sarabun, sans-serif', fontSize: 12,
                  color: trlBand.c, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 6, height: 6, background: trlBand.c, borderRadius: '50%' }}></span>
                  TRL {trl} · {trlBand.l} stage
                </div>
              )}
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Field label="Patents granted" optional>
                <Input value={patents} onChange={v => setPatents(v.replace(/\D/g, ''))}
                  placeholder="0" mono suffix="patents" />
              </Field>
              <Field label="R&D investment" optional hint="Annual · Thai Baht">
                <Input value={rd} onChange={v => setRd(v.replace(/\D/g, ''))}
                  placeholder="0" mono prefix="฿" suffix="THB · annual" />
              </Field>
            </div>

            <Field label="R&D infrastructure" hint="Multi-select" optional>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['Anechoic chamber', 'Clean room (ISO 7+)', 'Optics lab', 'RF lab', 'Compute cluster', 'FPGA bench', 'Vibration table', 'Thermal vacuum chamber'].map(x => (
                  <Chip key={x} label={x} on={infra.includes(x)}
                    onClick={() => setInfra(infra.includes(x) ? infra.filter(y => y !== x) : [...infra, x])}
                    color={DOMAIN_META.tech.color} />
                ))}
              </div>
            </Field>
          </div>

          <Divider />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <Button kind="ghost">Cancel</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button kind="secondary" disabled={!techName || !trl}>Save & add another</Button>
              <Button kind="primary" disabled={!techName || !trl}
                onClick={() => window.toast?.('Technology saved', { kind: 'success' })}>
                Save <Kbd>⌘↵</Kbd>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <ProvenanceReminder domain="tech" />
    </div>
  );
}

function TrlChip({ trl }) {
  const c = trl <= 3 ? T.danger : trl <= 6 ? T.warn : T.ok;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4,
      background: `${c}15`, color: c,
      fontFamily: 'Sarabun, sans-serif', fontSize: 11, fontWeight: 700,
    }}>
      TRL {trl}
    </span>
  );
}

// =========================================================================
// SUPPLY CHAIN — drawer pattern
// =========================================================================
function SupplyChainPage({ firm }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        <SectionTitle>
          <span>Relationships · 17 firm-to-firm edges</span>
          <Button kind="primary" size="sm" icon="+" onClick={() => setDrawerOpen(true)}>
            Add relationship
          </Button>
        </SectionTitle>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Pill color={T.domains.sc} size="sm">9 suppliers</Pill>
          <Pill color={T.domains.tech} size="sm">6 customers</Pill>
          <Pill color={T.domains.hr} size="sm">2 partners</Pill>
        </div>

        <Card pad={0}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Target firm</th>
                <th style={thStyle}>Direction</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Mongkut Optics Ltd.', 'มงกุฎ ออปติคส์', 'out', 'supplier', 'Optical mirrors for EO payload', 'NRIIS'],
                ['Sailom Composites Co.', 'สายลม คอมโพสิต', 'out', 'supplier', 'Carbon-fiber bus structures', 'BOI'],
                ['Samut Semiconductor', 'สมุทร เซมิคอนดักเตอร์', 'out', 'supplier', 'FPGA / radhard ICs', 'BOI'],
                ['GISTDA Sriracha', 'GISTDA ศรีราชา', 'in', 'customer', 'Ground-station gateway services', 'GISTDA'],
                ['National Telecom PCL', 'NT', 'in', 'customer', 'Backhaul + downlink', 'DBD'],
                ['Mahidol Space Lab', 'มหิดล สเปซแล็บ', 'out', 'partner', 'R&D collaboration on edge AI', 'NRIIS'],
                ['Phuket Earth Stn.', 'ภูเก็ต Earth Stn.', 'in', 'customer', 'EO data downlink', 'GISTDA'],
              ].map((r, i) => (
                <tr key={i} className="wb-row-hover" style={{ cursor: 'pointer' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: T.ink }}>{r[0]}</div>
                    <div style={{ fontSize: 11.5, color: T.muted }}>{r[1]}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
                      color: r[2] === 'out' ? T.muted : T.accent,
                      fontWeight: 600,
                    }}>
                      {r[2] === 'out' ? '→ Outgoing' : '← Incoming'}
                    </span>
                  </td>
                  <td style={tdStyle}><Pill color={r[3] === 'supplier' ? T.domains.sc : r[3] === 'customer' ? T.domains.tech : T.domains.hr} size="sm">{r[3]}</Pill></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12.5, color: T.ink2 }}>{r[4]}</span>
                  </td>
                  <td style={tdStyle}><Pill color={T.accent} size="sm">{r[5]}</Pill></td>
                  <td style={tdStyle}><Button kind="ghost" size="sm">⋯</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{
          marginTop: 16, padding: 14,
          background: T.subtle, borderRadius: 8,
          fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.muted,
          display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1.5,
        }}>
          <span style={{ color: T.accent }}>◆</span>
          These edges power the value-chain network view in Phase 2. Edges are directed —
          add an outgoing supplier and we won't create the reverse automatically.
        </div>
      </div>

      <ProvenanceReminder domain="sc" />

      <AddRelationshipDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} firm={firm} />
    </div>
  );
}

function AddRelationshipDrawer({ open, onClose, firm }) {
  const [target, setTarget] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [relType, setRelType] = React.useState('');
  const [direction, setDirection] = React.useState('out');
  const [desc, setDesc] = React.useState('');
  const [source, setSource] = React.useState('');

  const suggestions = FIRMS.filter(f =>
    f.id !== firm.id && target.length > 0 &&
    (f.name_en.toLowerCase().includes(target.toLowerCase()) ||
     f.name_th.toLowerCase().includes(target.toLowerCase()))
  ).slice(0, 4);

  return (
    <Drawer open={open} onClose={onClose}
      title="Add firm-to-firm relationship"
      footer={
        <>
          <Button kind="ghost" onClick={onClose}>Cancel</Button>
          <Button kind="secondary" disabled={!selected || !relType}>Save & add another</Button>
          <Button kind="primary" disabled={!selected || !relType}
            onClick={() => {
              window.toast?.(`Relationship saved · ${firm.name_en} ${direction === 'out' ? '→' : '←'} ${selected.name_en}`,
                { kind: 'success' });
              onClose();
            }}>
            Save
          </Button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Direction segmented */}
        <Field label="Direction" required>
          <Segmented value={direction} onChange={setDirection}
            options={[
              { value: 'out', label: '→ Outgoing (this firm supplies / partners)' },
              { value: 'in',  label: '← Incoming (this firm receives / is customer)' },
            ]} />
        </Field>

        {/* Target firm typeahead */}
        <Field label="Target firm" required hint="Search firms already in the system. If missing, onboard first.">
          {!selected && (
            <Input value={target}
              onChange={v => { setTarget(v); setShowSuggestions(true); }}
              placeholder="Type a firm name…" prefix="⌕" />
          )}
          {selected && (
            <div style={{
              padding: '10px 12px',
              border: `1px solid ${T.accent}`, background: T.accentSoft,
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600, color: T.ink }}>
                  {selected.name_en}
                </div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted }}>
                  {selected.name_th} · JID {selected.juristic}
                </div>
              </div>
              <Button kind="ghost" size="sm" onClick={() => { setSelected(null); setTarget(''); }}>×</Button>
            </div>
          )}
          {showSuggestions && !selected && suggestions.length > 0 && (
            <div style={{
              marginTop: 4, border: `1px solid ${T.line}`, borderRadius: 6,
              background: T.surface, overflow: 'hidden',
            }}>
              {suggestions.map(f => (
                <div key={f.id}
                  onClick={() => { setSelected(f); setShowSuggestions(false); }}
                  style={{
                    padding: '10px 12px', cursor: 'pointer',
                    borderBottom: `1px solid ${T.line}`,
                  }} className="wb-row-hover">
                  <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 500, color: T.ink }}>{f.name_en}</div>
                  <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted }}>{f.name_th}</div>
                </div>
              ))}
            </div>
          )}
          {showSuggestions && !selected && target.length > 1 && suggestions.length === 0 && (
            <div style={{
              marginTop: 8, padding: '10px 12px',
              background: T.warnSoft, borderRadius: 6,
              fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.ink2,
            }}>
              Not in system. <a onClick={() => go('/firms/new')} style={{ color: T.accent, fontWeight: 600, cursor: 'pointer' }}>Onboard this firm first →</a>
            </div>
          )}
        </Field>

        <Field label="Relationship type" required hint="From ref_relationship_type — controlled vocabulary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {['supplier', 'customer', 'partner', 'tech_provider', 'raw_material'].map(t => (
              <Chip key={t} label={t.replace('_', ' ')} on={relType === t} onClick={() => setRelType(t)}
                color={DOMAIN_META.sc.color} />
            ))}
          </div>
        </Field>

        <Field label="Description" hint="Free text · keep concise" optional>
          <Textarea rows={2} value={desc} onChange={setDesc}
            placeholder="e.g. Carbon-fiber bus components supplied since 2020…" />
        </Field>

        <Divider />

        <SubSection label="Provenance" sub="Required on every record">
          <Field label="Source" required>
            <Select value={source} onChange={setSource} placeholder="Select…"
              options={SOURCES.map(s => ({ value: s.id, label: s.name }))} />
          </Field>
        </SubSection>
      </div>
    </Drawer>
  );
}

// =========================================================================
// PLACEHOLDER PAGES (HR, Investment, ESG) — quick coverage
// =========================================================================
function HrPage({ firm }) {
  return (
    <SimpleInputPage firm={firm} domain="hr" title="Human resources"
      th="ทรัพยากรบุคคล · time-series snapshots — one row per reporting year"
      sample={[
        { year: 2024, engineers: 142, researchers: 38, technicians: 96, gaps: 'RF design, embedded systems' },
        { year: 2023, engineers: 128, researchers: 32, technicians: 88, gaps: 'Same' },
        { year: 2022, engineers: 110, researchers: 28, technicians: 78, gaps: 'Optical payload' },
      ]} cols={['Year', 'Engineers', 'Researchers', 'Technicians', 'Skill gaps']}
    />
  );
}
function InvestmentPage({ firm }) {
  return (
    <SimpleInputPage firm={firm} domain="inv" title="Investment & financial"
      th="การลงทุนและการเงิน · annual financial snapshots"
      sample={[
        { year: 2024, revenue: '฿1.84B', export: '38%', incentive: 'BOI A1', funding: 'NRIIS ฿24M' },
        { year: 2023, revenue: '฿1.52B', export: '32%', incentive: 'BOI A1', funding: '—' },
      ]} cols={['Year', 'Revenue', 'Export %', 'BOI status', 'Other funding']}
    />
  );
}
function EsgPage({ firm }) {
  return (
    <SimpleInputPage firm={firm} domain="esg" title="Sustainability & ESG"
      th="ความยั่งยืนและ ESG · self-reported · confidence flag required"
      sample={[
        { year: 2024, ghg: '1820 tCO₂e', energy: '2820 MWh', renew: '41%', waste: '38%', conf: 'reported' },
      ]} cols={['Year', 'GHG · scope 1+2', 'Energy', 'Renewable %', 'Waste recycled', 'Confidence']}
    />
  );
}
function SimpleInputPage({ firm, domain, title, th, sample, cols }) {
  const d = DOMAIN_META[domain];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        <SectionTitle>
          <span>Snapshots · {sample.length}</span>
          <Button kind="primary" size="sm" icon="+" onClick={() => window.toast?.(`+ New ${title} snapshot form — full version when expanded`, { kind: '' })}>
            New snapshot
          </Button>
        </SectionTitle>

        <Card pad={0}>
          <table style={tableStyle}>
            <thead>
              <tr>{cols.map(c => <th key={c} style={thStyle}>{c}</th>)}<th style={thStyle}></th></tr>
            </thead>
            <tbody>
              {sample.map((s, i) => (
                <tr key={i} className="wb-row-hover" style={{ cursor: 'pointer' }}>
                  {Object.values(s).map((v, j) => (
                    <td key={j} style={tdStyle}>
                      {typeof v === 'number' ? <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{v}</span> : v}
                    </td>
                  ))}
                  <td style={tdStyle}><Button kind="ghost" size="sm">⋯</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{
          marginTop: 16, padding: 16,
          background: T.subtle, borderRadius: 8,
          fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.muted,
          display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5,
        }}>
          <span style={{ color: d.color, fontSize: 16 }}>◆</span>
          <div>
            <strong style={{ color: T.ink }}>Time-series domain.</strong>{' '}
            New snapshots are inserted as new rows — prior years are preserved.
            Editing an existing snapshot creates an audit-log entry with before/after diff.
          </div>
        </div>
      </div>

      <ProvenanceReminder domain={domain} />
    </div>
  );
}

// =========================================================================
// Right-rail provenance reminder (shared by all domain pages)
// =========================================================================
function ProvenanceReminder({ domain }) {
  const d = DOMAIN_META[domain];
  return (
    <div style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
        color: T.muted2, letterSpacing: '0.1em',
        textTransform: 'uppercase', fontWeight: 600,
        marginBottom: 10, paddingLeft: 4,
      }}>About this domain</div>
      <Card pad={18} style={{ borderTop: `2px solid ${d.color}` }}>
        <DomainPill domain={domain} />
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 13, color: T.ink2,
          marginTop: 10, lineHeight: 1.5,
        }}>
          Every record you add to <strong>{d.name}</strong> carries its own source attribution,
          confidence flag, and reporting period. These travel with the record and are
          queryable later for audit and data-quality reports.
        </div>
        <Divider />
        <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
          Linked sources for this firm
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          {SOURCES.slice(0, 4).map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.ink2,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }}></span>
              {s.name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { FirmDetailPage });
