"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useDatabase } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Grid,
  Stat,
  Badge,
  StageBadge,
  Button,
  EmptyState,
  Tabs
} from "@/components/ui";
import { SubTableEditor } from "@/components/subtable-editor";
import type {
  ProductService,
  TechCapability,
  InfrastructureFacility,
  HRProfile,
  SupplyChainLinkage,
  Collaboration,
  SustainabilityESG,
  FirmSizeFinance
} from "@/lib/schema";
import { SIA_CATEGORIES, ITU_SERVICES, ORBIT_TYPES, FREQUENCY_BANDS } from "@/lib/schema";

type TabKey = "overview" | "products" | "tech" | "workforce" | "supply" | "esg";

export default function FirmProfilePage({ params }: { params: Promise<{ firmId: string }> }) {
  const { firmId } = use(params);
  const db = useDatabase();
  const firm = db.firms.find((f) => f.firm_id === firmId);
  const [tab, setTab] = useState<TabKey>("overview");

  if (!firm) {
    return (
      <Card>
        <EmptyState message="Firm not found." />
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link href="/firms">
            <Button variant="secondary">Back to firms</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const finance = db.size_finance.filter((r) => r.firm_id === firmId);
  const products = db.products.filter((r) => r.firm_id === firmId);
  const tech = db.tech.filter((r) => r.firm_id === firmId);
  const facilities = db.facilities.filter((r) => r.firm_id === firmId);
  const hrRows = db.hr.filter((r) => r.firm_id === firmId);
  const outLinks = db.linkages.filter((r) => r.firm_id === firmId);
  const inLinks = db.linkages.filter((r) => r.partner_firm_id === firmId);
  const collabs = db.collabs.filter((r) => r.firm_id === firmId);
  const esg = db.esg.filter((r) => r.firm_id === firmId);
  const source = db.sources.find((s) => s.source_id === firm.source_id);

  function firmName(id: string) {
    return db.firms.find((f) => f.firm_id === id)?.firm_name ?? id;
  }

  const firmOptions = db.firms.filter((f) => f.firm_id !== firmId).map((f) => f.firm_id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            <Link href="/firms" style={{ color: "var(--muted)" }}>
              ← Firms
            </Link>
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 600 }}>{firm.firm_name}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <Badge>{firm.ownership_type}</Badge>
            <Badge tone="neutral">{firm.industry_code}</Badge>
            <Badge tone="neutral">{firm.province}</Badge>
            {firm.industrial_zone && <Badge tone="accent">{firm.industrial_zone}</Badge>}
            {source && <Badge tone="success">src: {source.name}</Badge>}
          </div>
          {firm.last_updated_ts && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
              Last updated: {new Date(firm.last_updated_ts).toLocaleString()}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/firms/${firmId}/edit`}>
            <Button variant="secondary">Edit firm</Button>
          </Link>
        </div>
      </header>

      <Tabs
        active={tab}
        onChange={(k) => setTab(k as TabKey)}
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "products", label: `Products (${products.length})`, hint: "Industry-standard categorization" },
          { key: "tech", label: `Tech & Infrastructure (${tech.length})` },
          { key: "workforce", label: `Workforce (${hrRows.length})` },
          { key: "supply", label: `Supply Chain (${outLinks.length + inLinks.length})` },
          { key: "esg", label: `ESG (${esg.length})` }
        ]}
      />

      {tab === "overview" && (
        <OverviewTab
          firm={firm}
          source={source}
          finance={finance}
          firmId={firmId}
        />
      )}

      {tab === "products" && (
        <ProductsTab products={products} firmId={firmId} db={db} />
      )}

      {tab === "tech" && (
        <TechTab tech={tech} facilities={facilities} firmId={firmId} db={db} />
      )}

      {tab === "workforce" && (
        <WorkforceTab hr={hrRows} firmId={firmId} />
      )}

      {tab === "supply" && (
        <SupplyTab
          outLinks={outLinks}
          inLinks={inLinks}
          collabs={collabs}
          firmId={firmId}
          firmOptions={firmOptions}
          firmName={firmName}
          db={db}
        />
      )}

      {tab === "esg" && (
        <ESGTab esg={esg} firmId={firmId} />
      )}
    </div>
  );
}

function OverviewTab({
  firm,
  source,
  finance,
  firmId
}: {
  firm: import("@/lib/schema").Firm;
  source: import("@/lib/schema").DataSource | undefined;
  finance: FirmSizeFinance[];
  firmId: string;
}) {
  return (
    <>
      <Card>
        <SectionTitle hint="Identity — paper §3.1 Firm-Level Information.">
          1. Basic Company Profile
        </SectionTitle>
        <Grid cols={3} gap={14}>
          <KV label="Firm ID" value={<code>{firm.firm_id}</code>} />
          <KV label="Registration number" value={firm.registration_no || "—"} />
          <KV label="Year established" value={firm.year_established} />
          <KV label="Parent company" value={firm.parent_company || "—"} />
          <KV label="Website" value={firm.website || "—"} />
          <KV label="Contact email" value={firm.contact_email || "—"} />
          <KV label="Data source" value={source ? source.name : firm.source_id || "—"} />
          <KV label="Last updated" value={firm.last_updated_ts ? new Date(firm.last_updated_ts).toLocaleDateString() : "—"} />
        </Grid>
      </Card>

      <Card>
        <SectionTitle hint="Workforce, revenue, capacity, investment, incentives — paper §3.1.B + §3.6.">
          2. Size, Capacity & Investment
        </SectionTitle>
        <SubTableEditor<FirmSizeFinance>
          title="Financial & capacity record"
          rows={finance}
          table="size_finance"
          firmId={firmId}
          idField="firm_id"
          idPrefix=""
          fields={[
            { name: "employees_total", label: "Employees total", type: "number", required: true },
            { name: "engineers", label: "Engineers", type: "number" },
            { name: "annual_revenue_mthb", label: "Revenue (M฿)", type: "number" },
            { name: "export_percentage", label: "Export %", type: "number" },
            { name: "production_capacity", label: "Production capacity", type: "text" },
            { name: "capital_investment_mthb", label: "CAPEX (M฿)", type: "number" },
            { name: "gov_incentives", label: "Gov incentives", type: "text" },
            { name: "funding_access", label: "Funding access", type: "text" },
            { name: "offset_agreement", label: "Offset agreement", type: "text" }
          ]}
          display={[
            { key: "emp", header: "Employees", render: (r) => `${r.employees_total} (${r.engineers} eng)` },
            { key: "rev", header: "Revenue", render: (r) => `${r.annual_revenue_mthb} M฿` },
            { key: "exp", header: "Export %", render: (r) => `${r.export_percentage}%` },
            { key: "cap", header: "CAPEX", render: (r) => `${r.capital_investment_mthb} M฿` },
            { key: "inc", header: "Incentives", render: (r) => r.gov_incentives ?? "—" },
            { key: "fund", header: "Funding", render: (r) => r.funding_access ?? "—" }
          ]}
          emptyLabel="No financial record. Add one to populate."
        />
      </Card>
    </>
  );
}

function ProductsTab({ products, firmId, db }: { products: ProductService[]; firmId: string; db: import("@/lib/schema").Database }) {
  const grouped: Record<string, ProductService[]> = {};
  for (const p of products) {
    const key = p.sia_category ?? "Uncategorized";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  return (
    <>
      <Card>
        <SectionTitle hint="Categorization references: SIA (Satellite Industry Association) 4 segments · OECD value chain · ITU radio services · orbit class · ITU-R frequency bands · NAICS 2022 · WCO HS 2022. Each product gets the full standard fingerprint.">
          Industry-Standard Categorization
        </SectionTitle>
        <Grid cols={2} gap={14}>
          <StandardCard
            title="SIA Categories (Satellite Industry Association)"
            hint="Top-level segmentation used in annual State of the Satellite Industry Report."
            items={[
              ["Satellite Manufacturing", "Bus, payload, components, assembly, integration & test (AIT)"],
              ["Launch Services", "Launch vehicles, launch operations, ride-share, suborbital"],
              ["Satellite Services", "Capacity lease (FSS/MSS/BSS), EO services, data analytics, NTN"],
              ["Ground Equipment", "Antennas, modems, gateways, terminals, GNSS receivers"]
            ]}
          />
          <StandardCard
            title="ITU Radio Services"
            hint="ITU Radio Regulations service classifications used in spectrum filings."
            items={[
              ["FSS", "Fixed-Satellite Service — broadband, trunking"],
              ["MSS", "Mobile-Satellite Service — vehicular, IoT, NB-IoT NTN"],
              ["BSS", "Broadcasting-Satellite Service — DTH TV/radio"],
              ["EESS", "Earth Exploration-Satellite Service — remote sensing"],
              ["RDSS", "Radio-Determination Satellite Service — GNSS"],
              ["SRS", "Space Research Service"]
            ]}
          />
          <StandardCard
            title="Orbit Class"
            hint="Used in licensing, frequency coordination, and risk assessment."
            items={[
              ["LEO", "Low Earth Orbit (≤2,000 km)"],
              ["MEO", "Medium Earth Orbit (2,000–35,786 km)"],
              ["GEO", "Geostationary (~35,786 km)"],
              ["HEO", "Highly Elliptical Orbit"],
              ["Sub-orbital", "Below LEO, used for technology demo / microgravity"]
            ]}
          />
          <StandardCard
            title="ITU-R Frequency Bands"
            hint="Letter designators per ITU-R V.431."
            items={[
              ["L", "1–2 GHz — GNSS, MSS"],
              ["S", "2–4 GHz — TT&C, MSS"],
              ["C", "4–8 GHz — FSS"],
              ["X", "8–12 GHz — military, EO downlink"],
              ["Ku", "12–18 GHz — FSS, BSS"],
              ["Ka", "26.5–40 GHz — broadband HTS"],
              ["V/Q", "40–75 GHz — feeder, future HTS"]
            ]}
          />
        </Grid>
        <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          Cross-references:{" "}
          <strong>NAICS 2022</strong>: 336414 (Spacecraft mfg), 334220 (Comms equipment), 517410 (Satellite telecom), 541715 (R&D physical sciences).{" "}
          <strong>HS 2022</strong>: 8802.60 (Spacecraft), 8803.90 (Spacecraft parts), 8525.60 (Satcom transmit), 8526.91 (GNSS), 8517.62 (Comms apparatus).{" "}
          <strong>ISIC Rev 4</strong>: 3030 (Air & spacecraft mfg), 6130 (Satellite telecom).
        </div>
      </Card>

      <Card>
        <SectionTitle hint={`${products.length} product(s) registered. Edit via row actions (Analyst+ role).`}>
          Product / Service Records
        </SectionTitle>
        <SubTableEditor<ProductService>
          title="Products / Services"
          rows={products}
          table="products"
          firmId={firmId}
          idField="product_id"
          idPrefix="P"
          fields={[
            { name: "product_name", label: "Product name", type: "text", required: true },
            { name: "description", label: "Description", type: "text" },
            { name: "value_chain_stage", label: "OECD value chain stage", type: "enum", options: db.vocab.value_chain_stages, required: true },
            { name: "sia_category", label: "SIA category", type: "enum", options: db.vocab.sia_categories, required: true },
            { name: "itu_service_class", label: "ITU service", type: "enum", options: db.vocab.itu_services },
            { name: "orbit_type", label: "Orbit class", type: "enum", options: db.vocab.orbit_types },
            { name: "frequency_band", label: "Frequency band", type: "enum", options: db.vocab.frequency_bands },
            { name: "naics_code", label: "NAICS 2022", type: "enum", options: db.vocab.naics_codes },
            { name: "hs_code", label: "HS 2022", type: "enum", options: db.vocab.hs_codes },
            { name: "technology_intensity", label: "Tech intensity (OECD)", type: "enum", options: db.vocab.tech_intensities, required: true },
            { name: "product_trl", label: "Product TRL (1–9)", type: "number" },
            { name: "main_market", label: "Main market", type: "text" },
            { name: "certification", label: "Certification", type: "text" }
          ]}
          display={[
            {
              key: "name",
              header: "Product",
              render: (p) => (
                <div>
                  <div style={{ fontWeight: 500 }}>{p.product_name}</div>
                  {p.description && (
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, maxWidth: 280 }}>{p.description}</div>
                  )}
                </div>
              )
            },
            { key: "stage", header: "Value chain", render: (p) => <StageBadge stage={p.value_chain_stage} /> },
            { key: "sia", header: "SIA", render: (p) => p.sia_category ? <Badge tone="accent">{shortSIA(p.sia_category)}</Badge> : "—" },
            { key: "itu", header: "ITU", render: (p) => p.itu_service_class && p.itu_service_class !== "N/A" ? <Badge>{p.itu_service_class}</Badge> : "—" },
            { key: "orb", header: "Orbit", render: (p) => p.orbit_type && p.orbit_type !== "N/A" ? <Badge>{p.orbit_type}</Badge> : "—" },
            { key: "freq", header: "Band", render: (p) => p.frequency_band && p.frequency_band !== "N/A" ? <Badge>{p.frequency_band}</Badge> : "—" },
            {
              key: "ti",
              header: "Intensity",
              render: (p) => (
                <Badge tone={p.technology_intensity === "High" ? "accent" : "neutral"}>{p.technology_intensity}</Badge>
              )
            },
            { key: "trl", header: "TRL", render: (p) => p.product_trl ? <Badge tone="accent">TRL {p.product_trl}</Badge> : "—" },
            { key: "naics", header: "NAICS", render: (p) => p.naics_code ? <code style={{ fontSize: 11 }}>{p.naics_code}</code> : "—" },
            { key: "hs", header: "HS", render: (p) => p.hs_code && p.hs_code !== "—" ? <code style={{ fontSize: 11 }}>{p.hs_code}</code> : "—" },
            { key: "mk", header: "Market", render: (p) => p.main_market },
            { key: "cert", header: "Cert.", render: (p) => p.certification ?? "—" }
          ]}
        />
      </Card>

      {Object.keys(grouped).length > 0 && (
        <Card>
          <SectionTitle hint="Products grouped by SIA category — the canonical industry segmentation.">
            Portfolio Composition by SIA Category
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {SIA_CATEGORIES.concat(["Uncategorized" as never]).map((cat) => {
              const rows = grouped[cat];
              if (!rows || rows.length === 0) return null;
              return (
                <div key={cat} style={{ padding: 12, background: "var(--surface-muted)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: 14 }}>{cat}</strong>
                    <Badge tone="accent">{rows.length} product{rows.length > 1 ? "s" : ""}</Badge>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {rows.map((p) => (
                      <div key={p.product_id} style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                        <code style={{ fontSize: 11, color: "var(--muted)" }}>{p.product_id}</code>
                        <span>{p.product_name}</span>
                        <span style={{ marginLeft: "auto", display: "inline-flex", gap: 4 }}>
                          {p.itu_service_class && p.itu_service_class !== "N/A" && <Badge>{p.itu_service_class}</Badge>}
                          {p.orbit_type && p.orbit_type !== "N/A" && <Badge>{p.orbit_type}</Badge>}
                          {p.frequency_band && p.frequency_band !== "N/A" && <Badge>{p.frequency_band}</Badge>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}

function StandardCard({ title, hint, items }: { title: string; hint: string; items: [string, string][] }) {
  return (
    <div style={{ padding: 14, background: "var(--surface-muted)", borderRadius: 10 }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{hint}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map(([k, v]) => (
          <div key={k} style={{ fontSize: 12, display: "flex", gap: 8 }}>
            <Badge tone="accent">{k}</Badge>
            <span style={{ color: "var(--ink-soft)" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function shortSIA(c: string): string {
  if (c === "Satellite Manufacturing") return "Mfg";
  if (c === "Launch Services") return "Launch";
  if (c === "Satellite Services") return "Services";
  if (c === "Ground Equipment") return "Ground";
  return c;
}

function TechTab({
  tech,
  facilities,
  firmId,
  db
}: {
  tech: TechCapability[];
  facilities: InfrastructureFacility[];
  firmId: string;
  db: import("@/lib/schema").Database;
}) {
  return (
    <>
      <Card>
        <SectionTitle hint="Technology capability + patent field — paper §3.3 + draft.">
          Technology & Innovation
        </SectionTitle>
        <SubTableEditor<TechCapability>
          title="Technology capability"
          rows={tech}
          table="tech"
          firmId={firmId}
          idField="tech_id"
          idPrefix="T"
          fields={[
            { name: "core_technology", label: "Core technology", type: "enum", options: db.vocab.core_technologies, required: true },
            { name: "trl_level", label: "TRL (1–9)", type: "number", required: true },
            { name: "rd_expenditure_mthb", label: "R&D expenditure (M฿)", type: "number" },
            { name: "rd_personnel", label: "R&D personnel", type: "number" },
            { name: "patents_count", label: "Patents count", type: "number" },
            { name: "patent_field", label: "Patent field", type: "text" },
            { name: "digitalization_level", label: "Digitalization (1–5)", type: "number" }
          ]}
          display={[
            { key: "tech", header: "Core technology", render: (r) => r.core_technology },
            { key: "trl", header: "TRL", render: (r) => <Badge tone="accent">TRL {r.trl_level}</Badge> },
            { key: "rd", header: "R&D", render: (r) => `${r.rd_expenditure_mthb} M฿ · ${r.rd_personnel} staff` },
            { key: "pat", header: "Patents", render: (r) => `${r.patents_count}${r.patent_field ? ` · ${r.patent_field}` : ""}` },
            { key: "dig", header: "Digital", render: (r) => `${r.digitalization_level}/5` }
          ]}
        />
      </Card>

      <Card>
        <SectionTitle hint="Lab, simulation, manufacturing process — paper §3.3 Infrastructure.">
          Infrastructure & Facilities
        </SectionTitle>
        <SubTableEditor<InfrastructureFacility>
          title="Facilities"
          rows={facilities}
          table="facilities"
          firmId={firmId}
          idField="facility_id"
          idPrefix="FA"
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
    </>
  );
}

function WorkforceTab({ hr, firmId }: { hr: HRProfile[]; firmId: string }) {
  return (
    <Card>
      <SectionTitle hint="Workforce capacity and skill — paper §3.4.">Human Resource & Skill</SectionTitle>
      <SubTableEditor<HRProfile>
        title="HR profile"
        rows={hr}
        table="hr"
        firmId={firmId}
        idField="hr_id"
        idPrefix="H"
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
  );
}

function SupplyTab({
  outLinks,
  inLinks,
  collabs,
  firmId,
  firmOptions,
  firmName,
  db
}: {
  outLinks: SupplyChainLinkage[];
  inLinks: SupplyChainLinkage[];
  collabs: Collaboration[];
  firmId: string;
  firmOptions: string[];
  firmName: (id: string) => string;
  db: import("@/lib/schema").Database;
}) {
  return (
    <>
      <Card>
        <SectionTitle hint="Suppliers, buyers, partners — paper §3.5.">Supply Chain Linkages</SectionTitle>
        <SubTableEditor<SupplyChainLinkage>
          title="Outgoing linkages"
          rows={outLinks}
          table="linkages"
          firmId={firmId}
          idField="linkage_id"
          idPrefix="L"
          fields={[
            { name: "partner_firm_id", label: "Partner firm ID", type: "enum", options: firmOptions, required: true },
            { name: "linkage_type", label: "Linkage type", type: "enum", options: db.vocab.linkage_types, required: true },
            { name: "dependency_level", label: "Dependency (1–5)", type: "number" },
            { name: "domestic_or_import", label: "Origin", type: "enum", options: ["Domestic", "Import"] }
          ]}
          display={[
            {
              key: "partner",
              header: "Partner",
              render: (l) => (
                <Link href={`/firms/${l.partner_firm_id}`} style={{ color: "var(--primary)" }}>
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
              Incoming references ({inLinks.length}) — edit on the originating firm
            </div>
            {inLinks.map((l) => (
              <div key={l.linkage_id} style={{ fontSize: 13, padding: "4px 0" }}>
                <Badge>{l.linkage_type}</Badge>{" "}
                ← <Link href={`/firms/${l.firm_id}`} style={{ color: "var(--primary)" }}>{firmName(l.firm_id)}</Link>{" "}
                · dep {l.dependency_level}/5
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint="University / PRI / association collaborations.">Innovation Collaborations</SectionTitle>
        <SubTableEditor<Collaboration>
          title="Collaborations"
          rows={collabs}
          table="collabs"
          firmId={firmId}
          idField="collab_id"
          idPrefix="C"
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

function ESGTab({ esg, firmId }: { esg: SustainabilityESG[]; firmId: string }) {
  return (
    <Card>
      <SectionTitle hint="Sustainability & environmental indicators — paper §3.7.">Sustainability & ESG</SectionTitle>
      <SubTableEditor<SustainabilityESG>
        title="ESG record"
        rows={esg}
        table="esg"
        firmId={firmId}
        idField="esg_id"
        idPrefix="E"
        fields={[
          { name: "energy_consumption_mwh", label: "Energy (MWh)", type: "number" },
          { name: "renewable_energy_ratio", label: "Renewable %", type: "number" },
          { name: "carbon_emission_tco2", label: "CO₂ (tCO₂e)", type: "number" },
          { name: "waste_management_system", label: "Waste mgmt", type: "bool" },
          { name: "esg_certification", label: "ESG certification", type: "text" }
        ]}
        display={[
          { key: "en", header: "Energy", render: (r) => `${r.energy_consumption_mwh} MWh` },
          { key: "rn", header: "Renewable", render: (r) => `${r.renewable_energy_ratio}%` },
          { key: "co2", header: "CO₂", render: (r) => `${r.carbon_emission_tco2} t` },
          { key: "wst", header: "Waste mgmt", render: (r) => (r.waste_management_system ? "Yes" : "No") },
          { key: "cert", header: "Certification", render: (r) => r.esg_certification ?? "—" }
        ]}
      />
      {esg.length > 0 && (
        <Grid cols={4} gap={12} style={{ marginTop: 16 }}>
          <Stat label="Energy" value={`${esg[0].energy_consumption_mwh} MWh`} />
          <Stat label="Renewable" value={`${esg[0].renewable_energy_ratio}%`} />
          <Stat label="CO₂" value={`${esg[0].carbon_emission_tco2} tCO₂e`} />
          <Stat label="Waste mgmt" value={esg[0].waste_management_system ? "Yes" : "No"} hint={esg[0].esg_certification ?? "—"} />
        </Grid>
      )}
    </Card>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 4 }}>{value}</div>
    </div>
  );
}
