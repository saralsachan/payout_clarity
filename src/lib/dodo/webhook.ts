import { createAdminClient } from "@/lib/supabase/admin";

type DodoWebhookPayload = {
  data?: Record<string, unknown>;
};

function getMetadataUserId(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  const userId = (metadata as Record<string, unknown>).userId;
  return typeof userId === "string" ? userId : undefined;
}

function extractSubscriptionFields(payload: DodoWebhookPayload) {
  const data = payload.data ?? {};
  const customer = data.customer;
  const customerId =
    typeof data.customer_id === "string"
      ? data.customer_id
      : customer && typeof customer === "object" && typeof (customer as Record<string, unknown>).customer_id === "string"
        ? ((customer as Record<string, unknown>).customer_id as string)
        : undefined;

  const subscriptionId =
    typeof data.subscription_id === "string"
      ? data.subscription_id
      : typeof data.id === "string"
        ? data.id
        : undefined;

  const userId = getMetadataUserId(data.metadata);
  const status = typeof data.status === "string" ? data.status : "active";

  const periodEnd =
    typeof data.next_billing_date === "string"
      ? data.next_billing_date
      : typeof data.current_period_end === "string"
        ? data.current_period_end
        : typeof data.expires_at === "string"
          ? data.expires_at
          : null;

  return { userId, customerId, subscriptionId, status, periodEnd };
}

async function upsertSubscription(
  payload: DodoWebhookPayload,
  plan: "pro" | "free",
  status: string,
) {
  const { userId, customerId, subscriptionId, periodEnd } = extractSubscriptionFields(payload);
  if (!userId) return;

  const admin = createAdminClient();
  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      dodo_customer_id: customerId ?? null,
      dodo_subscription_id: subscriptionId ?? null,
      status,
      plan,
      current_period_end: periodEnd,
    },
    { onConflict: "user_id" },
  );
}

export async function processDodoSubscriptionActive(payload: DodoWebhookPayload) {
  await upsertSubscription(payload, "pro", "active");
}

export async function processDodoSubscriptionRenewed(payload: DodoWebhookPayload) {
  await upsertSubscription(payload, "pro", "active");
}

export async function processDodoSubscriptionUpdated(payload: DodoWebhookPayload) {
  const status = extractSubscriptionFields(payload).status;
  const isActive = status === "active" || status === "trialing";
  await upsertSubscription(payload, isActive ? "pro" : "free", status);
}

export async function processDodoSubscriptionCancelled(payload: DodoWebhookPayload) {
  await upsertSubscription(payload, "free", "canceled");
}

export async function processDodoSubscriptionExpired(payload: DodoWebhookPayload) {
  await upsertSubscription(payload, "free", "expired");
}

export async function processDodoSubscriptionOnHold(payload: DodoWebhookPayload) {
  await upsertSubscription(payload, "free", "on_hold");
}
