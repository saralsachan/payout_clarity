import { formatMoney, formatMoneySigned } from "@/lib/finance/money";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type PayoutBreakdownProps = {
  grossSales: number;
  refunds: number;
  fees: number;
  adjustments: number;
  netAmount: number;
  currency?: string;
  reconciled: boolean;
  reconciliationDiff?: number;
  payoutDate?: string;
  compact?: boolean;
};

export function PayoutBreakdown({
  grossSales,
  refunds,
  fees,
  adjustments,
  netAmount,
  currency = "USD",
  reconciled,
  reconciliationDiff = 0,
  payoutDate,
  compact = false,
}: PayoutBreakdownProps) {
  const rows = [
    { label: "Gross sales", value: grossSales, signed: false },
    { label: "Refunds", value: -refunds, signed: true, negative: true },
    { label: "Payment processing fees", value: -fees, signed: true, negative: true },
    { label: "Adjustments", value: adjustments < 0 ? adjustments : -adjustments, signed: true, negative: adjustments >= 0 },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className="text-lg font-semibold">
          {payoutDate ? `Payout breakdown` : "Payout breakdown"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span
              className={`tabular-nums font-medium ${row.negative && row.value !== 0 ? "text-red-600" : ""}`}
            >
              {row.signed
                ? formatMoneySigned(row.value, currency)
                : formatMoney(row.value, currency)}
            </span>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Net payout</span>
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatMoney(netAmount, currency)}
          </span>
        </div>
        {reconciled ? (
          <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700">
            <CheckCircle2 className="size-3.5" />
            Breakdown reconciled
          </Badge>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="size-4 shrink-0" />
            Reconciliation difference: {formatMoneySigned(reconciliationDiff, currency)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PayoutPreviewCard() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Payout · Jul 14
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gross sales</span>
          <span className="tabular-nums font-medium">$5,247.00</span>
        </div>
        <div className="flex justify-between text-red-600">
          <span>Refunds</span>
          <span className="tabular-nums">-$180.00</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Processing fees</span>
          <span className="tabular-nums">-$152.00</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Adjustments</span>
          <span className="tabular-nums">-$103.00</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center">
          <span className="font-semibold">Net payout</span>
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-primary">
            $4,812.00
          </span>
        </div>
        <Badge variant="outline" className="mt-2 gap-1 border-green-200 bg-green-50 text-green-700">
          <CheckCircle2 className="size-3.5" />
          Breakdown reconciled
        </Badge>
      </CardContent>
    </Card>
  );
}
