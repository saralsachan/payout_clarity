import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
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
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <AuthForm mode="signup" />
    </div>
  );
}
