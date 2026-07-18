import { Checkout } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getAppUrl, getDodoEnvironment, getServerEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const bearerToken = getServerEnv().dodoApiKey;
  if (!bearerToken) {
    return NextResponse.json({ error: "Checkout not configured" }, { status: 503 });
  }

  const handler = Checkout({
    bearerToken,
    returnUrl: `${getAppUrl()}/dashboard/billing?success=true`,
    environment: getDodoEnvironment(),
    type: "static",
  });

  return handler(request);
}
