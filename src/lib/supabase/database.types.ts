export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      shopify_connections: TableDef<
        {
          id: string;
          user_id: string;
          shop_domain: string;
          access_token: string;
          scopes: string;
          status: "active" | "revoked" | "error";
          connected_at: string;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          shop_domain: string;
          access_token: string;
          scopes?: string;
          status?: "active" | "revoked" | "error";
          connected_at?: string;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          shop_domain?: string;
          access_token?: string;
          scopes?: string;
          status?: "active" | "revoked" | "error";
          connected_at?: string;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      payouts: TableDef<
        {
          id: string;
          shopify_connection_id: string;
          shopify_payout_id: string;
          payout_date: string;
          status: string;
          gross_sales: number;
          refunds: number;
          fees: number;
          taxes: number;
          adjustments: number;
          net_amount: number;
          currency: string;
          reconciled: boolean;
          reconciliation_diff: number;
          raw_json: Json | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          shopify_connection_id: string;
          shopify_payout_id: string;
          payout_date: string;
          status?: string;
          gross_sales?: number;
          refunds?: number;
          fees?: number;
          taxes?: number;
          adjustments?: number;
          net_amount?: number;
          currency?: string;
          reconciled?: boolean;
          reconciliation_diff?: number;
          raw_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          shopify_connection_id?: string;
          shopify_payout_id?: string;
          payout_date?: string;
          status?: string;
          gross_sales?: number;
          refunds?: number;
          fees?: number;
          taxes?: number;
          adjustments?: number;
          net_amount?: number;
          currency?: string;
          reconciled?: boolean;
          reconciliation_diff?: number;
          raw_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      payout_line_items: TableDef<
        {
          id: string;
          payout_id: string;
          shopify_transaction_id: string;
          order_id: string | null;
          type: "sale" | "refund" | "fee" | "adjustment" | "dispute" | "other";
          amount: number;
          fee: number;
          description: string | null;
          transaction_date: string;
          raw_json: Json | null;
          created_at: string;
        },
        {
          id?: string;
          payout_id: string;
          shopify_transaction_id: string;
          order_id?: string | null;
          type?: "sale" | "refund" | "fee" | "adjustment" | "dispute" | "other";
          amount?: number;
          fee?: number;
          description?: string | null;
          transaction_date: string;
          raw_json?: Json | null;
          created_at?: string;
        },
        {
          id?: string;
          payout_id?: string;
          shopify_transaction_id?: string;
          order_id?: string | null;
          type?: "sale" | "refund" | "fee" | "adjustment" | "dispute" | "other";
          amount?: number;
          fee?: number;
          description?: string | null;
          transaction_date?: string;
          raw_json?: Json | null;
          created_at?: string;
        }
      >;
      subscriptions: TableDef<
        {
          id: string;
          user_id: string;
          paddle_customer_id: string | null;
          paddle_subscription_id: string | null;
          status: string;
          plan: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          status?: string;
          plan?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          id?: string;
          user_id?: string;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          status?: string;
          plan?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      payout_line_item_type: "sale" | "refund" | "fee" | "adjustment" | "dispute" | "other";
      shopify_connection_status: "active" | "revoked" | "error";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Payout = Database["public"]["Tables"]["payouts"]["Row"];
export type PayoutLineItem = Database["public"]["Tables"]["payout_line_items"]["Row"];
export type ShopifyConnection = Database["public"]["Tables"]["shopify_connections"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type LineItemType = Database["public"]["Enums"]["payout_line_item_type"];
