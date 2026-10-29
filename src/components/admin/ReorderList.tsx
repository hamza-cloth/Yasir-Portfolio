"use client";

import { useState, useTransition, type DragEvent, type KeyboardEvent } from "react";
import Link from "next/link";

import type { FormResult } from "./AdminForm";
import { StatusPill } from "./AdminUi";
import { toast } from "./Toaster";

type Row = { id: string; title: string; meta: string; published: boolean; href: string };

type ReorderListProps = {
  rows: Row[];
  save: (ids: string[]) => Promise<FormResult>;
};

// Drag rows (or use Alt+↑/↓ on the handle) to reorder; the new order saves straight away.
export function ReorderList({ rows: initial, save }: ReorderListProps) {
  const [rows, setRows] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function commit(next: Row[]) {
    setRows(next);
    startTransition(async () => {
      const result = await save(next.map((row) => row.id));
      if (result.error) toast("error", result.error);
      else toast("ok", result.ok ?? "Order saved.");
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [row] = next.splice(from, 1);
    if (row) next.splice(to, 0, row);
    commit(next);
  }

  function onDrop(event: DragEvent<HTMLLIElement>, targetIndex: number) {
    event.preventDefault();
    const from = rows.findIndex((row) => row.id === dragging);
    setDragging(null);
    move(from, targetIndex);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!event.altKey) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(index, index - 1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(index, index + 1);
    }
  }

  return (
    <ol
      aria-busy={pending}
      className="surface divide-y divide-line overflow-hidden rounded-card border border-line"
    >
      {rows.map((row, index) => (
        <li
          key={row.id}
          draggable
          onDragStart={() => setDragging(row.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => onDrop(event, index)}
          onDragEnd={() => setDragging(null)}
          className={`flex items-center gap-3 px-3 py-3 transition-colors ${
            dragging === row.id ? "bg-c1-soft" : "hover:bg-fg/4"
          }`}
        >
          <button
            type="button"
            aria-label={`Reorder ${row.title}. Position ${index + 1} of ${rows.length}. Alt plus arrow keys to move.`}
            onKeyDown={(event) => onKeyDown(event, index)}
            className="grid size-11 flex-none cursor-grab place-items-center rounded-field text-muted hover:text-fg active:cursor-grabbing"
          >
            ⠿
          </button>
          <Link
            href={row.href}
            className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3"
          >
            <span className="flex min-w-0 flex-col">
              <span className="font-medium text-fg">{row.title}</span>
              <span className="text-sm text-muted">{row.meta}</span>
            </span>
            <StatusPill on={row.published} onLabel="Published" offLabel="Draft" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
