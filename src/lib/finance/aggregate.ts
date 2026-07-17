import type { LineItemType } from "@/lib/supabase/database.types";
import type { MinorUnits } from "./money";

export type TransactionInput = {
  type: LineItemType;
  amount: MinorUnits;
  fee: MinorUnits;
};

export type PayoutBreakdown = {
  grossSales: MinorUnits;
  refunds: MinorUnits;
  fees: MinorUnits;
  taxes: MinorUnits;
  adjustments: MinorUnits;
  netAmount: MinorUnits;
};

export function aggregateTransactions(transactions: TransactionInput[]): PayoutBreakdown {
  let grossSales = 0;
  let refunds = 0;
  let fees = 0;
  const taxes = 0;
  let adjustments = 0;

  for (const tx of transactions) {
    switch (tx.type) {
      case "sale":
        grossSales += tx.amount;
        fees += tx.fee;
        break;
      case "refund":
        refunds += Math.abs(tx.amount);
        fees += tx.fee;
        break;
      case "fee":
        fees += Math.abs(tx.amount) + Math.abs(tx.fee);
        break;
      case "adjustment":
        adjustments += tx.amount;
        break;
      case "dispute":
        adjustments += tx.amount;
        break;
      case "other":
        adjustments += tx.amount;
        break;
    }
  }

  const netAmount = grossSales - refunds - fees + adjustments;

  return { grossSales, refunds, fees, taxes, adjustments, netAmount };
}

export function reconcileBreakdown(
  breakdown: PayoutBreakdown,
  shopifyNetMinor: MinorUnits,
): { reconciled: boolean; diff: MinorUnits } {
  const diff = breakdown.netAmount - shopifyNetMinor;
  return { reconciled: diff === 0, diff };
}

export function sumPayoutField(
  payouts: Array<{ gross_sales: number; refunds: number; fees: number; net_amount: number }>,
  field: "gross_sales" | "refunds" | "fees" | "net_amount",
): MinorUnits {
  return payouts.reduce((sum, p) => sum + p[field], 0);
}
