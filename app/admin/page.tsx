"use client";

import { useRef, useState } from "react";
import {
  useDatabase,
  resetDb,
  exportJson,
  importJson,
  loadDb,
  commit,
  nextId
} from "@/lib/store";
import {
  Card,
  SectionTitle,
  Button,
  Textarea,
  Badge,
  Grid,
  Stat,
  EmptyState,
  RequireRole,
  LockedNote,
  Select,
  Field,
  Table
} from "@/components/ui";
import { csvToObjects } from "@/lib/csv";
import type { Database } from "@/lib/schema";

type Tab = "json" | "csv" | "danger";

const CSV_TARGETS: { key: keyof Database; label: string; idField: string; idPrefix: string; columns: string[] }[] = [
  {
    key: "firms",
    label: "Firms",
    idField: "firm_id",
    idPrefix: "F",
    columns: ["firm_name", "registration_no", "year_established", "ownership_type", "industry_code", "province", "industrial_zone", "website", "contact_email", "parent_company", "source_id"]
  },
  {
    key: "products",
    label: "Products / Services",
    idField: "product_id",
    idPrefix: "P",
    columns: ["firm_id", "product_name", "value_chain_stage", "technology_intensity", "main_market", "certification"]
  },
  {
    key: "tech",
    label: "Technology capability",
    idField: "tech_id",
    idPrefix: "T",
    columns: ["firm_id", "core_technology", "trl_level", "rd_expenditure_mthb", "rd_personnel", "patents_count", "patent_field", "digitalization_level"]
  },
  {
    key: "esg",
    label: "Sustainability / ESG",
    idField: "esg_id",
    idPrefix: "E",
    columns: ["firm_id", "energy_consumption_mwh", "renewable_energy_ratio", "carbon_emission_tco2", "waste_management_system", "esg_certification"]
  }
];

const NUMERIC_FIELDS = new Set([
  "year_established",
  "trl_level",
  "rd_expenditure_mthb",
  "rd_personnel",
  "patents_count",
  "digitalization_level",
  "employees_total",
  "engineers",
  "annual_revenue_mthb",
  "export_percentage",
  "capital_investment_mthb",
  "energy_consumption_mwh",
  "renewable_energy_ratio",
  "carbon_emission_tco2",
  "dependency_level",
  "duration_years"
]);

const BOOL_FIELDS = new Set([
  "testing_lab",
  "simulation_tools",
  "waste_management_system"
]);

