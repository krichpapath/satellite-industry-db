"use client";

import Link from "next/link";
import { useState } from "react";
import { useDatabase } from "@/lib/store";
import { Card, SectionTitle, Grid, Badge, Button, EmptyState, RequireRole, LockedNote } from "@/components/ui";
import { COMPONENT_SYSTEMS } from "@/lib/component-taxonomy";

export default function ValueChainPage() {
  const db = useDatabase();
  const [filter, setFilter] = useState<string>("All");
  const systems = COMPONENT_SYSTEMS;
  const visibleSystems = filter === "All" ? systems : systems.filter((system) => system === filter);

  function companiesForSystem(system: string) {
    const companyIds = new Set(
      db.products.filter((component) => component.system === system).map((component) => component.firm_id)
    );
    return db.firms.filter((company) => companyIds.has(company.firm_id));
  }

  return (
    <RequireRole min="Admin" fallback={<LockedNote min="Admin" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>System Coverage</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Companies grouped by satellite component system.
        </div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button variant={filter === "All" ? "primary" : "secondary"} onClick={() => setFilter("All")}>
          All systems
        </Button>
        {systems.map((system) => (
          <Button key={system} variant={filter === system ? "primary" : "secondary"} onClick={() => setFilter(system)}>
            {system}
          </Button>
        ))}
      </div>

      <Grid cols={3} gap={16}>
        {visibleSystems.map((system) => {
          const companies = companiesForSystem(system);
          const components = db.products.filter((component) => component.system === system);
          const moduleCount = new Set(components.map((component) => component.module)).size;
          return (
            <Card key={system}>
              <SectionTitle hint={`${companies.length} companies, ${components.length} components, ${moduleCount} modules`}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Badge tone="accent">{components.length}</Badge>
                  {system}
                </span>
              </SectionTitle>
              {companies.length === 0 ? (
                <EmptyState message="No companies in this system." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {companies.map((company) => {
                    const companyComponents = components.filter((component) => component.firm_id === company.firm_id);
                    return (
                      <Link
                        key={company.firm_id}
                        href={`/companies/${company.firm_id}`}
                        style={{
                          display: "block",
                          padding: 10,
                          borderRadius: 10,
                          background: "var(--surface-muted)"
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{company.firm_name}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                          {Array.from(new Set(companyComponents.map((component) => component.module))).map((module) => (
                            <Badge key={module}>{module}</Badge>
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
    </RequireRole>
  );
}
