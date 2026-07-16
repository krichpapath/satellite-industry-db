"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Cpu,
  Download,
  Globe,
  History,
  House,
  Leaf,
  Mail,
  MapPin,
  Network,
  Package,
  Pencil,
  ShieldCheck
} from "lucide-react";
import { getEntryFirmId, useDatabase, useRole } from "@/lib/store";
import { Card, SectionTitle, Grid, Stat, Badge, Button, EmptyState, Tabs } from "@/components/ui";
import { SubTableEditor } from "@/components/subtable-editor";
import { ComponentRecordsPanel, SystemPill } from "@/components/component-records";
import { normalizeSystem } from "@/lib/component-taxonomy";
import { createFirmXlsx } from "@/lib/db-xlsx";
import { provinceLabel } from "@/lib/schema";
import type {
  Firm,
  Database,
  DataSource,
  ProductService,
  TechCapability,
  InfrastructureFacility,
  HRProfile,
  SupplyChainLinkage,
  Collaboration,
  SustainabilityESG,
  FirmSizeFinance,
  AuditEntry
} from "@/lib/schema";

type TabKey = "overview" | "components" | "capabilities" | "network" | "sustainability";

function safeFilePart(value: string) {
  return value.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function websiteHref(website: string) {
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

const CHIP_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 500,
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "#fff"
};

const HERO_BUTTON_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  borderColor: "rgba(255,255,255,0.35)",
  boxShadow: "none"
};

