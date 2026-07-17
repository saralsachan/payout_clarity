import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getShopifyConnection } from "@/lib/data/payouts";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const connection = await getShopifyConnection(user.id);

  return (
    <DashboardShell shopDomain={connection?.shop_domain} userEmail={user.email}>
      {children}
    </DashboardShell>
  );
}
