import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayoutsForUser } from "@/lib/data/payouts";
import { hasProAccess, canExportHistory } from "@/lib/dodo/entitlements";
import { buildPayoutCsvRows, rowsToCsv } from "@/lib/csv/export";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPro = await hasProAccess(user.id);
  if (!canExportHistory(isPro)) {
    return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
  }

  const payouts = await getPayoutsForUser(user.id);
  const admin = createAdminClient();
  const allRows = [];

  for (const payout of payouts) {
    const { data: lineItems } = await admin
      .from("payout_line_items")
      .select("*")
      .eq("payout_id", payout.id);
    allRows.push(...buildPayoutCsvRows(payout, lineItems ?? []));
  }

  const csv = rowsToCsv(allRows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="payouts-export.csv"',
    },
  });
}
