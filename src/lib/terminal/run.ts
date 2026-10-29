import { COMMANDS, PAGE_NAMES, THEME_NAMES } from "./commands";
import type { TerminalCommand, TerminalContext, TerminalResult } from "./types";

export function normalizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

function commandNames(command: TerminalCommand): string[] {
  return [command.name, ...(command.aliases ?? [])];
}

// Multi-word commands such as "show ip int brief" win over shorter matches.
export function findCommand(input: string): { command: TerminalCommand; args: string[] } | null {
  const normalized = normalizeInput(input);
  const lower = normalized.toLowerCase();
  let best: { command: TerminalCommand; length: number } | null = null;

  for (const command of COMMANDS) {
    for (const name of commandNames(command)) {
      const matches = lower === name || lower.startsWith(`${name} `);
      if (matches && (!best || name.length > best.length)) best = { command, length: name.length };
    }
  }

  if (!best) return null;
  const rest = normalized.slice(best.length).trim();
  return { command: best.command, args: rest ? rest.split(" ") : [] };
}

export function runCommand(input: string, context: TerminalContext): TerminalResult {
  const normalized = normalizeInput(input);
  if (!normalized) return { lines: [] };

  const match = findCommand(normalized);
  if (!match) {
    return {
      lines: [
        { kind: "error", text: `% Invalid input detected: ${normalized}` },
        { kind: "output", text: "Type help to see what this terminal understands." },
      ],
    };
  }
  return match.command.run(match.args, context);
}

const ARGUMENTS: Record<string, readonly string[]> = {
  cd: PAGE_NAMES,
  theme: THEME_NAMES,
};

// Returns the completed input, or null when there is nothing unambiguous to complete.
export function completeInput(input: string): string | null {
  const lower = input.toLowerCase().replace(/^\s+/, "");
  if (!lower) return null;

  const [first, ...rest] = lower.split(" ");
  const argumentOptions = first ? ARGUMENTS[first] : undefined;
  if (argumentOptions && rest.length === 1) {
    const matches = argumentOptions.filter((option) => option.startsWith(rest[0] ?? ""));
    return matches.length === 1 ? `${first} ${matches[0]}` : null;
  }

  const names = COMMANDS.map((command) => command.name).filter((name) => name.startsWith(lower));
  if (names.length !== 1 || names[0] === lower) return null;
  return names[0] ?? null;
}
