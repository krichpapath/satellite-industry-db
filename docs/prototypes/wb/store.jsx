// wb/store.jsx — mock data store, hash router, design tokens, helpers.

// =========================================================================
// DESIGN TOKENS
// =========================================================================
const T = {
  // Surfaces
  bg:          '#fafaf9',
  surface:     '#ffffff',
  subtle:      '#f5f5f4',
  hover:       '#f4f4f3',

  // Lines
  line:        '#e7e5e4',
  lineStrong:  '#d6d3d1',

  // Text
  ink:         '#0c0a09',
  ink2:        '#1c1917',
  muted:       '#57534e',
  muted2:      '#a8a29e',

  // Accent — single restrained navy
  accent:      '#1e3a8a',
  accentHover: '#1e40af',
  accentSoft:  '#eff3fc',
  accentLine:  '#c7d2fe',

  // Status
  ok:          '#15803d',
  okSoft:      '#dcfce7',
  warn:        '#b45309',
  warnSoft:    '#fef3c7',
  danger:      '#b91c1c',
  dangerSoft:  '#fee2e2',

  // Domain hues (used SPARINGLY in this design — only for category tags + ring colors,
  // never as full backgrounds)
  domains: {
    firm: '#1e3a8a',
    vc:   '#4338ca',
    tech: '#0d9488',
    hr:   '#b45309',
    sc:   '#7c3aed',
    inv:  '#15803d',
    esg:  '#65a30d',
  },
};

const DOMAIN_META = {
  firm: { color: T.domains.firm, name: 'Identity',      th: 'ข้อมูลองค์กร',    order: 0 },
  vc:   { color: T.domains.vc,   name: 'Value Chain',   th: 'ห่วงโซ่คุณค่า',   order: 1 },
  tech: { color: T.domains.tech, name: 'Technology',    th: 'เทคโนโลยี',       order: 2 },
  hr:   { color: T.domains.hr,   name: 'Human Resources', th: 'ทรัพยากรบุคคล', order: 3 },
  sc:   { color: T.domains.sc,   name: 'Supply Chain',  th: 'ห่วงโซ่อุปทาน',   order: 4 },
  inv:  { color: T.domains.inv,  name: 'Investment',    th: 'การลงทุน',        order: 5 },
  esg:  { color: T.domains.esg,  name: 'ESG',           th: 'ESG',             order: 6 },
};

// =========================================================================
// MOCK DATA
// =========================================================================
const SOURCES = [
  { id: 'boi', name: 'BOI Promotion Registry', kind: 'government', url: 'boi.go.th' },
  { id: 'dbd', name: 'DBD Juristic Registry', kind: 'government', url: 'dbd.go.th' },
  { id: 'nriis', name: 'NRIIS Researcher DB', kind: 'government', url: 'nriis.go.th' },
  { id: 'gistda', name: 'GISTDA Sat-Op Registry', kind: 'government', url: 'gistda.or.th' },
  { id: 'dip', name: 'DIP Patent Search', kind: 'government', url: 'patentsearch.ipthailand.go.th' },
  { id: 'survey', name: 'Firm survey · Mar 2026', kind: 'manual', url: '' },
  { id: 'manual', name: 'Manual entry', kind: 'manual', url: '' },
];

