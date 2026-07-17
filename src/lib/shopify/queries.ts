export const SHOPIFY_PAYMENTS_ACCOUNT_QUERY = `
  query ShopifyPaymentsAccount {
    shopifyPaymentsAccount {
      id
      activated
    }
  }
`;

export const PAYOUTS_QUERY = `
  query Payouts($first: Int!, $after: String, $query: String) {
    shopifyPaymentsAccount {
      payouts(first: $first, after: $after, sortKey: ISSUED_AT, reverse: true, query: $query) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          legacyId
          status
          issuedAt
          net {
            amount
            currencyCode
          }
          summary {
            chargesGross {
              amount
            }
            chargesFee {
              amount
            }
            refundsGross {
              amount
            }
            refundsFee {
              amount
            }
            adjustmentsGross {
              amount
            }
            adjustmentsFee {
              amount
            }
          }
        }
      }
    }
  }
`;

export const BALANCE_TRANSACTIONS_QUERY = `
  query BalanceTransactions($first: Int!, $after: String, $query: String) {
    shopifyPaymentsAccount {
      balanceTransactions(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true, query: $query) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          type
          test
          processedAt
          amount {
            amount
            currencyCode
          }
          fee {
            amount
          }
          net {
            amount
          }
          sourceId
          sourceType
          sourceOrderTransactionId
          associatedOrder {
            id
            name
          }
          associatedPayout {
            id
            status
          }
          adjustmentReason
        }
      }
    }
  }
`;

export type ShopifyPayoutNode = {
  id: string;
  legacyId: string;
  status: string;
  issuedAt: string;
  net: { amount: string; currencyCode: string };
  summary?: {
    chargesGross?: { amount: string };
    chargesFee?: { amount: string };
    refundsGross?: { amount: string };
    refundsFee?: { amount: string };
    adjustmentsGross?: { amount: string };
    adjustmentsFee?: { amount: string };
  };
};

export type ShopifyBalanceTransaction = {
  id: string;
  type: string;
  test: boolean;
  processedAt: string;
  amount: { amount: string; currencyCode: string };
  fee: { amount: string };
  net: { amount: string };
  sourceId?: string;
  sourceType?: string;
  sourceOrderTransactionId?: string;
  associatedOrder?: { id: string; name: string } | null;
  associatedPayout?: { id: string; status: string } | null;
  adjustmentReason?: string | null;
};

export function extractShopifyId(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? gid;
}
