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
