-- Rename Paddle billing columns to Dodo Payments
ALTER TABLE subscriptions RENAME COLUMN paddle_customer_id TO dodo_customer_id;
ALTER TABLE subscriptions RENAME COLUMN paddle_subscription_id TO dodo_subscription_id;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_paddle_subscription_id_key;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_dodo_subscription_id_key UNIQUE (dodo_subscription_id);
