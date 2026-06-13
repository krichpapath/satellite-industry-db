"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDatabase } from "@/lib/store";
import {
  Card,
  Input,
  Button,
  Table,
  Badge
} from "@/components/ui";

export default function FirmsPage() {
  const db = useDatabase();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return db.firms.filter((company) =>
      kw ? `${company.firm_name} ${company.firm_id} ${company.province}`.toLowerCase().includes(kw) : true
    );
  }, [db.firms, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header className="page-header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Companies</h1>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            Companies registered in the satellite industry database.
          </div>
        </div>
        <Link href="/firms/new" className="page-header-action">
          <Button>Add company</Button>
        </Link>
      </header>

      <Card>
        <div style={{ marginBottom: 14, maxWidth: 320 }}>
          <Input placeholder="Filter companies..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Table
          rows={rows}
          empty="No companies found."
          columns={[
            {
              key: "name",
              header: "Company",
              render: (company) => (
                <Link href={`/firms/${company.firm_id}`} style={{ color: "var(--primary)", fontWeight: 500 }}>
                  {company.firm_name}
                </Link>
              )
            },
            { key: "id", header: "ID", render: (company) => <code>{company.firm_id}</code> },
            { key: "year", header: "Founded", render: (company) => company.year_established },
            { key: "own", header: "Ownership", render: (company) => <Badge>{company.ownership_type}</Badge> },
            { key: "prov", header: "Province", render: (company) => company.province },
            {
              key: "systems",
              header: "Systems",
              render: (company) => {
                const systems = Array.from(
                  new Set(
                    db.products
                      .filter((component) => component.firm_id === company.firm_id)
                      .map((component) => component.system)
                  )
                );
                return (
                  <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                    {systems.length === 0 ? "-" : systems.map((system) => <Badge key={system} tone="accent">{system}</Badge>)}
                  </span>
                );
              }
            },
            {
              key: "actions",
              header: "",
              render: (company) => (
                <span style={{ display: "inline-flex", gap: 6 }}>
                  <Link href={`/firms/${company.firm_id}`}>
                    <Button variant="secondary" style={{ padding: "5px 10px", fontSize: 12 }}>
                      View
                    </Button>
                  </Link>
                  <Link href={`/firms/${company.firm_id}/edit`}>
                    <Button variant="ghost" style={{ padding: "5px 10px", fontSize: 12 }}>
                      Edit
                    </Button>
                  </Link>
                </span>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
