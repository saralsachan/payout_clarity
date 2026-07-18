import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { getPayoutById, getPayoutsForUser } from "@/lib/data/payouts";
import { hasProAccess, canAccessPayout } from "@/lib/dodo/entitlements";
import { PayoutDetailClient } from "@/components/payouts/payout-detail-client";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default async function PayoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const result = await getPayoutById(user.id, id);
  if (!result) notFound();

  const allPayouts = await getPayoutsForUser(user.id);
  const isPro = await hasProAccess(user.id);

  if (!canAccessPayout(result.payout, allPayouts, isPro)) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <Lock className="mb-4 size-8 text-muted-foreground" />
          <h2 className="text-lg font-semibold">This payout requires Pro</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Your most recent payout is free. Upgrade to view and export your complete payout
            history.
          </p>
          <UpgradeButton className="mt-6" />
          <Link href="/dashboard" className="mt-4 text-sm text-primary hover:underline">
            Back to payouts
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <PayoutDetailClient payout={result.payout} lineItems={result.lineItems} />;
}
