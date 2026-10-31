"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { OPEN_COMMAND_MENU_EVENT, OPEN_TERMINAL_EVENT } from "@/lib/overlay-events";
import type { TerminalContext } from "@/lib/terminal/types";

// Neither overlay ships in the first page load; each loads the first time it is opened.
const CommandMenu = dynamic(() => import("./CommandMenu").then((module) => module.CommandMenu), {
  ssr: false,
});
const TerminalOverlay = dynamic(
  () => import("./TerminalOverlay").then((module) => module.TerminalOverlay),
  { ssr: false },
);

type OpenOverlay = "command" | "terminal" | null;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

type OverlayHostProps = {
  email: string;
  terminalContext: TerminalContext;
};

// Owns the command menu and terminal: opens them from buttons (custom events) and shortcuts.
export function OverlayHost({ email, terminalContext }: OverlayHostProps) {
  const [open, setOpen] = useState<OpenOverlay>(null);
  const [loaded, setLoaded] = useState<{ command: boolean; terminal: boolean }>({
    command: false,
    terminal: false,
  });

  const show = useCallback((overlay: Exclude<OpenOverlay, null>) => {
    setLoaded((current) => ({ ...current, [overlay]: true }));
    setOpen(overlay);
  }, []);
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const openCommand = () => show("command");
    const openTerminal = () => show("terminal");

    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open === "command") close();
        else show("command");
        return;
      }
      if (open || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      if (event.key === "/") {
        event.preventDefault();
        show("command");
      } else if (event.key === "`") {
        event.preventDefault();
        show("terminal");
      }
    }

    window.addEventListener(OPEN_COMMAND_MENU_EVENT, openCommand);
    window.addEventListener(OPEN_TERMINAL_EVENT, openTerminal);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener(OPEN_COMMAND_MENU_EVENT, openCommand);
      window.removeEventListener(OPEN_TERMINAL_EVENT, openTerminal);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, show, close]);

  return (
    <>
      {loaded.command ? (
        <CommandMenu open={open === "command"} onClose={close} email={email} />
      ) : null}
      {loaded.terminal ? (
        <TerminalOverlay open={open === "terminal"} onClose={close} context={terminalContext} />
      ) : null}
    </>
  );
}
