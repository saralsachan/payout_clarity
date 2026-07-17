import type { LineItemType } from "@/lib/supabase/database.types";

const TYPE_MAP: Record<string, LineItemType> = {
  CHARGE: "sale",
  REFUND: "refund",
  DISPUTE: "dispute",
  DISPUTE_WITHDRAWAL: "dispute",
  DISPUTE_REVERSAL: "dispute",
  ADJUSTMENT: "adjustment",
  TRANSFER: "adjustment",
  RESERVE: "adjustment",
  RESERVE_RELEASE: "adjustment",
  PAYOUT: "other",
  PAYOUT_FAILURE: "other",
  PAYOUT_CANCEL: "other",
  PAYOUT_REFUND: "refund",
  SHOPIFY_COLLECTIVE_DEBIT: "fee",
  SHOPIFY_COLLECTIVE_CREDIT: "adjustment",
  TAX: "adjustment",
};

export function categorizeTransaction(shopifyType: string): LineItemType {
  const normalized = shopifyType.toUpperCase().trim();
  return TYPE_MAP[normalized] ?? "other";
}

export function lineItemTypeLabel(type: LineItemType): string {
  const labels: Record<LineItemType, string> = {
    sale: "Sale",
    refund: "Refund",
    fee: "Fee",
    adjustment: "Adjustment",
    dispute: "Dispute",
    other: "Other",
  };
  return labels[type];
}
