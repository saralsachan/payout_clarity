import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getShopifyConnection } from "@/lib/data/payouts";
import { SyncProgress } from "@/components/connect/sync-progress";

export default async function SyncingPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const connection = await getShopifyConnection(user.id);
  if (!connection) redirect("/connect");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <SyncProgress />
    </div>
  );
}
