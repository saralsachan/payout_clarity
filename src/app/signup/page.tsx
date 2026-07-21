import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Sign up",
  description: `Create a free ${siteConfig.name} account. Connect Shopify Payments and understand every dollar Shopify sends to your bank.`,
  alternates: {
    canonical: `${getSiteUrl()}/signup`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-dashboard-bg px-4">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
