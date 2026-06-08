// wb/pages-firm-new.jsx — Add new firm flow. The hero of Phase 1.
// Three steps with a live preview rail. Juristic-ID-first with fuzzy dup match.

function NewFirmPage() {
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState({
    juristic: '',
    name_en: '',
    name_th: '',
    founded: '',
    ownership: '',
    industry: '',
    isic: '',
    hq_city_en: '',
    hq_city_th: '',
    address_en: '',
    address_th: '',
    phone: '',
    email: '',
    website: '',
    source_id: '',
    confidence: 'reported',
    reporting_year: 2024,
    confidentiality: 'public',
  });

  // Juristic-ID-specific state
  const [jidValidation, setJidValidation] = React.useState({ ok: false, code: '', msg: '' });
  const [lookupState, setLookupState] = React.useState({ phase: 'idle', result: null });

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  // Live JID validation as user types
  React.useEffect(() => {
    setJidValidation(validateJuristic(data.juristic));
    if (data.juristic.length !== 13) {
      setLookupState({ phase: 'idle', result: null });
    }
  }, [data.juristic]);

  // Trigger DBD lookup on 13-digit completion
  React.useEffect(() => {
    if (data.juristic.length === 13 && /^\d{13}$/.test(data.juristic)) {
      setLookupState({ phase: 'loading', result: null });
      lookupJuristic(data.juristic).then(res => {
        setLookupState({ phase: 'done', result: res });
      });
    }
  }, [data.juristic]);

  const canAdvance = (() => {
    if (step === 1) return data.juristic.length === 13 && lookupState.phase === 'done' && lookupState.result?.kind !== 'exact';
    if (step === 2) return data.name_en && data.name_th && data.founded && data.ownership;
    if (step === 3) return data.source_id;
    return false;
  })();

  const completeness = (() => {
    const fields = ['juristic', 'name_en', 'name_th', 'founded', 'ownership',
      'industry', 'hq_city_en', 'hq_city_th', 'address_en', 'address_th',
      'phone', 'email', 'source_id', 'confidence', 'reporting_year'];
    return Math.round(100 * fields.filter(k => data[k]).length / fields.length);
  })();

  const submit = async () => {
    setStep('saving');
    await sleep(700);
    window.toast?.('Firm record created · 1 source attached · 7 domains awaiting input', {
      kind: 'success', sub: 'planner.a · 19 May 2026', duration: 5000,
    });
    setStep('done');
    setTimeout(() => go(`/firms/sf-001`), 800);
  };

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Workbench', to: '/' },
          { label: 'Firms', to: '/firms' },
          { label: 'Add new firm' },
        ]}
        eyebrow="Flow 1 · Onboarding"
        title="Add a new firm"
        th="เริ่มจากเลขทะเบียนนิติบุคคล 13 หลัก — ระบบจะตรวจสอบทะเบียน DBD โดยอัตโนมัติ"
      />

      {/* Stepper */}
      <Stepper current={step === 'saving' || step === 'done' ? 3 : step} />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24,
        marginTop: 24,
      }}>
        {/* Left — the form */}
        <div>
          {step === 1 && (
            <Step1Identify data={data} update={update}
              validation={jidValidation} lookup={lookupState}
              onContinue={() => canAdvance && setStep(2)} />
          )}
          {step === 2 && (
            <Step2Payload data={data} update={update}
              onBack={() => setStep(1)} onContinue={() => canAdvance && setStep(3)} />
          )}
          {(step === 3 || step === 'saving' || step === 'done') && (
            <Step3Provenance data={data} update={update}
              saving={step === 'saving'} done={step === 'done'}
              onBack={() => setStep(2)}
              onSubmit={submit} />
          )}
        </div>

        {/* Right — live preview */}
        <PreviewRail data={data} completeness={completeness}
          jidValidation={jidValidation} lookup={lookupState} />
      </div>
    </div>
  );
}

