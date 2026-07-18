export const landingFaqs = [
  {
    question: "Does Payout Clarity modify my Shopify store?",
    answer:
      "No. Payout Clarity only requests read-only access to your Shopify Payments payout data. It never changes products, orders, or store settings.",
  },
  {
    question: "Which payment providers are supported?",
    answer:
      "Payout Clarity works with stores using Shopify Payments. Third-party payment gateways are not supported in this version.",
  },
  {
    question: "Why does my Shopify sales total differ from my bank deposit?",
    answer:
      "Shopify sales include gross order revenue. Your bank deposit is net of refunds, payment processing fees, adjustments, and payout timing. Payout Clarity breaks down each deposit so you can see exactly what changed.",
  },
  {
    question: "Is Payout Clarity accounting or bookkeeping software?",
    answer:
      "No. Payout Clarity explains Shopify payout differences. It is not bookkeeping, tax, or accounting software and does not replace QuickBooks or Xero.",
  },
  {
    question: "Can I export my payout data?",
    answer:
      "Yes. Pro subscribers can export payout and transaction data as CSV for record-keeping or analysis.",
  },
  {
    question: "How much does Payout Clarity cost?",
    answer:
      "You can view your most recent payout for free. Payout Clarity Pro is $9 per month and includes full payout history, transaction details, CSV export, and monthly summaries.",
  },
] as const;
