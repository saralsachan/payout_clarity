import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Log in",
  description: `Log in to ${siteConfig.name} to view your Shopify payout breakdowns and bank deposit explanations.`,
  alternates: {
    canonical: `${getSiteUrl()}/login`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-dashboard-bg px-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
