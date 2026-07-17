"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/shopify/sync", { method: "POST" });
      const data = (await res.json()) as { success: boolean; error?: string; payoutCount?: number };
      if (data.success) {
        toast.success(`Synced ${data.payoutCount ?? 0} payouts`);
        router.refresh();
      } else {
        toast.error(data.error ?? "Sync failed");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
      <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
      Sync payouts
    </Button>
  );
}
