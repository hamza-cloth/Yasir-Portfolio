"use client";

import { useOptimistic, useState, useTransition, type DragEvent } from "react";
import Link from "next/link";

import { moveLead } from "@/app/admin/business-actions";
import { cn } from "@/lib/cn";

import { toast } from "./Toaster";

export type BoardLead = {
  id: string;
  name: string;
  stage: string;
  source: string;
  projectType: string | null;
  value: number | null;
  followUp: string | null;
  overdue: boolean;
};

type Column = { id: string; label: string };

type Move = { id: string; stage: string; position: number };

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function applyMove(leads: BoardLead[], move: Move): BoardLead[] {
  const moving = leads.find((lead) => lead.id === move.id);
  if (!moving) return leads;
  const rest = leads.filter((lead) => lead.id !== move.id);
  const column = rest.filter((lead) => lead.stage === move.stage);
  const before = column[move.position - 1];
  const index = before
    ? rest.indexOf(before) + 1
    : rest.findIndex((lead) => lead.stage === move.stage);
  const next = [...rest];
  next.splice(index === -1 ? next.length : index, 0, { ...moving, stage: move.stage });
  return next;
}

// The pipeline: drag a card to another column (or within one), or use the stage menu on the card
// (keyboard and touch). Moves show at once and are saved in the background.
export function LeadBoard({
  leads,
  columns,
  canEdit,
}: {
  leads: BoardLead[];
  columns: Column[];
  canEdit: boolean;
}) {
  const [optimistic, addMove] = useOptimistic(leads, applyMove);
  const [, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  function move(id: string, stage: string, position: number) {
    startTransition(async () => {
      addMove({ id, stage, position });
      try {
        await moveLead(id, stage, position);
      } catch {
        toast("error", "The move could not be saved.");
      }
    });
  }

  function onDrop(event: DragEvent<HTMLElement>, stage: string) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    setOver(null);
    setDragging(null);
    if (!id) return;
    // Dropped on a card: take its place; on empty space: go to the end.
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-lead]");
    const column = optimistic.filter((lead) => lead.stage === stage && lead.id !== id);
    const position = target
      ? Math.max(
          0,
          column.findIndex((lead) => lead.id === target.dataset.lead),
        )
      : column.length;
    move(id, stage, position);
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8">
      <ol className="grid min-w-max auto-cols-[17rem] grid-flow-col gap-3">
        {columns.map((column) => {
          const items = optimistic.filter((lead) => lead.stage === column.id);
          const total = items.reduce((sum, lead) => sum + (lead.value ?? 0), 0);
          return (
            <li
              key={column.id}
              aria-label={`${column.label}, ${items.length} leads`}
              onDragOver={(event) => {
                if (!canEdit) return;
                event.preventDefault();
                setOver(column.id);
              }}
              onDragLeave={() => setOver((value) => (value === column.id ? null : value))}
              onDrop={(event) => onDrop(event, column.id)}
              className={cn(
                "flex min-h-64 flex-col gap-2 rounded-card border bg-surface-2/40 p-2 transition-colors",
                over === column.id ? "border-c1 bg-c1-soft/40" : "border-line",
              )}
            >
              <div className="flex items-baseline justify-between gap-2 px-2 pt-1 pb-2">
                <h2 className="text-sm font-semibold">
                  {column.label} <span className="label-mono text-faint">{items.length}</span>
                </h2>
                {total > 0 ? (
                  <span className="text-xs text-muted">{rupees.format(total)}</span>
                ) : null}
              </div>
              <ul className="flex flex-col gap-2">
                {items.map((lead) => (
                  <li
                    key={lead.id}
                    data-lead={lead.id}
                    draggable={canEdit}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", lead.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDragging(lead.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    className={cn(
                      "surface flex flex-col gap-2 rounded-field border border-line bg-surface-solid p-3 shadow-(--shadow-soft)",
                      canEdit && "cursor-grab active:cursor-grabbing",
                      dragging === lead.id && "opacity-50",
                    )}
                  >
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-semibold text-fg hover:text-c1-text"
                    >
                      {lead.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {lead.projectType ?? "Project"} · {lead.source}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {lead.value ? (
                        <span className="rounded-pill bg-fg/5 px-2 py-0.5 font-semibold">
                          {rupees.format(lead.value)}
                        </span>
                      ) : null}
                      {lead.followUp ? (
                        <span
                          className={cn(
                            "rounded-pill px-2 py-0.5",
                            lead.overdue ? "bg-red/10 text-red" : "bg-fg/5 text-muted",
                          )}
                        >
                          Follow up {lead.followUp}
                        </span>
                      ) : null}
                    </div>
                    {canEdit ? (
                      <label className="flex items-center gap-2 text-xs text-faint">
                        <span className="sr-only">Stage for {lead.name}</span>
                        <select
                          value={lead.stage}
                          onChange={(event) => move(lead.id, event.target.value, 0)}
                          className="min-h-9 w-full rounded-field border border-line-2 bg-bg/60 px-2 text-xs text-fg"
                        >
                          {columns.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="rounded-field border border-dashed border-line-2 p-4 text-center text-xs text-faint">
                    {canEdit ? "Drop a lead here" : "No leads"}
                  </li>
                ) : null}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
