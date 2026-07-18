import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getAppUrl, getServerEnv } from "@/lib/env";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dodoProductId } = getServerEnv();
  if (!dodoProductId) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const params = new URLSearchParams({
    productId: dodoProductId,
    metadata_userId: user.id,
  });
  if (user.email) {
    params.set("email", user.email);
  }

  const checkoutRequestUrl = new URL("/api/checkout/dodo", getAppUrl());
  checkoutRequestUrl.search = params.toString();

  const response = await fetch(checkoutRequestUrl.toString(), { method: "GET" });
  if (!response.ok) {
    return NextResponse.json({ error: "Checkout failed" }, { status: 502 });
  }

  const data = (await response.json()) as { checkout_url?: string };
  if (!data.checkout_url) {
    return NextResponse.json({ error: "No checkout URL returned" }, { status: 502 });
  }

  return NextResponse.json({ checkout_url: data.checkout_url });
}
