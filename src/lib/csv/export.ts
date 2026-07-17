import { formatMoney } from "@/lib/finance/money";
import type { Payout, PayoutLineItem } from "@/lib/supabase/database.types";

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export type CsvRow = {
  payout_date: string;
  payout_id: string;
  transaction_date: string;
  transaction_type: string;
  order_id: string;
  gross_amount: string;
  fee: string;
  net_amount: string;
  currency: string;
};

export function buildPayoutCsvRows(
  payout: Payout,
  lineItems: PayoutLineItem[],
): CsvRow[] {
  if (lineItems.length === 0) {
    return [
      {
        payout_date: payout.payout_date,
        payout_id: payout.shopify_payout_id,
        transaction_date: "",
        transaction_type: "",
        order_id: "",
        gross_amount: formatMoney(payout.gross_sales, payout.currency),
        fee: formatMoney(payout.fees, payout.currency),
        net_amount: formatMoney(payout.net_amount, payout.currency),
        currency: payout.currency,
      },
    ];
  }

  return lineItems.map((item) => ({
    payout_date: payout.payout_date,
    payout_id: payout.shopify_payout_id,
    transaction_date: item.transaction_date,
    transaction_type: item.type,
    order_id: item.order_id ?? "",
    gross_amount: formatMoney(item.amount, payout.currency),
    fee: formatMoney(item.fee, payout.currency),
    net_amount: formatMoney(item.amount - item.fee, payout.currency),
    currency: payout.currency,
  }));
}

export function rowsToCsv(rows: CsvRow[]): string {
  const headers = [
    "payout_date",
    "payout_id",
    "transaction_date",
    "transaction_type",
    "order_id",
    "gross_amount",
    "fee",
    "net_amount",
    "currency",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      [
        escapeCsv(row.payout_date),
        escapeCsv(row.payout_id),
        escapeCsv(row.transaction_date),
        escapeCsv(row.transaction_type),
        escapeCsv(row.order_id),
        escapeCsv(row.gross_amount),
        escapeCsv(row.fee),
        escapeCsv(row.net_amount),
        escapeCsv(row.currency),
      ].join(","),
    );
  }
  return lines.join("\n");
}