const FIRMS = [
  {
    id: 'sf-001',
    juristic: '0107554000372',
    name_en: 'Starfield Aerospace Co., Ltd.',
    name_th: 'บริษัท สตาร์ฟิลด์ แอโรสเปซ จำกัด (มหาชน)',
    founded: 2011,
    ownership: 'Public',
    listed: 'SET-listed 2017',
    hq_city_en: 'Pathum Thani',
    hq_city_th: 'ปทุมธานี',
    industry: 'Satellite manufacturing',
    isic: '30300',
    workforce: 342,
    rd_headcount: 38,
    status: 'published',
    completeness: { firm: 86, vc: 100, tech: 78, hr: 60, sc: 92, inv: 55, esg: 40 },
    last_updated: '2026-05-12',
    source_count: 4,
    record_count: 29,
  },
  {
    id: 'sf-002',
    juristic: '0107562001844',
    name_en: 'Andaman SpaceTech PCL',
    name_th: 'บริษัท อันดามัน สเปซเทค จำกัด (มหาชน)',
    founded: 2019,
    ownership: 'Public',
    listed: 'mai-listed 2023',
    hq_city_en: 'Phuket',
    hq_city_th: 'ภูเก็ต',
    industry: 'Earth observation services',
    isic: '74909',
    workforce: 88,
    rd_headcount: 22,
    status: 'published',
    completeness: { firm: 100, vc: 80, tech: 65, hr: 40, sc: 50, inv: 35, esg: 0 },
    last_updated: '2026-05-10',
    source_count: 3,
    record_count: 14,
  },
  {
    id: 'sf-003',
    juristic: '0105549073216',
    name_en: 'Korat Ground Systems Co., Ltd.',
    name_th: 'บริษัท โคราช กราวด์ ซิสเต็มส์ จำกัด',
    founded: 2006,
    ownership: 'Private',
    listed: '',
    hq_city_en: 'Nakhon Ratchasima',
    hq_city_th: 'นครราชสีมา',
    industry: 'Ground station equipment',
    isic: '26309',
    workforce: 142,
    rd_headcount: 12,
    status: 'published',
    completeness: { firm: 100, vc: 100, tech: 100, hr: 80, sc: 100, inv: 80, esg: 60 },
    last_updated: '2026-05-08',
    source_count: 5,
    record_count: 36,
  },
  {
    id: 'sf-004',
    juristic: '0105560198772',
    name_en: 'Lanna Composites Co., Ltd.',
    name_th: 'บริษัท ล้านนา คอมโพสิตส์ จำกัด',
    founded: 2017,
    ownership: 'Private',
    listed: '',
    hq_city_en: 'Chiang Mai',
    hq_city_th: 'เชียงใหม่',
    industry: 'Structural components',
    isic: '22209',
    workforce: 65,
    rd_headcount: 6,
    status: 'draft',
    completeness: { firm: 60, vc: 40, tech: 30, hr: 20, sc: 20, inv: 0, esg: 0 },
    last_updated: '2026-05-15',
    source_count: 2,
    record_count: 8,
  },
  {
    id: 'sf-005',
    juristic: '0107558013390',
    name_en: 'Bangsaen Optics PCL',
    name_th: 'บริษัท บางแสน ออปติคส์ จำกัด (มหาชน)',
    founded: 2015,
    ownership: 'Public',
    listed: 'SET-listed 2021',
    hq_city_en: 'Chonburi',
    hq_city_th: 'ชลบุรี',
    industry: 'Optical payload',
    isic: '26701',
    workforce: 218,
    rd_headcount: 31,
    status: 'pending_review',
    completeness: { firm: 100, vc: 60, tech: 90, hr: 60, sc: 75, inv: 65, esg: 30 },
    last_updated: '2026-05-14',
    source_count: 4,
    record_count: 22,
  },
];

// Drafts in progress (the "resume" cards on Workbench home)
const DRAFTS = [
  {
    id: 'd-1',
    juristic: '0107561005422',
    name_en: 'Surin SatComm Ltd.',
    name_th: 'บริษัท สุรินทร์ แซทคอมม์ จำกัด',
    completeness: 35,
    last_touched: '2026-05-18',
    next: 'Add value-chain segment',
    next_domain: 'vc',
  },
  {
    id: 'd-2',
    juristic: '0107564022019',
    name_en: 'Sukhothai Antennas Co.',
    name_th: 'บริษัท สุโขทัย แอนเทนนา จำกัด',
    completeness: 18,
    last_touched: '2026-05-17',
    next: 'Complete identity payload',
    next_domain: 'firm',
  },
  {
    id: 'd-3',
    juristic: '—',
    name_en: '(no name yet)',
    name_th: '',
    completeness: 8,
    last_touched: '2026-05-16',
    next: 'Validate juristic ID',
    next_domain: 'firm',
  },
];

// Recent import jobs
const IMPORTS = [
  { id: 'imp-22', file: 'boi_export_2024_q4.xlsx', rows: 412, ok: 405, warn: 5, error: 2, status: 'committed', when: '2026-05-09', user: 'planner.a' },
  { id: 'imp-21', file: 'nriis_researchers_2024.csv', rows: 88, ok: 76, warn: 4, error: 8, status: 'partial', when: '2026-05-02', user: 'planner.a' },
  { id: 'imp-20', file: 'gistda_satops_2024.xlsx', rows: 24, ok: 24, warn: 0, error: 0, status: 'committed', when: '2026-04-22', user: 'planner.a' },
];

