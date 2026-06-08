// wb/pages-import.jsx — Bulk import wizard: Template → Upload → Review → Commit.

function ImportPage() {
  const [step, setStep] = React.useState(1);
  const [template, setTemplate] = React.useState('firm');
  const [file, setFile] = React.useState(null);
  const [parsing, setParsing] = React.useState(false);

  const handleFile = async (f) => {
    setParsing(true);
    setFile(f);
    await sleep(700);
    setParsing(false);
    setStep(3);
  };

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Workbench', to: '/' },
          { label: 'Bulk import' },
        ]}
        eyebrow="Flow 7 · Bulk operations"
        title="Bulk import"
        th="นำเข้าข้อมูลจำนวนมาก · CSV / Excel · staging → dry-run → commit"
      />

      <ImportStepper current={step} onJump={n => n < step && setStep(n)} />

      <div style={{ marginTop: 24 }}>
        {step === 1 && <ImportStep1 value={template} onChange={setTemplate}
          onContinue={() => setStep(2)} />}
        {step === 2 && <ImportStep2 template={template} parsing={parsing}
          file={file} onFile={handleFile}
          onBack={() => setStep(1)} />}
        {step === 3 && <ImportStep3 template={template} file={file}
          onBack={() => setStep(2)} onContinue={() => setStep(4)} />}
        {step === 4 && <ImportStep4 file={file}
          onBack={() => setStep(3)} />}
      </div>
    </div>
  );
}

function ImportStepper({ current, onJump }) {
  const steps = [
    { n: 1, label: 'Template' },
    { n: 2, label: 'Upload' },
    { n: 3, label: 'Review' },
    { n: 4, label: 'Commit' },
  ];
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: 8, padding: 4,
      display: 'flex', alignItems: 'stretch', gap: 0,
    }}>
      {steps.map((s, i) => {
        const status = s.n < current ? 'done' : s.n === current ? 'active' : 'idle';
        return (
          <React.Fragment key={s.n}>
            <button onClick={() => onJump(s.n)}
              disabled={s.n > current}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 6,
                border: 'none', cursor: s.n < current ? 'pointer' : 'default',
                background: status === 'active' ? T.accentSoft : 'transparent',
                display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start',
                textAlign: 'left',
              }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: status === 'done' ? T.ok : status === 'active' ? T.accent : T.subtle,
                color: status === 'idle' ? T.muted : '#fff',
                display: 'grid', placeItems: 'center',
                fontFamily: 'Sarabun, sans-serif', fontSize: 11, fontWeight: 700,
              }}>
                {status === 'done' ? '✓' : s.n}
              </div>
              <span style={{
                fontFamily: 'Sarabun, sans-serif', fontSize: 13,
                fontWeight: status === 'active' ? 700 : 500,
                color: status === 'idle' ? T.muted : status === 'done' ? T.ink : T.accent,
              }}>{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div style={{
                width: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.muted2,
              }}>›</div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// =========================================================================
// STEP 1 — Pick template
// =========================================================================
function ImportStep1({ value, onChange, onContinue }) {
  const templates = [
    { id: 'firm', icon: '◇', name: 'Firm identity',     th: 'ข้อมูลองค์กร',
      cols: 12, sample: 'juristic_id, name_th, name_en, founded_year, ownership, hq_city, …',
      domain: 'firm' },
    { id: 'vc', icon: '◈', name: 'Value chain',          th: 'ห่วงโซ่คุณค่า',
      cols: 8, sample: 'firm_jid, segment, sub_activity, product_desc, tech_level, certifications, …',
      domain: 'vc' },
    { id: 'tech', icon: '⚙', name: 'Technology',         th: 'เทคโนโลยี',
      cols: 10, sample: 'firm_jid, tech_name, trl, patent_count, rd_spend, rd_headcount, …',
      domain: 'tech' },
    { id: 'hr', icon: '◯', name: 'HR snapshot',          th: 'ทรัพยากรบุคคล',
      cols: 9, sample: 'firm_jid, year, engineers, researchers, technicians, skill_gaps, …',
      domain: 'hr' },
    { id: 'sc', icon: '⇄', name: 'Supply-chain edges',   th: 'ความสัมพันธ์',
      cols: 7, sample: 'src_jid, target_jid, direction, type, description, source_id, …',
      domain: 'sc' },
    { id: 'inv', icon: '฿', name: 'Investment',          th: 'การลงทุน',
      cols: 8, sample: 'firm_jid, year, revenue_thb, export_share, boi_status, …',
      domain: 'inv' },
    { id: 'esg', icon: '◐', name: 'ESG snapshot',        th: 'ESG',
      cols: 11, sample: 'firm_jid, year, ghg_scope12, energy_mwh, renewable_share, …',
      domain: 'esg' },
  ];
  return (
    <Card pad={28}>
      <h2 style={importHeading}>Pick a template</h2>
      <p style={importLede}>
        Each template targets one domain. Mixing domains in one file is rejected at parse.
        Download a template if you don't have one — column headers must match exactly.
      </p>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 18,
      }}>
        {templates.map(t => (
          <TemplateCard key={t.id} template={t}
            selected={value === t.id} onClick={() => onChange(t.id)} />
        ))}
      </div>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button kind="ghost" onClick={() => go('/')}>Cancel</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button kind="secondary" icon="⤓">
            Download .xlsx template
          </Button>
          <Button kind="primary" onClick={onContinue} disabled={!value}>
            Continue to upload →
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TemplateCard({ template, selected, onClick }) {
  const d = DOMAIN_META[template.domain];
  return (
    <button type="button" onClick={onClick}
      style={{
        textAlign: 'left', padding: 16, borderRadius: 8, cursor: 'pointer',
        border: `1px solid ${selected ? T.accent : T.line}`,
        background: selected ? T.accentSoft : T.surface,
        transition: 'all 120ms',
        borderLeft: `3px solid ${d.color}`,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: selected ? d.color : `${d.color}15`,
          color: selected ? '#fff' : d.color,
          display: 'grid', placeItems: 'center', fontSize: 16,
          fontFamily: '"IBM Plex Mono", monospace',
        }}>{template.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink }}>
            {template.name}
          </div>
          <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted }}>
            {template.th} · {template.cols} columns
          </div>
        </div>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          border: `2px solid ${selected ? T.accent : T.lineStrong}`,
          background: selected ? T.accent : 'transparent',
          display: 'grid', placeItems: 'center',
        }}>
          {selected && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }}></span>}
        </div>
      </div>
      <div style={{
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: T.muted,
        background: selected ? '#fff' : T.subtle, padding: '6px 8px', borderRadius: 4,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{template.sample}</div>
    </button>
  );
}

