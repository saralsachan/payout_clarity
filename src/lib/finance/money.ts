export type MinorUnits = number;

export function parseMoneyToMinorUnits(amount: string): MinorUnits {
  const trimmed = amount.trim();
  const negative = trimmed.startsWith("-");
  const normalized = negative ? trimmed.slice(1) : trimmed;
  const [whole = "0", fraction = ""] = normalized.split(".");
  const cents = fraction.padEnd(2, "0").slice(0, 2);
  const value = parseInt(whole, 10) * 100 + parseInt(cents || "0", 10);
  if (Number.isNaN(value)) return 0;
  return negative ? -value : value;
}

export function formatMoney(minor: MinorUnits, currency = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(minor / 100);
}

export function formatMoneySigned(minor: MinorUnits, currency = "USD"): string {
  if (minor === 0) return formatMoney(0, currency);
  const prefix = minor < 0 ? "-" : "";
  return prefix + formatMoney(Math.abs(minor), currency);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
