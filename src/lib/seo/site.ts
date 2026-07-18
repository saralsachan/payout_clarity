export const siteConfig = {
  name: "Payout Clarity",
  title: "Payout Clarity — Understand every dollar Shopify sends to your bank",
  description:
    "Payout Clarity explains Shopify Payments payouts for small merchants. See how each bank deposit was calculated — sales, refunds, fees, and adjustments. Not accounting software.",
  tagline: "Understand every dollar Shopify sends to your bank.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://payout-clarity.vercel.app",
  locale: "en_US",
  category: "BusinessApplication",
  keywords: [
    "Shopify payouts",
    "Shopify Payments",
    "payout breakdown",
    "Shopify bank deposit",
    "ecommerce payouts",
    "Shopify fees",
    "payout reconciliation",
    "Shopify merchant tools",
  ],
  googleSiteVerification: "650ID5P0j4vbB0Cf1piByo1WklvPf5QkcD-Wg4-bxwI",
} as const;

export function getSiteUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}

export const publicRoutes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/signup", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
];
