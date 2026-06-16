"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadDb, commit, nextId } from "@/lib/store";
import type { Firm } from "@/lib/schema";
import { OWNERSHIP_TYPES, rolePermissions } from "@/lib/schema";
import { apiConfigured, createFirm as createFirmApi } from "@/lib/api";
import { Card, SectionTitle, Field, Input, Select, Button, Grid, LockedNote } from "./ui";
import { useRole } from "@/lib/store";

export function FirmForm({ initial }: { initial?: Firm }) {
  const router = useRouter();
  const permissions = rolePermissions(useRole());
  const editing = !!initial;
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState("");
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firm_name.trim()) {
      alert("Company name is required.");
      return;
    }
    setSaving(true);
    setSaveState("");

    if (editing) {
      commit(
        { action: "update", table: "firms", id: form.firm_id, summary: `Updated company ${form.firm_name}` },
        (d) => {
          d.firms = d.firms.map((f) =>
            f.firm_id === form.firm_id ? { ...form, last_updated_ts: new Date().toISOString() } : f
          );
        }
      );
      router.push(`/companies/${form.firm_id}`);
      setSaving(false);
      return;
    }

    try {
      const db2 = loadDb();
      const localId = nextId("F", db2.firms.map((f) => ({ firm_id: f.firm_id })), "firm_id");
      let savedFirm: Firm = {
        ...form,
        firm_id: localId,
        last_updated_ts: new Date().toISOString()
      };
      let summary = `Created company ${form.firm_name}`;

      if (apiConfigured()) {
        try {
          savedFirm = await createFirmApi(savedFirm);
          summary = `Created company ${form.firm_name} via API`;
          setSaveState(`Saved company ${savedFirm.firm_id}. Dataset sync will keep linked tabs aligned.`);
        } catch (error) {
          const reason = error instanceof Error ? error.message : "unknown API error";
          console.warn("Company create failed remotely; saved locally instead.", error);
          setSaveState(`Remote save failed: ${reason}. Saved locally for continuity.`);
        }
      } else {
        setSaveState("Saved company locally.");
      }

      commit(
        { action: "create", table: "firms", id: savedFirm.firm_id, summary },
        (d) => {
          d.firms = [
            ...d.firms.filter((f) => f.firm_id !== savedFirm.firm_id),
            savedFirm
          ];
        }
      );
      router.push(`/companies/${savedFirm.firm_id}`);
    } finally {
      setSaving(false);
    }
  }

  function onDelete() {
    if (!editing) return;
    if (!confirm(`Delete ${form.firm_name}? All linked records will also be removed.`)) return;
    commit(
      { action: "delete", table: "firms", id: form.firm_id, summary: `Deleted company ${form.firm_name}` },
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
    router.push("/companies");
  }

  if (editing && !permissions.canEdit) return <LockedNote min="Admin" />;
  if (!editing && !permissions.canCreateCompany) return <LockedNote min="Analyst" />;

  return (
    <>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card>
          <SectionTitle hint="Core company fields used across the database.">
            Company Profile
          </SectionTitle>
          <Grid cols={2} gap={14}>
            <Field label="Company name" required>
              <Input
                value={form.firm_name}
                onChange={(e) => update("firm_name", e.target.value)}
                autoComplete="organization"
              />
            </Field>
            <Field label="Year established">
              <Input
                type="number"
                inputMode="numeric"
                min={1800}
                max={new Date().getFullYear() + 5}
                value={form.year_established}
                onChange={(e) => update("year_established", parseInt(e.target.value, 10) || 0)}
              />
            </Field>
            <Field label="Ownership">
              <Select
                value={form.ownership_type}
                onChange={(e) => update("ownership_type", e.target.value as Firm["ownership_type"])}
              >
                {OWNERSHIP_TYPES.map((ownership) => (
                  <option key={ownership} value={ownership}>
                    {ownership}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Parent company">
              <Input value={form.parent_company ?? ""} onChange={(e) => update("parent_company", e.target.value)} />
            </Field>
            <Field label="Province" helper="Type province name as it should appear in search and dashboard map.">
              <Input
                value={form.province}
                onChange={(e) => update("province", e.target.value)}
                autoComplete="address-level1"
              />
            </Field>
            <Field label="Industrial zone / cluster">
              <Input value={form.industrial_zone ?? ""} onChange={(e) => update("industrial_zone", e.target.value)} />
            </Field>
            <Field label="Website" helper="Use the official company or product page when available.">
              <Input
                type="url"
                inputMode="url"
                autoComplete="url"
                value={form.website ?? ""}
                onChange={(e) => update("website", e.target.value)}
              />
            </Field>
            <Field label="Contact email">
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.contact_email ?? ""}
                onChange={(e) => update("contact_email", e.target.value)}
              />
            </Field>
          </Grid>
          {saveState && <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-soft)" }}>{saveState}</div>}
        </Card>

        <div className="firm-form-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            {editing && permissions.canDelete && (
                <Button variant="danger" onClick={onDelete}>
                  Delete company
                </Button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Add company"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
