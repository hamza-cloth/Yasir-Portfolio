"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type Ref } from "react";

import type { TerminalSession } from "@/hooks/useTerminalSession";
import { cn } from "@/lib/cn";
import type { TerminalLineKind } from "@/lib/terminal/types";

const LINE_TONES: Record<TerminalLineKind, string> = {
  input: "text-fg",
  output: "text-muted",
  accent: "text-c1-text",
  error: "text-red",
};

type TerminalShellProps = {
  session: TerminalSession;
  title: string;
  inputRef?: Ref<HTMLInputElement>;
  // Off while a demo is playing, so screen readers are not flooded with scripted output.
  announce?: boolean;
  onInputFocus?: () => void;
  className?: string;
};

export function TerminalShell({
  session,
  title,
  inputRef,
  announce = true,
  onInputFocus,
  className,
}: TerminalShellProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [session.lines.length]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      session.recallHistory(event.key === "ArrowUp" ? -1 : 1);
    }
    // Tab completes only when there is something typed, so keyboard users can still Tab away.
    if (event.key === "Tab" && !event.shiftKey && session.input.trim() && session.complete()) {
      event.preventDefault();
    }
  }

  return (
    <div className={cn("glass flex min-w-0 flex-col overflow-hidden rounded-card", className)}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-red/70" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-amber/70" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-ok/70" />
        <p className="label-mono ml-2 truncate text-muted">{title}</p>
      </div>
      <div
        ref={outputRef}
        role="log"
        aria-live={announce ? "polite" : "off"}
        aria-label="Terminal output"
        data-lenis-prevent
        className="h-[300px] overflow-auto overscroll-contain px-4 py-3 font-mono text-[0.8rem] leading-6"
      >
        {session.lines.map((line, index) => (
          <p key={index} className={cn("w-max min-w-full whitespace-pre", LINE_TONES[line.kind])}>
            {line.text || " "}
          </p>
        ))}
      </div>
      <form
        className="flex items-center gap-2 border-t border-line px-4 py-2 font-mono text-[0.8rem]"
        onSubmit={(event) => {
          event.preventDefault();
          session.submit();
        }}
      >
        <label htmlFor={inputId} className="flex-none text-c1-text">
          <span aria-hidden="true">{session.prompt}</span>
          <span className="sr-only">Terminal command</span>
        </label>
        <input
          ref={inputRef}
          id={inputId}
          value={session.input}
          onChange={(event) => session.setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onInputFocus}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-h-11 min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted"
          placeholder="type help"
        />
      </form>
    </div>
  );
}
