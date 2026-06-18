"use client";

import React from "react";
import { useRole } from "@/lib/store";
import { roleAtLeast, type Role } from "@/lib/schema";
import { Badge as ShadBadge } from "@/components/ui/badge";
import { Button as ShadButton } from "@/components/ui/button";
import { Card as ShadCard } from "@/components/ui/card";
import { Input as ShadInput } from "@/components/ui/input";
import { NativeSelect as ShadNativeSelect } from "@/components/ui/native-select";
import { Textarea as ShadTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <ShadCard
      className={cn("satdb-card", className)}
      style={{
        display: "block",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 20,
        boxShadow: "var(--shadow)"
      }}
    >
      {children}
    </ShadCard>
  );
}

export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>{children}</h2>
      {hint && (
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  title,
  ariaLabel,
  className = "",
  style
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: BtnVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const palette: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      background: "var(--primary)",
      color: "#fff",
      borderColor: "color-mix(in srgb, var(--primary) 86%, #fff)",
      boxShadow: "0 5px 12px rgba(18, 49, 95, 0.24)"
    },
    secondary: {
      background: "color-mix(in srgb, var(--primary) 7%, var(--surface))",
      color: "var(--primary-strong)",
      borderColor: "color-mix(in srgb, var(--primary) 22%, var(--line))",
      boxShadow: "0 3px 8px rgba(16, 24, 40, 0.08)"
    },
    ghost: {
      background: "color-mix(in srgb, var(--surface-muted) 72%, transparent)",
      color: "var(--ink)",
      borderColor: "transparent",
      boxShadow: "none"
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      borderColor: "color-mix(in srgb, var(--danger) 86%, #fff)",
      boxShadow: "0 5px 12px rgba(180, 35, 24, 0.22)"
    }
  };
  const shadVariant: Record<BtnVariant, React.ComponentProps<typeof ShadButton>["variant"]> = {
    primary: "default",
    secondary: "outline",
    ghost: "ghost",
    danger: "destructive"
  };
  return (
    <ShadButton
      type={type}
      title={title}
      aria-label={ariaLabel}
      variant={shadVariant[variant]}
      className={cn("satdb-button", className)}
      data-variant={variant}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...palette[variant],
        borderStyle: "solid",
        borderWidth: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "9px 14px",
        borderRadius: 10,
        fontWeight: 500,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform 220ms var(--ease-out-expo), box-shadow 240ms var(--ease-out-quint), border-color 220ms var(--ease-out-quint), background-color 220ms var(--ease-out-quint), color 180ms var(--ease-out-quint)",
        ...style,
        minHeight: 44
      }}
    >
      <span className="satdb-button__content">{children}</span>
    </ShadButton>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <ShadInput
      {...props}
      className={cn("satdb-input", props.className)}
      style={{
        width: "100%",
        minHeight: 44,
        padding: "9px 12px",
        border: "1px solid var(--line)",
        borderRadius: 10,
        background: "var(--surface)",
        color: "var(--ink)",
        fontSize: 14,
        ...props.style
      }}
    />
  );
}

