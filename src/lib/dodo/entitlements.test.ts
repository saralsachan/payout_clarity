import { describe, it, expect } from "vitest";
import { canAccessPayout, canExportHistory } from "./entitlements";
import type { Payout } from "@/lib/supabase/database.types";

const makePayout = (id: string, date: string): Payout => ({
  id,
  shopify_connection_id: "conn-1",
  shopify_payout_id: `sp-${id}`,
  payout_date: date,
  status: "paid",
  gross_sales: 100000,
  refunds: 0,
  fees: 1000,
  taxes: 0,
  adjustments: 0,
  net_amount: 99000,
  currency: "USD",
  reconciled: true,
  reconciliation_diff: 0,
  raw_json: null,
  created_at: date,
  updated_at: date,
});

describe("entitlements", () => {
  const payouts = [
    makePayout("newest", "2026-07-14T00:00:00Z"),
    makePayout("older", "2026-07-01T00:00:00Z"),
  ];

  it("free user can access latest payout only", () => {
    expect(canAccessPayout(payouts[0], payouts, false)).toBe(true);
    expect(canAccessPayout(payouts[1], payouts, false)).toBe(false);
  });

  it("pro user can access all payouts", () => {
    expect(canAccessPayout(payouts[1], payouts, true)).toBe(true);
  });

  it("export history requires pro", () => {
    expect(canExportHistory(false)).toBe(false);
    expect(canExportHistory(true)).toBe(true);
  });
});
