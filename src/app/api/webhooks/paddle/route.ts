import { NextResponse } from "next/server";
import { getPaddleClient } from "@/lib/paddle/client";
import { processPaddleEvent } from "@/lib/paddle/webhook";
import { getServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature") ?? "";
  const rawBody = await request.text();
  const secret = getServerEnv().paddleWebhookSecret;

  if (!signature || !rawBody) {
    return NextResponse.json({ error: "Missing signature or body" }, { status: 400 });
  }

  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    const paddle = getPaddleClient();
    const eventData = await paddle.webhooks.unmarshal(rawBody, secret, signature);
    if (eventData) {
      await processPaddleEvent(eventData.eventType, eventData.data);
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 500 });
  }
}
