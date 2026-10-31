import Link from "next/link";

import { setTestimonialStatus } from "@/app/admin/system-actions";
import { InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { cn } from "@/lib/cn";
import { getDb } from "@/lib/db";

export const metadata = { title: "Testimonials" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "border-ok/30 text-ok",
  PENDING: "border-amber/40 text-amber",
  HIDDEN: "border-line-2 text-faint",
};

export default async function TestimonialsPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const testimonials = await db.testimonial.findMany({
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  const editable = can(admin.role, "edit");
  const approved = testimonials.filter((item) => item.status === "APPROVED").length;

  return (
    <>
      <AdminHeader
        title="Testimonials"
        description={`What clients say. Approved ones (${approved}) appear on the home page; with none approved, the section stays hidden. Send clients to /testimonial to write one themselves; theirs arrive here as pending.`}
        action={
          editable ? { href: "/admin/testimonials/new", label: "+ Add testimonial" } : undefined
        }
      />
      {testimonials.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No testimonials yet. Ask a happy client for two lines and add them here.
        </p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {testimonials.map((item) => (
            <li
              key={item.id}
              className="surface flex flex-col gap-3 rounded-card border border-line p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/admin/testimonials/${item.id}`}
                    className="font-semibold text-fg hover:text-c1-text"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {[item.role, item.company].filter(Boolean).join(", ") || "—"}
                    {item.rating ? ` · ${"★".repeat(item.rating)}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "label-mono rounded-pill border px-2.5 py-1",
                    STATUS_STYLE[item.status],
                  )}
                >
                  {item.status.toLowerCase()}
                </span>
              </div>
              <blockquote className="line-clamp-4 text-sm leading-relaxed text-muted">
                “{item.quote}”
              </blockquote>
              {editable ? (
                <div className="flex flex-wrap gap-2">
                  {item.status !== "APPROVED" ? (
                    <InlineAction
                      action={setTestimonialStatus}
                      hidden={{ id: item.id, status: "APPROVED" }}
                      label="Approve"
                    />
                  ) : (
                    <InlineAction
                      action={setTestimonialStatus}
                      hidden={{ id: item.id, status: "HIDDEN" }}
                      label="Hide"
                    />
                  )}
                  <Link
                    href={`/admin/testimonials/${item.id}`}
                    className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-3.5 text-sm text-muted hover:text-fg"
                  >
                    Edit
                  </Link>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
