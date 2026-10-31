"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import type { FormResult } from "@/components/admin/AdminForm";
import { optionalDate, optionalInt, optionalText, text } from "@/lib/admin/form-data";
import { adminContext } from "@/lib/admin/guard";
import { moveToTrash } from "@/lib/admin/trash";
import { audit } from "@/lib/audit";
import { firstIssue } from "@/lib/validation/admin";
import {
  clientSchema,
  ESTIMATE_STATUSES,
  invoiceSchema,
  invoiceTotals,
  LEAD_STAGES,
  leadSchema,
  parseInvoiceLines,
  type LeadStage,
} from "@/lib/validation/business";

function isStage(value: string): value is LeadStage {
  return (LEAD_STAGES as readonly string[]).includes(value);
}

// ---- Leads ---------------------------------------------------------------------------------

function readLead(form: FormData) {
  return leadSchema.safeParse({
    name: text(form, "name"),
    email: text(form, "email"),
    phone: optionalText(form, "phone"),
    source: text(form, "source") || "manual",
    stage: text(form, "stage") || "NEW",
    value: optionalInt(form, "value"),
    projectType: optionalText(form, "projectType"),
    budget: optionalText(form, "budget"),
    timeline: optionalText(form, "timeline"),
    details: text(form, "details").replace(/\r\n/g, "\n"),
    notes: optionalText(form, "notes")?.replace(/\r\n/g, "\n") ?? null,
    followUpAt: optionalDate(form, "followUpAt"),
  });
}

export async function saveLead(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = readLead(form);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (id) {
    const before = await db.lead.findUnique({ where: { id } });
    const after = await db.lead.update({ where: { id }, data: parsed.data });
    await audit(admin.email, "update", "lead", after.name, id, { before, after });
    refresh();
    return { ok: "Lead saved." };
  }
  const created = await db.lead.create({ data: parsed.data });
  await audit(admin.email, "create", "lead", created.name, created.id, { after: created });
  redirect(`/admin/leads/${created.id}`);
}

