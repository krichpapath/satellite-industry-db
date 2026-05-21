"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useDatabase } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Input,
  Select,
  Field,
  Grid,
  Button,
  Table,
  Badge,
  StageBadge
} from "@/components/ui";
import { VALUE_CHAIN_STAGES, OWNERSHIP_TYPES, TECH_INTENSITIES } from "@/lib/schema";

export default function SearchPage() {
  const db = useDatabase();
  const [keyword, setKeyword] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [stage, setStage] = useState("");
  const [ownership, setOwnership] = useState("");
  const [techIntensity, setTechIntensity] = useState("");
  const [province, setProvince] = useState("");
  const [minTRL, setMinTRL] = useState("");

  const provinces = useMemo(
    () => Array.from(new Set(db.firms.map((f) => f.province))).sort(),
    [db.firms]
  );

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return db.firms.filter((f) => {
      if (kw) {
        const hay = [
          f.firm_name,
          f.industry_code,
          f.province,
          f.industrial_zone ?? "",
          f.parent_company ?? "",
          f.registration_no
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (ownership && f.ownership_type !== ownership) return false;
      if (province && f.province !== province) return false;
      if (stage) {
        const has = db.products.some((p) => p.firm_id === f.firm_id && p.value_chain_stage === stage);
        if (!has) return false;
      }
      if (techIntensity) {
        const has = db.products.some(
          (p) => p.firm_id === f.firm_id && p.technology_intensity === techIntensity
        );
        if (!has) return false;
      }
      if (minTRL) {
        const t = db.tech.find((x) => x.firm_id === f.firm_id);
        if (!t || t.trl_level < parseInt(minTRL, 10)) return false;
      }
      return true;
    });
  }, [db, keyword, ownership, province, stage, techIntensity, minTRL]);

  function reset() {
    setKeyword("");
    setStage("");
    setOwnership("");
    setTechIntensity("");
    setProvince("");
    setMinTRL("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Search & Query</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Keyword search across firm-level fields. Advanced filters use value-chain, ownership,
          technology intensity, location, TRL.
        </div>
      </header>

      <Card>
        <Grid cols={2} gap={14}>
          <Field label="Keyword">
            <Input
              placeholder="Search firm name, registration, location, parent…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Field>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <Button variant="secondary" onClick={() => setAdvanced((v) => !v)}>
              {advanced ? "Hide advanced filters" : "Show advanced filters"}
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          </div>
        </Grid>

        {advanced && (
          <div style={{ marginTop: 14 }}>
            <Grid cols={3} gap={14}>
              <Field label="Value-chain stage">
                <Select value={stage} onChange={(e) => setStage(e.target.value)}>
                  <option value="">All stages</option>
                  {VALUE_CHAIN_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ownership type">
                <Select value={ownership} onChange={(e) => setOwnership(e.target.value)}>
                  <option value="">All ownership</option>
                  {OWNERSHIP_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Technology intensity">
                <Select value={techIntensity} onChange={(e) => setTechIntensity(e.target.value)}>
                  <option value="">Any intensity</option>
                  {TECH_INTENSITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Province">
                <Select value={province} onChange={(e) => setProvince(e.target.value)}>
                  <option value="">All provinces</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Min TRL">
                <Select value={minTRL} onChange={(e) => setMinTRL(e.target.value)}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>
                      TRL ≥ {n}
                    </option>
                  ))}
                </Select>
              </Field>
            </Grid>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle hint={`${results.length} matching firm(s).`}>Results</SectionTitle>
        <Table
          rows={results}
          empty="No firms match the filters."
          columns={[
            {
              key: "name",
              header: "Firm",
              render: (f) => (
                <Link href={`/firms/${f.firm_id}`} style={{ color: "var(--primary)", fontWeight: 500 }}>
                  {f.firm_name}
                </Link>
              )
            },
            { key: "id", header: "ID", render: (f) => <code>{f.firm_id}</code> },
            { key: "own", header: "Ownership", render: (f) => <Badge>{f.ownership_type}</Badge> },
            { key: "loc", header: "Location", render: (f) => `${f.province}` },
            {
              key: "stage",
              header: "Stages",
              render: (f) => {
                const ss = Array.from(
                  new Set(db.products.filter((p) => p.firm_id === f.firm_id).map((p) => p.value_chain_stage))
                );
                return (
                  <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                    {ss.map((s) => (
                      <StageBadge key={s} stage={s} />
                    ))}
                  </span>
                );
              }
            },
            {
              key: "trl",
              header: "TRL",
              render: (f) => {
                const t = db.tech.find((x) => x.firm_id === f.firm_id);
                return t ? <Badge tone="accent">TRL {t.trl_level}</Badge> : "—";
              }
            }
          ]}
        />
      </Card>
    </div>
  );
}
