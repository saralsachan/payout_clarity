import { subDays } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ShopifyConnection } from "@/lib/supabase/database.types";

export async function syncMockPayouts(connection: ShopifyConnection): Promise<number> {
  const admin = createAdminClient();
  const now = new Date();

  const mockPayouts = [
    {
      shopify_payout_id: "mock-payout-001",
      daysAgo: 3,
      status: "paid",
      gross_sales: 524700,
      refunds: 18000,
      fees: 15200,
      adjustments: 10300,
      net_amount: 481200,
      currency: "USD",
      reconciled: true,
      reconciliation_diff: 0,
      lineItems: [
        {
          shopify_transaction_id: "mock-tx-001",
          order_id: "#1042",
          type: "sale" as const,
          amount: 8900,
          fee: 280,
          description: "Order #1042",
          daysAgo: 5,
        },
        {
          shopify_transaction_id: "mock-tx-002",
          order_id: "#1043",
          type: "sale" as const,
          amount: 12500,
          fee: 390,
          description: "Order #1043",
          daysAgo: 5,
        },
        {
          shopify_transaction_id: "mock-tx-003",
          order_id: "#1038",
          type: "refund" as const,
          amount: -4500,
          fee: 0,
          description: "Refund for order #1038",
          daysAgo: 4,
        },
        {
          shopify_transaction_id: "mock-tx-004",
          order_id: null,
          type: "fee" as const,
          amount: -150,
          fee: 0,
          description: "Processing fee adjustment",
          daysAgo: 4,
        },
      ],
    },
    {
      shopify_payout_id: "mock-payout-002",
      daysAgo: 10,
      status: "paid",
      gross_sales: 389000,
      refunds: 12000,
      fees: 11400,
      adjustments: 5600,
      net_amount: 360000,
      currency: "USD",
      reconciled: true,
      reconciliation_diff: 0,
      lineItems: [
        {
          shopify_transaction_id: "mock-tx-101",
          order_id: "#1020",
          type: "sale" as const,
          amount: 22000,
          fee: 680,
          description: "Order #1020",
          daysAgo: 12,
        },
      ],
    },
    {
      shopify_payout_id: "mock-payout-003",
      daysAgo: 17,
      status: "paid",
      gross_sales: 412500,
      refunds: 8500,
      fees: 12100,
      adjustments: 4200,
      net_amount: 387700,
      currency: "USD",
      reconciled: false,
      reconciliation_diff: 200,
      lineItems: [],
    },
  ];

  for (const mock of mockPayouts) {
    const payoutDate = subDays(now, mock.daysAgo).toISOString();

    const { data: payout } = await admin
      .from("payouts")
      .upsert(
        {
          shopify_connection_id: connection.id,
          shopify_payout_id: mock.shopify_payout_id,
          payout_date: payoutDate,
          status: mock.status,
          gross_sales: mock.gross_sales,
          refunds: mock.refunds,
          fees: mock.fees,
          taxes: 0,
          adjustments: mock.adjustments,
          net_amount: mock.net_amount,
          currency: mock.currency,
          reconciled: mock.reconciled,
          reconciliation_diff: mock.reconciliation_diff,
          raw_json: { mock: true, label: "MOCK DATA — development only" },
        },
        { onConflict: "shopify_connection_id,shopify_payout_id" },
      )
      .select("id")
      .single();

    if (!payout) continue;

    for (const item of mock.lineItems) {
      await admin.from("payout_line_items").upsert(
        {
          payout_id: payout.id,
          shopify_transaction_id: item.shopify_transaction_id,
          order_id: item.order_id,
          type: item.type,
          amount: item.amount,
          fee: item.fee,
          description: `[MOCK] ${item.description}`,
          transaction_date: subDays(now, item.daysAgo).toISOString(),
          raw_json: { mock: true },
        },
        { onConflict: "payout_id,shopify_transaction_id" },
      );
    }
  }

  await admin
    .from("shopify_connections")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", connection.id);

  return mockPayouts.length;
}
