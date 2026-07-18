import { CustomerPortal } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getDodoEnvironment, getServerEnv } from "@/lib/env";

export async function GET(request: NextRequest) {
  const bearerToken = getServerEnv().dodoApiKey;
  if (!bearerToken) {
    return NextResponse.json({ error: "Customer portal not configured" }, { status: 503 });
  }

  const handler = CustomerPortal({
    bearerToken,
    environment: getDodoEnvironment(),
  });

  return handler(request);
}
