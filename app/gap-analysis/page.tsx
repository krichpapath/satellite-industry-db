"use client";

import { useState } from "react";
import Link from "next/link";
import { useDatabase } from "@/lib/store";
import { Card, SectionTitle, Heatmap, Grid, Badge, Stat, Button, RequireRole, LockedNote } from "@/components/ui";
import { COMPONENT_SYSTEMS, modulesForSystem } from "@/lib/component-taxonomy";

export default function GapAnalysisPage() {
  const db = useDatabase();
  const [drilldown, setDrilldown] = useState<{ system: string; module: string } | null>(null);

  const modules = Array.from(new Set(COMPONENT_SYSTEMS.flatMap((system) => modulesForSystem(system))));

  function coverage(system: string, module: string) {
    if (!modulesForSystem(system).includes(module)) {
      return { value: 0, tooltip: `${module} is not part of ${system}` };
    }
    const rows = db.products.filter((component) => component.system === system && component.module === module);
    const companies = new Set(rows.map((component) => component.firm_id));
    return { value: companies.size, tooltip: `${companies.size} companies, ${rows.length} components` };
  }

  const companiesWithComponents = new Set(db.products.map((component) => component.firm_id)).size;
  const coveredModules = new Set(db.products.map((component) => component.module)).size;
  const totalModules = modules.length || 1;

  const drilldownRows = drilldown
    ? db.firms.filter((company) =>
        db.products.some((component) =>
          component.firm_id === company.firm_id &&
          component.system === drilldown.system &&
          component.module === drilldown.module
        )
      )
    : [];

  return (
    <RequireRole min="Admin" fallback={<LockedNote min="Admin" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Component Coverage Analysis</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Coverage gaps by expert System and Module taxonomy.
        </div>
      </header>

      <Grid cols={3}>
        <Stat label="Companies with components" value={companiesWithComponents} />
        <Stat label="Covered modules" value={`${coveredModules}/${totalModules}`} />
        <Stat label="Coverage" value={`${Math.round((coveredModules / totalModules) * 100)}%`} />
      </Grid>

      <Grid cols={2} gap={18} style={{ gridTemplateColumns: "1fr 320px" }}>
        <Card>
          <SectionTitle hint="Cell value is number of companies with at least one component in that module.">
            System x Module Coverage
          </SectionTitle>
          <Heatmap
            rows={[...COMPONENT_SYSTEMS]}
            cols={modules}
            values={coverage}
            onCellClick={(system, module, value) => {
              if (value > 0 && modulesForSystem(system).includes(module)) setDrilldown({ system, module });
            }}
            legend="Blank cells mean the module does not belong to that system. Click populated cells for companies."
          />
        </Card>

        <Card>
          <SectionTitle>Drilldown</SectionTitle>
          {!drilldown ? (
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Select a populated heatmap cell.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <Badge tone="accent">{drilldown.system}</Badge>
                <div style={{ marginTop: 8, fontWeight: 600 }}>{drilldown.module}</div>
              </div>
              <Button variant="ghost" onClick={() => setDrilldown(null)} style={{ alignSelf: "flex-start" }}>
                Clear drilldown
              </Button>
              {drilldownRows.map((company) => (
                <Link key={company.firm_id} href={`/companies/${company.firm_id}`} style={{ color: "var(--primary)", fontSize: 13 }}>
                  {company.firm_id}: {company.firm_name}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </Grid>
      </div>
    </RequireRole>
  );
}
