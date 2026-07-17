import { describe, it, expect } from "vitest";
import {
  aggregateTransactions,
  reconcileBreakdown,
  type TransactionInput,
} from "../aggregate";
import { categorizeTransaction } from "../categorize";
import { parseMoneyToMinorUnits } from "../money";

describe("categorizeTransaction", () => {
  it("maps CHARGE to sale", () => {
    expect(categorizeTransaction("CHARGE")).toBe("sale");
  });

  it("maps unknown types to other", () => {
    expect(categorizeTransaction("MYSTERY_TYPE")).toBe("other");
  });
});

describe("aggregateTransactions", () => {
  const transactions: TransactionInput[] = [
    { type: "sale", amount: 524700, fee: 15200 },
    { type: "refund", amount: -18000, fee: 0 },
    { type: "adjustment", amount: -10300, fee: 0 },
  ];

  it("aggregates sales correctly", () => {
    const result = aggregateTransactions(transactions);
    expect(result.grossSales).toBe(524700);
  });

  it("aggregates refunds correctly", () => {
    const result = aggregateTransactions(transactions);
    expect(result.refunds).toBe(18000);
  });

  it("aggregates fees correctly", () => {
    const result = aggregateTransactions(transactions);
    expect(result.fees).toBe(15200);
  });

  it("calculates net payout", () => {
    const result = aggregateTransactions(transactions);
    expect(result.netAmount).toBe(524700 - 18000 - 15200 - 10300);
  });
});

describe("reconcileBreakdown", () => {
  it("passes when diff is zero", () => {
    const breakdown = aggregateTransactions([
      { type: "sale", amount: 10000, fee: 300 },
    ]);
    const { reconciled, diff } = reconcileBreakdown(breakdown, 9700);
    expect(reconciled).toBe(true);
    expect(diff).toBe(0);
  });

  it("fails when diff is non-zero", () => {
    const breakdown = aggregateTransactions([
      { type: "sale", amount: 10000, fee: 300 },
    ]);
    const { reconciled, diff } = reconcileBreakdown(breakdown, 9600);
    expect(reconciled).toBe(false);
    expect(diff).toBe(100);
  });
});

describe("parseMoneyToMinorUnits", () => {
  it("parses dollar amounts", () => {
    expect(parseMoneyToMinorUnits("5247.00")).toBe(524700);
  });

  it("parses negative amounts", () => {
    expect(parseMoneyToMinorUnits("-180.00")).toBe(-18000);
  });
});
