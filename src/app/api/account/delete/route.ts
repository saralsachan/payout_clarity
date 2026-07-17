import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopifyConnection } from "@/lib/data/payouts";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const connection = await getShopifyConnection(user.id);

  if (connection) {
    const { data: payouts } = await admin
      .from("payouts")
      .select("id")
      .eq("shopify_connection_id", connection.id);

    const payoutIds = (payouts ?? []) as Array<{ id: string }>;
    if (payoutIds.length) {
      const ids = payoutIds.map((p) => p.id);
      await admin.from("payout_line_items").delete().in("payout_id", ids);
      await admin.from("payouts").delete().eq("shopify_connection_id", connection.id);
    }
    await admin.from("shopify_connections").delete().eq("id", connection.id);
  }

  await admin.from("subscriptions").delete().eq("user_id", user.id);

  await admin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ success: true });
}
