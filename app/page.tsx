"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Layers, MapPin, Satellite, Boxes } from "lucide-react";
import { useDatabase } from "@/lib/store";
import { Card, Grid, SectionTitle, Badge, EmptyState } from "@/components/ui";
import { ThailandMap } from "@/components/thailand-map";
import { COMPONENT_SYSTEMS } from "@/lib/component-taxonomy";

const item = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] as const } }
};

function StatTile({
  label,
  value,
  hint,
  Icon,
  accent
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  Icon: React.ComponentType<{ size?: number }>;
  accent: string;
}) {
  return (
    <motion.div
      variants={item}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 18,
        boxShadow: "var(--shadow)"
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
    </motion.div>
  );
}

export default function DashboardPage() {
  const db = useDatabase();
  const [provFilter, setProvFilter] = useState<string | null>(null);

  const provinceCounts: Record<string, number> = {};
  for (const company of db.firms) provinceCounts[company.province] = (provinceCounts[company.province] ?? 0) + 1;

  const systemCounts: Record<string, number> = {};
  const moduleSet = new Set<string>();
  for (const component of db.products) {
    systemCounts[component.system] = (systemCounts[component.system] ?? 0) + 1;
    if (component.module) moduleSet.add(component.module);
  }

  const totalComponents = db.products.length || 1;
  const recentComponents = db.products.slice(-6).reverse();

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
          <div style={{ display: "flex", gap: 18, fontSize: 12, opacity: 0.9 }}>
            <span>Companies: <strong className="tabular">{db.firms.length}</strong></span>
            <span>Components: <strong className="tabular">{db.products.length}</strong></span>
          </div>
        </div>
      </motion.header>

      <Grid cols={4}>
        <StatTile label="Companies" value={db.firms.length} hint="Registered companies" Icon={Building2} accent="var(--primary)" />
        <StatTile label="Components" value={db.products.length} hint="Component records" Icon={Boxes} accent="var(--accent)" />
        <StatTile label="Systems" value={Object.keys(systemCounts).length} hint="Systems represented" Icon={Satellite} accent="var(--success)" />
        <StatTile label="Modules" value={moduleSet.size} hint="Modules represented" Icon={Layers} accent="var(--warn)" />
      </Grid>

      <Grid cols={2}>
        <motion.div variants={item}>
          <Card>
            <SectionTitle hint="Distribution of component records by expert System category.">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Layers size={18} style={{ color: "var(--accent)" }} />
                Component Records by System
              </span>
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {COMPONENT_SYSTEMS.map((system) => {
                const count = systemCounts[system] ?? 0;
                const pct = Math.round((count / totalComponents) * 100);
                return (
                  <div key={system}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{system}</span>
                      <span className="tabular" style={{ color: "var(--muted)" }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: "var(--surface-muted)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <SectionTitle hint="Company distribution by province. Select a province to inspect companies.">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} style={{ color: "var(--warn)" }} />
                Geographic Distribution
              </span>
            </SectionTitle>
            <ThailandMap counts={provinceCounts} selected={provFilter} onSelect={setProvFilter} />
            {provFilter && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                  Companies in <strong>{provFilter}</strong>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {db.firms
                    .filter((company) => company.province === provFilter)
                    .map((company) => (
                      <Link key={company.firm_id} href={`/firms/${company.firm_id}`} style={{ color: "var(--primary)", fontSize: 13 }}>
                        {company.firm_id}: {company.firm_name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </Grid>

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
                    href={`/firms/${component.firm_id}`}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      padding: 12,
                      background: "var(--surface)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                      <strong style={{ fontSize: 13 }}>{company?.firm_name ?? component.firm_id}</strong>
                      <Badge tone="accent">{component.product_id}</Badge>
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