export default function FirmProfilePage({ params }: { params: Promise<{ firmId: string }> }) {
  const { firmId } = use(params);
  const db = useDatabase();
  const role = useRole();
  const canManage = role === "Admin" || (role === "Analyst" && getEntryFirmId() === firmId);
  const firm = db.firms.find((f) => f.firm_id === firmId);
  const [tab, setTab] = useState<TabKey>("overview");
  const [exporting, setExporting] = useState(false);

  if (!firm) {
    return (
      <Card>
        <EmptyState message="Company not found." />
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link href="/companies">
            <Button variant="secondary">Back to companies</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const finance = db.size_finance.find((r) => r.firm_id === firmId);
  const allProducts = db.products.filter((r) => r.firm_id === firmId);
  const products = canManage ? allProducts : allProducts.filter((r) => (r.record_state ?? "public") === "public");
  const draftCount = allProducts.filter((r) => (r.record_state ?? "public") === "draft").length;
  const tech = db.tech.filter((r) => r.firm_id === firmId);
  const facilities = db.facilities.filter((r) => r.firm_id === firmId);
  const hrRows = db.hr.filter((r) => r.firm_id === firmId);
  const outLinks = db.linkages.filter((r) => r.firm_id === firmId);
  const inLinks = db.linkages.filter((r) => r.partner_firm_id === firmId);
  const collabs = db.collabs.filter((r) => r.firm_id === firmId);
  const esg = db.esg.filter((r) => r.firm_id === firmId);
  const source = db.sources.find((s) => s.source_id === firm.source_id);
  const firmAudit = db.audit.filter((a) => a.firm_id === firmId);

  const trlValues = [
    ...products.map((p) => p.product_trl).filter((v): v is number => typeof v === "number"),
    ...tech.map((t) => t.trl_level)
  ];
  const topTrl = trlValues.length > 0 ? Math.max(...trlValues) : null;
  const partnerFirms = new Set([...outLinks.map((l) => l.partner_firm_id), ...inLinks.map((l) => l.firm_id)]);

  function firmName(id: string) {
    return db.firms.find((f) => f.firm_id === id)?.firm_name ?? id;
  }
  const firmOptions = db.firms.filter((f) => f.firm_id !== firmId).map((f) => f.firm_id);

  async function exportWorkbook() {
    if (!firm) return;
    setExporting(true);
    try {
      const bytes = await createFirmXlsx(db, firmId);
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeFilePart(firm.firm_name || firm.firm_id)}-profile-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  // ponytail: data-driven tabs — capabilities/network/sustainability reappear once their tables have rows.
  const detailTabs = [
    { key: "overview", label: "Overview", icon: House },
    { key: "components", label: `Components (${products.length})`, hint: "Satellite component catalog", icon: Package },
    ...(tech.length + facilities.length + hrRows.length > 0
      ? [{ key: "capabilities", label: `Capabilities (${tech.length + facilities.length + hrRows.length})`, hint: "Technology, facilities, and workforce", icon: Cpu }]
      : []),
    ...(outLinks.length + inLinks.length + collabs.length > 0
      ? [{ key: "network", label: `Network (${outLinks.length + inLinks.length + collabs.length})`, hint: "Supply chain and collaborations", icon: Network }]
      : []),
    ...(esg.length > 0 ? [{ key: "sustainability", label: "Sustainability", hint: "ESG indicators", icon: Leaf }] : [])
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li>
            <Link href="/companies">Companies</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{firm.firm_name}</li>
        </ol>
      </nav>

      <header className="hero-band">
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
          <div style={{ minWidth: 260, flex: "1 1 320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 650, letterSpacing: -0.4 }}>{firm.firm_name}</h1>
              {canManage && (
                <span style={{ ...CHIP_STYLE, background: "rgba(74,222,128,0.16)", borderColor: "rgba(74,222,128,0.45)" }}>
                  <span className="pulse-dot" aria-hidden="true" />
                  You manage this company
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={CHIP_STYLE}>
                <Building2 size={13} aria-hidden="true" />
                {firm.ownership_type} ownership
              </span>
              <span style={CHIP_STYLE}>
                <MapPin size={13} aria-hidden="true" />
                {provinceLabel(firm.province)}
              </span>
              {firm.industrial_zone && <span style={CHIP_STYLE}>{firm.industrial_zone}</span>}
              <span style={CHIP_STYLE}>
                <CalendarDays size={13} aria-hidden="true" />
                Est. {firm.year_established}
              </span>
              {source && (
                <span style={CHIP_STYLE} title={source.url ?? undefined}>
                  <ShieldCheck size={13} aria-hidden="true" />
                  Source: {source.name}
                </span>
              )}
            </div>
            {firm.last_updated_ts && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 12 }}>
                Last updated {new Date(firm.last_updated_ts).toLocaleString()}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            {firm.website && (
              <a href={websiteHref(firm.website)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <Button variant="secondary" style={HERO_BUTTON_STYLE}>
                  <Globe size={15} aria-hidden="true" />
                  Website
                </Button>
              </a>
            )}
            {canManage && (
              <Button variant="secondary" style={HERO_BUTTON_STYLE} disabled={exporting} onClick={exportWorkbook}>
                <Download size={15} aria-hidden="true" />
                {exporting ? "Exporting…" : "Export .xlsx"}
              </Button>
            )}
            {canManage && (
              <Link href={`/companies/${firmId}/edit`} style={{ textDecoration: "none" }}>
                <Button variant="secondary" style={{ ...HERO_BUTTON_STYLE, background: "rgba(255,255,255,0.22)" }}>
                  <Pencil size={15} aria-hidden="true" />
                  Edit company
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <Grid cols={5} gap={14}>
        <Stat
          label="Components"
          value={products.length}
          hint={canManage && draftCount > 0 ? `${draftCount} draft${draftCount > 1 ? "s" : ""} included` : "Public records"}
        />
        <Stat label="Top TRL" value={topTrl ?? "—"} hint="Highest technology readiness" />
        <Stat label="Employees" value={finance ? finance.employees_total.toLocaleString() : "—"} hint={finance ? `${finance.engineers.toLocaleString()} engineers` : "No finance record"} />
        <Stat label="Revenue" value={finance ? finance.annual_revenue_mthb.toLocaleString() : "—"} hint={finance ? `MTHB / year · ${finance.export_percentage}% export` : "No finance record"} />
        <Stat label="Network" value={partnerFirms.size} hint={`Partner companies · ${collabs.length} collaboration${collabs.length === 1 ? "" : "s"}`} />
      </Grid>

      <Tabs active={tab} onChange={(k) => setTab(k as TabKey)} tabs={detailTabs} />

      {tab === "overview" && (
        <OverviewTab firm={firm} source={source} finance={finance} firmId={firmId} db={db} products={allProducts} canManage={canManage} audit={firmAudit} />
      )}
      {tab === "components" && (
        <Card>
          <SectionTitle
            hint={
              canManage
                ? `${products.length - draftCount} public and ${draftCount} draft record(s). Add, edit, or remove your company's components below.`
                : `${products.length} public component record(s).`
            }
          >
            Component Catalog
          </SectionTitle>
          <ComponentRecordsPanel rows={products} firmId={firmId} canManage={canManage} />
        </Card>
      )}
      {tab === "capabilities" && (
        <CapabilitiesTab tech={tech} facilities={facilities} hr={hrRows} firmId={firmId} db={db} canManage={canManage} />
      )}
      {tab === "network" && (
        <NetworkTab outLinks={outLinks} inLinks={inLinks} collabs={collabs} firmId={firmId} firmOptions={firmOptions} firmName={firmName} db={db} canManage={canManage} />
      )}
      {tab === "sustainability" && <ESGTab esg={esg} firmId={firmId} canManage={canManage} />}
    </div>
  );
}

function OverviewTab({
  firm,
  source,
  finance,
  firmId,
  db,
  products,
  canManage,
  audit
}: {
  firm: Firm;
  source: DataSource | undefined;
  finance: FirmSizeFinance | undefined;
  firmId: string;
  db: Database;
  products: ProductService[];
  canManage: boolean;
  audit: AuditEntry[];
}) {
  const systemCounts = new Map<string, number>();
  for (const p of products) {
    const system = normalizeSystem(p.system);
    systemCounts.set(system, (systemCounts.get(system) ?? 0) + 1);
  }

  const mySystems = new Set(systemCounts.keys());
  const related = db.firms
    .filter((f) => f.firm_id !== firmId)
    .map((f) => {
      const theirSystems = new Set(
        db.products
          .filter((p) => p.firm_id === f.firm_id && (p.record_state ?? "public") === "public")
          .map((p) => normalizeSystem(p.system))
      );
      const shared = [...theirSystems].filter((s) => mySystems.has(s));
      const sameProvince = f.province === firm.province && firm.province !== "Unidentified";
      return { firm: f, shared, sameProvince, score: shared.length * 2 + (sameProvince ? 1 : 0) };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <>
      <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", gap: 16, "--grid-cols": "2" } as React.CSSProperties}>
        <Card>
          <SectionTitle hint="Registered profile and contact details.">Company Profile</SectionTitle>
          <Grid cols={2} gap={14}>
            <KV label="Registration no." value={firm.registration_no || "—"} />
            <KV label="Industry code" value={firm.industry_code || "—"} />
            <KV label="Year established" value={firm.year_established} />
            <KV label="Ownership" value={firm.ownership_type} />
            <KV label="Parent company" value={firm.parent_company || "—"} />
            <KV label="Province" value={provinceLabel(firm.province)} />
            <KV label="Industrial zone" value={firm.industrial_zone || "—"} />
            <KV
              label="Website"
              value={
                firm.website ? (
                  <a href={websiteHref(firm.website)} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
                    {firm.website}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <KV
              label="Contact email"
              value={
                canManage ? (
                  firm.contact_email ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Mail size={13} aria-hidden="true" />
                      <a href={`mailto:${firm.contact_email}`} style={{ color: "var(--primary)" }}>{firm.contact_email}</a>
                    </span>
                  ) : (
                    "—"
                  )
                ) : (
                  <span style={{ color: "var(--muted)" }}>Private — visible to the company and admin</span>
                )
              }
            />
            <KV
              label="Data source"
              value={
                source ? (
                  source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>{source.name}</a>
                  ) : (
                    source.name
                  )
                ) : (
                  "—"
                )
              }
            />
          </Grid>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle hint="Satellite systems this company supplies components for.">System Coverage</SectionTitle>
            {systemCounts.size === 0 ? (
              <EmptyState message="No component records yet." />
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[...systemCounts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([system, count]) => (
                    <span key={system} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <SystemPill system={system} compact />
                      <Badge tone="accent">{count}</Badge>
                    </span>
                  ))}
              </div>
            )}
          </Card>

          {finance && (
            <Card>
              <SectionTitle hint="Size and finance snapshot.">Size & Finance</SectionTitle>
              <Grid cols={2} gap={14}>
                <KV label="Employees" value={finance.employees_total.toLocaleString()} />
                <KV label="Engineers" value={finance.engineers.toLocaleString()} />
                <KV label="Annual revenue" value={`${finance.annual_revenue_mthb.toLocaleString()} MTHB`} />
                <KV label="Export share" value={`${finance.export_percentage}%`} />
                <KV label="Capital investment" value={`${finance.capital_investment_mthb.toLocaleString()} MTHB`} />
                <KV label="Production capacity" value={finance.production_capacity || "—"} />
                <KV label="Gov. incentives" value={finance.gov_incentives || "—"} />
                <KV label="Funding access" value={finance.funding_access || "—"} />
              </Grid>
            </Card>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <Card>
          <SectionTitle hint="Companies with overlapping systems or in the same province.">Related Companies</SectionTitle>
          <Grid cols={3} gap={14}>
            {related.map(({ firm: f, shared, sameProvince }) => (
              <Link key={f.firm_id} href={`/companies/${f.firm_id}`} style={{ textDecoration: "none" }}>
                <div
                  className="hover-lift"
                  style={{ border: "1px solid var(--line)", borderRadius: 12, padding: 14, height: "100%", display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <strong style={{ color: "var(--ink)", fontSize: 14 }}>{f.firm_name}</strong>
                    <ArrowRight size={14} color="var(--muted)" aria-hidden="true" />
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{provinceLabel(f.province)}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {sameProvince && <Badge>Same province</Badge>}
                    {shared.slice(0, 2).map((s) => (
                      <Badge key={s} tone="accent">{s}</Badge>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </Grid>
        </Card>
      )}

      {canManage && (
        <Card>
          <SectionTitle hint="Latest edits to this company's records.">
            Recent Changes
          </SectionTitle>
          {audit.length === 0 ? (
            <EmptyState message="No recorded changes yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {audit.slice(0, 5).map((a) => (
                <div key={a.audit_id} style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid var(--line-soft)", flexWrap: "wrap" }}>
                  <History size={13} color="var(--muted)" aria-hidden="true" style={{ alignSelf: "center", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>{new Date(a.ts).toLocaleString()}</span>
                  <Badge tone={a.action === "delete" ? "danger" : a.action === "create" ? "success" : "neutral"}>{a.action}</Badge>
                  <span style={{ fontSize: 13, color: "var(--ink)" }}>{a.summary}</span>
                  {a.actor && <span style={{ fontSize: 12, color: "var(--muted)" }}>by {a.actor}</span>}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function CapabilitiesTab({
  tech,
  facilities,
  hr,
  firmId,
  db,
  canManage
}: {
  tech: TechCapability[];
  facilities: InfrastructureFacility[];
  hr: HRProfile[];
  firmId: string;
  db: Database;
  canManage: boolean;
}) {
  return (
    <>
      <Card>
        <SectionTitle hint="Core technologies, R&D effort, and patents.">Technology & Innovation</SectionTitle>
        <SubTableEditor<TechCapability>
          title="Technology capability"
          rows={tech}
          table="tech"
          firmId={firmId}
          idField="tech_id"
          idPrefix="T"
          canManage={canManage}
          fields={[
            { name: "core_technology", label: "Core technology", type: "enum", options: db.vocab.core_technologies, required: true },
            { name: "trl_level", label: "TRL (1-9)", type: "number", required: true, min: 1, max: 9 },
            { name: "rd_expenditure_mthb", label: "R&D expenditure (MTHB)", type: "number" },
            { name: "rd_personnel", label: "R&D personnel", type: "number" },
            { name: "patents_count", label: "Patents count", type: "number" },
            { name: "patent_field", label: "Patent field", type: "text" },
            { name: "digitalization_level", label: "Digitalization (0-5)", type: "number", min: 0, max: 5 }
          ]}
          display={[
            { key: "tech", header: "Core technology", render: (r) => r.core_technology },
            { key: "trl", header: "TRL", render: (r) => <Badge tone="accent">TRL {r.trl_level}</Badge> },
            { key: "rd", header: "R&D", render: (r) => `${r.rd_expenditure_mthb} MTHB · ${r.rd_personnel} staff` },
            { key: "pat", header: "Patents", render: (r) => `${r.patents_count}${r.patent_field ? ` · ${r.patent_field}` : ""}` },
            { key: "dig", header: "Digital", render: (r) => `${r.digitalization_level}/5` }
          ]}
        />
      </Card>

      <Card>
        <SectionTitle hint="Labs, simulation tools, and manufacturing processes.">Infrastructure & Facilities</SectionTitle>
        <SubTableEditor<InfrastructureFacility>
          title="Facility"
          rows={facilities}
          table="facilities"
          firmId={firmId}
          idField="facility_id"
          idPrefix="FA"
          canManage={canManage}
          fields={[
            { name: "testing_lab", label: "Testing lab", type: "bool" },
            { name: "simulation_tools", label: "Simulation tools", type: "bool" },
            { name: "manufacturing_process", label: "Manufacturing process", type: "text" },
            { name: "software_capability", label: "Software capability", type: "text" }
          ]}
          display={[
            { key: "lab", header: "Lab", render: (r) => (r.testing_lab ? "Yes" : "No") },
            { key: "sim", header: "Sim tools", render: (r) => (r.simulation_tools ? "Yes" : "No") },
            { key: "mfg", header: "Manufacturing", render: (r) => r.manufacturing_process ?? "—" },
            { key: "sw", header: "Software", render: (r) => r.software_capability ?? "—" }
          ]}
        />
      </Card>

      <Card>
        <SectionTitle hint="Workforce capacity, specialization, and skill gaps.">Human Resource & Skill</SectionTitle>
        <SubTableEditor<HRProfile>
          title="HR profile"
          rows={hr}
          table="hr"
          firmId={firmId}
          idField="hr_id"
          idPrefix="H"
          canManage={canManage}
          fields={[
            { name: "technician_count", label: "Technicians", type: "number" },
            { name: "skill_specialization", label: "Skill specialization", type: "text" },
            { name: "training_programs", label: "Training programs", type: "text" },
            { name: "skill_gap", label: "Skill gap", type: "text" }
          ]}
          display={[
            { key: "tech", header: "Technicians", render: (r) => r.technician_count },
            { key: "spec", header: "Specialization", render: (r) => r.skill_specialization },
            { key: "train", header: "Training", render: (r) => r.training_programs ?? "—" },
            { key: "gap", header: "Skill gap", render: (r) => r.skill_gap ?? "—" }
          ]}
        />
      </Card>
    </>
  );
}

function NetworkTab({
  outLinks,
  inLinks,
  collabs,
  firmId,
  firmOptions,
  firmName,
  db,
  canManage
}: {
  outLinks: SupplyChainLinkage[];
  inLinks: SupplyChainLinkage[];
  collabs: Collaboration[];
  firmId: string;
  firmOptions: string[];
  firmName: (id: string) => string;
  db: Database;
  canManage: boolean;
}) {
  return (
    <>
      <Card>
        <SectionTitle hint="Suppliers, buyers, and partner relationships.">Supply Chain Linkages</SectionTitle>
        <SubTableEditor<SupplyChainLinkage>
          title="Outgoing linkage"
          rows={outLinks}
          table="linkages"
          firmId={firmId}
          idField="linkage_id"
          idPrefix="L"
          canManage={canManage}
          fields={[
            { name: "partner_firm_id", label: "Partner company ID", type: "enum", options: firmOptions, required: true },
            { name: "linkage_type", label: "Linkage type", type: "enum", options: db.vocab.linkage_types, required: true },
            { name: "dependency_level", label: "Dependency (0-5)", type: "number", min: 0, max: 5 },
            { name: "domestic_or_import", label: "Origin", type: "enum", options: ["Domestic", "Import"] }
          ]}
          display={[
            {
              key: "partner",
              header: "Partner",
              render: (l) => (
                <Link href={`/companies/${l.partner_firm_id}`} style={{ color: "var(--primary)" }}>
                  {firmName(l.partner_firm_id)}
                </Link>
              )
            },
            { key: "type", header: "Type", render: (l) => <Badge>{l.linkage_type}</Badge> },
            { key: "dep", header: "Dep.", render: (l) => `${l.dependency_level}/5` },
            { key: "src", header: "Origin", render: (l) => l.domestic_or_import }
          ]}
        />
        {inLinks.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--line)" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
              Incoming references ({inLinks.length}) — edit on the originating company
            </div>
            {inLinks.map((l) => (
              <div key={l.linkage_id} style={{ fontSize: 13, padding: "4px 0" }}>
                <Badge>{l.linkage_type}</Badge>{" "}
                From <Link href={`/companies/${l.firm_id}`} style={{ color: "var(--primary)" }}>{firmName(l.firm_id)}</Link>{" "}
                · dep {l.dependency_level}/5
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint="University, PRI, and association collaborations.">Innovation Collaborations</SectionTitle>
        <SubTableEditor<Collaboration>
          title="Collaboration"
          rows={collabs}
          table="collabs"
          firmId={firmId}
          idField="collab_id"
          idPrefix="C"
          canManage={canManage}
          fields={[
            { name: "partner_type", label: "Partner type", type: "enum", options: db.vocab.partner_types, required: true },
            { name: "partner_name", label: "Partner name", type: "text", required: true },
            { name: "collaboration_type", label: "Collaboration type", type: "enum", options: db.vocab.collab_types, required: true },
            { name: "duration_years", label: "Duration (years)", type: "number" }
          ]}
          display={[
            { key: "type", header: "Type", render: (c) => <Badge tone="accent">{c.partner_type}</Badge> },
            { key: "name", header: "Partner", render: (c) => c.partner_name },
            { key: "scope", header: "Scope", render: (c) => c.collaboration_type },
            { key: "dur", header: "Years", render: (c) => c.duration_years }
          ]}
        />
      </Card>
    </>
  );
}

function ESGTab({ esg, firmId, canManage }: { esg: SustainabilityESG[]; firmId: string; canManage: boolean }) {
  return (
    <Card>
      <SectionTitle hint="Energy, emissions, and certification indicators.">Sustainability & ESG</SectionTitle>
      {esg.length > 0 && (
        <Grid cols={4} gap={12} style={{ marginBottom: 16 }}>
          <Stat label="Energy" value={`${esg[0].energy_consumption_mwh.toLocaleString()} MWh`} />
          <Stat label="Renewable" value={`${esg[0].renewable_energy_ratio}%`} />
          <Stat label="CO2" value={`${esg[0].carbon_emission_tco2.toLocaleString()} t`} />
          <Stat label="Waste mgmt" value={esg[0].waste_management_system ? "Yes" : "No"} hint={esg[0].esg_certification ?? "—"} />
        </Grid>
      )}
      <SubTableEditor<SustainabilityESG>
        title="ESG record"
        rows={esg}
        table="esg"
        firmId={firmId}
        idField="esg_id"
        idPrefix="E"
        canManage={canManage}
        fields={[
          { name: "energy_consumption_mwh", label: "Energy (MWh)", type: "number" },
          { name: "renewable_energy_ratio", label: "Renewable %", type: "number", min: 0, max: 100 },
          { name: "carbon_emission_tco2", label: "CO2 (tCO2e)", type: "number" },
          { name: "waste_management_system", label: "Waste mgmt", type: "bool" },
          { name: "esg_certification", label: "ESG certification", type: "text" }
        ]}
        display={[
          { key: "en", header: "Energy", render: (r) => `${r.energy_consumption_mwh} MWh` },
          { key: "rn", header: "Renewable", render: (r) => `${r.renewable_energy_ratio}%` },
          { key: "co2", header: "CO2", render: (r) => `${r.carbon_emission_tco2} t` },
          { key: "wst", header: "Waste mgmt", render: (r) => (r.waste_management_system ? "Yes" : "No") },
          { key: "cert", header: "Certification", render: (r) => r.esg_certification ?? "—" }
        ]}
      />
    </Card>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 4, overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}
