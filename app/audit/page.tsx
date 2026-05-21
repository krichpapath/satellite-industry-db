"use client";

import { useState } from "react";
import { useDatabase } from "@/lib/store";
import { Card, SectionTitle, Table, Badge, Select, Input, Grid, Field, RequireRole, LockedNote } from "@/components/ui";

export default function AuditPage() {
  const db = useDatabase();
  const [tableFilter, setTableFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [q, setQ] = useState("");

  const tables = Array.from(new Set(db.audit.map((a) => a.target_table)));
  const actions = Array.from(new Set(db.audit.map((a) => a.action)));

  const rows = db.audit.filter((a) => {
    if (tableFilter && a.target_table !== tableFilter) return false;
    if (actionFilter && a.action !== actionFilter) return false;
    if (q) {
      const hay = `${a.target_id} ${a.summary} ${a.role}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <RequireRole min="Admin" fallback={<LockedNote min="Admin" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <header>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Audit Trail</h1>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            Every mutation through `commit()` is logged here. Paper §6.5 Data Quality Management.
          </div>
        </header>

        <Card>
          <SectionTitle hint={`${rows.length} entries.`}>Filters</SectionTitle>
          <Grid cols={3} gap={12}>
            <Field label="Table">
              <Select value={tableFilter} onChange={(e) => setTableFilter(e.target.value)}>
                <option value="">All</option>
                {tables.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Action">
              <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="">All</option>
                {actions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Search">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ID, summary, role" />
            </Field>
          </Grid>
        </Card>

        <Card>
          <Table
            rows={rows}
            empty="No matching audit entries."
            columns={[
              { key: "ts", header: "Timestamp", render: (r) => new Date(r.ts).toLocaleString() },
              { key: "role", header: "Role", render: (r) => <Badge>{r.role}</Badge> },
              {
                key: "action",
                header: "Action",
                render: (r) => (
                  <Badge
                    tone={
                      r.action === "delete" || r.action === "wipe"
                        ? "danger"
                        : r.action === "create"
                        ? "success"
                        : r.action === "import" || r.action === "reset"
                        ? "warn"
                        : "neutral"
                    }
                  >
                    {r.action}
                  </Badge>
                )
              },
              { key: "table", header: "Table", render: (r) => <code>{r.target_table}</code> },
              { key: "id", header: "ID", render: (r) => <code>{r.target_id}</code> },
              { key: "summary", header: "Summary", render: (r) => r.summary }
            ]}
          />
        </Card>
      </div>
    </RequireRole>
  );
}
