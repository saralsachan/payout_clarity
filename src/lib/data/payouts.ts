import { startOfMonth, startOfYear, subMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { Payout, PayoutLineItem, ShopifyConnection } from "@/lib/supabase/database.types";

export async function getShopifyConnection(userId: string): Promise<ShopifyConnection | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shopify_connections")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  return data;
}

export async function getPayoutsForUser(userId: string): Promise<Payout[]> {
  const supabase = await createClient();
  const connection = await getShopifyConnection(userId);
  if (!connection) return [];

  const { data } = await supabase
    .from("payouts")
    .select("*")
    .eq("shopify_connection_id", connection.id)
    .order("payout_date", { ascending: false });

  return data ?? [];
}

export async function getPayoutById(
  userId: string,
  payoutId: string,
): Promise<{ payout: Payout; lineItems: PayoutLineItem[] } | null> {
  const supabase = await createClient();
  const connection = await getShopifyConnection(userId);
  if (!connection) return null;

  const { data: payout } = await supabase
    .from("payouts")
    .select("*")
    .eq("id", payoutId)
    .eq("shopify_connection_id", connection.id)
    .maybeSingle();

  if (!payout) return null;

  const { data: lineItems } = await supabase
    .from("payout_line_items")
    .select("*")
    .eq("payout_id", payoutId)
    .order("transaction_date", { ascending: false });

  return { payout, lineItems: lineItems ?? [] };
}

export type SummaryPeriod = "this_month" | "last_month" | "ytd";

export function getPeriodRange(period: SummaryPeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = now;

  switch (period) {
    case "this_month":
      return { start: startOfMonth(now), end };
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: startOfMonth(now) };
    }
    case "ytd":
      return { start: startOfYear(now), end };
  }
}

export async function getSummaryPayouts(userId: string, period: SummaryPeriod) {
  const payouts = await getPayoutsForUser(userId);
  const { start, end } = getPeriodRange(period);
  return payouts.filter((p) => {
    const d = new Date(p.payout_date);
    return d >= start && d < end;
  });
}
