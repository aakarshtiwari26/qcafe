/**
 * Shared by Server AND Client Components — must never import `@/config/env`
 * (or anything that does). That module validates every server secret at
 * import time, and importing it from client-reachable code drags the whole
 * validated env object into the browser bundle, crashing every page that
 * doesn't have those vars available client-side.
 *
 * Currency is intentionally a plain constant here rather than read from
 * env/site-config for the same reason. If multi-currency support is ever
 * needed, thread it through props from a Server Component instead.
 */
const CURRENCY_CODE = "INR";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(new Date(date));
}
