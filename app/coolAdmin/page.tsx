"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setEntryRole } from "@/lib/store";
import { Card, EmptyState } from "@/components/ui";

export default function CoolAdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    setEntryRole("Admin");
    router.replace("/companies");
  }, [router]);

  return (
    <Card>
      <EmptyState message="Opening admin workspace..." />
    </Card>
  );
}