// =========================================================================
// STEP 2 — Upload
// =========================================================================
function ImportStep2({ template, parsing, file, onFile, onBack }) {
  const [dragging, setDragging] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile({ name: f.name, size: f.size, type: f.type });
  };

  const fakeUpload = (name) => {
    onFile({ name, size: 287_412, type: 'csv' });
  };

  return (
    <Card pad={28}>
      <h2 style={importHeading}>Upload your file</h2>
      <p style={importLede}>
        Drop a UTF-8 CSV or XLSX matching the <DomainPill domain={
          template === 'sc' ? 'sc' : template === 'vc' ? 'vc' : template
        } /> template. First row must contain the canonical column headers.
      </p>

      {parsing ? (
        <ParsingState />
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            marginTop: 20, padding: '40px 32px',
            border: `2px dashed ${dragging ? T.accent : T.lineStrong}`,
            background: dragging ? T.accentSoft : T.subtle,
            borderRadius: 12, textAlign: 'center',
            transition: 'all 120ms',
          }}>
          <div style={{ fontSize: 32, color: T.muted, marginBottom: 8 }}>⤓</div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 16, fontWeight: 600, color: T.ink,
          }}>
            Drop a file here, or click to browse
          </div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.muted, marginTop: 6,
          }}>
            CSV or XLSX · UTF-8 encoding · max 25 MB
          </div>
          <div style={{ marginTop: 18 }}>
            <Button kind="secondary" onClick={() => fileInputRef.current?.click()}>
              Browse files…
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx" hidden
              onChange={(e) => e.target.files[0] && fakeUpload(e.target.files[0].name)} />
          </div>
          <div style={{
            marginTop: 24, paddingTop: 16,
            borderTop: `1px solid ${T.line}`,
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
          }}>
            Or try a sample: {' '}
            <a onClick={() => fakeUpload('boi_export_2024_q4.xlsx')}
              style={{ color: T.accent, cursor: 'pointer', fontWeight: 500 }}>
              boi_export_2024_q4.xlsx
            </a>
            <span style={{ margin: '0 8px', color: T.muted2 }}>·</span>
            <a onClick={() => fakeUpload('nriis_researchers_2024.csv')}
              style={{ color: T.accent, cursor: 'pointer', fontWeight: 500 }}>
              nriis_researchers_2024.csv
            </a>
          </div>
        </div>
      )}

      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button kind="ghost" onClick={onBack} disabled={parsing}>← Back</Button>
        <span style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
          alignSelf: 'center',
        }}>
          {parsing && 'Parsing file & running dry-run validation…'}
        </span>
      </div>
    </Card>
  );
}

