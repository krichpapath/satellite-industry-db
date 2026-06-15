"use client";

import { useState } from "react";
import { useDatabase, commit, nextId, loadDb } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Button,
  Field,
  Input,
  Modal,
  Table,
  Grid,
  Badge,
  RequireRole,
  LockedNote
} from "@/components/ui";
import type { DataSource } from "@/lib/schema";

export default function SourcesPage() {
  const db = useDatabase();
  const [editing, setEditing] = useState<DataSource | null>(null);
  const [creating, setCreating] = useState(false);

  function onCreate(s: DataSource) {
    if (!s.name.trim()) return alert("Name required.");
    const db2 = loadDb();
    const id = nextId("S", db2.sources.map((r) => ({ source_id: r.source_id })), "source_id");
    commit(
      { action: "create", table: "sources", id, summary: `Added source ${s.name}` },
      (d) => {
        d.sources.push({ ...s, source_id: id });
      }
    );
    setCreating(false);
  }

  function onUpdate(s: DataSource) {
    if (!s.name.trim()) return alert("Name required.");
    commit(
      { action: "update", table: "sources", id: s.source_id, summary: `Updated source ${s.name}` },
      (d) => {
        const idx = d.sources.findIndex((r) => r.source_id === s.source_id);
        if (idx >= 0) d.sources[idx] = s;
      }
    );
    setEditing(null);
  }

  function onDelete(s: DataSource) {
    if (!confirm(`Delete source ${s.name}? Companies referencing it will be unlinked.`)) return;
    commit(
      { action: "delete", table: "sources", id: s.source_id, summary: `Deleted source ${s.name}` },
      (d) => {
        d.sources = d.sources.filter((r) => r.source_id !== s.source_id);
        for (const f of d.firms) if (f.source_id === s.source_id) f.source_id = "";
      }
    );
  }

  return (
    <RequireRole min="Admin" fallback={<LockedNote min="Admin" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <header className="page-header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Data Sources</h1>
            <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
              Provenance registry for company and component datasets.
            </div>
          </div>
          <Button onClick={() => setCreating(true)}>New source</Button>
        </header>

        <Card>
          <SectionTitle hint="Each company record references one source for traceability.">Registered sources</SectionTitle>
          <Table
            rows={db.sources}
            empty="No sources registered."
            columns={[
              { key: "id", header: "ID", render: (r) => <code>{r.source_id}</code> },
              { key: "name", header: "Name", render: (r) => r.name },
              { key: "owner", header: "Owner", render: (r) => r.owner ?? "—" },
              { key: "url", header: "URL", render: (r) => r.url ?? "—" },
              { key: "sync", header: "Last synced", render: (r) => r.last_synced ?? "—" },
              {
                key: "uses",
                header: "Used by",
                render: (r) => {
                  const n = db.firms.filter((f) => f.source_id === r.source_id).length;
                  return <Badge tone={n > 0 ? "success" : "neutral"}>{n} companies</Badge>;
                }
              },
              {
                key: "actions",
                header: "",
                render: (r) => (
                  <span style={{ display: "inline-flex", gap: 6 }}>
                    <Button variant="ghost" onClick={() => setEditing(r)} style={{ padding: "3px 8px", fontSize: 12 }}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onDelete(r)}
                      style={{ padding: "3px 8px", fontSize: 12, color: "var(--danger)" }}
                    >
                      Del
                    </Button>
                  </span>
                )
              }
            ]}
          />
        </Card>

        {creating && (
          <SourceModal
            title="New source"
            initial={{ source_id: "", name: "", url: "", owner: "", last_synced: "", notes: "" }}
            onSave={onCreate}
            onClose={() => setCreating(false)}
          />
        )}
        {editing && (
          <SourceModal
            title="Edit source"
            initial={editing}
            onSave={onUpdate}
            onClose={() => setEditing(null)}
          />
        )}
      </div>
    </RequireRole>
  );
}

function SourceModal({
  title,
  initial,
  onSave,
  onClose
}: {
  title: string;
  initial: DataSource;
  onSave: (s: DataSource) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DataSource>({ ...initial });
  function up<K extends keyof DataSource>(k: K, v: DataSource[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }
  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(form)}>Save</Button>
        </>
      }
    >
      <Grid cols={2} gap={12}>
        <Field label="Name" required>
          <Input value={form.name} onChange={(e) => up("name", e.target.value)} />
        </Field>
        <Field label="Owner">
          <Input value={form.owner ?? ""} onChange={(e) => up("owner", e.target.value)} />
        </Field>
        <Field label="URL">
          <Input type="url" inputMode="url" value={form.url ?? ""} onChange={(e) => up("url", e.target.value)} />
        </Field>
        <Field label="Last synced (YYYY-MM-DD)">
          <Input type="date" value={form.last_synced ?? ""} onChange={(e) => up("last_synced", e.target.value)} />
        </Field>
        <Field label="Notes">
          <Input value={form.notes ?? ""} onChange={(e) => up("notes", e.target.value)} />
        </Field>
      </Grid>
    </Modal>
  );
}
