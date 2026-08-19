"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Layers, MapPin, Satellite, Boxes } from "lucide-react";
import { ensurePublicEntryRole, useDatabase, useDbReady } from "@/lib/store";
import { Card, Grid, SectionTitle, Badge, EmptyState, Pagination } from "@/components/ui";
import { ThailandMap } from "@/components/thailand-map";
import { COMPONENT_SYSTEMS } from "@/lib/component-taxonomy";

const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as const } }
};

function StatTile({
  label,
  value,
  hint,
  Icon,
  accent,
  href
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  Icon: React.ComponentType<{ size?: number }>;
  accent: string;
  href: string;
}) {
  return (
    <motion.div variants={item} style={{ minWidth: 0 }}>
      <Link
        href={href}
        className="stat-tile"
        aria-label={`${label}: open ${href}`}
        style={{
          display: "block",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 18,
          boxShadow: "var(--shadow)",
          color: "inherit"
        }}
      >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 650, color: "var(--ink)", marginTop: 8 }} className="tabular">
            {value}
          </div>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            color: accent,
            display: "grid",
            placeItems: "center"
          }}
        >
          <Icon size={17} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{hint}</div>
      </Link>
    </motion.div>
  );
}

type ComponentGroup = {
  system: string;
  component: string;
  count: number;
  companies: {
    firmId: string;
    firmName: string;
    count: number;
  }[];
};

function recordLabel(count: number) {
  return count === 1 ? "record" : "records";
}

const EXPLORER_PAGE_SIZE = 6;

