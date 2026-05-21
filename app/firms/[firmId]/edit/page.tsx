"use client";

import { use } from "react";
import { useDatabase } from "@/lib/store";
import { FirmForm } from "@/components/firm-form";

export default function EditFirmPage({ params }: { params: Promise<{ firmId: string }> }) {
  const { firmId } = use(params);
  const db = useDatabase();
  const firm = db.firms.find((f) => f.firm_id === firmId);

  if (!firm) return <div>Firm not found.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>Edit {firm.firm_name}</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Update identity fields for this firm.
        </div>
      </header>
      <FirmForm initial={firm} />
    </div>
  );
}
