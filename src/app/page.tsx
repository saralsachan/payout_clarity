import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PayoutPreviewCard } from "@/components/payouts/payout-breakdown";

const faqs = [
  {
    q: "Does Payout Clarity modify my Shopify store?",
    a: "No. We only request read-only access to your payout data. We never change products, orders, or settings.",
  },
  {
    q: "Which payment providers are supported?",
    a: "Payout Clarity works with stores using Shopify Payments. Third-party payment gateways are not supported in this version.",
  },
  {
    q: "Is this accounting software?",
    a: "No. Payout Clarity explains payout differences — it is not bookkeeping, tax, or accounting software.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Pro subscribers can export payout and transaction data as CSV anytime.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/dashboard" : "/signup";
  const ctaLabel = user ? "Go to dashboard" : "Explain my payouts";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Payout Clarity
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
              Log in
            </Link>
            <Link href={ctaHref} className={cn(buttonVariants({ size: "sm" }))}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">
              Understand every dollar Shopify sends to your bank.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Shopify shows your sales. Your bank shows your deposit. Payout Clarity explains
              exactly what happened in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ctaHref} className={cn(buttonVariants({ size: "lg" }))}>
                {ctaLabel}
              </Link>
              <a
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                See how it works
              </a>
            </div>
          </div>
          <PayoutPreviewCard />
        </div>
      </section>

      <section id="how-it-works" className="border-t border-border bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Connect Shopify", desc: "Link your store with read-only OAuth access." },
              { step: "2", title: "We organize your payout data", desc: "Payouts and transactions are synced and categorized." },
              { step: "3", title: "See exactly where your money went", desc: "Every deposit broken down into sales, refunds, fees, and adjustments." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-border bg-card p-6">
                <span className="text-sm font-medium text-primary">Step {item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Who it&apos;s for</h2>
          <p className="mt-2 text-muted-foreground">
            Built for Shopify sellers who want answers, not accounting software.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Small Shopify merchants",
              "Solo ecommerce founders",
              "Small ecommerce teams",
              "Shopify Payments users",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="size-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" className="border-t border-border bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <div className="mx-auto mt-10 max-w-sm rounded-xl border border-border bg-card p-8 text-left shadow-sm">
            <h3 className="text-lg font-semibold">Payout Clarity Pro</h3>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              $9<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>Full payout history</li>
              <li>Detailed payout breakdowns</li>
              <li>Transaction-level details</li>
              <li>CSV exports</li>
              <li>Monthly / YTD summary</li>
            </ul>
            <Link href={ctaHref} className={cn(buttonVariants(), "mt-6 w-full")}>
              Start with my latest payout
            </Link>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              View your most recent payout free — no credit card required.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <div className="mt-8 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-medium">{faq.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Payout Clarity. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
