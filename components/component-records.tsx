"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Bold,
  CircleHelp,
  ChevronDown,
  ChevronRight,
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
import { rolePermissions, type ProductService } from "@/lib/schema";
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
type ComponentSortKey = "product_name" | "system" | "module" | "component_name" | "product_trl" | "description";
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

function SystemPill({
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
    description: ""
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
    description: sanitizeRichText(row.description)
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

function RichDescriptionPreview({ html }: { html?: string }) {
  const safe = sanitizeRichText(html);
  if (!safe) return <span style={{ color: "var(--muted)" }}>No description</span>;
  return (
    <div
      className="rich-preview rich-description-preview"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

function SortHead({
  label,
  column,
  active,
  direction,
  onSort
}: {
  label: string;
  column: ComponentSortKey;
  active: ComponentSortKey;
  direction: "asc" | "desc";
  onSort: (column: ComponentSortKey) => void;
}) {
  return (
    <button
      type="button"
      className="component-table__sort"
      onClick={() => onSort(column)}
      aria-label={`Sort components by ${label}`}
    >
      <span>{label}</span>
      <span aria-hidden="true" className="component-table__sort-icon">
        {active === column ? (direction === "asc" ? "↑" : "↓") : <ArrowUpDown size={13} />}
      </span>
    </button>
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
  firmId
}: {
  rows: ProductService[];
  firmId: string;
}) {
  const role = useRole();
  const permissions = rolePermissions(role);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductService | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<ComponentSortKey>("product_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());

  const grouped = useMemo(() => {
    const map: Record<string, Record<string, ProductService[]>> = {};
    for (const row of rows) {
      const system = normalizeSystem(row.system);
      const module = row.module || UNIDENTIFIED_VALUE;
      if (!map[system]) map[system] = {};
      if (!map[system][module]) map[system][module] = [];
      map[system][module].push(row);
    }
    return map;
  }, [rows]);

  const visibleRows = useMemo(() => {
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
            row.flight_heritage,
            richTextToPlainText(row.description)
          ].some((value) => String(value ?? "").toLowerCase().includes(needle))
        )
      : rows;

    return [...filtered].sort((a, b) => {
      const aValue = sortColumn === "description" ? richTextToPlainText(a.description) : sortColumn === "product_trl" ? formatProductTrl(a.product_trl) : a[sortColumn];
      const bValue = sortColumn === "description" ? richTextToPlainText(b.description) : sortColumn === "product_trl" ? formatProductTrl(b.product_trl) : b[sortColumn];
      const result = String(aValue ?? "").localeCompare(String(bValue ?? ""), undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? result : -result;
    });
  }, [rows, searchTerm, sortColumn, sortDirection]);

  function sortBy(column: ComponentSortKey) {
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumn(column);
    setSortDirection("asc");
  }

  function toggleRow(productId: string) {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function create(row: ComponentForm) {
    const db = loadDb();
    const id = nextId("P", db.products as unknown as Record<string, unknown>[], "product_id");
    const saved = { ...row, product_id: id, firm_id: firmId };
    commit({ action: "create", table: "products", id, summary: `Added component ${row.product_name}`, firmId }, (d) => {
      d.products.push(saved);
    });
    setCreating(false);
  }

  function update(row: ComponentForm) {
    commit({ action: "update", table: "products", id: row.product_id, summary: `Updated component ${row.product_name}`, firmId }, (d) => {
      const index = d.products.findIndex((component) => component.product_id === row.product_id);
      if (index >= 0) d.products[index] = { ...row, firm_id: firmId };
    });
    setEditing(null);
  }

  function remove(row: ProductService) {
    if (!confirm(`Delete component ${row.product_name || row.product_id}?`)) return;
    commit({ action: "delete", table: "products", id: row.product_id, summary: `Deleted component ${row.product_name}`, firmId }, (d) => {
      const index = d.products.findIndex((component) => component.product_id === row.product_id);
      if (index >= 0) d.products.splice(index, 1);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="component-table-card">
        <div className="component-table-card__bar">
          <span className="component-table-card__count">
            {visibleRows.length} of {rows.length} record{rows.length === 1 ? "" : "s"}
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
            <label className="component-table-card__mobile-sort">
              <span>Sort</span>
              <Select
                value={`${sortColumn}:${sortDirection}`}
                onChange={(event) => {
                  const [column, direction] = event.target.value.split(":") as [ComponentSortKey, "asc" | "desc"];
                  setSortColumn(column);
                  setSortDirection(direction);
                }}
              >
                <option value="product_name:asc">Product A-Z</option>
                <option value="product_name:desc">Product Z-A</option>
                <option value="system:asc">System A-Z</option>
                <option value="module:asc">Module A-Z</option>
                <option value="component_name:asc">Component A-Z</option>
                <option value="product_trl:asc">TRL 1-9</option>
                <option value="description:asc">Description A-Z</option>
              </Select>
            </label>
            {permissions.canAddComponent ? (
              <Button onClick={() => setCreating(true)} style={{ minHeight: 40 }}>
                Add component
              </Button>
            ) : (
              <Badge>Read-only</Badge>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState message={permissions.canAddComponent ? "Add a component with a product name, taxonomy path, and description." : "No component records yet."} />
        ) : visibleRows.length === 0 ? (
          <EmptyState message="No component records match your search." />
        ) : (
          <>
            <div className="component-table-wrap">
              <table className="component-table">
                <thead>
                  <tr>
                    <th className="component-table__product-column">
                      <SortHead label="Product" column="product_name" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                    </th>
                    <th className="component-table__classification-column">
                      <SortHead label="Classification" column="system" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                    </th>
                    <th className="component-table__trl-column">
                      <SortHead label="TRL" column="product_trl" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                    </th>
                    {(permissions.canEdit || permissions.canDelete) && <th className="component-table__actions-column">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => {
                    const expanded = expandedRows.has(row.product_id);
                    const columnCount = permissions.canEdit || permissions.canDelete ? 4 : 3;
                    return (
                      <Fragment key={row.product_id}>
                        <tr data-expanded={expanded ? "true" : "false"}>
                          <td className="component-table__product">
                            <div className="component-table__product-cell">
                              <button
                                type="button"
                                className="component-table__expand"
                                aria-label={`${expanded ? "Hide" : "Show"} details for ${row.product_name || row.component_name}`}
                                aria-expanded={expanded}
                                onClick={() => toggleRow(row.product_id)}
                              >
                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                              <div>
                                <strong>{row.product_name || row.component_name}</strong>
                                <code>{row.product_id}</code>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="component-table__classification">
                              <SystemPill system={row.system} />
                              <span>{row.module}</span>
                              <small>{row.component_name}</small>
                            </div>
                          </td>
                          <td className="component-table__trl">
                            <span
                              className="component-trl"
                              data-known={row.product_trl === "Unidentified" || row.product_trl === undefined ? "false" : "true"}
                            >
                              TRL {formatProductTrl(row.product_trl)}
                            </span>
                          </td>
                          {(permissions.canEdit || permissions.canDelete) && (
                            <td>
                              <div className="component-table__actions">
                                {permissions.canEdit && (
                                  <Button
                                    variant="secondary"
                                    onClick={() => setEditing(row)}
                                    ariaLabel={`Edit ${row.product_name || row.component_name}`}
                                    title="Edit component"
                                    style={{ minHeight: 36, padding: "7px 10px" }}
                                  >
                                    <Pencil size={15} />
                                    Edit
                                  </Button>
                                )}
                                {permissions.canDelete && (
                                  <Button
                                    variant="ghost"
                                    onClick={() => remove(row)}
                                    ariaLabel={`Delete ${row.product_name || row.component_name}`}
                                    title="Delete component"
                                    style={{ minHeight: 36, padding: 8, color: "var(--danger)" }}
                                  >
                                    <Trash2 size={15} />
                                  </Button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                        {expanded && (
                          <tr className="component-table__details-row">
                            <td colSpan={columnCount}>
                              <div className="component-table__details-grid">
                                <section>
                                  <span>Description</span>
                                  <RichDescriptionPreview html={row.description} />
                                </section>
                                <section>
                                  <span>Flight heritage</span>
                                  <p>{row.flight_heritage || "No flight heritage recorded."}</p>
                                </section>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="component-record-list" aria-label="Component records">
              {visibleRows.map((row) => (
                <article key={row.product_id} className="component-record-card">
                  <div className="component-record-card__title">{row.product_name || row.component_name}</div>
                  <div className="component-record-card__meta">
                    <code>{row.product_id}</code>
                    <SystemPill system={row.system} compact />
                  </div>
                  <div className="component-record-card__path">
                    <Badge>{row.module}</Badge>
                    <Badge>{row.component_name}</Badge>
                    <Badge tone={row.product_trl === "Unidentified" || row.product_trl === undefined ? "warn" : "accent"}>
                      TRL {formatProductTrl(row.product_trl)}
                    </Badge>
                  </div>
                  {row.flight_heritage && (
                    <div className="component-record-card__heritage">
                      <strong>Flight heritage</strong>
                      <span>{row.flight_heritage}</span>
                    </div>
                  )}
                  <div className="component-record-card__description">
                    <RichDescriptionPreview html={row.description} />
                  </div>
                  {(permissions.canEdit || permissions.canDelete) && (
                    <div className="component-record-card__actions">
                      {permissions.canEdit && (
                        <Button
                          variant="secondary"
                          onClick={() => setEditing(row)}
                          ariaLabel={`Edit ${row.product_name || row.component_name}`}
                          title="Edit component"
                        >
                          <Pencil size={16} />
                          Edit
                        </Button>
                      )}
                      {permissions.canDelete && (
                        <Button
                          variant="ghost"
                          onClick={() => remove(row)}
                          ariaLabel={`Delete ${row.product_name || row.component_name}`}
                          title="Delete component"
                          style={{ color: "var(--danger)" }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
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

      {rows.length > 0 && (
        <div className="component-summary-list">
          <div className="component-summary-intro">
            <h3>System coverage</h3>
            <p>Components grouped by satellite system and module.</p>
          </div>
          {Object.entries(grouped).sort(([a], [b]) => alphaCompare(a, b)).map(([system, modules]) => {
            const systemRows = Object.values(modules).flat();
            return (
              <section key={system} className="component-summary-section">
                <div className="component-summary-section__header">
                  <div className="component-summary-heading">
                    <SystemIconMark system={system} />
                    <span>{system}</span>
                  </div>
                  <div className="component-summary-section__counts">
                    <div className="component-summary-metric">
                      <strong>{systemRows.length}</strong>
                      <span>component{systemRows.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="component-summary-metric">
                      <strong>{Object.keys(modules).length}</strong>
                      <span>module{Object.keys(modules).length === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                </div>
                <div className="component-summary-section__body">
                  {Object.entries(modules).sort(([a], [b]) => alphaCompare(a, b)).map(([module, moduleRows]) => (
                    <div key={module} className="component-summary-module">
                      <div className="component-summary-module__title">{module}</div>
                      <div className="component-summary-module__rows">
                        {[...moduleRows].sort((a, b) => alphaCompare(componentRowLabel(a), componentRowLabel(b))).map((row) => (
                          <div key={row.product_id} className="component-summary-row">
                            <div className="component-summary-row__main">
                              <div className="component-summary-row__name">{row.product_name || row.component_name}</div>
                              <div className="component-summary-row__component">{row.component_name}</div>
                            </div>
                            <div className="component-summary-row__description">{richTextToPlainText(row.description).slice(0, 180) || "No description"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