// =========================================================================
// STEPPER
// =========================================================================
function Stepper({ current }) {
  const steps = [
    { n: 1, name: 'Identify', th: 'ระบุตัวตน', sub: 'Juristic ID + duplicate check' },
    { n: 2, name: 'Describe', th: 'รายละเอียด', sub: 'Bilingual identity payload' },
    { n: 3, name: 'Attribute', th: 'แหล่งที่มา', sub: 'Source · confidence · period' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      background: T.surface, border: `1px solid ${T.line}`,
      borderRadius: 8, padding: 4,
    }}>
      {steps.map((s, i) => {
        const status = s.n < current ? 'done' : s.n === current ? 'active' : 'idle';
        return (
          <React.Fragment key={s.n}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 6,
              background: status === 'active' ? T.accentSoft : 'transparent',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: status === 'done' ? T.ok : status === 'active' ? T.accent : T.subtle,
                color: status === 'idle' ? T.muted : '#fff',
                display: 'grid', placeItems: 'center',
                fontFamily: 'Sarabun, sans-serif', fontSize: 12, fontWeight: 700,
                flexShrink: 0,
              }}>
                {status === 'done' ? '✓' : s.n}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{
                  fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600,
                  color: status === 'idle' ? T.muted : T.ink,
                  lineHeight: 1.1,
                }}>{s.name}</div>
                <div style={{
                  fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
                  color: status === 'active' ? T.accent : T.muted2,
                }}>{s.sub}</div>
              </div>
            </div>
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
// STEP 1 — Juristic ID + duplicate check
// =========================================================================
function Step1Identify({ data, update, validation, lookup, onContinue }) {
  return (
    <Card pad={28}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={stepHeading}>Start with the juristic ID</h2>
        <p style={stepLede}>
          We'll check the DBD juristic registry and look for similar records already in the system.
          You can't create a duplicate by accident.
        </p>
      </div>

      <Field
        label="Juristic person number"
        required
        hint="13 digits. Issued by the Department of Business Development (DBD)."
      >
        <Input
          value={data.juristic}
          onChange={v => update({ juristic: v.replace(/\D/g, '').slice(0, 13) })}
          placeholder="0 1234 56789 01 2"
          mono size="lg"
          autoFocus
          prefix="JID"
          error={data.juristic.length > 0 && !validation.ok && data.juristic.length === 13}
          suffix={
            <JidStatusIcon
              juristic={data.juristic}
              validation={validation}
              lookup={lookup}
            />
          }
        />
      </Field>

      {/* Status row */}
      <div style={{ marginTop: 10, minHeight: 22 }}>
        {data.juristic.length > 0 && data.juristic.length < 13 && (
          <JidProgress filled={data.juristic.length} />
        )}
        {data.juristic.length === 13 && lookup.phase === 'loading' && (
          <div style={statusRow}>
            <span style={{ width: 12, height: 12, border: `2px solid ${T.accent}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}></span>
            <span style={{ color: T.muted }}>Checking DBD registry…</span>
          </div>
        )}
        {data.juristic.length === 13 && lookup.phase === 'done' && lookup.result.kind === 'exact' && (
          <ExactMatchBanner firm={lookup.result.firm} />
        )}
        {data.juristic.length === 13 && lookup.phase === 'done' && lookup.result.kind === 'fuzzy' && lookup.result.candidates.length > 0 && (
          <FuzzyMatchList candidates={lookup.result.candidates} onContinue={onContinue} />
        )}
        {data.juristic.length === 13 && lookup.phase === 'done' && lookup.result.kind === 'fuzzy' && lookup.result.candidates.length === 0 && (
          <CleanResult />
        )}
      </div>

      <Divider />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <Button kind="ghost" onClick={() => go('/firms')}>Cancel</Button>
        <Button kind="primary" disabled={data.juristic.length !== 13 || lookup.phase !== 'done' || lookup.result?.kind === 'exact'}
          onClick={onContinue}>
          Continue to identity <span style={{ marginLeft: 4 }}>→</span>
        </Button>
      </div>

      {/* Inject spin keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
}

function JidStatusIcon({ juristic, validation, lookup }) {
  if (!juristic) return null;
  if (juristic.length < 13) {
    return <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, color: T.muted }}>
      {juristic.length}/13
    </span>;
  }
  if (lookup.phase === 'loading') return null;
  if (lookup.result?.kind === 'exact') {
    return <span style={{ color: T.warn, fontSize: 14 }}>⚠</span>;
  }
  if (lookup.result?.kind === 'fuzzy' && lookup.result.candidates.length > 0) {
    return <span style={{ color: T.warn, fontSize: 14 }}>!</span>;
  }
  if (lookup.result?.kind === 'fuzzy' && lookup.result.candidates.length === 0) {
    return <span style={{ color: T.ok, fontSize: 14 }}>✓</span>;
  }
  return null;
}

function JidProgress({ filled }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
    }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 13 }).map((_, i) => (
          <span key={i} style={{
            width: 12, height: 3, borderRadius: 2,
            background: i < filled ? T.accent : T.line,
            transition: 'background 100ms',
          }}></span>
        ))}
      </div>
      <span>{filled}/13 digits</span>
    </div>
  );
}

function ExactMatchBanner({ firm }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: T.warnSoft, border: `1px solid #fed7aa`,
      borderRadius: 8,
      animation: 'slideUp 200ms ease',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ color: T.warn, fontSize: 18 }}>⚠</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, fontWeight: 600,
            color: T.ink, marginBottom: 4,
          }}>This firm already exists in the system</div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 12.5, color: T.ink2,
            marginBottom: 8,
          }}>
            <strong>{firm.name_en}</strong> · {firm.name_th}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button kind="primary" size="sm" onClick={() => go(`/firms/${firm.id}`)}>
              Open existing record →
            </Button>
            <Button kind="ghost" size="sm">Use this JID anyway (override)</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FuzzyMatchList({ candidates, onContinue }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: T.warnSoft, border: `1px solid #fed7aa`,
      borderRadius: 8,
      animation: 'slideUp 200ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <span style={{ color: T.warn, fontSize: 18 }}>!</span>
        <div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, fontWeight: 600,
            color: T.ink, marginBottom: 2,
          }}>{candidates.length} similar {candidates.length === 1 ? 'firm' : 'firms'} already in the system</div>
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
          }}>Link to an existing record, or continue creating a new one.</div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 6, paddingLeft: 30 }}>
        {candidates.map(c => (
          <div key={c.firm.id} style={{
            background: T.surface, borderRadius: 6,
            padding: '8px 12px',
            display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center',
          }}>
            <div style={{
              fontFamily: '"IBM Plex Mono", monospace', fontSize: 13,
              color: c.score > 0.85 ? T.danger : T.warn,
              fontWeight: 700, textAlign: 'center',
            }}>{c.score.toFixed(2)}</div>
            <div>
              <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600, color: T.ink }}>
                {c.firm.name_en}
              </div>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: T.muted, letterSpacing: '0.02em' }}>
                JID {c.firm.juristic}
              </div>
            </div>
            <Button kind="secondary" size="sm" onClick={() => go(`/firms/${c.firm.id}`)}>Open</Button>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 12, paddingLeft: 30,
        fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
      }}>
        Score = juristic-ID character match. ≥ 0.85 likely duplicate; lower may be unrelated.
      </div>
    </div>
  );
}

