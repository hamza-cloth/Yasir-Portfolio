import { runCommand } from "./run";
import type { TerminalContext, TerminalLine } from "./types";

export const TERMINAL_PROMPT = "yasir@r1:~$";

export const DEMO_COMMANDS = ["whoami", "show ip int brief", "ping 8.8.8.8", "projects"];

export function echoLine(command: string): TerminalLine {
  return { kind: "input", text: `${TERMINAL_PROMPT} ${command}` };
}

// The same lines the live console prints while it plays the demo.
export function buildTranscript(commands: string[], context: TerminalContext): TerminalLine[] {
  return commands.flatMap((command) => [echoLine(command), ...runCommand(command, context).lines]);
}
