import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { dateOnly, inr } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db";

export const metadata = { title: "Invoices" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function InvoicesPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const invoices = await db.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    take: 300,
    include: { client: { select: { name: true } } },
  });
  const now = new Date();
  const sum = (status: string[]) =>
    invoices
      .filter((invoice) => status.includes(invoice.status))
      .reduce((total, invoice) => total + invoice.total, 0);
  const overdue = invoices.filter(
    (invoice) => invoice.status === "SENT" && invoice.dueAt && invoice.dueAt < now,
  );

  return (
    <>
      <AdminHeader
        title="Invoices"
        description="Numbered INV-year-0001, with optional GST. Open one to print it or save it as a PDF."
        action={
          can(admin.role, "edit")
            ? { href: "/admin/invoices/new", label: "+ New invoice" }
            : undefined
        }
      />
      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Paid", value: inr(sum(["PAID"])) },
          { label: "Outstanding", value: inr(sum(["SENT", "OVERDUE"])) },
          { label: "Past due date", value: String(overdue.length) },
          {
            label: "Drafts",
            value: String(invoices.filter((invoice) => invoice.status === "DRAFT").length),
          },
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
      {invoices.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No invoices yet. Add a client first, then create an invoice for them.
        </p>
      ) : (
        <div
          className="surface overflow-x-auto rounded-card border border-line"
          role="region"
          aria-label="Invoices"
          tabIndex={0}
        >
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-faint">
              <tr>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Number
                </th>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Client
                </th>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Issued
                </th>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Status
                </th>
                <th scope="col" className="label-mono px-5 py-3 text-right font-normal">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((invoice) => {
                const late = overdue.includes(invoice);
                return (
                  <tr key={invoice.id} className="hover:bg-fg/[0.03]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="font-mono text-c1-text"
                      >
                        {invoice.number}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{invoice.client.name}</td>
                    <td className="px-5 py-3 text-muted">{dateOnly.format(invoice.issuedAt)}</td>
                    <td className="px-5 py-3">
                      <span className={late ? "label-mono text-red" : "label-mono text-faint"}>
                        {late ? "PAST DUE" : invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{inr(invoice.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
