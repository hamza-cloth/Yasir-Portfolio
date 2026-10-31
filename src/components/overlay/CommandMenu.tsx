"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { LOOK_LABELS, LOOKS, setLook } from "@/lib/look";
import { requestTerminal } from "@/lib/overlay-events";
import { ALL_PAGES } from "@/lib/site-nav";

import { Dialog } from "./Dialog";

type Command = {
  id: string;
  group: "Pages" | "Actions" | "Looks";
  label: string;
  hint?: string;
  run: () => void;
};

type CommandMenuProps = {
  open: boolean;
  onClose: () => void;
  email: string;
};

export function CommandMenu({ open, onClose, email }: CommandMenuProps) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");

  const commands = useMemo<Command[]>(
    () => [
      ...ALL_PAGES.map((page) => ({
        id: `page:${page.href}`,
        group: "Pages" as const,
        label: page.label,
        hint: page.href,
        run: () => {
          onClose();
          router.push(page.href);
        },
      })),
      {
        id: "terminal",
        group: "Actions",
        label: "Open the terminal",
        hint: "`",
        run: () => {
          onClose();
          // Opened after this dialog has closed, so focus lands in the terminal.
          window.setTimeout(requestTerminal, 50);
        },
      },
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: email,
        run: () => {
          navigator.clipboard
            .writeText(email)
            .then(() => setNotice("Email copied."))
            .catch(() => setNotice(`Copy failed. The address is ${email}.`));
        },
      },
      {
        id: "mail",
        group: "Actions",
        label: "Write an email",
        hint: "mailto",
        run: () => {
          window.location.href = `mailto:${email}`;
        },
      },
      ...LOOKS.map((look) => ({
        id: `look:${look}`,
        group: "Looks" as const,
        label: `Switch to the ${LOOK_LABELS[look]} look`,
        run: () => {
          setLook(look);
          onClose();
        },
      })),
    ],
    [email, onClose, router],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.hint ?? ""} ${command.group}`.toLowerCase().includes(needle),
    );
  }, [commands, query]);

  const current = Math.min(active, Math.max(0, visible.length - 1));

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + visible.length) % Math.max(1, visible.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      visible[current]?.run();
    }
  }

  function close() {
    setQuery("");
    setActive(0);
    setNotice("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={close} label="Command menu">
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
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={visible[current] ? `${listId}-${visible[current].id}` : undefined}
          aria-label="Search pages and actions"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search pages and actions…"
          className="min-h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-faint"
        />
        <kbd className="label-mono hidden rounded-md border border-line px-1.5 py-0.5 text-faint sm:inline">
          Esc
        </kbd>
      </div>

      <ul id={listId} role="listbox" aria-label="Commands" className="min-h-0 overflow-y-auto p-2">
        {visible.length === 0 ? (
          <li className="px-3 py-8 text-center text-muted">Nothing matches “{query}”.</li>
        ) : (
          visible.map((command, index) => {
            const startsGroup = index === 0 || visible[index - 1]?.group !== command.group;
            return (
              <li key={command.id} role="presentation">
                {startsGroup ? (
                  <p className="label-mono px-3 pt-3 pb-1.5 text-faint" aria-hidden="true">
                    {command.group}
                  </p>
                ) : null}
                <div
                  id={`${listId}-${command.id}`}
                  role="option"
                  aria-selected={index === current}
                  onPointerMove={() => setActive(index)}
                  onClick={() => command.run()}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-[0.95rem]",
                    index === current ? "bg-c1-soft text-c1-text" : "text-fg",
                  )}
                >
                  <span className="truncate font-semibold">{command.label}</span>
                  {command.hint ? (
                    <span className="truncate font-mono text-xs text-muted">{command.hint}</span>
                  ) : (
                    <Icon name="arrow-right" size={15} className="flex-none opacity-60" />
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      <p role="status" className="min-h-0 border-t border-line px-4 py-2.5 text-xs text-muted">
        {notice || "↑↓ to move · Enter to run · Esc to close"}
      </p>
    </Dialog>
  );
}