function CleanResult() {
  return (
    <div style={{
      padding: '12px 16px',
      background: T.okSoft, border: `1px solid ${T.ok}33`,
      borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 200ms ease',
    }}>
      <span style={{ color: T.ok, fontSize: 18 }}>✓</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, fontWeight: 600, color: T.ink }}>
          Not in system — you can proceed
        </div>
        <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted, marginTop: 1 }}>
          ไม่พบในระบบ ดำเนินการต่อได้
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// STEP 2 — Identity payload (bilingual)
// =========================================================================
function Step2Payload({ data, update, onBack, onContinue }) {
  return (
    <Card pad={28}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={stepHeading}>Tell us about the firm</h2>
        <p style={stepLede}>
          Names are stored in both Thai and English. Other fields are optional in this step —
          you can complete them later from the firm's overview page.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        {/* Names — side by side */}
        <SubSection label="Names" sub="ชื่อบริษัท · TH and EN are both required for cross-source matching">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Name (Thai)" required>
              <Input value={data.name_th} onChange={v => update({ name_th: v })}
                placeholder="บริษัท ... จำกัด" />
            </Field>
            <Field label="Name (English)" required hint="Romanized or official EN name">
              <Input value={data.name_en} onChange={v => update({ name_en: v })}
                placeholder="... Co., Ltd." />
            </Field>
          </div>
        </SubSection>

        {/* Identity */}
        <SubSection label="Founding & ownership" sub="ปีก่อตั้ง · โครงสร้างผู้ถือหุ้น">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Founded" required>
              <Input value={data.founded} onChange={v => update({ founded: v.replace(/\D/g, '').slice(0, 4) })}
                placeholder="2011" mono />
            </Field>
            <Field label="Ownership type" required>
              <Select value={data.ownership} onChange={v => update({ ownership: v })}
                placeholder="Select…"
                options={['Public', 'Private', 'Subsidiary', 'Joint venture', 'State enterprise']} />
            </Field>
            <Field label="Listing" optional>
              <Input placeholder="e.g. SET-listed 2017" />
            </Field>
          </div>
        </SubSection>

        {/* Industry */}
        <SubSection label="Industry classification" sub="ประเภทอุตสาหกรรม">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <Field label="Primary industry">
              <Select value={data.industry} onChange={v => update({ industry: v })}
                placeholder="Select…"
                options={[
                  'Satellite manufacturing',
                  'Earth observation services',
                  'Ground station equipment',
                  'Structural components',
                  'Optical payload',
                  'Launch services',
                  'Communications services',
                  'Data services & analytics',
                ]} />
            </Field>
            <Field label="ISIC code" optional hint="Defaults from industry choice">
              <Input value={data.isic} onChange={v => update({ isic: v.replace(/\D/g, '').slice(0, 5) })}
                placeholder="30300" mono />
            </Field>
          </div>
        </SubSection>

        {/* Address */}
        <SubSection label="Headquarters" sub="ที่ตั้งสำนักงานใหญ่">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City (Thai)">
              <Input value={data.hq_city_th} onChange={v => update({ hq_city_th: v })}
                placeholder="ปทุมธานี" />
            </Field>
            <Field label="City (English)">
              <Input value={data.hq_city_en} onChange={v => update({ hq_city_en: v })}
                placeholder="Pathum Thani" />
            </Field>
            <Field label="Address (Thai)" optional>
              <Textarea rows={2} value={data.address_th} onChange={v => update({ address_th: v })}
                placeholder="ที่อยู่ตามทะเบียน DBD" />
            </Field>
            <Field label="Address (English)" optional>
              <Textarea rows={2} value={data.address_en} onChange={v => update({ address_en: v })}
                placeholder="Romanized address" />
            </Field>
          </div>
        </SubSection>

        {/* Contact */}
        <SubSection label="Contact" sub="ช่องทางติดต่อ · ทั้งหมดเป็นทางเลือก">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Website" optional>
              <Input value={data.website} onChange={v => update({ website: v })}
                placeholder="company.co.th" />
            </Field>
            <Field label="Email" optional>
              <Input value={data.email} onChange={v => update({ email: v })}
                placeholder="contact@…" type="email" />
            </Field>
            <Field label="Phone" optional>
              <Input value={data.phone} onChange={v => update({ phone: v })}
                placeholder="+66 …" mono />
            </Field>
          </div>
        </SubSection>
      </div>

      <Divider />

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        <Button kind="ghost" onClick={onBack}>← Back</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button kind="secondary">Save as draft</Button>
          <Button kind="primary" disabled={!data.name_en || !data.name_th || !data.founded || !data.ownership}
            onClick={onContinue}>
            Continue to provenance →
          </Button>
        </div>
      </div>
    </Card>
  );
}

