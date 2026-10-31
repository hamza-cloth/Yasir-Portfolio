import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteClient, saveClient } from "@/app/admin/business-actions";
import { AdminForm, InlineAction } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { FormSection, TextArea, TextField } from "@/components/admin/fields";
import { dateOnly, inr } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { can } from "@/lib/admin/roles";
import { getDb } from "@/lib/db";

export const metadata = { title: "Client" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const { error } = await searchParams;
  const isNew = id === "new";
  const client = isNew
    ? null
    : await db.client.findUnique({
        where: { id },
        include: { invoices: { orderBy: { issuedAt: "desc" } } },
      });
  if (!isNew && !client) notFound();
  const editable = can(admin.role, "edit");

  return (
    <>
      <AdminHeader
        title={client ? client.name : "New client"}
        back={{ href: "/admin/clients", label: "Clients" }}
        action={
          client && editable
            ? { href: `/admin/invoices/new?client=${client.id}`, label: "+ New invoice" }
            : undefined
        }
      />
      {error === "has-invoices" ? (
        <p
          role="alert"
          className="mb-6 rounded-card border border-amber/30 bg-amber/8 px-5 py-3 text-sm"
        >
          This client has invoices, which are kept as financial records, so it cannot be deleted.
        </p>
      ) : null}

      <AdminForm
        action={saveClient.bind(null, client?.id ?? null)}
        submitLabel={client ? "Save client" : "Add client"}
      >
        <FormSection title="Client">
          <TextField label="Name" name="name" defaultValue={client?.name} required />
          <TextField label="Company" name="company" defaultValue={client?.company ?? ""} />
          <TextField label="Email" name="email" type="email" defaultValue={client?.email ?? ""} />
          <TextField label="Phone" name="phone" defaultValue={client?.phone ?? ""} />
          <TextField
            label="GSTIN"
            name="gstin"
            defaultValue={client?.gstin ?? ""}
            hint="Optional, 15 characters. Printed on invoices."
          />
          <TextArea
            label="Billing address"
            name="address"
            rows={3}
            defaultValue={client?.address ?? ""}
          />
          <TextArea
            label="Notes"
            name="notes"
            rows={4}
            defaultValue={client?.notes ?? ""}
            className="md:col-span-2"
          />
        </FormSection>
      </AdminForm>

      {client ? (
        <section aria-labelledby="client-invoices" className="mt-10 flex flex-col gap-3">
          <h2 id="client-invoices" className="text-lg tracking-[-0.02em]">
            Invoices
          </h2>
          {client.invoices.length === 0 ? (
            <p className="text-sm text-muted">No invoices yet.</p>
          ) : (
            <ul className="surface divide-y divide-line rounded-card border border-line">
              {client.invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <Link
                    href={`/admin/invoices/${invoice.id}`}
                    className="font-mono text-sm text-c1-text"
                  >
                    {invoice.number}
                  </Link>
                  <span className="text-sm text-muted">{dateOnly.format(invoice.issuedAt)}</span>
                  <span className="label-mono text-faint">{invoice.status}</span>
                  <span className="font-semibold">{inr(invoice.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {client && editable ? (
        <div className="mt-10">
          <InlineAction
            action={deleteClient}
            hidden={{ id: client.id }}
            label="Delete client"
            tone="danger"
            confirm={`Move ${client.name} to the trash?`}
          />
        </div>
      ) : null}
    </>
  );
}
