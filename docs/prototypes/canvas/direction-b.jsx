// Direction B — Mission Console
// Aerospace / technical register. Slate-dark surfaces, cyan accent, amber warns,
// mono numerics. Space Grotesk + IBM Plex Mono + Noto Sans Thai.

function DirectionB() {
  const dirBStyles = {
    root: {
      width: 1320,
      height: 900,
      background: '#070b14',
      color: '#dbe5f1',
      fontFamily: '"Space Grotesk", "Noto Sans Thai", system-ui, sans-serif',
      fontSize: 13.5,
      lineHeight: 1.5,
      display: 'grid',
      gridTemplateRows: '52px 1fr',
      overflow: 'hidden',
      position: 'relative',
      // subtle grid background
      backgroundImage:
        'linear-gradient(rgba(90,200,250,0.04) 1px, transparent 1px),' +
        'linear-gradient(90deg, rgba(90,200,250,0.04) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr auto',
      alignItems: 'center',
      borderBottom: '1px solid rgba(90,200,250,0.18)',
      background: '#0a121f',
      padding: '0 18px',
      gap: 16,
    },
    brand: {
      display: 'flex', alignItems: 'center', gap: 10,
      fontWeight: 600, fontSize: 14, letterSpacing: '0.02em',
      color: '#e3ecf7',
    },
    brandMark: {
      width: 24, height: 24, position: 'relative',
      display: 'grid', placeItems: 'center',
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 11, color: '#5ac8fa',
      border: '1px solid #5ac8fa', borderRadius: 2,
      background: 'rgba(90,200,250,0.08)',
    },
    brandSub: {
      fontFamily: 'Noto Sans Thai, sans-serif',
      fontSize: 10.5, color: '#8aa2c2', fontWeight: 400, marginTop: 1,
    },
    statusStrip: {
      display: 'flex', alignItems: 'center', gap: 18,
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 11, letterSpacing: '0.08em', color: '#8aa2c2',
    },
    statusPill: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
    },
    statusDot: (color) => ({ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }),
    headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
    langToggle: {
      display: 'flex', border: '1px solid rgba(90,200,250,0.22)',
      borderRadius: 2,
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
      letterSpacing: '0.08em', overflow: 'hidden',
    },
    langOn: { padding: '4px 10px', background: '#5ac8fa', color: '#062033' },
    langOff: {
      padding: '4px 10px', color: '#8aa2c2',
      fontFamily: 'Noto Sans Thai, monospace',
    },
    plannerBadge: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      border: '1px solid rgba(90,200,250,0.22)',
      borderRadius: 2, fontSize: 11.5, color: '#dbe5f1',
      background: 'rgba(90,200,250,0.04)',
      fontFamily: '"IBM Plex Mono", monospace',
      letterSpacing: '0.04em',
    },

    body: { display: 'grid', gridTemplateColumns: '240px 1fr 300px', overflow: 'hidden' },

    sidebar: {
      borderRight: '1px solid rgba(90,200,250,0.12)',
      background: '#0a121f',
      padding: '16px 0',
      overflow: 'auto',
    },
    sbGroup: { padding: '0 12px', marginBottom: 18 },
    sbLabel: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: '#5ac8fa', marginBottom: 8, opacity: 0.85,
    },
    firmIdCard: {
      border: '1px solid rgba(90,200,250,0.16)',
      background: 'rgba(90,200,250,0.04)',
      padding: '10px 12px', borderRadius: 2,
    },
    sbItem: (active) => ({
      display: 'grid', gridTemplateColumns: '28px 1fr auto',
      alignItems: 'center', gap: 8,
      padding: '7px 10px',
      background: active ? 'rgba(90,200,250,0.08)' : 'transparent',
      borderLeft: active ? '2px solid #5ac8fa' : '2px solid transparent',
      color: active ? '#e3ecf7' : '#9aa9c2',
      fontSize: 13, cursor: 'pointer',
      fontFamily: '"Space Grotesk", sans-serif',
      letterSpacing: '0.005em',
    }),
    sbCount: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      color: '#5ac8fa', letterSpacing: '0.06em',
    },

    main: { padding: '20px 28px', overflow: 'auto', minWidth: 0 },
    crumb: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#5ac8fa', marginBottom: 12,
    },
    crumbAccent: { color: '#e3ecf7' },
    titleRow: {
      display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', marginBottom: 8,
    },
    title: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 500, fontSize: 28, lineHeight: 1.1,
      letterSpacing: '-0.01em', color: '#f3f6fb', marginBottom: 4,
    },
    titleTh: {
      fontFamily: 'Noto Sans Thai, sans-serif', fontSize: 15,
      color: '#9aa9c2', fontWeight: 300,
    },
    statusBadge: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', background: 'rgba(52, 211, 153, 0.1)',
      color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)',
      borderRadius: 2,
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    },
    telemetryRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr) auto',
      gap: 0, marginBottom: 20,
      border: '1px solid rgba(90,200,250,0.18)',
      borderRadius: 2,
      background: 'rgba(90,200,250,0.03)',
    },
    telemCell: {
      padding: '10px 14px',
      borderRight: '1px solid rgba(90,200,250,0.12)',
    },
    telemLabel: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: '#5ac8fa', marginBottom: 4,
    },
    telemVal: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 15,
      color: '#e3ecf7', letterSpacing: '0.02em',
    },
    telemValSm: {
      fontFamily: '"Space Grotesk", sans-serif', fontSize: 13,
      color: '#e3ecf7',
    },

    sectionH: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 11, fontWeight: 500, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: '#5ac8fa',
      marginBottom: 12, marginTop: 18,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    sectionRule: {
      flex: 1, height: 1,
      background: 'linear-gradient(to right, rgba(90,200,250,0.3), transparent)',
    },

    statGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
    },
    statCard: {
      background: 'rgba(90,200,250,0.03)',
      border: '1px solid rgba(90,200,250,0.16)',
      padding: '14px 16px', borderRadius: 2, position: 'relative',
    },
    statCardCorner: {
      position: 'absolute', top: 0, right: 0,
      width: 8, height: 8,
      borderTop: '1px solid #5ac8fa', borderRight: '1px solid #5ac8fa',
    },
    statTop: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 10,
    },
    statTitle: {
      fontSize: 11, color: '#8aa2c2', fontWeight: 400,
      fontFamily: '"IBM Plex Mono", monospace',
      letterSpacing: '0.06em', textTransform: 'uppercase',
    },
    statSource: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5,
      color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)',
      padding: '1px 5px', borderRadius: 2, letterSpacing: '0.04em',
      border: '1px solid rgba(245, 158, 11, 0.25)',
    },
    statVal: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontWeight: 500, fontSize: 26, color: '#e3ecf7',
      lineHeight: 1, marginBottom: 4, letterSpacing: '-0.01em',
    },
    statSub: { fontSize: 11, color: '#9aa9c2' },

    sparkRow: {
      display: 'flex', gap: 2, marginTop: 8, alignItems: 'flex-end',
      height: 18,
    },
    sparkBar: (h, hi) => ({
      width: 4, height: `${h}%`,
      background: hi ? '#5ac8fa' : 'rgba(90,200,250,0.32)',
    }),

    activityTable: {
      background: '#0a121f',
      border: '1px solid rgba(90,200,250,0.16)',
    },
    actRow: {
      display: 'grid', gridTemplateColumns: '110px 1fr 100px 120px',
      padding: '9px 14px', borderBottom: '1px solid rgba(90,200,250,0.08)',
      fontSize: 12.5, alignItems: 'center',
    },
    actDate: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#5ac8fa',
      letterSpacing: '0.04em',
    },
    actUser: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#9aa9c2',
    },
    actDomain: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5,
      color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em',
    },

    rail: {
      borderLeft: '1px solid rgba(90,200,250,0.12)',
      background: '#0a121f',
      padding: 18,
      overflow: 'auto',
    },
    railLabel: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: '#5ac8fa', marginBottom: 12,
      display: 'flex', alignItems: 'center', gap: 8,
    },
    provCard: {
      background: 'rgba(90,200,250,0.03)',
      border: '1px solid rgba(90,200,250,0.16)',
      padding: 14, marginBottom: 14, borderRadius: 2, position: 'relative',
    },
    provRow: {
      paddingTop: 8, marginTop: 8,
      borderTop: '1px solid rgba(90,200,250,0.08)',
    },
    provKey: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#8aa2c2', marginBottom: 3,
    },
    provVal: { fontSize: 12.5, color: '#dbe5f1' },
    confidenceChip: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px', background: 'rgba(52, 211, 153, 0.1)',
      color: '#34d399', borderRadius: 2,
      border: '1px solid rgba(52, 211, 153, 0.3)',
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    },
  };

  const domains = [
    { key: 'overview', code: 'OVR', name_en: 'Overview', pct: 86, active: true },
    { key: 'vc', code: 'VC', name_en: 'Value chain', pct: 100 },
    { key: 'tech', code: 'TEC', name_en: 'Technology', pct: 78 },
    { key: 'hr', code: 'HR', name_en: 'Human resources', pct: 60 },
    { key: 'sc', code: 'SC', name_en: 'Supply chain', pct: 92 },
    { key: 'inv', code: 'INV', name_en: 'Investment', pct: 55 },
    { key: 'esg', code: 'ESG', name_en: 'ESG', pct: 40 },
  ];

  // Mini horizontal bar — completeness indicator
  const Meter = ({ pct }) => {
    const color = pct >= 80 ? '#34d399' : pct >= 50 ? '#5ac8fa' : '#f59e0b';
    return (
      <svg width="28" height="14" viewBox="0 0 28 14">
        <rect x="0" y="6" width="28" height="2" fill="rgba(90,200,250,0.18)" />
        <rect x="0" y="6" width={(28 * pct) / 100} height="2" fill={color} />
        <text x="14" y="13" textAnchor="middle"
          fontFamily="IBM Plex Mono" fontSize="8"
          fill={color} letterSpacing="0.04em">{pct}</text>
      </svg>
    );
  };

  return (
    <div style={dirBStyles.root}>
      <div style={dirBStyles.header}>
        <div style={dirBStyles.brand}>
          <div style={dirBStyles.brandMark}>◉</div>
          <div>
            <div style={{ lineHeight: 1.1, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SAT-IND <span style={{ color: '#5ac8fa' }}>·</span> DB
            </div>
            <div style={dirBStyles.brandSub}>ระบบฐานข้อมูลอุตสาหกรรมดาวเทียม</div>
          </div>
        </div>

        <div style={dirBStyles.statusStrip}>
          <div style={dirBStyles.statusPill}>
            <div style={dirBStyles.statusDot('#34d399')}></div>
            <span>OPS NOMINAL</span>
          </div>
          <div style={dirBStyles.statusPill}>
            <span style={{ color: '#5ac8fa' }}>RECORDS</span>
            <span style={{ color: '#e3ecf7' }}>1 284</span>
          </div>
          <div style={dirBStyles.statusPill}>
            <span style={{ color: '#5ac8fa' }}>DRAFTS</span>
            <span style={{ color: '#e3ecf7' }}>03</span>
          </div>
          <div style={dirBStyles.statusPill}>
            <span style={{ color: '#5ac8fa' }}>IMPORT QUEUE</span>
            <span style={{ color: '#f59e0b' }}>01</span>
          </div>
        </div>

        <div style={dirBStyles.headerRight}>
          <div style={dirBStyles.langToggle}>
            <span style={dirBStyles.langOn}>EN</span>
            <span style={dirBStyles.langOff}>ไทย</span>
          </div>
          <div style={dirBStyles.plannerBadge}>
            <span style={{ color: '#34d399' }}>◆</span>
            <span>PLANNER.A</span>
          </div>
        </div>
      </div>

      <div style={dirBStyles.body}>
        {/* SIDEBAR */}
        <div style={dirBStyles.sidebar}>
          <div style={dirBStyles.sbGroup}>
            <div style={dirBStyles.sbLabel}>// firm</div>
            <div style={dirBStyles.firmIdCard}>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 13.5, color: '#e3ecf7', fontWeight: 500 }}>
                Starfield Aerospace
              </div>
              <div style={{ fontFamily: 'Noto Sans Thai, sans-serif', fontSize: 11.5, color: '#9aa9c2', marginTop: 2 }}>
                สตาร์ฟิลด์ แอโรสเปซ
              </div>
              <div style={{
                marginTop: 8, fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
                color: '#5ac8fa', letterSpacing: '0.06em',
              }}>JID 0107 5540 00372</div>
            </div>
          </div>

          <div style={dirBStyles.sbGroup}>
            <div style={dirBStyles.sbLabel}>// domains</div>
            {domains.map(d => (
              <div key={d.key} style={dirBStyles.sbItem(d.active)}>
                <div style={{
                  fontFamily: '"IBM Plex Mono", monospace', fontSize: 9.5,
                  color: d.active ? '#5ac8fa' : '#5ac8fa',
                  letterSpacing: '0.06em', opacity: d.active ? 1 : 0.6,
                }}>{d.code}</div>
                <span style={{ textTransform: 'capitalize' }}>{d.name_en}</span>
                <Meter pct={d.pct} />
              </div>
            ))}
          </div>

          <div style={{ ...dirBStyles.sbGroup, marginTop: 22 }}>
            <div style={dirBStyles.sbLabel}>// system</div>
            <div style={{ padding: '6px 10px', color: '#9aa9c2', fontSize: 12.5, display: 'flex', justifyContent: 'space-between' }}>
              <span>Audit timeline</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: '#5ac8fa' }}>42</span>
            </div>
            <div style={{ padding: '6px 10px', color: '#9aa9c2', fontSize: 12.5, display: 'flex', justifyContent: 'space-between' }}>
              <span>Sources</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: '#5ac8fa' }}>04</span>
            </div>
            <div style={{ padding: '6px 10px', color: '#9aa9c2', fontSize: 12.5, display: 'flex', justifyContent: 'space-between' }}>
              <span>Import jobs</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: '#5ac8fa' }}>02</span>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div style={dirBStyles.main}>
          <div style={dirBStyles.crumb}>
            ◇ FIRMS / <span style={dirBStyles.crumbAccent}>STARFIELD AEROSPACE</span> / OVERVIEW
          </div>

          <div style={dirBStyles.titleRow}>
            <div>
              <div style={dirBStyles.title}>Starfield Aerospace Co., Ltd.</div>
              <div style={dirBStyles.titleTh}>บริษัท สตาร์ฟิลด์ แอโรสเปซ จำกัด (มหาชน)</div>
            </div>
            <div style={dirBStyles.statusBadge}>
              <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%' }}></span>
              PUBLISHED
            </div>
          </div>

          <div style={dirBStyles.telemetryRow}>
            <div style={dirBStyles.telemCell}>
              <div style={dirBStyles.telemLabel}>JID</div>
              <div style={dirBStyles.telemVal}>0107554000372</div>
            </div>
            <div style={dirBStyles.telemCell}>
              <div style={dirBStyles.telemLabel}>FOUNDED</div>
              <div style={dirBStyles.telemVal}>2011 · T+14y</div>
            </div>
            <div style={dirBStyles.telemCell}>
              <div style={dirBStyles.telemLabel}>OWNERSHIP</div>
              <div style={dirBStyles.telemValSm}>Public · SET listed</div>
            </div>
            <div style={dirBStyles.telemCell}>
              <div style={dirBStyles.telemLabel}>HQ</div>
              <div style={dirBStyles.telemValSm}>Pathum Thani / TH</div>
            </div>
            <div style={{ ...dirBStyles.telemCell, borderRight: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 120 }}>
              <div style={dirBStyles.telemLabel}>COMPLETENESS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  fontFamily: '"IBM Plex Mono", monospace', fontSize: 15,
                  color: '#34d399', letterSpacing: '0.02em',
                }}>73%</div>
                <Meter pct={73} />
              </div>
            </div>
          </div>

          <div style={dirBStyles.sectionH}>
            <span>◆ Domain Snapshot</span>
            <span style={{
              fontWeight: 400, color: '#8aa2c2', letterSpacing: '0.06em',
              textTransform: 'uppercase', fontSize: 10,
            }}>FY 2024</span>
            <span style={dirBStyles.sectionRule}></span>
          </div>

          <div style={dirBStyles.statGrid}>
            {[
              { title: 'Value-chain segs', val: '02', sub: 'Midstream · Downstream', src: 'BOI', bars: [40, 70, 100] },
              { title: 'Core technologies', val: '04', sub: '2 with TRL ≥ 7', src: 'NRIIS', bars: [50, 90, 60, 70] },
              { title: 'R&D headcount', val: '38', sub: '+6 YoY', src: 'SURVEY', bars: [40, 50, 60, 70, 80, 100] },
              { title: 'Patents granted', val: '11', sub: '+2 last 12 mo', src: 'DIP', bars: [60, 50, 70, 80, 65, 100] },
              { title: 'Supply-chain edges', val: '17', sub: '9 sup · 6 cust · 2 ptr', src: 'MIXED', bars: [30, 50, 70, 60, 80, 90] },
              { title: 'ESG snapshots', val: '01', sub: 'Self-reported · 2024', src: 'SELF-REP', bars: [10, 30, 60, 100] },
            ].map((s, i) => (
              <div key={i} style={dirBStyles.statCard}>
                <div style={dirBStyles.statCardCorner}></div>
                <div style={dirBStyles.statTop}>
                  <div style={dirBStyles.statTitle}>{s.title}</div>
                  <div style={dirBStyles.statSource}>{s.src}</div>
                </div>
                <div style={dirBStyles.statVal}>{s.val}</div>
                <div style={dirBStyles.statSub}>{s.sub}</div>
                <div style={dirBStyles.sparkRow}>
                  {s.bars.map((h, j) => <div key={j} style={dirBStyles.sparkBar(h, j === s.bars.length - 1)}></div>)}
                </div>
              </div>
            ))}
          </div>

          <div style={dirBStyles.sectionH}>
            <span>◆ Activity Log</span>
            <span style={{ fontWeight: 400, color: '#8aa2c2', fontSize: 10, letterSpacing: '0.06em' }}>LAST 30 DAYS</span>
            <span style={dirBStyles.sectionRule}></span>
            <span style={{
              color: '#5ac8fa', textTransform: 'none', letterSpacing: '0.02em',
              fontSize: 11, cursor: 'pointer',
            }}>view all →</span>
          </div>

          <div style={dirBStyles.activityTable}>
            {[
              ['2026-05-12 14:22', 'Patent count revised → 11', 'planner.a', 'TEC'],
              ['2026-05-09 11:08', 'Edge added: → Mongkut Optics Ltd. (supplier)', 'planner.a', 'SC'],
              ['2026-04-28 09:41', 'ESG snapshot 2024 imported via CSV', 'planner.a', 'ESG · IMP'],
              ['2026-04-14 16:55', 'TRL 7 confirmed: Phased-Array Antenna', 'planner.a', 'TEC'],
            ].map((row, i) => (
              <div key={i} style={{
                ...dirBStyles.actRow,
                borderBottom: i === 3 ? 'none' : '1px solid rgba(90,200,250,0.08)',
              }}>
                <div style={dirBStyles.actDate}>{row[0]}</div>
                <div style={{ color: '#dbe5f1' }}>{row[1]}</div>
                <div style={dirBStyles.actUser}>{row[2]}</div>
                <div style={dirBStyles.actDomain}>{row[3]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div style={dirBStyles.rail}>
          <div style={dirBStyles.railLabel}>
            <span style={{ color: '#5ac8fa' }}>◆</span>
            Provenance
          </div>
          <div style={dirBStyles.provCard}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 8, height: 8,
              borderTop: '1px solid #5ac8fa', borderRight: '1px solid #5ac8fa',
            }}></div>
            <div style={dirBStyles.provKey}>PRIMARY SOURCE</div>
            <div style={{ ...dirBStyles.provVal, fontWeight: 500, color: '#e3ecf7' }}>BOI Promotion Registry</div>
            <div style={{ fontSize: 11, color: '#8aa2c2', marginTop: 2, fontFamily: '"IBM Plex Mono", monospace' }}>
              boi.go.th · 2024 export
            </div>
            <div style={dirBStyles.provRow}>
              <div style={dirBStyles.provKey}>CONFIDENCE</div>
              <span style={dirBStyles.confidenceChip}>● REPORTED</span>
            </div>
            <div style={dirBStyles.provRow}>
              <div style={dirBStyles.provKey}>REPORTING PERIOD</div>
              <div style={{ ...dirBStyles.provVal, fontFamily: '"IBM Plex Mono", monospace' }}>FY 2024 · 01–12</div>
            </div>
            <div style={dirBStyles.provRow}>
              <div style={dirBStyles.provKey}>LAST UPDATED</div>
              <div style={{ ...dirBStyles.provVal, fontFamily: '"IBM Plex Mono", monospace' }}>2026-05-12 · planner.a</div>
            </div>
            <div style={dirBStyles.provRow}>
              <div style={dirBStyles.provKey}>CONFIDENTIALITY</div>
              <div style={dirBStyles.provVal}>Public</div>
            </div>
          </div>

          <div style={dirBStyles.railLabel}>
            <span style={{ color: '#f59e0b' }}>◆</span>
            Source Manifest
          </div>
          <div style={{
            background: 'rgba(90,200,250,0.03)',
            border: '1px solid rgba(90,200,250,0.16)',
            padding: 12, borderRadius: 2,
            fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5,
            color: '#dbe5f1',
          }}>
            {[
              ['BOI Registry', 'identity'],
              ['DBD Juristic', 'identity'],
              ['NRIIS DB', 'R&D'],
              ['Firm survey 2026', 'HR · ESG'],
              ['DIP Patents', 'patents'],
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '5px 0',
                borderTop: i === 0 ? 'none' : '1px solid rgba(90,200,250,0.08)',
              }}>
                <span>{s[0]}</span>
                <span style={{ color: '#5ac8fa', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s[1]}</span>
              </div>
            ))}
          </div>

          <button style={{
            marginTop: 18, width: '100%', padding: '10px 12px',
            background: '#5ac8fa', color: '#062033', border: 'none',
            fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500,
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 2,
          }}>◆ EDIT FIRM RECORD</button>
          <button style={{
            marginTop: 8, width: '100%', padding: '10px 12px',
            background: 'transparent', color: '#5ac8fa',
            border: '1px solid rgba(90,200,250,0.3)',
            fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500,
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            cursor: 'pointer', borderRadius: 2,
          }}>＋ ADD DOMAIN RECORD</button>
        </div>
      </div>
    </div>
  );
}

window.DirectionB = DirectionB;
