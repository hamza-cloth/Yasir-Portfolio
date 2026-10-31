"use client";

import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import { requestTerminal } from "@/lib/overlay-events";

import { TileHead } from "./TileHead";

const SHORTCUTS = [
  { keys: "⌘ K", label: "Command menu" },
  { keys: "`", label: "Terminal" },
];

// The terminal and command menu, one key away.
export function ShortcutsTile({ className }: { className?: string }) {
  return (
    <Tile className={cn("flex flex-col gap-5 text-fg", className)}>
      <TileHead eyebrow="Shortcuts" title="Keyboard first" />
      <dl className="flex flex-col gap-2.5">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys} className="flex items-center justify-between gap-4">
            <dt>
              <kbd className="label-mono inline-grid min-w-10 place-items-center rounded-lg border border-line-2 bg-surface-2 px-2 py-1 text-fg shadow-[0_2px_0_var(--line-2)]">
                {shortcut.keys}
              </kbd>
            </dt>
            <dd className="text-sm text-muted">{shortcut.label}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={requestTerminal}
        className="btn-accent mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-(--r-button) px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
      >
        <span aria-hidden="true" className="font-mono">
          &gt;_
        </span>
        Open terminal
      </button>
    </Tile>
  );
}
