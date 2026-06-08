"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import {
  Building2,
  Users,
  Banknote,
  FlaskConical,
  TrendingUp,
  MapPin,
  Layers,
  Network,
  ArrowUpRight
} from "lucide-react";
import { useDatabase } from "@/lib/store";
import { Card, Grid, SectionTitle, StageBadge, Badge } from "@/components/ui";
import { ThailandMap } from "@/components/thailand-map";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] as const } }
};

const hoverSpring = { type: "spring" as const, stiffness: 280, damping: 20 };

function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
  useEffect(() => {
    const c = animate(mv, value, { duration: 1.1, ease: "easeOut" });
    return c.stop;
  }, [value, mv]);
  return (
    <span className="tabular">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

function StatTile({
  label,
  value,
  hint,
  Icon,
  accent
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string;
}) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={hoverSpring}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 14,
        padding: 18,
        boxShadow: "var(--shadow)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Icon size={16} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--ink)" }}>{value}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{hint}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const db = useDatabase();
  const [provFilter, setProvFilter] = useState<string | null>(null);

  const totalFirms = db.firms.length;
  const totalEmployees = db.size_finance.reduce((s, r) => s + r.employees_total, 0);
  const totalRevenue = db.size_finance.reduce((s, r) => s + r.annual_revenue_mthb, 0);
  const totalRD = db.tech.reduce((s, r) => s + r.rd_expenditure_mthb, 0);
  const totalPatents = db.tech.reduce((s, r) => s + r.patents_count, 0);

  const stageCounts: Record<string, number> = { Upstream: 0, Midstream: 0, Downstream: 0 };
  for (const p of db.products) stageCounts[p.value_chain_stage] = (stageCounts[p.value_chain_stage] ?? 0) + 1;

  const provinceCounts: Record<string, number> = {};
  for (const f of db.firms) provinceCounts[f.province] = (provinceCounts[f.province] ?? 0) + 1;

  const techMax = Math.max(...db.tech.map((t) => t.rd_expenditure_mthb), 1);
  const sortedTech = [...db.tech].sort((a, b) => b.rd_expenditure_mthb - a.rd_expenditure_mthb);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <motion.header variants={item} className="hero-band">
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
            flexWrap: "wrap"
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                opacity: 0.85,
                marginBottom: 8,
                letterSpacing: 0.5,
                textTransform: "uppercase"
              }}
            >
              <span className="pulse-dot" /> Live · localStorage prototype
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Product / Service Records</h1>
            <div style={{ marginTop: 6, fontSize: 14, opacity: 0.85, maxWidth: 620 }}>
              Product and service portfolio across all registered satellite firms.
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 12, opacity: 0.9 }}>
            <span>
              Firms · <strong className="tabular">{db.firms.length}</strong>
            </span>
            <span>
              Products · <strong className="tabular">{db.products.length}</strong>
            </span>
          </div>
        </div>
      </motion.header>

      <Grid cols={4}>
        <StatTile
          label="Firms"
          value={<AnimatedNumber value={totalFirms} />}
          hint="Registered organizations"
          Icon={Building2}
          accent="var(--primary)"
        />
        <StatTile
          label="Workforce"
          value={<AnimatedNumber value={totalEmployees} />}
          hint="Total employees"
          Icon={Users}
          accent="var(--accent)"
        />
        <StatTile
          label="Revenue"
          value={<AnimatedNumber value={totalRevenue / 1000} decimals={2} suffix=" BTHB" />}
          hint="Annual revenue"
          Icon={Banknote}
          accent="var(--warn)"
        />
        <StatTile
          label="R&D / Patents"
          value={
            <span>
              <AnimatedNumber value={totalRD} suffix="M" /> / <AnimatedNumber value={totalPatents} />
            </span>
          }
          hint="THB · patents"
          Icon={FlaskConical}
          accent="var(--success)"
        />
      </Grid>

      <Grid cols={2}>
        <motion.div variants={item} whileHover={{ y: -3 }} transition={hoverSpring}>
          <Card className="hover-lift">
            <SectionTitle hint="Distribution of products/services by value-chain segment.">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Layers size={18} style={{ color: "var(--accent)" }} />
                Product / Service Records
              </span>
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(["Upstream", "Midstream", "Downstream"] as const).map((stage, i) => {
                const n = stageCounts[stage];
                const total = db.products.length || 1;
                const pct = Math.round((n / total) * 100);
                const color =
                  stage === "Upstream"
                    ? "var(--accent)"
                    : stage === "Midstream"
                    ? "var(--warn)"
                    : "var(--success)";
                return (
                  <div key={stage}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <StageBadge stage={stage} />
                        <span style={{ color: "var(--muted)" }}>{n} products</span>
                      </span>
                      <strong className="tabular">{pct}%</strong>
                    </div>
                    <div
                      style={{
                        height: 10,
                        background: "var(--surface-muted)",
                        borderRadius: 999,
                        overflow: "hidden"
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                        style={{
                          height: "100%",
                          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, white))`,
                          borderRadius: 999
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -3 }} transition={hoverSpring}>
          <Card className="hover-lift">
            <SectionTitle hint='Click a province bubble to filter. "แผนที่ข้อมูล" per §6.1.'>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <MapPin size={18} style={{ color: "var(--warn)" }} />
                Geographic Distribution
              </span>
            </SectionTitle>
            <ThailandMap counts={provinceCounts} selected={provFilter} onSelect={setProvFilter} />
            {provFilter && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}
              >
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                  Firms in <strong>{provFilter}</strong> ({provinceCounts[provFilter] ?? 0})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {db.firms
                    .filter((f) => f.province === provFilter)
                    .map((f) => (
                      <Link
                        key={f.firm_id}
                        href={`/firms/${f.firm_id}`}
                        className="row-hover"
                        style={{ color: "var(--primary)", fontSize: 13, padding: "4px 8px" }}
                      >
                        · {f.firm_name}
                      </Link>
                    ))}
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </Grid>

      <motion.div variants={item}>
        <Card>
          <SectionTitle hint="Annual R&D expenditure by firm. Click a bar to open the firm profile.">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} style={{ color: "var(--primary)" }} />
              R&D Investment by Firm
            </span>
          </SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sortedTech.map((t, i) => {
              const firm = db.firms.find((f) => f.firm_id === t.firm_id);
              const pct = (t.rd_expenditure_mthb / techMax) * 100;
              return (
                <motion.div
                  key={t.tech_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.04 }}
                >
                  <Link
                    href={`/firms/${t.firm_id}`}
                    className="row-hover"
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 8px" }}
                  >
                    <span style={{ fontSize: 13, minWidth: 200 }}>{firm?.firm_name ?? t.firm_id}</span>
                    <div
                      style={{
                        flex: 1,
                        height: 18,
                        background: "var(--surface-muted)",
                        borderRadius: 6,
                        overflow: "hidden"
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, var(--primary), var(--accent))",
                          borderRadius: 6
                        }}
                      />
                    </div>
                    <span className="tabular" style={{ fontSize: 13, minWidth: 90, textAlign: "right" }}>
                      {t.rd_expenditure_mthb} MTHB
                    </span>
                    <Badge tone="accent">TRL {t.trl_level}</Badge>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <Grid cols={2}>
        <motion.div variants={item} whileHover={{ y: -3 }} transition={hoverSpring}>
          <Card className="hover-lift">
            <SectionTitle hint="Quick links into core data layers.">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Layers size={18} style={{ color: "var(--success)" }} />
                Data Layers (paper §3)
              </span>
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
              {[
                { k: "Firm-Level Information", n: db.firms.length },
                { k: "Industrial Structure / Value Chain", n: db.products.length },
                { k: "Technology & Innovation", n: db.tech.length },
                { k: "Human Resource & Skill", n: db.hr.length },
                { k: "Supply Chain & Ecosystem", n: db.linkages.length },
                { k: "Investment / Financial", n: db.size_finance.length },
                { k: "Sustainability & ESG", n: db.esg.length }
              ].map((row, i) => (
                <motion.div
                  key={row.k}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                  className="row-hover"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px"
                  }}
                >
                  <span style={{ color: "var(--ink-soft)" }}>{row.k}</span>
                  <Badge tone="neutral">{row.n}</Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -3 }} transition={hoverSpring}>
          <Card className="hover-lift">
            <SectionTitle hint="Top collaborations between firms and research/academic partners.">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Network size={18} style={{ color: "var(--accent)" }} />
                Innovation Collaborations
              </span>
            </SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {db.collabs.slice(0, 6).map((c, i) => {
                const firm = db.firms.find((f) => f.firm_id === c.firm_id);
                return (
                  <motion.div
                    key={c.collab_id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                    whileHover={{ x: 3 }}
                    className="row-hover"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      padding: "6px 8px"
                    }}
                  >
                    <Badge tone="accent">{c.partner_type}</Badge>
                    <span style={{ flex: 1 }}>
                      <strong>{firm?.firm_name}</strong> ↔ {c.partner_name}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      {c.collaboration_type} · {c.duration_years}y
                    </span>
                    <ArrowUpRight size={14} style={{ color: "var(--muted)" }} />
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </Grid>
    </motion.div>
  );
}