function ComponentRecordBreakdown({
  groups,
  maxHeight
}: {
  groups: ComponentGroup[];
  maxHeight?: number;
}) {
  if (groups.length === 0) return <EmptyState message="No component records yet." />;

  return (
    <div
      className="dashboard-component-grid"
      style={{
        maxHeight,
        overflowY: maxHeight ? "auto" : "visible",
        paddingRight: maxHeight ? 4 : 0
      }}
    >
      {groups.map((group) => {
        const systemColor = SCHEMATIC_COLORS[schematicKind(group.system)] ?? SCHEMATIC_COLORS.unknown;
        const companyCount = group.companies.length;

        return (
          <article
            key={`${group.system}-${group.component}`}
            className="dashboard-component-card"
            style={{ "--system-color": systemColor } as React.CSSProperties}
          >
            <div className="dashboard-component-card__head">
              <div className="dashboard-component-card__title-group">
                <div className="dashboard-component-card__system">
                  <span aria-hidden="true" />
                  {shortSystemName(group.system)}
                </div>
                <h3>{group.component}</h3>
              </div>
              <Badge tone="accent">
                <span className="tabular" style={{ whiteSpace: "nowrap" }}>
                  {group.count} {recordLabel(group.count)}
                </span>
              </Badge>
            </div>
            <div className="dashboard-component-card__summary">
              <span>{companyCount} {companyCount === 1 ? "company" : "companies"}</span>
              <span>{group.count} total {recordLabel(group.count)}</span>
            </div>
            <div className="dashboard-component-card__companies" aria-label={`Companies selling ${group.component}`}>
              {group.companies.map((company) => (
                <Link
                  key={`${group.system}-${group.component}-${company.firmId}`}
                  href={`/companies/${company.firmId}`}
                  className="dashboard-component-card__company"
                >
                  <span>{company.firmName}</span>
                  <span className="tabular">
                    {company.count} {recordLabel(company.count)}
                  </span>
                </Link>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

// Backup: previous centered-port schematic points, kept per request.
// const SCHEMATIC_PORTS = [
//   { x: 245, y: 88 },
//   { x: 315, y: 88 },
//   { x: 340, y: 150 },
//   { x: 315, y: 212 },
//   { x: 245, y: 212 },
//   { x: 220, y: 150 },
//   { x: 280, y: 150 }
// ];

type SchematicPoint = {
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  textAnchor?: "start" | "middle" | "end";
  elbows?: Array<{ x: number; y: number }>;
};

const SCHEMATIC_POINT_FALLBACKS: SchematicPoint[] = [
  { x: 282, y: 82, labelX: 282, labelY: 32, elbows: [{ x: 282, y: 52 }] },
  { x: 142, y: 142, labelX: 20, labelY: 92, textAnchor: "start", elbows: [{ x: 116, y: 92 }] },
  { x: 320, y: 130, labelX: 432, labelY: 92, textAnchor: "start", elbows: [{ x: 382, y: 92 }] },
  { x: 282, y: 178, labelX: 20, labelY: 218, textAnchor: "start", elbows: [{ x: 210, y: 178 }, { x: 210, y: 218 }] },
  { x: 414, y: 206, labelX: 492, labelY: 244, textAnchor: "start", elbows: [{ x: 452, y: 244 }] },
  { x: 232, y: 214, labelX: 20, labelY: 258, textAnchor: "start", elbows: [{ x: 182, y: 258 }] },
  { x: 282, y: 248, labelX: 376, labelY: 284, textAnchor: "start", elbows: [{ x: 340, y: 248 }] }
];

const SCHEMATIC_POINTS: Array<{ includes: string; point: SchematicPoint }> = [
  { includes: "Payload System", point: { x: 282, y: 82, labelX: 282, labelY: 32, elbows: [{ x: 282, y: 52 }] } },
  { includes: "Electrical Power System", point: { x: 142, y: 142, labelX: 20, labelY: 92, textAnchor: "start", elbows: [{ x: 116, y: 92 }] } },
  { includes: "ADCS", point: { x: 320, y: 130, labelX: 432, labelY: 92, textAnchor: "start", elbows: [{ x: 382, y: 92 }] } },
  { includes: "Command & Data", point: { x: 282, y: 178, labelX: 20, labelY: 218, textAnchor: "start", elbows: [{ x: 210, y: 178 }, { x: 210, y: 218 }] } },
  { includes: "TT&C", point: { x: 414, y: 206, labelX: 492, labelY: 244, textAnchor: "start", elbows: [{ x: 452, y: 244 }] } },
  { includes: "Structure & Thermal", point: { x: 232, y: 214, labelX: 20, labelY: 258, textAnchor: "start", elbows: [{ x: 182, y: 258 }] } },
  { includes: "Propulsion System", point: { x: 282, y: 248, labelX: 376, labelY: 284, textAnchor: "start", elbows: [{ x: 340, y: 248 }] } }
];

function schematicPointFor(system: string, index: number): SchematicPoint {
  return SCHEMATIC_POINTS.find((entry) => system.includes(entry.includes))?.point ?? SCHEMATIC_POINT_FALLBACKS[index % SCHEMATIC_POINT_FALLBACKS.length];
}
function shortSystemName(system: string) {
  const english = system.replace(/\([^)]*[\u0E00-\u0E7F][^)]*\)/gu, "").trim();
  return english
    .replace("Electrical Power System (EPS)", "EPS")
    .replace("Command & Data Handling (C&DH)", "C&DH")
    .replace("Structure & Thermal Control (STCS)", "STCS")
    .replace("Propulsion System", "Propulsion")
    .replace("Payload System", "Payload");
}

type SchematicKind = "payload" | "eps" | "adcs" | "cdh" | "ttc" | "stcs" | "propulsion" | "unknown";

const SCHEMATIC_COLORS: Record<SchematicKind, string> = {
  payload: "#a78bfa",
  eps: "#facc15",
  adcs: "#84cc16",
  cdh: "#38bdf8",
  ttc: "#fb923c",
  stcs: "#22d3ee",
  propulsion: "#ef4444",
  unknown: "#94a3b8"
};

const SYSTEM_DESCRIPTIONS: Record<SchematicKind, string> = {
  payload: "Mission instruments and payload electronics that collect, sense, or process the satellite's primary data.",
  eps: "Solar arrays, batteries, and power-control electronics that generate, store, and distribute power.",
  adcs: "Sensors, wheels, and control electronics that keep the satellite pointed in the right attitude.",
  cdh: "The onboard computer and data bus that route commands, timing, storage, and subsystem data.",
  ttc: "Radio hardware and antennas for telemetry, tracking, and command links with ground stations.",
  stcs: "The frame, mounting hardware, and thermal parts that protect equipment through launch and orbit.",
  propulsion: "Tanks, valves, and thrusters used for orbit adjustment, station keeping, or attitude assist.",
  unknown: "Records that still need a confirmed subsystem before they can be mapped to the schematic."
};

function schematicKind(system: string): SchematicKind {
  if (system.includes("Payload")) return "payload";
  if (system.includes("Electrical Power")) return "eps";
  if (system.includes("ADCS")) return "adcs";
  if (system.includes("Command & Data")) return "cdh";
  if (system.includes("TT&C")) return "ttc";
  if (system.includes("Structure & Thermal")) return "stcs";
  if (system.includes("Propulsion")) return "propulsion";
  return "unknown";
}

function systemDescription(system: string) {
  return SYSTEM_DESCRIPTIONS[schematicKind(system)];
}

type SystemSummary = {
  name: string;
  label: string;
  count: number;
  color: string;
  point: SchematicPoint;
};

function systemSummaries(systemCounts: Record<string, number>): SystemSummary[] {
  return COMPONENT_SYSTEMS.map((system, index) => ({
    name: system,
    label: shortSystemName(system),
    count: systemCounts[system] ?? 0,
    color: SCHEMATIC_COLORS[schematicKind(system)] ?? SCHEMATIC_COLORS.unknown,
    point: schematicPointFor(system, index)
  }));
}

function SchematicRecordInspector({
  systemCounts,
  selected,
  onSelect
}: {
  systemCounts: Record<string, number>;
  selected: string | null;
  onSelect: (system: string) => void;
}) {
  const systems = systemSummaries(systemCounts);
  const pointSystems = systems.filter((system) => system.name !== "Unidentified");
  const defaultSystemName = pointSystems.find((system) => system.count > 0)?.name ?? systems.find((system) => system.count > 0)?.name ?? systems[0]?.name ?? "";
  const [preview, setPreview] = useState<string | null>(null);
  const activeName = preview ?? selected ?? defaultSystemName;
  const highlightedName = preview ?? selected;
  const activeSystem = systems.find((system) => system.name === activeName) ?? systems[0];
  const highlightedSystem = highlightedName ? systems.find((system) => system.name === highlightedName) : undefined;

  if (!activeSystem) return <EmptyState message="No system records yet." />;

  const highlightedKind = highlightedSystem ? schematicKind(highlightedSystem.name) : null;
  const highlightedColor = highlightedSystem?.color ?? activeSystem.color;

  return (
    <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
      <div
          style={{
            border: "1px solid color-mix(in srgb, var(--primary) 20%, var(--line))",
            borderRadius: 12,
            background: "#0b1f38",
            padding: 8
          }}
        >
          {/*
            Backup: previous generic centered-port schematic, kept per request.
            <svg viewBox="0 0 560 300" role="img" aria-label="Satellite schematic. Hover subsystem points to inspect component records.">
              <rect width="560" height="300" rx="10" fill="#0b1f38" />
              <g opacity="0.42">
                <line x1="62" y1="82" x2="176" y2="132" stroke="#7aa7d9" strokeWidth="1" />
                <line x1="62" y1="218" x2="176" y2="168" stroke="#7aa7d9" strokeWidth="1" />
                <line x1="384" y1="132" x2="498" y2="82" stroke="#7aa7d9" strokeWidth="1" />
                <line x1="384" y1="168" x2="498" y2="218" stroke="#7aa7d9" strokeWidth="1" />
              </g>
              {[62, 104, 146].map((x) => (
                <rect key={`left-${x}`} x={x} y="78" width="32" height="144" rx="5" fill="#12315f" stroke="rgba(191, 219, 254, 0.36)" />
              ))}
              {[466, 424, 382].map((x) => (
                <rect key={`right-${x}`} x={x} y="78" width="32" height="144" rx="5" fill="#12315f" stroke="rgba(191, 219, 254, 0.36)" />
              ))}
              <rect x="196" y="98" width="168" height="104" rx="16" fill="#102b47" stroke={activeSystem.color} strokeWidth="2.4" />
              <rect x="224" y="122" width="112" height="56" rx="10" fill="rgba(226, 232, 240, 0.08)" stroke="rgba(226, 232, 240, 0.22)" />
              <circle cx="280" cy="150" r="20" fill="rgba(226, 232, 240, 0.1)" stroke="rgba(226, 232, 240, 0.28)" />
            </svg>
          */}
          <svg
            viewBox="0 0 560 300"
            role="img"
            aria-label="Satellite subsystem cutaway schematic. Hover subsystem points to inspect component records."
            style={{ display: "block", width: "100%", height: "auto" }}
          >
            <rect width="560" height="300" rx="10" fill="#0b1f38" />
            <defs>
              <filter id="schematic-active-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.4" floodColor={highlightedColor} floodOpacity="0.85" />
              </filter>
            </defs>
            <g aria-hidden="true" opacity="0.55">
              <circle cx="68" cy="42" r="1.1" fill="#9cc7ff" />
              <circle cx="132" cy="60" r="0.9" fill="#dbeafe" />
              <circle cx="444" cy="42" r="1.2" fill="#9cc7ff" />
              <circle cx="512" cy="76" r="0.9" fill="#dbeafe" />
              <circle cx="74" cy="246" r="0.8" fill="#bfdbfe" />
              <circle cx="498" cy="250" r="1" fill="#bfdbfe" />
            </g>

            <g aria-hidden="true">
              <line x1="214" y1="158" x2="70" y2="158" stroke="#7aa7d9" strokeWidth="4" strokeLinecap="round" />
              <line x1="374" y1="160" x2="512" y2="160" stroke="#7aa7d9" strokeWidth="4" strokeLinecap="round" />
              <circle cx="214" cy="158" r="9" fill="#233f63" stroke="#9cc7ff" strokeWidth="1" />
              <circle cx="374" cy="160" r="9" fill="#233f63" stroke="#9cc7ff" strokeWidth="1" />

              {[42, 88, 134].map((x) => (
                <g key={`left-solar-${x}`}>
                  <rect x={x} y="104" width="40" height="94" rx="3" fill="#12315f" stroke="rgba(191, 219, 254, 0.5)" />
                  <line x1={x + 13} y1="108" x2={x + 13} y2="194" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="0.8" />
                  <line x1={x + 27} y1="108" x2={x + 27} y2="194" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="0.8" />
                  {[124, 144, 164, 184].map((y) => (
                    <line key={`left-solar-row-${x}-${y}`} x1={x + 4} y1={y} x2={x + 36} y2={y} stroke="rgba(191, 219, 254, 0.34)" strokeWidth="0.7" />
                  ))}
                </g>
              ))}
              {[398, 444, 490].map((x) => (
                <g key={`right-solar-${x}`}>
                  <rect x={x} y="104" width="40" height="94" rx="3" fill="#12315f" stroke="rgba(191, 219, 254, 0.5)" />
                  <line x1={x + 13} y1="108" x2={x + 13} y2="194" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="0.8" />
                  <line x1={x + 27} y1="108" x2={x + 27} y2="194" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="0.8" />
                  {[124, 144, 164, 184].map((y) => (
                    <line key={`right-solar-row-${x}-${y}`} x1={x + 4} y1={y} x2={x + 36} y2={y} stroke="rgba(191, 219, 254, 0.34)" strokeWidth="0.7" />
                  ))}
                </g>
              ))}

              <polygon points="238,72 352,86 380,114 264,101" fill="#1d3a5c" stroke="rgba(226, 232, 240, 0.36)" />
              <rect x="218" y="96" width="136" height="138" rx="7" fill="#102b47" stroke="rgba(226, 232, 240, 0.36)" strokeWidth="1.4" />
              <polygon points="354,96 380,114 380,222 354,234" fill="#0d243d" stroke="rgba(226, 232, 240, 0.3)" />
              <line x1="232" y1="102" x2="232" y2="228" stroke="rgba(226, 232, 240, 0.44)" strokeWidth="2" />
              <line x1="340" y1="102" x2="340" y2="228" stroke="rgba(226, 232, 240, 0.44)" strokeWidth="2" />
              <line x1="224" y1="118" x2="350" y2="118" stroke="rgba(226, 232, 240, 0.22)" />
              <line x1="224" y1="215" x2="350" y2="215" stroke="rgba(226, 232, 240, 0.22)" />

              <rect x="235" y="124" width="33" height="72" rx="3" fill="#142f52" stroke="rgba(191, 219, 254, 0.26)" />
              <rect x="239" y="130" width="25" height="24" rx="2" fill="#0e2140" stroke="rgba(251, 191, 36, 0.35)" />
              <rect x="239" y="160" width="25" height="30" rx="2" fill="#0e2140" stroke="rgba(191, 219, 254, 0.24)" />

              <rect x="272" y="148" width="52" height="62" rx="4" fill="#172a3f" stroke="rgba(20, 184, 166, 0.65)" />
              <rect x="282" y="158" width="30" height="21" rx="2" fill="#0b1324" stroke="rgba(226, 232, 240, 0.28)" />
              <line x1="278" y1="187" x2="318" y2="187" stroke="rgba(20, 184, 166, 0.56)" />
              <line x1="278" y1="195" x2="312" y2="195" stroke="rgba(20, 184, 166, 0.36)" />
              {[154, 166, 178, 190, 202].map((y) => (
                <circle key={`board-pin-${y}`} cx="269" cy={y} r="1.7" fill="#38bdf8" opacity="0.72" />
              ))}

              <rect x="260" y="56" width="44" height="40" rx="8" fill="#1d3554" stroke="rgba(226, 232, 240, 0.44)" />
              <circle cx="282" cy="78" r="19" fill="#0b1324" stroke="rgba(226, 232, 240, 0.7)" strokeWidth="2" />
              <circle cx="282" cy="78" r="10" fill="#182a48" stroke="#93c5fd" strokeWidth="1" />
              <circle cx="286" cy="74" r="4" fill="#c4b5fd" />

              <circle cx="320" cy="130" r="20" fill="#0b1324" stroke="rgba(226, 232, 240, 0.58)" strokeWidth="2" />
              <circle cx="320" cy="130" r="7" fill="#1e3a5f" stroke="#bfdbfe" />
              {[0, 60, 120].map((angle) => (
                <line
                  key={`reaction-wheel-${angle}`}
                  x1="320"
                  y1="130"
                  x2={320 + Math.cos((angle * Math.PI) / 180) * 16}
                  y2={130 + Math.sin((angle * Math.PI) / 180) * 16}
                  stroke="rgba(226, 232, 240, 0.5)"
                  strokeWidth="1.3"
                />
              ))}

              <line x1="380" y1="206" x2="414" y2="206" stroke="rgba(226, 232, 240, 0.55)" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="416" cy="206" rx="26" ry="36" fill="#cbd5e1" opacity="0.9" stroke="#eff6ff" strokeWidth="1.4" />
              <ellipse cx="410" cy="206" rx="14" ry="28" fill="#94a3b8" opacity="0.7" />
              <circle cx="414" cy="206" r="5" fill="#f97316" stroke="#fed7aa" strokeWidth="1" />
              <line x1="414" y1="206" x2="395" y2="186" stroke="#64748b" strokeWidth="1" />
              <line x1="414" y1="206" x2="396" y2="227" stroke="#64748b" strokeWidth="1" />

              <rect x="223" y="203" width="35" height="21" rx="2" fill="#0e2140" stroke="rgba(191, 219, 254, 0.42)" />
              <line x1="228" y1="207" x2="253" y2="207" stroke="rgba(191, 219, 254, 0.34)" />
              <line x1="228" y1="214" x2="253" y2="214" stroke="rgba(191, 219, 254, 0.34)" />
              <line x1="228" y1="221" x2="253" y2="221" stroke="rgba(191, 219, 254, 0.34)" />

              <circle cx="268" cy="232" r="12" fill="#64748b" stroke="rgba(226, 232, 240, 0.5)" />
              <circle cx="302" cy="232" r="12" fill="#64748b" stroke="rgba(226, 232, 240, 0.5)" />
              <rect x="274" y="232" width="18" height="14" fill="#2d3f55" stroke="rgba(226, 232, 240, 0.38)" />
              <path d="M268 246H302L292 276H278Z" fill="#3b2f25" stroke="#d6d3d1" strokeWidth="1.3" />
              <path d="M274 276H296" stroke="#f97316" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
            </g>
            <g aria-hidden="true" pointerEvents="none" filter="url(#schematic-active-glow)">
              {highlightedKind === "eps" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="214" y1="158" x2="70" y2="158" strokeWidth="6" />
                  <line x1="374" y1="160" x2="512" y2="160" strokeWidth="6" />
                  {[42, 88, 134, 398, 444, 490].map((x) => (
                    <rect key={`active-solar-${x}`} x={x} y="104" width="40" height="94" rx="3" strokeWidth="2.5" />
                  ))}
                </g>
              ) : null}
              {highlightedKind === "payload" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="260" y="56" width="44" height="40" rx="8" strokeWidth="2.6" />
                  <circle cx="282" cy="78" r="19" strokeWidth="3" />
                  <circle cx="282" cy="78" r="10" strokeWidth="1.8" />
                </g>
              ) : null}
              {highlightedKind === "adcs" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="320" cy="130" r="20" strokeWidth="3" />
                  {[0, 60, 120].map((angle) => (
                    <line
                      key={`active-reaction-wheel-${angle}`}
                      x1="320"
                      y1="130"
                      x2={320 + Math.cos((angle * Math.PI) / 180) * 16}
                      y2={130 + Math.sin((angle * Math.PI) / 180) * 16}
                      strokeWidth="2.2"
                    />
                  ))}
                </g>
              ) : null}
              {highlightedKind === "cdh" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="272" y="148" width="52" height="62" rx="4" strokeWidth="2.6" />
                  <rect x="282" y="158" width="30" height="21" rx="2" strokeWidth="1.8" />
                  <line x1="278" y1="187" x2="318" y2="187" strokeWidth="1.8" />
                  <line x1="278" y1="195" x2="312" y2="195" strokeWidth="1.8" />
                </g>
              ) : null}
              {highlightedKind === "ttc" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="380" y1="206" x2="414" y2="206" strokeWidth="4" />
                  <ellipse cx="416" cy="206" rx="26" ry="36" strokeWidth="2.8" />
                  <circle cx="414" cy="206" r="6" strokeWidth="1.8" />
                </g>
              ) : null}
              {highlightedKind === "stcs" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="232" y1="102" x2="232" y2="228" strokeWidth="3" />
                  <line x1="340" y1="102" x2="340" y2="228" strokeWidth="3" />
                  <rect x="223" y="203" width="35" height="21" rx="2" strokeWidth="2.4" />
                  <line x1="228" y1="207" x2="253" y2="207" strokeWidth="1.5" />
                  <line x1="228" y1="214" x2="253" y2="214" strokeWidth="1.5" />
                  <line x1="228" y1="221" x2="253" y2="221" strokeWidth="1.5" />
                </g>
              ) : null}
              {highlightedKind === "propulsion" ? (
                <g fill="none" stroke={highlightedColor} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="268" cy="232" r="12" strokeWidth="2.4" />
                  <circle cx="302" cy="232" r="12" strokeWidth="2.4" />
                  <rect x="274" y="232" width="18" height="14" strokeWidth="1.8" />
                  <path d="M268 246H302L292 276H278Z" strokeWidth="2.8" />
                </g>
              ) : null}
            </g>
            {pointSystems.map((system) => {
              const isActive = system.name === highlightedSystem?.name;
              const markerColor = system.color;
              const leaderPoints = [
                `${system.point.x},${system.point.y}`,
                ...(system.point.elbows?.map((point) => `${point.x},${point.y}`) ?? []),
                `${system.point.labelX},${system.point.labelY}`
              ].join(" ");
              return (
                <g
                  key={system.name}
                  tabIndex={0}
                  role="button"
                  aria-pressed={system.name === selected}
                  aria-label={`${system.name}: ${system.count} ${recordLabel(system.count)}`}
                  onPointerEnter={() => setPreview(system.name)}
                  onPointerLeave={() => setPreview(null)}
                  onFocus={() => setPreview(system.name)}
                  onBlur={() => setPreview(null)}
                  onClick={() => {
                    onSelect(system.name);
                    setPreview(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    onSelect(system.name);
                    setPreview(null);
                  }}
                  style={{ cursor: "pointer", outline: "none" }}
                >
                  <title>{`${system.name}: ${system.count} ${recordLabel(system.count)}`}</title>
                  <polyline
                    points={leaderPoints}
                    fill="none"
                    stroke={isActive ? system.color : "rgba(148, 163, 184, 0.34)"}
                    strokeWidth={isActive ? 2 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={system.point.x} cy={system.point.y} r="15" fill="transparent" />
                  {isActive ? <circle cx={system.point.x} cy={system.point.y} r="12" fill="none" stroke={system.color} strokeWidth="2" opacity="0.72" /> : null}
                  <circle cx={system.point.x} cy={system.point.y} r={isActive ? 7 : 5.8} fill={markerColor} stroke="#eff6ff" strokeWidth={isActive ? 1.8 : 1} />
                  <text
                    x={system.point.labelX}
                    y={system.point.labelY}
                    textAnchor={system.point.textAnchor ?? "middle"}
                    fill={isActive ? "#eff6ff" : "#bfdbfe"}
                    fontSize="13"
                    fontWeight={isActive ? 700 : 600}
                    paintOrder="stroke"
                    stroke="#0b1f38"
                    strokeWidth="4"
                    pointerEvents="none"
                  >
                    {system.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "start", marginTop: 12, color: "#dbeafe" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 5, color: "#93c5fd", fontSize: 11.5, lineHeight: 1.3 }}>
                <Layers size={12} aria-hidden="true" />
                {selected === activeSystem.name ? "Selected in Component Records Explorer" : "Click to select in Component Records Explorer"}
              </div>
              <strong style={{ display: "block", minWidth: 0, fontSize: 14, lineHeight: 1.4, overflowWrap: "anywhere" }}>{activeSystem.name}</strong>
              <div style={{ marginTop: 4, maxWidth: 720, color: "#bfdbfe", fontSize: 12.5, lineHeight: 1.45, overflowWrap: "anywhere" }}>{systemDescription(activeSystem.name)}</div>
            </div>
            <span className="tabular" style={{ fontSize: 13, color: "#bfdbfe", whiteSpace: "nowrap" }}>{activeSystem.count} {recordLabel(activeSystem.count)}</span>
          </div>
        </div>
    </div>
  );
}

function SystemRecordsExplorer({
  groups,
  systemCounts,
  selected,
  onSelect
}: {
  groups: ComponentGroup[];
  systemCounts: Record<string, number>;
  selected: string | null;
  onSelect: (system: string) => void;
}) {
  const systems = systemSummaries(systemCounts);
  const totalRecords = systems.reduce((sum, system) => sum + system.count, 0) || 1;
  const defaultSystemName = systems.find((system) => system.count > 0)?.name ?? systems[0]?.name ?? "";
  const activeName = selected ?? defaultSystemName;
  const activeSystem = systems.find((system) => system.name === activeName) ?? systems[0];
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeName]);

  if (!activeSystem) return <ComponentRecordBreakdown groups={groups} />;

  const activeGroups = groups.filter((group) => group.system === activeSystem.name);
  const pageCount = Math.max(1, Math.ceil(activeGroups.length / EXPLORER_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * EXPLORER_PAGE_SIZE;
  const pagedGroups = activeGroups.slice(pageStart, pageStart + EXPLORER_PAGE_SIZE);

  return (
    <div style={{ display: "grid", gap: 14, minWidth: 0 }}>
      <div className="dashboard-records-explorer-layout" style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start", minWidth: 0 }}>
        <div className="dashboard-system-selector" style={{ flex: "1 1 320px", maxWidth: 420, minWidth: 0, border: "1px solid var(--line-soft)", borderRadius: 12, background: "color-mix(in srgb, var(--surface-muted) 62%, var(--surface))", padding: 16 }}>
          <div className="dashboard-system-selector__header" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>System records</span>
            <span className="tabular" style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>{systems.length} systems</span>
          </div>
          <div className="dashboard-system-selector__list" style={{ display: "grid", gap: 9 }}>
            {systems.map((system) => {
              const pct = Math.round((system.count / totalRecords) * 100);
              const isActive = system.name === activeSystem.name;
              return (
                <button
                  key={system.name}
                  type="button"
                  className="dashboard-system-selector__item"
                  aria-pressed={isActive}
                  onClick={() => onSelect(system.name)}
                  onFocus={() => onSelect(system.name)}
                  style={{
                    "--system-color": system.color,
                    display: "block",
                    width: "100%",
                    padding: "12px 13px",
                    border: isActive ? `1px solid color-mix(in srgb, ${system.color} 42%, var(--line))` : "1px solid var(--line-soft)",
                    borderRadius: 10,
                    background: isActive ? `color-mix(in srgb, ${system.color} 9%, var(--surface))` : "var(--surface)",
                    color: "inherit",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background-color 160ms var(--ease-out-quint), border-color 160ms var(--ease-out-quint)"
                  } as React.CSSProperties}
                >
                  <span style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "baseline", gap: 10, marginBottom: 8, fontSize: 14, lineHeight: 1.4 }}>
                    <span className="dashboard-system-selector__name" style={{ minWidth: 0, color: "var(--ink-soft)", fontWeight: 650, overflowWrap: "anywhere" }}>
                      <span className="dashboard-system-selector__name-full">{system.name}</span>
                      <span className="dashboard-system-selector__name-short">{system.label}</span>
                    </span>
                    <span className="dashboard-system-selector__count tabular" style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {system.count}<span className="dashboard-system-selector__count-pct"> ({pct}%)</span>
                    </span>
                  </span>
                  <span style={{ display: "block", height: 9, background: "var(--surface-muted)", borderRadius: 999, overflow: "hidden" }}>
                    <span style={{ display: "block", width: `${pct}%`, height: "100%", background: isActive ? system.color : "var(--accent)", borderRadius: 999 }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="dashboard-component-detail-panel" style={{ flex: "3 1 560px", minWidth: 0, border: "1px solid var(--line-soft)", borderRadius: 12, background: "color-mix(in srgb, var(--surface-muted) 40%, var(--surface))", padding: 16 }}>
          <div className="dashboard-component-detail-panel__head" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 12, alignItems: "start", marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              <div className="dashboard-component-detail-panel__eyebrow" style={{ color: "var(--muted)", fontSize: 13 }}>Components for</div>
              <strong className="dashboard-component-detail-panel__title" style={{ display: "block", marginTop: 3, color: "var(--ink)", fontSize: 16, lineHeight: 1.35, overflowWrap: "anywhere" }}>{activeSystem.name}</strong>
              <div className="dashboard-component-detail-panel__description" style={{ marginTop: 5, maxWidth: 760, color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.45, overflowWrap: "anywhere" }}>{systemDescription(activeSystem.name)}</div>
            </div>
            <Badge tone="accent"><span className="tabular" style={{ whiteSpace: "nowrap" }}>{activeSystem.count} {recordLabel(activeSystem.count)}</span></Badge>
          </div>
          <ComponentRecordBreakdown groups={pagedGroups} />
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  const db = useDatabase();
  const ready = useDbReady();
  const [provFilter, setProvFilter] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [isDashboardMobile, setIsDashboardMobile] = useState(false);

  useEffect(() => {
    ensurePublicEntryRole();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 880px)");
    const sync = () => setIsDashboardMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const provinceCounts: Record<string, number> = {};
  for (const company of db.firms) provinceCounts[company.province] = (provinceCounts[company.province] ?? 0) + 1;

  const systemCounts: Record<string, number> = {};
  const moduleSet = new Set<string>();
  const companyById = new Map(db.firms.map((firm) => [firm.firm_id, firm]));
  for (const component of db.products) {
    systemCounts[component.system] = (systemCounts[component.system] ?? 0) + 1;
    if (component.module) moduleSet.add(component.module);
  }

  const componentGroups = Object.values(
    db.products.reduce<Record<string, { system: string; component: string; count: number; companies: Record<string, number> }>>((groups, product) => {
      const component = product.component_name || product.product_name || "Unspecified component";
      const key = `${product.system}::${component}`;
      groups[key] ??= { system: product.system, component, count: 0, companies: {} };
      groups[key].count += 1;
      groups[key].companies[product.firm_id] = (groups[key].companies[product.firm_id] ?? 0) + 1;
      return groups;
    }, {})
  )
    .map((group) => ({
      ...group,
      companies: Object.entries(group.companies)
        .map(([firmId, count]) => ({
          firmId,
          firmName: companyById.get(firmId)?.firm_name ?? firmId,
          count
        }))
        .sort((a, b) => b.count - a.count || a.firmName.localeCompare(b.firmName))
    }))
    .sort((a, b) => b.count - a.count || a.component.localeCompare(b.component));
  const recentComponents = db.products.slice(-6).reverse();
  const schematicPanel = (
    <motion.div variants={item} style={{ minWidth: 0, height: "100%" }}>
      <Card style={{ height: "100%" }}>
        <SectionTitle hint="Click a subsystem point to select the same system in the records explorer.">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Satellite size={18} style={{ color: "var(--accent)" }} />
            Satellite System Schematic
          </span>
        </SectionTitle>
        <SchematicRecordInspector systemCounts={systemCounts} selected={selectedSystem} onSelect={setSelectedSystem} />
      </Card>
    </motion.div>
  );

  const mapPanel = (
    <motion.div variants={item} style={{ minWidth: 0, height: "100%" }}>
      <Card style={{ height: "100%" }}>
        <SectionTitle hint="Province-level company locations on a dotted Thailand map.">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <MapPin size={18} style={{ color: "var(--warn)" }} />
            Geographic Distribution
          </span>
        </SectionTitle>
        <ThailandMap counts={provinceCounts} firms={db.firms} selected={provFilter} onSelect={setProvFilter} />
      </Card>
    </motion.div>
  );

  const recordsPanel = (
    <motion.div variants={item} style={{ minWidth: 0, gridColumn: isDashboardMobile ? undefined : "1 / -1" }}>
      <Card className="dashboard-records-card">
        <SectionTitle hint="Select a subsystem to see its component records, counts, and supplier companies in one place.">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Layers size={18} style={{ color: "var(--accent)" }} />
            Component Records Explorer
          </span>
        </SectionTitle>
        <SystemRecordsExplorer groups={componentGroups} systemCounts={systemCounts} selected={selectedSystem} onSelect={setSelectedSystem} />
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
      style={{ display: "flex", flexDirection: "column", gap: 22 }}
    >
      <motion.header variants={item} className="hero-band">
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, opacity: 0.86, marginBottom: 8 }}>
              <span className="pulse-dot" /> Satellite industry database
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 650 }}>Company Component Records</h1>
            <div style={{ marginTop: 6, fontSize: 14, opacity: 0.86, maxWidth: 620 }}>
              Companies and satellite components classified by expert System, Module, and Component taxonomy.
            </div>
          </div>
        </div>
      </motion.header>

      <Grid cols={4}>
        <StatTile label="Companies" value={ready ? db.firms.length : "—"} hint="Registered companies" Icon={Building2} accent="var(--primary)" href="/search" />
        <StatTile label="Components" value={ready ? db.products.length : "—"} hint="Component records" Icon={Boxes} accent="var(--accent)" href="/search" />
        <StatTile label="Systems" value={ready ? Object.keys(systemCounts).length : "—"} hint="Systems represented" Icon={Satellite} accent="var(--success)" href="/search" />
        <StatTile label="Modules" value={ready ? moduleSet.size : "—"} hint="Modules represented" Icon={Layers} accent="var(--warn)" href="/search" />
      </Grid>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDashboardMobile ? "1fr" : "minmax(360px, 3fr) minmax(480px, 4fr)",
          gap: 18,
          alignItems: "stretch",
          minWidth: 0
        }}
      >
        {isDashboardMobile ? (
          <>
            {mapPanel}
            {schematicPanel}
            {recordsPanel}
          </>
        ) : (
          <>
            {schematicPanel}
            {mapPanel}
            {recordsPanel}
          </>
        )}
      </div>
      <motion.div variants={item}>
        <Card>
          <SectionTitle hint="Most recently added component records.">
            Recent Components
          </SectionTitle>
          {recentComponents.length === 0 ? (
            <EmptyState message="No component records yet." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
              {recentComponents.map((component) => {
                const company = db.firms.find((firm) => firm.firm_id === component.firm_id);
                return (
                  <Link
                    key={component.product_id}
                    href={`/companies/${component.firm_id}`}
                    className="hover-lift"
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: 12,
                      background: "var(--surface)"
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 8, alignItems: "center" }}>
                      <strong style={{ minWidth: 0, fontSize: 13, lineHeight: 1.35, overflowWrap: "anywhere" }}>{company?.firm_name ?? component.firm_id}</strong>
                      <Badge tone="accent"><span style={{ whiteSpace: "nowrap" }}>{component.product_id}</span></Badge>
                    </div>
                    <div style={{ marginTop: 7, fontSize: 13, color: "var(--ink-soft)" }}>{component.product_name || component.component_name}</div>
                    <div style={{ marginTop: 5, fontSize: 12, color: "var(--muted)" }}>{component.component_name}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
