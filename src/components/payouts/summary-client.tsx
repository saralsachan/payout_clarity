"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/finance/money";
import { sumPayoutField } from "@/lib/finance/aggregate";
import type { Payout } from "@/lib/supabase/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

type SummaryClientProps = {
  payouts: Payout[];
  period: string;
};

export function SummaryClient({ payouts, period }: SummaryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totals = useMemo(
    () => ({
      sales: sumPayoutField(payouts, "gross_sales"),
      refunds: sumPayoutField(payouts, "refunds"),
      fees: sumPayoutField(payouts, "fees"),
      adjustments: payouts.reduce((s, p) => s + p.adjustments, 0),
      deposited: sumPayoutField(payouts, "net_amount"),
    }),
    [payouts],
  );

  const chartData = useMemo(() => {
    const byMonth = new Map<string, { sales: number; deposits: number }>();
    for (const p of payouts) {
      const key = new Date(p.payout_date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const existing = byMonth.get(key) ?? { sales: 0, deposits: 0 };
      existing.sales += p.gross_sales;
      existing.deposits += p.net_amount;
      byMonth.set(key, existing);
    }
    return Array.from(byMonth.entries()).map(([month, data]) => ({
      month,
      sales: data.sales / 100,
      deposits: data.deposits / 100,
    }));
  }, [payouts]);

  function setPeriod(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`/dashboard/summary?${params.toString()}`);
  }

  const rows = [
    { label: "Total Shopify sales", value: totals.sales },
    { label: "Total refunds", value: -totals.refunds, negative: true },
    { label: "Total fees", value: -totals.fees, negative: true },
    { label: "Total adjustments", value: -totals.adjustments, negative: true },
    { label: "Total deposited", value: totals.deposited, bold: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your sales total and bank deposits aren&apos;t supposed to match exactly. Refunds,
            payment processing fees, adjustments, and payout timing can create the difference.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This month</SelectItem>
            <SelectItem value="last_month">Last month</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Totals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className={row.bold ? "font-semibold" : "text-muted-foreground"}>
                {row.label}
              </span>
              <span
                className={`tabular-nums ${row.bold ? "text-lg font-semibold" : "font-medium"} ${row.negative ? "text-red-600" : ""}`}
              >
                {formatMoney(Math.abs(row.value))}
                {row.negative ? " (deduction)" : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gross sales vs Bank deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => `$${Number(v ?? 0).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="sales" name="Gross sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deposits" name="Bank deposits" fill="#71717a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
