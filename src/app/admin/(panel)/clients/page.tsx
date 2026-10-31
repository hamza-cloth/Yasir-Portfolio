import Link from "next/link";

import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { inr } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db";

export const metadata = { title: "Clients" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function ClientsPage() {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const clients = await db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: { invoices: { select: { total: true, status: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Clients"
        description="People you work for. Convert a won lead, or add one by hand; invoices hang off each client."
        action={
          can(admin.role, "edit")
            ? { href: "/admin/clients/new", label: "+ Add client" }
            : undefined
        }
      />
      {clients.length === 0 ? (
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          No clients yet.
        </p>
      ) : (
        <div
          className="surface overflow-x-auto rounded-card border border-line"
          role="region"
          aria-label="Clients"
          tabIndex={0}
        >
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-faint">
              <tr>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Name
                </th>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Contact
                </th>
                <th scope="col" className="label-mono px-5 py-3 font-normal">
                  Invoices
                </th>
                <th scope="col" className="label-mono px-5 py-3 text-right font-normal">
                  Paid
                </th>
                <th scope="col" className="label-mono px-5 py-3 text-right font-normal">
                  Outstanding
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((client) => {
                const paid = client.invoices
                  .filter((invoice) => invoice.status === "PAID")
                  .reduce((sum, invoice) => sum + invoice.total, 0);
                const due = client.invoices
                  .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
                  .reduce((sum, invoice) => sum + invoice.total, 0);
                return (
                  <tr key={client.id} className="hover:bg-fg/[0.03]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-semibold text-fg hover:text-c1-text"
                      >
                        {client.name}
                      </Link>
                      {client.company ? (
                        <span className="block text-xs text-muted">{client.company}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-muted">{client.email ?? client.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{client.invoices.length}</td>
                    <td className="px-5 py-3 text-right">{inr(paid)}</td>
                    <td className="px-5 py-3 text-right">{due ? inr(due) : "—"}</td>
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
