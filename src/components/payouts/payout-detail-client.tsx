"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Download } from "lucide-react";
import { formatMoney, formatMoneySigned } from "@/lib/finance/money";
import { lineItemTypeLabel } from "@/lib/finance/categorize";
import type { Payout, PayoutLineItem } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PayoutBreakdown } from "@/components/payouts/payout-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PayoutDetailClientProps = {
  payout: Payout;
  lineItems: PayoutLineItem[];
};

export function PayoutDetailClient({ payout, lineItems }: PayoutDetailClientProps) {
  const tabs = ["all", "sale", "refund", "fee", "adjustment"] as const;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to payouts
        </Link>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Payout · {format(new Date(payout.payout_date), "MMM d, yyyy")}
              </h1>
              <Badge variant="outline" className="capitalize">
                {payout.status}
              </Badge>
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {formatMoney(payout.net_amount, payout.currency)}
            </p>
            <p className="text-sm text-muted-foreground">Deposited to your bank</p>
          </div>
          <a
            href={`/api/export/payouts/${payout.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Download className="mr-2 size-4" />
            Export CSV
          </a>
        </div>
      </div>

      <PayoutBreakdown
        grossSales={payout.gross_sales}
        refunds={payout.refunds}
        fees={payout.fees}
        adjustments={payout.adjustments}
        netAmount={payout.net_amount}
        currency={payout.currency}
        reconciled={payout.reconciled}
        reconciliationDiff={payout.reconciliation_diff}
      />

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab} className="capitalize">
                  {tab === "all" ? "All" : tab === "sale" ? "Sales" : `${tab}s`}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => {
              const filtered =
                tab === "all" ? lineItems : lineItems.filter((item) => item.type === tab);
              return (
                <TabsContent key={tab} value={tab}>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Order/reference</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Gross</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                              No transactions
                            </TableCell>
                          </TableRow>
                        ) : (
                          filtered.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {format(new Date(item.transaction_date), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{lineItemTypeLabel(item.type)}</Badge>
                              </TableCell>
                              <TableCell>{item.order_id ?? "—"}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {item.description ?? "—"}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatMoneySigned(item.amount, payout.currency)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-muted-foreground">
                                {formatMoneySigned(-item.fee, payout.currency)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-medium">
                                {formatMoney(item.amount - item.fee, payout.currency)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
