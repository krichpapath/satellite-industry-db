"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  History,
  LockKeyhole,
  PackagePlus,
  Save
} from "lucide-react";
import { ComponentRecordsPanel } from "@/components/component-records";
import { commit, getEntryFirmId, useDatabase, useRole } from "@/lib/store";
import { useSessionEmail, useUsers } from "@/lib/users";
import type { Firm } from "@/lib/schema";
import { Badge, Button, Card, EmptyState, Field, Grid, Input, SectionTitle, Table } from "@/components/ui";

type FirmDraft = Pick<Firm, "firm_name" | "website" | "contact_email" | "industrial_zone">;

function firmDraft(firm: Firm): FirmDraft {
  return {
    firm_name: firm.firm_name,
    website: firm.website ?? "",
    contact_email: firm.contact_email ?? "",
    industrial_zone: firm.industrial_zone ?? ""
  };
}

function safeFilePart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function MyCompanyPage() {
  const db = useDatabase();
  const role = useRole();
  const users = useUsers();
  const sessionEmail = useSessionEmail();
  const sessionUser = users.find((user) => user.email === sessionEmail);
  const selectedFirmId = getEntryFirmId();
  const assignedFirmId = sessionUser?.firm_id ?? selectedFirmId ?? null;
  const firm = assignedFirmId ? db.firms.find((item) => item.firm_id === assignedFirmId) : role === "Admin" ? db.firms[0] : undefined;
  const [draft, setDraft] = useState<FirmDraft | null>(firm ? firmDraft(firm) : null);
  const [saveState, setSaveState] = useState("Not saved");

  useEffect(() => {
    setDraft(firm ? firmDraft(firm) : null);
    setSaveState("Not saved");
  }, [firm?.firm_id, firm?.firm_name, firm?.website, firm?.contact_email, firm?.industrial_zone]);

  if (role === "Public") {
    return (
      <div className="account-page">
        <Card>
          <EmptyState message="Sign in as a company employee to open the company workspace." />
          <div className="account-center-action">
            <Link href="/login">
              <Button>Go to sign in</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!firm || !draft) {
    return (
      <div className="account-page">
        <Card>
          <EmptyState message="No company is assigned to this account." />
        </Card>
      </div>
    );
  }

  const canManage = role === "Admin" || (role === "Analyst" && assignedFirmId === firm.firm_id);
  const products = db.products.filter((product) => product.firm_id === firm.firm_id);
  const publicProducts = products.filter((product) => (product.record_state ?? "public") === "public");
  const draftProducts = products.filter((product) => (product.record_state ?? "public") === "draft");
  const systems = Array.from(new Set(products.map((product) => product.system)));
  const companyAudit = db.audit.filter((entry) => entry.firm_id === firm.firm_id).slice(0, 8);
  const otherPublicProducts = db.products
    .filter((product) => product.firm_id !== firm.firm_id && (product.record_state ?? "public") === "public")
    .slice(0, 8);

  function updateDraft<K extends keyof FirmDraft>(key: K, value: FirmDraft[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setSaveState("Unsaved changes");
  }

  function saveProfile() {
    if (!canManage || !firm || !draft) return;
    const name = draft.firm_name.trim();
    if (!name) {
      alert("Company name is required.");
      return;
    }
    commit(
      { action: "update", table: "firms", id: firm.firm_id, summary: `Updated company profile ${name}` },
      (next) => {
        const index = next.firms.findIndex((item) => item.firm_id === firm.firm_id);
        if (index >= 0) {
          next.firms[index] = {
            ...next.firms[index],
            firm_name: name,
            website: (draft.website ?? "").trim() || undefined,
            contact_email: (draft.contact_email ?? "").trim() || undefined,
            industrial_zone: (draft.industrial_zone ?? "").trim() || undefined
          };
        }
      }
    );
    setSaveState("Saved");
  }

  function exportOwnData() {
    if (!firm) return;
    const payload = {
      exported_at: new Date().toISOString(),
      firm,
      products,
      size_finance: db.size_finance.filter((row) => row.firm_id === firm.firm_id),
      tech: db.tech.filter((row) => row.firm_id === firm.firm_id),
      facilities: db.facilities.filter((row) => row.firm_id === firm.firm_id),
      hr: db.hr.filter((row) => row.firm_id === firm.firm_id),
      linkages: db.linkages.filter((row) => row.firm_id === firm.firm_id || row.partner_firm_id === firm.firm_id),
      collabs: db.collabs.filter((row) => row.firm_id === firm.firm_id),
      esg: db.esg.filter((row) => row.firm_id === firm.firm_id),
      audit: db.audit.filter((entry) => entry.firm_id === firm.firm_id)
    };
    downloadJson(`${safeFilePart(firm.firm_name || firm.firm_id)}-company-data-${new Date().toISOString().slice(0, 10)}.json`, payload);
  }

  return (
    <div className="account-page">
      <header className="account-page__header">
        <div>
          <h1>My Company</h1>
          <p>Company-owned profile, components, visibility states, logs, and export.</p>
        </div>
        <Badge tone="accent">Company editor workspace</Badge>
      </header>

      <Card>
        <div className="company-workspace-hero">
          <div className="company-workspace-hero__mark" aria-hidden="true">
            <Building2 size={24} />
          </div>
          <div>
            <h2>{firm.firm_name}</h2>
            <div className="company-workspace-hero__meta">
              <Badge>{firm.province}</Badge>
              <Badge tone="neutral">{firm.ownership_type}</Badge>
              {firm.industrial_zone && <Badge tone="accent">{firm.industrial_zone}</Badge>}
            </div>
          </div>
          <div className="company-workspace-hero__actions">
            <Button variant="secondary" onClick={exportOwnData}>
              <Download size={15} />
              Export data
            </Button>
            <Link href={`/companies/${firm.firm_id}`}>
              <Button variant="secondary">
                View profile
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Grid cols={4} gap={14}>
        <Card>
          <div className="account-metric">
            <PackagePlus size={18} aria-hidden="true" />
            <span>Components</span>
            <strong>{products.length}</strong>
          </div>
        </Card>
        <Card>
          <div className="account-metric">
            <Eye size={18} aria-hidden="true" />
            <span>Public</span>
            <strong>{publicProducts.length}</strong>
          </div>
        </Card>
        <Card>
          <div className="account-metric">
            <ClipboardList size={18} aria-hidden="true" />
            <span>Draft</span>
            <strong>{draftProducts.length}</strong>
          </div>
        </Card>
        <Card>
          <div className="account-metric">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Systems</span>
            <strong>{systems.length}</strong>
          </div>
        </Card>
      </Grid>

      <Grid cols={2} gap={18} style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)" }}>
        <Card>
          <SectionTitle hint="Company editors can update only their assigned company.">
            Company details
          </SectionTitle>
          <Grid cols={2} gap={12}>
            <Field label="Company name" required>
              <Input value={draft.firm_name} onChange={(event) => updateDraft("firm_name", event.target.value)} />
            </Field>
            <Field label="Website">
              <Input type="url" value={draft.website ?? ""} onChange={(event) => updateDraft("website", event.target.value)} />
            </Field>
            <Field label="Public contact email">
              <Input type="email" value={draft.contact_email ?? ""} onChange={(event) => updateDraft("contact_email", event.target.value)} />
            </Field>
            <Field label="Industrial zone / cluster">
              <Input value={draft.industrial_zone ?? ""} onChange={(event) => updateDraft("industrial_zone", event.target.value)} />
            </Field>
          </Grid>
          <div className="account-action-row" style={{ marginTop: 12 }}>
            <Button onClick={saveProfile} disabled={!canManage}>
              <Save size={15} />
              Save profile
            </Button>
            <Badge tone={saveState === "Saved" ? "success" : saveState === "Not saved" ? "neutral" : "warn"}>{saveState}</Badge>
          </div>
        </Card>

        <Card>
          <SectionTitle hint="Draft is private to your company. Public is visible to other companies and visitors.">
            Publishing state
          </SectionTitle>
          <ol className="submission-steps">
            <li>
              <strong>Edit</strong>
              <span>Add or update profile and component records.</span>
            </li>
            <li>
              <strong>Draft</strong>
              <span>Keep unfinished component records inside this workspace.</span>
            </li>
            <li>
              <strong>Public</strong>
              <span>Show finished component records on company pages.</span>
            </li>
            <li>
              <strong>Export</strong>
              <span>Download your company profile, records, and logs.</span>
            </li>
          </ol>
          <div className="account-security-note">
            <LockKeyhole size={16} aria-hidden="true" />
            <span>Other companies can view public components only. Edits stay scoped to this company.</span>
          </div>
        </Card>
      </Grid>

      <Card>
        <SectionTitle hint="Add, edit, and switch each record between draft and public.">
          My component records
        </SectionTitle>
        <ComponentRecordsPanel rows={products} firmId={firm.firm_id} canManage={canManage} />
      </Card>

      <Grid cols={2} gap={18}>
        <Card>
          <SectionTitle hint="Read-only public component records from other companies.">
            Other company components
          </SectionTitle>
          <Table
            rows={otherPublicProducts}
            empty="No public component records from other companies yet."
            getRowKey={(row) => row.product_id}
            columns={[
              { key: "product", header: "Product", render: (row) => row.product_name || row.component_name },
              { key: "company", header: "Company", render: (row) => db.firms.find((item) => item.firm_id === row.firm_id)?.firm_name ?? row.firm_id },
              { key: "system", header: "System", render: (row) => <Badge tone="accent">{row.system}</Badge> },
              { key: "component", header: "Component", render: (row) => row.component_name }
            ]}
          />
        </Card>

        <Card>
          <SectionTitle hint="Recent changes linked to this company.">
            Company logs
          </SectionTitle>
          <Table
            rows={companyAudit}
            empty="No company log entries yet."
            getRowKey={(row) => row.audit_id}
            columns={[
              { key: "time", header: "Time", render: (row) => new Date(row.ts).toLocaleString() },
              { key: "action", header: "Action", render: (row) => <Badge>{row.action}</Badge> },
              { key: "summary", header: "Summary", render: (row) => row.summary },
              { key: "actor", header: "Actor", render: (row) => row.actor ?? row.role }
            ]}
          />
          <div className="account-action-row" style={{ marginTop: 12 }}>
            <Button variant="secondary" onClick={exportOwnData}>
              <History size={15} />
              Export logs and data
            </Button>
          </div>
        </Card>
      </Grid>
    </div>
  );
}