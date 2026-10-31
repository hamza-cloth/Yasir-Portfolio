import Link from "next/link";
import { notFound } from "next/navigation";

import { saveInvoice } from "@/app/admin/business-actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { AdminHeader, NoDatabase } from "@/components/admin/AdminUi";
import { FormSection, SelectField, TextArea, TextField } from "@/components/admin/fields";
import { PrintButton } from "@/components/admin/PrintButton";
import { dateOnly, inr, toDateTimeInput } from "@/lib/admin/format";
import { pageAdmin } from "@/lib/admin/guard";
import { getSiteSettings } from "@/lib/data/settings";
import { getDb } from "@/lib/db";
import {
  formatInvoiceLines,
  INVOICE_STATUSES,
  invoiceItemSchema,
  invoiceTotals,
} from "@/lib/validation/business";

export const metadata = { title: "Invoice" };
// Checks the session on every request, so navigating here may block (see admin/layout.tsx).
export const instant = false;

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ client?: string }>;
}) {
  await pageAdmin();
  const db = getDb();
  if (!db) return <NoDatabase />;

  const { id } = await params;
  const { client: clientParam } = await searchParams;
  const isNew = id === "new";
  const [invoice, clients, settings] = await Promise.all([
    isNew ? null : db.invoice.findUnique({ where: { id }, include: { client: true } }),
    db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getSiteSettings(),
  ]);
  if (!isNew && !invoice) notFound();

  const items = invoiceItemSchema.array().safeParse(invoice?.items ?? []);
  const lines = items.success ? items.data : [];
  const totals = invoiceTotals(lines, invoice?.gstRate ?? 0);

  if (clients.length === 0) {
    return (
      <>
        <AdminHeader title="New invoice" back={{ href: "/admin/invoices", label: "Invoices" }} />
        <p className="surface rounded-card border border-dashed border-line-2 p-8 text-center text-muted">
          Invoices belong to a client.{" "}
          <Link href="/admin/clients/new" className="underline">
            Add a client first
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <div className="print:hidden">
        <AdminHeader
          title={invoice ? invoice.number : "New invoice"}
          back={{ href: "/admin/invoices", label: "Invoices" }}
        />
      </div>

      {invoice ? (
        <article className="surface mb-10 flex flex-col gap-6 rounded-card border border-line bg-surface-solid p-6 md:p-10 print:border-0 print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="label-mono text-c1-text">Invoice</p>
              <h2 className="mt-1 font-mono text-2xl">{invoice.number}</h2>
              <p className="mt-2 text-sm text-muted">
                Issued {dateOnly.format(invoice.issuedAt)}
                {invoice.dueAt ? ` · Due ${dateOnly.format(invoice.dueAt)}` : ""}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{settings.name}</p>
              <p className="text-muted">{settings.email}</p>
              <p className="text-muted">{settings.location}</p>
            </div>
          </header>
          <div className="text-sm">
            <p className="label-mono text-faint">Billed to</p>
            <p className="mt-1 font-semibold">{invoice.client.name}</p>
            {invoice.client.company ? <p>{invoice.client.company}</p> : null}
            {invoice.client.address ? (
              <p className="whitespace-pre-line text-muted">{invoice.client.address}</p>
            ) : null}
            {invoice.client.gstin ? (
              <p className="text-muted">GSTIN {invoice.client.gstin}</p>
            ) : null}
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-faint">
              <tr>
                <th scope="col" className="py-2 font-normal">
                  Description
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Qty
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Rate
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lines.map((line, index) => (
                <tr key={index}>
                  <td className="py-2">{line.description}</td>
                  <td className="py-2 text-right">{line.quantity}</td>
                  <td className="py-2 text-right">{inr(line.rate)}</td>
                  <td className="py-2 text-right">{inr(Math.round(line.quantity * line.rate))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-line-2">
              <tr>
                <td colSpan={3} className="pt-3 text-right text-muted">
                  Subtotal
                </td>
                <td className="pt-3 text-right">{inr(totals.subtotal)}</td>
              </tr>
              {invoice.gstRate > 0 ? (
                <tr>
                  <td colSpan={3} className="text-right text-muted">
                    GST {invoice.gstRate}%
                  </td>
                  <td className="text-right">{inr(totals.gst)}</td>
                </tr>
              ) : null}
              <tr>
                <td colSpan={3} className="pt-2 text-right font-semibold">
                  Total
                </td>
                <td className="pt-2 text-right font-display text-xl">{inr(invoice.total)}</td>
              </tr>
            </tfoot>
          </table>
          {invoice.notes ? (
            <p className="text-sm whitespace-pre-line text-muted">{invoice.notes}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 print:hidden">
            <PrintButton />
            <Link
              href={`/admin/clients/${invoice.clientId}`}
              className="inline-flex min-h-11 items-center rounded-pill border border-line-2 px-4 text-sm hover:border-c1"
            >
              Client →
            </Link>
          </div>
        </article>
      ) : null}

      <div className="print:hidden">
        <AdminForm
          action={saveInvoice.bind(null, invoice?.id ?? null)}
          submitLabel={invoice ? "Save invoice" : "Create invoice"}
        >
          <FormSection title="Invoice">
            <SelectField
              label="Client"
              name="clientId"
              defaultValue={invoice?.clientId ?? clientParam ?? clients[0]?.id}
              options={clients.map((client) => [client.id, client.name] as const)}
            />
            <SelectField
              label="Status"
              name="status"
              defaultValue={invoice?.status ?? "DRAFT"}
              options={INVOICE_STATUSES.map((status) => [status, status.toLowerCase()] as const)}
            />
            <TextField
              label="GST rate (%)"
              name="gstRate"
              type="number"
              min={0}
              max={28}
              step={0.5}
              defaultValue={invoice?.gstRate ?? 0}
              hint="0 if you are not GST-registered. 18 is the usual rate for software services."
            />
            <TextField
              label="Due date"
              name="dueAt"
              type="date"
              defaultValue={toDateTimeInput(invoice?.dueAt ?? null)}
            />
            <TextArea
              label="Lines"
              name="items"
              rows={6}
              defaultValue={
                invoice ? formatInvoiceLines(lines) : "Website design and build | 1 | 25000"
              }
              hint="One per line: description | quantity | rate in ₹. Totals are calculated for you."
              className="md:col-span-2"
            />
            <TextArea
              label="Notes"
              name="notes"
              rows={3}
              defaultValue={
                invoice?.notes ?? "Payment by UPI or bank transfer within 7 days. Thank you!"
              }
              className="md:col-span-2"
            />
          </FormSection>
        </AdminForm>
      </div>
    </>
  );
}
