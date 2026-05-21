"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useDatabase } from "@/lib/store";
import {
  Card,
  SectionTitle,
  Input,
  Button,
  Table,
  Badge,
  StageBadge
} from "@/components/ui";

export default function FirmsPage() {
  const db = useDatabase();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return db.firms.filter((f) =>
      kw ? `${f.firm_name} ${f.firm_id} ${f.province}`.toLowerCase().includes(kw) : true
    );
  }, [db.firms, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Firms</h1>
          <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
            All organizations registered in the satellite industry database.
          </div>
        </div>
        <Link href="/firms/new">
          <Button>+ New firm</Button>
        </Link>
      </header>

      <Card>
        <div style={{ marginBottom: 14, maxWidth: 320 }}>
          <Input placeholder="Filter firms…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Table
          rows={rows}
          empty="No firms found."
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
            { key: "year", header: "Founded", render: (f) => f.year_established },
            { key: "own", header: "Ownership", render: (f) => <Badge>{f.ownership_type}</Badge> },
            { key: "prov", header: "Province", render: (f) => f.province },
            {
              key: "stages",
              header: "Value chain",
              render: (f) => {
                const ss = Array.from(
                  new Set(
                    db.products
                      .filter((p) => p.firm_id === f.firm_id)
                      .map((p) => p.value_chain_stage)
                  )
                );
                return (
                  <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                    {ss.length === 0 ? "—" : ss.map((s) => <StageBadge key={s} stage={s} />)}
                  </span>
                );
              }
            },
            {
              key: "actions",
              header: "",
              render: (f) => (
                <span style={{ display: "inline-flex", gap: 6 }}>
                  <Link href={`/firms/${f.firm_id}`}>
                    <Button variant="secondary" style={{ padding: "5px 10px", fontSize: 12 }}>
                      View
                    </Button>
                  </Link>
                  <Link href={`/firms/${f.firm_id}/edit`}>
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
