import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { format } from "date-fns";
import { formatMoney, formatMoneySigned } from "@/lib/finance/money";
import type { Payout } from "@/lib/supabase/database.types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpgradeButton } from "@/components/billing/upgrade-button";

type PayoutTableProps = {
  payouts: Payout[];
  lockedIds: Set<string>;
};

export function PayoutTable({ payouts, lockedIds }: PayoutTableProps) {
  if (payouts.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <p className="font-medium">No payouts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Once we sync your Shopify Payments data, your payouts will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent payouts</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Gross sales</TableHead>
                <TableHead className="text-right">Refunds</TableHead>
                <TableHead className="text-right">Fees</TableHead>
                <TableHead className="text-right">Adjustments</TableHead>
                <TableHead className="text-right">Net payout</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => {
                const locked = lockedIds.has(payout.id);
                const content = (
                  <TableRow
                    key={payout.id}
                    className={locked ? "opacity-60" : "cursor-pointer hover:bg-muted/50"}
                  >
                    <TableCell>{format(new Date(payout.payout_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(payout.gross_sales, payout.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-destructive">
                      {formatMoneySigned(-payout.refunds, payout.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatMoneySigned(-payout.fees, payout.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatMoneySigned(-payout.adjustments, payout.currency)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {formatMoney(payout.net_amount, payout.currency)}
                    </TableCell>
                    <TableCell>
                      {locked ? (
                        <Lock className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                );

                if (locked) return content;
                return (
                  <Link key={payout.id} href={`/dashboard/payouts/${payout.id}`} className="contents">
                    {content}
                  </Link>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {lockedIds.size > 0 && (
          <div className="border-t border-border p-6">
            <div className="rounded-lg border border-border bg-muted/30 p-6">
              <h3 className="font-semibold">Unlock your complete payout history</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View every payout, understand every deduction, and export your records anytime.
              </p>
              <p className="mt-3 text-2xl font-semibold tabular-nums">$9 / month</p>
              <UpgradeButton className="mt-4" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
