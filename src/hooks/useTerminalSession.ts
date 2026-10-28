"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { setSkin } from "@/lib/skin";
import { completeInput, runCommand } from "@/lib/terminal/run";
import { echoLine, TERMINAL_PROMPT } from "@/lib/terminal/transcript";
import type { TerminalContext, TerminalEffect, TerminalLine } from "@/lib/terminal/types";

type SessionOptions = {
  initialLines?: TerminalLine[];
  onExit?: () => void;
};

export type TerminalSession = {
  prompt: string;
  lines: TerminalLine[];
  input: string;
  setInput: (value: string) => void;
  submit: (command?: string) => void;
  recallHistory: (direction: -1 | 1) => void;
  complete: () => boolean;
  reset: (lines?: TerminalLine[]) => void;
};

export function useTerminalSession(
  context: TerminalContext,
  { initialLines = [], onExit }: SessionOptions = {},
): TerminalSession {
  const router = useRouter();
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const applyEffect = useCallback(
    (effect: TerminalEffect | undefined) => {
      if (!effect) return;
      if (effect.type === "clear") setLines([]);
      if (effect.type === "navigate") router.push(effect.href);
      if (effect.type === "theme") setSkin(effect.skin);
      if (effect.type === "exit") onExit?.();
    },
    [router, onExit],
  );

  const submit = useCallback(
    (command = input) => {
      const result = runCommand(command, context);
      setLines((current) => [...current, echoLine(command), ...result.lines]);
      if (command.trim()) setHistory((current) => [...current, command.trim()]);
      setHistoryIndex(null);
      setInput("");
      applyEffect(result.effect);
    },
    [input, context, applyEffect],
  );

  const recallHistory = useCallback(
    (direction: -1 | 1) => {
      if (history.length === 0) return;
      const start = historyIndex ?? history.length;
      const next = Math.min(history.length, Math.max(0, start + direction));
      setHistoryIndex(next === history.length ? null : next);
      setInput(history[next] ?? "");
    },
    [history, historyIndex],
  );

  const complete = useCallback(() => {
    const completed = completeInput(input);
    if (completed) setInput(completed);
    return completed !== null;
  }, [input]);

  const reset = useCallback((next: TerminalLine[] = []) => {
    setLines(next);
    setInput("");
  }, []);

  return {
    prompt: TERMINAL_PROMPT,
    lines,
    input,
    setInput,
    submit,
    recallHistory,
    complete,
    reset,
  };
}
