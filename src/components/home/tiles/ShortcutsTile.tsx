"use client";

import { Button } from "@/components/ui/Button";
import { Tile } from "@/components/ui/Tile";
import { cn } from "@/lib/cn";
import { requestTerminal } from "@/lib/overlay-events";

import { TileHead } from "./TileHead";

const SHORTCUTS = [
  { keys: "⌘ K", label: "Command menu" },
  { keys: "/", label: "Command menu" },
  { keys: "`", label: "Terminal" },
];

export function ShortcutsTile({ className }: { className?: string }) {
  return (
    <Tile className={cn("flex flex-col gap-5", className)}>
      <TileHead eyebrow="Shortcuts" title="Keyboard first" />
      <dl className="flex flex-col gap-2">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys} className="flex items-center justify-between gap-4">
            <dt>
              <kbd className="label-mono inline-grid min-w-10 place-items-center rounded-chip border border-line-2 bg-surface-2 px-2 py-1 text-fg">
                {shortcut.keys}
              </kbd>
            </dt>
            <dd className="text-muted">{shortcut.label}</dd>
          </div>
        ))}
      </dl>
      <Button variant="line" size="sm" onClick={requestTerminal} className="mt-auto self-start">
        Open terminal
      </Button>
    </Tile>
  );
}
