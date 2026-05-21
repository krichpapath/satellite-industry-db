"use client";

import Link from "next/link";
import { useState } from "react";
import { useDatabase } from "@/lib/store";
import { Card, SectionTitle, Grid, Badge, StageBadge, Button, EmptyState } from "@/components/ui";
import type { ValueChainStage } from "@/lib/schema";

export default function ValueChainPage() {
  const db = useDatabase();
  const [filter, setFilter] = useState<"All" | ValueChainStage>("All");

  const stages: ValueChainStage[] = ["Upstream", "Midstream", "Downstream"];

  function firmsForStage(stage: ValueChainStage) {
    const firmIds = new Set(
      db.products.filter((p) => p.value_chain_stage === stage).map((p) => p.firm_id)
    );
    return db.firms.filter((f) => firmIds.has(f.firm_id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Value Chain Map</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Upstream → Midstream → Downstream segmentation per paper §3.2.
        </div>
      </header>

      <div style={{ display: "flex", gap: 6 }}>
        <Button
          variant={filter === "All" ? "primary" : "secondary"}
          onClick={() => setFilter("All")}
        >
          All
        </Button>
        {stages.map((s) => (
          <Button
            key={s}
            variant={filter === s ? "primary" : "secondary"}
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <Grid cols={3} gap={18}>
        {stages
          .filter((s) => filter === "All" || filter === s)
          .map((stage) => {
            const firms = firmsForStage(stage);
            const stageProducts = db.products.filter((p) => p.value_chain_stage === stage);
            return (
              <Card key={stage}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <StageBadge stage={stage} />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {firms.length} firms · {stageProducts.length} offerings
                  </span>
                </div>
                <SectionTitle hint={describe(stage)}>{stage}</SectionTitle>
                {firms.length === 0 ? (
                  <EmptyState message="No firms in this segment." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {firms.map((f) => {
                      const prods = db.products.filter(
                        (p) => p.firm_id === f.firm_id && p.value_chain_stage === stage
                      );
                      return (
                        <Link
                          key={f.firm_id}
                          href={`/firms/${f.firm_id}`}
                          style={{
                            display: "block",
                            padding: 12,
                            borderRadius: 10,
                            border: "1px solid var(--line)",
                            background: "var(--surface-muted)"
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{f.firm_name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                            {f.province}
                          </div>
                          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                            {prods.map((p) => (
                              <div key={p.product_id} style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                                · {p.product_name}{" "}
                                <Badge tone={p.technology_intensity === "High" ? "accent" : "neutral"}>
                                  {p.technology_intensity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
      </Grid>
    </div>
  );
}

function describe(stage: ValueChainStage): string {
  switch (stage) {
    case "Upstream":
      return "Satellite design, manufacturing, propulsion, components.";
    case "Midstream":
      return "Launch services, ground stations, ops infrastructure.";
    case "Downstream":
      return "Satcom services, EO analytics, GNSS, IoT applications.";
  }
}
