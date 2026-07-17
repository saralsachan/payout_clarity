import crypto from "crypto";
import { getServerEnv, getAppUrl } from "@/lib/env";
import { normalizeShopDomain } from "./client";

const STATE_COOKIE = "shopify_oauth_state";

export function buildOAuthUrl(shopDomain: string, state: string): string {
  const { shopifyApiKey: SHOPIFY_API_KEY, shopifyScopes: SHOPIFY_SCOPES } = getServerEnv();
  if (!SHOPIFY_API_KEY) throw new Error("SHOPIFY_API_KEY not configured");

  const redirectUri = `${getAppUrl()}/api/shopify/callback`;
  const params = new URLSearchParams({
    client_id: SHOPIFY_API_KEY,
    scope: SHOPIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

export function generateOAuthState(userId: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = `${userId}:${nonce}:${Date.now()}`;
  const secret = getServerEnv().shopifyApiSecret ?? "dev-secret";
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyOAuthState(state: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return false;
    const [stateUserId, , timestamp, signature] = parts;
    if (stateUserId !== userId) return false;
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 10 * 60 * 1000) return false;
    const payload = `${stateUserId}:${parts[1]}:${timestamp}`;
    const secret = getServerEnv().shopifyApiSecret ?? "dev-secret";
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function exchangeCodeForToken(
  shopDomain: string,
  code: string,
): Promise<{ accessToken: string; scope: string }> {
  const { shopifyApiKey: SHOPIFY_API_KEY, shopifyApiSecret: SHOPIFY_API_SECRET } = getServerEnv();
  if (!SHOPIFY_API_KEY || !SHOPIFY_API_SECRET) {
    throw new Error("Shopify credentials not configured");
  }

  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Shopify OAuth code");
  }

  const data = (await response.json()) as { access_token: string; scope: string };
  return { accessToken: data.access_token, scope: data.scope };
}

export { STATE_COOKIE, normalizeShopDomain };
