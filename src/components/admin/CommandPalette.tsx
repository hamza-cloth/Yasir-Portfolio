"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/overlay/Dialog";
import { cn } from "@/lib/cn";

import { NAV_GROUPS, NEW_ACTIONS } from "./admin-nav";

type Command = { id: string; label: string; group: string; href: string; keywords: string };

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  canManage: boolean;
};

// ⌘K / Ctrl+K: jump to any admin section, start something new, or search all content.
export function CommandPalette({ open, onClose, canManage }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = "admin-command-list";

  const commands = useMemo<Command[]>(() => {
    const go = NAV_GROUPS.flatMap((group) =>
      group.items
        .filter((item) => item.permission !== "manage" || canManage)
        .map((item) => ({
          id: item.href,
          label: item.label,
          group: group.label,
          href: item.href,
          keywords: `${item.label} ${group.label} ${item.keywords ?? ""}`.toLowerCase(),
        })),
    );
    const create = NEW_ACTIONS.map((action) => ({
      id: action.href,
      label: `New ${action.label.toLowerCase()}`,
      group: "Create",
      href: action.href,
      keywords: `new add create ${action.label}`.toLowerCase(),
    }));
    return [
      ...create,
      ...go,
      {
        id: "site",
        label: "View the live site",
        group: "Site",
        href: "/",
        keywords: "open public site",
      },
    ];
  }, [canManage]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    const matched = q
      ? commands.filter((command) =>
          q.split(/\s+/).every((word) => command.keywords.includes(word)),
        )
      : commands;
    // A search of all content is always the last option once something is typed.
    return q
      ? [
          ...matched,
          {
            id: "search",
            label: `Search content for “${query.trim()}”`,
            group: "Search",
            href: `/admin/search?q=${encodeURIComponent(query.trim())}`,
            keywords: "",
          },
        ]
      : matched;
  }, [commands, q, query]);

  // A new query starts at the top (adjusted during render, not in an effect).
  const [seenQuery, setSeenQuery] = useState(q);
  if (seenQuery !== q) {
    setSeenQuery(q);
    setActive(0);
  }

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  function run(command: Command | undefined) {
    if (!command) return;
    onClose();
    setQuery("");
    if (command.href === "/") window.open("/", "_blank", "noopener");
    else router.push(command.href);
  }

  let lastGroup = "";

  return (
    <Dialog open={open} onClose={onClose} label="Command menu" panelClassName="max-w-xl">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5 flex-none text-muted"
            fill="none"
          >
            <path
              d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(results.length - 1, index + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(0, index - 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                run(results[active]);
              }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
            aria-label="Type a command or search"
            placeholder="Go to, create, or search…"
            className="min-h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-faint"
          />
          <kbd className="label-mono rounded border border-line-2 px-1.5 py-0.5 text-faint">
            Esc
          </kbd>
        </div>
        <ul
          id={listId}
          role="listbox"
          aria-label="Commands"
          className="max-h-[60vh] overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches.</li>
          ) : null}
          {results.map((command, index) => {
            const heading = command.group !== lastGroup ? command.group : null;
            lastGroup = command.group;
            return (
              <li key={command.id} role="presentation">
                {heading ? (
                  <p role="presentation" className="label-mono px-3 pt-3 pb-1 text-faint">
                    {heading}
                  </p>
                ) : null}
                <div
                  id={`cmd-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => run(command)}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-field px-3 text-sm",
                    index === active ? "bg-c1-soft text-c1-text" : "text-fg",
                  )}
                >
                  {command.label}
                  {index === active ? (
                    <span aria-hidden="true" className="text-xs">
                      ↵
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Dialog>
  );
}
