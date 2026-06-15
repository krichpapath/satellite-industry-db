"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Cpu, Download, FileSpreadsheet, House, Leaf, Network, Package, Users } from "lucide-react";
import { useDatabase } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Grid,
  Stat,
  Badge,
  Button,
  EmptyState,
  Modal,
  Tabs
} from "@/components/ui";
import { SubTableEditor } from "@/components/subtable-editor";
import { ComponentRecordsPanel } from "@/components/component-records";
import { richTextToPlainText } from "@/lib/rich-text";
import type {
  Firm,
  ProductService,
  TechCapability,
  InfrastructureFacility,
  HRProfile,
  SupplyChainLinkage,
  Collaboration,
  SustainabilityESG,
  FirmSizeFinance
} from "@/lib/schema";

type TabKey = "overview" | "products" | "tech" | "workforce" | "supply" | "esg";
type ExportCell = string | number | boolean | null | undefined;
type ExportColumn<T> = {
  label: string;
  value: (firm: Firm, row: T) => ExportCell;
  preview?: boolean;
};

type FirmProfileExportRow = Firm & { source_name?: string };
type LinkageExportRow = SupplyChainLinkage & {
  direction: "Outgoing" | "Incoming";
  source_firm_name: string;
  partner_firm_name: string;
};

const FIRM_PROFILE_EXPORT_COLUMNS: ExportColumn<FirmProfileExportRow>[] = [
  { label: "Company Name", value: (_firm, row) => row.firm_name },
  { label: "Year Established", value: (_firm, row) => row.year_established },
  { label: "Ownership", value: (_firm, row) => row.ownership_type },
  { label: "Parent Company", value: (_firm, row) => row.parent_company },
  { label: "Province", value: (_firm, row) => row.province },
  { label: "Industrial Zone", value: (_firm, row) => row.industrial_zone },
  { label: "Website", value: (_firm, row) => row.website },
  { label: "Contact Email", value: (_firm, row) => row.contact_email }
];

const FINANCE_EXPORT_COLUMNS: ExportColumn<FirmSizeFinance>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "Employees Total", value: (_firm, row) => row.employees_total },
  { label: "Engineers", value: (_firm, row) => row.engineers },
  { label: "Annual Revenue MTHB", value: (_firm, row) => row.annual_revenue_mthb },
  { label: "Export Percentage", value: (_firm, row) => row.export_percentage },
  { label: "Production Capacity", value: (_firm, row) => row.production_capacity },
  { label: "Capital Investment MTHB", value: (_firm, row) => row.capital_investment_mthb },
  { label: "Government Incentives", value: (_firm, row) => row.gov_incentives },
  { label: "Funding Access", value: (_firm, row) => row.funding_access },
  { label: "Offset Agreement", value: (_firm, row) => row.offset_agreement }
];

const PRODUCT_EXPORT_COLUMNS: ExportColumn<ProductService>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "Component ID", value: (_firm, product) => product.product_id },
  { label: "Product Name", value: (_firm, product) => product.product_name },
  { label: "System", value: (_firm, product) => product.system },
  { label: "Module", value: (_firm, product) => product.module },
  { label: "Component", value: (_firm, product) => product.component_name },
  { label: "Description", value: (_firm, product) => richTextToPlainText(product.description) }
];

const TECH_EXPORT_COLUMNS: ExportColumn<TechCapability>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "Technology ID", value: (_firm, row) => row.tech_id },
  { label: "Core Technology", value: (_firm, row) => row.core_technology },
  { label: "TRL Level", value: (_firm, row) => row.trl_level },
  { label: "R&D Expenditure MTHB", value: (_firm, row) => row.rd_expenditure_mthb },
  { label: "R&D Personnel", value: (_firm, row) => row.rd_personnel },
  { label: "Patents Count", value: (_firm, row) => row.patents_count },
  { label: "Patent Field", value: (_firm, row) => row.patent_field },
  { label: "Digitalization Level", value: (_firm, row) => row.digitalization_level }
];

const FACILITY_EXPORT_COLUMNS: ExportColumn<InfrastructureFacility>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "Facility ID", value: (_firm, row) => row.facility_id },
  { label: "Testing Lab", value: (_firm, row) => row.testing_lab },
  { label: "Simulation Tools", value: (_firm, row) => row.simulation_tools },
  { label: "Manufacturing Process", value: (_firm, row) => row.manufacturing_process },
  { label: "Software Capability", value: (_firm, row) => row.software_capability }
];

