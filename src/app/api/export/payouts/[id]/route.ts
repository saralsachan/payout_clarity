import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getPayoutById, getPayoutsForUser } from "@/lib/data/payouts";
import { hasProAccess, canAccessPayout } from "@/lib/dodo/entitlements";
import { buildPayoutCsvRows, rowsToCsv } from "@/lib/csv/export";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await getPayoutById(user.id, id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allPayouts = await getPayoutsForUser(user.id);
  const isPro = await hasProAccess(user.id);

  if (!canAccessPayout(result.payout, allPayouts, isPro)) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const rows = buildPayoutCsvRows(result.payout, result.lineItems);
  const csv = rowsToCsv(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="payout-${result.payout.shopify_payout_id}.csv"`,
    },
  });
}
