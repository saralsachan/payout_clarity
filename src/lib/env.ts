export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    dodoProductId: process.env.NEXT_PUBLIC_DODO_PRODUCT_ID ?? "",
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
    dodoApiKey: process.env.DODO_PAYMENTS_API_KEY ?? "",
    dodoWebhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? "",
    dodoEnvironment: getDodoEnvironment(),
    mockShopifyPayouts: process.env.MOCK_SHOPIFY_PAYOUTS === "true",
  };
}

export function getAppUrl() {
  const env = getServerEnv();
  return env.shopifyAppUrl || env.appUrl;
}

export function getDodoEnvironment(): "test_mode" | "live_mode" {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT ?? "test_mode";
  return env === "live_mode" ? "live_mode" : "test_mode";
}

export function isMockModeEnabled() {
  return process.env.NODE_ENV !== "production" && getServerEnv().mockShopifyPayouts;
}
