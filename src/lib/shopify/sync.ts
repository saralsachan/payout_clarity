import { subDays, formatISO } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, ShopifyConnection } from "@/lib/supabase/database.types";
import { aggregateTransactions, reconcileBreakdown } from "@/lib/finance/aggregate";
import { categorizeTransaction } from "@/lib/finance/categorize";
import { parseMoneyToMinorUnits } from "@/lib/finance/money";
import { isMockModeEnabled } from "@/lib/env";
import { shopifyGraphQL, ShopifyApiError } from "./client";
import {
  BALANCE_TRANSACTIONS_QUERY,
  PAYOUTS_QUERY,
  SHOPIFY_PAYMENTS_ACCOUNT_QUERY,
  extractShopifyId,
  type ShopifyBalanceTransaction,
  type ShopifyPayoutNode,
} from "./queries";
import { syncMockPayouts } from "@/lib/mock/shopify-payouts";

export type SyncResult = {
  success: boolean;
  payoutCount: number;
  error?: string;
  mock?: boolean;
};

type PayoutsPageResponse = {
  shopifyPaymentsAccount: {
    payouts: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ShopifyPayoutNode[];
    };
  } | null;
};

type BalanceTransactionsPageResponse = {
  shopifyPaymentsAccount: {
    balanceTransactions: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: ShopifyBalanceTransaction[];
    };
  } | null;
};

async function paginatePayouts(
  shopDomain: string,
  accessToken: string,
  since: Date,
): Promise<ShopifyPayoutNode[]> {
  const query = `issued_at:>=${formatISO(since, { representation: "date" })}`;
  const all: ShopifyPayoutNode[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: PayoutsPageResponse = await shopifyGraphQL<PayoutsPageResponse>(
      shopDomain,
      accessToken,
      PAYOUTS_QUERY,
      {
        first: 50,
        after,
        query,
      },
    );

    if (!data.shopifyPaymentsAccount) {
      throw new ShopifyApiError("Shopify Payments not available for this store");
    }

    all.push(...data.shopifyPaymentsAccount.payouts.nodes);
    hasNext = data.shopifyPaymentsAccount.payouts.pageInfo.hasNextPage;
    after = data.shopifyPaymentsAccount.payouts.pageInfo.endCursor;
  }

  return all;
}

async function fetchTransactionsForPayout(
  shopDomain: string,
  accessToken: string,
  payoutGid: string,
): Promise<ShopifyBalanceTransaction[]> {
  const payoutId = extractShopifyId(payoutGid);
  const query = `payments_transfer_id:${payoutId}`;
  const all: ShopifyBalanceTransaction[] = [];
  let after: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: BalanceTransactionsPageResponse =
      await shopifyGraphQL<BalanceTransactionsPageResponse>(
        shopDomain,
        accessToken,
        BALANCE_TRANSACTIONS_QUERY,
        {
          first: 100,
          after,
          query,
        },
      );

    if (!data.shopifyPaymentsAccount) break;
    all.push(...data.shopifyPaymentsAccount.balanceTransactions.nodes);
    hasNext = data.shopifyPaymentsAccount.balanceTransactions.pageInfo.hasNextPage;
    after = data.shopifyPaymentsAccount.balanceTransactions.pageInfo.endCursor;
  }

  return all;
}

export async function checkShopifyPayments(
  shopDomain: string,
  accessToken: string,
): Promise<boolean> {
  const data = await shopifyGraphQL<{
    shopifyPaymentsAccount: { id: string; activated: boolean } | null;
  }>(shopDomain, accessToken, SHOPIFY_PAYMENTS_ACCOUNT_QUERY);

  return data.shopifyPaymentsAccount?.activated === true;
}

export async function syncPayouts(connection: ShopifyConnection): Promise<SyncResult> {
  if (isMockModeEnabled()) {
    const count = await syncMockPayouts(connection);
    return { success: true, payoutCount: count, mock: true };
  }

  const admin = createAdminClient();
  const since = subDays(new Date(), 90);

  try {
    const hasPayments = await checkShopifyPayments(
      connection.shop_domain,
      connection.access_token,
    );
    if (!hasPayments) {
      return {
        success: false,
        payoutCount: 0,
        error: "Shopify Payments not available for this store",
      };
    }

    const payoutNodes = await paginatePayouts(
      connection.shop_domain,
      connection.access_token,
      since,
    );

    for (const node of payoutNodes) {
      const shopifyPayoutId = extractShopifyId(node.id);
      const transactions = await fetchTransactionsForPayout(
        connection.shop_domain,
        connection.access_token,
        node.id,
      );

      const txInputs = transactions.map((tx) => ({
        type: categorizeTransaction(tx.type),
        amount: parseMoneyToMinorUnits(tx.amount.amount),
        fee: parseMoneyToMinorUnits(tx.fee?.amount ?? "0"),
      }));

      const breakdown = aggregateTransactions(txInputs);
      const shopifyNet = parseMoneyToMinorUnits(node.net.amount);
      const { reconciled, diff } = reconcileBreakdown(breakdown, shopifyNet);

      const { data: payout, error: payoutError } = await admin
        .from("payouts")
        .upsert(
          {
            shopify_connection_id: connection.id,
            shopify_payout_id: shopifyPayoutId,
            payout_date: node.issuedAt,
            status: node.status.toLowerCase(),
            gross_sales: breakdown.grossSales,
            refunds: breakdown.refunds,
            fees: breakdown.fees,
            taxes: breakdown.taxes,
            adjustments: breakdown.adjustments,
            net_amount: shopifyNet,
            currency: node.net.currencyCode,
            reconciled,
            reconciliation_diff: diff,
            raw_json: node as unknown as Json,
          },
          { onConflict: "shopify_connection_id,shopify_payout_id" },
        )
        .select("id")
        .single();

      if (payoutError || !payout) continue;

      for (const tx of transactions) {
        const txType = categorizeTransaction(tx.type);
        const orderId =
          tx.associatedOrder?.name ??
          (tx.sourceOrderTransactionId ? tx.sourceOrderTransactionId : null);

        await admin.from("payout_line_items").upsert(
          {
            payout_id: payout.id,
            shopify_transaction_id: extractShopifyId(tx.id),
            order_id: orderId,
            type: txType,
            amount: parseMoneyToMinorUnits(tx.amount.amount),
            fee: parseMoneyToMinorUnits(tx.fee?.amount ?? "0"),
            description: tx.adjustmentReason ?? tx.type,
            transaction_date: tx.processedAt,
            raw_json: tx as unknown as Json,
          },
          { onConflict: "payout_id,shopify_transaction_id" },
        );
      }
    }

    await admin
      .from("shopify_connections")
      .update({ last_synced_at: new Date().toISOString(), status: "active" })
      .eq("id", connection.id);

    return { success: true, payoutCount: payoutNodes.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    if (err instanceof ShopifyApiError && err.status === 401) {
      await admin
        .from("shopify_connections")
        .update({ status: "revoked" })
        .eq("id", connection.id);
    }
    return { success: false, payoutCount: 0, error: message };
  }
}
