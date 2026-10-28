"use client";

import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import { requestTerminal } from "@/lib/overlay-events";

import { TileHead } from "./TileHead";

const SHORTCUTS = [
  { keys: "⌘ K", label: "Command menu" },
  { keys: "`", label: "Terminal" },
];

// The one dark card on the page, in every skin.
export function ShortcutsTile({ className }: { className?: string }) {
  return (
    <Tile
      className={cn("flex flex-col gap-5 border-transparent bg-[#0e1220] text-white", className)}
    >
      <TileHead eyebrow="Shortcuts" title="Keyboard first" inverse />
      <dl className="flex flex-col gap-2.5">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys} className="flex items-center justify-between gap-4">
            <dt>
              <kbd className="label-mono inline-grid min-w-10 place-items-center rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-white">
                {shortcut.keys}
              </kbd>
            </dt>
            <dd className="text-sm text-white/70">{shortcut.label}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={requestTerminal}
        className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-pill bg-white px-4 text-sm font-semibold text-[#0e1220] transition-transform hover:-translate-y-0.5"
      >
        <span aria-hidden="true" className="font-mono">
          &gt;_
        </span>
        Open terminal
      </button>
    </Tile>
  );
}
