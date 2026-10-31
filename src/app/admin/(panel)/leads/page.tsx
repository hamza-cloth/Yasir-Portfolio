import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { LeadBoard, type BoardLead } from "@/components/admin/LeadBoard";
import { inr, relativeDays } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db";
import { LEAD_STAGE_LABELS, LEAD_STAGES } from "@/lib/validation/business";

export const metadata = { title: "Leads" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function LeadsPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const leads = await db.lead.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    take: 500,
  });
  const now = new Date();
  const isOpen = (stage: string) => stage !== "WON" && stage !== "LOST";
  const open = leads.filter((lead) => isOpen(lead.stage));
  const pipeline = open.reduce((sum, lead) => sum + (lead.value ?? 0), 0);
  const won = leads.filter((lead) => lead.stage === "WON").length;
  const closed = won + leads.filter((lead) => lead.stage === "LOST").length;
  const editable = can(admin.role, "edit");

  const board: BoardLead[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    stage: lead.stage,
    source: lead.source,
    projectType: lead.projectType,
    value: lead.value,
    followUp: lead.followUpAt ? relativeDays(lead.followUpAt, now) : null,
    overdue: Boolean(lead.followUpAt && lead.followUpAt < now && isOpen(lead.stage)),
  }));

  return (
    <>
      <AdminHeader
        title="Leads"
        description="Every Hire Me inquiry and calculator quote lands here as a new lead. Drag cards between stages, or use the stage menu on a card."
        action={editable ? { href: "/admin/leads/new", label: "+ Add lead" } : undefined}
      />
      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open leads", value: String(open.length) },
          { label: "Open pipeline value", value: inr(pipeline) },
          { label: "Won", value: String(won) },
          { label: "Win rate", value: closed ? `${Math.round((won / closed) * 100)}%` : "—" },
        ].map((stat) => (
          <li
            key={stat.label}
            className="surface flex flex-col gap-1 rounded-card border border-line p-4"
          >
            <span className="font-display text-2xl text-fg">{stat.value}</span>
            <span className="text-sm text-muted">{stat.label}</span>
          </li>
        ))}
      </ul>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <a
          href="/api/admin/export?type=leads"
          className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm text-muted hover:text-fg"
        >
          Export CSV
        </a>
        <Link
          href="/admin/estimates"
          className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm text-muted hover:text-fg"
        >
          Estimates →
        </Link>
      </div>
      {leads.length === 0 ? (
        <p className="surface mb-6 rounded-card border border-dashed border-line-2 p-6 text-center text-muted">
          No leads yet. They appear when someone sends the Hire Me form or asks for a quote from the
          cost calculator.
        </p>
      ) : null}
      <LeadBoard
        leads={board}
        columns={LEAD_STAGES.map((stage) => ({ id: stage, label: LEAD_STAGE_LABELS[stage] }))}
        canEdit={editable}
      />
    </>
  );
}
