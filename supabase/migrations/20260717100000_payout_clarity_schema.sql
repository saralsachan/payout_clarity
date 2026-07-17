-- Payout Clarity schema

CREATE TYPE payout_line_item_type AS ENUM (
  'sale',
  'refund',
  'fee',
  'adjustment',
  'dispute',
  'other'
);

CREATE TYPE shopify_connection_status AS ENUM ('active', 'revoked', 'error');

CREATE TABLE shopify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token TEXT NOT NULL,
  scopes TEXT NOT NULL DEFAULT '',
  status shopify_connection_status NOT NULL DEFAULT 'active',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, shop_domain)
);

CREATE INDEX idx_shopify_connections_user_id ON shopify_connections(user_id);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_connection_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  shopify_payout_id TEXT NOT NULL,
  payout_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  gross_sales BIGINT NOT NULL DEFAULT 0,
  refunds BIGINT NOT NULL DEFAULT 0,
  fees BIGINT NOT NULL DEFAULT 0,
  taxes BIGINT NOT NULL DEFAULT 0,
  adjustments BIGINT NOT NULL DEFAULT 0,
  net_amount BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciliation_diff BIGINT NOT NULL DEFAULT 0,
  raw_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shopify_connection_id, shopify_payout_id)
);

CREATE INDEX idx_payouts_connection_id ON payouts(shopify_connection_id);
CREATE INDEX idx_payouts_payout_date ON payouts(payout_date DESC);

CREATE TABLE payout_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  shopify_transaction_id TEXT NOT NULL,
  order_id TEXT,
  type payout_line_item_type NOT NULL DEFAULT 'other',
  amount BIGINT NOT NULL DEFAULT 0,
  fee BIGINT NOT NULL DEFAULT 0,
  description TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  raw_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (payout_id, shopify_transaction_id)
);

CREATE INDEX idx_payout_line_items_payout_id ON payout_line_items(payout_id);
CREATE INDEX idx_payout_line_items_type ON payout_line_items(type);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan TEXT NOT NULL DEFAULT 'free',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id),
  UNIQUE (paddle_subscription_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shopify_connections_updated_at
  BEFORE UPDATE ON shopify_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY shopify_connections_select ON shopify_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY shopify_connections_insert ON shopify_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY shopify_connections_update ON shopify_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY shopify_connections_delete ON shopify_connections
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY payouts_select ON payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopify_connections sc
      WHERE sc.id = payouts.shopify_connection_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payouts_insert ON payouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopify_connections sc
      WHERE sc.id = payouts.shopify_connection_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payouts_update ON payouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shopify_connections sc
      WHERE sc.id = payouts.shopify_connection_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payouts_delete ON payouts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shopify_connections sc
      WHERE sc.id = payouts.shopify_connection_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payout_line_items_select ON payout_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payouts p
      JOIN shopify_connections sc ON sc.id = p.shopify_connection_id
      WHERE p.id = payout_line_items.payout_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payout_line_items_insert ON payout_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM payouts p
      JOIN shopify_connections sc ON sc.id = p.shopify_connection_id
      WHERE p.id = payout_line_items.payout_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payout_line_items_update ON payout_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM payouts p
      JOIN shopify_connections sc ON sc.id = p.shopify_connection_id
      WHERE p.id = payout_line_items.payout_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY payout_line_items_delete ON payout_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM payouts p
      JOIN shopify_connections sc ON sc.id = p.shopify_connection_id
      WHERE p.id = payout_line_items.payout_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY subscriptions_select ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY subscriptions_insert ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscriptions_update ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY subscriptions_delete ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);
