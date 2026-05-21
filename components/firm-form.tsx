"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadDb, commit, nextId } from "@/lib/store";
import type { Firm } from "@/lib/schema";
import { OWNERSHIP_TYPES } from "@/lib/schema";
import { Card, SectionTitle, Field, Input, Select, Button, Grid, RequireRole, LockedNote } from "./ui";
import { useDatabase } from "@/lib/store";

export function FirmForm({ initial }: { initial?: Firm }) {
  const router = useRouter();
  const db = useDatabase();
  const editing = !!initial;
  const [form, setForm] = useState<Firm>(
    initial ?? {
      firm_id: "",
      firm_name: "",
      registration_no: "",
      year_established: new Date().getFullYear(),
      ownership_type: "Local",
      industry_code: "",
      province: "Bangkok",
      industrial_zone: "",
      website: "",
      contact_email: "",
      parent_company: "",
      source_id: ""
    }
  );

  function update<K extends keyof Firm>(key: K, value: Firm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firm_name.trim()) {
      alert("Firm name is required.");
      return;
    }
    if (editing) {
      commit(
        { action: "update", table: "firms", id: form.firm_id, summary: `Updated firm ${form.firm_name}` },
        (d) => {
          d.firms = d.firms.map((f) =>
            f.firm_id === form.firm_id ? { ...form, last_updated_ts: new Date().toISOString() } : f
          );
        }
      );
      router.push(`/firms/${form.firm_id}`);
    } else {
      const db2 = loadDb();
      const id = nextId("F", db2.firms.map((f) => ({ firm_id: f.firm_id })), "firm_id");
      commit(
        { action: "create", table: "firms", id, summary: `Created firm ${form.firm_name}` },
        (d) => {
          d.firms.push({ ...form, firm_id: id, last_updated_ts: new Date().toISOString() });
        }
      );
      router.push("/firms");
    }
  }

  function onDelete() {
    if (!editing) return;
    if (!confirm(`Delete ${form.firm_name}? All linked records will also be removed.`)) return;
    commit(
      { action: "delete", table: "firms", id: form.firm_id, summary: `Deleted firm ${form.firm_name}` },
      (d) => {
        d.firms = d.firms.filter((f) => f.firm_id !== form.firm_id);
        d.size_finance = d.size_finance.filter((r) => r.firm_id !== form.firm_id);
        d.products = d.products.filter((r) => r.firm_id !== form.firm_id);
        d.tech = d.tech.filter((r) => r.firm_id !== form.firm_id);
        d.facilities = d.facilities.filter((r) => r.firm_id !== form.firm_id);
        d.hr = d.hr.filter((r) => r.firm_id !== form.firm_id);
        d.linkages = d.linkages.filter(
          (r) => r.firm_id !== form.firm_id && r.partner_firm_id !== form.firm_id
        );
        d.collabs = d.collabs.filter((r) => r.firm_id !== form.firm_id);
        d.esg = d.esg.filter((r) => r.firm_id !== form.firm_id);
      }
    );
    router.push("/firms");
  }

  return (
    <RequireRole min="Analyst" fallback={<LockedNote min="Analyst" />}>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card>
          <SectionTitle hint="Identity fields from Firm-Level Information layer (paper §3.1).">
            Basic Company Profile
          </SectionTitle>
          <Grid cols={2} gap={14}>
            <Field label="Firm name" required>
              <Input value={form.firm_name} onChange={(e) => update("firm_name", e.target.value)} />
            </Field>
            <Field label="Registration number">
              <Input
                value={form.registration_no}
                onChange={(e) => update("registration_no", e.target.value)}
              />
            </Field>
            <Field label="Year established">
              <Input
                type="number"
                value={form.year_established}
                onChange={(e) => update("year_established", parseInt(e.target.value, 10) || 0)}
              />
            </Field>
            <Field label="Ownership">
              <Select
                value={form.ownership_type}
                onChange={(e) => update("ownership_type", e.target.value as Firm["ownership_type"])}
              >
                {OWNERSHIP_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Parent company">
              <Input
                value={form.parent_company ?? ""}
                onChange={(e) => update("parent_company", e.target.value)}
              />
            </Field>
            <Field label="Industry code">
              <Select
                value={form.industry_code}
                onChange={(e) => update("industry_code", e.target.value)}
              >
                <option value="">—</option>
                {db.vocab.industry_codes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Province">
              <Select value={form.province} onChange={(e) => update("province", e.target.value)}>
                {db.vocab.provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Industrial zone / cluster">
              <Input
                value={form.industrial_zone ?? ""}
                onChange={(e) => update("industrial_zone", e.target.value)}
              />
            </Field>
            <Field label="Website">
              <Input value={form.website ?? ""} onChange={(e) => update("website", e.target.value)} />
            </Field>
            <Field label="Contact email">
              <Input
                type="email"
                value={form.contact_email ?? ""}
                onChange={(e) => update("contact_email", e.target.value)}
              />
            </Field>
            <Field label="Data source">
              <Select
                value={form.source_id ?? ""}
                onChange={(e) => update("source_id", e.target.value)}
              >
                <option value="">—</option>
                {db.sources.map((s) => (
                  <option key={s.source_id} value={s.source_id}>
                    {s.source_id} · {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </Grid>
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            {editing && (
              <RequireRole min="Admin" fallback={<span style={{ fontSize: 12, color: "var(--muted)" }}>Delete needs Admin</span>}>
                <Button variant="danger" onClick={onDelete}>
                  Delete firm
                </Button>
              </RequireRole>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Create firm"}</Button>
          </div>
        </div>
      </form>
    </RequireRole>
  );
}
