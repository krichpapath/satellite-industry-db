"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CloudDownload, CloudUpload, FileSpreadsheet, RefreshCw, ScrollText } from "lucide-react";
import {
  useDatabase,
  exportJson,
  importJson,
  loadDb,
  commit,
  syncDatasetFromApi,
  useSyncStatus
} from "@/lib/store";
import { apiConfigured } from "@/lib/api";
import {
  Card,
  SectionTitle,
  Button,
  Textarea,
  Badge,
  Grid,
  Stat,
  RequireRole,
  LockedNote,
  Select,
  Field,
  Table
} from "@/components/ui";
import { csvToObjects } from "@/lib/csv";
import type { Database } from "@/lib/schema";
import { createAllComponentsXlsx } from "@/lib/component-xlsx";
import { createDatabaseXlsx } from "@/lib/db-xlsx";

// Import replaces live data and is unverified -- hidden until it is tested.
// Flip to true to bring back the CSV tab and the JSON restore controls.
const IMPORT_ENABLED = false;

type Tab = "json" | "csv";

const CSV_TARGETS: { key: keyof Database; label: string; idField: string; idPrefix: string; columns: string[] }[] = [
  {
    key: "firms",
    label: "Companies",
    idField: "firm_id",
    idPrefix: "F",
    columns: ["firm_name", "year_established", "ownership_type", "parent_company", "province", "industrial_zone", "website", "contact_email"]
  },
  {
    key: "products",
    label: "Components",
    idField: "product_id",
    idPrefix: "P",
    columns: ["firm_id", "product_name", "system", "module", "component_name", "product_trl", "flight_heritage", "description"]
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

function downloadBlob(bytes: BlobPart, type: string, filename: string) {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const db = useDatabase();
  const sync = useSyncStatus();
  const [tab, setTab] = useState<Tab>("json");
  const [jsonText, setJsonText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvTarget, setCsvTarget] = useState<keyof Database>("firms");
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[] | null>(null);
  const [csvWarning, setCsvWarning] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [exportStatus, setExportStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [exporting, setExporting] = useState<"components" | "database" | null>(null);
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function syncNow() {
    setSyncing(true);
    try {
      await syncDatasetFromApi(true);
    } finally {
      setSyncing(false);
    }
  }

  function doExport() {
    setJsonText(exportJson());
    setStatus({ kind: "ok", msg: "Exported current database to text area." });
  }

  function doDownload() {
    downloadBlob(exportJson(), "application/json", `satdb-${new Date().toISOString().slice(0, 10)}.json`);
    setStatus({ kind: "ok", msg: "Downloaded JSON file." });
  }

  function doImport() {
    if (!confirm("Replace the ENTIRE database with this JSON? Current data will be overwritten.")) return;
    const res = importJson(jsonText);
    setStatus(res.ok ? { kind: "ok", msg: "Database replaced from JSON." } : { kind: "err", msg: res.error ?? "Import failed." });
  }

  async function runExport(kind: "components" | "database") {
    setExporting(kind);
    setExportStatus(null);
    try {
      const bytes = kind === "components" ? await createAllComponentsXlsx(db) : await createDatabaseXlsx(db);
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(
        bytes,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        kind === "components" ? `satdb-all-components-${date}.xlsx` : `satdb-full-database-${date}.xlsx`
      );
      setExportStatus({
        kind: "ok",
        msg: kind === "components"
          ? `Downloaded ${db.products.length} component row(s).`
          : `Downloaded full database (${db.firms.length} companies, 11 sheets incl. audit log).`
      });
    } catch (error) {
      setExportStatus({ kind: "err", msg: error instanceof Error ? error.message : "Export failed." });
    } finally {
      setExporting(null);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setJsonText(reader.result as string);
      setStatus({ kind: "ok", msg: `Loaded ${file.name}. Review, then click Import JSON.` });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function previewCsv() {
    setCsvWarning(null);
    try {
      const rows = csvToObjects(csvText);
      if (rows.length === 0) {
        setStatus({ kind: "err", msg: "No rows parsed." });
        return;
      }
      const target = CSV_TARGETS.find((t) => t.key === csvTarget)!;

      const known = new Set(target.columns);
      const unknown = Object.keys(rows[0]).filter((key) => !known.has(key));

      if (target.columns.includes("firm_id")) {
        const firmIds = new Set(db.firms.map((firm) => firm.firm_id));
        const bad = rows.filter((row) => !firmIds.has(row.firm_id ?? ""));
        if (bad.length > 0) {
          const examples = Array.from(new Set(bad.map((row) => row.firm_id || "(empty)"))).slice(0, 5).join(", ");
          setCsvPreview(null);
          setStatus({ kind: "err", msg: `${bad.length} row(s) reference unknown firm_id: ${examples}. Fix the CSV and preview again.` });
          return;
        }
      }

      setCsvPreview(rows);
      if (unknown.length > 0) {
        setCsvWarning(`Ignored unknown column(s): ${unknown.join(", ")}. Expected: ${target.columns.join(", ")}.`);
      }
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
    setCsvWarning(null);
    setCsvText("");
  }

  const rowCounts: [string, number][] = [
    ["Companies", db.firms.length],
    ["Size & Finance", db.size_finance.length],
    ["Components", db.products.length],
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
  const recentAudit = db.audit.slice(0, 8);

  return (
    <RequireRole min="Admin" fallback={<LockedNote min="Admin" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <header>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Admin / Data Management</h1>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            Access-controlled data interface for sync, backup, restore, bulk import, and exports.
          </div>
        </header>

        <Card>
          <SectionTitle hint="State of the remote dataset API and the last local write.">
            Sync &amp; Storage
          </SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Badge tone={apiConfigured() ? "success" : "warn"}>
              {apiConfigured() ? "API configured" : "API not configured — local storage only"}
            </Badge>
            {sync.lastSync && (
              <Badge tone={sync.lastSync.result.ok ? "success" : "danger"}>
                <CloudDownload size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                {sync.lastSync.result.ok
                  ? `Last sync ${new Date(sync.lastSync.ts).toLocaleTimeString()}: ${sync.lastSync.result.count} companies`
                  : `Sync failed ${new Date(sync.lastSync.ts).toLocaleTimeString()}: ${sync.lastSync.result.reason}`}
              </Badge>
            )}
            {sync.saving && <Badge tone="accent">Saving to API…</Badge>}
            {!sync.saving && sync.lastSave && (
              <Badge tone={sync.lastSave.ok ? "success" : "danger"}>
                <CloudUpload size={12} style={{ marginRight: 4, verticalAlign: -2 }} />
                {sync.lastSave.ok
                  ? `Last save ${new Date(sync.lastSave.ts).toLocaleTimeString()} OK`
                  : `SAVE FAILED ${new Date(sync.lastSave.ts).toLocaleTimeString()}: ${sync.lastSave.error}`}
              </Badge>
            )}
            {apiConfigured() && (
              <Button variant="secondary" onClick={syncNow} disabled={syncing}>
                <RefreshCw size={14} />
                {syncing ? "Syncing…" : "Sync now"}
              </Button>
            )}
          </div>
          {!sync.saving && sync.lastSave && !sync.lastSave.ok && (
            <div style={{ marginTop: 10, fontSize: 13, color: "var(--danger)" }}>
              The last change was NOT saved to the remote database. It is still in this browser — retry by making any edit, or check the API.
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Record counts (live)</SectionTitle>
          <Grid cols={4}>
            {rowCounts.map(([label, n]) => (
              <Stat key={label} label={label} value={n} />
            ))}
          </Grid>
        </Card>

        <Card>
          <SectionTitle hint="Full database: one worksheet per table plus the audit log. Components: flat single-sheet list.">
            Exports (.xlsx)
          </SectionTitle>
          <div className="admin-action-row" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Button onClick={() => runExport("database")} disabled={exporting !== null}>
              <FileSpreadsheet size={15} />
              {exporting === "database" ? "Preparing Excel…" : "Download full database"}
            </Button>
            <Button variant="secondary" onClick={() => runExport("components")} disabled={db.products.length === 0 || exporting !== null}>
              {exporting === "components" ? "Preparing Excel…" : "Download all components"}
            </Button>
            <Badge tone="accent">{db.products.length} component{db.products.length === 1 ? "" : "s"}</Badge>
            {exportStatus && (
              <Badge tone={exportStatus.kind === "ok" ? "success" : "danger"}>
                {exportStatus.msg}
              </Badge>
            )}
          </div>
        </Card>

        <div className="admin-tab-row" style={{ display: "flex", gap: 6 }}>
          {(IMPORT_ENABLED ? (["json", "csv"] as Tab[]) : (["json"] as Tab[])).map((t) => (
            <Button key={t} variant={tab === t ? "primary" : "secondary"} onClick={() => setTab(t)}>
              {t === "json" ? "JSON Backup" : "CSV Import (ETL)"}
            </Button>
          ))}
        </div>

        {tab === "json" && (
          <Card>
            <SectionTitle hint="Whole-database snapshot. Round-trip with the schema in lib/schema.ts.">
              JSON Backup &amp; Restore
            </SectionTitle>
            <div className="admin-action-row" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <Button onClick={doExport}>Show current JSON</Button>
              <Button variant="secondary" onClick={doDownload}>
                Download .json
              </Button>
              {IMPORT_ENABLED && (
                <>
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
                </>
              )}
              <Button variant="ghost" onClick={() => setJsonText("")}>
                Clear text
              </Button>
            </div>
            <Textarea
              rows={14}
              value={jsonText}
              placeholder={
                IMPORT_ENABLED
                  ? "Paste a database JSON here to replace the local store, then click Import."
                  : "Read-only snapshot. Click “Show current JSON” above."
              }
              onChange={(e) => setJsonText(e.target.value)}
            />
            <div className="admin-action-row" style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {IMPORT_ENABLED && (
                <Button onClick={doImport} disabled={!jsonText.trim()}>
                  Import JSON
                </Button>
              )}
              {status && <Badge tone={status.kind === "ok" ? "success" : "danger"}>{status.msg}</Badge>}
            </div>
          </Card>
        )}

        {tab === "csv" && (
          <Card>
            <SectionTitle hint="Pick a target table, paste CSV with a header row, preview, then commit.">
              CSV Bulk Import
            </SectionTitle>
            <Grid cols={2} gap={12} style={{ marginBottom: 12 }}>
              <Field label="Target table">
                <Select value={csvTarget} onChange={(e) => { setCsvTarget(e.target.value as keyof Database); setCsvPreview(null); setCsvWarning(null); }}>
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
              placeholder={`${csvTemplate}AcmeSat,2024,Local,,Bangkok,,https://example.com,info@example.com`}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <div className="admin-action-row" style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={() => setCsvText(csvTemplate)}>
                Insert header template
              </Button>
              <Button onClick={previewCsv} disabled={!csvText.trim()}>
                Preview
              </Button>
              <Button onClick={commitCsv} disabled={!csvPreview}>
                Commit ({csvPreview?.length ?? 0} rows)
              </Button>
              <Button variant="ghost" onClick={() => { setCsvText(""); setCsvPreview(null); setCsvWarning(null); }}>
                Clear
              </Button>
              {status && <Badge tone={status.kind === "ok" ? "success" : "danger"}>{status.msg}</Badge>}
            </div>
            {csvWarning && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--warn)" }}>{csvWarning}</div>
            )}

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

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <SectionTitle hint="Latest changes across the whole database.">Recent activity</SectionTitle>
            <Link href="/audit">
              <Button variant="secondary">
                <ScrollText size={14} />
                Open audit trail
              </Button>
            </Link>
          </div>
          <Table
            rows={recentAudit}
            getRowKey={(r) => r.audit_id}
            empty="No changes recorded yet."
            columns={[
              { key: "ts", header: "When", render: (r) => new Date(r.ts).toLocaleString() },
              { key: "role", header: "Role", render: (r) => <Badge>{r.role}</Badge> },
              {
                key: "action",
                header: "Action",
                render: (r) => (
                  <Badge tone={r.action === "delete" || r.action === "wipe" ? "danger" : r.action === "create" ? "success" : r.action === "import" || r.action === "reset" ? "warn" : "neutral"}>
                    {r.action}
                  </Badge>
                )
              },
              { key: "summary", header: "Summary", render: (r) => r.summary }
            ]}
          />
        </Card>
      </div>
    </RequireRole>
  );
}
