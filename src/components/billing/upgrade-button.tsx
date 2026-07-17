"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: string) => void };
      Initialize: (opts: { token: string }) => void;
      Checkout: {
        open: (opts: {
          items: Array<{ priceId: string; quantity: number }>;
          customData?: Record<string, string>;
          customer?: { email?: string };
        }) => void;
      };
    };
  }
}

type UpgradeButtonProps = {
  userId: string;
  userEmail?: string;
  label?: string;
  className?: string;
};

export function UpgradeButton({
  userId,
  userEmail,
  label = "Upgrade to Pro",
  className,
}: UpgradeButtonProps) {
  const [ready, setReady] = useState(false);
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";

  useEffect(() => {
    if (!clientToken || !priceId) return;

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle) {
        window.Paddle.Environment.set(paddleEnv);
        window.Paddle.Initialize({ token: clientToken });
        setReady(true);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [clientToken, paddleEnv, priceId]);

  function handleCheckout() {
    if (!window.Paddle || !priceId) return;
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: { userId },
      customer: userEmail ? { email: userEmail } : undefined,
    });
  }

  if (!clientToken || !priceId) {
    return (
      <Button disabled className={className}>
        Configure Paddle to enable checkout
      </Button>
    );
  }

  return (
    <Button onClick={handleCheckout} disabled={!ready} className={className}>
      {label}
    </Button>
  );
}
