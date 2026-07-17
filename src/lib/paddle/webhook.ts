import { EventName } from "@paddle/paddle-node-sdk";
import { createAdminClient } from "@/lib/supabase/admin";

type PaddleSubscriptionData = {
  id: string;
  status: string;
  customerId: string;
  currentBillingPeriod?: { endsAt: string };
  customData?: Record<string, unknown>;
};

function mapPaddleStatus(status: string): string {
  const map: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    canceled: "canceled",
    past_due: "past_due",
    paused: "paused",
  };
  return map[status] ?? status;
}

async function upsertSubscription(data: PaddleSubscriptionData) {
  const admin = createAdminClient();
  const userId = data.customData?.userId as string | undefined;
  if (!userId) return;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_customer_id: data.customerId,
      paddle_subscription_id: data.id,
      status: mapPaddleStatus(data.status),
      plan: data.status === "canceled" ? "free" : "pro",
      current_period_end: data.currentBillingPeriod?.endsAt ?? null,
    },
    { onConflict: "user_id" },
  );
}

export async function processPaddleEvent(eventType: string, data: unknown) {
  const record = data as Record<string, unknown>;

  switch (eventType) {
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionResumed: {
      await upsertSubscription(record as unknown as PaddleSubscriptionData);
      break;
    }
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPaused: {
      await upsertSubscription({
        ...(record as unknown as PaddleSubscriptionData),
        status: "canceled",
      });
      break;
    }
    default:
      break;
  }
}