function ParsingState() {
  return (
    <div style={{
      marginTop: 20, padding: '40px 32px',
      background: T.subtle, borderRadius: 12, textAlign: 'center',
      animation: 'slideUp 200ms ease',
    }}>
      <div style={{
        width: 36, height: 36,
        border: `3px solid ${T.accent}`, borderTopColor: 'transparent',
        borderRadius: '50%', margin: '0 auto 14px',
        animation: 'spin 0.7s linear infinite',
      }}></div>
      <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink }}>
        Validating against the application layer…
      </div>
      <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted, marginTop: 4 }}>
        Same Zod schemas as the firm-creation form. Per-row.
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// =========================================================================
// STEP 3 — Review (dry-run) — the wow moment
// =========================================================================
function ImportStep3({ template, file, onBack, onContinue }) {
  const [filter, setFilter] = React.useState('all');
  const [selectedRow, setSelectedRow] = React.useState(null);

  // Synthetic data — 12 rows representative
  const allRows = [
    { row: 1, jid: '0107554000372', name: 'Starfield Aerospace Co., Ltd.', status: 'reject', codes: ['DUPLICATE_DETECTED'], note: 'Firm already exists (sf-001)' },
    { row: 2, jid: '0107562001844', name: 'Andaman SpaceTech PCL',         status: 'reject', codes: ['DUPLICATE_DETECTED'], note: 'Firm already exists (sf-002)' },
    { row: 3, jid: '0105549073216', name: 'Korat Ground Systems',          status: 'ok',     codes: [] },
    { row: 4, jid: '0107551073001', name: 'Phitsanulok Composites',        status: 'ok',     codes: [] },
    { row: 5, jid: '0107561900445', name: 'Ranong Antenna Co.',            status: 'warn',   codes: ['LOW_CONFIDENCE_NAME'], note: 'Name partially in EN only — Thai name missing' },
    { row: 6, jid: '0107555001100', name: 'Krabi LaunchTech Ltd.',         status: 'ok',     codes: [] },
    { row: 7, jid: '01055590127xx', name: 'Nakhon Sat Systems',            status: 'reject', codes: ['INVALID_JURISTIC_ID'], note: 'JID contains non-digit characters' },
    { row: 8, jid: '0107558019283', name: 'Yala Optics PCL',               status: 'ok',     codes: [] },
    { row: 9, jid: '0107561005422', name: 'Surin SatComm Ltd.',            status: 'warn',   codes: ['DRAFT_EXISTS'], note: 'Already exists in your drafts' },
    { row: 10, jid: '0103553000118', name: 'Mae Hong Son Telemetry',       status: 'ok',     codes: [] },
    { row: 11, jid: '0107556009921', name: 'Buriram Earth Stn.',           status: 'reject', codes: ['UNKNOWN_INDUSTRY_CODE', 'MISSING_OWNERSHIP'], note: 'Two rejection codes' },
    { row: 12, jid: '0107562899034', name: 'Chumphon Composites Co.',      status: 'ok',     codes: [] },
  ];
  const counts = {
    ok:     allRows.filter(r => r.status === 'ok').length,
    warn:   allRows.filter(r => r.status === 'warn').length,
    reject: allRows.filter(r => r.status === 'reject').length,
  };
  const filtered = filter === 'all' ? allRows : allRows.filter(r => r.status === filter);

  return (
    <Card pad={0}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <h2 style={importHeading}>Validation report</h2>
            <p style={{ ...importLede, marginBottom: 0 }}>
              <strong style={{ color: T.ink }}>{file?.name}</strong> · {allRows.length} rows ·
              We caught <strong>{counts.reject + counts.warn}</strong> issues before they reach the database.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <RowStat status="ok"     count={counts.ok} />
            <RowStat status="warn"   count={counts.warn} />
            <RowStat status="reject" count={counts.reject} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
          <Segmented value={filter} onChange={setFilter}
            options={[
              { value: 'all',    label: `All · ${allRows.length}` },
              { value: 'ok',     label: `OK · ${counts.ok}` },
              { value: 'warn',   label: `Warnings · ${counts.warn}` },
              { value: 'reject', label: `Rejects · ${counts.reject}` },
            ]} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button kind="secondary" size="sm" icon="⤓">Download report.csv</Button>
            <Button kind="ghost" size="sm">Re-validate</Button>
          </div>
        </div>
      </div>

      <table style={{ ...tableStyle, fontSize: 12.5 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 60 }}>Row</th>
            <th style={{ ...thStyle, width: 110 }}>Status</th>
            <th style={{ ...thStyle, width: 160 }}>Juristic ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Error codes</th>
            <th style={{ ...thStyle, width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <ImportRow key={r.row} row={r}
              expanded={selectedRow === r.row}
              onToggle={() => setSelectedRow(selectedRow === r.row ? null : r.row)} />
          ))}
        </tbody>
      </table>

      <div style={{
        padding: '14px 24px', borderTop: `1px solid ${T.line}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: T.subtle, borderRadius: '0 0 8px 8px',
      }}>
        <Button kind="ghost" onClick={onBack}>← Back to upload</Button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted, marginRight: 8,
          }}>
            Next: choose what to commit
          </span>
          <Button kind="primary" onClick={onContinue}>
            Commit options →
          </Button>
        </div>
      </div>
    </Card>
  );
}

function RowStat({ status, count }) {
  const map = {
    ok:     { color: T.ok,     label: 'OK',         dot: '●' },
    warn:   { color: T.warn,   label: 'Warning',    dot: '●' },
    reject: { color: T.danger, label: 'Rejected',   dot: '●' },
  };
  const m = map[status];
  return (
    <div>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 11, color: T.muted,
        letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
      }}>{m.label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 9, color: m.color }}>{m.dot}</span>
        <span style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 20, fontWeight: 700,
          color: m.color, lineHeight: 1, letterSpacing: '-0.01em',
        }}>{count}</span>
      </div>
    </div>
  );
}

function ImportRow({ row, expanded, onToggle }) {
  const statusMap = {
    ok:     { color: T.ok,     bg: 'transparent',    icon: '✓', label: 'OK' },
    warn:   { color: T.warn,   bg: '#fffbeb',        icon: '!', label: 'WARN' },
    reject: { color: T.danger, bg: '#fef2f2',        icon: '✕', label: 'REJECT' },
  };
  const s = statusMap[row.status];
  return (
    <>
      <tr className="wb-row-hover"
        onClick={onToggle}
        style={{ cursor: 'pointer', background: s.bg }}>
        <td style={{ ...tdStyle, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, color: T.muted }}>
          #{row.row}
        </td>
        <td style={tdStyle}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 4,
            background: `${s.color}18`, color: s.color,
            fontFamily: 'Sarabun, sans-serif', fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.04em',
          }}>
            {s.icon} {s.label}
          </span>
        </td>
        <td style={{ ...tdStyle, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5, letterSpacing: '0.02em' }}>
          {row.jid}
        </td>
        <td style={{ ...tdStyle, fontWeight: row.status === 'reject' ? 500 : 600 }}>
          {row.name}
        </td>
        <td style={tdStyle}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {row.codes.map(c => (
              <code key={c} style={{
                fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5,
                padding: '1px 6px', borderRadius: 3,
                background: s.color === T.danger ? T.dangerSoft : s.color === T.warn ? T.warnSoft : T.subtle,
                color: s.color, fontWeight: 600,
              }}>{c}</code>
            ))}
            {row.codes.length === 0 && <span style={{ color: T.muted2 }}>—</span>}
          </div>
        </td>
        <td style={tdStyle}>
          <span style={{ color: T.muted, fontSize: 14 }}>{expanded ? '▾' : '▸'}</span>
        </td>
      </tr>
      {expanded && row.codes.length > 0 && (
        <tr style={{ background: s.bg }}>
          <td colSpan={6} style={{ padding: '14px 24px 18px 24px' }}>
            <div style={{
              padding: 14, background: '#fff', borderRadius: 6,
              borderLeft: `3px solid ${s.color}`,
              fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
            }}>
              <div style={{ marginBottom: 8, color: s.color, fontWeight: 600 }}>
                {row.note}
              </div>
              <div style={{
                display: 'flex', gap: 8, marginTop: 10, alignItems: 'center',
              }}>
                <Button kind="primary" size="sm" icon="✎">Fix in staging</Button>
                <Button kind="secondary" size="sm">Open existing record</Button>
                <Button kind="ghost" size="sm">Skip this row</Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// =========================================================================
// STEP 4 — Commit
// =========================================================================
function ImportStep4({ file, onBack }) {
  const [mode, setMode] = React.useState('ok_only');
  const [confirming, setConfirming] = React.useState(false);
  const [committed, setCommitted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const counts = { ok: 7, warn: 2, reject: 3, total: 12 };
  const toCommit = mode === 'ok_only' ? counts.ok : mode === 'ok_warn' ? counts.ok + counts.warn : counts.total;

  const doCommit = async () => {
    setConfirming(true);
    for (let i = 0; i <= toCommit; i++) {
      await sleep(60);
      setProgress(i);
    }
    setCommitted(true);
    window.toast?.(`Import committed · ${toCommit} firms created`, {
      kind: 'success', sub: `imp-23 · ${toCommit} ok · 0 server reject`, duration: 5000,
    });
  };

  if (committed) {
    return <CommitDoneState file={file} count={toCommit} />;
  }

  if (confirming) {
    return (
      <Card pad={28}>
        <h2 style={importHeading}>Committing import…</h2>
        <p style={importLede}>
          Promoting {toCommit} rows from <code style={{ background: T.subtle, padding: '1px 5px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>staging_firm</code> to <code style={{ background: T.subtle, padding: '1px 5px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>firm</code>. Audit log entries are being created.
        </p>
        <div style={{ marginTop: 24 }}>
          <div style={{
            height: 8, background: T.subtle, borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{
              width: `${(progress / toCommit) * 100}%`, height: '100%',
              background: T.accent, transition: 'width 60ms linear',
              borderRadius: 999,
            }}></div>
          </div>
          <div style={{
            marginTop: 8, fontFamily: 'Sarabun, sans-serif', fontSize: 12,
            display: 'flex', justifyContent: 'space-between', color: T.muted,
          }}>
            <span>Row {progress} of {toCommit}</span>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{Math.round((progress / toCommit) * 100)}%</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card pad={28}>
      <h2 style={importHeading}>Choose what to commit</h2>
      <p style={importLede}>
        Rejected rows stay in staging — you can re-upload after fixes. Warnings can be committed
        but will carry a flag through to the audit log.
      </p>

      <div style={{ marginTop: 22, display: 'grid', gap: 10 }}>
        <CommitOption value="ok_only" mode={mode} onChange={setMode}
          label={`Commit only OK rows (${counts.ok})`}
          sub="Safest. Warnings and rejects stay in staging — defer for later."
          recommended />
        <CommitOption value="ok_warn" mode={mode} onChange={setMode}
          label={`Commit OK + warnings (${counts.ok + counts.warn})`}
          sub="Warnings get a flag in the audit log. Reviewer can act later." />
        <CommitOption value="force" mode={mode} onChange={setMode}
          label={`Force-commit everything (${counts.total})`}
          sub="Including rejects. Bypasses governance — requires admin confirmation."
          danger />
      </div>

      <Divider />

      <div style={{
        padding: 14, background: T.subtle, borderRadius: 8,
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 24, color: T.accent }}>◆</div>
        <div>
          <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600, color: T.ink }}>
            About to write {toCommit} new firm records
          </div>
          <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted, marginTop: 2 }}>
            From <strong>{file?.name}</strong> · attributed to source <strong>BOI Promotion Registry</strong> ·
            actor <strong>planner.a</strong>
          </div>
        </div>
        <Ring pct={Math.round(toCommit / counts.total * 100)} size={36} thickness={4} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button kind="ghost" onClick={onBack}>← Back to review</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button kind="secondary">Save as staging job</Button>
          <Button kind={mode === 'force' ? 'dangerSolid' : 'primary'} onClick={doCommit}>
            Commit {toCommit} rows <Kbd>⌘↵</Kbd>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CommitOption({ value, mode, onChange, label, sub, recommended, danger }) {
  const selected = mode === value;
  return (
    <button type="button" onClick={() => onChange(value)}
      style={{
        display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 14,
        alignItems: 'center', textAlign: 'left',
        padding: '14px 16px', borderRadius: 8,
        border: `1px solid ${selected ? (danger ? T.danger : T.accent) : T.line}`,
        background: selected ? (danger ? T.dangerSoft : T.accentSoft) : T.surface,
        cursor: 'pointer', transition: 'all 120ms',
      }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${selected ? (danger ? T.danger : T.accent) : T.lineStrong}`,
        background: selected ? (danger ? T.danger : T.accent) : 'transparent',
        display: 'grid', placeItems: 'center',
      }}>
        {selected && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }}></span>}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, fontWeight: 600,
            color: T.ink,
          }}>{label}</span>
          {recommended && <Pill color={T.ok} size="sm">recommended</Pill>}
          {danger && <Pill color={T.danger} size="sm">admin only</Pill>}
        </div>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted, marginTop: 2,
        }}>{sub}</div>
      </div>
    </button>
  );
}

