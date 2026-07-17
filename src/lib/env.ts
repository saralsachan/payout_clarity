export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    paddleClientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
    paddlePriceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID ?? "",
    paddleEnv: process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox",
  };
}

export function getServerEnv() {
  return {
    ...getPublicEnv(),
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    shopifyApiKey: process.env.SHOPIFY_API_KEY ?? "",
    shopifyApiSecret: process.env.SHOPIFY_API_SECRET ?? "",
    shopifyScopes: process.env.SHOPIFY_SCOPES ?? "read_shopify_payments_payouts",
    shopifyAppUrl: process.env.SHOPIFY_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    shopifyApiVersion: process.env.SHOPIFY_API_VERSION ?? "2025-10",
    paddleApiKey: process.env.PADDLE_API_KEY ?? "",
    paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET ?? "",
    paddleEnv: process.env.PADDLE_ENV ?? "sandbox",
    mockShopifyPayouts: process.env.MOCK_SHOPIFY_PAYOUTS === "true",
  };
}

export function getAppUrl() {
  const env = getServerEnv();
  return env.shopifyAppUrl || env.appUrl;
}

export function isMockModeEnabled() {
  return process.env.NODE_ENV !== "production" && getServerEnv().mockShopifyPayouts;
}
