"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import {
  Bold,
  CircleHelp,
  Compass,
  Cpu,
  Flame,
  Italic,
  Layers3,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Pencil,
  Radio,
  Rocket,
  RotateCcw,
  RotateCw,
  Search,
  Trash2,
  Telescope,
  Underline,
  Info,
  PackagePlus,
  Zap
} from "lucide-react";
import { commit, loadDb, nextId, useRole } from "@/lib/store";
import { rolePermissions, type ProductService, type RecordState } from "@/lib/schema";
import {
  COMPONENT_SYSTEMS,
  UNIDENTIFIED_VALUE,
  cleanComponentLabel,
  componentsForModule,
  modulesForSystem,
  normalizeSystem
} from "@/lib/component-taxonomy";
import { richTextToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { Badge, Button, EmptyState, Field, Input, Modal, Select, Textarea } from "./ui";

type ComponentForm = ProductService;
type SortMode = "name:asc" | "name:desc" | "trl:desc" | "trl:asc" | "newest";
type SystemKind = "payload" | "eps" | "adcs" | "cdh" | "ttc" | "stcs" | "propulsion" | "unknown";

const SYSTEM_VISUALS: Record<SystemKind, {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}> = {
  payload: { icon: Telescope, label: "Payload" },
  eps: { icon: Zap, label: "Electrical power" },
  adcs: { icon: Compass, label: "Attitude control" },
  cdh: { icon: Cpu, label: "Command and data handling" },
  ttc: { icon: Radio, label: "Telemetry, tracking, and command" },
  stcs: { icon: Layers3, label: "Structure and thermal control" },
  propulsion: { icon: Flame, label: "Propulsion" },
  unknown: { icon: CircleHelp, label: "Unidentified system" }
};

function systemKind(system: string): SystemKind {
  const normalized = normalizeSystem(system);
  if (normalized === UNIDENTIFIED_VALUE) return "unknown";
  if (normalized.includes("Payload")) return "payload";
  if (normalized.includes("Electrical Power") || normalized.includes("EPS")) return "eps";
  if (normalized.includes("ADCS")) return "adcs";
  if (normalized.includes("Command & Data") || normalized.includes("C&DH")) return "cdh";
  if (normalized.includes("TT&C")) return "ttc";
  if (normalized.includes("Structure & Thermal") || normalized.includes("STCS")) return "stcs";
  if (normalized.includes("Propulsion")) return "propulsion";
  return "unknown";
}

export function SystemPill({
  system,
  compact = false
}: {
  system: string;
  compact?: boolean;
}) {
  const normalized = normalizeSystem(system);
  const kind = systemKind(normalized);
  const Icon = SYSTEM_VISUALS[kind].icon;

  return (
    <span
      className="component-system-pill"
      data-system-kind={kind}
      title={SYSTEM_VISUALS[kind].label}
    >
      <span className="component-system-pill__icon" aria-hidden="true">
        <Icon size={compact ? 13 : 14} />
      </span>
      <span>{normalized}</span>
    </span>
  );
}

function SystemIconMark({ system }: { system: string }) {
  const kind = systemKind(system);
  const Icon = SYSTEM_VISUALS[kind].icon;
  return (
    <span className="component-system-mark" data-system-kind={kind} aria-hidden="true">
      <Icon size={18} />
    </span>
  );
}

function formatProductTrl(value: ProductService["product_trl"]) {
  return value === undefined ? "Unidentified" : String(value);
}

function alphaCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function componentRowLabel(row: ProductService) {
  return row.product_name || row.component_name || "";
}

function blankComponent(firmId: string): ComponentForm {
  const system = COMPONENT_SYSTEMS[0] ?? UNIDENTIFIED_VALUE;
  const module = modulesForSystem(system)[0] ?? UNIDENTIFIED_VALUE;
  return {
    product_id: "",
    firm_id: firmId,
    product_name: "",
    system,
    module,
    component_name: "",
    product_trl: "Unidentified",
    flight_heritage: "",
    description: "",
    record_state: "public"
  };
}

function normalizeComponentRow(row: ComponentForm): ComponentForm {
  const system = normalizeSystem(row.system);
  const module = system === UNIDENTIFIED_VALUE ? UNIDENTIFIED_VALUE : row.module;
  const componentName = system === UNIDENTIFIED_VALUE || module === UNIDENTIFIED_VALUE
    ? UNIDENTIFIED_VALUE
    : cleanComponentLabel(row.component_name);
  return {
    ...row,
    product_name: row.product_name.trim(),
    system,
    module,
    component_name: componentName,
    product_trl: row.product_trl,
    flight_heritage: row.flight_heritage?.trim() || undefined,
    description: sanitizeRichText(row.description),
    record_state: row.record_state ?? "public"
  };
}

function validateComponent(row: ComponentForm): string | null {
  if (!row.product_name.trim()) return "Product name is required.";
  if (!row.system) return "System is required.";
  if (!row.module) return "Module is required.";
  if (!row.component_name) return "Component is required.";
  if (row.product_trl !== undefined && row.product_trl !== "Unidentified") {
    const trl = Number(row.product_trl);
    if (!Number.isInteger(trl) || trl < 1 || trl > 9) return "Product TRL must be 1-9 or Unidentified.";
  }
  return null;
}

function CardDescription({ html }: { html?: string }) {
  const [open, setOpen] = useState(false);
  const safe = sanitizeRichText(html);
  if (!safe) return <div className="catalog-card__description catalog-card__description--empty">No description</div>;
  // ponytail: plain-text length heuristic instead of measuring rendered height.
  const long = richTextToPlainText(html).length > 220;
  return (
    <div>
      <div
        className={`rich-preview catalog-card__description${long && !open ? " is-clamped" : ""}`}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
      {long && (
        <button type="button" className="catalog-card__more" onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Show full description"}
        </button>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  onPress,
  icon: Icon
}: {
  label: string;
  onPress: () => void;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      className="rich-toolbar-button"
    >
      <Icon size={17} />
    </button>
  );
}

function RichTextEditor({
  value,
  onChange
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== sanitizeRichText(value)) {
      ref.current.innerHTML = sanitizeRichText(value);
    }
  }, [value]);

  function sync() {
    onChange(sanitizeRichText(ref.current?.innerHTML ?? ""));
  }

  function runCommand(command: string, value?: string) {
    const editor = ref.current;
    if (!editor) return;
    editor.focus();
    if (!editor.innerHTML.trim()) {
      editor.innerHTML = "<p><br></p>";
    }
    document.execCommand(command, false, value);
    sync();
  }

  return (
    <div className="rich-editor-shell">
      <div
        aria-label="Description formatting toolbar"
        className="rich-editor-toolbar"
      >
        <Select
          aria-label="Paragraph style"
          onChange={(event) => {
            runCommand("formatBlock", event.target.value);
          }}
          defaultValue="p"
          style={{ width: 150, minHeight: 34, fontSize: 13 }}
        >
          <option value="p">Paragraph</option>
          <option value="blockquote">Quote</option>
        </Select>
        <ToolbarButton label="Bold description text" onPress={() => runCommand("bold")} icon={Bold} />
        <ToolbarButton label="Italic description text" onPress={() => runCommand("italic")} icon={Italic} />
        <ToolbarButton label="Underline description text" onPress={() => runCommand("underline")} icon={Underline} />
        <ToolbarButton label="Bulleted list" onPress={() => runCommand("insertUnorderedList")} icon={List} />
        <ToolbarButton label="Numbered list" onPress={() => runCommand("insertOrderedList")} icon={ListOrdered} />
        <ToolbarButton label="Decrease indent" onPress={() => runCommand("outdent")} icon={Outdent} />
        <ToolbarButton label="Increase indent" onPress={() => runCommand("indent")} icon={Indent} />
        <ToolbarButton label="Undo description edit" onPress={() => runCommand("undo")} icon={RotateCcw} />
        <ToolbarButton label="Redo description edit" onPress={() => runCommand("redo")} icon={RotateCw} />
      </div>
      <div
        ref={ref}
        className="rich-editor"
        role="textbox"
        aria-label="Component description"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
      />
    </div>
  );
}

function ComponentRecordEditor({
  title,
  initial,
  onSave,
  onClose
}: {
  title: string;
  initial: ComponentForm;
  onSave: (row: ComponentForm) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ComponentForm>(() => normalizeComponentRow(initial));
  const [error, setError] = useState<string | null>(null);
  const system = form.system;
  const isSystemUnidentified = system === UNIDENTIFIED_VALUE;
  const isModuleUnidentified = form.module === UNIDENTIFIED_VALUE;
  const modules = modulesForSystem(system);
  const components = componentsForModule(system, form.module);

  function update(next: Partial<ComponentForm>) {
    setError(null);
    setForm((prev) => ({ ...prev, ...next }));
  }

  function updateSystem(nextSystem: string) {
    if (nextSystem === UNIDENTIFIED_VALUE) {
      update({ system: UNIDENTIFIED_VALUE, module: UNIDENTIFIED_VALUE, component_name: UNIDENTIFIED_VALUE });
      return;
    }
    const nextModule = modulesForSystem(nextSystem)[0] ?? "";
    update({ system: nextSystem, module: nextModule, component_name: "" });
  }

  function updateModule(nextModule: string) {
    update({ module: nextModule, component_name: nextModule === UNIDENTIFIED_VALUE ? UNIDENTIFIED_VALUE : "" });
  }

  function save() {
    const normalized = normalizeComponentRow(form);
    const error = validateComponent(normalized);
    if (error) {
      setError(error);
      return;
    }
    onSave(normalized);
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 240, damping: 24 } }
  };

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      maxWidth={1100}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save component</Button>
        </>
      }
    >
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08 } }
        }}
        className="component-editor-card"
      >
        <motion.aside variants={fadeIn} className="component-editor-card__aside" aria-label="Component classification summary">
          <div className="component-editor-card__icon" aria-hidden="true">
            <PackagePlus size={28} />
          </div>
          <div>
            <div className="component-editor-card__aside-title">Component record</div>
            <p className="component-editor-card__aside-copy">
              Enter the product name first, then classify it using the expert System, Module, and Component path.
            </p>
          </div>
          <div className="component-editor-card__summary">
            <span>Selected path</span>
            <strong className="component-editor-card__system">
              <SystemIconMark system={system || UNIDENTIFIED_VALUE} />
              {system || "No system selected"}
            </strong>
            <small>{form.module || "No module selected"}</small>
            <small>{form.component_name || "No component selected"}</small>
          </div>
          {(isSystemUnidentified || isModuleUnidentified || form.component_name === UNIDENTIFIED_VALUE) && (
            <div className="component-editor-card__note">
              <Info size={15} />
              <span>Use Unidentified only for the level you cannot classify yet. Known System values can still be saved.</span>
            </div>
          )}
        </motion.aside>

        <div className="component-editor-card__form">
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}
          <motion.div variants={fadeIn} className="component-editor-card__fields">
            <Field label="Product name" required helper="Use the product, part, or manufactured component name users will search for.">
              <Input
                value={form.product_name}
                onChange={(event) => update({ product_name: event.target.value })}
                placeholder="Type the product or manufactured part name"
              />
            </Field>
            <Field label="System" required helper="Choose the broad satellite system first.">
              <Select value={system} onChange={(event) => updateSystem(event.target.value)}>
                <option value="">Select system</option>
                {COMPONENT_SYSTEMS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Module" required helper="Module choices depend on the selected system.">
              <Select value={form.module} onChange={(event) => updateModule(event.target.value)} disabled={!system || isSystemUnidentified}>
                <option value="">Select module</option>
                {modules.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Component" required helper="Component choices depend on the selected module.">
              <Select
                value={form.component_name}
                onChange={(event) => update({ component_name: event.target.value })}
                disabled={!form.module || isSystemUnidentified}
              >
                <option value="">Select component</option>
                {components.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Product TRL (1-9)" helper="Choose Unidentified if readiness level is not known yet.">
              <Select
                value={formatProductTrl(form.product_trl)}
                onChange={(event) => {
                  const value = event.target.value;
                  update({ product_trl: value === UNIDENTIFIED_VALUE ? UNIDENTIFIED_VALUE : Number(value) });
                }}
              >
                <option value={UNIDENTIFIED_VALUE}>Unidentified</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Flight heritage" helper="Record proven use in vacuum, orbit, or space-equivalent operation.">
              <Textarea
                value={form.flight_heritage ?? ""}
                onChange={(event) => update({ flight_heritage: event.target.value })}
                placeholder="Example: Flown on LEO mission, thermal-vac qualified, no flight history yet"
                rows={3}
              />
            </Field>
            <Field label="State" helper="Draft stays in this company workspace. Public appears to other companies.">
              <Select
                value={form.record_state ?? "public"}
                onChange={(event) => update({ record_state: event.target.value as RecordState })}
              >
                <option value="draft">Draft</option>
                <option value="public">Public</option>
              </Select>
            </Field>
          </motion.div>

          <motion.div variants={fadeIn}>
            <div className="component-editor-card__description-label">
              <span>Description</span>
              <span>Rich text, saved safely</span>
            </div>
            <RichTextEditor value={form.description} onChange={(description) => update({ description })} />
            <div className="component-editor-card__help">
              Add technical notes, usage, capability, or uncertainty. Exports convert this field to plain text.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
}

export function ComponentRecordsPanel({
  rows,
  firmId,
  canManage
}: {
  rows: ProductService[];
  firmId: string;
  canManage?: boolean;
}) {
  const role = useRole();
  const permissions = rolePermissions(role);
  const canEditRows = canManage ?? permissions.canEdit;

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductService | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name:asc");

  const groups = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) =>
          [
            row.product_id,
            row.product_name,
            row.system,
            row.module,
            row.component_name,
            formatProductTrl(row.product_trl),
            row.record_state ?? "public",
            row.flight_heritage,
            richTextToPlainText(row.description)
          ].some((value) => String(value ?? "").toLowerCase().includes(needle))
        )
      : rows;

    const trlNum = (r: ProductService) => (typeof r.product_trl === "number" ? r.product_trl : -1);
    const idNum = (r: ProductService) => Number(r.product_id.replace(/\D+/g, "")) || 0;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortMode) {
        case "name:desc":
          return alphaCompare(componentRowLabel(b), componentRowLabel(a));
        case "trl:desc":
          return trlNum(b) - trlNum(a) || alphaCompare(componentRowLabel(a), componentRowLabel(b));
        case "trl:asc":
          return trlNum(a) - trlNum(b) || alphaCompare(componentRowLabel(a), componentRowLabel(b));
        case "newest":
          return idNum(b) - idNum(a);
        default:
          return alphaCompare(componentRowLabel(a), componentRowLabel(b));
      }
    });

    const map = new Map<string, ProductService[]>();
    for (const row of sorted) {
      const system = normalizeSystem(row.system);
      map.set(system, [...(map.get(system) ?? []), row]);
    }
    return [...map.entries()].sort(([a], [b]) => alphaCompare(a, b));
  }, [rows, searchTerm, sortMode]);

  const visibleCount = groups.reduce((sum, [, groupRows]) => sum + groupRows.length, 0);

  function create(row: ComponentForm) {
    const db = loadDb();
    const id = nextId("P", db.products as unknown as Record<string, unknown>[], "product_id");
    const saved = { ...row, product_id: id, firm_id: firmId, record_state: row.record_state ?? "public" };
    commit({ action: "create", table: "products", id, summary: `Added component ${row.product_name}`, firmId }, (d) => {
      d.products.push(saved);
    });
    setCreating(false);
  }

  function update(row: ComponentForm) {
    commit({ action: "update", table: "products", id: row.product_id, summary: `Updated component ${row.product_name}`, firmId }, (d) => {
      const index = d.products.findIndex((component) => component.product_id === row.product_id && component.firm_id === firmId);
      if (index >= 0) d.products[index] = { ...row, firm_id: firmId, record_state: row.record_state ?? "public" };
    });
    setEditing(null);
  }

  function setRecordState(row: ProductService, recordState: RecordState) {
    commit({ action: "update", table: "products", id: row.product_id, summary: `Set component ${row.product_name} ${recordState}`, firmId }, (d) => {
      const index = d.products.findIndex((component) => component.product_id === row.product_id && component.firm_id === firmId);
      if (index >= 0) d.products[index] = { ...d.products[index], record_state: recordState };
    });
  }

  function remove(row: ProductService) {
    if (!confirm(`Delete component ${row.product_name || row.product_id}?`)) return;
    commit({ action: "delete", table: "products", id: row.product_id, summary: `Deleted component ${row.product_name}`, firmId }, (d) => {
      const index = d.products.findIndex((component) => component.product_id === row.product_id && component.firm_id === firmId);
      if (index >= 0) d.products.splice(index, 1);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="component-table-card">
        <div className="component-table-card__bar">
          <span className="component-table-card__count">
            {visibleCount} of {rows.length} record{rows.length === 1 ? "" : "s"}
          </span>
          <div className="component-table-card__actions">
            <label className="component-table-card__search">
              <Search size={15} aria-hidden="true" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search components..."
                aria-label="Search component records"
                style={{ borderWidth: 0, boxShadow: "none", paddingLeft: 4, minWidth: 220 }}
              />
            </label>
            <div className="catalog-sort">
              <Select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                aria-label="Sort components"
                style={{ minHeight: 40 }}
              >
                <option value="name:asc">Name A-Z</option>
                <option value="name:desc">Name Z-A</option>
                <option value="trl:desc">TRL high to low</option>
                <option value="trl:asc">TRL low to high</option>
                <option value="newest">Newest first</option>
              </Select>
            </div>
            {canEditRows ? (
              <Button onClick={() => setCreating(true)} style={{ minHeight: 40 }}>
                Add component
              </Button>
            ) : (
              <Badge>Read-only</Badge>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState message={canEditRows ? "Add a component with a product name, taxonomy path, and description." : "No component records yet."} />
        ) : visibleCount === 0 ? (
          <EmptyState message="No component records match your search." />
        ) : (
          <div className="catalog-body">
            {groups.map(([system, groupRows]) => (
              <section key={system} className="catalog-section" aria-label={`${system} components`}>
                <div className="catalog-section__header">
                  <SystemIconMark system={system} />
                  <h3>{system}</h3>
                  <span>{groupRows.length} component{groupRows.length === 1 ? "" : "s"}</span>
                </div>
                <div className="catalog-grid">
                  {groupRows.map((row) => {
                    const label = row.product_name || row.component_name;
                    const isPublic = (row.record_state ?? "public") === "public";
                    return (
                      <article key={row.product_id} className="catalog-card" data-state={isPublic ? "public" : "draft"}>
                        <div className="catalog-card__head">
                          <div className="catalog-card__title">
                            <strong>{label}</strong>
                            <div className="catalog-card__path">{row.module} › {row.component_name}</div>
                          </div>
                          <code className="catalog-card__id">{row.product_id}</code>
                        </div>
                        <div className="catalog-card__badges">
                          <Badge tone={typeof row.product_trl === "number" ? "accent" : "warn"}>
                            TRL {formatProductTrl(row.product_trl)}
                          </Badge>
                          {canEditRows ? (
                            <div style={{ width: 112 }}>
                              <Select
                                value={row.record_state ?? "public"}
                                onChange={(event) => setRecordState(row, event.target.value as RecordState)}
                                aria-label={`State for ${label}`}
                                style={{ minHeight: 32, padding: "4px 10px", fontSize: 12 }}
                              >
                                <option value="draft">Draft</option>
                                <option value="public">Public</option>
                              </Select>
                            </div>
                          ) : (
                            <Badge tone={isPublic ? "success" : "warn"}>{isPublic ? "Public" : "Draft"}</Badge>
                          )}
                        </div>
                        {row.flight_heritage && (
                          <div className="catalog-card__heritage">
                            <Rocket size={13} aria-hidden="true" />
                            <span>{row.flight_heritage}</span>
                          </div>
                        )}
                        <CardDescription html={row.description} />
                        {canEditRows && (
                          <div className="catalog-card__actions">
                            <Button
                              variant="secondary"
                              onClick={() => setEditing(row)}
                              ariaLabel={`Edit ${label}`}
                              title="Edit component"
                              style={{ minHeight: 36, padding: "7px 12px" }}
                            >
                              <Pencil size={14} />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => remove(row)}
                              ariaLabel={`Delete ${label}`}
                              title="Delete component"
                              style={{ minHeight: 36, padding: "7px 10px", color: "var(--danger)" }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <ComponentRecordEditor
          title="Add component"
          initial={blankComponent(firmId)}
          onSave={create}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <ComponentRecordEditor
          title="Edit component"
          initial={editing}
          onSave={update}
          onClose={() => setEditing(null)}
        />
      )}

    </div>
  );
}
