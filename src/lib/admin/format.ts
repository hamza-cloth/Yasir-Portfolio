// Shared admin formatting: dates in India time, rupees without paise.
export const dateTime = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export const dateOnly = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function inr(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? "—" : rupees.format(amount);
}

// "3 days ago", "in 2 days", for follow-ups and activity.
export function relativeDays(date: Date, now = new Date()): string {
  const days = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

export function toDateTimeInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}
