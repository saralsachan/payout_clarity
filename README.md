# Payout Clarity

**Understand every dollar Shopify sends to your bank.**

Payout Clarity is a Shopify payout explanation tool for small merchants. Connect your store, sync Shopify Payments data, and see exactly how each bank deposit was calculated — sales, refunds, fees, and adjustments.

## What it does

Shopify shows your sales. Your bank shows your deposit. Payout Clarity explains the difference:

```
Shopify sales        $5,247.00
Refunds              -$180.00
Payment fees         -$152.00
Adjustments          -$103.00
─────────────────────────────
Bank payout           $4,812.00
```

This is **not** accounting, bookkeeping, or tax software.

## Tech stack

- **Next.js 15+** (App Router)
- **TypeScript**, **Tailwind CSS**, **shadcn/ui**
- **Supabase** (Auth + PostgreSQL + RLS)
- **Shopify Admin GraphQL API** (2025-10)
- **Paddle Billing v2**
- **Recharts** (summary chart)
- **Vitest** (financial calculation tests)

## Architecture

```
Browser → Next.js (RSC + Route Handlers) → Supabase / Shopify GraphQL / Paddle
```

- Shopify OAuth tokens stored server-side only
- Financial values stored as integer minor units (cents)
- Subscription gating enforced server-side
- Paddle webhooks verified with raw body + HMAC signature

## Local installation

```bash
git clone <your-repo-url> payout-clarity
cd payout-clarity
npm install
cp .env.example .env.local
# Fill in all environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](.env.example) for the full list.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin operations |
| `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` | Shopify Partner app credentials |
| `SHOPIFY_SCOPES` | `read_shopify_payments_payouts` (minimum) |
| `SHOPIFY_APP_URL` | Your app URL for OAuth callbacks |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle.js client token |
| `PADDLE_API_KEY` | Paddle server API key |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook signature secret |
| `NEXT_PUBLIC_PADDLE_PRICE_ID` | Pro plan price ID ($9/mo) |
| `MOCK_SHOPIFY_PAYOUTS` | Dev-only mock data (never in production) |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Email** auth and **Google** OAuth provider
3. Set Google OAuth redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add site URL: `http://localhost:3000` (and production URL)
5. Run migrations:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Or apply [`supabase/migrations/20260717100000_payout_clarity_schema.sql`](supabase/migrations/20260717100000_payout_clarity_schema.sql) manually in the SQL editor.

### Google OAuth (Supabase)

1. Supabase Dashboard → Authentication → Providers → Google
2. Add Google Cloud OAuth client ID and secret
3. Authorized redirect URI from Supabase docs

## Shopify Partner app setup

1. Create a **Public** or **Custom** app in [Shopify Partners](https://partners.shopify.com)
2. Configure Admin API access scope: `read_shopify_payments_payouts`
3. Set App URL: `http://localhost:3000` (or production URL)
4. Allowed redirection URL(s):
   - `http://localhost:3000/api/shopify/callback`
   - `https://your-domain.com/api/shopify/callback`
5. Copy API key and secret to `.env.local`

### Shopify GraphQL API

- **Version:** 2025-10 (pinned in code)
- **Query:** `shopifyPaymentsAccount { payouts, balanceTransactions }`
- **Scope:** `read_shopify_payments_payouts` grants access to `ShopifyPaymentsPayout` and `ShopifyPaymentsBalanceTransaction`
- Do **not** use deprecated REST Payouts API

### Shopify Payments requirements

- Store must use **Shopify Payments**
- Development stores often have **no realistic payout history**
- Use `MOCK_SHOPIFY_PAYOUTS=true` for local UI development

## Paddle sandbox setup

1. Create account at [Paddle](https://www.paddle.com)
2. Create product **Payout Clarity Pro** at $9/month
3. Copy **Client-side token** → `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
4. Copy **Price ID** → `NEXT_PUBLIC_PADDLE_PRICE_ID`
5. Create API key → `PADDLE_API_KEY`
6. Create notification destination:
   - URL: `https://your-domain.com/api/webhooks/paddle`
   - Copy secret → `PADDLE_WEBHOOK_SECRET`
7. Approve your domain in Paddle Checkout settings

### Paddle checkout notes

- Checkout passes `customData.userId` for webhook subscription sync
- Webhook route uses `await request.text()` — never `request.json()`

## Mock mode (development)

When Shopify dev stores lack payout data:

```env
MOCK_SHOPIFY_PAYOUTS=true
```

Mock data is labeled clearly and **blocked in production**.

## Testing the complete user flow

1. Sign up at `/signup` (email or Google)
2. Connect Shopify at `/connect`
3. Initial sync runs at `/connect/syncing`
4. View dashboard at `/dashboard`
5. Click latest payout for full breakdown
6. Check reconciliation badge
7. Export CSV from payout detail
8. View summary at `/dashboard/summary`
9. Upgrade via Paddle at `/dashboard/billing`
10. Test webhook with Paddle sandbox simulator
11. Disconnect Shopify in Settings
12. Delete account in Settings

## Deploying to Vercel

1. Push repo to GitHub
2. Import in Vercel
3. Add all environment variables from `.env.example`
4. Set `SHOPIFY_APP_URL` and `NEXT_PUBLIC_APP_URL` to production URL
5. Update Shopify OAuth callback URLs
6. Update Paddle webhook URL
7. Run Supabase migrations on production database

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest unit tests
```

## Data retention / account deletion

Deleting your account removes:
- Shopify connection and access token reference
- All synced payouts and line items
- Subscription records

Supabase auth user is deleted via admin API.

## License

Private — all rights reserved.
