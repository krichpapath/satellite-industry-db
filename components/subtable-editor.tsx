"use client";

import { useState } from "react";
import { commit, nextId, loadDb } from "@/lib/store";
import {
  Button,
  Field,
  Input,
  Modal,
  Select,
  Table,
  Badge,
  RequireRole,
  LockedNote,
  Grid
} from "./ui";
import type { Database } from "@/lib/schema";

export type FieldDef =
  | { name: string; label: string; type: "text"; required?: boolean }
  | { name: string; label: string; type: "number"; min?: number; max?: number; required?: boolean }
  | { name: string; label: string; type: "bool" }
  | { name: string; label: string; type: "enum"; options: string[]; required?: boolean };

type Row = Record<string, unknown>;

export function SubTableEditor<T>({
  title,
  hint,
  rows,
  table,
  firmId,
  idField,
  idPrefix,
  fields,
  display,
  emptyLabel = "No records."
}: {
  title: string;
  hint?: string;
  rows: T[];
  table: keyof Database;
  firmId: string;
  idField: string;
  idPrefix: string;
  fields: FieldDef[];
  display: { key: string; header: string; render: (row: T) => React.ReactNode }[];
  emptyLabel?: string;
}) {
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);

  function blank(): Row {
    const o: Row = { firm_id: firmId };
    for (const f of fields) {
      if (f.name === "firm_id") continue;
      o[f.name] = f.type === "bool" ? false : f.type === "number" ? 0 : "";
    }
    return o;
  }

  function validate(form: Row): string | null {
    for (const f of fields) {
      if ("required" in f && f.required) {
        const v = form[f.name];
        if (v === "" || v === null || v === undefined) {
          return `${f.label} is required.`;
        }
      }
    }
    return null;
  }

  function onCreate(form: Row) {
    const err = validate(form);
    if (err) return alert(err);
    const db = loadDb();
    const list = db[table] as unknown as Row[];
    const id = nextId(idPrefix, list, idField);
    const row = { ...form, [idField]: id, firm_id: firmId };
    commit(
      { action: "create", table: String(table), id, summary: `Added ${title} ${id}`, firmId },
      (d) => {
        (d[table] as unknown as Row[]).push(row);
      }
    );
    setCreating(false);
  }

  function onUpdate(form: Row) {
    const err = validate(form);
    if (err) return alert(err);
    const id = String(form[idField]);
    commit(
      { action: "update", table: String(table), id, summary: `Updated ${title} ${id}`, firmId },
      (d) => {
        const list = d[table] as unknown as Row[];
        const idx = list.findIndex((r) => String(r[idField]) === id);
        if (idx >= 0) list[idx] = form;
      }
    );
    setEditing(null);
  }

  function onDelete(row: T) {
    const r = row as unknown as Row;
    const id = String(r[idField]);
    if (!confirm(`Delete ${title} ${id}?`)) return;
    commit(
      { action: "delete", table: String(table), id, summary: `Deleted ${title} ${id}`, firmId },
      (d) => {
        const list = d[table] as unknown as Row[];
        const idx = list.findIndex((r2) => String(r2[idField]) === id);
        if (idx >= 0) list.splice(idx, 1);
      }
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <strong style={{ fontSize: 14 }}>{title}</strong>
          {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{hint}</div>}
        </div>
        <RequireRole min="Analyst" fallback={<Badge>Read-only</Badge>}>
          <Button variant="secondary" onClick={() => setCreating(true)} style={{ padding: "4px 10px", fontSize: 12 }}>
            + Add
          </Button>
        </RequireRole>
      </div>

      <Table
        rows={rows}
        empty={emptyLabel}
        columns={[
          ...display,
          {
            key: "_actions",
            header: "",
            render: (row: T) => (
              <RequireRole min="Analyst" fallback={<span style={{ color: "var(--muted)", fontSize: 12 }}>—</span>}>
                <span style={{ display: "inline-flex", gap: 6 }}>
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(row)}
                    style={{ padding: "3px 8px", fontSize: 12 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    style={{ padding: "3px 8px", fontSize: 12, color: "var(--danger)" }}
                  >
                    Del
                  </Button>
                </span>
              </RequireRole>
            )
          }
        ]}
      />

      <RequireRole min="Analyst">
        <div />
      </RequireRole>

      {creating && (
        <RowModal
          title={`New ${title}`}
          initial={blank()}
          fields={fields}
          onSave={onCreate}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <RowModal
          title={`Edit ${title}`}
          initial={editing as unknown as Row}
          fields={fields}
          onSave={onUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RowModal({
  title,
  initial,
  fields,
  onSave,
  onClose
}: {
  title: string;
  initial: Row;
  fields: FieldDef[];
  onSave: (row: Row) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Row>(structuredClone(initial));

  function update(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }));
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
        {fields.map((f) => (
          <Field key={f.name} label={f.label} required={"required" in f ? f.required : false}>
            {f.type === "text" && (
              <Input value={String(form[f.name] ?? "")} onChange={(e) => update(f.name, e.target.value)} />
            )}
            {f.type === "number" && (
              <Input
                type="number"
                value={Number(form[f.name] ?? 0)}
                onChange={(e) => update(f.name, parseFloat(e.target.value) || 0)}
              />
            )}
            {f.type === "bool" && (
              <Select value={form[f.name] ? "true" : "false"} onChange={(e) => update(f.name, e.target.value === "true")}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </Select>
            )}
            {f.type === "enum" && (
              <Select value={String(form[f.name] ?? "")} onChange={(e) => update(f.name, e.target.value)}>
                <option value="">—</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        ))}
      </Grid>
    </Modal>
  );
}

export function SubTableLockedFooter() {
  return (
    <RequireRole min="Analyst">
      <></>
    </RequireRole>
  );
}

export function SubTableNotice() {
  return (
    <RequireRole min="Analyst" fallback={<LockedNote min="Analyst" />}>
      <></>
    </RequireRole>
  );
}