const HR_EXPORT_COLUMNS: ExportColumn<HRProfile>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "HR ID", value: (_firm, row) => row.hr_id },
  { label: "Technician Count", value: (_firm, row) => row.technician_count },
  { label: "Skill Specialization", value: (_firm, row) => row.skill_specialization },
  { label: "Training Programs", value: (_firm, row) => row.training_programs },
  { label: "Skill Gap", value: (_firm, row) => row.skill_gap }
];

const LINKAGE_EXPORT_COLUMNS: ExportColumn<LinkageExportRow>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "Direction", value: (_firm, row) => row.direction },
  { label: "Linkage ID", value: (_firm, row) => row.linkage_id },
  { label: "Source Company ID", value: (_firm, row) => row.firm_id },
  { label: "Source Company Name", value: (_firm, row) => row.source_firm_name },
  { label: "Partner Company ID", value: (_firm, row) => row.partner_firm_id },
  { label: "Partner Company Name", value: (_firm, row) => row.partner_firm_name },
  { label: "Linkage Type", value: (_firm, row) => row.linkage_type },
  { label: "Dependency Level", value: (_firm, row) => row.dependency_level },
  { label: "Domestic Or Import", value: (_firm, row) => row.domestic_or_import }
];

const COLLAB_EXPORT_COLUMNS: ExportColumn<Collaboration>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "Collaboration ID", value: (_firm, row) => row.collab_id },
  { label: "Partner Type", value: (_firm, row) => row.partner_type },
  { label: "Partner Name", value: (_firm, row) => row.partner_name },
  { label: "Collaboration Type", value: (_firm, row) => row.collaboration_type },
  { label: "Duration Years", value: (_firm, row) => row.duration_years }
];

const ESG_EXPORT_COLUMNS: ExportColumn<SustainabilityESG>[] = [
  { label: "Company ID", value: (firm) => firm.firm_id },
  { label: "Company Name", value: (firm) => firm.firm_name },
  { label: "ESG ID", value: (_firm, row) => row.esg_id },
  { label: "Energy Consumption MWH", value: (_firm, row) => row.energy_consumption_mwh },
  { label: "Renewable Energy Ratio", value: (_firm, row) => row.renewable_energy_ratio },
  { label: "Carbon Emission TCO2", value: (_firm, row) => row.carbon_emission_tco2 },
  { label: "Waste Management System", value: (_firm, row) => row.waste_management_system },
  { label: "ESG Certification", value: (_firm, row) => row.esg_certification }
];

