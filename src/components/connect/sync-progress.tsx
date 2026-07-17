"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const steps = [
  "Fetching Shopify Payments data...",
  "Matching transactions...",
  "Calculating payout breakdowns...",
];

export function SyncProgress() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 1500);

    async function runSync() {
      try {
        const res = await fetch("/api/shopify/sync", { method: "POST" });
        const data = (await res.json()) as {
          success: boolean;
          error?: string;
          mock?: boolean;
        };
        clearInterval(interval);
        if (data.success) {
          router.push(data.mock ? "/dashboard?mock=true" : "/dashboard");
          router.refresh();
        } else {
          setError(data.error ?? "Sync failed");
        }
      } catch {
        clearInterval(interval);
        setError("Unable to sync payouts. Please try again.");
      }
    }

    runSync();
    return () => clearInterval(interval);
  }, [router]);

  if (error) {
    return (
      <Card className="mx-auto max-w-lg border-border">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Sync issue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a href="/connect" className="mt-4 inline-block text-sm text-primary hover:underline">
            Back to connect
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-lg border-border">
      <CardHeader className="text-center">
        <Loader2 className="mx-auto mb-4 size-8 animate-spin text-primary" />
        <CardTitle className="text-2xl font-semibold tracking-tight">
          We&apos;re organizing your payouts.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            {i <= step ? (
              <span className="text-primary">●</span>
            ) : (
              <Skeleton className="size-2 rounded-full" />
            )}
            <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>
              {label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
