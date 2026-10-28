export type StatusTone = "ok" | "amber" | "accent";

// Status labels are free text from the admin, so the tag colour is inferred from the wording.
export function statusTone(label: string): StatusTone {
  if (/working|live|shipped|launched/i.test(label)) return "ok";
  if (/mvp|development|prototype/i.test(label)) return "amber";
  return "accent";
}
