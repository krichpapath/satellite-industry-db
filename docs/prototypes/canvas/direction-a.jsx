// Direction A — Calm Authority
// Government / academic register. Parchment + navy + maroon accent.
// IBM Plex Serif for headings, IBM Plex Sans for body, Sarabun for Thai.

function DirectionA() {
  const dirAStyles = {
    root: {
      width: 1320,
      height: 900,
      background: '#fbfaf7',
      color: '#0d1b2a',
      fontFamily: '"IBM Plex Sans", "Sarabun", system-ui, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
      display: 'grid',
      gridTemplateRows: '56px 1fr',
      overflow: 'hidden',
      position: 'relative',
    },
    // -------- Header --------
    header: {
      display: 'grid',
      gridTemplateColumns: '240px 1fr auto',
      alignItems: 'center',
      borderBottom: '1px solid #d9dee5',
      background: '#fbfaf7',
      padding: '0 20px',
      gap: 16,
    },
    brand: {
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: '"IBM Plex Serif", Georgia, serif',
      fontWeight: 500, fontSize: 16, color: '#0b2340',
      letterSpacing: '-0.005em',
    },
    brandMark: {
      width: 22, height: 22, borderRadius: 2,
      background: '#0b2340',
      display: 'grid', placeItems: 'center',
      color: '#fbfaf7', fontFamily: '"IBM Plex Serif", serif',
      fontWeight: 600, fontSize: 13,
    },
    search: {
      maxWidth: 480, justifySelf: 'start', width: '100%',
      display: 'flex', alignItems: 'center', gap: 8,
      border: '1px solid #d9dee5', background: '#fff',
      padding: '6px 10px', borderRadius: 2,
      color: '#5b6b80', fontSize: 13,
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
    langToggle: {
      display: 'flex', border: '1px solid #d9dee5', borderRadius: 2,
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
      letterSpacing: '0.06em', overflow: 'hidden',
    },
    langOn: { padding: '5px 10px', background: '#0b2340', color: '#fbfaf7' },
    langOff: { padding: '5px 10px', background: '#fff', color: '#5b6b80' },
    plannerBadge: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', border: '1px solid #d9dee5',
      borderRadius: 2, fontSize: 12, color: '#1f2d3d',
      background: '#fff',
    },
    plannerDot: { width: 7, height: 7, borderRadius: '50%', background: '#2f6b4f' },
    // -------- Body 3-col --------
    body: { display: 'grid', gridTemplateColumns: '240px 1fr 300px', overflow: 'hidden' },
    sidebar: {
      borderRight: '1px solid #d9dee5',
      background: '#f4f1ea',
      padding: '16px 0',
      overflow: 'auto',
    },
    sbGroup: { padding: '0 16px', marginBottom: 18 },
    sbLabel: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#8a98ab', marginBottom: 8,
    },
    sbItem: (active) => ({
      display: 'grid', gridTemplateColumns: '24px 1fr 32px',
      alignItems: 'center', gap: 10,
      padding: '7px 10px',
      borderLeft: active ? '2px solid #9a3324' : '2px solid transparent',
      background: active ? '#fbfaf7' : 'transparent',
      color: active ? '#0d1b2a' : '#1f2d3d',
      fontWeight: active ? 600 : 400,
      fontSize: 13.5, cursor: 'pointer',
    }),
    sbCount: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      color: '#5b6b80', textAlign: 'right', letterSpacing: '0.04em',
    },
    // -------- Main --------
    main: { padding: '20px 28px', overflow: 'auto', minWidth: 0 },
    crumb: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      color: '#5b6b80', marginBottom: 14,
    },
    crumbAccent: { color: '#0d1b2a' },
    title: {
      fontFamily: '"IBM Plex Serif", Georgia, serif',
      fontWeight: 500, fontSize: 30, lineHeight: 1.15,
      letterSpacing: '-0.01em', color: '#0b2340', marginBottom: 4,
    },
    titleTh: {
      fontFamily: 'Sarabun, sans-serif', fontSize: 17,
      color: '#5b6b80', marginBottom: 16,
    },
    metaRow: {
      display: 'flex', gap: 24, alignItems: 'center',
      paddingBottom: 14, borderBottom: '1px solid #d9dee5',
      marginBottom: 18, flexWrap: 'wrap',
    },
    metaItem: { display: 'flex', flexDirection: 'column', gap: 2 },
    metaLabel: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#8a98ab',
    },
    metaVal: { fontSize: 13.5, color: '#0d1b2a' },
    metaValMono: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 13,
      color: '#0d1b2a', letterSpacing: '0.02em',
    },
    statusPill: {
      display: 'inline-block', padding: '2px 8px',
      background: '#e0efe6', color: '#2f6b4f',
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      borderRadius: 2,
    },
    sectionH: {
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSize: 11.5, fontWeight: 600, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#5b6b80',
      marginBottom: 10, marginTop: 22,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    statGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
    },
    statCard: {
      background: '#fff', border: '1px solid #d9dee5',
      padding: '14px 16px',
    },
    statTop: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 8,
    },
    statTitle: { fontSize: 12, color: '#5b6b80', fontWeight: 500 },
    statSource: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5,
      color: '#9a3324', background: '#f8e1dc', padding: '1px 5px',
      borderRadius: 2, letterSpacing: '0.04em',
    },
    statVal: {
      fontFamily: '"IBM Plex Serif", Georgia, serif',
      fontWeight: 500, fontSize: 26, color: '#0b2340',
      lineHeight: 1, marginBottom: 2,
    },
    statSub: { fontSize: 11.5, color: '#5b6b80' },
    activityTable: {
      background: '#fff', border: '1px solid #d9dee5',
    },
    actRow: {
      display: 'grid', gridTemplateColumns: '90px 1fr 110px 90px',
      padding: '10px 14px', borderBottom: '1px solid #e8ecf1',
      fontSize: 13, alignItems: 'center',
    },
    actDate: { fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, color: '#5b6b80' },
    actDelta: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      color: '#5b6b80', textTransform: 'uppercase', letterSpacing: '0.06em',
    },
    // -------- Right rail --------
    rail: {
      borderLeft: '1px solid #d9dee5',
      background: '#f4f1ea',
      padding: 20,
      overflow: 'auto',
    },
    railLabel: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#5b6b80', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    railLabelDot: { width: 6, height: 6, borderRadius: '50%', background: '#9a3324' },
    provCard: {
      background: '#fff', border: '1px solid #d9dee5',
      padding: 14, marginBottom: 14,
    },
    provRow: {
      paddingTop: 8, marginTop: 8, borderTop: '1px solid #e8ecf1',
    },
    provKey: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      color: '#8a98ab', marginBottom: 3,
    },
    provVal: { fontSize: 13, color: '#0d1b2a' },
    confidenceChip: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px', background: '#e0efe6',
      color: '#2f6b4f', borderRadius: 2,
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    },
    auditCard: {
      background: '#fff', border: '1px solid #d9dee5',
      padding: 14, fontSize: 12.5, color: '#1f2d3d',
    },
  };

  // Sidebar items
  const domains = [
    { key: 'overview', icon: '◐', name_en: 'Overview', name_th: 'ภาพรวม', pct: 86, count: '—', active: true },
    { key: 'vc', icon: '◇', name_en: 'Value Chain', name_th: 'ห่วงโซ่คุณค่า', pct: 100, count: '2' },
    { key: 'tech', icon: '⚙', name_en: 'Technology', name_th: 'เทคโนโลยี', pct: 78, count: '4' },
    { key: 'hr', icon: '◯', name_en: 'Human Resources', name_th: 'ทรัพยากรบุคคล', pct: 60, count: '3' },
    { key: 'sc', icon: '⇄', name_en: 'Supply Chain', name_th: 'ห่วงโซ่อุปทาน', pct: 92, count: '17' },
    { key: 'inv', icon: '฿', name_en: 'Investment', name_th: 'การลงทุน', pct: 55, count: '2' },
    { key: 'esg', icon: '◑', name_en: 'ESG', name_th: 'ESG', pct: 40, count: '1' },
  ];

  const CompletenessRing = ({ pct }) => {
    const r = 9, c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    return (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r={r} fill="none" stroke="#d9dee5" strokeWidth="2.5" />
        <circle cx="12" cy="12" r={r} fill="none"
          stroke={pct >= 80 ? '#2f6b4f' : pct >= 50 ? '#0b2340' : '#9a3324'}
          strokeWidth="2.5" strokeDasharray={`${dash} ${c}`}
          strokeLinecap="butt" transform="rotate(-90 12 12)" />
      </svg>
    );
  };

  return (
    <div style={dirAStyles.root}>
      {/* HEADER */}
      <div style={dirAStyles.header}>
        <div style={dirAStyles.brand}>
          <div style={dirAStyles.brandMark}>S</div>
          <div>
            <div style={{ lineHeight: 1.1 }}>Satellite Industry DB</div>
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 11,
              color: '#5b6b80', fontWeight: 400, marginTop: 1,
            }}>ฐานข้อมูลอุตสาหกรรมดาวเทียม</div>
          </div>
        </div>
        <div style={dirAStyles.search}>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>/</span>
          <span>Search firms, sources, taxonomies…</span>
          <span style={{
            marginLeft: 'auto', fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10, color: '#8a98ab', letterSpacing: '0.06em',
            border: '1px solid #d9dee5', padding: '0 5px', borderRadius: 2,
          }}>⌘K</span>
        </div>
        <div style={dirAStyles.headerRight}>
          <div style={dirAStyles.langToggle}>
            <span style={dirAStyles.langOn}>EN</span>
            <span style={{ ...dirAStyles.langOff, fontFamily: 'Sarabun, sans-serif' }}>ไทย</span>
          </div>
          <div style={dirAStyles.plannerBadge}>
            <div style={dirAStyles.plannerDot}></div>
            <span>Data Planner</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={dirAStyles.body}>
        {/* SIDEBAR */}
        <div style={dirAStyles.sidebar}>
          <div style={dirAStyles.sbGroup}>
            <div style={dirAStyles.sbLabel}>FIRM</div>
            <div style={{
              fontFamily: '"IBM Plex Serif", serif', fontSize: 14,
              color: '#0b2340', lineHeight: 1.3, fontWeight: 500,
            }}>Starfield Aerospace<br/>
              <span style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: '#5b6b80', fontWeight: 400 }}>
                สตาร์ฟิลด์ แอโรสเปซ
              </span>
            </div>
            <div style={{
              marginTop: 6, fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 10.5, color: '#5b6b80', letterSpacing: '0.04em',
            }}>JID 0107554000372</div>
          </div>
          <div style={dirAStyles.sbGroup}>
            <div style={dirAStyles.sbLabel}>DOMAINS</div>
            {domains.map(d => (
              <div key={d.key} style={dirAStyles.sbItem(d.active)}>
                <CompletenessRing pct={d.pct} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name_en}</span>
                </div>
                <div style={dirAStyles.sbCount}>{d.pct}%</div>
              </div>
            ))}
          </div>
          <div style={{ ...dirAStyles.sbGroup, marginTop: 26 }}>
            <div style={dirAStyles.sbLabel}>GOVERNANCE</div>
            <div style={{ fontSize: 12.5, color: '#1f2d3d', padding: '6px 10px' }}>
              ⤳  Audit timeline
            </div>
            <div style={{ fontSize: 12.5, color: '#1f2d3d', padding: '6px 10px' }}>
              ⌗  Sources (4)
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div style={dirAStyles.main}>
          <div style={dirAStyles.crumb}>
            FIRMS / <span style={dirAStyles.crumbAccent}>STARFIELD AEROSPACE</span> / OVERVIEW
          </div>
          <div style={dirAStyles.title}>Starfield Aerospace Co., Ltd.</div>
          <div style={dirAStyles.titleTh}>บริษัท สตาร์ฟิลด์ แอโรสเปซ จำกัด (มหาชน)</div>

          <div style={dirAStyles.metaRow}>
            <div style={dirAStyles.metaItem}>
              <div style={dirAStyles.metaLabel}>JURISTIC ID</div>
              <div style={dirAStyles.metaValMono}>0107554000372</div>
            </div>
            <div style={dirAStyles.metaItem}>
              <div style={dirAStyles.metaLabel}>FOUNDED</div>
              <div style={dirAStyles.metaVal}>2011 · 14 yrs</div>
            </div>
            <div style={dirAStyles.metaItem}>
              <div style={dirAStyles.metaLabel}>OWNERSHIP</div>
              <div style={dirAStyles.metaVal}>Public · Listed (SET)</div>
            </div>
            <div style={dirAStyles.metaItem}>
              <div style={dirAStyles.metaLabel}>HQ</div>
              <div style={dirAStyles.metaVal}>Pathum Thani · TH</div>
            </div>
            <div style={{ ...dirAStyles.metaItem, marginLeft: 'auto' }}>
              <div style={dirAStyles.metaLabel}>STATUS</div>
              <div><span style={dirAStyles.statusPill}>● Published</span></div>
            </div>
          </div>

          <div style={dirAStyles.sectionH}>
            <span>Domain Snapshot</span>
            <span style={{
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
              fontWeight: 400, color: '#8a98ab', letterSpacing: '0.06em',
              textTransform: 'none',
            }}>(as of 2024 reporting period)</span>
          </div>

          <div style={dirAStyles.statGrid}>
            {[
              { title: 'Value-chain segments', val: '2', sub: 'Midstream + Downstream', src: 'BOI' },
              { title: 'Core technologies', val: '4', sub: '2 with TRL ≥ 7', src: 'NRIIS' },
              { title: 'R&D headcount', val: '38', sub: '+6 YoY', src: 'Survey 2024' },
              { title: 'Patents granted', val: '11', sub: '2 in last 12mo', src: 'DIP' },
              { title: 'Supply-chain edges', val: '17', sub: '9 supplier · 6 customer · 2 partner', src: 'Mixed' },
              { title: 'ESG snapshots', val: '1', sub: 'Reporting · 2024', src: 'Self-reported' },
            ].map((s, i) => (
              <div key={i} style={dirAStyles.statCard}>
                <div style={dirAStyles.statTop}>
                  <div style={dirAStyles.statTitle}>{s.title}</div>
                  <div style={dirAStyles.statSource}>{s.src}</div>
                </div>
                <div style={dirAStyles.statVal}>{s.val}</div>
                <div style={dirAStyles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={dirAStyles.sectionH}>
            <span>Recent Activity</span>
            <span style={{
              fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11,
              color: '#9a3324', textTransform: 'none', letterSpacing: 0,
              marginLeft: 'auto', cursor: 'pointer',
            }}>View full audit trail →</span>
          </div>

          <div style={dirAStyles.activityTable}>
            {[
              ['12 May 2026', 'Patent count revised to 11', 'planner.a', 'TECHNOLOGY'],
              ['09 May 2026', 'Linked supplier: Mongkut Optics Ltd.', 'planner.a', 'SUPPLY CHAIN'],
              ['28 Apr 2026', 'ESG snapshot 2024 imported (CSV)', 'planner.a', 'ESG · IMPORT'],
              ['14 Apr 2026', 'TRL 7 confirmed for Phased-Array Antenna', 'planner.a', 'TECHNOLOGY'],
            ].map((row, i) => (
              <div key={i} style={{
                ...dirAStyles.actRow,
                borderBottom: i === 3 ? 'none' : '1px solid #e8ecf1',
              }}>
                <div style={dirAStyles.actDate}>{row[0]}</div>
                <div>{row[1]}</div>
                <div style={dirAStyles.actDate}>{row[2]}</div>
                <div style={dirAStyles.actDelta}>{row[3]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT RAIL — PROVENANCE */}
        <div style={dirAStyles.rail}>
          <div style={dirAStyles.railLabel}>
            <div style={dirAStyles.railLabelDot}></div>
            Provenance
          </div>
          <div style={dirAStyles.provCard}>
            <div style={dirAStyles.provKey}>PRIMARY SOURCE</div>
            <div style={{ ...dirAStyles.provVal, fontWeight: 500 }}>BOI Promotion Registry</div>
            <div style={{ ...dirAStyles.provVal, fontSize: 11.5, color: '#5b6b80', marginTop: 2 }}>
              boi.go.th · 2024 export · received 28 Apr 2026
            </div>
            <div style={dirAStyles.provRow}>
              <div style={dirAStyles.provKey}>CONFIDENCE</div>
              <span style={dirAStyles.confidenceChip}>● Reported</span>
            </div>
            <div style={dirAStyles.provRow}>
              <div style={dirAStyles.provKey}>REPORTING PERIOD</div>
              <div style={dirAStyles.provVal}>FY 2024 · 1 Jan – 31 Dec</div>
            </div>
            <div style={dirAStyles.provRow}>
              <div style={dirAStyles.provKey}>LAST UPDATED</div>
              <div style={dirAStyles.provVal}>12 May 2026 · by planner.a</div>
            </div>
            <div style={dirAStyles.provRow}>
              <div style={dirAStyles.provKey}>CONFIDENTIALITY</div>
              <div style={dirAStyles.provVal}>Public</div>
            </div>
          </div>

          <div style={dirAStyles.railLabel}>
            <div style={{ ...dirAStyles.railLabelDot, background: '#0b2340' }}></div>
            Other Sources on This Firm
          </div>
          <div style={dirAStyles.auditCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>DBD Juristic Registry</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: '#5b6b80' }}>identity</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #e8ecf1' }}>
              <span>NRIIS Researcher DB</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: '#5b6b80' }}>R&amp;D</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #e8ecf1' }}>
              <span>Firm survey · Mar 2026</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: '#5b6b80' }}>HR · ESG</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid #e8ecf1' }}>
              <span>DIP Patent Search</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: '#5b6b80' }}>patents</span>
            </div>
          </div>

          <button style={{
            marginTop: 18, width: '100%', padding: '10px 12px',
            background: '#9a3324', color: '#fff', border: 'none',
            fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 500,
            fontSize: 13, letterSpacing: '0.02em', cursor: 'pointer',
            borderRadius: 2,
          }}>Edit firm record</button>
          <button style={{
            marginTop: 8, width: '100%', padding: '10px 12px',
            background: '#fff', color: '#0b2340',
            border: '1px solid #b5bcc6',
            fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 500,
            fontSize: 13, letterSpacing: '0.02em', cursor: 'pointer',
            borderRadius: 2,
          }}>+ Add domain record</button>
        </div>
      </div>
    </div>
  );
}

window.DirectionA = DirectionA;
