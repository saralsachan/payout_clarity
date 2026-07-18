import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <AuthForm mode="login" />
    </div>
  );
}
