import { redirect } from "next/navigation";
import { startOfMonth } from "date-fns";
import { getUser } from "@/lib/supabase/server";
import { getPayoutsForUser, getShopifyConnection } from "@/lib/data/payouts";
import { hasProAccess } from "@/lib/dodo/entitlements";
import { formatMoney, formatRelativeTime } from "@/lib/finance/money";
import { sumPayoutField } from "@/lib/finance/aggregate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SyncButton } from "@/components/payouts/sync-button";
import { PayoutTable } from "@/components/payouts/payout-table";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const connection = await getShopifyConnection(user.id);
  if (!connection) redirect("/connect");

  const payouts = await getPayoutsForUser(user.id);
  const isPro = await hasProAccess(user.id);
  const params = await searchParams;

  const lockedIds = new Set<string>();
  if (!isPro && payouts.length > 1) {
    const sorted = [...payouts].sort(
      (a, b) => new Date(b.payout_date).getTime() - new Date(a.payout_date).getTime(),
    );
    sorted.slice(1).forEach((p) => lockedIds.add(p.id));
  }

  const monthStart = startOfMonth(new Date());
  const monthPayouts = payouts.filter((p) => new Date(p.payout_date) >= monthStart);
  const lastPayout = payouts[0];

  return (
    <div className="space-y-8">
      {params.mock === "true" && (
        <Alert>
          <AlertDescription>
            Showing mock payout data (development mode). Real Shopify data will appear when synced
            from a store with Shopify Payments.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your payouts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See exactly how each Shopify payout reached your bank.
          </p>
          {connection.last_synced_at && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last synced: {formatRelativeTime(connection.last_synced_at)}
            </p>
          )}
        </div>
        <SyncButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {lastPayout ? formatMoney(lastPayout.net_amount, lastPayout.currency) : "—"}
            </p>
            {lastPayout && (
              <p className="text-xs text-muted-foreground">
                {new Date(lastPayout.payout_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatMoney(sumPayoutField(monthPayouts, "gross_sales"))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fees this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {formatMoney(sumPayoutField(monthPayouts, "fees"))}
            </p>
          </CardContent>
        </Card>
      </div>

      <PayoutTable payouts={payouts} lockedIds={lockedIds} />
    </div>
  );
}
