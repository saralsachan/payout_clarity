import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getShopifyConnection } from "@/lib/data/payouts";
import { SettingsClient } from "@/components/settings/settings-client";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const connection = await getShopifyConnection(user.id);

  return (
    <SettingsClient shopDomain={connection?.shop_domain ?? null} userEmail={user.email ?? ""} />
  );
}
