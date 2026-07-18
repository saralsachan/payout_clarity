"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type UpgradeButtonProps = {
  label?: string;
  className?: string;
};

export function UpgradeButton({
  label = "Upgrade to Pro",
  className,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const productId = process.env.NEXT_PUBLIC_DODO_PRODUCT_ID;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = (await res.json()) as { checkout_url?: string; error?: string };
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      console.error(data.error ?? "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (!productId) {
    return (
      <Button disabled className={className}>
        Configure Dodo Payments to enable checkout
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