// =========================================================================
// STEP 3 — Provenance + commit
// =========================================================================
function Step3Provenance({ data, update, saving, done, onBack, onSubmit }) {
  return (
    <Card pad={28}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={stepHeading}>Where does this data come from?</h2>
        <p style={stepLede}>
          Every record carries its source. This appears on the firm's overview and is queryable —
          required by the governance principle.
        </p>
      </div>

      <SubSection label="Primary source" sub="แหล่งที่มาหลัก · required by Data Governance">
        <div style={{ display: 'grid', gap: 10 }}>
          {SOURCES.slice(0, 6).map(s => (
            <SourceRadioCard key={s.id} source={s}
              checked={data.source_id === s.id}
              onClick={() => update({ source_id: s.id })} />
          ))}
        </div>
      </SubSection>

      <Divider />

      <SubSection label="Confidence" sub="ระดับความเชื่อมั่นของข้อมูล · how was this data obtained?">
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { v: 'reported',  label: 'Reported',  sub: 'Direct from official source' },
            { v: 'estimated', label: 'Estimated', sub: 'Derived or interpolated' },
            { v: 'derived',   label: 'Derived',   sub: 'Inferred from related data' },
          ].map(c => (
            <button key={c.v} type="button" onClick={() => update({ confidence: c.v })}
              style={{
                flex: 1, padding: 14, borderRadius: 8,
                border: `1px solid ${data.confidence === c.v ? T.accent : T.line}`,
                background: data.confidence === c.v ? T.accentSoft : T.surface,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 120ms',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `2px solid ${data.confidence === c.v ? T.accent : T.lineStrong}`,
                  background: data.confidence === c.v ? T.accent : 'transparent',
                  display: 'grid', placeItems: 'center',
                }}>
                  {data.confidence === c.v && <span style={{ width: 5, height: 5, background: '#fff', borderRadius: '50%' }}></span>}
                </div>
                <span style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13, fontWeight: 600, color: T.ink }}>
                  {c.label}
                </span>
              </div>
              <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 11.5, color: T.muted, marginLeft: 22 }}>
                {c.sub}
              </div>
            </button>
          ))}
        </div>
      </SubSection>

      <Divider />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SubSection label="Reporting period">
          <Field hint="The fiscal year this data describes">
            <Select value={data.reporting_year} onChange={v => update({ reporting_year: v })}
              options={['2024', '2023', '2022', '2021', '2020']} />
          </Field>
        </SubSection>
        <SubSection label="Confidentiality">
          <Segmented value={data.confidentiality} onChange={v => update({ confidentiality: v })}
            options={[
              { value: 'public', label: 'Public' },
              { value: 'restricted', label: 'Restricted' },
              { value: 'confidential', label: 'Confidential' },
            ]} />
        </SubSection>
      </div>

      <Divider />

      {done ? (
        <div style={{
          padding: 20, background: T.okSoft, borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 14,
          animation: 'slideUp 200ms ease',
        }}>
          <span style={{ color: T.ok, fontSize: 22 }}>✓</span>
          <div>
            <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600, color: T.ink }}>
              Firm record created
            </div>
            <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted }}>
              Opening firm overview…
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <Button kind="ghost" onClick={onBack} disabled={saving}>← Back</Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button kind="secondary" disabled={saving}>Save as draft</Button>
            <Button kind="primary" disabled={!data.source_id || saving}
              onClick={onSubmit}>
              {saving ? (
                <>
                  <span style={{
                    width: 12, height: 12,
                    border: '2px solid #fff', borderTopColor: 'transparent',
                    borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}></span>
                  Validating on server…
                </>
              ) : (
                <>Create firm record <Kbd>⌘↵</Kbd></>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SourceRadioCard({ source, checked, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 12,
        alignItems: 'center', textAlign: 'left',
        padding: '10px 14px', borderRadius: 6,
        border: `1px solid ${checked ? T.accent : T.line}`,
        background: checked ? T.accentSoft : T.surface,
        cursor: 'pointer', transition: 'all 120ms',
      }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        border: `2px solid ${checked ? T.accent : T.lineStrong}`,
        background: checked ? T.accent : 'transparent',
        display: 'grid', placeItems: 'center',
      }}>
        {checked && <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }}></span>}
      </div>
      <div>
        <div style={{ fontFamily: 'Sarabun, sans-serif', fontSize: 13.5, color: T.ink, fontWeight: 500 }}>
          {source.name}
        </div>
        {source.url && (
          <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, color: T.muted, marginTop: 1 }}>
            {source.url}
          </div>
        )}
      </div>
      <Pill color={source.kind === 'government' ? T.accent : T.muted} size="sm">
        {source.kind}
      </Pill>
    </button>
  );
}

