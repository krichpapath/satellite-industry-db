// portal/portal.jsx — Thai government portal style firm overview page.
// Composes the chart primitives in portal/charts.jsx into a full page.

// Pull from window globals (assigned in charts.jsx).
const _D = window.DOMAIN;

function GovTopBar() {
  return (
    <div style={{
      background: '#0c2c5e',
      color: '#e3eaf3',
      fontSize: 11.5,
      fontFamily: 'Sarabun, sans-serif',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '7px 32px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <span style={{
          fontWeight: 600, letterSpacing: '0.04em',
        }}>Royal Thai Government Portal</span>
        <span style={{ color: '#7a8db0' }}>·</span>
        <span style={{ fontFamily: 'Sarabun, sans-serif' }}>เว็บไซต์ของรัฐบาลไทย</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
          <a style={linkLight}>Sitemap</a>
          <a style={linkLight}>Contact</a>
          <span style={{ color: '#7a8db0' }}>|</span>
          <button style={iconBtn}>A<sup style={{ fontSize: 8 }}>−</sup></button>
          <button style={{ ...iconBtn, background: 'rgba(255,255,255,0.08)' }}>A</button>
          <button style={iconBtn}>A<sup style={{ fontSize: 8 }}>+</sup></button>
          <span style={{ color: '#7a8db0' }}>|</span>
          <button style={iconBtn} title="High contrast">◐</button>
          <span style={{ color: '#7a8db0' }}>|</span>
          <div style={{
            display: 'flex',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 2,
            overflow: 'hidden',
            fontSize: 10.5, letterSpacing: '0.06em',
          }}>
            <span style={{
              padding: '3px 8px', background: '#fff', color: '#0c2c5e', fontWeight: 600,
            }}>EN</span>
            <span style={{
              padding: '3px 8px', color: '#e3eaf3',
              fontFamily: 'Sarabun, sans-serif',
            }}>ไทย</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainHeader() {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #dde3ec',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '18px 32px',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        {/* Insignia */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(180deg, #c8102e 0%, #c8102e 33%, #fff 33%, #fff 66%, #0c2c5e 66%, #0c2c5e 100%)',
          position: 'relative',
          boxShadow: '0 0 0 2px #fff, 0 0 0 3px #0c2c5e',
        }}>
          <div style={{
            position: 'absolute', inset: 8,
            borderRadius: '50%',
            background: '#fff',
            display: 'grid', placeItems: 'center',
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            fontWeight: 700, fontSize: 17,
            color: '#0c2c5e',
            border: '1px solid #0c2c5e',
          }}>SAT</div>
        </div>
        <div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
            fontSize: 21, color: '#0c2c5e', letterSpacing: '-0.005em',
            lineHeight: 1.1,
          }}>
            Thai Satellite Industry Database
          </div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 16,
            color: '#1f2d3d', marginTop: 2,
          }}>
            ระบบฐานข้อมูลอุตสาหกรรมดาวเทียมแห่งชาติ
          </div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
            color: '#5b6b80', marginTop: 4, letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            National Science and Technology Development Agency  ·  GISTDA  ·  BOI
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid #dde3ec',
            padding: '7px 12px',
            borderRadius: 2,
            width: 320,
            background: '#fff',
            fontSize: 13, color: '#5b6b80',
          }}>
            <span style={{ color: '#0c2c5e', fontFamily: 'IBM Plex Mono', fontWeight: 600 }}>⌕</span>
            Search firms, sources, taxonomies…
            <span style={{
              marginLeft: 'auto',
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
              border: '1px solid #dde3ec', padding: '0 5px', borderRadius: 2,
              color: '#5b6b80',
            }}>⌘K</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', background: '#0c2c5e', color: '#fff',
            borderRadius: 2, fontSize: 12, fontWeight: 500,
            fontFamily: 'Sarabun, sans-serif',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }}></span>
            Data Planner
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: 10, color: '#a5b6d0', marginLeft: 4,
              letterSpacing: '0.04em',
            }}>planner.a</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimaryNav() {
  const items = [
    { name: 'Workbench', th: 'หน้าหลัก' },
    { name: 'Firms', th: 'บริษัท', active: true },
    { name: 'Bulk Import', th: 'นำเข้าข้อมูล' },
    { name: 'Sources', th: 'แหล่งที่มา' },
    { name: 'Taxonomy', th: 'อนุกรมวิธาน' },
    { name: 'Audit', th: 'บันทึกการเปลี่ยนแปลง' },
    { name: 'About', th: 'เกี่ยวกับ' },
  ];
  return (
    <div style={{
      background: '#fff', borderBottom: '2px solid #0c2c5e',
      boxShadow: '0 1px 0 #dde3ec',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '0 32px',
        display: 'flex', gap: 4,
      }}>
        {items.map(it => (
          <div key={it.name} style={{
            padding: '14px 18px',
            borderBottom: it.active ? '3px solid #c8102e' : '3px solid transparent',
            marginBottom: -2,
            color: it.active ? '#0c2c5e' : '#43526b',
            fontFamily: 'Sarabun, sans-serif',
            fontSize: 14, fontWeight: it.active ? 700 : 500,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 1,
          }}>
            {it.name}
            <span style={{
              fontSize: 10, color: it.active ? '#c8102e' : '#7a8da6',
              fontWeight: 400,
            }}>{it.th}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Breadcrumb() {
  return (
    <div style={{
      background: '#f1f4f9',
      borderBottom: '1px solid #dde3ec',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '8px 32px',
        fontFamily: 'Sarabun, sans-serif', fontSize: 12,
        color: '#5b6b80', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>Workbench</span>
        <span style={{ color: '#a5b1c3' }}>›</span>
        <span>Firms</span>
        <span style={{ color: '#a5b1c3' }}>›</span>
        <span style={{ color: '#0c2c5e', fontWeight: 600 }}>Starfield Aerospace Co., Ltd.</span>
        <span style={{ marginLeft: 'auto', color: '#5b6b80', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
          Last sync: 19 May 2026 · 09:42 UTC+7
        </span>
      </div>
    </div>
  );
}

function FirmHero() {
  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #dde3ec',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '24px 32px',
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: 28, alignItems: 'start',
      }}>
        {/* Left — identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <DomainPill domain="firm" size="lg" />
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              background: '#d8efdf', color: '#15803d',
              fontFamily: 'Sarabun, sans-serif',
              fontWeight: 600, fontSize: 11.5,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              borderRadius: 2,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803d' }}></span>
              Published
            </span>
            <span style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
              color: '#5b6b80', letterSpacing: '0.06em',
            }}>JID 0107 5540 00372</span>
          </div>
          <h1 style={{
            margin: 0,
            fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
            fontSize: 34, color: '#0c2c5e', letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}>
            Starfield Aerospace Co., Ltd.
          </h1>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 19,
            color: '#1f2d3d', marginTop: 4,
          }}>
            บริษัท สตาร์ฟิลด์ แอโรสเปซ จำกัด (มหาชน)
          </div>

          <div style={{
            marginTop: 18, display: 'grid',
            gridTemplateColumns: 'repeat(5, auto)',
            gap: 32, rowGap: 4,
          }}>
            {[
              ['Founded', '2011', '14 yrs'],
              ['Ownership', 'Public', 'SET-listed 2017'],
              ['HQ', 'Pathum Thani', 'Thailand'],
              ['Industry', 'Satellite manufacturing', 'ISIC 30300'],
              ['Workforce', '342 staff', '38 R&D'],
            ].map(([k, v, sub]) => (
              <div key={k}>
                <div style={metaLabel}>{k}</div>
                <div style={metaVal}>{v}</div>
                <div style={metaSub}>{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — KPI tiles */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          <KpiTile
            label="Completeness"
            value="73%"
            sub="across 7 domains"
            color="#0c2c5e"
            extra={<SparkBars data={[35, 48, 55, 60, 66, 70, 73]} color="#0c2c5e" w={100} h={28} />}
          />
          <KpiTile
            label="Cited sources"
            value="4"
            sub="BOI · DBD · NRIIS · DIP"
            color="#7c3aed"
          />
          <KpiTile
            label="Records · all domains"
            value="29"
            sub="+5 in last 30 days"
            color="#0d9488"
            extra={
              <span style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
                color: '#15803d', fontWeight: 600,
              }}>▲ +20.8%</span>
            }
          />
          <KpiTile
            label="Last revised"
            value="12 May"
            sub="by planner.a"
            color="#b45309"
          />
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, sub, color, extra }) {
  return (
    <div style={{
      border: '1px solid #dde3ec',
      borderLeft: `3px solid ${color}`,
      padding: '10px 14px',
      background: '#fff',
    }}>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
        color: '#5b6b80', letterSpacing: '0.08em',
        textTransform: 'uppercase', fontWeight: 600,
        marginBottom: 2,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
          fontSize: 22, color, letterSpacing: '-0.01em', lineHeight: 1.1,
        }}>{value}</div>
        {extra}
      </div>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
        color: '#5b6b80', marginTop: 2,
      }}>{sub}</div>
    </div>
  );
}

function DomainTabs() {
  const tabs = [
    { key: 'overview', name: 'Overview', th: 'ภาพรวม', domain: 'firm', active: true, count: '—' },
    { key: 'vc',       name: 'Value Chain', th: 'ห่วงโซ่คุณค่า', domain: 'vc', count: 2 },
    { key: 'tech',     name: 'Technology',  th: 'เทคโนโลยี',     domain: 'tech', count: 4 },
    { key: 'hr',       name: 'Human Resources', th: 'ทรัพยากรบุคคล', domain: 'hr', count: 3 },
    { key: 'sc',       name: 'Supply Chain', th: 'ห่วงโซ่อุปทาน', domain: 'sc', count: 17 },
    { key: 'inv',      name: 'Investment',  th: 'การลงทุน',     domain: 'inv', count: 2 },
    { key: 'esg',      name: 'ESG',         th: 'ESG',          domain: 'esg', count: 1 },
  ];
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #dde3ec',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '0 32px',
        display: 'flex', gap: 0,
      }}>
        {tabs.map(t => {
          const d = _D[t.domain] || _D.firm;
          return (
            <div key={t.key} style={{
              padding: '12px 18px',
              borderBottom: t.active ? `3px solid ${d.color}` : '3px solid transparent',
              marginBottom: -1,
              fontFamily: 'Sarabun, sans-serif',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 1,
              minWidth: 0,
              background: t.active ? d.tint : 'transparent',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: t.active ? d.color : '#43526b',
                fontWeight: t.active ? 700 : 500, fontSize: 13.5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color }}></span>
                {t.name}
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 10, color: d.color, fontWeight: 600,
                  marginLeft: 4,
                }}>{t.count}</span>
              </div>
              <span style={{ fontSize: 10.5, color: t.active ? d.color : '#7a8da6', opacity: 0.8 }}>
                {t.th}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =========================================================================
// SECTION COMPONENTS
// =========================================================================

function SectionHeader({ domain, num, title, th, kicker }) {
  const d = _D[domain] || _D.firm;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      borderBottom: `2px solid ${d.color}`,
      paddingBottom: 8, marginBottom: 18,
      gap: 14,
    }}>
      <div style={{
        background: d.color, color: '#fff',
        fontFamily: 'IBM Plex Mono, monospace',
        fontWeight: 600, fontSize: 11,
        padding: '4px 9px', letterSpacing: '0.1em',
      }}>{num}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
          fontSize: 19, color: '#0f1729', lineHeight: 1.1,
          letterSpacing: '-0.005em',
        }}>{title}</div>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 13,
          color: '#5b6b80',
        }}>{th}</div>
      </div>
      {kicker && (
        <div style={{
          marginLeft: 'auto',
          fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
          color: '#5b6b80', letterSpacing: '0.04em',
          textTransform: 'uppercase', fontWeight: 600,
        }}>{kicker}</div>
      )}
    </div>
  );
}