// Value-chain taxonomy (from §13 defaults in the Plan doc — SIA-derived)
const VC_TAXONOMY = {
  upstream: {
    label: 'Upstream', th: 'ต้นน้ำ', color: '#a5a4dc',
    activities: [
      { id: 'u-payload',     label: 'Payload manufacturing' },
      { id: 'u-bus',         label: 'Bus / platform manufacturing' },
      { id: 'u-ait',         label: 'AIT services' },
      { id: 'u-propulsion',  label: 'Propulsion systems' },
      { id: 'u-structural',  label: 'Structural components' },
    ],
  },
  midstream: {
    label: 'Midstream', th: 'กลางน้ำ', color: '#6e6cd0',
    activities: [
      { id: 'm-ground',      label: 'Ground systems' },
      { id: 'm-launch',      label: 'Launch services' },
      { id: 'm-integration', label: 'Integration & test' },
      { id: 'm-tracking',    label: 'Tracking, TT&C' },
    ],
  },
  downstream: {
    label: 'Downstream', th: 'ปลายน้ำ', color: '#4338ca',
    activities: [
      { id: 'd-data',        label: 'Satellite data services' },
      { id: 'd-apps',        label: 'Applications & analytics' },
      { id: 'd-vas',         label: 'Value-added services' },
      { id: 'd-comm',        label: 'Communications services' },
    ],
  },
};

const CERTIFICATIONS = [
  'ISO 9001:2015', 'ISO 14001:2015', 'ISO 27001:2022', 'AS9100D (aerospace)',
  'ISO 50001', 'IATF 16949', 'CDP (rated A–D)', 'TCFD-aligned', 'GRI 2024',
];

const TARGET_MARKETS = [
  { id: 'th', name: 'Thailand', th: 'ประเทศไทย' },
  { id: 'asean', name: 'ASEAN', th: 'อาเซียน' },
  { id: 'jp', name: 'Japan', th: 'ญี่ปุ่น' },
  { id: 'kr', name: 'South Korea', th: 'เกาหลีใต้' },
  { id: 'cn', name: 'China', th: 'จีน' },
  { id: 'eu', name: 'European Union', th: 'สหภาพยุโรป' },
  { id: 'us', name: 'United States', th: 'สหรัฐอเมริกา' },
  { id: 'global', name: 'Global', th: 'ทั่วโลก' },
];

// =========================================================================
// HASH ROUTER
// =========================================================================
function useHashRoute() {
  const [hash, setHash] = React.useState(
    typeof window !== 'undefined' ? window.location.hash.slice(1) || '/' : '/'
  );
  React.useEffect(() => {
    const onChange = () => setHash(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function go(path) {
  window.location.hash = '#' + path;
}

// Parse a hash into segments. e.g. "/firms/sf-001/valuechain" → ['firms','sf-001','valuechain']
function parseRoute(hash) {
  return hash.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
}

// =========================================================================
// MOCK SERVICE — every fn returns a Promise with simulated latency.
// (Hooks would consume these in the real build; here we read sync for clarity.)
// =========================================================================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const lag = () => sleep(120 + Math.random() * 200);

async function lookupJuristic(jid) {
  await lag();
  // Fake DBD lookup. If JID matches an existing firm exactly → return it.
  // If JID is prefix-similar to existing → return fuzzy candidates.
  const existing = FIRMS.find(f => f.juristic === jid);
  if (existing) return { kind: 'exact', firm: existing };
  // Fuzzy by JID prefix (last 4 chars different)
  const candidates = FIRMS
    .map(f => {
      let common = 0;
      for (let i = 0; i < 13 && i < jid.length && i < f.juristic.length; i++) {
        if (jid[i] === f.juristic[i]) common++;
      }
      return { firm: f, score: common / 13 };
    })
    .filter(c => c.score >= 0.62 && c.score < 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return { kind: 'fuzzy', candidates };
}

function validateJuristic(jid) {
  if (!jid) return { ok: false, code: '', msg: '' };
  if (!/^\d*$/.test(jid)) return { ok: false, code: 'NON_DIGIT', msg: 'Only digits allowed' };
  if (jid.length < 13) return { ok: false, code: 'TOO_SHORT', msg: `${jid.length}/13 digits` };
  if (jid.length > 13) return { ok: false, code: 'TOO_LONG', msg: 'Maximum 13 digits' };
  return { ok: true, code: 'OK', msg: 'Format valid · checking registry…' };
}

// =========================================================================
// EXPORTS to window
// =========================================================================
Object.assign(window, {
  T, DOMAIN_META,
  SOURCES, FIRMS, DRAFTS, IMPORTS,
  VC_TAXONOMY, CERTIFICATIONS, TARGET_MARKETS,
  useHashRoute, go, parseRoute,
  lookupJuristic, validateJuristic, sleep, lag,
});
