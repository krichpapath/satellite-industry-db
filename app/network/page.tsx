"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDatabase } from "@/lib/store";
import { Card, SectionTitle, Button, Badge, Grid } from "@/components/ui";
import type { LinkageType } from "@/lib/schema";

export default function NetworkPage() {
  const db = useDatabase();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [linkFilter, setLinkFilter] = useState<"All" | LinkageType>("All");

  const layout = useMemo(() => {
    const W = 720;
    const H = 520;
    const cx = W / 2;
    const cy = H / 2;
    const r = 200;
    const positions: Record<string, { x: number; y: number }> = {};
    const n = db.firms.length;
    db.firms.forEach((f, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      positions[f.firm_id] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    });
    return { W, H, positions };
  }, [db.firms]);

  const visibleLinks = db.linkages.filter((l) => linkFilter === "All" || l.linkage_type === linkFilter);

  function stageColor(firmId: string) {
    const stages = new Set(
      db.products.filter((p) => p.firm_id === firmId).map((p) => p.value_chain_stage)
    );
    if (stages.has("Upstream")) return "var(--accent)";
    if (stages.has("Midstream")) return "var(--warn)";
    if (stages.has("Downstream")) return "var(--success)";
    return "var(--primary)";
  }

  function linkColor(type: LinkageType) {
    return type === "Supplier" ? "#0f766e" : type === "Buyer" ? "#b45309" : "#12315f";
  }

  const selectedFirm = selected ? db.firms.find((f) => f.firm_id === selected) : null;
  const selectedOut = selected ? db.linkages.filter((l) => l.firm_id === selected) : [];
  const selectedIn = selected ? db.linkages.filter((l) => l.partner_firm_id === selected) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Ecosystem Network</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Supply-chain and partnership network — paper §3.5, Social Network Analysis view.
        </div>
      </header>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["All", "Supplier", "Buyer", "Partner"] as const).map((k) => (
          <Button
            key={k}
            variant={linkFilter === k ? "primary" : "secondary"}
            onClick={() => setLinkFilter(k)}
          >
            {k}
          </Button>
        ))}
      </div>

      <Grid cols={2} gap={18} style={{ gridTemplateColumns: "1fr 320px" }}>
        <Card>
          <svg
            viewBox={`0 0 ${layout.W} ${layout.H}`}
            style={{ width: "100%", height: "auto", background: "var(--surface-muted)", borderRadius: 10 }}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 -5 10 10"
                refX="18"
                refY="0"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,-5L10,0L0,5" fill="#94a3b8" />
              </marker>
            </defs>

            {visibleLinks.map((l) => {
              const a = layout.positions[l.firm_id];
              const b = layout.positions[l.partner_firm_id];
              if (!a || !b) return null;
              const dim =
                selected && selected !== l.firm_id && selected !== l.partner_firm_id ? 0.15 : 1;
              return (
                <line
                  key={l.linkage_id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={linkColor(l.linkage_type)}
                  strokeWidth={1 + l.dependency_level * 0.4}
                  opacity={dim}
                  markerEnd="url(#arrow)"
                />
              );
            })}

            {db.firms.map((f) => {
              const p = layout.positions[f.firm_id];
              const isSel = selected === f.firm_id;
              return (
                <g
                  key={f.firm_id}
                  transform={`translate(${p.x}, ${p.y})`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(f.firm_id === selected ? null : f.firm_id)}
                >
                  <circle
                    r={isSel ? 18 : 13}
                    fill={stageColor(f.firm_id)}
                    stroke="#fff"
                    strokeWidth={2}
                    opacity={selected && !isSel ? 0.5 : 1}
                  />
                  <text
                    y={-22}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--ink)"
                    style={{ fontWeight: isSel ? 600 : 500, pointerEvents: "none" }}
                  >
                    {f.firm_name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--muted)", marginTop: 12, flexWrap: "wrap" }}>
            <LegendDot color="var(--accent)" label="Upstream" />
            <LegendDot color="var(--warn)" label="Midstream" />
            <LegendDot color="var(--success)" label="Downstream" />
            <span style={{ marginLeft: 12 }}>Edge color = linkage type · thickness = dependency 1–5</span>
          </div>
        </Card>

        <Card>
          <SectionTitle hint="Click a node to inspect its ecosystem.">Inspector</SectionTitle>
          {!selectedFirm ? (
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Click a firm node to see incoming and outgoing relationships.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedFirm.firm_name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                  {selectedFirm.province} · {selectedFirm.ownership_type}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => router.push(`/firms/${selectedFirm.firm_id}`)}
              >
                Open full profile →
              </Button>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                  Outgoing ({selectedOut.length})
                </div>
                {selectedOut.map((l) => (
                  <div key={l.linkage_id} style={{ fontSize: 13, padding: "4px 0" }}>
                    <Badge>{l.linkage_type}</Badge>{" "}
                    → {db.firms.find((f) => f.firm_id === l.partner_firm_id)?.firm_name}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                  Incoming ({selectedIn.length})
                </div>
                {selectedIn.map((l) => (
                  <div key={l.linkage_id} style={{ fontSize: 13, padding: "4px 0" }}>
                    <Badge>{l.linkage_type}</Badge>{" "}
                    ← {db.firms.find((f) => f.firm_id === l.firm_id)?.firm_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </Grid>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}
