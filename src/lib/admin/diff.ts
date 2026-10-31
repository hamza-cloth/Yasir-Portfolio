// Field-by-field differences between two audit snapshots, for the activity log.

export type FieldChange = { field: string; before: string; after: string };

// Bookkeeping fields every row has; a change there says nothing.
const SKIP = new Set(["updatedAt", "createdAt", "id", "position"]);

function show(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value.length > 160 ? `${value.slice(0, 157)}…` : value;
  const text = JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function diffSnapshots(before: unknown, after: unknown): FieldChange[] {
  const a = isRecord(before) ? before : {};
  const b = isRecord(after) ? after : {};
  const fields = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    (field) => !SKIP.has(field),
  );
  return fields
    .filter((field) => JSON.stringify(a[field] ?? null) !== JSON.stringify(b[field] ?? null))
    .map((field) => ({ field, before: show(a[field]), after: show(b[field]) }));
}