// =========================================================================
// RIGHT RAIL — live preview
// =========================================================================
function PreviewRail({ data, completeness, jidValidation, lookup }) {
  return (
    <div style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
      <div style={{
        fontFamily: 'Sarabun, sans-serif', fontSize: 10.5,
        color: T.muted2, letterSpacing: '0.1em',
        textTransform: 'uppercase', fontWeight: 600,
        marginBottom: 10, paddingLeft: 4,
      }}>Live preview</div>
      <Card pad={20}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <DomainPill domain="firm" />
          <Ring pct={completeness} size={36} thickness={4} />
        </div>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 16, fontWeight: 600,
          color: data.name_en ? T.ink : T.muted2,
          marginBottom: 2, lineHeight: 1.2,
        }}>
          {data.name_en || 'New firm record'}
        </div>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
          color: data.name_th ? T.muted : T.muted2,
          marginBottom: 14, lineHeight: 1.3,
        }}>
          {data.name_th || '(ชื่อภาษาไทย)'}
        </div>

        <PreviewRow k="Juristic ID" v={
          data.juristic ? (
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: '0.02em' }}>
              {data.juristic}
            </span>
          ) : '—'
        } />
        <PreviewRow k="Founded" v={data.founded || '—'} />
        <PreviewRow k="Ownership" v={data.ownership || '—'} />
        <PreviewRow k="Industry" v={data.industry ? <span style={{ fontSize: 12 }}>{data.industry}</span> : '—'} />
        <PreviewRow k="HQ" v={data.hq_city_en || '—'} />
        <PreviewRow k="Source" v={
          data.source_id
            ? <Pill color={T.accent} size="sm">{SOURCES.find(s => s.id === data.source_id)?.name.split(' ').slice(0, 2).join(' ')}</Pill>
            : '—'
        } />
        <PreviewRow k="Confidence" v={data.confidence ? <span style={{ textTransform: 'capitalize' }}>{data.confidence}</span> : '—'} last />
      </Card>

      {/* Status block */}
      <div style={{
        marginTop: 12, padding: 14,
        background: T.subtle, borderRadius: 8,
        fontFamily: 'Sarabun, sans-serif', fontSize: 12, color: T.muted,
        lineHeight: 1.5,
      }}>
        <div style={{ fontWeight: 600, color: T.ink2, marginBottom: 4, fontSize: 12.5 }}>
          What happens on save
        </div>
        Your draft is validated client-side, then re-validated on the application server.
        A record in <code style={{ background: T.surface, padding: '0 4px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>firm</code> table is created with seven empty domain shells, and an entry is appended to <code style={{ background: T.surface, padding: '0 4px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>audit_log</code>.
      </div>
    </div>
  );
}

