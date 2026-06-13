"use client";

import React from "react";
import { useRole } from "@/lib/store";
import { roleAtLeast, type Role } from "@/lib/schema";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 20,
        boxShadow: "var(--shadow)"
      }}
    >
      {children}
    </div>
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
  style
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: BtnVariant;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  const palette: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" },
    secondary: { background: "var(--surface)", color: "var(--ink)", borderColor: "var(--line)" },
    ghost: { background: "transparent", color: "var(--ink)", borderColor: "transparent" },
    danger: { background: "var(--danger)", color: "#fff", borderColor: "var(--danger)" }
  };
  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...palette[variant],
        border: "1px solid",
        padding: "8px 14px",
        borderRadius: 10,
        fontWeight: 500,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "transform .04s ease",
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
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

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
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
    <textarea
      {...props}
      style={{
        width: "100%",
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
  required
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 6, fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: "var(--danger)" }}> *</span>}
      </div>
      {children}
    </label>
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
    <span
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
    </span>
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
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap,
        ...style
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
  if (!open) return null;
  return (
    <div
      onClick={onClose}
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
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{title}</h3>
          <Button variant="ghost" onClick={onClose} ariaLabel={`Close ${title}`} style={{ padding: "4px 10px" }}>
            Close
          </Button>
        </div>
        <div>{children}</div>
        {footer && <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Table<T>({
  rows,
  columns,
  empty = "No data"
}: {
  rows: T[];
  columns: { key: string; header: string; render: (row: T) => React.ReactNode; width?: string | number }[];
  empty?: string;
}) {
  if (rows.length === 0) return <EmptyState message={empty} />;
  return (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 14 }}>
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
            <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
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
      Locked — requires <strong>{min}</strong> role. Change role in the sidebar.
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
                    title={cell.tooltip ?? `${r} × ${c}: ${cell.value}`}
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
                    {cell.value === 0 ? "—" : cell.value.toFixed(0)}
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
  tabs: { key: string; label: string; hint?: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        borderBottom: "1px solid var(--line)",
        overflowX: "auto"
      }}
      className="no-scrollbar"
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            title={t.hint}
            style={{
              border: "none",
              background: "transparent",
              padding: "10px 14px",
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--primary)" : "var(--ink-soft)",
              borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
