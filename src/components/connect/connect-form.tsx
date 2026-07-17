"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ConnectShopifyForm({ error }: { error?: string | null }) {
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const domain = shop.includes(".") ? shop : `${shop}.myshopify.com`;
    router.push(`/api/shopify/oauth?shop=${encodeURIComponent(domain)}`);
  }

  return (
    <Card className="mx-auto max-w-lg border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Connect your Shopify store
        </CardTitle>
        <CardDescription>
          Payout Clarity needs read-only access to your Shopify payout data. We never modify your
          store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop">Store domain</Label>
            <Input
              id="shop"
              placeholder="mystore.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Redirecting..." : "Connect Shopify"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
