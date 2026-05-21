"use client";

import { useState } from "react";
import { useDatabase, commit } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Button,
  Field,
  Input,
  Grid,
  Badge,
  RequireRole,
  LockedNote
} from "@/components/ui";
import type { Vocab } from "@/lib/schema";

const LABELS: Record<keyof Vocab, string> = {
  ownership_types: "Ownership types",
  value_chain_stages: "Value-chain stages (OECD)",
  tech_intensities: "Tech intensities (OECD)",
  linkage_types: "Linkage types",
  partner_types: "Partner types",
  collab_types: "Collaboration types",
  provinces: "Provinces",
  industry_codes: "Industry codes (ISIC / NAICS firm-level)",
  core_technologies: "Core technologies",
  sia_categories: "SIA categories",
  itu_services: "ITU radio services",
  orbit_types: "Orbit class",
  frequency_bands: "ITU-R frequency bands",
  naics_codes: "NAICS 2022 (product-level)",
  hs_codes: "HS 2022 (product-level)"
};

const HINTS: Partial<Record<keyof Vocab, string>> = {
  core_technologies: "Used in the Gap Analysis heatmap rows.",
  industry_codes: "ISIC / NAICS codes used in firm forms.",
  provinces: "Geographic options. Adding new ones also requires updating the SVG map for them to appear."
};

export default function TaxonomyPage() {
  const db = useDatabase();
  const [newValue, setNewValue] = useState<Record<string, string>>({});

  function addTerm(key: keyof Vocab) {
    const v = (newValue[key] ?? "").trim();
    if (!v) return;
    if (db.vocab[key].includes(v)) {
      alert("Already exists.");
      return;
    }
    commit(
      { action: "create", table: "vocab", id: key, summary: `Added "${v}" to ${key}` },
      (d) => {
        d.vocab[key] = [...d.vocab[key], v];
      }
    );
    setNewValue((p) => ({ ...p, [key]: "" }));
  }

  function removeTerm(key: keyof Vocab, term: string) {
    if (!confirm(`Remove "${term}" from ${key}? Existing records keeping this value will become orphaned.`)) return;
    commit(
      { action: "delete", table: "vocab", id: key, summary: `Removed "${term}" from ${key}` },
      (d) => {
        d.vocab[key] = d.vocab[key].filter((t) => t !== term);
      }
    );
  }

  return (
    <RequireRole min="Analyst" fallback={<LockedNote min="Analyst" />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <header>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Taxonomy / Controlled Vocabularies</h1>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            Paper §design principle 3 — Data Standardization. These lists drive every dropdown in the system.
          </div>
        </header>

        <Grid cols={2} gap={18}>
          {(Object.keys(LABELS) as (keyof Vocab)[]).map((key) => (
            <Card key={key}>
              <SectionTitle hint={HINTS[key]}>{LABELS[key]}</SectionTitle>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {db.vocab[key].map((term) => (
                  <span
                    key={term}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      background: "var(--surface-muted)",
                      borderRadius: 999,
                      fontSize: 12
                    }}
                  >
                    {term}
                    <button
                      onClick={() => removeTerm(key, term)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "var(--danger)",
                        cursor: "pointer",
                        fontSize: 13,
                        padding: 0
                      }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {db.vocab[key].length === 0 && <Badge>Empty</Badge>}
              </div>
              <Field label="Add term">
                <div style={{ display: "flex", gap: 6 }}>
                  <Input
                    value={newValue[key] ?? ""}
                    onChange={(e) => setNewValue((p) => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTerm(key);
                      }
                    }}
                  />
                  <Button onClick={() => addTerm(key)}>Add</Button>
                </div>
              </Field>
            </Card>
          ))}
        </Grid>
      </div>
    </RequireRole>
  );
}