export function Select({ size: _htmlSize, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <ShadNativeSelect
      {...props}
      className={cn("satdb-input", props.className)}
      style={{
        width: "100%",
        minHeight: 44,
        padding: "9px 12px",
        border: "1px solid var(--line)",
        borderRadius: 10,
        background: "var(--surface)",
        color: "var(--ink)",
        fontSize: 14,
        ...props.style
      }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <ShadTextarea
      {...props}
      className={cn("satdb-input", props.className)}
      style={{
        width: "100%",
        minHeight: 120,
        padding: "9px 12px",
        border: "1px solid var(--line)",
        borderRadius: 10,
        background: "var(--surface)",
        color: "var(--ink)",
        fontSize: 14,
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        ...props.style
      }}
    />
  );
}

export function Field({
  label,
  children,
  required,
  helper
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  helper?: string;
}) {
  const generatedId = React.useId();
  const helperId = helper ? `${generatedId}-helper` : undefined;
  const control = React.isValidElement<{ id?: string; "aria-describedby"?: string }>(children)
    ? React.cloneElement(children, {
        id: children.props.id ?? generatedId,
        "aria-describedby": children.props["aria-describedby"] ?? helperId
      })
    : children;
  const controlId = React.isValidElement<{ id?: string }>(control) ? control.props.id : generatedId;

  return (
    <div style={{ display: "block" }}>
      <label htmlFor={controlId} style={{ display: "block", fontSize: 12, color: "var(--ink-soft)", marginBottom: 6, fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </label>
      {control}
      {helper && <div id={helperId} style={{ marginTop: 6, color: "var(--muted)", fontSize: 12, lineHeight: 1.45 }}>{helper}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "warn" | "danger" | "success";
}) {
  const tones: Record<string, React.CSSProperties> = {
    neutral: { background: "var(--surface-muted)", color: "var(--ink-soft)" },
    accent: { background: "var(--accent-soft)", color: "var(--accent)" },
    warn: { background: "var(--warn-soft)", color: "var(--warn)" },
    danger: { background: "var(--danger-soft)", color: "var(--danger)" },
    success: { background: "var(--success-soft)", color: "var(--success)" }
  };
  return (
    <ShadBadge
      variant={tone === "danger" ? "destructive" : tone === "neutral" ? "secondary" : "outline"}
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        ...tones[tone]
      }}
    >
      {children}
    </ShadBadge>
  );
}

export function Stat({ label, value, hint, className = "", accent }: { label: string; value: React.ReactNode; hint?: string; className?: string; accent?: string }) {
  return (
    <Card className={className}>
      {accent && (
        <div style={{ height: 3, width: 36, background: accent, borderRadius: 999, marginBottom: 10 }} />
      )}
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6, color: "var(--ink)" }} className="tabular">
        {value}
      </div>
      {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{hint}</div>}
    </Card>
  );
}

