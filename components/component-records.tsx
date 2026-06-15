"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Bold,
  Italic,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Pencil,
  RotateCcw,
  RotateCw,
  Search,
  Trash2,
  Underline,
  Info,
  PackagePlus
} from "lucide-react";
import { commit, loadDb, nextId, useRole } from "@/lib/store";
import { roleAtLeast, type ProductService } from "@/lib/schema";
import {
  COMPONENT_SYSTEMS,
  UNIDENTIFIED_VALUE,
  cleanComponentLabel,
  componentsForModule,
  modulesForSystem,
  normalizeSystem
} from "@/lib/component-taxonomy";
import { richTextToPlainText, sanitizeRichText } from "@/lib/rich-text";
import { Badge, Button, EmptyState, Field, Input, Modal, Select } from "./ui";

type ComponentForm = ProductService;
type ComponentSortKey = "product_name" | "system" | "module" | "component_name" | "description";

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
    description: sanitizeRichText(row.description)
  };
}

function validateComponent(row: ComponentForm): string | null {
  if (!row.product_name.trim()) return "Product name is required.";
  if (!row.system) return "System is required.";
  if (!row.module) return "Module is required.";
  if (!row.component_name) return "Component is required.";
  return null;
}

function RichDescriptionPreview({ html }: { html?: string }) {
  const safe = sanitizeRichText(html);
  if (!safe) return <span style={{ color: "var(--muted)" }}>No description</span>;
  return (
    <div
      className="rich-preview"
      style={{
        color: "var(--ink-soft)",
        fontSize: 13,
        lineHeight: 1.5,
        maxHeight: 62,
        overflow: "hidden"
      }}
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
      style={{
        width: 44,
        height: 44,
        border: "1px solid transparent",
        borderRadius: 8,
        background: "transparent",
        color: "var(--ink-soft)",
        display: "inline-grid",
        placeItems: "center",
        cursor: "pointer"
      }}
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
    <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "var(--surface)" }}>
      <div
        aria-label="Description formatting toolbar"
        style={{
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
          padding: "6px 8px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface-muted)"
        }}
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
        style={{
          minHeight: 230,
          padding: 14,
          outline: "none",
          lineHeight: 1.65,
          color: "var(--ink)",
          fontSize: 14
        }}
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
            <strong>{system || "No system selected"}</strong>
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
  const canEdit = roleAtLeast(role, "Analyst");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ProductService | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<ComponentSortKey>("product_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
            richTextToPlainText(row.description)
          ].some((value) => String(value ?? "").toLowerCase().includes(needle))
        )
      : rows;

    return [...filtered].sort((a, b) => {
      const aValue = sortColumn === "description" ? richTextToPlainText(a.description) : a[sortColumn];
      const bValue = sortColumn === "description" ? richTextToPlainText(b.description) : b[sortColumn];
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
          <div>
            <strong style={{ fontSize: 16 }}>Component Records</strong>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              Product names mapped to expert System, Module, and Component categories.
            </div>
          </div>
          <div className="component-table-card__actions">
            <label className="component-table-card__search">
              <Search size={15} aria-hidden="true" />
              <Input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search components..."
                aria-label="Search component records"
                style={{ border: 0, boxShadow: "none", paddingLeft: 4, minWidth: 220 }}
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
                <option value="description:asc">Description A-Z</option>
              </Select>
            </label>
            {canEdit ? (
              <Button variant="secondary" onClick={() => setCreating(true)} style={{ minHeight: 40 }}>
                Add component
              </Button>
            ) : (
              <Badge>Read-only</Badge>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
        <EmptyState message="Add a component with a product name, taxonomy path, and description." />
        ) : visibleRows.length === 0 ? (
          <EmptyState message="No component records match your search." />
        ) : (
          <>
            <div className="component-table-wrap">
              <table className="component-table">
              <thead>
                <tr>
                  <th>
                    <SortHead label="Product" column="product_name" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                  </th>
                  <th>
                    <SortHead label="System" column="system" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                  </th>
                  <th>
                    <SortHead label="Module" column="module" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                  </th>
                  <th>
                    <SortHead label="Component" column="component_name" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                  </th>
                  <th>
                    <SortHead label="Description" column="description" active={sortColumn} direction={sortDirection} onSort={sortBy} />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.product_id}>
                    <td className="component-table__product">
                      <div>{row.product_name || row.component_name}</div>
                      <code>{row.product_id}</code>
                    </td>
                    <td>
                      <Badge tone={normalizeSystem(row.system) === UNIDENTIFIED_VALUE ? "warn" : "accent"}>
                        {normalizeSystem(row.system)}
                      </Badge>
                    </td>
                    <td>
                      <span className="component-table__wrap">{row.module}</span>
                    </td>
                    <td>
                      <span className="component-table__wrap">{row.component_name}</span>
                    </td>
                    <td className="component-table__description">
                      <RichDescriptionPreview html={row.description} />
                    </td>
                    <td>
                      <div className="component-table__actions">
                        <Button
                          variant="ghost"
                          onClick={() => setEditing(row)}
                          disabled={!canEdit}
                          ariaLabel={`Edit ${row.product_name || row.component_name}`}
                          title="Edit component"
                          style={{ padding: 8 }}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => remove(row)}
                          disabled={!canEdit}
                          ariaLabel={`Delete ${row.product_name || row.component_name}`}
                          title="Delete component"
                          style={{ padding: 8, color: "var(--danger)" }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            <div className="component-record-list" aria-label="Component records">
            {visibleRows.map((row) => (
              <article key={row.product_id} className="component-record-card">
                <div className="component-record-card__title">{row.product_name || row.component_name}</div>
                <div className="component-record-card__meta">
                  <code>{row.product_id}</code>
                  <Badge tone={normalizeSystem(row.system) === UNIDENTIFIED_VALUE ? "warn" : "accent"}>
                    {normalizeSystem(row.system)}
                  </Badge>
                </div>
                <div className="component-record-card__path">
                  <Badge>{row.module}</Badge>
                  <Badge>{row.component_name}</Badge>
                </div>
                <div className="component-record-card__description">
                  <RichDescriptionPreview html={row.description} />
                </div>
                <div className="component-record-card__actions">
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(row)}
                    disabled={!canEdit}
                    ariaLabel={`Edit ${row.product_name || row.component_name}`}
                    title="Edit component"
                  >
                    <Pencil size={16} />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => remove(row)}
                    disabled={!canEdit}
                    ariaLabel={`Delete ${row.product_name || row.component_name}`}
                    title="Delete component"
                    style={{ color: "var(--danger)" }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(grouped).map(([system, modules]) => {
            const systemRows = Object.values(modules).flat();
            return (
              <section key={system} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 14px",
                    background: "var(--surface-muted)",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ fontWeight: 650 }}>{system}</div>
                  <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge tone={system === UNIDENTIFIED_VALUE ? "warn" : "accent"}>{systemRows.length} component{systemRows.length === 1 ? "" : "s"}</Badge>
                    <Badge>{Object.keys(modules).length} module{Object.keys(modules).length === 1 ? "" : "s"}</Badge>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {Object.entries(modules).map(([module, moduleRows]) => (
                    <div key={module} style={{ padding: 14, borderTop: "1px solid var(--line-soft)" }}>
                      <div style={{ fontWeight: 600, color: "var(--ink-soft)", marginBottom: 10 }}>{module}</div>
                      <div style={{ display: "grid", gap: 8 }}>
                        {moduleRows.map((row) => (
                          <div key={row.product_id} className="component-summary-row" style={{ display: "grid", gridTemplateColumns: "minmax(180px, 0.8fr) minmax(220px, 1fr)", gap: 12 }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{row.product_name || row.component_name}</div>
                              <div style={{ fontSize: 12, color: "var(--muted)" }}>{row.component_name}</div>
                            </div>
                            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{richTextToPlainText(row.description).slice(0, 180) || "No description"}</div>
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
