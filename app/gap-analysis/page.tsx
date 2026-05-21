"use client";

import { useState } from "react";
import Link from "next/link";
import { useDatabase } from "@/lib/store";
import { Card, SectionTitle, Heatmap, Grid, Badge, Stat, Button } from "@/components/ui";
import { VALUE_CHAIN_STAGES, TECH_INTENSITIES } from "@/lib/schema";

export default function GapAnalysisPage() {
  const db = useDatabase();
  const [drilldown, setDrilldown] = useState<{ tech: string; stage: string } | null>(null);

  const techs = db.vocab.core_technologies;
  const stages = [...VALUE_CHAIN_STAGES];

  function techStageValue(tech: string, stage: string) {
    const firmIds = new Set(db.tech.filter((t) => t.core_technology === tech).map((t) => t.firm_id));
    const productFirms = db.products.filter(
      (p) => p.value_chain_stage === stage && firmIds.has(p.firm_id)
    );
    const trlSum = db.tech
      .filter((t) => t.core_technology === tech && productFirms.some((p) => p.firm_id === t.firm_id))
      .reduce((s, t) => s + t.trl_level + t.patents_count * 0.5, 0);
    return {
      value: Math.round(trlSum),
      tooltip: `${productFirms.length} firms · capability score ${trlSum.toFixed(1)}`
    };
  }

  function industrialValue(stage: string, intensity: string) {
    const n = db.products.filter(
      (p) => p.value_chain_stage === stage && p.technology_intensity === intensity
    ).length;
    return { value: n, tooltip: `${n} products at ${stage} × ${intensity}` };
  }

  const drillFirms = drilldown
    ? db.firms.filter((f) => {
        const hasTech = db.tech.some((t) => t.firm_id === f.firm_id && t.core_technology === drilldown.tech);
        const hasStage = db.products.some(
          (p) => p.firm_id === f.firm_id && p.value_chain_stage === drilldown.stage
        );
        return hasTech && hasStage;
      })
    : [];

  const totalTechs = db.vocab.core_technologies.length;
  const techsCovered = db.vocab.core_technologies.filter((t) =>
    db.tech.some((row) => row.core_technology === t)
  ).length;
  const coverage = Math.round((techsCovered / totalTechs) * 100);

  const segmentMatrix: { stage: string; intensity: string; n: number }[] = [];
  for (const s of stages) for (const i of TECH_INTENSITIES) {
    segmentMatrix.push({ stage: s, intensity: i, n: industrialValue(s, i).value });
  }
  const underServed = segmentMatrix.filter((m) => m.n === 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Gap Analysis</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Technology Gap Analysis and Industrial Gap Analysis per paper §benefits / §policy level.
        </div>
      </header>

      <Grid cols={3}>
        <Stat label="Core technologies tracked" value={totalTechs} />
        <Stat label="Technologies with capability" value={techsCovered} hint={`${coverage}% coverage`} />
        <Stat label="Under-served stage×intensity" value={underServed.length} hint="Out of 9 cells" />
      </Grid>

      <Card>
        <SectionTitle hint="Rows = core technology · cols = value-chain stage · score = Σ TRL + 0.5 × patents. Click a cell to drill down.">
          Technology Capability Heatmap
        </SectionTitle>
        <Heatmap
          rows={techs}
          cols={stages}
          values={techStageValue}
          onCellClick={(tech, stage, _value) => setDrilldown({ tech, stage })}
          legend="Empty cells (—) are technology / stage combinations with no firm coverage — potential capability gaps."
        />
        {drilldown && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>
                Drilldown: <Badge tone="accent">{drilldown.tech}</Badge> ×{" "}
                <Badge>{drilldown.stage}</Badge>
              </strong>
              <Button variant="ghost" onClick={() => setDrilldown(null)} style={{ padding: "4px 10px", fontSize: 12 }}>
                Close
              </Button>
            </div>
            {drillFirms.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                No firm currently combines this technology with this value-chain stage. Gap candidate.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {drillFirms.map((f) => (
                  <Link key={f.firm_id} href={`/firms/${f.firm_id}`} style={{ color: "var(--primary)", fontSize: 13 }}>
                    · {f.firm_name} ({f.province})
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint="Number of products per value-chain stage × technology intensity. Empty cells highlight industrial gaps.">
          Industrial Gap Analysis — Stage × Tech Intensity
        </SectionTitle>
        <Heatmap rows={stages} cols={[...TECH_INTENSITIES]} values={industrialValue} />
        {underServed.length > 0 && (
          <div style={{ marginTop: 14, fontSize: 13 }}>
            <strong>Under-served combinations:</strong>
            <ul style={{ marginTop: 6, paddingLeft: 20 }}>
              {underServed.map((u) => (
                <li key={`${u.stage}-${u.intensity}`}>
                  {u.stage} × {u.intensity} — no firm offerings
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint="High-TRL firms can anchor technology roadmapping initiatives.">
          Technology Roadmapping Candidates
        </SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {db.tech
            .filter((t) => t.trl_level >= 7)
            .sort((a, b) => b.trl_level - a.trl_level)
            .map((t) => {
              const firm = db.firms.find((f) => f.firm_id === t.firm_id);
              return (
                <Link
                  key={t.tech_id}
                  href={`/firms/${t.firm_id}`}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13 }}
                >
                  <Badge tone="accent">TRL {t.trl_level}</Badge>
                  <strong style={{ minWidth: 220 }}>{firm?.firm_name}</strong>
                  <span style={{ color: "var(--ink-soft)" }}>{t.core_technology}</span>
                  <span style={{ color: "var(--muted)", marginLeft: "auto" }}>{t.patents_count} patents</span>
                </Link>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