function OverviewSection() {
  // 7-ring snapshot
  const rings = [
    { d: 'firm', pct: 86 },
    { d: 'vc',   pct: 100 },
    { d: 'tech', pct: 78 },
    { d: 'hr',   pct: 60 },
    { d: 'sc',   pct: 92 },
    { d: 'inv',  pct: 55 },
    { d: 'esg',  pct: 40 },
  ];
  return (
    <section style={section}>
      <SectionHeader domain="firm" num="00" title="Domain snapshot" th="สรุปข้อมูลแต่ละโดเมน" kicker="FY 2024" />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12,
      }}>
        {rings.map(r => {
          const dom = _D[r.d];
          return (
            <div key={r.d} style={{
              background: '#fff', border: '1px solid #dde3ec',
              padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              borderTop: `3px solid ${dom.color}`,
            }}>
              <CompletenessRing pct={r.pct} color={dom.color} size={66} thickness={7} />
              <div style={{
                fontFamily: 'Sarabun, sans-serif', fontSize: 12,
                color: '#0f1729', fontWeight: 600, textAlign: 'center',
                lineHeight: 1.2,
              }}>{dom.name}</div>
              <div style={{
                fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
                color: '#5b6b80', textAlign: 'center', lineHeight: 1.1,
              }}>{dom.th}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ValueChainSection() {
  const segments = [
    { value: 28, color: '#a5a4dc', label: 'Upstream' },
    { value: 38, color: '#6e6cd0', label: 'Midstream' },
    { value: 34, color: '#4338ca', label: 'Downstream' },
  ];
  const activities = [
    { seg: 'Midstream',  sub: 'Ground systems & integration', tags: ['gateway', 'TT&C', 'integration'] },
    { seg: 'Downstream', sub: 'Earth observation services',   tags: ['EO data', 'analytics', 'value-added'] },
  ];
  return (
    <section style={section}>
      <SectionHeader domain="vc" num="02" title="Value chain footprint"
        th="ตำแหน่งในห่วงโซ่คุณค่า" kicker="2 of 3 segments active" />
      <div style={cardGrid('1.2fr 1fr')}>
        <Card>
          <CardTitle>Activity weight by segment</CardTitle>
          <StackedBar segments={segments} w={520} h={32} />
          <div style={{
            display: 'flex', gap: 18, marginTop: 12,
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: '#43526b',
          }}>
            {segments.map(s => (
              <span key={s.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: s.color, borderRadius: 2 }}></span>
                <span><strong>{s.label}</strong> · {s.value}%</span>
              </span>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            {activities.map((a, i) => (
              <div key={i} style={{
                padding: '10px 0',
                borderTop: i === 0 ? '1px solid #eaeef5' : '1px solid #eaeef5',
                display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 12, alignItems: 'center',
              }}>
                <div>
                  <DomainPill domain="vc" />
                  <div style={{
                    fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
                    color: '#4338ca', fontWeight: 600, marginTop: 4,
                  }}>{a.seg}</div>
                </div>
                <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, color: '#0f1729' }}>{a.sub}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {a.tags.map(t => <span key={t} style={chip}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Certifications & target markets</CardTitle>
          <div style={{
            display: 'grid', gap: 8, fontFamily: 'Sarabun, sans-serif', fontSize: 13,
          }}>
            <KvRow k="ISO 9001:2015"  v="Active · expires 2027" />
            <KvRow k="AS9100D (aerospace)" v="Active · audit Q3 2026" />
            <KvRow k="ISO 14001:2015" v="Active · expires 2027" />
            <KvRow k="Target — ASEAN" v="42% rev · primary" />
            <KvRow k="Target — Japan" v="18% rev" />
            <KvRow k="Target — EU"    v="9% rev · growing" />
          </div>
          <div style={{
            marginTop: 14, padding: '8px 10px',
            background: _D.vc.tint, color: _D.vc.color,
            fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Source · BOI Promotion Registry</span>
            <span style={{ fontWeight: 600 }}>FY 2024</span>
          </div>
        </Card>
      </div>
    </section>
  );
}

function TechnologySection() {
  const trl = [0, 0, 1, 1, 0, 1, 1, 0, 0];   // counts per TRL level
  const patents = [1, 2, 0, 2, 3, 1, 2];
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  const rdSpend = [42, 58, 73, 88, 102, 124, 158];   // ฿M
  const rdHc    = [18, 22, 27, 29, 31, 35, 38];
  return (
    <section style={section}>
      <SectionHeader domain="tech" num="03" title="Technology & innovation"
        th="เทคโนโลยีและนวัตกรรม" kicker="4 core technologies · 11 patents" />
      <div style={cardGrid('1fr 1fr')}>
        <Card>
          <CardTitle>TRL distribution across 4 core technologies</CardTitle>
          <TrlBars data={trl} w={420} h={140} />
          <div style={{
            display: 'flex', gap: 12, marginTop: 14,
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: '#43526b',
          }}>
            <Legend swatch="#dc2626" label="Research (1–3)" />
            <Legend swatch="#d97706" label="Development (4–6)" />
            <Legend swatch="#15803d" label="Deployment (7–9)" />
          </div>
          <hr style={hr} />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8,
            fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: '#0f1729',
          }}>
            <div style={techRowHd}>Technology</div>
            <div style={techRowHd}>TRL</div>
            <div style={techRowHd}>Patents</div>
            {[
              ['Phased-array antenna', 7, 4],
              ['Earth-observation payload', 7, 5],
              ['SAR signal processing', 6, 2],
              ['On-board edge AI', 3, 0],
            ].map((r, i) => (
              <React.Fragment key={i}>
                <div style={techCell}>{r[0]}</div>
                <div style={{ ...techCell, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'right' }}>
                  <span style={{
                    color: r[1] <= 3 ? '#dc2626' : r[1] <= 6 ? '#d97706' : '#15803d',
                    fontWeight: 700,
                  }}>{r[1]}</span>
                </div>
                <div style={{ ...techCell, fontFamily: 'IBM Plex Mono, monospace', textAlign: 'right' }}>{r[2]}</div>
              </React.Fragment>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>R&D investment vs headcount  ·  2018 → 2024</CardTitle>
          <ComboChart years={years} bars={rdSpend} line={rdHc.map(h => h * 100 / 50)} // scale for visibility
            w={460} h={200} barColor="#0d9488" lineColor="#0c2c5e" />
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            fontFamily: 'Sarabun, sans-serif',
            marginTop: 8,
          }}>
            <KvRow k="R&D spend · 2024" v={<><strong>฿158M</strong> · +27% YoY</>} />
            <KvRow k="R&D headcount"    v={<><strong>38 staff</strong> · 24% of total</>} />
          </div>
          <hr style={hr} />
          <CardTitle small>Patent grants per year</CardTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <SparkBars data={patents} w={200} h={48} color="#0d9488" />
            <div style={{
              fontFamily: 'Sarabun, sans-serif', fontSize: 13, color: '#0f1729',
            }}>
              <div><strong style={{ fontSize: 22, color: '#0d9488' }}>11</strong>
                <span style={{ fontSize: 11, color: '#5b6b80', marginLeft: 4 }}>total · DIP-registered</span>
              </div>
              <div style={{ fontSize: 11, color: '#5b6b80', marginTop: 2 }}>+2 in last 12 mo</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function HrSection() {
  const workforce = [
    { value: 142, color: '#b45309', label: 'engineers' },
    { value: 38,  color: '#d97706', label: 'researchers' },
    { value: 96,  color: '#f59e0b', label: 'technicians' },
    { value: 66,  color: '#fbbf24', label: 'other' },
  ];
  const headcountYears = [285, 298, 305, 318, 326, 334, 342];
  return (
    <section style={section}>
      <SectionHeader domain="hr" num="04" title="Human resources & skill"
        th="ทรัพยากรบุคคลและทักษะ" kicker="3 annual snapshots · 2022–2024" />
      <div style={cardGrid('1.4fr 1fr')}>
        <Card>
          <CardTitle>Workforce composition · 342 total</CardTitle>
          <StackedBar segments={workforce} w={580} h={32} />
          <div style={{
            display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap',
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: '#43526b',
          }}>
            {workforce.map(w => (
              <span key={w.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, background: w.color, borderRadius: 2 }}></span>
                <span><strong>{w.value}</strong> {w.label}</span>
              </span>
            ))}
          </div>
          <hr style={hr} />
          <CardTitle small>Identified skill gaps · 2024</CardTitle>
          <HorizontalBars w={580} maxVal={10} color="#b45309" data={[
            { label: 'Embedded systems', value: 9 },
            { label: 'RF / antenna design', value: 7 },
            { label: 'Space-grade QA',    value: 6 },
            { label: 'Optical payload',   value: 5 },
            { label: 'Edge ML / on-board', value: 4 },
          ]} valueFmt={v => `${v}/10`} />
        </Card>
        <Card>
          <CardTitle>Headcount trajectory · 7 yrs</CardTitle>
          <SparkLine data={headcountYears} w={300} h={120} color="#b45309" />
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginTop: 2, fontFamily: 'Sarabun, sans-serif',
          }}>
            <div>
              <div style={{ fontSize: 30, fontWeight: 700, color: '#b45309', lineHeight: 1 }}>342</div>
              <div style={{ fontSize: 11.5, color: '#5b6b80' }}>headcount · end 2024</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13.5, color: '#15803d', fontWeight: 600 }}>▲ +20.0%</div>
              <div style={{ fontSize: 11, color: '#5b6b80' }}>over 7 yrs</div>
            </div>
          </div>
          <hr style={hr} />
          <CardTitle small>Training participation</CardTitle>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 6,
            fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
          }}>
            <span>NSTDA · Space tech bootcamp</span>
            <span style={mono}>12 staff</span>
            <span>GISTDA short course</span>
            <span style={mono}>8 staff</span>
            <span>JAXA exchange (2023)</span>
            <span style={mono}>3 staff</span>
          </div>
        </Card>
      </div>
    </section>
  );
}

function SupplyChainSection() {
  const edgeTypes = [
    { value: 9, color: '#7c3aed', label: 'Suppliers' },
    { value: 6, color: '#0d9488', label: 'Customers' },
    { value: 2, color: '#b45309', label: 'Partners' },
  ];
  const mapPoints = [
    { x: 50, y: 60, kind: 'hq',      label: 'Pathum Thani' },
    { x: 56, y: 64, kind: 'sup' },
    { x: 46, y: 62, kind: 'sup' },
    { x: 52, y: 70, kind: 'sup' },
    { x: 58, y: 56, kind: 'cust' },
    { x: 48, y: 50, kind: 'cust' },
    { x: 60, y: 80, kind: 'cust' },
    { x: 44, y: 78, kind: 'sup' },
    { x: 38, y: 36, kind: 'partner' },
    { x: 56, y: 28, kind: 'sup' },
    { x: 34, y: 76, kind: 'sup' },
    { x: 50, y: 86, kind: 'cust' },
    { x: 64, y: 74, kind: 'sup' },
    { x: 30, y: 24, kind: 'sup' },
  ];
  return (
    <section style={section}>
      <SectionHeader domain="sc" num="05" title="Supply chain & ecosystem"
        th="ห่วงโซ่อุปทานและระบบนิเวศ" kicker="17 firm-to-firm edges" />
      <div style={cardGrid('340px 1fr 280px')}>
        <Card>
          <CardTitle>Relationship mix</CardTitle>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutBreakdown segments={edgeTypes} size={170} thickness={28}
              centerLabel="17" centerSub="EDGES" />
          </div>
          <div style={{
            display: 'grid', gap: 6, marginTop: 14,
            fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
          }}>
            {edgeTypes.map(t => (
              <div key={t.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0', borderBottom: '1px dotted #eaeef5',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: t.color, borderRadius: 2 }}></span>
                  {t.label}
                </span>
                <span style={mono}>{t.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Top firms in this firm's supply chain</CardTitle>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 13,
          }}>
            <div style={scRowHd}>
              <div>Firm (TH / EN)</div><div>Kind</div><div>City</div><div>Source</div>
            </div>
            {[
              ['บริษัท มงกุฎ ออปติคส์', 'Mongkut Optics Ltd.', 'sup',   'Chiang Mai',   'NRIIS'],
              ['บริษัท สายลม คอมโพสิต', 'Sailom Composites Co.', 'sup',   'Rayong',       'BOI'],
              ['สมุทร เซมิคอนดักเตอร์', 'Samut Semiconductor', 'sup',   'Samut Prakan', 'BOI'],
              ['GISTDA Sriracha',       'GISTDA Sriracha Station', 'cust', 'Chonburi',  'GISTDA'],
              ['NT Public',             'National Telecom PCL', 'cust',  'Bangkok',     'DBD'],
              ['Phuket Earth Stn.',     'Phuket Earth Station', 'cust',  'Phuket',      'GISTDA'],
              ['MU Space Lab',          'Mahidol Space Lab',   'partner', 'Salaya',     'NRIIS'],
            ].map((r, i) => {
              const dom = r[2] === 'sup' ? 'sc' : r[2] === 'cust' ? 'tech' : 'hr';
              return (
                <div key={i} style={scRow}>
                  <div>
                    <div style={{ color: '#0f1729', fontWeight: 500 }}>{r[1]}</div>
                    <div style={{ fontSize: 11.5, color: '#5b6b80' }}>{r[0]}</div>
                  </div>
                  <div><DomainPill domain={dom} /></div>
                  <div style={{ color: '#43526b' }}>{r[3]}</div>
                  <div style={{ ...mono, fontSize: 10.5 }}>{r[4]}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card style={{ padding: 14 }}>
          <CardTitle>Geographic footprint</CardTitle>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
            <ThailandMap w={210} h={300} points={mapPoints} />
          </div>
          <div style={{
            display: 'grid', gap: 4, marginTop: 8,
            fontFamily: 'Sarabun, sans-serif', fontSize: 11,
          }}>
            <Legend swatch="#0c2c5e" label="HQ · Pathum Thani" />
            <Legend swatch="#7c3aed" label="Suppliers (9)" />
            <Legend swatch="#0d9488" label="Customers (6)" />
            <Legend swatch="#b45309" label="Partners (2)" />
          </div>
        </Card>
      </div>
    </section>
  );
}

function InvestmentSection() {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
  const revenue = [820, 905, 1180, 1340, 1520, 1840];   // ฿M
  const exportShare = [12, 15, 22, 28, 32, 38];          // %
  return (
    <section style={section}>
      <SectionHeader domain="inv" num="06" title="Investment & financial"
        th="การลงทุนและการเงิน" kicker="FY 2024 · BOI promoted" />
      <div style={cardGrid('1.4fr 1fr')}>
        <Card>
          <CardTitle>Revenue & export share · 6 yrs</CardTitle>
          <ComboChart years={years} bars={revenue} line={exportShare}
            w={580} h={210} barColor="#15803d" lineColor="#0c2c5e" />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
            marginTop: 8, fontFamily: 'Sarabun, sans-serif',
          }}>
            <Stat color="#15803d" v="฿1.84B" lbl="Revenue · 2024" sub="+21% YoY" />
            <Stat color="#0c2c5e" v="38%"    lbl="Export share"   sub="+6 pp YoY" />
            <Stat color="#7c3aed" v="฿246M"  lbl="R&D + capex"    sub="13.4% of rev" />
          </div>
        </Card>
        <Card>
          <CardTitle>Government incentives & funding</CardTitle>
          <div style={{
            display: 'grid', gap: 8, fontFamily: 'Sarabun, sans-serif', fontSize: 13,
          }}>
            <IncentiveRow status="active" name="BOI Promotion Cert. B7-1"
              detail="A1 · 8-yr tax holiday · 2018–2026" />
            <IncentiveRow status="active" name="NRIIS Research Grant"
              detail="฿24M · Phased-array R&D · 2023" />
            <IncentiveRow status="closed" name="EEC Investment Privilege"
              detail="Land lease · 2019–2022" />
            <IncentiveRow status="active" name="GISTDA THEOS-2 Cluster"
              detail="EO downlink partner · 2024–" />
          </div>
          <hr style={hr} />
          <div style={{
            padding: '8px 10px', background: _D.inv.tint, color: _D.inv.color,
            fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Source · BOI + NRIIS + DBD filings</span>
            <span style={{ fontWeight: 600 }}>Cross-verified</span>
          </div>
        </Card>
      </div>
    </section>
  );
}

function EsgSection() {
  const radar = ['Energy', 'GHG', 'Water', 'Waste', 'Social'];
  const radarVals = [72, 58, 65, 48, 80];
  return (
    <section style={section}>
      <SectionHeader domain="esg" num="07" title="Sustainability & ESG"
        th="ความยั่งยืนและ ESG" kicker="2024 self-reported · confidence: reported" />
      <div style={cardGrid('1fr 1.2fr 1fr')}>
        <Card>
          <CardTitle>Dimension scores · 0–100</CardTitle>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarMini axes={radar} values={radarVals} size={210} color="#65a30d" />
          </div>
          <div style={{
            marginTop: 6, fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
            color: '#5b6b80', textAlign: 'center',
          }}>
            Composite ESG score · <strong style={{ color: '#65a30d', fontSize: 14 }}>64</strong> / 100
          </div>
        </Card>
        <Card>
          <CardTitle>Emissions & energy · trend</CardTitle>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
            marginBottom: 12,
          }}>
            <MiniSpark color="#65a30d" data={[2840, 2620, 2410, 2180, 1980, 1820]} unit="tCO₂e"
              lbl="GHG emissions · scope 1+2" delta="−35.9%" />
            <MiniSpark color="#0d9488" data={[1820, 1980, 2140, 2360, 2520, 2820]} unit="MWh"
              lbl="Energy use" delta="+55.0%" />
            <MiniSpark color="#65a30d" data={[8, 12, 18, 24, 32, 41]} unit="%"
              lbl="Renewable share" delta="+33 pp" />
            <MiniSpark color="#15803d" data={[14, 18, 21, 26, 32, 38]} unit="%"
              lbl="Waste recycled" delta="+24 pp" />
          </div>
          <hr style={hr} />
          <CardTitle small>Certifications</CardTitle>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ISO 14001:2015', 'ISO 50001', 'CDP B', 'GRI 2024', 'TCFD-aligned'].map(c => (
              <span key={c} style={{
                ...chip, background: _D.esg.tint, color: _D.esg.color, fontWeight: 600,
              }}>{c}</span>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>Confidence & provenance</CardTitle>
          <div style={{
            display: 'grid', gap: 8, fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
          }}>
            <KvRow k="Confidence flag" v={
              <span style={{
                color: '#15803d', fontWeight: 600,
              }}>● Reported</span>
            } />
            <KvRow k="Reporting period" v="FY 2024 (Jan–Dec)" />
            <KvRow k="Boundary"     v="Scope 1+2 only (3 not reported)" />
            <KvRow k="Methodology"  v="GHG Protocol · location-based" />
            <KvRow k="Assurance"    v="None · self-attested" />
            <KvRow k="Source"       v="Sustainability Report 2024 (PDF)" />
          </div>
          <div style={{
            marginTop: 14, padding: 10,
            background: '#fef3c7', borderLeft: '3px solid #d97706',
            fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
            color: '#78350f', lineHeight: 1.45,
          }}>
            <strong>Note:</strong> ESG figures are self-reported. Until Phase 2 introduces
            assurance workflows, confidence is set at row-level.
          </div>
        </Card>
      </div>
    </section>
  );
}

function FooterStrip() {
  const events = [
    { date: '12 May 2026 · 14:22', body: 'Patent count revised to 11.', domain: 'tech', user: 'planner.a' },
    { date: '09 May 2026 · 11:08', body: 'Supplier link added: Mongkut Optics Ltd.', domain: 'sc', user: 'planner.a' },
    { date: '28 Apr 2026 · 09:41', body: 'ESG snapshot 2024 imported via CSV.', domain: 'esg', user: 'planner.a' },
    { date: '14 Apr 2026 · 16:55', body: 'TRL 7 confirmed: Phased-Array Antenna.', domain: 'tech', user: 'planner.a' },
    { date: '02 Apr 2026 · 10:12', body: 'BOI Promotion Cert. B7-1 attached.', domain: 'inv', user: 'planner.a' },
  ];
  return (
    <section style={section}>
      <SectionHeader domain="firm" num="//" title="Activity log & sources"
        th="บันทึกการเปลี่ยนแปลงและแหล่งที่มา" kicker="last 30 days" />
      <div style={cardGrid('1fr 1fr')}>
        <Card>
          <CardTitle>Audit timeline · last 5 events</CardTitle>
          <Timeline events={events} w={500} />
        </Card>
        <Card>
          <CardTitle>Cited sources for this firm</CardTitle>
          <div style={{
            display: 'grid', gap: 10, fontFamily: 'Sarabun, sans-serif',
          }}>
            {[
              ['BOI', 'BOI Promotion Registry',         'identity · investment',    '2024 export', 9],
              ['DBD', 'DBD Juristic Registry',          'identity · ownership',     '2024 query',  4],
              ['NRIIS', 'NRIIS Researcher DB',           'R&D · technology',         '2024 export', 6],
              ['DIP', 'DIP Patent Search',              'patents',                   '2024 query',  11],
              ['GISTDA', 'GISTDA Sat-Op Registry',       'supply chain',             '2024 export', 4],
              ['SURVEY', 'Firm survey 2026',             'HR · ESG',                 'Mar 2026',    8],
            ].map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '70px 1fr auto 60px',
                gap: 14, alignItems: 'center',
                padding: '8px 0', borderBottom: '1px dotted #eaeef5',
                fontSize: 12.5,
              }}>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 10.5, letterSpacing: '0.08em',
                  color: '#fff', background: '#0c2c5e',
                  padding: '4px 8px', textAlign: 'center',
                  fontWeight: 600,
                }}>{s[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f1729' }}>{s[1]}</div>
                  <div style={{ fontSize: 11, color: '#5b6b80' }}>{s[2]}</div>
                </div>
                <div style={{ fontSize: 11, color: '#5b6b80' }}>{s[3]}</div>
                <div style={{ ...mono, textAlign: 'right' }}>{s[4]} rec</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function PageFooter() {
  return (
    <div style={{ background: '#0c2c5e', color: '#a5b6d0', marginTop: 40 }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        padding: '28px 32px',
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 28,
        fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
      }}>
        <div>
          <div style={{
            fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 6,
          }}>Thai Satellite Industry Database</div>
          <div>ระบบฐานข้อมูลอุตสาหกรรมดาวเทียมแห่งชาติ</div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#7a8db0', lineHeight: 1.6 }}>
            A consolidated record of Thai satellite-industry firms. Phase 1 prototype —
            data shown is mock for demonstration. Real records will be published as the
            governance pipeline is brought online in Phase 2.
          </div>
        </div>
        <FooterCol title="The database" links={['Methodology', 'Taxonomy', 'Sources', 'Inception report']} />
        <FooterCol title="For planners" links={['Workbench', 'Bulk import', 'Templates', 'Audit log']} />
        <FooterCol title="Contact" links={['NSTDA · ความช่วยเหลือ', 'BOI liaison', 'GISTDA liaison', 'Submit a correction']} />
      </div>
      <div style={{
        background: '#091f44',
        padding: '12px 0',
        fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
        color: '#7a8db0',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto', padding: '0 32px',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>© 2026 Royal Thai Government · National Science &amp; Technology Development Agency</span>
          <span>v Phase 1.0 · draft · 19 May 2026</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SMALL HELPERS
// =========================================================================

function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #dde3ec',
      padding: 18, ...style,
    }}>{children}</div>
  );
}
function CardTitle({ children, small }) {
  return (
    <div style={{
      fontFamily: 'Sarabun, sans-serif',
      fontWeight: 600, color: '#0f1729',
      fontSize: small ? 12 : 13,
      letterSpacing: small ? '0.08em' : '0.02em',
      textTransform: small ? 'uppercase' : 'none',
      marginBottom: small ? 8 : 14,
    }}>{children}</div>
  );
}
function KvRow({ k, v }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '5px 0', borderBottom: '1px dotted #eaeef5',
      fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
    }}>
      <span style={{ color: '#5b6b80' }}>{k}</span>
      <span style={{ color: '#0f1729', textAlign: 'right' }}>{v}</span>
    </div>
  );
}
function Legend({ swatch, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, background: swatch, borderRadius: 2, display: 'inline-block' }}></span>
      {label}
    </span>
  );
}
function Stat({ color, v, lbl, sub }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1.1 }}>{v}</div>
      <div style={{ fontSize: 11.5, color: '#0f1729', fontWeight: 500 }}>{lbl}</div>
      <div style={{ fontSize: 10.5, color: '#5b6b80' }}>{sub}</div>
    </div>
  );
}
function IncentiveRow({ status, name, detail }) {
  const isActive = status === 'active';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '12px 1fr',
      gap: 10, padding: '6px 0',
      borderBottom: '1px dotted #eaeef5',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: isActive ? '#15803d' : '#a5b6d0',
        marginTop: 6,
      }}></span>
      <div>
        <div style={{ fontWeight: 600, color: '#0f1729' }}>
          {name}
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: isActive ? '#15803d' : '#5b6b80',
          }}>{status}</span>
        </div>
        <div style={{ fontSize: 11.5, color: '#5b6b80' }}>{detail}</div>
      </div>
    </div>
  );
}
function MiniSpark({ color, data, unit, lbl, delta }) {
  const v = data[data.length - 1];
  const up = delta && delta.startsWith('+');
  const deltaColor = up ? '#15803d' : '#dc2626';
  return (
    <div style={{
      border: '1px solid #eaeef5',
      padding: 10,
    }}>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 11,
        color: '#5b6b80', letterSpacing: '0.04em',
        textTransform: 'uppercase', fontWeight: 600,
      }}>{lbl}</div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2,
      }}>
        <span style={{
          fontFamily: 'Sarabun, sans-serif', fontWeight: 700,
          fontSize: 16, color: '#0f1729',
        }}>{v.toLocaleString()}</span>
        <span style={{ fontSize: 10, color: '#5b6b80' }}>{unit}</span>
        <span style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600,
          color: deltaColor,
        }}>{delta}</span>
      </div>
      <SparkLine data={data} w={150} h={28} color={color} />
    </div>
  );
}
function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{
        color: '#fff', fontWeight: 700, fontSize: 12.5,
        marginBottom: 6, letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>{title}</div>
      {links.map(l => (
        <div key={l} style={{
          fontSize: 12, padding: '3px 0',
          fontFamily: 'Sarabun, sans-serif',
          cursor: 'pointer',
        }}>{l}</div>
      ))}
    </div>
  );
}

