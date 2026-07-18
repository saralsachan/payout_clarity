import { Webhooks } from "@dodopayments/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import {
  processDodoSubscriptionActive,
  processDodoSubscriptionCancelled,
  processDodoSubscriptionExpired,
  processDodoSubscriptionOnHold,
  processDodoSubscriptionRenewed,
  processDodoSubscriptionUpdated,
} from "@/lib/dodo/webhook";

const eventHandlers = {
  onSubscriptionActive: processDodoSubscriptionActive,
  onSubscriptionRenewed: processDodoSubscriptionRenewed,
  onSubscriptionUpdated: processDodoSubscriptionUpdated,
  onSubscriptionCancelled: processDodoSubscriptionCancelled,
  onSubscriptionExpired: processDodoSubscriptionExpired,
  onSubscriptionOnHold: processDodoSubscriptionOnHold,
};

export async function POST(request: NextRequest) {
  const webhookKey = getServerEnv().dodoWebhookKey;
  if (!webhookKey) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const handler = Webhooks({ webhookKey, ...eventHandlers });
  return handler(request);
}
