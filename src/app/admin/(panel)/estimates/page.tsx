import Link from "next/link";

import { setEstimateStatus } from "@/app/admin/business-actions";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { dateTime, inr } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db";
import { ESTIMATE_STATUSES } from "@/lib/validation/business";

export const metadata = { title: "Estimates" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function EstimatesPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const estimates = await db.estimate.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { lead: { select: { id: true, name: true, stage: true } } },
  });
  const editable = can(admin.role, "edit");

  return (
    <>
      <AdminHeader
        title="Estimates"
        description="Saved from the cost calculator when a visitor asks for an exact quote. Numbers are recalculated on the server from the prices in src/config/pricing.ts."
      />
      {estimates.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No estimates yet. One is saved each time someone uses “Get Exact Quote” on{" "}
          <Link href="/estimate" target="_blank" className="underline">
            /estimate
          </Link>{" "}
          and sends the form.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {estimates.map((estimate) => (
            <li
              key={estimate.id}
              id={estimate.number}
              className="surface flex scroll-mt-24 flex-col gap-3 rounded-card border border-line p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm text-c1-text">{estimate.number}</span>
                  <span className="font-display text-xl">
                    {inr(estimate.low)} – {inr(estimate.high)}
                  </span>
                  <span className="text-sm text-muted">
                    {estimate.weeksMin}–{estimate.weeksMax} weeks
                  </span>
                </p>
                {editable ? (
                  <form action={setEstimateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={estimate.id} />
                    <label className="sr-only" htmlFor={`status-${estimate.id}`}>
                      Status of {estimate.number}
                    </label>
                    <select
                      id={`status-${estimate.id}`}
                      name="status"
                      defaultValue={estimate.status}
                      className="min-h-11 rounded-field border border-line-2 bg-bg/60 px-3 text-sm"
                    >
                      {ESTIMATE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status.toLowerCase()}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="min-h-11 rounded-pill border border-line-2 px-4 text-sm hover:border-c1"
                    >
                      Set
                    </button>
                  </form>
                ) : (
                  <span className="label-mono text-faint">{estimate.status}</span>
                )}
              </div>
              <pre className="font-body text-sm whitespace-pre-wrap text-muted">
                {estimate.summary}
              </pre>
              <p className="text-xs text-faint">
                {dateTime.format(estimate.createdAt)}
                {estimate.lead ? (
                  <>
                    {" · "}
                    <Link href={`/admin/leads/${estimate.lead.id}`} className="underline">
                      Lead: {estimate.lead.name}
                    </Link>{" "}
                    ({estimate.lead.stage.toLowerCase()})
                  </>
                ) : estimate.contactEmail ? (
                  ` · ${estimate.contactName ?? ""} ${estimate.contactEmail}`
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
