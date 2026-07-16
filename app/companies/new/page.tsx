"use client";

import { FirmForm } from "@/components/firm-form";

export default function NewFirmPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600 }}>New company</h1>
        <div style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>
          Add a company to the satellite industry database.
        </div>
      </header>
      <FirmForm />
    </div>
  );
}
