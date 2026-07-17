import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUser } from "@/lib/supabase/server";
import { getSummaryPayouts, type SummaryPeriod } from "@/lib/data/payouts";
import { SummaryClient } from "@/components/payouts/summary-client";
import { Skeleton } from "@/components/ui/skeleton";

async function SummaryContent({ period }: { period: SummaryPeriod }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const payouts = await getSummaryPayouts(user.id, period);
  return <SummaryClient payouts={payouts} period={period} />;
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period ?? "this_month") as SummaryPeriod;

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      <SummaryContent period={period} />
    </Suspense>
  );
}