function escapeExcelCell(value: ExportCell) {
  const text = value === null || value === undefined ? "" : String(value);
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return safeText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firmDatasetWorkbookHtml<T>(firm: Firm, rows: T[], columns: ExportColumn<T>[]) {
  const header = columns.map(
    (column) => `<th style="background:#eef2f7;font-weight:700;border:1px solid #cbd5e1;padding:6px;">${escapeExcelCell(column.label)}</th>`
  ).join("");

  const body = rows.map((row) => {
    const cells = columns.map(
      (column) => `<td style="mso-number-format:'\\@';border:1px solid #cbd5e1;padding:6px;">${escapeExcelCell(column.value(firm, row))}</td>`
    ).join("");
    return `<tr>${cells}</tr>`;
  }).join("");

  return `\uFEFF<html><head><meta charset="utf-8" /></head><body><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

function safeFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function formatExportValue(value: ExportCell) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function downloadFirmDatasetExcel<T>(firm: Firm, fileSlug: string, rows: T[], columns: ExportColumn<T>[]) {
  const blob = new Blob([firmDatasetWorkbookHtml(firm, rows, columns)], {
    type: "application/vnd.ms-excel;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFilePart(firm.firm_name || firm.firm_id)}-${fileSlug}-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function FirmDatasetExportButton<T>({
  firm,
  datasetLabel,
  fileSlug,
  rows,
  columns,
  buttonLabel
}: {
  firm: Firm;
  datasetLabel: string;
  fileSlug: string;
  rows: T[];
  columns: ExportColumn<T>[];
  buttonLabel: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        disabled={rows.length === 0}
        onClick={() => setOpen(true)}
        title={rows.length === 0 ? `No ${datasetLabel.toLowerCase()} rows to export` : `Review ${datasetLabel.toLowerCase()} export`}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40 }}
      >
        <Download size={15} />
        {buttonLabel}
      </Button>
      <FirmDatasetExportModal
        open={open}
        firm={firm}
        datasetLabel={datasetLabel}
        fileSlug={fileSlug}
        rows={rows}
        columns={columns}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function FirmDatasetExportModal<T>({
  open,
  firm,
  datasetLabel,
  fileSlug,
  rows,
  columns,
  onClose
}: {
  open: boolean;
  firm: Firm;
  datasetLabel: string;
  fileSlug: string;
  rows: T[];
  columns: ExportColumn<T>[];
  onClose: () => void;
}) {
  const metadataLabels = new Set(["Company ID", "Company Name", "Ownership", "Province"]);
  const explicitPreviewColumns = columns.filter((column) => column.preview);
  const previewColumns = (
    explicitPreviewColumns.length > 0
      ? explicitPreviewColumns
      : columns.filter((column) => column.preview !== false && !metadataLabels.has(column.label))
  ).slice(0, 7);

  return (
    <Modal
      open={open}
      title={`Review ${datasetLabel} Export`}
      onClose={onClose}
      maxWidth={980}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={rows.length === 0}
            onClick={() => {
              downloadFirmDatasetExcel(firm, fileSlug, rows, columns);
              onClose();
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Download size={15} />
            Download Excel
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--muted)" }}>
              <FileSpreadsheet size={15} />
              Dataset
            </div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{datasetLabel}</div>
          </div>
          <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Company</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{firm.firm_name}</div>
          </div>
          <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Rows</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>{rows.length}</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          This preview contains only {datasetLabel.toLowerCase()} rows for{" "}
          <strong style={{ color: "var(--ink)" }}>{firm.firm_name}</strong>. Download creates an Excel-readable file.
        </div>

        <div
          className="export-preview-table"
          aria-label={`${datasetLabel} export preview`}
          style={{
            border: "1px solid var(--line)",
            borderRadius: 10,
            overflow: "auto",
            maxHeight: 360
          }}
        >
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--surface-muted)", borderBottom: "1px solid var(--line)" }}>
                {previewColumns.map((column) => (
                  <th
                    key={column.label}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--ink-soft)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                  {previewColumns.map((column) => (
                    <td key={column.label} style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      {formatExportValue(column.value(firm, row))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="export-preview-cards" aria-label={`${datasetLabel} export preview cards`}>
          {rows.map((row, rowIndex) => (
            <article key={rowIndex} className="mobile-record-card">
              <div className="mobile-record-card__primary">Row {rowIndex + 1}</div>
              <dl className="mobile-record-card__details">
                {previewColumns.map((column) => (
                  <div key={column.label} className="mobile-record-card__field">
                    <dt>{column.label}</dt>
                    <dd>{formatExportValue(column.value(firm, row)) || "-"}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function FirmProfilePage({ params }: { params: Promise<{ firmId: string }> }) {
  const { firmId } = use(params);
  const db = useDatabase();
  const firm = db.firms.find((f) => f.firm_id === firmId);
  const [tab, setTab] = useState<TabKey>("overview");

  if (!firm) {
    return (
      <Card>
        <EmptyState message="Company not found." />
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link href="/firms">
            <Button variant="secondary">Back to companies</Button>
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
  const detailTabs = [
    { key: "overview", label: "Overview", icon: House },
    { key: "products", label: `Components (${products.length})`, hint: "Satellite component records", icon: Package },
    ...(tech.length || facilities.length ? [{ key: "tech", label: `Tech & Infrastructure (${tech.length + facilities.length})`, icon: Cpu }] : []),
    ...(hrRows.length ? [{ key: "workforce", label: `Workforce (${hrRows.length})`, icon: Users }] : []),
    ...(outLinks.length + inLinks.length ? [{ key: "supply", label: `Supply Chain (${outLinks.length + inLinks.length})`, icon: Network }] : []),
    ...(esg.length ? [{ key: "esg", label: `ESG (${esg.length})`, icon: Leaf }] : [])
  ];

  function firmName(id: string) {
    return db.firms.find((f) => f.firm_id === id)?.firm_name ?? id;
  }

  const firmOptions = db.firms.filter((f) => f.firm_id !== firmId).map((f) => f.firm_id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <header className="page-header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <nav aria-label="Breadcrumb" className="breadcrumb">
            <ol>
              <li>
                <Link href="/firms">Companies</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{firm.firm_name}</li>
            </ol>
          </nav>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 600 }}>{firm.firm_name}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            <Badge>{firm.ownership_type}</Badge>
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
            <Button variant="secondary">Edit company</Button>
          </Link>
        </div>
      </header>

      <Tabs
        active={tab}
        onChange={(k) => setTab(k as TabKey)}
        tabs={detailTabs}
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
        <ProductsTab firm={firm} products={products} firmId={firmId} db={db} />
      )}

      {tab === "tech" && (
        <TechTab firm={firm} tech={tech} facilities={facilities} firmId={firmId} db={db} />
      )}

      {tab === "workforce" && (
        <WorkforceTab firm={firm} hr={hrRows} firmId={firmId} />
      )}

      {tab === "supply" && (
        <SupplyTab
          firm={firm}
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
        <ESGTab firm={firm} esg={esg} firmId={firmId} />
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
  firm: Firm;
  source: import("@/lib/schema").DataSource | undefined;
  finance: FirmSizeFinance[];
  firmId: string;
}) {
  const profileRows: FirmProfileExportRow[] = [{ ...firm, source_name: source?.name }];
  return (
    <Card>
      <SectionTitle hint="Company fields captured from the company profile form.">
        Company Profile
      </SectionTitle>
      <div style={{ margin: "-6px 0 14px" }}>
        <FirmDatasetExportButton
          firm={firm}
          datasetLabel="Company Profile"
          fileSlug="company-profile"
          rows={profileRows}
          columns={FIRM_PROFILE_EXPORT_COLUMNS}
          buttonLabel="Export Profile"
        />
      </div>
      <Grid cols={3} gap={14}>
        <KV label="Year established" value={firm.year_established} />
        <KV label="Ownership" value={firm.ownership_type} />
        <KV label="Parent company" value={firm.parent_company || "-"} />
        <KV label="Province" value={firm.province || "-"} />
        <KV label="Industrial zone" value={firm.industrial_zone || "-"} />
        <KV label="Website" value={firm.website || "-"} />
        <KV label="Contact email" value={firm.contact_email || "-"} />
      </Grid>
    </Card>
  );
}
function ProductsTab({
  firm,
  products,
  firmId
}: {
  firm: Firm;
  products: ProductService[];
  firmId: string;
  db: import("@/lib/schema").Database;
}) {
  return (
    <>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 14,
            flexWrap: "wrap"
          }}
        >
          <SectionTitle hint={`${products.length} component record(s). Edit via row actions with Analyst role or higher.`}>
            Component Records
          </SectionTitle>
          <FirmDatasetExportButton
            firm={firm}
            datasetLabel="Components"
            fileSlug="components"
            rows={products}
            columns={PRODUCT_EXPORT_COLUMNS}
            buttonLabel="Export Components"
          />
        </div>
        <ComponentRecordsPanel rows={products} firmId={firmId} />
      </Card>
    </>
  );
}

function TechTab({
  firm,
  tech,
  facilities,
  firmId,
  db
}: {
  firm: Firm;
  tech: TechCapability[];
  facilities: InfrastructureFacility[];
  firmId: string;
  db: import("@/lib/schema").Database;
}) {
  return (
    <>
      <Card>
        <SectionTitle hint="Technology capability and patent records.">
          Technology & Innovation
        </SectionTitle>
        <div style={{ margin: "-6px 0 14px" }}>
          <FirmDatasetExportButton
            firm={firm}
            datasetLabel="Technology"
            fileSlug="technology"
            rows={tech}
            columns={TECH_EXPORT_COLUMNS}
            buttonLabel="Export Tech"
          />
        </div>
        <SubTableEditor<TechCapability>
          title="Technology capability"
          rows={tech}
          table="tech"
          firmId={firmId}
          idField="tech_id"
          idPrefix="T"
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
            { key: "rd", header: "R&D", render: (r) => `${r.rd_expenditure_mthb} MTHB - ${r.rd_personnel} staff` },
            { key: "pat", header: "Patents", render: (r) => `${r.patents_count}${r.patent_field ? ` - ${r.patent_field}` : ""}` },
            { key: "dig", header: "Digital", render: (r) => `${r.digitalization_level}/5` }
          ]}
        />
      </Card>

      <Card>
        <SectionTitle hint="Lab, simulation, and manufacturing process records.">
          Infrastructure & Facilities
        </SectionTitle>
        <div style={{ margin: "-6px 0 14px" }}>
          <FirmDatasetExportButton
            firm={firm}
            datasetLabel="Facilities"
            fileSlug="facilities"
            rows={facilities}
            columns={FACILITY_EXPORT_COLUMNS}
            buttonLabel="Export Facilities"
          />
        </div>
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
            { key: "mfg", header: "Manufacturing", render: (r) => r.manufacturing_process ?? "-" },
            { key: "sw", header: "Software", render: (r) => r.software_capability ?? "-" }
          ]}
        />
      </Card>
    </>
  );
}

function WorkforceTab({ firm, hr, firmId }: { firm: Firm; hr: HRProfile[]; firmId: string }) {
  return (
    <Card>
      <SectionTitle hint="Workforce capacity and skill records.">Human Resource & Skill</SectionTitle>
      <div style={{ margin: "-6px 0 14px" }}>
        <FirmDatasetExportButton
          firm={firm}
          datasetLabel="Workforce"
          fileSlug="workforce"
          rows={hr}
          columns={HR_EXPORT_COLUMNS}
          buttonLabel="Export Workforce"
        />
      </div>
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
          { key: "train", header: "Training", render: (r) => r.training_programs ?? "-" },
          { key: "gap", header: "Skill gap", render: (r) => r.skill_gap ?? "-" }
        ]}
      />
    </Card>
  );
}

function SupplyTab({
  firm,
  outLinks,
  inLinks,
  collabs,
  firmId,
  firmOptions,
  firmName,
  db
}: {
  firm: Firm;
  outLinks: SupplyChainLinkage[];
  inLinks: SupplyChainLinkage[];
  collabs: Collaboration[];
  firmId: string;
  firmOptions: string[];
  firmName: (id: string) => string;
  db: import("@/lib/schema").Database;
}) {
  const linkageExportRows: LinkageExportRow[] = [
    ...outLinks.map((link) => ({
      ...link,
      direction: "Outgoing" as const,
      source_firm_name: firmName(link.firm_id),
      partner_firm_name: firmName(link.partner_firm_id)
    })),
    ...inLinks.map((link) => ({
      ...link,
      direction: "Incoming" as const,
      source_firm_name: firmName(link.firm_id),
      partner_firm_name: firmName(link.partner_firm_id)
    }))
  ];

  return (
    <>
      <Card>
        <SectionTitle hint="Suppliers, buyers, and partner records.">Supply Chain Linkages</SectionTitle>
        <div style={{ margin: "-6px 0 14px" }}>
          <FirmDatasetExportButton
            firm={firm}
            datasetLabel="Supply Linkages"
            fileSlug="supply-linkages"
            rows={linkageExportRows}
            columns={LINKAGE_EXPORT_COLUMNS}
            buttonLabel="Export Linkages"
          />
        </div>
        <SubTableEditor<SupplyChainLinkage>
          title="Outgoing linkages"
          rows={outLinks}
          table="linkages"
          firmId={firmId}
          idField="linkage_id"
          idPrefix="L"
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
              Incoming references ({inLinks.length}) - edit on the originating company
            </div>
            {inLinks.map((l) => (
              <div key={l.linkage_id} style={{ fontSize: 13, padding: "4px 0" }}>
                <Badge>{l.linkage_type}</Badge>{" "}
                From <Link href={`/firms/${l.firm_id}`} style={{ color: "var(--primary)" }}>{firmName(l.firm_id)}</Link>{" "}
                - dep {l.dependency_level}/5
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint="University / PRI / association collaborations.">Innovation Collaborations</SectionTitle>
        <div style={{ margin: "-6px 0 14px" }}>
          <FirmDatasetExportButton
            firm={firm}
            datasetLabel="Collaborations"
            fileSlug="collaborations"
            rows={collabs}
            columns={COLLAB_EXPORT_COLUMNS}
            buttonLabel="Export Collaborations"
          />
        </div>
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

function ESGTab({ firm, esg, firmId }: { firm: Firm; esg: SustainabilityESG[]; firmId: string }) {
  return (
    <Card>
      <SectionTitle hint="Sustainability and environmental indicator records.">Sustainability & ESG</SectionTitle>
      <div style={{ margin: "-6px 0 14px" }}>
        <FirmDatasetExportButton
          firm={firm}
          datasetLabel="ESG"
          fileSlug="esg"
          rows={esg}
          columns={ESG_EXPORT_COLUMNS}
          buttonLabel="Export ESG"
        />
      </div>
      <SubTableEditor<SustainabilityESG>
        title="ESG record"
        rows={esg}
        table="esg"
        firmId={firmId}
        idField="esg_id"
        idPrefix="E"
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
          { key: "cert", header: "Certification", render: (r) => r.esg_certification ?? "-" }
        ]}
      />
      {esg.length > 0 && (
        <Grid cols={4} gap={12} style={{ marginTop: 16 }}>
          <Stat label="Energy" value={`${esg[0].energy_consumption_mwh} MWh`} />
          <Stat label="Renewable" value={`${esg[0].renewable_energy_ratio}%`} />
          <Stat label="CO2" value={`${esg[0].carbon_emission_tco2} tCO2e`} />
          <Stat label="Waste mgmt" value={esg[0].waste_management_system ? "Yes" : "No"} hint={esg[0].esg_certification ?? "-"} />
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

