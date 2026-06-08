// Direction C — Editorial Data
// Publication register. Cream surfaces, ink, deep teal accent, rust highlights.
// Source Serif 4 for headings + IBM Plex Sans for body + Sarabun for Thai.

function DirectionC() {
  const dirCStyles = {
    root: {
      width: 1320,
      height: 900,
      background: '#f6f1e6',
      color: '#1a1a1a',
      fontFamily: '"IBM Plex Sans", "Sarabun", system-ui, sans-serif',
      fontSize: 14,
      lineHeight: 1.5,
      display: 'grid',
      gridTemplateRows: '60px 1fr',
      overflow: 'hidden',
      position: 'relative',
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr auto',
      alignItems: 'center',
      borderBottom: '2px solid #1a1a1a',
      background: '#f6f1e6',
      padding: '0 24px',
      gap: 20,
    },
    brand: {
      display: 'flex', alignItems: 'baseline', gap: 12,
    },
    brandMark: {
      fontFamily: '"Source Serif 4", "IBM Plex Serif", Georgia, serif',
      fontWeight: 600, fontSize: 22, color: '#1a1a1a',
      letterSpacing: '-0.015em',
      fontStyle: 'italic',
    },
    brandSub: {
      fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
      color: '#7a7466', fontWeight: 400,
      borderLeft: '1px solid #c4502f', paddingLeft: 12,
    },
    issueLine: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#7a7466',
      display: 'flex', alignItems: 'center', gap: 16,
      justifySelf: 'center',
    },
    issueDot: { color: '#c4502f' },
    headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
    langToggle: {
      display: 'flex', gap: 12,
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 12,
      fontWeight: 500,
    },
    langOn: {
      color: '#1a1a1a', borderBottom: '2px solid #c4502f',
      paddingBottom: 2,
    },
    langOff: {
      color: '#7a7466', fontFamily: 'Sarabun, sans-serif',
      paddingBottom: 2, borderBottom: '2px solid transparent',
    },
    plannerBadge: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 12px',
      border: '1px solid #1a1a1a',
      fontSize: 12, color: '#1a1a1a',
      background: '#f6f1e6',
      fontWeight: 500,
    },
    plannerDot: { width: 7, height: 7, borderRadius: '50%', background: '#15605a' },

    body: { display: 'grid', gridTemplateColumns: '230px 1fr 300px', overflow: 'hidden' },

    sidebar: {
      borderRight: '1px solid #d9d3c2',
      background: '#f1ead8',
      padding: '20px 0',
      overflow: 'auto',
    },
    sbGroup: { padding: '0 20px', marginBottom: 24 },
    sbLabel: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10.5,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: '#7a7466', marginBottom: 10, fontWeight: 600,
      paddingBottom: 6, borderBottom: '1px solid #d9d3c2',
    },
    sbItem: (active) => ({
      display: 'grid', gridTemplateColumns: '1fr auto auto',
      alignItems: 'baseline', gap: 8,
      padding: '8px 0',
      borderBottom: '1px dotted #d9d3c2',
      color: active ? '#1a1a1a' : '#43403a',
      fontFamily: active ? '"Source Serif 4", serif' : '"IBM Plex Sans", sans-serif',
      fontWeight: active ? 600 : 400,
      fontStyle: active ? 'italic' : 'normal',
      fontSize: active ? 15 : 13,
      cursor: 'pointer',
      position: 'relative',
    }),
    sbItemNum: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      color: '#7a7466', letterSpacing: '0.06em',
    },
    sbPct: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
      color: '#15605a', fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.04em',
    },

    main: { padding: '24px 32px', overflow: 'auto', minWidth: 0 },
    issueRow: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      marginBottom: 6,
    },
    crumb: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11.5,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: '#7a7466', fontWeight: 500,
    },
    crumbAccent: { color: '#c4502f' },
    storyByline: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11.5,
      color: '#7a7466', fontStyle: 'italic',
    },
    title: {
      fontFamily: '"Source Serif 4", "IBM Plex Serif", Georgia, serif',
      fontWeight: 500, fontSize: 38, lineHeight: 1.05,
      letterSpacing: '-0.015em', color: '#1a1a1a',
      marginBottom: 6, marginTop: 4,
    },
    titleTh: {
      fontFamily: 'Sarabun, sans-serif', fontSize: 18,
      color: '#43403a', fontWeight: 400,
      marginBottom: 14,
    },
    lede: {
      fontFamily: '"Source Serif 4", serif', fontWeight: 400,
      fontSize: 15, lineHeight: 1.5, color: '#43403a',
      maxWidth: 620, marginBottom: 18,
      fontStyle: 'italic',
    },
    metaRule: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 0, borderTop: '1px solid #1a1a1a',
      borderBottom: '1px solid #d9d3c2',
      marginBottom: 22,
    },
    metaCell: {
      padding: '10px 14px 10px 0',
      borderRight: '1px dotted #d9d3c2',
    },
    metaLabel: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10.5,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#7a7466', marginBottom: 4, fontWeight: 600,
    },
    metaVal: {
      fontSize: 14, color: '#1a1a1a',
      fontFamily: '"IBM Plex Sans", sans-serif',
    },
    metaValSerif: {
      fontFamily: '"Source Serif 4", serif', fontSize: 16, color: '#1a1a1a',
      fontVariantNumeric: 'tabular-nums',
    },
    statusPill: {
      display: 'inline-block', padding: '2px 8px',
      color: '#15605a', border: '1px solid #15605a',
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      fontWeight: 600,
    },

    sectionH: {
      fontFamily: '"Source Serif 4", serif',
      fontSize: 16, fontWeight: 500, color: '#1a1a1a',
      marginBottom: 14, marginTop: 22,
      display: 'flex', alignItems: 'baseline', gap: 12,
      borderBottom: '1px solid #1a1a1a',
      paddingBottom: 8,
      fontStyle: 'italic',
    },
    sectionNum: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#c4502f', fontStyle: 'normal',
    },
    sectionRule: { flex: 1 },

    statGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
      paddingBottom: 8,
    },
    statCard: {
      paddingRight: 20,
      borderRight: '1px dotted #d9d3c2',
    },
    statCardLast: { paddingRight: 0, borderRight: 'none' },
    statTop: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10.5,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#7a7466', fontWeight: 600, marginBottom: 6,
    },
    statVal: {
      fontFamily: '"Source Serif 4", serif',
      fontWeight: 500, fontSize: 42, color: '#1a1a1a',
      lineHeight: 1, marginBottom: 4,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.02em',
    },
    statSub: {
      fontFamily: '"Source Serif 4", serif',
      fontStyle: 'italic', fontSize: 13.5,
      color: '#43403a', lineHeight: 1.4,
      marginBottom: 4,
    },
    statSrc: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      color: '#c4502f', fontWeight: 600,
    },

    activityList: {
      borderTop: '1px solid #1a1a1a',
    },
    actRow: {
      display: 'grid', gridTemplateColumns: '90px 1fr 100px 80px',
      padding: '10px 0', borderBottom: '1px dotted #d9d3c2',
      fontSize: 13.5, alignItems: 'baseline', gap: 16,
    },
    actDate: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 11,
      color: '#7a7466', fontVariantNumeric: 'tabular-nums',
      letterSpacing: '0.02em',
    },
    actBody: {
      fontFamily: '"Source Serif 4", serif', fontSize: 14,
      color: '#1a1a1a',
    },
    actUser: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11.5,
      color: '#43403a', fontStyle: 'italic',
    },
    actDomain: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10,
      color: '#c4502f', textTransform: 'uppercase',
      letterSpacing: '0.14em', fontWeight: 600,
    },

    rail: {
      borderLeft: '1px solid #d9d3c2',
      background: '#fbf7ee',
      padding: '22px 22px',
      overflow: 'auto',
    },
    railLabel: {
      fontFamily: '"Source Serif 4", serif', fontStyle: 'italic',
      fontSize: 16, fontWeight: 500, color: '#1a1a1a',
      marginBottom: 12, borderBottom: '1px solid #1a1a1a',
      paddingBottom: 6,
      display: 'flex', alignItems: 'baseline', gap: 8,
    },
    railLabelNum: {
      fontFamily: '"IBM Plex Mono", monospace', fontSize: 10,
      color: '#c4502f', letterSpacing: '0.12em',
      textTransform: 'uppercase', fontStyle: 'normal',
    },
    provRow: {
      paddingTop: 10, paddingBottom: 4,
      borderBottom: '1px dotted #d9d3c2',
    },
    provKey: {
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: '#7a7466', marginBottom: 3, fontWeight: 600,
    },
    provVal: { fontSize: 13.5, color: '#1a1a1a' },
    provValSerif: {
      fontFamily: '"Source Serif 4", serif', fontSize: 15,
      color: '#1a1a1a', fontWeight: 500,
    },
    confidenceChip: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px', color: '#15605a',
      border: '1px solid #15605a',
      fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 10,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      fontWeight: 600,
    },
  };

  const domains = [
    { code: 'I', name_en: 'Overview', pct: 86, active: true },
    { code: 'II', name_en: 'Value Chain', pct: 100 },
    { code: 'III', name_en: 'Technology', pct: 78 },
    { code: 'IV', name_en: 'Human Resources', pct: 60 },
    { code: 'V', name_en: 'Supply Chain', pct: 92 },
    { code: 'VI', name_en: 'Investment', pct: 55 },
    { code: 'VII', name_en: 'ESG', pct: 40 },
  ];

  return (
    <div style={dirCStyles.root}>
      <div style={dirCStyles.header}>
        <div style={dirCStyles.brand}>
          <div style={dirCStyles.brandMark}>SatIndex</div>
          <div style={dirCStyles.brandSub}>Thai Satellite Industry Database</div>
        </div>
        <div style={dirCStyles.issueLine}>
          <span>VOL. 01 / ISSUE 12</span>
          <span style={dirCStyles.issueDot}>·</span>
          <span>FY 2024 REPORTING</span>
          <span style={dirCStyles.issueDot}>·</span>
          <span>19 MAY 2026</span>
        </div>
        <div style={dirCStyles.headerRight}>
          <div style={dirCStyles.langToggle}>
            <span style={dirCStyles.langOn}>EN</span>
            <span style={dirCStyles.langOff}>ไทย</span>
          </div>
          <div style={dirCStyles.plannerBadge}>
            <div style={dirCStyles.plannerDot}></div>
            <span style={{ fontFamily: '"Source Serif 4", serif', fontStyle: 'italic', fontSize: 13 }}>
              Data Planner
            </span>
          </div>
        </div>
      </div>

      <div style={dirCStyles.body}>
        {/* SIDEBAR — table of contents */}
        <div style={dirCStyles.sidebar}>
          <div style={dirCStyles.sbGroup}>
            <div style={{
              fontFamily: '"Source Serif 4", serif', fontStyle: 'italic',
              fontSize: 17, color: '#1a1a1a', fontWeight: 500,
              marginBottom: 2,
            }}>Starfield Aerospace</div>
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 12,
              color: '#43403a', fontWeight: 400, marginBottom: 6,
            }}>สตาร์ฟิลด์ แอโรสเปซ</div>
            <div style={{
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
              color: '#7a7466', letterSpacing: '0.06em',
              paddingTop: 6, borderTop: '1px solid #d9d3c2',
            }}>JID · 0107 5540 00372</div>
          </div>

          <div style={dirCStyles.sbGroup}>
            <div style={dirCStyles.sbLabel}>Contents</div>
            {domains.map((d, i) => (
              <div key={i} style={dirCStyles.sbItem(d.active)}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={dirCStyles.sbItemNum}>{d.code}.</span>
                  <span>{d.name_en}</span>
                </span>
                <span></span>
                <span style={dirCStyles.sbPct}>{d.pct}%</span>
              </div>
            ))}
          </div>

          <div style={dirCStyles.sbGroup}>
            <div style={dirCStyles.sbLabel}>Apparatus</div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 13, color: '#43403a',
              borderBottom: '1px dotted #d9d3c2',
            }}>
              <span style={{ fontStyle: 'italic', fontFamily: '"Source Serif 4", serif' }}>Audit timeline</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#7a7466' }}>42</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 13, color: '#43403a',
              borderBottom: '1px dotted #d9d3c2',
            }}>
              <span style={{ fontStyle: 'italic', fontFamily: '"Source Serif 4", serif' }}>Sources cited</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#7a7466' }}>4</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '6px 0', fontSize: 13, color: '#43403a',
            }}>
              <span style={{ fontStyle: 'italic', fontFamily: '"Source Serif 4", serif' }}>Import jobs</span>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: '#7a7466' }}>2</span>
            </div>
          </div>
        </div>

        {/* MAIN — editorial */}
        <div style={dirCStyles.main}>
          <div style={dirCStyles.issueRow}>
            <div style={dirCStyles.crumb}>
              FIRMS  ·  <span style={dirCStyles.crumbAccent}>STARFIELD AEROSPACE</span>  ·  OVERVIEW
            </div>
            <div style={dirCStyles.storyByline}>
              filed by planner.a · last revised 12 May 2026
            </div>
          </div>

          <div style={dirCStyles.title}>Starfield Aerospace Co., Ltd.</div>
          <div style={dirCStyles.titleTh}>บริษัท สตาร์ฟิลด์ แอโรสเปซ จำกัด (มหาชน)</div>

          <p style={dirCStyles.lede}>
            A midstream–downstream operator headquartered in Pathum Thani, listed on
            the SET in 2017. Profile assembled from <em>four</em> primary sources;
            seven data domains tracked, of which five are at or above 60 per cent
            completeness for the FY 2024 reporting period.
          </p>

          <div style={dirCStyles.metaRule}>
            <div style={dirCStyles.metaCell}>
              <div style={dirCStyles.metaLabel}>Juristic ID</div>
              <div style={dirCStyles.metaValSerif}>0107554000372</div>
            </div>
            <div style={dirCStyles.metaCell}>
              <div style={dirCStyles.metaLabel}>Founded</div>
              <div style={dirCStyles.metaValSerif}>2011</div>
            </div>
            <div style={dirCStyles.metaCell}>
              <div style={dirCStyles.metaLabel}>Ownership</div>
              <div style={dirCStyles.metaVal}>Public · SET</div>
            </div>
            <div style={dirCStyles.metaCell}>
              <div style={dirCStyles.metaLabel}>HQ</div>
              <div style={dirCStyles.metaVal}>Pathum Thani, TH</div>
            </div>
            <div style={{ ...dirCStyles.metaCell, borderRight: 'none' }}>
              <div style={dirCStyles.metaLabel}>Status</div>
              <div style={{ marginTop: 2 }}><span style={dirCStyles.statusPill}>● Published</span></div>
            </div>
          </div>

          <div style={dirCStyles.sectionH}>
            <span style={dirCStyles.sectionNum}>§ I</span>
            <span>Domain snapshot</span>
            <span style={dirCStyles.sectionRule}></span>
            <span style={{
              fontFamily: '"IBM Plex Sans", sans-serif',
              fontStyle: 'normal', fontSize: 11,
              color: '#7a7466', letterSpacing: '0.06em',
            }}>across seven data domains, FY 2024</span>
          </div>

          <div style={dirCStyles.statGrid}>
            {[
              { val: '2', sub: 'value-chain segments — midstream and downstream', src: 'BOI', lab: 'Segments' },
              { val: '4', sub: 'core technologies; two cross TRL 7 in 2024', src: 'NRIIS', lab: 'Technologies' },
              { val: '38', sub: 'R&D headcount, up six year-on-year', src: 'Firm survey', lab: 'R&D staff' },
              { val: '11', sub: 'patents granted; two filed in the past twelve months', src: 'DIP', lab: 'Patents' },
              { val: '17', sub: 'firm-to-firm edges — nine suppliers, six customers, two partners', src: 'Mixed', lab: 'Edges' },
              { val: '1', sub: 'ESG snapshot for 2024; confidence flagged as reported', src: 'Self-reported', lab: 'ESG entries' },
            ].map((s, i) => (
              <div key={i} style={{
                ...dirCStyles.statCard,
                ...((i + 1) % 3 === 0 ? dirCStyles.statCardLast : {}),
                paddingBottom: i >= 3 ? 0 : 18,
                marginTop: i >= 3 ? 18 : 0,
                borderTop: i >= 3 ? '1px dotted #d9d3c2' : 'none',
                paddingTop: i >= 3 ? 18 : 0,
              }}>
                <div style={dirCStyles.statTop}>{s.lab}</div>
                <div style={dirCStyles.statVal}>{s.val}</div>
                <div style={dirCStyles.statSub}>{s.sub}</div>
                <div style={dirCStyles.statSrc}>↳ {s.src}</div>
              </div>
            ))}
          </div>

          <div style={dirCStyles.sectionH}>
            <span style={dirCStyles.sectionNum}>§ II</span>
            <span>Activity log</span>
            <span style={dirCStyles.sectionRule}></span>
            <span style={{
              fontFamily: '"IBM Plex Sans", sans-serif', fontStyle: 'normal',
              fontSize: 11, color: '#c4502f', letterSpacing: '0.06em',
              cursor: 'pointer', fontWeight: 600,
            }}>READ AUDIT TIMELINE →</span>
          </div>

          <div style={dirCStyles.activityList}>
            {[
              ['12 May', 'Patent count revised upward to eleven.', 'planner.a', 'Tech'],
              ['09 May', 'Supplier link added: Mongkut Optics Ltd.', 'planner.a', 'Supply'],
              ['28 Apr', 'ESG 2024 snapshot imported via CSV.', 'planner.a', 'ESG'],
              ['14 Apr', 'TRL 7 confirmed: Phased-Array Antenna programme.', 'planner.a', 'Tech'],
            ].map((row, i) => (
              <div key={i} style={dirCStyles.actRow}>
                <div style={dirCStyles.actDate}>{row[0]} ’26</div>
                <div style={dirCStyles.actBody}>{row[1]}</div>
                <div style={dirCStyles.actUser}>{row[2]}</div>
                <div style={dirCStyles.actDomain}>{row[3]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div style={dirCStyles.rail}>
          <div style={dirCStyles.railLabel}>
            <span style={dirCStyles.railLabelNum}>§</span>
            <span>Provenance</span>
          </div>

          <div style={dirCStyles.provRow}>
            <div style={dirCStyles.provKey}>Primary source</div>
            <div style={dirCStyles.provValSerif}>BOI Promotion Registry</div>
            <div style={{
              fontFamily: '"IBM Plex Sans", sans-serif', fontSize: 11.5,
              color: '#7a7466', marginTop: 2, fontStyle: 'italic',
            }}>boi.go.th — 2024 export, received 28 April 2026</div>
          </div>

          <div style={dirCStyles.provRow}>
            <div style={dirCStyles.provKey}>Confidence</div>
            <div style={{ marginTop: 4 }}>
              <span style={dirCStyles.confidenceChip}>● Reported</span>
            </div>
          </div>

          <div style={dirCStyles.provRow}>
            <div style={dirCStyles.provKey}>Reporting period</div>
            <div style={dirCStyles.provVal}>FY 2024 — 1 Jan to 31 Dec</div>
          </div>

          <div style={dirCStyles.provRow}>
            <div style={dirCStyles.provKey}>Last updated</div>
            <div style={dirCStyles.provVal}>12 May 2026 by <em style={{ fontFamily: '"Source Serif 4", serif' }}>planner.a</em></div>
          </div>

          <div style={{ ...dirCStyles.provRow, borderBottom: 'none' }}>
            <div style={dirCStyles.provKey}>Confidentiality</div>
            <div style={dirCStyles.provVal}>Public</div>
          </div>

          <div style={{ ...dirCStyles.railLabel, marginTop: 24 }}>
            <span style={dirCStyles.railLabelNum}>§</span>
            <span>Cited sources</span>
          </div>
          <ol style={{
            margin: 0, paddingLeft: 22, fontSize: 13,
            fontFamily: '"Source Serif 4", serif', color: '#1a1a1a',
          }}>
            <li style={{ marginBottom: 6 }}>
              <em>BOI Promotion Registry</em> — identity
            </li>
            <li style={{ marginBottom: 6 }}>
              <em>DBD Juristic Registry</em> — identity, founding
            </li>
            <li style={{ marginBottom: 6 }}>
              <em>NRIIS Researcher Database</em> — R&amp;D, technology
            </li>
            <li style={{ marginBottom: 6 }}>
              <em>Firm survey, Mar 2026</em> — HR, ESG
            </li>
            <li>
              <em>DIP Patent Search</em> — patents
            </li>
          </ol>

          <button style={{
            marginTop: 24, width: '100%', padding: '10px 12px',
            background: '#1a1a1a', color: '#f6f1e6', border: 'none',
            fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>Edit firm record</button>
          <button style={{
            marginTop: 8, width: '100%', padding: '10px 12px',
            background: 'transparent', color: '#1a1a1a',
            border: '1px solid #1a1a1a',
            fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>＋ Add domain record</button>
        </div>
      </div>
    </div>
  );
}

window.DirectionC = DirectionC;
