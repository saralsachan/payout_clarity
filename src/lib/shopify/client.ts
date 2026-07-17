import { getServerEnv } from "@/lib/env";

export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
};

export async function shopifyGraphQL<T>(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const apiVersion = getServerEnv().shopifyApiVersion;
  const url = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401) {
    throw new ShopifyApiError("Shopify access revoked", 401, "UNAUTHORIZED");
  }

  if (response.status === 429) {
    throw new ShopifyApiError("Shopify rate limit exceeded", 429, "RATE_LIMIT");
  }

  if (!response.ok) {
    throw new ShopifyApiError(`Shopify API error: ${response.status}`, response.status);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join("; ");
    throw new ShopifyApiError(msg);
  }

  if (!json.data) {
    throw new ShopifyApiError("Empty GraphQL response");
  }

  return json.data;
}

export function normalizeShopDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.replace(/\/.*$/, "");
  if (!domain.includes(".")) {
    domain = `${domain}.myshopify.com`;
  }
  if (!domain.endsWith(".myshopify.com")) {
    throw new Error("Enter a valid Shopify store domain (e.g. mystore.myshopify.com)");
  }
  return domain;
}
