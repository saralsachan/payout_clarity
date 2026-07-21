import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getShopifyConnection } from "@/lib/data/payouts";
import { ConnectShopifyForm } from "@/components/connect/connect-form";

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const connection = await getShopifyConnection(user.id);
  if (connection) redirect("/dashboard");

  const params = await searchParams;
  const errorMessages: Record<string, string> = {
    oauth_failed: "Shopify authorization failed. Please try again.",
    invalid_state: "Security validation failed. Please try connecting again.",
    token_exchange_failed: "Could not complete Shopify connection.",
    "Shopify Payments not available for this store":
      "Payout Clarity currently works with stores using Shopify Payments.",
  };

  const error = params.error ? (errorMessages[params.error] ?? decodeURIComponent(params.error)) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dashboard-bg px-4 py-12">
      <ConnectShopifyForm error={error} />
    </div>
  );
}
