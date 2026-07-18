import { landingFaqs } from "@/lib/seo/faqs";
import { getSiteUrl, siteConfig } from "@/lib/seo/site";

export function organizationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url,
    description: siteConfig.description,
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url,
    description: siteConfig.description,
    inLanguage: "en-US",
  };
}

export function softwareApplicationJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url,
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "9.00",
      priceCurrency: "USD",
      description: "Payout Clarity Pro — full payout history, CSV export, monthly summary",
    },
    featureList: [
      "Shopify Payments payout sync",
      "Payout breakdown by sales, refunds, fees, and adjustments",
      "Transaction-level detail",
      "CSV export",
      "Monthly and YTD summary",
    ],
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landingFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function landingPageJsonLd() {
  return [organizationJsonLd(), websiteJsonLd(), softwareApplicationJsonLd(), faqPageJsonLd()];
}