export function Grid({ cols, gap = 16, children, style }: { cols: number; gap?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const { gridTemplateColumns, ...restStyle } = style ?? {};
  const gridStyle = {
    "--grid-cols": String(cols),
    "--grid-template": gridTemplateColumns ?? `repeat(${cols}, minmax(0, 1fr))`
  } as React.CSSProperties;

  return (
    <div
      className="responsive-grid"
      style={{
        ...gridStyle,
        display: "grid",
        gridTemplateColumns: "var(--grid-template)",
        gap,
        ...restStyle
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>{message}</div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidth = 560
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number | string;
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(16,24,40,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: 14,
          padding: 22,
          width: "100%",
          maxWidth,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 30px 70px rgba(16,24,40,0.25)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 id="modal-title" style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{title}</h3>
          <Button variant="ghost" onClick={onClose} ariaLabel={`Close ${title}`} style={{ padding: "4px 10px" }}>
            Close
          </Button>
        </div>
        <div>{children}</div>
        {footer && <div className="modal-footer" style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

type TableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string | number;
};

export function Table<T>({
  rows,
  columns,
  empty = "No data",
  getRowKey
}: {
  rows: T[];
  columns: TableColumn<T>[];
  empty?: string;
  getRowKey?: (row: T, index: number) => React.Key;
}) {
  if (rows.length === 0) return <EmptyState message={empty} />;
  const primaryColumn = columns.find((column) => column.header.trim()) ?? columns[0];
  const actionColumns = columns.filter((column) => !column.header.trim() || column.key === "actions" || column.key === "_actions");
  const detailColumns = columns.filter((column) => column !== primaryColumn && !actionColumns.includes(column));
  return (
    <>
      <div className="table-scroll" style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table className="data-table" style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line)" }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  width: c.width
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={getRowKey?.(r, i) ?? i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: "10px 12px", color: "var(--ink)", verticalAlign: "top" }}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <div className="mobile-record-list" aria-label="Records">
        {rows.map((row, index) => (
          <article className="mobile-record-card" key={getRowKey?.(row, index) ?? index}>
            <div className="mobile-record-card__primary">
              {primaryColumn.render(row)}
            </div>
            {detailColumns.length > 0 && (
              <dl className="mobile-record-card__details">
                {detailColumns.map((column) => (
                  <div key={column.key} className="mobile-record-card__field">
                    <dt>{column.header}</dt>
                    <dd>{column.render(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actionColumns.length > 0 && (
              <div className="mobile-record-card__actions">
                {actionColumns.map((column) => (
                  <React.Fragment key={column.key}>{column.render(row)}</React.Fragment>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

export function RequireRole({
  min,
  fallback = null,
  children
}: {
  min: Role;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const role = useRole();
  if (!roleAtLeast(role, min)) return <>{fallback}</>;
  return <>{children}</>;
}

export function LockedNote({ min }: { min: Role }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "var(--warn-soft)",
        color: "var(--warn)",
        borderRadius: 10,
        fontSize: 13,
        border: "1px dashed var(--warn)"
      }}
    >
      Locked: requires <strong>{min}</strong> role. Use the correct entry link.
    </div>
  );
}

export function Heatmap({
  rows,
  cols,
  values,
  onCellClick,
  legend
}: {
  rows: string[];
  cols: string[];
  values: (r: string, c: string) => { value: number; tooltip?: string };
  onCellClick?: (r: string, c: string, value: number) => void;
  legend?: string;
}) {
  const allValues = rows.flatMap((r) => cols.map((c) => values(r, c).value));
  const max = Math.max(...allValues, 1);
  function color(v: number) {
    if (v === 0) return "var(--surface-muted)";
    const t = v / max;
    const r = Math.round(232 - t * 100);
    const g = Math.round(246 - t * 130);
    const b = Math.round(243 - t * 80);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: "6px 10px", textAlign: "left" }}></th>
            {cols.map((c) => (
              <th key={c} style={{ padding: "6px 10px", textAlign: "center", fontWeight: 600, color: "var(--ink-soft)" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td style={{ padding: "6px 12px 6px 0", fontWeight: 500, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>{r}</td>
              {cols.map((c) => {
                const cell = values(r, c);
                return (
                  <td
                    key={c}
                    title={cell.tooltip ?? `${r} Ã— ${c}: ${cell.value}`}
                    onClick={onCellClick ? () => onCellClick(r, c, cell.value) : undefined}
                    style={{
                      width: 90,
                      height: 44,
                      textAlign: "center",
                      background: color(cell.value),
                      color: cell.value === 0 ? "var(--muted)" : "var(--ink)",
                      cursor: onCellClick ? "pointer" : "default",
                      border: "1px solid var(--surface)",
                      borderRadius: 6,
                      fontWeight: cell.value === 0 ? 400 : 600,
                      verticalAlign: "middle"
                    }}
                  >
                    {cell.value === 0 ? "â€”" : cell.value.toFixed(0)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {legend && <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)" }}>{legend}</div>}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange
}: {
  tabs: {
    key: string;
    label: string;
    hint?: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;
  }[];
  active: string;
  onChange: (key: string) => void;
}) {
  function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, nextIndex: number) {
    const buttons = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="tab"]') ?? []
    );
    const next = buttons[nextIndex];
    if (!next) return;
    onChange(tabs[nextIndex].key);
    window.requestAnimationFrame(() => next.focus());
  }

  return (
    <div
      role="tablist"
      aria-label="Company detail sections"
      className="company-tabs no-scrollbar"
    >
      {tabs.map((t, index) => {
        const isActive = t.key === active;
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange(t.key)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveFocus(event, (index + 1) % tabs.length);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveFocus(event, (index - 1 + tabs.length) % tabs.length);
              }
              if (event.key === "Home") {
                event.preventDefault();
                moveFocus(event, 0);
              }
              if (event.key === "End") {
                event.preventDefault();
                moveFocus(event, tabs.length - 1);
              }
            }}
            title={t.hint}
            className="company-tabs__trigger"
            data-active={isActive ? "true" : "false"}
          >
            {Icon && <Icon size={16} strokeWidth={2} aria-hidden="true" />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
