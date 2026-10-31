import "server-only";

import { getDb } from "@/lib/db";
import { calculateEstimate, estimateInputFromParams } from "@/lib/estimate";
import { notify } from "@/lib/notify";
import type { InquiryInput } from "@/lib/validation/inquiry";

// Next estimate number, e.g. EST-2026-0007.
async function nextEstimateNumber(): Promise<string> {
  const db = getDb();
  const year = new Date().getFullYear();
  const count =
    (await db?.estimate.count({ where: { number: { startsWith: `EST-${year}-` } } })) ?? 0;
  return `EST-${year}-${String(count + 1).padStart(4, "0")}`;
}

// Every project inquiry also becomes a lead in the admin pipeline; one that came from the cost
// calculator carries a saved estimate, recalculated here so the numbers cannot be tampered with.
// Best effort: the inquiry itself is already delivered.
export async function recordLead(inquiry: InquiryInput, estimateParams: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    const input = estimateParams
      ? estimateInputFromParams(new URLSearchParams(estimateParams))
      : null;
    const estimate = input ? calculateEstimate(input) : null;
    const lead = await db.lead.create({
      data: {
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        source: estimate ? "calculator" : "hire",
        projectType: inquiry.projectType,
        budget: inquiry.budget ?? null,
        timeline: inquiry.timeline ?? null,
        details: inquiry.details,
        value: estimate ? Math.round((estimate.low + estimate.high) / 2) : null,
      },
    });
    if (input && estimate) {
      await db.estimate.create({
        data: {
          number: await nextEstimateNumber(),
          leadId: lead.id,
          input,
          low: estimate.low,
          high: estimate.high,
          weeksMin: estimate.weeksMin,
          weeksMax: estimate.weeksMax,
          summary: estimate.summaryText,
          status: "REQUESTED",
          contactName: inquiry.name,
          contactEmail: inquiry.email,
        },
      });
    }
    await notify(
      "lead",
      `New lead: ${inquiry.name}`,
      `${inquiry.projectType}${estimate ? " · from the calculator" : ""}`,
      `/admin/leads/${lead.id}`,
    );
  } catch {
    // The message is in the inbox either way.
  }
}
