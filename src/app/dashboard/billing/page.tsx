import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getUser } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { hasProAccess } from "@/lib/paddle/entitlements";
import { getCustomerPortalUrl } from "@/lib/paddle/client";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function BillingPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPro = await hasProAccess(user.id);
  let portalUrl: string | null = null;

  if (isPro && subscription?.paddle_customer_id) {
    try {
      portalUrl = await getCustomerPortalUrl(subscription.paddle_customer_id);
    } catch {
      portalUrl = null;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your subscription</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current plan</CardTitle>
          <CardDescription>
            {isPro ? "Payout Clarity Pro" : "Free — latest payout preview"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={isPro ? "default" : "outline"}>
              {subscription?.status ?? "free"}
            </Badge>
          </div>
          {subscription?.current_period_end && isPro && (
            <p className="text-sm text-muted-foreground">
              Next billing date:{" "}
              {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
            </p>
          )}
          {isPro && portalUrl ? (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants())}
            >
              Manage billing
            </a>
          ) : !isPro ? (
            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <h3 className="font-semibold">Payout Clarity Pro</h3>
              <p className="mt-1 text-2xl font-semibold tabular-nums">$9/month</p>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                <li>Full payout history</li>
                <li>CSV exports</li>
                <li>Monthly / YTD summary</li>
              </ul>
              <UpgradeButton userId={user.id} userEmail={user.email} className="mt-4" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure Paddle customer portal in your Paddle dashboard.
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link href="/dashboard/settings" className="text-primary hover:underline">
          Account settings
        </Link>
      </p>
    </div>
  );
}
