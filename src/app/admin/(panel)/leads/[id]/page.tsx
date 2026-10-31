import Link from "next/link";
import { notFound } from "next/navigation";

import { convertLeadToClient, deleteLead, saveLead } from "@/app/admin/business-actions";
import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { FormSection, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { dateTime, inr, toDateTimeInput } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db";
import { LEAD_SOURCES, LEAD_STAGE_LABELS, LEAD_STAGES } from "@/lib/validation/business";

export const metadata = { title: "Lead" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const pillClass =
  "inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm hover:border-c1";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const isNew = id === "new";
  const lead = isNew
    ? null
    : await db.lead.findUnique({
        where: { id },
        include: { estimates: { orderBy: { createdAt: "desc" } } },
      });
  if (!isNew && !lead) notFound();
  const editable = can(admin.role, "edit");
  const subject = encodeURIComponent(`Your ${lead?.projectType ?? "project"} inquiry`);

  return (
    <>
      <AdminHeader
        title={lead ? lead.name : "New lead"}
        description={
          lead
            ? `From ${lead.source} · ${dateTime.format(lead.createdAt)}`
            : "Add a lead you met elsewhere: a call, a referral, a WhatsApp chat."
        }
        back={{ href: "/admin/leads", label: "Leads" }}
      />

      {lead ? (
        <div className="mb-6 flex flex-wrap gap-2">
          <a href={`mailto:${lead.email}?subject=${subject}`} className={pillClass}>
            Email {lead.email}
          </a>
          {lead.phone ? (
            <a
              href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener"
              className={pillClass}
            >
              WhatsApp {lead.phone}
            </a>
          ) : null}
          {lead.clientId ? (
            <Link href={`/admin/clients/${lead.clientId}`} className={pillClass}>
              Client record →
            </Link>
          ) : editable ? (
            <InlineAction
              action={convertLeadToClient}
              hidden={{ id: lead.id }}
              label="Convert to client"
            />
          ) : null}
        </div>
      ) : null}

      <AdminForm
        action={saveLead.bind(null, lead?.id ?? null)}
        submitLabel={lead ? "Save lead" : "Add lead"}
      >
        <FormSection title="Contact">
          <TextField label="Name" name="name" defaultValue={lead?.name} required />
          <TextField label="Email" name="email" type="email" defaultValue={lead?.email} required />
          <TextField label="Phone / WhatsApp" name="phone" defaultValue={lead?.phone ?? ""} />
          <SelectField
            label="Source"
            name="source"
            defaultValue={lead?.source ?? "manual"}
            options={LEAD_SOURCES.map((source) => [source, source] as const)}
          />
        </FormSection>
        <FormSection title="Pipeline">
          <SelectField
            label="Stage"
            name="stage"
            defaultValue={lead?.stage ?? "NEW"}
            options={LEAD_STAGES.map((stage) => [stage, LEAD_STAGE_LABELS[stage]] as const)}
          />
          <TextField
            label="Value (₹)"
            name="value"
            type="number"
            min={0}
            step={500}
            defaultValue={lead?.value ?? ""}
            hint="Expected project value, for the pipeline total."
          />
          <TextField
            label="Follow up on"
            name="followUpAt"
            type="date"
            defaultValue={toDateTimeInput(lead?.followUpAt ?? null)}
          />
          <TextField
            label="Project type"
            name="projectType"
            defaultValue={lead?.projectType ?? ""}
          />
          <TextField label="Budget" name="budget" defaultValue={lead?.budget ?? ""} />
          <TextField label="Timeline" name="timeline" defaultValue={lead?.timeline ?? ""} />
        </FormSection>
        <FormSection title="Details">
          <TextArea
            label="What they asked for"
            name="details"
            rows={6}
            defaultValue={lead?.details ?? ""}
            className="md:col-span-2"
          />
          <TextArea
            label="Private notes"
            name="notes"
            rows={4}
            defaultValue={lead?.notes ?? ""}
            hint="Only visible in the admin."
            className="md:col-span-2"
          />
        </FormSection>
      </AdminForm>

      {lead && lead.estimates.length > 0 ? (
        <section aria-labelledby="lead-estimates" className="mt-10 flex flex-col gap-3">
          <h2 id="lead-estimates" className="text-lg tracking-[-0.02em]">
            Calculator estimates
          </h2>
          <ul className="surface divide-y divide-line rounded-card border border-line">
            {lead.estimates.map((estimate) => (
              <li key={estimate.id} className="flex flex-col gap-1 px-5 py-4">
                <p className="flex flex-wrap items-center gap-3 font-medium">
                  <Link href={`/admin/estimates#${estimate.number}`} className="font-mono text-sm">
                    {estimate.number}
                  </Link>
                  {inr(estimate.low)} – {inr(estimate.high)}
                  <span className="label-mono text-faint">{estimate.status}</span>
                </p>
                <pre className="font-body text-xs whitespace-pre-wrap text-muted">
                  {estimate.summary}
                </pre>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {lead && editable ? (
        <div className="mt-10">
          <InlineAction
            action={deleteLead}
            hidden={{ id: lead.id }}
            label="Delete lead"
            tone="danger"
            confirm={`Move ${lead.name} to the trash?`}
          />
        </div>
      ) : null}
    </>
  );
}