export default function AdminPage() {
  const db = useDatabase();
  const [tab, setTab] = useState<Tab>("json");
  const [jsonText, setJsonText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvTarget, setCsvTarget] = useState<keyof Database>("firms");
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[] | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function doExport() {
    setJsonText(exportJson());
    setStatus({ kind: "ok", msg: "Exported current database to text area." });
  }

  function doDownload() {
    const text = exportJson();
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `satdb-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus({ kind: "ok", msg: "Downloaded JSON file." });
  }

  function doImport() {
    const res = importJson(jsonText);
    setStatus(res.ok ? { kind: "ok", msg: "Database replaced from JSON." } : { kind: "err", msg: res.error ?? "Import failed." });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setJsonText(text);
      const res = importJson(text);
      setStatus(res.ok ? { kind: "ok", msg: `Imported ${file.name}.` } : { kind: "err", msg: res.error ?? "Import failed." });
    };
    reader.readAsText(file);
  }

  function previewCsv() {
    try {
      const rows = csvToObjects(csvText);
      if (rows.length === 0) {
        setStatus({ kind: "err", msg: "No rows parsed." });
        return;
      }
      setCsvPreview(rows);
      setStatus({ kind: "ok", msg: `Parsed ${rows.length} row(s).` });
    } catch (e) {
      setStatus({ kind: "err", msg: (e as Error).message });
    }
  }

  function coerce(value: string, key: string) {
    if (NUMERIC_FIELDS.has(key)) return parseFloat(value) || 0;
    if (BOOL_FIELDS.has(key)) return value.toLowerCase() === "true" || value === "1" || value.toLowerCase() === "yes";
    return value;
  }

  function commitCsv() {
    if (!csvPreview || csvPreview.length === 0) return;
    const target = CSV_TARGETS.find((t) => t.key === csvTarget)!;
    const db2 = loadDb();
    const list = db2[target.key] as unknown as Record<string, unknown>[];
    let nextN = 0;
    for (const r of list) {
      const v = String(r[target.idField] ?? "");
      const m = v.match(/(\d+)$/);
      if (m) nextN = Math.max(nextN, parseInt(m[1], 10));
    }
    commit(
      { action: "import", table: String(target.key), id: "*", summary: `CSV import: ${csvPreview.length} row(s) into ${target.label}` },
      (d) => {
        const arr = d[target.key] as unknown as Record<string, unknown>[];
        let counter = nextN;
        for (const row of csvPreview) {
          const out: Record<string, unknown> = {};
          for (const col of target.columns) {
            out[col] = coerce(row[col] ?? "", col);
          }
          counter++;
          out[target.idField] = `${target.idPrefix}${String(counter).padStart(3, "0")}`;
          arr.push(out);
        }
      }
    );
    setStatus({ kind: "ok", msg: `Imported ${csvPreview.length} row(s) into ${target.label}.` });
    setCsvPreview(null);
    setCsvText("");
  }

  function doReset() {
    if (!confirm("Reset to seed data? All edits will be lost.")) return;
    resetDb();
    setJsonText("");
    setStatus({ kind: "ok", msg: "Database reset to seed." });
  }

  function clearAll() {
    if (!confirm("Wipe ALL data? Cannot be undone (use seed to restore).")) return;
    commit(
      { action: "wipe", table: "*", id: "*", summary: "All records wiped" },
      (d) => {
        d.firms = [];
        d.size_finance = [];
        d.products = [];
        d.tech = [];
        d.facilities = [];
        d.hr = [];
        d.linkages = [];
        d.collabs = [];
        d.esg = [];
        d.sources = [];
      }
    );
    setStatus({ kind: "ok", msg: "All records cleared." });
  }

  const rowCounts: [string, number][] = [
    ["Firms", db.firms.length],
    ["Size & Finance", db.size_finance.length],
    ["Products", db.products.length],
    ["Tech", db.tech.length],
    ["Facilities", db.facilities.length],
    ["HR", db.hr.length],
    ["Linkages", db.linkages.length],
    ["Collaborations", db.collabs.length],
    ["ESG", db.esg.length],
    ["Sources", db.sources.length],
    ["Audit entries", db.audit.length]
  ];

  const target = CSV_TARGETS.find((t) => t.key === csvTarget)!;
  const csvTemplate = target.columns.join(",") + "\n";

  return (
    <RequireRole min="Admin" fallback={<LockedNote min="Admin" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <header>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Admin / Data Management</h1>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            Access-controlled data interface (paper §6.5). Backup, restore, bulk import, reset.
          </div>
        </header>

        <Card>
          <SectionTitle>Record counts (live)</SectionTitle>
          <Grid cols={4}>
            {rowCounts.map(([label, n]) => (
              <Stat key={label} label={label} value={n} />
            ))}
          </Grid>
        </Card>

        <div style={{ display: "flex", gap: 6 }}>
          {(["json", "csv", "danger"] as Tab[]).map((t) => (
            <Button key={t} variant={tab === t ? "primary" : "secondary"} onClick={() => setTab(t)}>
              {t === "json" ? "JSON Backup" : t === "csv" ? "CSV Import (ETL)" : "Danger zone"}
            </Button>
          ))}
        </div>

        {tab === "json" && (
          <Card>
            <SectionTitle hint="Whole-database snapshot. Round-trip with the schema in lib/schema.ts.">
              JSON Backup & Restore
            </SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <Button onClick={doExport}>Show current JSON</Button>
              <Button variant="secondary" onClick={doDownload}>
                Download .json
              </Button>
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                Load from file…
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={onFile}
              />
              <Button variant="ghost" onClick={() => setJsonText("")}>
                Clear text
              </Button>
            </div>
            <Textarea
              rows={14}
              value={jsonText}
              placeholder="Paste a database JSON here to replace the local store, then click Import."
              onChange={(e) => setJsonText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Button onClick={doImport} disabled={!jsonText.trim()}>
                Import JSON
              </Button>
              {status && <Badge tone={status.kind === "ok" ? "success" : "danger"}>{status.msg}</Badge>}
            </div>
          </Card>
        )}

        {tab === "csv" && (
          <Card>
            <SectionTitle hint="ETL — paper §design principles 1+2. Pick a target table, paste CSV with header row, preview, commit.">
              CSV Bulk Import
            </SectionTitle>
            <Grid cols={2} gap={12} style={{ marginBottom: 12 }}>
              <Field label="Target table">
                <Select value={csvTarget} onChange={(e) => { setCsvTarget(e.target.value as keyof Database); setCsvPreview(null); }}>
                  {CSV_TARGETS.map((t) => (
                    <option key={String(t.key)} value={String(t.key)}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Expected header row">
                <code style={{ fontSize: 11, color: "var(--ink-soft)", display: "block", padding: "9px 12px", background: "var(--surface-muted)", borderRadius: 8, overflow: "auto" }}>
                  {target.columns.join(",")}
                </code>
              </Field>
            </Grid>

            <Textarea
              rows={10}
              value={csvText}
              placeholder={`${csvTemplate}AcmeSat,0123,2024,Local,ISIC-3030,Bangkok,,,,...`}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={() => setCsvText(csvTemplate)}>
                Insert header template
              </Button>
              <Button onClick={previewCsv} disabled={!csvText.trim()}>
                Preview
              </Button>
              <Button onClick={commitCsv} disabled={!csvPreview}>
                Commit ({csvPreview?.length ?? 0} rows)
              </Button>
              <Button variant="ghost" onClick={() => { setCsvText(""); setCsvPreview(null); }}>
                Clear
              </Button>
              {status && <Badge tone={status.kind === "ok" ? "success" : "danger"}>{status.msg}</Badge>}
            </div>

            {csvPreview && (
              <div style={{ marginTop: 16 }}>
                <SectionTitle hint={`${csvPreview.length} row(s) parsed.`}>Preview</SectionTitle>
                <Table
                  rows={csvPreview}
                  empty="Nothing parsed."
                  columns={target.columns.map((c) => ({
                    key: c,
                    header: c,
                    render: (r: Record<string, string>) => r[c] ?? ""
                  }))}
                />
              </div>
            )}
          </Card>
        )}

        {tab === "danger" && (
          <Card>
            <SectionTitle hint="Destructive operations are explicit and confirmed.">Danger zone</SectionTitle>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={doReset}>
                Reset to seed
              </Button>
              <Button variant="danger" onClick={clearAll}>
                Wipe all data
              </Button>
              {status && <Badge tone={status.kind === "ok" ? "success" : "danger"}>{status.msg}</Badge>}
            </div>
            {db.firms.length === 0 && (
              <div style={{ marginTop: 12 }}>
                <EmptyState message="Database is empty. Reset to seed to restore demo data." />
              </div>
            )}
          </Card>
        )}
      </div>
    </RequireRole>
  );
}
