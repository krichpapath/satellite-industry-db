"use client";

import { use } from "react";
import Link from "next/link";
import { useDatabase, useRole } from "@/lib/store";
import { Button, Card, EmptyState } from "@/components/ui";
import { FirmForm } from "@/components/firm-form";

export default function EditFirmPage({ params }: { params: Promise<{ firmId: string }> }) {
  const { firmId } = use(params);
  const db = useDatabase();
  const role = useRole();
  const canManage = role === "Admin";
  const firm = db.firms.find((f) => f.firm_id === firmId);

  if (!firm) return <div>Company not found.</div>;

  if (!canManage) {
    return (
      <Card>
        <EmptyState message="Admin access is required to edit this profile." />
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link href={`/companies/${firmId}`}>
            <Button variant="secondary">Back to company</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Edit {firm.firm_name}</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Update company profile fields.
        </div>
      </header>
      <FirmForm initial={firm} />
    </div>
  );
}
