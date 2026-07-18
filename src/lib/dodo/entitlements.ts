import { createAdminClient } from "@/lib/supabase/admin";
import type { Payout } from "@/lib/supabase/database.types";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function hasProAccess(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("status, plan, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return false;
  if (data.plan === "pro" && ACTIVE_STATUSES.has(data.status)) {
    if (data.current_period_end) {
      return new Date(data.current_period_end) > new Date();
    }
    return true;
  }
  return false;
}

export function canAccessPayout(
  payout: Payout,
  allPayouts: Payout[],
  isPro: boolean,
): boolean {
  if (isPro) return true;
  if (allPayouts.length === 0) return false;
  const sorted = [...allPayouts].sort(
    (a, b) => new Date(b.payout_date).getTime() - new Date(a.payout_date).getTime(),
  );
  return sorted[0]?.id === payout.id;
}

export function canExportHistory(isPro: boolean): boolean {
  return isPro;
}

export function canExportLatestPayout(): boolean {
  return true;
}