function CommitDoneState({ file, count }) {
  return (
    <Card pad={48}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: T.okSoft, color: T.ok,
          display: 'grid', placeItems: 'center', margin: '0 auto 16px',
          fontSize: 28,
        }}>✓</div>
        <h2 style={{ ...importHeading, marginBottom: 8 }}>Import committed</h2>
        <p style={{ ...importLede, marginBottom: 22, marginLeft: 'auto', marginRight: 'auto' }}>
          <strong>{count}</strong> firms promoted from staging to production.{' '}
          The audit log has been updated.
        </p>
        <div style={{
          maxWidth: 380, margin: '0 auto', padding: 14,
          background: T.subtle, borderRadius: 8,
          fontFamily: 'Sarabun, sans-serif', fontSize: 13,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ color: T.muted }}>Import batch ID</span>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>imp-23</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: `1px dotted ${T.line}` }}>
            <span style={{ color: T.muted }}>Source file</span>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11.5 }}>{file?.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: `1px dotted ${T.line}` }}>
            <span style={{ color: T.muted }}>Rows committed</span>
            <span><strong>{count}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: `1px dotted ${T.line}` }}>
            <span style={{ color: T.muted }}>Committed by</span>
            <span>planner.a · 19 May 2026</span>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button kind="secondary" icon="⤓">Download report.csv</Button>
          <Button kind="primary" onClick={() => go('/firms')}>
            View imported firms →
          </Button>
        </div>
      </div>
    </Card>
  );
}

const importHeading = {
  margin: 0, fontFamily: 'Sarabun, sans-serif',
  fontSize: 20, fontWeight: 600, color: T.ink,
  letterSpacing: '-0.01em', lineHeight: 1.2,
};
const importLede = {
  margin: '6px 0 0', fontFamily: 'Sarabun, sans-serif',
  fontSize: 13.5, color: T.muted, lineHeight: 1.5, maxWidth: 640,
};

Object.assign(window, { ImportPage });
