"use client";

import { useState } from "react";
import { commit, nextId, loadDb, useRole } from "@/lib/store";
import {
  Button,
  Field,
  Input,
  Modal,
  Select,
  Table,
  Badge,
  LockedNote,
  Grid
} from "./ui";
import type { Database } from "@/lib/schema";
import { rolePermissions } from "@/lib/schema";
import {
  COMPONENT_SYSTEMS,
  componentsForModule,
  modulesForSystem
} from "@/lib/component-taxonomy";

export type FieldDef =
  | { name: string; label: string; type: "text"; required?: boolean }
  | { name: string; label: string; type: "number"; min?: number; max?: number; required?: boolean; nullable?: boolean }
  | { name: string; label: string; type: "bool" }
  | { name: string; label: string; type: "enum"; options: string[]; required?: boolean }
  | { name: "component_name"; label: string; type: "component"; required?: boolean };

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
  const permissions = rolePermissions(useRole());
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);

  function blank(): Row {
    const o: Row = { firm_id: firmId };
    for (const f of fields) {
      if (f.name === "firm_id") continue;
      if (f.type === "component") {
        const system = COMPONENT_SYSTEMS[0] ?? "";
        const module = modulesForSystem(system)[0] ?? "";
        o.system = system;
        o.module = module;
        o.component_name = "";
        continue;
      }
      o[f.name] = f.type === "bool" ? false : f.type === "number" ? (f.nullable ? "" : 0) : "";
    }
    return o;
  }

  function isBlank(value: unknown) {
    return value === "" || value === null || value === undefined;
  }

  function normalizeForm(form: Row): Row {
    const next = { ...form };
    for (const f of fields) {
      if (f.type !== "number") continue;
      const value = next[f.name];
      if (isBlank(value)) {
        if (f.nullable) delete next[f.name];
        continue;
      }
      next[f.name] = Number(value);
    }
    return next;
  }

  function validate(form: Row): string | null {
    for (const f of fields) {
      const v = form[f.name];
      if ("required" in f && f.required) {
        if (f.type === "component") {
          if (isBlank(form.system) || isBlank(form.module) || isBlank(form.component_name)) {
            return "System, module, and component are required.";
          }
        } else if (isBlank(v)) {
          return `${f.label} is required.`;
        }
      }
      if (f.type === "number") {
        if (isBlank(v)) {
          if (f.nullable && !f.required) continue;
          return `${f.label} is required.`;
        }
        const n = Number(v);
        if (!Number.isFinite(n)) return `${f.label} must be a valid number.`;
        if (f.min !== undefined && n < f.min) return `${f.label} must be at least ${f.min}.`;
        if (f.max !== undefined && n > f.max) return `${f.label} must be at most ${f.max}.`;
      }
    }
    return null;
  }

  function onCreate(form: Row) {
    const err = validate(form);
    if (err) return alert(err);
    const normalized = normalizeForm(form);
    const db = loadDb();
    const list = db[table] as unknown as Row[];
    const id = nextId(idPrefix, list, idField);
    const row = { ...normalized, [idField]: id, firm_id: firmId };
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
    const normalized = normalizeForm(form);
    const id = String(form[idField]);
    commit(
      { action: "update", table: String(table), id, summary: `Updated ${title} ${id}`, firmId },
      (d) => {
        const list = d[table] as unknown as Row[];
        const idx = list.findIndex((r) => String(r[idField]) === id);
        if (idx >= 0) list[idx] = normalized;
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
      <div className="subtable-editor__header">
        <div>
          <strong className="subtable-editor__title">{title}</strong>
          {hint && <div className="subtable-editor__hint">{hint}</div>}
        </div>
        {permissions.canEdit ? (
          <Button className="subtable-editor__add" variant="secondary" onClick={() => setCreating(true)} style={{ padding: "4px 10px", fontSize: 12 }}>
            Add {title}
          </Button>
        ) : (
          <Badge>Read-only</Badge>
        )}
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
              permissions.canEdit || permissions.canDelete ? (
                <span className="subtable-editor__row-actions">
                  {permissions.canEdit && (
                    <Button
                      variant="ghost"
                      onClick={() => setEditing(row)}
                      style={{ padding: "3px 8px", fontSize: 12 }}
                    >
                      Edit
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button
                      variant="ghost"
                      onClick={() => onDelete(row)}
                      style={{ padding: "3px 8px", fontSize: 12, color: "var(--danger)" }}
                    >
                      Delete
                    </Button>
                  )}
                </span>
              ) : (
                <span style={{ color: "var(--muted)", fontSize: 12 }}>-</span>
              )
            )
          }
        ]}
      />

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
          <Button onClick={() => onSave(form)}>Save record</Button>
        </>
      }
    >
      <Grid cols={2} gap={12}>
        {fields.map((f) => (
          f.type === "component" ? (
            <ComponentPathFields key={f.name} form={form} update={update} required={f.required} />
          ) : (
          <Field key={f.name} label={f.label} required={"required" in f ? f.required : false}>
            {f.type === "text" && (
              <Input value={String(form[f.name] ?? "")} onChange={(e) => update(f.name, e.target.value)} />
            )}
            {f.type === "number" && (
              <Input
                type="number"
                min={f.min}
                max={f.max}
                value={form[f.name] === null || form[f.name] === undefined ? "" : String(form[f.name])}
                onChange={(e) => update(f.name, e.target.value === "" ? (f.nullable ? "" : 0) : Number(e.target.value))}
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
                <option value="">â€”</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          )
        ))}
      </Grid>
    </Modal>
  );
}

function ComponentPathFields({
  form,
  update,
  required
}: {
  form: Row;
  update: (name: string, value: unknown) => void;
  required?: boolean;
}) {
  const system = String(form.system ?? "");
  const module = String(form.module ?? "");
  const modules = modulesForSystem(system);
  const components = componentsForModule(system, module);

  function updateSystem(nextSystem: string) {
    const nextModule = modulesForSystem(nextSystem)[0] ?? "";
    update("system", nextSystem);
    update("module", nextModule);
    update("component_name", "");
  }

  function updateModule(nextModule: string) {
    update("module", nextModule);
    update("component_name", "");
  }

  return (
    <>
      <Field label="System" required={required}>
        <Select value={system} onChange={(e) => updateSystem(e.target.value)}>
          <option value="">Select system</option>
          {COMPONENT_SYSTEMS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Module" required={required}>
        <Select value={module} onChange={(e) => updateModule(e.target.value)} disabled={!system}>
          <option value="">Select module</option>
          {modules.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Component" required={required}>
        <Select
          value={String(form.component_name ?? "")}
          onChange={(e) => update("component_name", e.target.value)}
          disabled={!module}
        >
          <option value="">Select component</option>
          {components.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>
    </>
  );
}

export function SubTableLockedFooter() {
  return null;
}

export function SubTableNotice() {
  return <LockedNote min="Admin" />;
}
