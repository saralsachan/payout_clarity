import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getShopifyConnection } from "@/lib/data/payouts";
import { syncPayouts } from "@/lib/shopify/sync";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await getShopifyConnection(user.id);
  if (!connection) {
    return NextResponse.json({ error: "No Shopify connection" }, { status: 400 });
  }

  const result = await syncPayouts(connection);
  return NextResponse.json(result);
}
