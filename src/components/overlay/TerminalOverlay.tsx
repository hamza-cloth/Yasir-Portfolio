"use client";

import { TerminalShell } from "@/components/terminal/TerminalShell";
import { useTerminalSession } from "@/hooks/useTerminalSession";
import type { TerminalContext } from "@/lib/terminal/types";

import { Dialog } from "./Dialog";

type TerminalOverlayProps = {
  open: boolean;
  onClose: () => void;
  context: TerminalContext;
};

const WELCOME = [
  { kind: "accent" as const, text: "R1 · simulated Cisco IOS shell. No packets leave this page." },
  { kind: "output" as const, text: "Type help to see what it can do, or exit to close." },
];

function TerminalBody({ context, onClose }: Omit<TerminalOverlayProps, "open">) {
  const session = useTerminalSession(context, { initialLines: WELCOME, onExit: onClose });
  return (
    <TerminalShell
      session={session}
      title="yasir@r1 · terminal"
      className="rounded-none border-0"
    />
  );
}

export function TerminalOverlay({ open, onClose, context }: TerminalOverlayProps) {
  return (
    <Dialog open={open} onClose={onClose} label="Terminal" panelClassName="max-w-2xl">
      <TerminalBody context={context} onClose={onClose} />
    </Dialog>
  );
}
