"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setEntryRole } from "@/lib/store";
import { Card, EmptyState } from "@/components/ui";
import type { Role } from "@/lib/schema";

export function EntryRedirect({ role, message }: { role: Role; message: string }) {
  const router = useRouter();

  useEffect(() => {
    setEntryRole(role);
    router.replace("/companies");
  }, [role, router]);

  return (
    <Card>
      <EmptyState message={message} />
    </Card>
  );
}
