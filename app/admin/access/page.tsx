"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, KeyRound, ShieldCheck, UserCog, UserPlus } from "lucide-react";
import { useDatabase } from "@/lib/store";
import { addUser, removeUser, resetUserPassword, setUserActive, useUsers } from "@/lib/users";
import { Badge, Button, Card, Field, Grid, Input, RequireRole, SectionTitle, Select, Table } from "@/components/ui";

type AccessTab = "users" | "companies";

export default function AccessControlPage() {
  const db = useDatabase();
  const users = useUsers();
  const [tab, setTab] = useState<AccessTab>("users");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyId, setCompanyId] = useState("");
  const selectedCompanyId = companyId || db.firms[0]?.firm_id || "";
  const [access, setAccess] = useState<"Company editor" | "Admin">("Company editor");
  const [notice, setNotice] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const editorsByFirm = useMemo(() => {
    const map = new Map<string, typeof users>();
    for (const user of users) {
      if (user.role !== "Analyst" || !user.firm_id) continue;
      map.set(user.firm_id, [...(map.get(user.firm_id) ?? []), user]);
    }
    return map;
  }, [users]);

  const companyRows = db.firms.map((firm) => {
    const editors = (editorsByFirm.get(firm.firm_id) ?? []).filter((user) => user.active);
    return {
      ...firm,
      owner: editors[0]?.email ?? "-",
      editors: editors.length,
      records: db.products.filter((product) => product.firm_id === firm.firm_id).length
    };
  });

  const unassignedCount = companyRows.filter((company) => company.editors === 0).length;
  const activeCount = users.filter((user) => user.active).length;

  function createAccount() {
    const result = addUser({
      name,
      email,
      role: access === "Admin" ? "Admin" : "Analyst",
      firm_id: access === "Admin" ? null : selectedCompanyId
    });
    if (!result.ok) {
      setNotice({ tone: "danger", text: result.reason });
      return;
    }
    setNotice({
      tone: "success",
      text: `Account created for ${result.user.email}. Temporary password: ${result.password} — share it with the user directly.`
    });
    setName("");
    setEmail("");
  }

  function resetPassword(userId: string, userEmail: string) {
    const password = resetUserPassword(userId);
    setNotice({ tone: "success", text: `New password for ${userEmail}: ${password} — share it with the user directly.` });
  }

  return (
    <RequireRole min="Admin" fallback={<Card><SectionTitle>Access Control</SectionTitle><p style={{ margin: 0, color: "var(--muted)" }}>Admin access is required.</p></Card>}>
      <div className="account-page">
        <header className="account-page__header">
          <div>
            <h1>Access Control</h1>
            <p>Create accounts, assign company editors, and check that every company has an owner.</p>
          </div>
          <Badge tone="success">Admin</Badge>
        </header>

        <Grid cols={4} gap={14}>
          <Card><div className="account-metric"><UserCog size={18} /><span>Accounts</span><strong>{users.length}</strong></div></Card>
          <Card><div className="account-metric"><ShieldCheck size={18} /><span>Active</span><strong>{activeCount}</strong></div></Card>
          <Card><div className="account-metric"><Building2 size={18} /><span>Assigned companies</span><strong>{companyRows.length - unassignedCount}</strong></div></Card>
          <Card><div className="account-metric"><Building2 size={18} /><span>Unassigned</span><strong>{unassignedCount}</strong></div></Card>
        </Grid>

        <Card>
          <div className="access-tabs" role="tablist" aria-label="Access control sections">
            {[
              ["users", "Users"],
              ["companies", "Company access"]
            ].map(([key, label]) => (
              <Button
                key={key}
                variant={tab === key ? "primary" : "secondary"}
                onClick={() => setTab(key as AccessTab)}
                ariaLabel={`Show ${label}`}
              >
                {label}
              </Button>
            ))}
          </div>

          {tab === "users" && (
            <div className="access-section">
              <SectionTitle hint="A temporary password is generated for each new account. Share it directly; email delivery arrives with the backend.">
                Create account
              </SectionTitle>
              <div className="invite-row">
                <Field label="Name">
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Work email">
                  <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.co.th" />
                </Field>
                <Field label="Access">
                  <Select value={access} onChange={(event) => setAccess(event.target.value as typeof access)}>
                    <option>Company editor</option>
                    <option>Admin</option>
                  </Select>
                </Field>
                {access === "Company editor" && (
                  <Field label="Company">
                    <Select value={selectedCompanyId} onChange={(event) => setCompanyId(event.target.value)}>
                      {db.firms.map((firm) => (
                        <option key={firm.firm_id} value={firm.firm_id}>{firm.firm_name}</option>
                      ))}
                    </Select>
                  </Field>
                )}
                <Button onClick={createAccount} disabled={!email.trim()}>
                  <UserPlus size={15} />
                  Create
                </Button>
              </div>

              {notice && (
                <div
                  role="status"
                  style={{
                    margin: "10px 0 0",
                    padding: "10px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    background: notice.tone === "success" ? "var(--success-soft)" : "var(--danger-soft)",
                    color: notice.tone === "success" ? "var(--success)" : "var(--danger)"
                  }}
                >
                  {notice.text}
                </div>
              )}

              <Table
                rows={users}
                getRowKey={(row) => row.user_id}
                columns={[
                  { key: "user", header: "User", render: (row) => <div><strong>{row.name}</strong><br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{row.email}</span></div> },
                  { key: "account", header: "Account", render: (row) => <Badge tone={row.role === "Admin" ? "success" : "accent"}>{row.role === "Admin" ? "Admin" : "Company editor"}</Badge> },
                  { key: "company", header: "Company scope", render: (row) => row.firm_id ? (db.firms.find((firm) => firm.firm_id === row.firm_id)?.firm_name ?? row.firm_id) : "All companies" },
                  { key: "status", header: "Status", render: (row) => <Badge tone={row.active ? "success" : "warn"}>{row.active ? "Active" : "Disabled"}</Badge> },
                  {
                    key: "actions",
                    header: "",
                    render: (row) => (
                      <div className="table-action-row">
                        <Button variant="ghost" title="Generate a new temporary password" onClick={() => resetPassword(row.user_id, row.email)}>
                          <KeyRound size={14} />
                          Reset password
                        </Button>
                        <Button variant="ghost" onClick={() => setUserActive(row.user_id, !row.active)}>
                          {row.active ? "Disable" : "Enable"}
                        </Button>
                        <Button variant="ghost" onClick={() => removeUser(row.user_id)}>
                          Remove
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          )}

          {tab === "companies" && (
            <div className="access-section">
              <SectionTitle hint="Each company should have an active editor account before self-service editing goes live.">
                Company ownership
              </SectionTitle>
              <Table
                rows={companyRows}
                getRowKey={(row) => row.firm_id}
                columns={[
                  { key: "company", header: "Company", render: (row) => <Link href={`/companies/${row.firm_id}`} style={{ color: "var(--primary)", fontWeight: 600 }}>{row.firm_name}</Link> },
                  { key: "owner", header: "Primary editor", render: (row) => row.owner },
                  { key: "editors", header: "Editors", render: (row) => <Badge tone={row.editors > 0 ? "success" : "warn"}>{row.editors}</Badge> },
                  { key: "records", header: "Records", render: (row) => row.records },
                  { key: "actions", header: "", render: (row) => <Link href={`/companies/${row.firm_id}`}><Button variant="secondary">Open</Button></Link> }
                ]}
              />
            </div>
          )}
        </Card>
      </div>
    </RequireRole>
  );
}