function PreviewRow({ k, v, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '7px 0',
      borderBottom: last ? 'none' : `1px dotted ${T.line}`,
      fontFamily: 'Sarabun, sans-serif', fontSize: 12,
    }}>
      <span style={{ color: T.muted }}>{k}</span>
      <span style={{ color: T.ink2, textAlign: 'right', maxWidth: 200 }}>{v}</span>
    </div>
  );
}

// =========================================================================
// Shared styles + helpers
// =========================================================================
const stepHeading = {
  margin: 0, fontFamily: 'Sarabun, sans-serif',
  fontSize: 20, fontWeight: 600, color: T.ink,
  letterSpacing: '-0.01em', lineHeight: 1.2,
};
const stepLede = {
  margin: '6px 0 0', fontFamily: 'Sarabun, sans-serif',
  fontSize: 13.5, color: T.muted, lineHeight: 1.5,
  maxWidth: 580,
};
const statusRow = {
  display: 'flex', alignItems: 'center', gap: 8,
  fontFamily: 'Sarabun, sans-serif', fontSize: 12.5,
};

function Divider() {
  return <hr style={{ border: 'none', borderTop: `1px solid ${T.line}`, margin: '22px 0' }} />;
}

function SubSection({ label, sub, children }) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{
          fontFamily: 'Sarabun, sans-serif', fontSize: 12,
          color: T.ink2, fontWeight: 600,
          letterSpacing: '0.005em',
        }}>{label}</div>
        {sub && (
          <div style={{
            fontFamily: 'Sarabun, sans-serif', fontSize: 11.5,
            color: T.muted2, marginTop: 1,
          }}>{sub}</div>
        )}
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { NewFirmPage });