// Drag and drop on the board (or the stage menu on a card): new stage and position in it.
export async function moveLead(id: string, stage: string, position: number): Promise<void> {
  const { db, admin } = await adminContext();
  if (!isStage(stage)) return;
  const before = await db.lead.findUnique({ where: { id }, select: { stage: true, name: true } });
  if (!before) return;

  const others = await db.lead.findMany({
    where: { stage, id: { not: id } },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  const at = Math.max(0, Math.min(position, others.length));
  const ordered = [
    ...others.slice(0, at).map((lead) => lead.id),
    id,
    ...others.slice(at).map((lead) => lead.id),
  ];
  await db.$transaction(
    ordered.map((leadId, index) =>
      db.lead.update({
        where: { id: leadId },
        data: leadId === id ? { stage, position: index } : { position: index },
      }),
    ),
  );
  if (before.stage !== stage) {
    await audit(admin.email, "update", "lead", `${before.name}: ${before.stage} → ${stage}`, id, {
      before: { stage: before.stage },
      after: { stage },
    });
  }
  refresh();
}

export async function setLeadStage(form: FormData): Promise<void> {
  await moveLead(text(form, "id"), text(form, "stage"), 0);
}

export async function deleteLead(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.lead.delete({ where: { id: text(form, "id") } });
    await moveToTrash(tx, "lead", row.id, row.name, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "lead", removed.name, removed.id, { before: removed });
  redirect("/admin/leads");
}

// A won lead becomes a client (once), keeping the link both ways.
export async function convertLeadToClient(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const lead = await db.lead.findUnique({ where: { id: text(form, "id") } });
  if (!lead) return;
  if (lead.clientId) redirect(`/admin/clients/${lead.clientId}`);

  const client = await db.client.create({
    data: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      notes: `From lead: ${lead.projectType ?? "project"}\n\n${lead.details}`.slice(0, 5000),
    },
  });
  await db.lead.update({ where: { id: lead.id }, data: { clientId: client.id, stage: "WON" } });
  await audit(admin.email, "create", "client", `${client.name} (from a lead)`, client.id);
  redirect(`/admin/clients/${client.id}`);
}

// ---- Estimates -----------------------------------------------------------------------------

export async function setEstimateStatus(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const status = text(form, "status");
  if (!(ESTIMATE_STATUSES as readonly string[]).includes(status)) return;
  const estimate = await db.estimate.update({
    where: { id: text(form, "id") },
    data: { status },
    select: { id: true, number: true },
  });
  await audit(admin.email, "update", "estimate", `${estimate.number} → ${status}`, estimate.id);
  refresh();
}

// ---- Clients -------------------------------------------------------------------------------

export async function saveClient(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = clientSchema.safeParse({
    name: text(form, "name"),
    email: optionalText(form, "email"),
    phone: optionalText(form, "phone"),
    company: optionalText(form, "company"),
    gstin: optionalText(form, "gstin")?.toUpperCase() ?? null,
    address: optionalText(form, "address"),
    notes: optionalText(form, "notes"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (id) {
    const before = await db.client.findUnique({ where: { id } });
    const after = await db.client.update({ where: { id }, data: parsed.data });
    await audit(admin.email, "update", "client", after.name, id, { before, after });
    refresh();
    return { ok: "Client saved." };
  }
  const created = await db.client.create({ data: parsed.data });
  await audit(admin.email, "create", "client", created.name, created.id);
  redirect(`/admin/clients/${created.id}`);
}

export async function deleteClient(form: FormData): Promise<void> {
  const { db, admin } = await adminContext();
  const id = text(form, "id");
  // Invoices are financial records: a client with invoices cannot be deleted.
  if ((await db.invoice.count({ where: { clientId: id } })) > 0) {
    redirect(`/admin/clients/${id}?error=has-invoices`);
  }
  const removed = await db.$transaction(async (tx) => {
    const row = await tx.client.delete({ where: { id } });
    await moveToTrash(tx, "client", row.id, row.name, row, admin.email);
    return row;
  });
  await audit(admin.email, "delete", "client", removed.name, removed.id, { before: removed });
  redirect("/admin/clients");
}

// ---- Invoices ------------------------------------------------------------------------------

async function nextInvoiceNumber(db: Awaited<ReturnType<typeof adminContext>>["db"]) {
  const year = new Date().getFullYear();
  const count = await db.invoice.count({ where: { number: { startsWith: `INV-${year}-` } } });
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function saveInvoice(
  id: string | null,
  _previous: FormResult,
  form: FormData,
): Promise<FormResult> {
  const { db, admin } = await adminContext();
  const parsed = invoiceSchema.safeParse({
    clientId: text(form, "clientId"),
    items: parseInvoiceLines(text(form, "items")),
    gstRate: Number(text(form, "gstRate") || "0"),
    status: text(form, "status") || "DRAFT",
    dueAt: optionalDate(form, "dueAt"),
    notes: optionalText(form, "notes"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const { subtotal, total } = invoiceTotals(parsed.data.items, parsed.data.gstRate);
  const data = {
    ...parsed.data,
    subtotal,
    total,
    paidAt: parsed.data.status === "PAID" ? new Date() : null,
  };

  if (id) {
    const before = await db.invoice.findUnique({ where: { id } });
    const after = await db.invoice.update({
      where: { id },
      data: { ...data, paidAt: data.paidAt ? (before?.paidAt ?? data.paidAt) : null },
    });
    await audit(admin.email, "update", "invoice", after.number, id, { before, after });
    refresh();
    return { ok: "Invoice saved." };
  }
  const created = await db.invoice.create({
    data: { ...data, number: await nextInvoiceNumber(db) },
  });
  await audit(admin.email, "create", "invoice", created.number, created.id);
  redirect(`/admin/invoices/${created.id}`);
}
