// Small readers that turn admin form fields into typed values before validation.

export function text(form: FormData, name: string): string {
  return String(form.get(name) ?? "").trim();
}

export function optionalText(form: FormData, name: string): string | null {
  return text(form, name) || null;
}

// One item per line; commas also split, so "Next.js, React" and two lines read the same.
export function list(form: FormData, name: string): string[] {
  return text(form, name)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

// One item per line, commas kept: for sentences such as highlights or "now" items.
export function lines(form: FormData, name: string): string[] {
  return text(form, name)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

// "Title :: Body" per line, for decisions and principles.
export function pairs(form: FormData, name: string): { title: string; body: string }[] {
  return lines(form, name).map((line) => {
    const [title = "", ...rest] = line.split("::");
    return { title: title.trim(), body: rest.join("::").trim() };
  });
}

export function formatPairs(items: { title: string; body: string }[]): string {
  return items.map((item) => `${item.title} :: ${item.body}`).join("\n");
}

export function optionalInt(form: FormData, name: string): number | null {
  const value = text(form, name);
  if (value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : Number.NaN;
}

export function bool(form: FormData, name: string): boolean {
  return form.get(name) === "on";
}

// <input type="date"> sends "YYYY-MM-DD"; it is read as midnight IST.
export function optionalDate(form: FormData, name: string): Date | null {
  const value = text(form, name);
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateInput(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}