// =========================================================================
// STYLES (shared)
// =========================================================================
const linkLight = {
  color: '#e3eaf3', textDecoration: 'none', cursor: 'pointer',
  fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
};
const iconBtn = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
  color: '#e3eaf3', cursor: 'pointer',
  fontFamily: 'Sarabun, sans-serif', fontSize: 11,
  padding: '2px 8px', borderRadius: 2,
};
const metaLabel = {
  fontFamily: 'Sarabun, sans-serif',
  fontSize: 10.5, color: '#5b6b80',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  fontWeight: 600, marginBottom: 2,
};
const metaVal = {
  fontFamily: 'Sarabun, sans-serif', fontWeight: 600,
  fontSize: 14.5, color: '#0f1729',
};
const metaSub = {
  fontFamily: 'Sarabun, sans-serif',
  fontSize: 11, color: '#5b6b80', marginTop: 1,
};
const section = {
  maxWidth: 1440, margin: '0 auto',
  padding: '28px 32px 0',
};
const cardGrid = (cols) => ({
  display: 'grid', gridTemplateColumns: cols, gap: 16,
});
const hr = {
  border: 'none', borderTop: '1px solid #eaeef5',
  margin: '16px 0',
};
const chip = {
  display: 'inline-block', padding: '2px 8px',
  background: '#f1f4f9', color: '#43526b',
  fontFamily: 'Sarabun, sans-serif', fontSize: 11,
  borderRadius: 2,
};
const mono = {
  fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5,
  color: '#0f1729', fontVariantNumeric: 'tabular-nums',
};
const techRowHd = {
  fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
  color: '#5b6b80', letterSpacing: '0.08em',
  textTransform: 'uppercase', fontWeight: 600,
  padding: '6px 0', borderBottom: '1px solid #dde3ec',
};
const techCell = {
  padding: '6px 0', borderBottom: '1px dotted #eaeef5',
  fontFamily: 'Sarabun, sans-serif',
};
const scRowHd = {
  display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.9fr 0.7fr',
  gap: 10, padding: '6px 0',
  fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
  color: '#5b6b80', letterSpacing: '0.08em',
  textTransform: 'uppercase', fontWeight: 600,
  borderBottom: '1px solid #dde3ec',
};
const scRow = {
  display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.9fr 0.7fr',
  gap: 10, padding: '7px 0',
  borderBottom: '1px dotted #eaeef5',
  alignItems: 'center',
  fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
};

// =========================================================================
// PAGE
// =========================================================================
function Portal() {
  return (
    <div style={{
      background: '#f1f4f9',
      minHeight: '100vh',
      fontFamily: 'Sarabun, sans-serif',
      color: '#0f1729',
    }}>
      <GovTopBar />
      <MainHeader />
      <PrimaryNav />
      <Breadcrumb />
      <FirmHero />
      <DomainTabs />
      <OverviewSection />
      <ValueChainSection />
      <TechnologySection />
      <HrSection />
      <SupplyChainSection />
      <InvestmentSection />
      <EsgSection />
      <FooterStrip />
      <PageFooter />
    </div>
  );
}

window.Portal = Portal;
